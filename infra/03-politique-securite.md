# Politique de sécurité réseau — Ymmo

## Principes directeurs

1. **Principe du moindre privilège** : chaque utilisateur et service n'a accès qu'aux ressources strictement nécessaires à son activité
2. **Défense en profondeur** : plusieurs couches de sécurité (périmètre, réseau interne, poste de travail)
3. **Segmentation réseau** : isolation des flux par VLAN et zones (LAN, DMZ, WAN)
4. **Chiffrement des communications** : tout trafic inter-sites chiffré (VPN IPSec AES-256)
5. **Traçabilité** : journalisation de tous les accès et événements de sécurité

---

## 1. Pare-feu périmètre (pfSense) — Règles de filtrage

### Interface WAN (Internet → Siège)

| Règle | Source | Destination | Port | Action | Justification |
|---|---|---|---|---|---|
| 1 | Any | IP publique WAN | UDP 500, 4500 | AUTORISER | IKE/IKEv2 pour les tunnels VPN agences |
| 2 | Any | IP publique WAN | IP Proto 50 | AUTORISER | ESP (paquets IPSec chiffrés) |
| 3 | Any | `192.168.2.10` (DMZ web) | TCP 443 | AUTORISER | HTTPS accès externe Ymmo |
| 4 | Any | LAN interne | Tout | BLOQUER | Isolation complète LAN |
| 5 | Any | Any | Tout | BLOQUER | Règle de refus par défaut |

### Interface LAN — VLAN 10 Postes (Postes → Réseau)

| Règle | Source | Destination | Port | Action | Justification |
|---|---|---|---|---|---|
| 1 | VLAN 10 | `192.168.1.100` (AD) | TCP 389, 636, 88, 445 | AUTORISER | LDAP, Kerberos, SMB pour AD |
| 2 | VLAN 10 | `192.168.1.100` (DNS) | UDP/TCP 53 | AUTORISER | Résolution DNS |
| 3 | VLAN 10 | `192.168.1.101` (Web) | TCP 80, 443 | AUTORISER | Application Ymmo |
| 4 | VLAN 10 | Internet | TCP 80, 443 | AUTORISER | Navigation web |
| 5 | VLAN 10 | `192.168.1.102` | Tout | BLOQUER | Pas d'accès direct au serveur de backup |
| 6 | VLAN 10 | VLAN 20 (non listé) | Tout | BLOQUER | Isolation VLAN |
| 7 | VLAN 10 | Any | Tout | BLOQUER | Refus par défaut |

### Interface VLAN 20 — Serveurs

| Règle | Source | Destination | Port | Action | Justification |
|---|---|---|---|---|---|
| 1 | `192.168.1.100` | VLAN 10 | TCP 137-139, 445 | AUTORISER | Partage fichiers AD |
| 2 | `192.168.1.102` | `192.168.1.100-101` | TCP 10051 | AUTORISER | Zabbix agent |
| 3 | `192.168.1.100-102` | Internet | TCP 80, 443 | AUTORISER | Mises à jour |
| 4 | VLAN 20 | Any | Tout | BLOQUER | Refus par défaut |

### Interface DMZ

| Règle | Source | Destination | Port | Action | Justification |
|---|---|---|---|---|---|
| 1 | `192.168.2.10` | `192.168.1.101` | TCP 5432 | AUTORISER | DMZ → BDD interne si architecture séparée |
| 2 | DMZ | LAN interne | Tout | BLOQUER | La DMZ ne peut pas initier vers le LAN |
| 3 | DMZ | Internet | TCP 80, 443 | AUTORISER | Mises à jour |

---

## 2. Politique VPN IPSec/IKEv2

### Paramètres IKE Phase 1 (ISAKMP)

| Paramètre | Valeur | Justification |
|---|---|---|
| Algorithme de chiffrement | AES-256 | Standard ANSSI, résistant post-quantique à court terme |
| Hash/Intégrité | SHA-256 | Collision-resistant |
| Groupe Diffie-Hellman | Group 14 (2048 bits) | Recommandation ANSSI minimum |
| Durée de vie SA | 86400 secondes (24h) | Renouvellement quotidien des clés |
| Authentification | Pre-Shared Key (PSK) | Simple pour 12 sites, certificats conseillés en prod |

### Paramètres IKE Phase 2 (IPSec)

| Paramètre | Valeur |
|---|---|
| Transform set | `esp-aes 256 esp-sha256-hmac` |
| Mode | Tunnel (encapsulation complète du paquet IP) |
| Durée de vie SA | 3600 secondes (1h) |
| PFS (Perfect Forward Secrecy) | Activé, Group 14 |

### Clé PSK

