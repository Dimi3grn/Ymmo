# Gestion des droits d'accès — Ymmo Active Directory

## Structure Active Directory

### Domaine

```
ymmo.local
```

### Arborescence des Unités d'Organisation (OU)

```
ymmo.local
├── OU=Ymmo
│   ├── OU=Utilisateurs
│   │   ├── OU=Admins
│   │   ├── OU=Commerciaux-Siege
│   │   └── OU=Commerciaux-Agences
│   │       ├── OU=Agence01-Paris
│   │       ├── OU=Agence02-Lyon
│   │       ├── OU=Agence03-Marseille
│   │       └── ... (x12)
│   ├── OU=Groupes
│   │   ├── OU=Groupes-Securite
│   │   └── OU=Groupes-Distribution
│   ├── OU=Ordinateurs
│   │   ├── OU=Serveurs
│   │   ├── OU=Postes-Siege
│   │   └── OU=Postes-Agences
│   └── OU=Comptes-Service
└── (Builtin containers — ne pas modifier)
```

---

## Groupes de sécurité

| Groupe AD | Type | Membres | Droits |
|---|---|---|---|
| `GRP-Admins-SI` | Sécurité Global | Équipe DSI | Admin local tous serveurs, accès total |
| `GRP-Admins-Domaine` | Sécurité Global | Membres DSI senior | Domain Admins (usage limité) |
| `GRP-Commerciaux-Siege` | Sécurité Global | ~30 utilisateurs siège | Application Ymmo, partages siège |
| `GRP-Commerciaux-Agences` | Sécurité Global | ~60 utilisateurs agences | Application Ymmo, partage agence |
| `GRP-Direction` | Sécurité Global | Direction + managers | Application Ymmo + rapports data |
| `GRP-Impression-Siege` | Sécurité Global | Tous postes siège | Imprimante siège |
| `GRP-Impression-AgenceXX` | Sécurité Global (x12) | Postes agence XX | Imprimante agence XX |

---

## Matrice des droits d'accès

| Ressource | GRP-Admins-SI | GRP-Direction | GRP-Commerciaux-Siege | GRP-Commerciaux-Agences |
|---|---|---|---|---|
| Application Ymmo (web) | ✅ Admin | ✅ Direction | ✅ Commercial | ✅ Commercial |
| Dashboard statistiques | ✅ | ✅ | ❌ | ❌ |
| Gestion utilisateurs (app) | ✅ | ❌ | ❌ | ❌ |
| Partage `\\SRV-AD-01\Partages\Commun` | ✅ R/W | ✅ R/W | ✅ R | ✅ R |
| Partage `\\SRV-AD-01\Partages\Direction` | ✅ R/W | ✅ R/W | ❌ | ❌ |
| Partage `\\SRV-AD-01\Partages\Agences\AGC-XX` | ✅ R/W | ✅ R | ❌ | ✅ R/W (agence propre) |
| Console d'administration serveurs | ✅ | ❌ | ❌ | ❌ |
| Accès RDP serveurs | ✅ | ❌ | ❌ | ❌ |
| Zabbix (supervision) | ✅ | ✅ R | ❌ | ❌ |

---

## Comptes utilisateurs — Convention de nommage

| Type | Format | Exemple |
|---|---|---|
| Utilisateur standard | `prenom.nom` | `jean.dupont` |
| Administrateur SI | `adm.prenom.nom` | `adm.pierre.martin` |
| Compte de service | `svc.nomservice` | `svc.veeam`, `svc.zabbix` |
| Compte applicatif | `app.nomapp` | `app.ymmo` |

### Attributs obligatoires à renseigner à la création

- `sAMAccountName` : login (format ci-dessus)
- `DisplayName` : Prénom Nom
- `mail` : prenom.nom@ymmo.fr
- `department` : Siège / Agence XX
- `title` : Intitulé du poste
- `telephoneNumber` : Numéro direct
- `manager` : Responsable hiérarchique (compte AD)
- `memberOf` : Groupe(s) de sécurité correspondant(s)

---

## Droits d'accès locaux sur les serveurs

### SRV-AD-01 (Contrôleur de domaine)

