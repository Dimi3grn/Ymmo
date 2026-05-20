# Liste du matériel et budgétisation — Ymmo

## Méthodologie

Les prix sont des estimations basées sur les tarifs catalogue constructeurs et revendeurs B2B (Dell, HPE, Cisco) en France, hors taxes. Les prix réels peuvent varier selon négociation, stock et promotions.

---

## SIÈGE SOCIAL — Aix-en-Provence

### Serveurs

| Réf | Équipement | Caractéristiques | Quantité | PU HT estimé | Total HT |
|---|---|---|---|---|---|
| SRV-01 | **Dell PowerEdge R350** (SRV-AD-01) | Intel Xeon E-2334 (4c/8t), 32 Go DDR4 ECC, 2x 480 Go SSD RAID 1, iDRAC9 | 1 | 2 800 € | 2 800 € |
| SRV-02 | **Dell PowerEdge R350** (SRV-WEB-01) | Intel Xeon E-2334 (4c/8t), 32 Go DDR4 ECC, 2x 480 Go SSD RAID 1 + 1x 2 To HDD, iDRAC9 | 1 | 3 100 € | 3 100 € |
| SRV-03 | **Dell PowerEdge R350** (SRV-BAK-01) | Intel Xeon E-2314 (4c/4t), 16 Go DDR4 ECC, 4x 2 To HDD RAID 5 (6 To utiles), iDRAC9 | 1 | 2 500 € | 2 500 € |
| | | | | **Sous-total** | **8 400 €** |

> **Alternative économique :** HPE ProLiant MicroServer Gen10 Plus (~1 200 € pièce) si budget contraint. Moins performant mais suffisant pour 30 utilisateurs.

### Équipements réseau siège

| Réf | Équipement | Caractéristiques | Quantité | PU HT estimé | Total HT |
|---|---|---|---|---|---|
| NET-01 | **pfSense SG-3100** (pare-feu) | 4 cœurs ARM, 4 Go RAM, 4x 1 GbE, pfSense pré-installé | 1 | 500 € | 500 € |
| NET-02 | **Cisco Catalyst 2960X-24TS-L** (switch manageable) | 24x 1 GbE, 4x SFP uplink, VLAN 802.1Q, PoE optionnel | 1 | 1 200 € | 1 200 € |
| NET-03 | **Patch panel 24 ports** + câbles | Cat6, 0.5m et 2m | 1 lot | 150 € | 150 € |
| NET-04 | **Rack 19" 12U** avec PDU | Fermé, avec ventilation et PDU 8 prises | 1 | 400 € | 400 € |
| NET-05 | **UPS APC Smart-UPS 1500VA** | Autonomie ~20 min pour 3 serveurs + switch | 1 | 650 € | 650 € |
| | | | | **Sous-total** | **2 900 €** |

### Postes de travail siège

| Réf | Équipement | Caractéristiques | Quantité | PU HT estimé | Total HT |
|---|---|---|---|---|---|
| PC-01 | **Dell OptiPlex 7010** (postes) | Intel Core i5-13500T, 16 Go DDR5, 256 Go SSD, Windows 11 Pro | 30 | 900 € | 27 000 € |
| PC-02 | **Écrans Dell P2422H 24"** | Full HD, DisplayPort + HDMI | 30 | 200 € | 6 000 € |
| PC-03 | **Canon PIXMA TR4650** (imprimante) | A4, recto-verso, réseau Wi-Fi | 1 | 100 € | 100 € |
| | | | | **Sous-total** | **33 100 €** |

### Licences siège

| Réf | Licence | Quantité | PU HT estimé | Total HT |
|---|---|---|---|---|
| LIC-01 | **Windows Server 2022 Datacenter** (3 serveurs) | 3 | 900 € | 2 700 € |
| LIC-02 | **Windows Server 2022 CAL** (par utilisateur) | 30 | 35 € | 1 050 € |
| LIC-03 | **Microsoft 365 Business Basic** (email + Teams) | 30 | 6 €/mois | 180 €/mois |
| | | | | **Sous-total licences** | **3 750 € + 180€/mois** |

