# Plan d'adressage IP — Ymmo

## Conventions

| Notation | Signification |
|---|---|
| `/24` | Masque `255.255.255.0` — 254 hôtes utilisables |
| `/30` | Masque `255.255.255.252` — 2 hôtes utilisables (liens point-à-point VPN) |
| `GW` | Passerelle (Gateway) — toujours la dernière adresse utilisable du réseau |
| `SRV` | Serveur — adresses fixes dans la plage `.100-.120` |

---

## Siège social — Aix-en-Provence

**Réseau principal :** `192.168.1.0/24`

### VLAN 10 — Postes utilisateurs siège

| Élément | Adresse IP | Notes |
|---|---|---|
| Plage DHCP | `192.168.1.1 — 192.168.1.50` | 30 postes + marge |
| Passerelle (routeur LAN) | `192.168.1.254` | IP fixe, interface LAN routeur/pfSense |
| Masque | `255.255.255.0` | |
| DNS primaire | `192.168.1.100` | SRV-AD-01 |
| DNS secondaire | `8.8.8.8` | Google (fallback externe) |

### VLAN 20 — Serveurs siège

| Nom | Adresse IP | Rôle | OS |
|---|---|---|---|
| `SRV-AD-01` | `192.168.1.100` | AD DS, DNS, DHCP, RRAS (VPN) | Windows Server 2022 |
| `SRV-WEB-01` | `192.168.1.101` | Hébergement Ymmo (Docker), BDD PostgreSQL | Ubuntu Server 24.04 |
| `SRV-BAK-01` | `192.168.1.102` | Sauvegarde Veeam, supervision Zabbix | Windows Server 2022 ou Ubuntu |
| Passerelle VLAN 20 | `192.168.1.253` | Interface VLAN routeur |  |

### VLAN 30 — DMZ (zone démilitarisée)

| Élément | Adresse IP | Notes |
|---|---|---|
| Serveur web exposé | `192.168.2.10` | Si exposition publique souhaitée |
| Passerelle DMZ | `192.168.2.254` | Interface DMZ pfSense |
| Réseau DMZ | `192.168.2.0/24` | Isolé du LAN interne |

### Interface WAN pfSense siège

| Élément | Valeur |
|---|---|
| IP WAN siège | IP publique fournie par l'ISP (ex: `203.0.113.1`) |
| Passerelle ISP | Fournie par l'ISP |
| DNS externe | `8.8.8.8` / `1.1.1.1` |

---

## Agences (x12)

Chaque agence possède son propre sous-réseau `192.168.X.0/24` où X = 10 à 21.

| Agence | Réseau LAN | Plage DHCP | Passerelle | Routeur WAN | IP Tunnel VPN (côté agence) |
|---|---|---|---|---|---|
| Agence 01 — Paris | `192.168.10.0/24` | `.1 — .10` | `192.168.10.254` | IP publique ISP agence 1 | `10.0.1.2` |
| Agence 02 — Lyon | `192.168.11.0/24` | `.1 — .10` | `192.168.11.254` | IP publique ISP agence 2 | `10.0.1.6` |
| Agence 03 — Marseille | `192.168.12.0/24` | `.1 — .10` | `192.168.12.254` | IP publique ISP agence 3 | `10.0.1.10` |
| Agence 04 — Bordeaux | `192.168.13.0/24` | `.1 — .10` | `192.168.13.254` | IP publique ISP agence 4 | `10.0.1.14` |
| Agence 05 — Toulouse | `192.168.14.0/24` | `.1 — .10` | `192.168.14.254` | IP publique ISP agence 5 | `10.0.1.18` |
| Agence 06 — Nice | `192.168.15.0/24` | `.1 — .10` | `192.168.15.254` | IP publique ISP agence 6 | `10.0.1.22` |
| Agence 07 — Nantes | `192.168.16.0/24` | `.1 — .10` | `192.168.16.254` | IP publique ISP agence 7 | `10.0.1.26` |
| Agence 08 — Strasbourg | `192.168.17.0/24` | `.1 — .10` | `192.168.17.254` | IP publique ISP agence 8 | `10.0.1.30` |
| Agence 09 — Lille | `192.168.18.0/24` | `.1 — .10` | `192.168.18.254` | IP publique ISP agence 9 | `10.0.1.34` |
| Agence 10 — Rennes | `192.168.19.0/24` | `.1 — .10` | `192.168.19.254` | IP publique ISP agence 10 | `10.0.1.38` |
| Agence 11 — Montpellier | `192.168.20.0/24` | `.1 — .10` | `192.168.20.254` | IP publique ISP agence 11 | `10.0.1.42` |
| Agence 12 — Grenoble | `192.168.21.0/24` | `.1 — .10` | `192.168.21.254` | IP publique ISP agence 12 | `10.0.1.46` |

**DNS primaire dans chaque agence :** `192.168.1.100` (SRV-AD-01 siège, via VPN)
**DNS secondaire :** `8.8.8.8` (fallback si VPN indisponible)

---

## Tunnels VPN IPSec/IKEv2 — Liens point-à-point

Chaque tunnel utilise un réseau `/30` (2 adresses utilisables).

| Tunnel | Réseau /30 | IP côté siège | IP côté agence | Agence |
|---|---|---|---|---|
| Tunnel 01 | `10.0.1.0/30` | `10.0.1.1` | `10.0.1.2` | Agence 01 |
| Tunnel 02 | `10.0.1.4/30` | `10.0.1.5` | `10.0.1.6` | Agence 02 |
| Tunnel 03 | `10.0.1.8/30` | `10.0.1.9` | `10.0.1.10` | Agence 03 |
| Tunnel 04 | `10.0.1.12/30` | `10.0.1.13` | `10.0.1.14` | Agence 04 |
| Tunnel 05 | `10.0.1.16/30` | `10.0.1.17` | `10.0.1.18` | Agence 05 |
| Tunnel 06 | `10.0.1.20/30` | `10.0.1.21` | `10.0.1.22` | Agence 06 |
| Tunnel 07 | `10.0.1.24/30` | `10.0.1.25` | `10.0.1.26` | Agence 07 |
| Tunnel 08 | `10.0.1.28/30` | `10.0.1.29` | `10.0.1.30` | Agence 08 |
| Tunnel 09 | `10.0.1.32/30` | `10.0.1.33` | `10.0.1.34` | Agence 09 |
| Tunnel 10 | `10.0.1.36/30` | `10.0.1.37` | `10.0.1.38` | Agence 10 |
| Tunnel 11 | `10.0.1.40/30` | `10.0.1.41` | `10.0.1.42` | Agence 11 |
| Tunnel 12 | `10.0.1.44/30` | `10.0.1.45` | `10.0.1.46` | Agence 12 |

---

## Synthèse des plages réservées

| Plage | Usage |
|---|---|
| `192.168.1.0/24` | LAN siège |
| `192.168.2.0/24` | DMZ siège |
| `192.168.10.0/24` — `192.168.21.0/24` | LAN agences 1 à 12 |
| `10.0.1.0/26` | Tunnels VPN IPSec (liens point-à-point) |
| `172.16.0.0/16` | Réservé usage futur (expansion) |