| Compte / Groupe | Droit local |
|---|---|
| `GRP-Admins-SI` | Administrateurs locaux |
| `Domain Admins` | Administrateurs locaux (par défaut) |
| Tout autre compte | Aucun accès local |

### SRV-WEB-01 (Serveur applicatif)

| Compte / Groupe | Droit local |
|---|---|
| `GRP-Admins-SI` | Administrateurs locaux |
| `svc.ymmo` | Compte de service Docker (non-admin) |
| Tout autre compte | Aucun accès local |

### SRV-BAK-01 (Sauvegarde + Supervision)

| Compte / Groupe | Droit local |
|---|---|
| `GRP-Admins-SI` | Administrateurs locaux |
| `svc.veeam` | Compte de service Veeam (droits Backup Operators) |
| `svc.zabbix` | Compte de service Zabbix (Performance Monitor Users) |

---

## Partages réseau — Permissions NTFS + Partage

### `\\SRV-AD-01\Partages\Commun`

| Groupe | Permission Partage | Permission NTFS |
|---|---|---|
| `GRP-Admins-SI` | Contrôle total | Contrôle total |
| `GRP-Direction` | Modification | Modifier |
| `GRP-Commerciaux-Siege` | Lecture | Lire et exécuter |
| `GRP-Commerciaux-Agences` | Lecture | Lire et exécuter |

### `\\SRV-AD-01\Partages\Direction`

| Groupe | Permission Partage | Permission NTFS |
|---|---|---|
| `GRP-Admins-SI` | Contrôle total | Contrôle total |
| `GRP-Direction` | Modification | Modifier |
| Autres | Aucun accès | Aucun accès |

### `\\SRV-AD-01\Partages\Agences\AGC-XX` (x12 dossiers)

| Groupe | Permission Partage | Permission NTFS |
|---|---|---|
| `GRP-Admins-SI` | Contrôle total | Contrôle total |
| `GRP-Direction` | Lecture | Lire et exécuter |
| `GRP-Commerciaux-Agences` (agence XX) | Modification | Modifier |
| Autres agences | Aucun accès | Aucun accès |

---

## Procédure de création d'un compte utilisateur

### Via PowerShell (recommandé pour reproductibilité)

```powershell
# Création d'un commercial en agence
New-ADUser `
  -Name "Jean Dupont" `
  -GivenName "Jean" `
  -Surname "Dupont" `
  -SamAccountName "jean.dupont" `
  -UserPrincipalName "jean.dupont@ymmo.local" `
  -EmailAddress "jean.dupont@ymmo.fr" `
  -Department "Agence01-Paris" `
  -Title "Commercial immobilier" `
  -Path "OU=Agence01-Paris,OU=Commerciaux-Agences,OU=Utilisateurs,OU=Ymmo,DC=ymmo,DC=local" `
  -AccountPassword (ConvertTo-SecureString "TempPass@2025!" -AsPlainText -Force) `
  -ChangePasswordAtLogon $true `
  -Enabled $true

# Ajout au groupe de sécurité
Add-ADGroupMember -Identity "GRP-Commerciaux-Agences" -Members "jean.dupont"
Add-ADGroupMember -Identity "GRP-Impression-Agence01" -Members "jean.dupont"
```

### Procédure de désactivation d'un compte (départ)

```powershell
# 1. Désactiver le compte immédiatement
Disable-ADAccount -Identity "jean.dupont"

# 2. Déplacer dans une OU de quarantaine (90 jours avant suppression)
Move-ADObject `
  -Identity (Get-ADUser jean.dupont).DistinguishedName `
  -TargetPath "OU=Comptes-Desactives,OU=Ymmo,DC=ymmo,DC=local"

# 3. Retirer de tous les groupes
$user = Get-ADUser jean.dupont -Properties MemberOf
$user.MemberOf | ForEach-Object { Remove-ADGroupMember -Identity $_ -Members jean.dupont -Confirm:$false }
```

---

## Revue périodique des accès

| Fréquence | Action |
|---|---|
| Mensuelle | Vérifier les comptes sans connexion depuis 30 jours → désactiver |
| Trimestrielle | Revue des membres des groupes Admin |
| Semestrielle | Audit complet des permissions NTFS sur les partages |
| À chaque départ | Désactivation immédiate + revue des données |