La clé PSK doit respecter les règles suivantes :
- Minimum 20 caractères
- Mélange majuscules, minuscules, chiffres, caractères spéciaux
- Différente par tunnel (une PSK par agence)
- Exemple de format : `Ymmo-AGC01@VPN-2025!` (à changer en production)
- Stockée dans un gestionnaire de mots de passe (Bitwarden, KeePass)

---

## 3. Politique Windows Defender Firewall (postes et serveurs)

### Règles entrantes à activer sur SRV-AD-01

| Service | Port | Protocole | Action |
|---|---|---|---|
| Active Directory | 389 | TCP/UDP | AUTORISER depuis réseau interne |
| Active Directory SSL | 636 | TCP | AUTORISER depuis réseau interne |
| Kerberos | 88 | TCP/UDP | AUTORISER depuis réseau interne |
| DNS | 53 | TCP/UDP | AUTORISER depuis réseau interne + agences (via VPN) |
| DHCP | 67-68 | UDP | AUTORISER depuis réseau interne |
| SMB | 445 | TCP | AUTORISER depuis réseau interne |
| RPC (AD replication) | 135, 49152-65535 | TCP | AUTORISER depuis réseau interne |
| Zabbix agent | 10050 | TCP | AUTORISER depuis `192.168.1.102` uniquement |
| RDP (admin) | 3389 | TCP | AUTORISER depuis `192.168.1.0/24` uniquement |

### Règles entrantes à BLOQUER explicitement (tous serveurs)

- Tout trafic depuis les agences vers les serveurs **sauf** DNS (UDP 53) et AD (TCP 389, 636, 88)
- Tout accès RDP depuis Internet
- Ping (ICMP) depuis Internet

---

## 4. Stratégies de groupe (GPO) — Politique de sécurité postes

### GPO : `YMMO-Security-Baseline` (appliquée à tous les postes du domaine)

| Paramètre | Valeur | Chemin GPO |
|---|---|---|
| Durée de vie mot de passe | 90 jours | Computer Config > Windows Settings > Security Settings > Account Policies |
| Longueur minimale mot de passe | 12 caractères | Idem |
| Complexité mot de passe | Activée (maj + min + chiffre + spécial) | Idem |
| Verrouillage compte | 5 tentatives échouées, verrouillage 15 min | Idem |
| Écran de veille avec mot de passe | 10 min inactivité | User Config > Admin Templates > Control Panel > Personalization |
| Désactivation USB | Activée | Computer Config > Admin Templates > System > Removable Storage |
| Windows Update | Automatique, redémarrage hors heures ouvrées | Computer Config > Admin Templates > Windows Components > WU |
| Pare-feu Windows | Activé, profil Domaine | Computer Config > Windows Settings > Security Settings > Windows Firewall |
| BitLocker | Activé sur lecteur système | Computer Config > Admin Templates > Windows Components > BitLocker |
| Audit des connexions | Succès + Échecs | Computer Config > Windows Settings > Security Settings > Local Policies > Audit |

### GPO : `YMMO-Restrict-Agents` (appliquée à l'OU Commerciaux)

| Paramètre | Valeur |
|---|---|
| Accès Panneau de configuration | Désactivé |
| Installation de logiciels | Désactivée (non-admins) |
| Accès invite de commandes | Désactivé |
| Lecteurs réseau mappés | `\\SRV-AD-01\Partages\Agences` → lecteur `Z:` |

---

## 5. Politique de mots de passe

| Type de compte | Longueur min | Complexité | Expiration | Verrouillage |
|---|---|---|---|---|
| Comptes utilisateurs (commerciaux) | 12 caractères | Oui | 90 jours | 5 tentatives / 15 min |
| Comptes administrateurs | 16 caractères | Oui | 60 jours | 3 tentatives / 30 min |
| Comptes de service | 20 caractères | Oui | Jamais (géré manuellement) | Non verrouillé |
| Clés PSK VPN | 20 caractères | Oui | 1 an | N/A |

---

## 6. Journalisation et audit

### Événements à journaliser (tous serveurs)

| Catégorie | Événements |
|---|---|
| Connexions | Succès et échecs (Event ID 4624, 4625) |
| Gestion de comptes | Création, modification, suppression (4720, 4722, 4740) |
| Changements de politique | Toute modification GPO (4739) |
| Accès aux objets | Accès aux partages réseau (5140) |
| Démarrage/arrêt système | 4608, 6005, 6006 |

### Rétention des journaux

| Source | Durée de rétention | Outil |
|---|---|---|
| Windows Event Logs | 90 jours | Event Viewer + Zabbix |
| Journaux pfSense | 30 jours | Syslog vers SRV-BAK-01 |
| Journaux VPN | 90 jours | pfSense + export Syslog |
