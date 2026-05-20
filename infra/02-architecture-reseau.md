# Architecture réseau — Ymmo

## Description de l'architecture

L'infrastructure Ymmo repose sur une architecture **hub-and-spoke** :
- Le **siège** (Aix-en-Provence) est le hub central — il héberge tous les services partagés (AD, DNS, DHCP, applications web)
- Les **12 agences** sont les spokes — elles se connectent au siège via des tunnels VPN IPSec/IKEv2 individuels
- Tout le trafic inter-agences transite obligatoirement par le siège (pas de liaison directe agence-agence)

---

## Composants réseau siège

### pfSense — Pare-feu périmètre

| Interface | IP | Rôle |
|---|---|---|
| WAN | IP publique ISP | Connexion Internet + terminaison VPN |
| LAN | `192.168.1.254` | Passerelle VLAN 10 (postes) |
| OPT1 (Serveurs) | `192.168.1.253` | Passerelle VLAN 20 (serveurs) |
| OPT2 (DMZ) | `192.168.2.254` | Passerelle DMZ |

pfSense gère :
- Le filtrage entrant/sortant (règles décrites dans `03-politique-securite.md`)
- La terminaison des tunnels VPN IPSec/IKEv2 vers les 12 agences
- Le NAT (Network Address Translation) pour la sortie Internet
- Le routage inter-VLAN

### Switch manageable siège

- **Modèle recommandé :** Cisco Catalyst 2960X-24TS-L (ou équivalent)
- **VLANs configurés :**
  - VLAN 10 — Postes utilisateurs
  - VLAN 20 — Serveurs
  - VLAN 30 — DMZ
- Les ports sont tagués 802.1Q vers pfSense (trunk) et untagués vers les équipements finaux (access)

### Serveurs siège

| Serveur | IP | Services |
|---|---|---|
| SRV-AD-01 | `192.168.1.100` | AD DS, DNS, DHCP |
| SRV-WEB-01 | `192.168.1.101` | Docker (Ymmo app + PostgreSQL) |
| SRV-BAK-01 | `192.168.1.102` | Veeam, Zabbix |

---

## Composants réseau agence (modèle identique x12)

Chaque agence dispose de :
- **1 routeur/pare-feu** (pfSense ou Cisco ISR) : gère le VPN IPSec vers le siège + NAT local
- **1 switch** (non manageable suffisant, 8 ports) : relie les 5 postes et l'imprimante
- **5 postes Windows** : joints au domaine `ymmo.local` via le VPN
- **1 imprimante** réseau

Le routeur agence obtient une IP publique de l'ISP local et établit un tunnel IPSec/IKEv2 permanent vers pfSense siège.

---

## Flux réseau autorisés (règles principales)

| Source | Destination | Port/Protocole | Autorisé | Justification |
|---|---|---|---|---|
| Postes siège | SRV-AD-01 | TCP 389/636 (LDAP/LDAPS) | ✅ | Authentification AD |
| Postes siège | SRV-WEB-01 | TCP 80/443 | ✅ | Accès application Ymmo |
| Postes siège | Internet | TCP 80/443 | ✅ | Navigation web |
| Agences | Siège (via VPN) | Tout | ✅ | Tunnel IPSec chiffré |
| Agences | SRV-AD-01 | TCP 389, UDP 53 | ✅ | AD + DNS via VPN |
| Internet | DMZ | TCP 443 | ✅ | Accès externe Ymmo |
| Internet | LAN siège | Tout | ❌ | Bloqué par pfSense |
| Agence X | Agence Y | Tout | ❌ | Pas de liaison directe inter-agences |

---

## Instructions Miro — Réalisation du schéma réseau

### Préparation

