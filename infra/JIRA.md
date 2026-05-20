# Guide Jira — Projet INFRA Ymmo

## Création du projet

1. Aller sur [atlassian.com/fr/software/jira](https://www.atlassian.com/fr/software/jira) → **Essai gratuit**
2. Créer un compte (gratuit jusqu'à 10 utilisateurs)
3. `Créer un projet` → **Scrum** → Nom : `Ymmo INFRA` → Clé : `INFRA`

---

## Epics à créer

Dans `Backlog` → `Créer un epic` pour chacun :

| Epic | Couleur | Description |
|---|---|---|
| `INFRA-RESEAU` | Bleu | Architecture et configuration réseau |
| `INFRA-SERVEURS` | Violet | Installation et configuration Windows Server |
| `INFRA-SECURITE` | Rouge | Pare-feu, GPO, politique de sécurité |
| `INFRA-SAUVEGARDE` | Vert | Veeam + Zabbix |
| `INFRA-CLOUD` | Orange | Azure + proposition cloud |
| `INFRA-DOC` | Gris | Documentation technique |
| `INFRA-DEMO` | Jaune | Démonstration VMs + Packet Tracer |

---

## Stories et tâches complètes

### Epic INFRA-RESEAU

| Story | Priorité | Estimation | Assigné à |
|---|---|---|---|
| Valider le plan d'adressage IP (`01-plan-adressage-ip.md`) | Highest | 1h | Toi |
| Créer le schéma réseau sur Miro (`02-architecture-reseau.md`) | High | 2h | Ami implémenteur |
| Configurer les VLANs sur le switch manageable | High | 1h | Ami implémenteur |
| Configurer les règles pare-feu pfSense | High | 2h | Ami implémenteur |
| Configurer les 12 tunnels VPN IPSec sur pfSense | High | 3h | Ami implémenteur |
| Configurer les routeurs agences (Packet Tracer) | Medium | 2h | Ami implémenteur |
| Tester la connectivité siège ↔ Agence 1 | High | 1h | Ami implémenteur |

### Epic INFRA-SERVEURS

| Story | Priorité | Estimation | Assigné à |
|---|---|---|---|
| Installer Windows Server 2022 sur SRV-AD-01 | Highest | 1h | Ami implémenteur |
| Configurer IP fixe sur SRV-AD-01 | High | 30min | Ami implémenteur |
| Installer et configurer AD DS (forêt ymmo.local) | Highest | 1h | Ami implémenteur |
| Configurer DNS intégré AD | High | 30min | Ami implémenteur |
| Configurer DHCP pour VLAN 10 | High | 30min | Ami implémenteur |
| Créer la structure OU (script PowerShell) | High | 1h | Ami implémenteur |
| Créer les groupes de sécurité | High | 30min | Ami implémenteur |
| Créer les comptes utilisateurs de test | Medium | 1h | Ami implémenteur |
| Installer Ubuntu Server sur SRV-WEB-01 | High | 30min | Ami implémenteur |
| Déployer l'application Ymmo via Docker | High | 30min | Ami implémenteur |
| Joindre un poste client Windows au domaine | Medium | 30min | Ami implémenteur |

### Epic INFRA-SECURITE

| Story | Priorité | Estimation | Assigné à |
|---|---|---|---|
| Configurer les règles pfSense (WAN, LAN, VLAN, DMZ) | Highest | 2h | Ami implémenteur |
| Créer et lier la GPO YMMO-Security-Baseline | High | 1h | Ami implémenteur |
| Créer et lier la GPO YMMO-Restrict-Agents | High | 1h | Ami implémenteur |
| Configurer Windows Defender Firewall sur les serveurs | High | 1h | Ami implémenteur |
| Tester le blocage des accès non autorisés | High | 1h | Ami implémenteur |
| Configurer l'audit des connexions (Event Log) | Medium | 30min | Ami implémenteur |
| Configurer les partages réseau avec permissions NTFS | High | 1h | Ami implémenteur |

### Epic INFRA-SAUVEGARDE

| Story | Priorité | Estimation | Assigné à |
|---|---|---|---|
| Installer Veeam Backup & Replication sur SRV-BAK-01 | High | 1h | Ami implémenteur |
| Créer les jobs de sauvegarde (SRV-AD-01 + SRV-WEB-01) | High | 1h | Ami implémenteur |
| Effectuer un premier backup et valider | High | 1h | Ami implémenteur |
| Tester la restauration d'un fichier | High | 30min | Ami implémenteur |
| Installer Zabbix Server sur SRV-BAK-01 | High | 1h | Ami implémenteur |
| Installer Zabbix Agent sur SRV-AD-01 et SRV-WEB-01 | High | 30min | Ami implémenteur |
| Configurer SNMP sur pfSense | Medium | 30min | Ami implémenteur |
| Créer le dashboard "Vue Globale Ymmo" | Medium | 1h | Ami implémenteur |
| Configurer les alertes email Zabbix | Medium | 30min | Ami implémenteur |

### Epic INFRA-CLOUD

| Story | Priorité | Estimation | Assigné à |
|---|---|---|---|
| Créer le compte Azure + Resource Group | Medium | 30min | Toi |
| Créer le compte Azure Blob Storage | Medium | 30min | Toi |
| Configurer la copie Veeam vers Azure Blob | Medium | 1h | Ami implémenteur |
| Créer Azure Database for PostgreSQL (démo) | Low | 30min | Toi |
| Rédiger la proposition cloud (`07-proposition-cloud.md`) | High | 2h | Toi |

### Epic INFRA-DOC

| Story | Priorité | Estimation |
|---|---|---|
| Valider `01-plan-adressage-ip.md` | Highest | Fait ✅ |
| Valider `02-architecture-reseau.md` | Highest | Fait ✅ |
| Valider `03-politique-securite.md` | High | Fait ✅ |
| Valider `04-gestion-droits-acces.md` | High | Fait ✅ |
| Valider `05-guide-configuration-serveurs.md` | High | Fait ✅ |
| Valider `06-plan-sauvegarde-supervision.md` | High | Fait ✅ |
| Valider `07-proposition-cloud.md` | High | Fait ✅ |
| Valider `08-guide-deploiement.md` | High | Fait ✅ |
| Valider `09-liste-materiel-budget.md` | High | Fait ✅ |
| Exporter la doc en PDF pour l'oral | Medium | 1h | Toi |

### Epic INFRA-DEMO

| Story | Priorité | Estimation |
|---|---|---|
| Télécharger ISO Windows Server 2022 + Ubuntu 24.04 | Highest | 1h |
| Installer VirtualBox 7.x | Highest | 30min |
| Créer la VM SRV-AD-01 dans VirtualBox | Highest | 1h |
| Installer et configurer AD DS (démo) | Highest | 2h |
| Créer la VM poste client | High | 1h |
| Joindre le poste client au domaine | High | 30min |
| Télécharger et configurer Cisco Packet Tracer | High | 30min |
| Créer la topologie réseau Packet Tracer (siège + agence) | High | 2h |
| Configurer VPN IPSec dans Packet Tracer | High | 1h |
| Répétition démo orale complète | Highest | 2h |

---

## Configuration des sprints

### Sprint 1 — Semaine 1 — Fondations réseau et serveurs

Stories prioritaires à inclure :
- Valider plan d'adressage IP
- Installer SRV-AD-01
- Configurer AD DS + DNS + DHCP
- Configurer pfSense (règles de base)

**Objectif sprint :** SRV-AD-01 opérationnel, domaine ymmo.local créé

### Sprint 2 — Semaine 2 — VPN, sécurité et démo

Stories prioritaires :
- Configurer les tunnels VPN IPSec (au moins 1 agence en démo)
- Créer les GPOs
- Configurer Packet Tracer
- Joindre un poste client au domaine

**Objectif sprint :** Démo fonctionnelle pour l'oral

### Sprint 3 — Semaine 3 — Sauvegarde, supervision et cloud

Stories prioritaires :
- Installer Veeam + job de backup
- Installer Zabbix + agents
- Azure Blob Storage + copie offsite

**Objectif sprint :** Infrastructure complète, documentation finalisée

---

## Workflow des tickets

```
À faire → En cours → En review → Terminé
```

Pour chaque story :
- **À faire** : Tâche créée, pas encore commencée
- **En cours** : Implémenteur travaille dessus
- **En review** : Tâche terminée, à valider (test ou vérification)
- **Terminé** : Validé, coché dans la checklist du guide de déploiement

---

## Conseils pour l'oral

- Prendre des **screenshots** de Jira montrant l'avancement (burndown chart, stories terminées)
- Montrer le **board Kanban** pendant l'oral pour illustrer la gestion de projet
- Exporter un **rapport de sprint** (Reports → Velocity Chart ou Sprint Report)
- Les reviewers apprécient voir : des tickets réels, des dates, des états réalistes (pas tout en "Terminé" fait la veille)
