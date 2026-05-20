# Guide de configuration des serveurs — Ymmo

## Prérequis matériels et logiciels

### VirtualBox (démo)

- **VirtualBox 7.x** installé sur la machine hôte
- **ISO Windows Server 2022 Datacenter Evaluation** (gratuit 180 jours) :
  Téléchargement : [https://www.microsoft.com/fr-fr/evalcenter/evaluate-windows-server-2022](https://www.microsoft.com/fr-fr/evalcenter/evaluate-windows-server-2022)
- **RAM disponible** : minimum 8 Go (4 Go par VM Windows Server)
- **Espace disque** : minimum 80 Go libres

---

## VM SRV-AD-01 — Configuration VirtualBox

| Paramètre | Valeur |
|---|---|
| Nom | `SRV-AD-01` |
| Type | Microsoft Windows |
| Version | Windows Server 2022 (64-bit) |
| RAM | 4096 Mo (4 Go) |
| CPU | 2 vCPUs |
| Disque dur | 60 Go (VDI, alloué dynamiquement) |
| Réseau (carte 1) | Réseau interne : `siege-lan` |
| Réseau (carte 2) | NAT (pour accès Internet lors de la config) |

> **Note :** Après configuration complète, désactiver la carte NAT (carte 2). Le serveur ne doit pas avoir d'accès Internet direct en production.

---

## Étape 1 — Installation Windows Server 2022

1. Démarrer la VM avec l'ISO monté
2. Sélectionner : **Windows Server 2022 Datacenter (avec expérience de bureau)**
3. Type d'installation : **Personnalisée**
4. Partitionnement : laisser par défaut (partition unique)
5. Mot de passe Administrateur local : `Admin@Ymmo2025!` *(à changer en production)*
6. Après démarrage, désactiver IE Enhanced Security Configuration :
   - Server Manager → Local Server → IE Enhanced Security Configuration → Off (Admins + Users)

---

## Étape 2 — Configuration réseau initiale (IP fixe)

Ouvrir PowerShell en tant qu'administrateur :

```powershell
# Identifier le nom de l'interface réseau
Get-NetAdapter

# Configurer l'IP fixe (adapter "Ethernet" selon le nom réel)
New-NetIPAddress `
  -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.100" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.254"

# Configurer les DNS (se pointer lui-même en primaire pour l'AD)
Set-DnsClientServerAddress `
  -InterfaceAlias "Ethernet" `
  -ServerAddresses ("192.168.1.100", "8.8.8.8")

# Renommer le serveur
Rename-Computer -NewName "SRV-AD-01" -Restart
```

---

## Étape 3 — Installation du rôle Active Directory Domain Services (AD DS)

```powershell
# Installer les rôles AD DS, DNS et les outils d'administration
Install-WindowsFeature `
  -Name AD-Domain-Services, DNS `
  -IncludeManagementTools `
  -Restart:$false

# Promouvoir le serveur en contrôleur de domaine
# (Crée une nouvelle forêt ymmo.local)
Install-ADDSForest `
  -DomainName "ymmo.local" `
  -DomainNetbiosName "YMMO" `
  -ForestMode "WinThreshold" `
  -DomainMode "WinThreshold" `
  -DatabasePath "C:\Windows\NTDS" `
  -LogPath "C:\Windows\NTDS" `
  -SysvolPath "C:\Windows\SYSVOL" `
  -SafeModeAdministratorPassword (ConvertTo-SecureString "DSRMpass@2025!" -AsPlainText -Force) `
  -Force `
  -NoRebootOnCompletion:$false
```

> Après redémarrage, se connecter avec `YMMO\Administrator`.

---

## Étape 4 — Configuration DNS

Le DNS est automatiquement installé et configuré par AD DS. Vérifications à effectuer :

```powershell
# Vérifier les zones DNS créées
Get-DnsServerZone

# Doit afficher :
# ymmo.local         (zone principale directe)
# 1.168.192.in-addr.arpa  (zone de recherche inversée)

# Ajouter une zone de recherche inversée si absente
Add-DnsServerPrimaryZone `
  -NetworkID "192.168.1.0/24" `
  -ReplicationScope "Forest"

# Ajouter les enregistrements des serveurs
Add-DnsServerResourceRecordA `
  -ZoneName "ymmo.local" `
  -Name "SRV-WEB-01" `
  -IPv4Address "192.168.1.101"

Add-DnsServerResourceRecordA `
  -ZoneName "ymmo.local" `
  -Name "SRV-BAK-01" `
  -IPv4Address "192.168.1.102"

# Configurer le redirecteur DNS pour les requêtes externes
Add-DnsServerForwarder -IPAddress "8.8.8.8"
Add-DnsServerForwarder -IPAddress "1.1.1.1"
```

---

## Étape 5 — Configuration DHCP

```powershell
# Installer le rôle DHCP
Install-WindowsFeature -Name DHCP -IncludeManagementTools

# Autoriser le serveur DHCP dans l'AD
Add-DhcpServerInDC -DnsName "SRV-AD-01.ymmo.local" -IPAddress "192.168.1.100"

# Créer l'étendue DHCP pour le VLAN 10 (postes siège)
Add-DhcpServerv4Scope `
  -Name "VLAN10-Postes-Siege" `
  -StartRange "192.168.1.1" `
  -EndRange "192.168.1.50" `
  -SubnetMask "255.255.255.0" `
  -DefaultLeaseTimeDays 1 `
  -MaxLeaseTimeDays 3 `
  -State Active

# Options DHCP pour la plage
Set-DhcpServerv4OptionValue `
  -ScopeId "192.168.1.0" `
  -DnsDomain "ymmo.local" `
  -DnsServer "192.168.1.100" `
  -Router "192.168.1.254"

# Exclure les adresses réservées (serveurs, passerelle)
Add-DhcpServerv4ExclusionRange `
  -ScopeId "192.168.1.0" `
  -StartRange "192.168.1.100" `
  -EndRange "192.168.1.120"

Add-DhcpServerv4ExclusionRange `
  -ScopeId "192.168.1.0" `
  -StartRange "192.168.1.250" `
  -EndRange "192.168.1.254"
```

---

## Étape 6 — Création de la structure OU et des groupes

```powershell
# Créer l'OU racine
New-ADOrganizationalUnit -Name "Ymmo" -Path "DC=ymmo,DC=local"

# Créer les sous-OUs
$base = "OU=Ymmo,DC=ymmo,DC=local"
New-ADOrganizationalUnit -Name "Utilisateurs" -Path $base
New-ADOrganizationalUnit -Name "Groupes" -Path $base
New-ADOrganizationalUnit -Name "Ordinateurs" -Path $base
New-ADOrganizationalUnit -Name "Comptes-Service" -Path $base

$users = "OU=Utilisateurs,$base"
New-ADOrganizationalUnit -Name "Admins" -Path $users
New-ADOrganizationalUnit -Name "Commerciaux-Siege" -Path $users
New-ADOrganizationalUnit -Name "Commerciaux-Agences" -Path $users

# Créer les OU par agence
$agences = "OU=Commerciaux-Agences,$users"
$villes = @("Agence01-Paris","Agence02-Lyon","Agence03-Marseille","Agence04-Bordeaux",
            "Agence05-Toulouse","Agence06-Nice","Agence07-Nantes","Agence08-Strasbourg",
            "Agence09-Lille","Agence10-Rennes","Agence11-Montpellier","Agence12-Grenoble")
$villes | ForEach-Object { New-ADOrganizationalUnit -Name $_ -Path $agences }

# Créer les groupes de sécurité
$groupes = "OU=Groupes-Securite,OU=Groupes,$base"
New-ADOrganizationalUnit -Name "Groupes-Securite" -Path "OU=Groupes,$base"
New-ADOrganizationalUnit -Name "Groupes-Distribution" -Path "OU=Groupes,$base"

$secuGroupes = @("GRP-Admins-SI","GRP-Admins-Domaine","GRP-Commerciaux-Siege",
                 "GRP-Commerciaux-Agences","GRP-Direction","GRP-Impression-Siege")
$secuGroupes | ForEach-Object {
  New-ADGroup -Name $_ -GroupScope Global -GroupCategory Security -Path $groupes
}
```

---

## Étape 7 — Configuration des GPO

```powershell
# Créer et lier la GPO de sécurité baseline
$gpo = New-GPO -Name "YMMO-Security-Baseline"
New-GPLink -Name "YMMO-Security-Baseline" -Target "OU=Ymmo,DC=ymmo,DC=local"

# Créer et lier la GPO des commerciaux
$gpoAgents = New-GPO -Name "YMMO-Restrict-Agents"
New-GPLink -Name "YMMO-Restrict-Agents" -Target "OU=Commerciaux-Agences,OU=Utilisateurs,OU=Ymmo,DC=ymmo,DC=local"
New-GPLink -Name "YMMO-Restrict-Agents" -Target "OU=Commerciaux-Siege,OU=Utilisateurs,OU=Ymmo,DC=ymmo,DC=local"
```

> Les paramètres détaillés des GPO sont à configurer via la **Console de gestion des stratégies de groupe** (gpmc.msc).
> Se référer à `03-politique-securite.md` pour la liste complète des paramètres.

---

## VM SRV-WEB-01 — Configuration

Ce serveur héberge l'application Ymmo via Docker. Il tourne sous **Ubuntu Server 24.04 LTS**.

### Configuration VirtualBox

| Paramètre | Valeur |
|---|---|
| Nom | `SRV-WEB-01` |
| Type | Linux / Ubuntu (64-bit) |
| RAM | 4096 Mo |
| CPU | 2 vCPUs |
| Disque | 60 Go |
| Réseau | Réseau interne `siege-lan` |

### Post-installation Ubuntu

```bash
# IP fixe
sudo nano /etc/netplan/00-installer-config.yaml
# Contenu :
# network:
#   ethernets:
#     enp0s3:
#       addresses: [192.168.1.101/24]
#       routes:
#         - to: default
#           via: 192.168.1.254
#       nameservers:
#         addresses: [192.168.1.100, 8.8.8.8]
#   version: 2

sudo netplan apply

# Joindre le domaine Active Directory (optionnel)
sudo apt install -y realmd sssd sssd-tools adcli
sudo realm join ymmo.local -U Administrator

# Installer Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Cloner et démarrer l'application Ymmo
git clone https://github.com/Dimi3grn/Ymmo.git /opt/ymmo
cd /opt/ymmo
docker compose up -d
```

---

## VM Poste client — Configuration (démo)

### Configuration VirtualBox

| Paramètre | Valeur |
|---|---|
| Nom | `PC-AGC01` |
| Type | Microsoft Windows / Windows 11 (64-bit) |
| RAM | 2048 Mo |
| CPU | 2 vCPUs |
| Réseau | Réseau interne `agence01-lan` |

> Pour la démo, ce poste simule un commercial de l'Agence 1 (Paris).

### Rejoindre le domaine ymmo.local

1. Configurer l'IP : `192.168.10.1`, GW `192.168.10.254`, DNS `192.168.1.100`
2. Le VPN doit être actif (le poste doit joindre SRV-AD-01 via le tunnel)
3. `Paramètres système → Nom de l'ordinateur → Modifier → Domaine : ymmo.local`
4. Redémarrer et se connecter avec `YMMO\jean.dupont`

---

## Vérification finale

```powershell
# Sur SRV-AD-01 : vérifier l'état de l'AD
Get-ADDomainController -Discover
netlogon

# Vérifier les services critiques
Get-Service ADWS, DNS, DHCP, Netlogon, NTDS | Select-Object Name, Status

# Test de résolution DNS
Resolve-DnsName SRV-WEB-01.ymmo.local
Resolve-DnsName SRV-BAK-01.ymmo.local

# Vérifier la réplication (si plusieurs DC)
repadmin /replsummary
```
