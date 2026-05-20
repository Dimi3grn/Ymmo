# Infrastructure YMMO — Documentation technique

## Contexte

Ymmo est un groupe immobilier avec :
- **1 siège social** à Aix-en-Provence (~30 postes, 2 serveurs)
- **12 agences** réparties en France (~5 postes chacune)
- Une connexion sécurisée entre le siège et chaque agence via **VPN IPSec/IKEv2**

---

## Choix technologiques — Justification

| Composant | Technologie choisie | Justification |
|---|---|---|
| OS Serveur | **Windows Server 2022 Datacenter** | Standard entreprise, compatibilité AD native, support Microsoft jusqu'en 2031 |
| Active Directory | **AD DS Windows Server 2022** | Solution native, intégration DNS/DHCP/GPO transparente |
| DNS | **Windows Server DNS (intégré AD)** | Réplication automatique avec AD, gestion centralisée |
| DHCP | **Windows Server DHCP** | Intégration AD, plages par VLAN, journalisation native |
| VPN | **IPSec/IKEv2 via RRAS (Windows)** | Standard industriel, chiffrement AES-256, compatible Cisco côté agences |
| Pare-feu périmètre | **pfSense 2.7** | Open source entreprise, règles granulaires, IDS/IPS Snort intégré, gratuit |
| Pare-feu serveur | **Windows Defender Firewall** | Natif Windows Server, GPO-manageable |
| Hyperviseur (démo) | **VirtualBox 7.x** | Gratuit, multiplateforme, suffisant pour la démonstration |
| Simulation réseau | **Cisco Packet Tracer 8.x** | Standard pédagogique, simulation VPN/IPSec, routeurs Cisco |
| Sauvegarde | **Veeam Backup & Replication Community** | Standard industrie, gratuit jusqu'à 10 workloads, déduplication |
| Supervision | **Zabbix 7.x** | Open source, supervision réseau + serveurs + services, alertes |
| Domaine interne | **ymmo.local** | Convention Active Directory, séparation domaine interne/externe |
| Cloud | **Microsoft Azure** | Cohérence avec l'écosystème Windows/AD, Azure AD Connect pour hybride |

---

## Structure des livrables

```
infra/
├── README.md                           ← Ce fichier (vue d'ensemble + choix)
├── 01-plan-adressage-ip.md             ← Adressage IP complet siège + 12 agences
├── 02-architecture-reseau.md           ← Schéma + instructions Miro
├── 03-politique-securite.md            ← Pare-feu, règles, VLAN, GPO
├── 04-gestion-droits-acces.md          ← Matrice AD, OU, groupes
├── 05-guide-configuration-serveurs.md  ← Procédures Windows Server pas à pas
├── 06-plan-sauvegarde-supervision.md   ← Veeam + Zabbix
├── 07-proposition-cloud.md             ← Azure, architecture hybride
├── 08-guide-deploiement.md             ← Ordre et procédures de déploiement
└── 09-liste-materiel-budget.md         ← BOM + devis estimatif
```

---

## Résumé de l'architecture

```
                        INTERNET
                            │
                     ┌──────▼──────┐
                     │   pfSense   │ ← Pare-feu périmètre siège
                     │  Pare-feu   │   (WAN: IP publique)
                     └──────┬──────┘
                            │ DMZ + LAN
              ┌─────────────┼─────────────────┐
              │             │                 │
       ┌──────▼──────┐ ┌────▼─────┐  ┌───────▼───────┐
       │  VLAN 10    │ │  VLAN 20 │  │   VLAN 30     │
       │  Serveurs   │ │  Postes  │  │    DMZ        │
       │  .100-.110  │ │  .1-.30  │  │  Serveur Web  │
       └──────┬──────┘ └──────────┘  └───────────────┘
              │
       ┌──────▼──────┐
       │ SRV-AD-01   │ ← Windows Server 2022
       │ 192.168.1.100│  AD DS + DNS + DHCP + RRAS
       └──────┬──────┘
              │ VPN IPSec/IKEv2 (x12 tunnels)
    ┌─────────▼──────────────────────────────┐
    │                                         │
┌───▼───┐  ┌───────┐  ┌───────┐      ┌───────┐
│ AGC1  │  │ AGC2  │  │ AGC3  │ ...  │ AGC12 │
│.10/24 │  │.11/24 │  │.12/24 │      │.21/24 │
└───────┘  └───────┘  └───────┘      └───────┘
```

---

## Domaine Active Directory

- **Nom de domaine :** `ymmo.local`
- **Niveau fonctionnel forêt :** Windows Server 2022
- **Niveau fonctionnel domaine :** Windows Server 2022
- **Contrôleur de domaine principal (PDC) :** `SRV-AD-01` (192.168.1.100)
- **FSMO roles :** Tous sur SRV-AD-01 (single DC pour la démo)