1. Créer un compte sur [miro.com](https://miro.com) (gratuit)
2. Nouveau board → "Blank board"
3. Renommer le board : **"Ymmo — Architecture réseau"**
4. Activer la grille : View → Show grid

### Structure du schéma (de haut en bas)

**Zone 1 — Internet (en haut, fond bleu clair)**
- Forme : rectangle arrondi ou nuage (shapes → search "cloud")
- Texte : `INTERNET`
- Couleur de fond : `#E3F2FD`

**Zone 2 — Siège Aix-en-Provence (fond blanc, encadré)**
Sous-éléments (de gauche à droite) :

- Rectangle rouge : `pfSense\nPare-feu périmètre\nWAN: IP publique\nLAN: 192.168.1.254`
- En dessous, 3 rectangles pour les VLANs :
  - Bleu foncé : `VLAN 20 — Serveurs\n192.168.1.100-102`
  - Bleu clair : `VLAN 10 — Postes\n192.168.1.1-50\n(30 utilisateurs)`
  - Orange : `DMZ\n192.168.2.0/24`
- Dans VLAN 20, 3 petits rectangles empilés :
  - `SRV-AD-01\n192.168.1.100\nAD+DNS+DHCP`
  - `SRV-WEB-01\n192.168.1.101\nYmmo + PostgreSQL`
  - `SRV-BAK-01\n192.168.1.102\nVeeam + Zabbix`

**Zone 3 — VPN IPSec (au centre, fond jaune clair)**
- Grand rectangle jaune : `VPN IPSec/IKEv2\n12 tunnels chiffrés AES-256`
- Flèches doubles avec label `IPSec/IKEv2` depuis pfSense vers chaque agence

**Zone 4 — Agences (en bas, disposées en grille 4x3)**
- 12 rectangles verts identiques avec template :
  ```
  AGENCE XX — [Ville]
  LAN: 192.168.XX.0/24
  GW: 192.168.XX.254
  5 postes + 1 imprimante
  ```
- Dans chaque agence : icône routeur + icône switch + 5 icônes PC

### Légende (coin bas-droite)

| Couleur | Signification |
|---|---|
| Rouge | Sécurité / Pare-feu |
| Bleu foncé | Serveurs |
| Bleu clair | Postes utilisateurs |
| Orange | DMZ |
| Vert | Agences |
| Jaune | VPN / Tunnels |

### Connexions (flèches dans Miro)

- **Internet → pfSense** : flèche bidirectionnelle, label `WAN / Internet`, couleur grise
- **pfSense → VLAN 10** : flèche, label `802.1Q VLAN 10`, couleur bleue claire
- **pfSense → VLAN 20** : flèche, label `802.1Q VLAN 20`, couleur bleue foncée
- **pfSense → DMZ** : flèche, label `DMZ`, couleur orange
- **pfSense → Agences** : 12 flèches bidirectionnelles, label `IPSec/IKEv2 AES-256`, couleur jaune
- **VLAN 20 ↔ SRV-AD-01** : flèche interne

### Export final

Exporter en **PNG haute résolution** (File → Export → PNG → High resolution) pour la documentation PDF.

---

## Instructions Cisco Packet Tracer — Simulation réseau

### Topologie à créer

```
[PC-Siège] --- [Switch-Siège] --- [Router-Siège (Cisco 2911)]
                                          |
                                    [Internet (Cloud)]
                                          |
                              [Router-Agence1 (Cisco 2911)]
                                          |
                              [Switch-Agence1] --- [PC-Agence1]
```

### Équipements à placer

| Équipement | Modèle Packet Tracer | Hostname | Interface |
|---|---|---|---|
| Routeur siège | Cisco 2911 | R-SIEGE | Gi0/0 (WAN), Gi0/1 (LAN) |
| Routeur agence 1 | Cisco 2911 | R-AGC01 | Gi0/0 (WAN), Gi0/1 (LAN) |
| Switch siège | Cisco 2960 | SW-SIEGE | — |
| Switch agence | Cisco 2960 | SW-AGC01 | — |
| PC siège | Generic PC | PC-SIEGE | — |
| PC agence | Generic PC | PC-AGC01 | — |

### Configuration R-SIEGE

```cisco
hostname R-SIEGE
!
interface GigabitEthernet0/0
 ip address 203.0.113.1 255.255.255.252
 no shutdown
!
interface GigabitEthernet0/1
 ip address 192.168.1.254 255.255.255.0
 no shutdown
!
ip route 192.168.10.0 255.255.255.0 203.0.113.2
!
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
 lifetime 86400
!
crypto isakmp key Ymmo@VPN2025! address 203.0.113.2
!
crypto ipsec transform-set YMMO-TS esp-aes 256 esp-sha256-hmac
 mode tunnel
!
crypto map YMMO-VPN 10 ipsec-isakmp
 set peer 203.0.113.2
 set transform-set YMMO-TS
 match address VPN-AGC01
!
interface GigabitEthernet0/0
 crypto map YMMO-VPN
!
ip access-list extended VPN-AGC01
 permit ip 192.168.1.0 0.0.0.255 192.168.10.0 0.0.0.255
```

### Configuration R-AGC01

```cisco
hostname R-AGC01
!
interface GigabitEthernet0/0
 ip address 203.0.113.2 255.255.255.252
 no shutdown
!
interface GigabitEthernet0/1
 ip address 192.168.10.254 255.255.255.0
 no shutdown
!
ip route 192.168.1.0 255.255.255.0 203.0.113.1
!
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
 lifetime 86400
!
crypto isakmp key Ymmo@VPN2025! address 203.0.113.1
!
crypto ipsec transform-set YMMO-TS esp-aes 256 esp-sha256-hmac
 mode tunnel
!
crypto map YMMO-VPN 10 ipsec-isakmp
 set peer 203.0.113.1
 set transform-set YMMO-TS
 match address VPN-SIEGE
!
interface GigabitEthernet0/0
 crypto map YMMO-VPN
!
ip access-list extended VPN-SIEGE
 permit ip 192.168.10.0 0.0.0.255 192.168.1.0 0.0.0.255
```

### Test de validation

Depuis PC-AGC01, faire un ping vers `192.168.1.100` (SRV-AD-01 siège).
Le tunnel IPSec doit s'établir automatiquement. Dans Packet Tracer, passer en mode **Simulation** pour visualiser les paquets chiffrés traversant le tunnel.