---

## AGENCES (x12)

Chaque agence est équipée de manière identique.

### Équipement par agence

| Réf | Équipement | Caractéristiques | Quantité/agence | PU HT estimé | Total HT (x1 agence) |
|---|---|---|---|---|---|
| AGC-01 | **pfSense SG-1100** (routeur/VPN) | 3x 1 GbE, pfSense pré-installé, IPSec/IKEv2 | 1 | 200 € | 200 € |
| AGC-02 | **Cisco SG350-10** (switch non manageable) | 8x 1 GbE, 2x SFP | 1 | 180 € | 180 € |
| AGC-03 | **Dell OptiPlex 3000** (postes) | Intel Core i3-12100T, 8 Go DDR4, 256 Go SSD, Win 11 Pro | 5 | 650 € | 3 250 € |
| AGC-04 | **Écrans Dell SE2422H 24"** | Full HD, HDMI + VGA | 5 | 130 € | 650 € |
| AGC-05 | **Canon PIXMA TR4650** (imprimante) | A4, recto-verso, réseau | 1 | 100 € | 100 € |
| AGC-06 | **UPS APC Back-UPS 700VA** | Autonomie ~15 min pour routeur + switch | 1 | 120 € | 120 € |
| | | | | **Total par agence** | **4 500 €** |

### Licences par agence

| Réf | Licence | Quantité/agence | PU HT/mois | Total/mois (x1 agence) |
|---|---|---|---|---|
| LAGO-01 | **Windows 11 Pro** (inclus avec Dell OptiPlex) | 5 | Inclus | 0 € |
| LAGO-02 | **Microsoft 365 Business Basic** | 5 | 6 € | 30 €/mois |

---

## RÉCAPITULATIF BUDGÉTAIRE

### Coût d'investissement initial (CAPEX)

| Poste | Montant HT |
|---|---|
| Serveurs siège (x3) | 8 400 € |
| Réseau siège (pare-feu, switch, rack, UPS) | 2 900 € |
| Postes de travail siège (30 postes + écrans + imprimante) | 33 100 € |
| Licences siège (Windows Server + CAL) | 3 750 € |
| Équipements agences (x12 × 4 500 €) | 54 000 € |
| **TOTAL CAPEX** | **102 150 € HT** |
| TVA 20% | 20 430 € |
| **TOTAL CAPEX TTC** | **122 580 € TTC** |

### Coût d'exploitation mensuel (OPEX)

| Poste | Montant HT/mois |
|---|---|
| Microsoft 365 siège (30 × 6€) | 180 € |
| Microsoft 365 agences (12 × 5 × 6€) | 360 € |
| Abonnement ISP siège (fibre pro 500 Mbps) | 150 € |
| Abonnements ISP agences (12 × 50 Mbps ADSL/VDSL) | 12 × 40 € = 480 € |
| Azure Blob Storage sauvegarde | 10 € |
| Maintenance matérielle (contrat NBD Dell) | 200 € |
| **TOTAL OPEX** | **1 380 € HT/mois** |
| **TOTAL OPEX** (avec option Azure complète) | **~1 684 € HT/mois** |

### Coût total sur 3 ans

| | Montant HT |
|---|---|
| CAPEX initial | 102 150 € |
| OPEX sur 36 mois (1 380 €/mois) | 49 680 € |
| **TCO 3 ans** | **151 830 € HT** |
| **TCO 3 ans TTC** | **~182 196 € TTC** |

---

## Logiciels gratuits inclus dans le projet

| Logiciel | Coût | Justification |
|---|---|---|
| pfSense CE | Gratuit | Open source, version communautaire |
| Zabbix 7.x | Gratuit | Open source |
| Veeam B&R Community | Gratuit | Jusqu'à 10 workloads |
| Docker + Linux (SRV-WEB-01) | Gratuit | Open source |
| Application Ymmo | Développement interne | — |

**Économie logiciels vs solutions payantes équivalentes :** ~15 000 €/an (vs Symantec NetBackup + SolarWinds + pfSense Plus)
