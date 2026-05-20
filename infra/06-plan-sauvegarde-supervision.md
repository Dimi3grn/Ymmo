# Plan de sauvegarde et de supervision — Ymmo

---

## PARTIE 1 — SAUVEGARDE

### Outil retenu : Veeam Backup & Replication Community Edition

**Justification :** Standard de l'industrie pour la sauvegarde de VMs, gratuit jusqu'à 10 workloads, déduplication native, restore granulaire (fichier, objet AD, email), compatible VirtualBox et Hyper-V.

**Téléchargement :** [https://www.veeam.com/virtual-machine-backup-solution-free.html](https://www.veeam.com/virtual-machine-backup-solution-free.html)

---

### Stratégie de sauvegarde — Règle 3-2-1

| Règle | Description | Application Ymmo |
|---|---|---|
| **3** copies | 3 copies des données | 1 originale + 1 backup local + 1 backup externe |
| **2** supports différents | Sur 2 types de média différents | Disque local SRV-BAK-01 + Stockage Azure Blob |
| **1** copie hors site | Au moins 1 copie hors site | Azure Blob Storage (copie offsite automatique) |

---

### Planning de sauvegarde

| Job | Cible | Fréquence | Heure | Rétention | Type |
|---|---|---|---|---|---|
| `BACKUP-SRV-AD-01` | VM SRV-AD-01 complète | Quotidien | 02h00 | 30 jours | Incrémentiel après 1er full |
| `BACKUP-SRV-WEB-01` | VM SRV-WEB-01 + volumes Docker | Quotidien | 02h30 | 30 jours | Incrémentiel |
| `BACKUP-FULL-WEEKLY` | Toutes VMs siège | Hebdomadaire (dimanche) | 00h00 | 12 semaines | Full |
| `BACKUP-AD-OBJECTS` | Objets Active Directory | Quotidien | 03h00 | 90 jours | Veeam AD Explorer |
| `BACKUP-OFFSITE` | Copie vers Azure Blob | Hebdomadaire | 04h00 | 6 mois | Copy Job Veeam |

---

### Configuration Veeam — Procédure

#### Installation sur SRV-BAK-01

1. Télécharger le fichier ISO Veeam B&R Community Edition
2. Monter l'ISO et lancer `Setup.exe`
3. Sélectionner **Veeam Backup & Replication** + **Veeam Backup Catalog**
4. Configurer la base de données : PostgreSQL (inclus dans l'installation)
5. Port d'accès console : 9392

#### Ajout du serveur VirtualBox comme infrastructure

Dans la console Veeam :
1. `Backup Infrastructure` → `Managed Servers` → `Add Server` → `Microsoft Windows`
2. Entrer l'IP de la machine hôte VirtualBox
3. Fournir les credentials administrateur hôte

#### Création d'un job de sauvegarde (SRV-AD-01)

```
Home → Backup Job → Virtual machine → Nom : "BACKUP-SRV-AD-01"
→ Add Object → Sélectionner la VM SRV-AD-01
→ Storage → Repository : "Default Backup Repository" (D:\Backups\)
→ Schedule → Run the job automatically → Daily at 2:00 AM
→ Retention policy : 30 restore points
→ Advanced → Enable application-aware processing (Active Directory)
```

---

### Espace de stockage requis (calcul)

| VM | Taille estimée | Taux compression Veeam | Stockage backup quotidien | 30 jours |
|---|---|---|---|---|
| SRV-AD-01 | 40 Go | 50% | 2 Go/jour (incrémentiel) | ~100 Go |
| SRV-WEB-01 | 30 Go | 40% | 1.5 Go/jour | ~75 Go |
| Full hebdo (2 VMs) | 70 Go | 50% | 35 Go/semaine | 12 × 35 = 420 Go |

**Stockage total recommandé SRV-BAK-01 :** 700 Go minimum (1 To recommandé)

---

### Procédure de restauration

#### Restauration complète d'une VM

```
Veeam Console → Home → Backups → Disk
→ Clic droit sur la VM → Restore entire VM
→ Keep original VM (overwrite) ou Restore to a new location
→ Choisir le point de restauration → Restore
```

#### Restauration d'un fichier unique

```
Veeam Console → Backups → Disk
→ Clic droit sur la VM → Guest files restore → Microsoft Windows
→ Naviguer jusqu'au fichier → Restore to original location
```

#### Restauration d'un objet Active Directory

```
Veeam Console → Explorers → Veeam Explorer for Active Directory
→ Sélectionner le backup → Naviguer vers l'objet (user, OU, GPO)
→ Restore to → AD original
```

---

## PARTIE 2 — SUPERVISION

### Outil retenu : Zabbix 7.x

**Justification :** Open source, gratuit, standard industrie pour la supervision d'infrastructure, supporte Windows/Linux/Cisco/pfSense via agents et SNMP, tableaux de bord configurables, alertes multi-canaux (email, SMS, Teams).

**Documentation officielle :** [https://www.zabbix.com/documentation/7.0](https://www.zabbix.com/documentation/7.0)

---

### Architecture Zabbix

```
[SRV-BAK-01]                     [Éléments supervisés]
Zabbix Server (port 10051)   ←→  Zabbix Agent sur SRV-AD-01 (port 10050)
Zabbix Web UI (port 80/443)  ←→  Zabbix Agent sur SRV-WEB-01 (port 10050)
                             ←→  SNMP sur pfSense (port 161 UDP)
                             ←→  ICMP ping sur routeurs agences
```

---

### Installation Zabbix (sur SRV-BAK-01 — Ubuntu)

```bash
# Ajouter le dépôt Zabbix 7.0
wget https://repo.zabbix.com/zabbix/7.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_7.0-2+ubuntu24.04_all.deb
sudo dpkg -i zabbix-release_7.0-2+ubuntu24.04_all.deb
sudo apt update

# Installer Zabbix server + frontend + agent
sudo apt install -y zabbix-server-pgsql zabbix-frontend-php php8.2-pgsql zabbix-nginx-conf zabbix-sql-scripts zabbix-agent

# Configurer la base de données PostgreSQL
sudo -u postgres createuser --pwprompt zabbix
sudo -u postgres createdb -O zabbix zabbix

# Importer le schéma Zabbix
zcat /usr/share/zabbix-sql-scripts/postgresql/server.sql.gz | sudo -u zabbix psql zabbix

# Configurer le fichier Zabbix server
sudo nano /etc/zabbix/zabbix_server.conf
# Modifier : DBPassword=<mot_de_passe_zabbix>

# Démarrer les services
sudo systemctl enable zabbix-server zabbix-agent nginx php8.2-fpm
sudo systemctl start zabbix-server zabbix-agent nginx php8.2-fpm
```

Accès interface web : `http://192.168.1.102/zabbix`
Identifiants par défaut : `Admin` / `zabbix` (à changer immédiatement)

---

### Installation Zabbix Agent (sur SRV-AD-01 — Windows)

```powershell
# Télécharger l'agent Zabbix pour Windows
# https://www.zabbix.com/download_agents

# Installer via MSI (adapter le chemin)
msiexec /i zabbix_agent2-7.0.0-windows-amd64-openssl.msi `
  /quiet `
  SERVER=192.168.1.102 `
  SERVERACTIVE=192.168.1.102 `
  HOSTNAME=SRV-AD-01

# Démarrer le service
Start-Service "Zabbix Agent 2"
Set-Service "Zabbix Agent 2" -StartupType Automatic
```

---

### Éléments supervisés

#### SRV-AD-01 (Windows Server)

| Métrique | Seuil alerte WARNING | Seuil alerte CRITICAL | Action |
|---|---|---|---|
| CPU usage | > 70% pendant 5 min | > 90% pendant 5 min | Email admins |
| RAM disponible | < 1 Go | < 500 Mo | Email admins |
| Disque C: libre | < 20% | < 10% | Email + SMS admins |
| Service NTDS (AD) | Arrêté | — | Email + SMS immédiat |
| Service DNS | Arrêté | — | Email + SMS immédiat |
| Service DHCP | Arrêté | — | Email admins |
| Service Netlogon | Arrêté | — | Email + SMS immédiat |
| Connexions RDP actives | > 3 | > 5 | Email admins (sécurité) |

#### SRV-WEB-01 (Linux + Docker)

| Métrique | Seuil WARNING | Seuil CRITICAL | Action |
|---|---|---|---|
| CPU usage | > 70% | > 90% | Email admins |
| RAM disponible | < 500 Mo | < 200 Mo | Email admins |
| Disque /var/lib/docker libre | < 20% | < 10% | Email admins |
| Conteneur `backend` actif | Arrêté | — | Email + redémarrage auto |
| Conteneur `frontend` actif | Arrêté | — | Email + redémarrage auto |
| Port 80 accessible | Non répondant | — | Email + SMS admins |
| Certificat SSL expiration | < 30 jours | < 7 jours | Email admins |

#### pfSense (SNMP)

| Métrique | Seuil WARNING | Seuil CRITICAL |
|---|---|---|
| CPU pfSense | > 60% | > 80% |
| Bande passante WAN | > 80% | > 95% |
| Tunnels VPN IPSec actifs | < 12 (un ou plus down) | < 10 |
| États firewall (connexions) | > 50 000 | > 100 000 |

#### Disponibilité réseau agences (ICMP)

```
Pour chaque routeur agence (IP WAN publique) :
- Ping toutes les 60 secondes
- Alerte si 3 pings consécutifs échouent → "Agence XX - VPN DOWN"
- Notification email + SMS astreinte
```

---

### Tableau de bord Zabbix recommandé

Créer un dashboard "Vue Globale Ymmo" avec les widgets suivants :

| Widget | Type | Contenu |
|---|---|---|
| État général | Map | Carte réseau avec état des tunnels VPN (vert/rouge) |
| CPU/RAM serveurs | Graph | SRV-AD-01 + SRV-WEB-01 sur 24h |
| Disponibilité services | Availability report | NTDS, DNS, DHCP, Netlogon, HTTP |
| Alertes actives | Problem view | Toutes alertes WARNING + CRITICAL en cours |
| VPN agences | Hosts | État ping des 12 routeurs agences |
| Espace disque | Bar gauge | % libre sur tous les serveurs |
