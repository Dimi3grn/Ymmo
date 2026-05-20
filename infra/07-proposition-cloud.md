# Proposition solution Cloud — Ymmo

## Plateforme retenue : Microsoft Azure

### Justification du choix Azure

| Critère | Azure | AWS | GCP |
|---|---|---|---|
| Intégration Windows Server / AD | ✅ Native (Azure AD Connect) | ⚠️ Possible mais non natif | ⚠️ Possible mais non natif |
| Compatibilité avec l'existant Ymmo | ✅ Excellent (même écosystème) | Partiel | Partiel |
| Offre hybride (on-premise + cloud) | ✅ Azure Arc, Azure AD Connect | ✅ AWS Outposts | ⚠️ Limité |
| Présence régions France | ✅ France Central (Paris) | ✅ Paris | ✅ Paris |
| Support entreprise FR | ✅ Microsoft France | ✅ | ✅ |
| Coût démarrage | Gratuit 200€ crédit | Gratuit 12 mois | Gratuit 300€ crédit |

---

## Architecture cloud proposée

### Scénario : Infrastructure hybride (on-premise + Azure)

L'infrastructure reste principalement **on-premise** (siège et agences) avec une extension cloud pour :
1. La **haute disponibilité** de l'application web Ymmo
2. La **sauvegarde offsite** des données critiques
3. La **connexion sécurisée** via Azure VPN Gateway

```
┌─────────────────────────────────────────────────────────┐
│                   MICROSOFT AZURE                        │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Virtual Network (10.1.0.0/16)           │    │
│  │                                                  │    │
│  │  ┌──────────────┐    ┌──────────────────────┐   │    │
│  │  │  Subnet Web  │    │  Subnet Données      │   │    │
│  │  │  10.1.1.0/24 │    │  10.1.2.0/24         │   │    │
│  │  │              │    │                      │   │    │
│  │  │ App Service  │    │ Azure Database       │   │    │
│  │  │ (Ymmo web)   │    │ for PostgreSQL       │   │    │
│  │  │              │    │ (Flexible Server)    │   │    │
│  │  └──────────────┘    └──────────────────────┘   │    │
│  │                                                  │    │
│  │  ┌──────────────┐    ┌──────────────────────┐   │    │
│  │  │ Azure Blob   │    │ VPN Gateway          │   │    │
│  │  │ Storage      │    │ (S2S vers siège)     │   │    │
│  │  │ (backups)    │    │                      │   │    │
│  │  └──────────────┘    └──────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │ VPN Site-to-Site
                          │ (IPSec/IKEv2)
               ┌──────────▼──────────┐
               │  Siège on-premise   │
               │  192.168.1.0/24     │
               └─────────────────────┘
```

---

## Services Azure utilisés

### 1. Azure App Service (hébergement web)

| Paramètre | Valeur |
|---|---|
| Service | Azure App Service |
| Plan | B2 (2 vCore, 3.5 Go RAM) — ~60€/mois |
| Runtime | Docker Container (image Ymmo) |
| Région | France Central (Paris) |
| Scaling | Manual (1 instance par défaut) |
| SSL | Certificat Let's Encrypt gratuit via App Service |
| Domaine custom | `app.ymmo.fr` |

**Avantage :** Déploiement automatique depuis GitHub (CI/CD intégré), SSL automatique, pas de gestion d'OS.

### 2. Azure Database for PostgreSQL — Flexible Server

| Paramètre | Valeur |
|---|---|
| Service | Azure Database for PostgreSQL Flexible Server |
| SKU | Burstable B2ms (2 vCore, 8 Go RAM) — ~80€/mois |
| Stockage | 32 Go SSD (extensible automatiquement) |
| Haute disponibilité | Zone-redundant standby (~+80€/mois) |
| Sauvegarde | Automatique 7 jours (inclus), rétention max 35 jours |
| SSL | Requis (certificat Azure) |
| Accès | Via Private Endpoint dans le VNet Azure uniquement |

