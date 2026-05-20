# Guide de déploiement — Ymmo Infrastructure

## Vue d'ensemble

Ce guide décrit l'ordre exact de déploiement de l'infrastructure Ymmo pour une mise en production complète. Chaque étape référence les documents de configuration correspondants.

**Durée totale estimée :** 2 à 3 jours (hors câblage physique)

---

## Phase 0 — Prérequis (J-7)

### Matériel à commander/préparer

Vérifier que le matériel listé dans `09-liste-materiel-budget.md` est disponible et livré avant de démarrer.

### Logiciels à télécharger

| Logiciel | Version | Source |
|---|---|---|
| Windows Server 2022 Datacenter | Evaluation 180j ou licence | microsoft.com/evalcenter |
| Ubuntu Server 24.04 LTS | LTS | ubuntu.com/download/server |
| pfSense | 2.7.x | pfsense.org/download |
| Veeam Backup & Replication Community | Latest | veeam.com |
| Zabbix | 7.0 LTS | zabbix.com/download |
| VirtualBox | 7.x | virtualbox.org (pour démo) |
| Cisco Packet Tracer | 8.x | netacad.com |

### Informations à collecter

- [ ] IP publique fournie par l'ISP siège
- [ ] IP publiques fournies par les ISP de chaque agence (x12)
- [ ] Identifiants des box/routeurs existants en agence
- [ ] Liste nominative des utilisateurs (nom, prénom, agence, poste)

---

## Phase 1 — Infrastructure siège (Jour 1)

### Étape 1.1 — Installation physique

```
[ ] Rack serveur installé et câblé
[ ] SRV-AD-01 : câble réseau branché sur port VLAN 20 du switch
[ ] SRV-WEB-01 : câble réseau branché sur port VLAN 20 du switch
[ ] SRV-BAK-01 : câble réseau branché sur port VLAN 20 du switch
[ ] pfSense : port WAN branché sur box ISP, port LAN branché sur switch
[ ] Switch manageable : configuration VLAN (voir 02-architecture-reseau.md)
```

### Étape 1.2 — Configuration pfSense

1. Installer pfSense sur le pare-feu depuis l'ISO
2. Configurer les interfaces : WAN (IP ISP), LAN (192.168.1.254), OPT1 (192.168.1.253), DMZ (192.168.2.254)
3. Configurer les règles de pare-feu (voir `03-politique-securite.md` — section pfSense)
4. Configurer le NAT pour la sortie Internet du LAN
5. Activer SNMP (pour supervision Zabbix)

### Étape 1.3 — Configuration switch manageable

```
VLANs à créer :
- VLAN 10 : Postes utilisateurs (ports 1-20 en access)
- VLAN 20 : Serveurs (ports 21-24 en access)
- VLAN 99 : Management (port 24 trunk vers pfSense)
Configurer un port trunk (tagged) vers pfSense sur l'interface LAN
```

### Étape 1.4 — Installation SRV-AD-01

Suivre intégralement `05-guide-configuration-serveurs.md` — sections :
- Étape 1 : Installation Windows Server 2022
- Étape 2 : Configuration IP fixe (192.168.1.100)
- Étape 3 : Installation AD DS + création forêt ymmo.local
- Étape 4 : Configuration DNS
- Étape 5 : Configuration DHCP
- Étape 6 : Création OUs et groupes
- Étape 7 : Création GPOs

**Validation :** `dcdiag /test:all` doit retourner 0 erreurs

### Étape 1.5 — Installation SRV-WEB-01

Suivre `05-guide-configuration-serveurs.md` — section "VM SRV-WEB-01" :
- Installer Ubuntu Server 24.04
- Configurer IP fixe (192.168.1.101)
- Installer Docker + Docker Compose
- Cloner le dépôt Ymmo et démarrer avec `docker compose up -d`

**Validation :** `http://192.168.1.101` doit afficher l'interface Ymmo

---

## Phase 2 — VPN et connexion agences (Jour 1-2)

### Étape 2.1 — Configuration VPN siège (pfSense)

Dans l'interface web pfSense (https://192.168.1.254) :

1. `VPN` → `IPsec` → `Tunnels` → `Add P1`
2. Pour chaque agence (répéter x12) :

```
Phase 1 :
  Remote gateway : <IP publique agence XX>
  Authentication : Mutual PSK
  Pre-Shared Key : Ymmo-AGCXX@VPN-2025!
  Encryption : AES 256 bits
  Hash : SHA256
  DH group : 14 (2048 bits)

Phase 2 :
  Local network : 192.168.1.0/24
  Remote network : 192.168.XX.0/24
  Protocol : ESP
  Encryption : AES 256 bits
  Hash : SHA256
  PFS : Group 14
```

3. `Firewall` → `Rules` → `IPsec` : autoriser le trafic AD (voir `03-politique-securite.md`)

### Étape 2.2 — Configuration routeurs agences

Pour chaque agence, configurer le routeur local avec les paramètres VPN correspondants (voir `02-architecture-reseau.md` — section Cisco Packet Tracer pour les commandes équivalentes).

