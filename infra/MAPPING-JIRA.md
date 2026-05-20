# Mapping Jira → Documentation technique

Ce document fait le lien entre chaque **story Jira** et la **documentation technique** correspondante.

**Comment l'utiliser :**
1. Trouve ton ticket Jira (ex: `INFRA-8`)
2. Clique sur le lien dans la colonne "Documentation"
3. Tu arrives directement sur la section du fichier qui explique la tâche

---

## Epic INFRA-1 — Architecture réseau

| Ticket | Story | Documentation |
|---|---|---|
| INFRA-8 | Valider le plan d'adressage IP | [01-plan-adressage-ip.md](01-plan-adressage-ip.md) |
| INFRA-11 | Créer le schéma réseau sur Miro | [02-architecture-reseau.md](02-architecture-reseau.md#instructions-miro---création-du-schéma-réseau) |
| INFRA-12 | Simuler le réseau dans Cisco Packet Tracer | [02-architecture-reseau.md](02-architecture-reseau.md#instructions-cisco-packet-tracer---simulation-réseau) |
| INFRA-13 | Configurer pfSense WAN/LAN/DMZ | [03-politique-securite.md](03-politique-securite.md#1-pare-feu-périmètre-pfsense--règles-de-filtrage) |
| INFRA-14 | Définir les VLANs et le routage inter-VLAN | [02-architecture-reseau.md](02-architecture-reseau.md#composants-réseau-siège) |

---

## Epic INFRA-2 — Serveurs Windows

| Ticket | Story | Documentation |
|---|---|---|
| INFRA-15 | Installer Windows Server 2022 sur SRV-AD-01 | [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md#vm-srv-ad-01--configuration-virtualbox) |
| INFRA-16 | Configurer Active Directory ymmo.local | [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md#étape-4--installer-et-configurer-active-directory-ds) + [04-gestion-droits-acces.md](04-gestion-droits-acces.md#structure-active-directory) |
| INFRA-17 | Configurer DNS et DHCP | [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md#étape-5--configurer-le-dns-intégré-ad) |
| INFRA-18 | Installer Ubuntu Server + Docker sur SRV-WEB-01 | [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md#vm-srv-web-01--ubuntu-server--docker) |
| INFRA-19 | Joindre un poste client au domaine | [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md#vm-cliente-windows-11--jointure-au-domaine) |

---

## Epic INFRA-3 — Sécurité réseau

| Ticket | Story | Documentation |
|---|---|---|
| INFRA-20 | Configurer les règles pfSense | [03-politique-securite.md](03-politique-securite.md#1-pare-feu-périmètre-pfsense--règles-de-filtrage) |
| INFRA-21 | Mettre en place les GPO de sécurité | [03-politique-securite.md](03-politique-securite.md#4-stratégies-de-groupe-gpo) + [04-gestion-droits-acces.md](04-gestion-droits-acces.md#exemples-powershell) |
| INFRA-22 | Configurer le VPN IPSec/IKEv2 | [03-politique-securite.md](03-politique-securite.md#2-vpn-ipsecikev2--paramètres-de-chiffrement) |
| INFRA-23 | Définir la politique de mots de passe | [03-politique-securite.md](03-politique-securite.md#5-politique-de-mots-de-passe) |

---

## Epic INFRA-4 — Sauvegarde & Supervision

| Ticket | Story | Documentation |
|---|---|---|
| INFRA-24 | Installer et configurer Veeam | [06-plan-sauvegarde-supervision.md](06-plan-sauvegarde-supervision.md#installation-de-veeam-backup--replication-community) |
| INFRA-25 | Installer et configurer Zabbix | [06-plan-sauvegarde-supervision.md](06-plan-sauvegarde-supervision.md#installation-de-zabbix-7x) |
| INFRA-26 | Planifier les sauvegardes (règle 3-2-1) | [06-plan-sauvegarde-supervision.md](06-plan-sauvegarde-supervision.md#stratégie-de-sauvegarde--règle-3-2-1) |
| INFRA-27 | Tester une restauration | [06-plan-sauvegarde-supervision.md](06-plan-sauvegarde-supervision.md#procédure-de-restauration) |

---

## Epic INFRA-5 — Cloud Azure

| Ticket | Story | Documentation |
|---|---|---|
| INFRA-28 | Déployer Azure App Service | [07-proposition-cloud.md](07-proposition-cloud.md#services-azure-utilisés) |
| INFRA-29 | Configurer Azure PostgreSQL | [07-proposition-cloud.md](07-proposition-cloud.md#2-azure-database-for-postgresql-flexible-server) |
| INFRA-30 | Configurer Azure VPN Gateway | [07-proposition-cloud.md](07-proposition-cloud.md#4-azure-vpn-gateway) |

---

## Epic INFRA-6 — Documentation technique

| Ticket | Story | Documentation |
|---|---|---|
| Documentation complète | Tous les livrables | **Voir tous les fichiers .md de ce dossier** |

**Liste des documents produits :**
- [01-plan-adressage-ip.md](01-plan-adressage-ip.md)
- [02-architecture-reseau.md](02-architecture-reseau.md)
- [03-politique-securite.md](03-politique-securite.md)
- [04-gestion-droits-acces.md](04-gestion-droits-acces.md)
- [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md)
- [06-plan-sauvegarde-supervision.md](06-plan-sauvegarde-supervision.md)
- [07-proposition-cloud.md](07-proposition-cloud.md)
- [08-guide-deploiement.md](08-guide-deploiement.md)
- [09-liste-materiel-budget.md](09-liste-materiel-budget.md)
- [GRILLE-EVALUATION.md](GRILLE-EVALUATION.md)
- [JIRA.md](JIRA.md)

---

## Epic INFRA-7 — Démonstration VMs

| Ticket | Story | Documentation |
|---|---|---|
| INFRA-31 | Créer les VMs sur VirtualBox | [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md) + [08-guide-deploiement.md](08-guide-deploiement.md#phase-1--infrastructure-siège-jour-1) |
| INFRA-32 | Démonstration AD et GPO fonctionnel | [04-gestion-droits-acces.md](04-gestion-droits-acces.md) + [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md#étape-7--créer-les-ou-groupes-et-gpo) |
| INFRA-33 | Simulation réseau Packet Tracer | [02-architecture-reseau.md](02-architecture-reseau.md#instructions-cisco-packet-tracer---simulation-réseau) |
| INFRA-34 | Préparer le script de démo oral | ⚠️ **À créer** (ou improviser à partir des docs) |

---

## Raccourcis rapides

**Pour ton ami qui implémente :**

| Besoin | Va directement ici |
|---|---|
| Je commence par quoi ? | [08-guide-deploiement.md](08-guide-deploiement.md) |
| Quelle IP pour quel VLAN ? | [01-plan-adressage-ip.md](01-plan-adressage-ip.md) |
| Comment installer AD ? | [05-guide-configuration-serveurs.md](05-guide-configuration-serveurs.md#étape-4--installer-et-configurer-active-directory-ds) |
| Quelles règles firewall ? | [03-politique-securite.md](03-politique-securite.md#1-pare-feu-périmètre-pfsense--règles-de-filtrage) |
| Quels groupes AD créer ? | [04-gestion-droits-acces.md](04-gestion-droits-acces.md#groupes-de-sécurité) |
| Comment faire les backups ? | [06-plan-sauvegarde-supervision.md](06-plan-sauvegarde-supervision.md) |
| Quel matériel acheter ? | [09-liste-materiel-budget.md](09-liste-materiel-budget.md) |

---

## Pour l'oral

**Quand tu présentes Jira :**

1. Montre le backlog avec les 7 Epics et les 34 stories
2. Ouvre une story (ex: INFRA-22 "Configurer VPN IPSec")
3. Dis : *"Toute la doc technique est liée ici"*
4. Ouvre **ce fichier** (`MAPPING-JIRA.md`)
5. Clique sur le lien → tu tombes direct sur la section VPN du fichier `03-politique-securite.md`

✅ Ça montre une **traçabilité pro** : ticket ↔ documentation ↔ implémentation