### 3. Azure Blob Storage (sauvegarde offsite)

| Paramètre | Valeur |
|---|---|
| Service | Azure Blob Storage |
| Tier | Cool (données accédées < 1 fois/mois) |
| Redondance | ZRS (Zone-Redundant Storage) — 3 copies dans la région |
| Capacité | 1 To (~10€/mois) |
| Rétention | 6 mois (lifecycle policy automatique) |
| Chiffrement | AES-256 côté serveur (inclus) |
| Accès | Via Veeam Backup (SAS token, pas d'accès public) |

### 4. Azure VPN Gateway (connexion hybride)

| Paramètre | Valeur |
|---|---|
| Service | Azure VPN Gateway |
| SKU | VpnGw1 (~150€/mois) |
| Type | Route-based (IKEv2) |
| Connexion | Site-to-Site vers pfSense siège |
| Bande passante | 650 Mbps |

> Pour la démo académique, la VPN Gateway peut être remplacée par **Azure VNet Peering** + simulation locale.

### 5. Azure Active Directory (Entra ID)

| Paramètre | Valeur |
|---|---|
| Service | Microsoft Entra ID (Azure AD) |
| Plan | Free (suffisant pour SSO basique) |
| Synchronisation | Azure AD Connect depuis SRV-AD-01 |
| Utilisation | SSO pour l'accès à l'app Ymmo via compte Microsoft |

Avec Azure AD Connect, les comptes `ymmo.local` sont synchronisés vers Azure AD. Les utilisateurs peuvent se connecter à l'application Ymmo avec leurs identifiants Active Directory (Single Sign-On).

---

## Coût mensuel estimé

| Service | Coût mensuel estimé |
|---|---|
| Azure App Service B2 | 60 € |
| Azure Database PostgreSQL Flexible B2ms | 80 € |
| Azure Blob Storage 1 To (Cool) | 10 € |
| Azure VPN Gateway VpnGw1 | 150 € |
| Azure AD (Entra ID Free) | 0 € |
| Transfert de données sortant (~50 Go/mois) | ~4 € |
| **TOTAL** | **~304 €/mois** |

> **Option économie :** Sans la VPN Gateway (connexion hybride non requise), réduire à ~154€/mois en utilisant uniquement App Service + PostgreSQL + Blob Storage.

---

## Plan de migration (si Ymmo décide de passer full cloud)

### Phase 1 — Extension (Mois 1-2) — Configuration actuelle proposée

- Déployer l'application Ymmo sur Azure App Service
- Migrer la base de données vers Azure Database for PostgreSQL
- Configurer Azure AD Connect pour le SSO
- Configurer la sauvegarde Veeam vers Azure Blob

### Phase 2 — Hybride renforcé (Mois 3-6)

- Activer Azure VPN Gateway pour connexion sécurisée on-premise ↔ cloud
- Configurer Azure Monitor + Log Analytics pour supervision centralisée
- Activer l'authentification multi-facteurs (MFA) via Azure AD

### Phase 3 — Full cloud optionnel (Mois 6+)

- Migrer les serveurs Windows vers Azure Virtual Machines
- Remplacer Active Directory on-premise par Azure AD DS (Domain Services)
- Activer Azure Site Recovery pour la reprise d'activité (RTO < 1h)

---

## Avantages de la solution cloud proposée

| Avantage | Détail |
|---|---|
| **Haute disponibilité** | Azure SLA 99.95% (App Service) |
| **Scalabilité** | Augmentation des ressources en quelques clics (sans achat matériel) |
| **Sécurité** | Chiffrement en transit et au repos, Microsoft Security Center |
| **Sauvegarde** | Données redondées sur 3 zones dans la région France |
| **Conformité RGPD** | Données hébergées en France (France Central) |
| **Coût prévisible** | Paiement à l'usage, pas d'investissement matériel cloud |