**Validation :** Depuis un poste agence, ping `192.168.1.100` doit répondre.

### Étape 2.3 — Jonction au domaine depuis les agences

Sur chaque poste des agences :
1. Configurer l'IP (plage DHCP agence XX)
2. DNS primaire : 192.168.1.100 (via VPN)
3. Joindre le domaine `ymmo.local`
4. Redémarrer et se connecter avec le compte AD correspondant

---

## Phase 3 — Sauvegarde et supervision (Jour 2)

### Étape 3.1 — Installation SRV-BAK-01

- Installer Ubuntu Server 24.04 (IP : 192.168.1.102)
- Installer Zabbix Server (voir `06-plan-sauvegarde-supervision.md`)
- Installer Veeam Backup & Replication Community Edition

### Étape 3.2 — Configuration Veeam

Suivre `06-plan-sauvegarde-supervision.md` — section Veeam :
- Ajouter les serveurs comme infrastructure de sauvegarde
- Créer les jobs de sauvegarde selon le planning
- Configurer la copie Azure Blob (via `07-proposition-cloud.md`)
- Effectuer un premier backup manuel et vérifier la restauration

### Étape 3.3 — Configuration Zabbix

Suivre `06-plan-sauvegarde-supervision.md` — section Zabbix :
- Installer les agents sur SRV-AD-01 et SRV-WEB-01
- Configurer SNMP sur pfSense
- Importer les templates (Windows Server, Linux, Cisco IOS)
- Configurer les alertes email (SMTP relay Microsoft 365 ou SMTP direct)
- Créer le dashboard "Vue Globale Ymmo"

---

## Phase 4 — Cloud Azure (Jour 3, optionnel pour démo)

### Étape 4.1 — Création du compte Azure

1. Créer un compte Azure sur [portal.azure.com](https://portal.azure.com)
2. Créer un Resource Group : `rg-ymmo-prod` (région : France Central)

### Étape 4.2 — Azure Blob Storage (backup offsite)

```bash
# Via Azure CLI
az login
az group create --name rg-ymmo-prod --location francecentral
az storage account create \
  --name stymmobackup \
  --resource-group rg-ymmo-prod \
  --location francecentral \
  --sku Standard_ZRS \
  --kind StorageV2 \
  --access-tier Cool

az storage container create \
  --name veeam-backups \
  --account-name stymmobackup
```

### Étape 4.3 — Azure Database for PostgreSQL

```bash
az postgres flexible-server create \
  --resource-group rg-ymmo-prod \
  --name psql-ymmo-prod \
  --location francecentral \
  --admin-user ymmo_admin \
  --admin-password "YmmoAzure@2025!" \
  --sku-name Standard_B2ms \
  --storage-size 32 \
  --version 16
```

### Étape 4.4 — Azure App Service (optionnel démo)

```bash
az appservice plan create \
  --name asp-ymmo \
  --resource-group rg-ymmo-prod \
  --sku B2 \
  --is-linux

az webapp create \
  --resource-group rg-ymmo-prod \
  --plan asp-ymmo \
  --name app-ymmo-prod \
  --deployment-container-image-name nginx:alpine
```

---

## Phase 5 — Recette et validation finale (Jour 3)

### Checklist de validation complète

#### Active Directory
- [ ] `dcdiag /test:all` — 0 erreurs
- [ ] Un utilisateur de chaque OU peut se connecter
- [ ] Les GPOs sont bien appliquées (`gpresult /r` sur un poste)
- [ ] Les partages réseau sont accessibles selon la matrice des droits

#### Réseau
- [ ] Ping entre siège et chaque agence fonctionne via VPN
- [ ] Résolution DNS fonctionne depuis les agences (`nslookup ymmo.local 192.168.1.100`)
- [ ] DHCP distribue les adresses sur les postes
- [ ] Accès Internet depuis les postes siège et agences

#### Application Ymmo
- [ ] Page d'accueil `http://192.168.1.101` accessible depuis le siège
- [ ] Page d'accueil accessible depuis les agences (via VPN)
- [ ] Connexion admin fonctionne
- [ ] Ajout d'un bien fonctionne
- [ ] Score /10 s'affiche

#### Sécurité
- [ ] Accès direct au LAN depuis Internet bloqué (test depuis une connexion 4G)
- [ ] Ports non autorisés bloqués par pfSense (scan Nmap depuis DMZ)
- [ ] Logs pfSense contiennent les événements de connexion

#### Sauvegarde
- [ ] Premier backup Veeam réussi sur SRV-AD-01
- [ ] Test de restauration d'un fichier réussi
- [ ] Backup copié vers Azure Blob vérifié

#### Supervision
- [ ] Zabbix reçoit les données de SRV-AD-01 et SRV-WEB-01
- [ ] Dashboard "Vue Globale" affiche tous les hôtes en vert
- [ ] Test d'alerte : arrêter le service DNS sur SRV-AD-01 → vérifier email d'alerte reçu
