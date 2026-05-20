# Mapping grille d'évaluation — Ymmo

---

## INFRA (50% de la note finale)

| Critère | Pondération | Statut | Ce qui couvre ce critère |
|---|---|---|---|
| Concevoir une architecture réseau multi-sites (siège + agences, routage, VLAN, DNS, DHCP, plan IP) | **8** | ✅ Couvert | `02-architecture-reseau.md` (schéma Miro + Packet Tracer), `01-plan-adressage-ip.md` (VLAN 10/20/30, DNS, DHCP, 12 agences) |
| Configurer des serveurs pour différents services (fichiers, DNS, base de données, sauvegarde...) | **5** | ✅ Couvert | `05-guide-configuration-serveurs.md` (AD DS, DNS, DHCP sur WS2022 + Ubuntu pour Docker/PostgreSQL + SRV-BAK-01) |
| Mettre en place un système de gestion des droits d'accès (basée sur les rôles avec AD et GPO) | **3** | ✅ Couvert | `04-gestion-droits-acces.md` (OU AD, groupes, matrice droits, scripts PS, GPO détaillées), `03-politique-securite.md` (GPO Security Baseline + GPO Restrict-Agents) |
| Concevoir une solution cloud hybride ou public (Azure, AWS...) | **5** | ✅ Couvert | `07-proposition-cloud.md` (Azure App Service + PostgreSQL + Blob + VPN Gateway + Azure AD Connect, coûts, plan migration) |
| Choisir et budgétiser une infrastructure physique adaptée | **2** | ✅ Couvert | `09-liste-materiel-budget.md` (BOM complet Dell/Cisco/pfSense, CAPEX 102k€, OPEX 1380€/mois, TCO 3 ans) |
| **Présenter une démonstration avec des VMs** | **10** | ⚠️ À faire | `05-guide-configuration-serveurs.md` (procédure complète pour l'ami), `02-architecture-reseau.md` (config Packet Tracer). **L'ami doit créer : SRV-AD-01 (WS2022) + PC-AGC01 + simulation Packet Tracer** |
| Appliquer une politique de sécurité réseau et systèmes (pare-feu, segmentation, update, backup...) | **3** | ✅ Couvert | `03-politique-securite.md` (règles pfSense, IPSec AES-256, GPO, audit, journalisation), `06-plan-sauvegarde-supervision.md` (Veeam + Zabbix) |

**Score INFRA estimé si démo réalisée : 36/36 critères couverts**

---

## DEV (50% de la note finale)

| Critère | Pondération | Statut | Ce qui couvre ce critère |
|---|---|---|---|
| Concevoir une solution logicielle répondant à un besoin métier | **5** | ✅ Couvert | Application Ymmo complète : gestion biens, clients, agents, transactions, scoring IA |
| **Développer une application fonctionnelle** (Python, Java, C#, PHP) | **10** | ✅ Couvert | C# ASP.NET Core (API REST), Python FastAPI (data/scoring), React/TypeScript (frontend), PostgreSQL |
| Appliquer les bonnes pratiques de développement (SOLID, DRY, KISS) | **3** | ✅ Couvert | Architecture Repository Pattern, interfaces C#, services séparés, code commenté |
| Appliquer les principes de la POO avancée | **3** | ✅ Couvert | Interfaces C#, héritage, générics, classes abstraites, Repository pattern |
| Modéliser une base de données relationnelle | **3** | ✅ Couvert | Modèle EF Core avec relations (Biens, Utilisateurs, Agences, Transactions, RendezVous, PhotosBien) |
| Interroger une base de données relationnelle | **4** | ✅ Couvert | Requêtes LINQ via EF Core C# + SQLAlchemy Python + requêtes stats PostgreSQL |
| Concevoir des interfaces web intuitives centrées sur l'expérience utilisateur | **5** | ✅ Couvert | Design "Louis Vuitton" : hiérarchie visuelle claire, navigation intuitive, UX cohérente |
| Concevoir des interfaces web responsives et accessibles (WCAG, ARIA, W3C) | **3** | ⚠️ Partiel | Responsive ✅ (Tailwind, grille adaptative, vues mobile/desktop). ARIA labels partiels — **à améliorer** |

**Score DEV estimé : 35/36 critères couverts (manque ARIA complet)**

---

## Ce qui est prioritaire à compléter

### Priorité 1 — Démo VMs (INFRA, pondération 10 — le plus important)

C'est le critère avec la plus haute pondération INFRA. L'ami doit :

1. **VirtualBox** → créer VM `SRV-AD-01` (Windows Server 2022)
2. Suivre `05-guide-configuration-serveurs.md` de bout en bout
3. Créer VM `PC-AGC01` (Windows 10/11) et la joindre au domaine
4. Ouvrir **Cisco Packet Tracer** → reproduire la topologie de `02-architecture-reseau.md`
5. Capturer des **screenshots** à montrer pendant l'oral

**Sans la démo VMs, vous perdez 10 points de pondération INFRA.**

---

### Priorité 2 — Accessibilité ARIA (DEV, pondération 3)

Le responsive est fait. Il manque les attributs ARIA pour atteindre le plein score. À ajouter dans le frontend React :

```tsx
// Exemples de ce qui manque dans le frontend
<button aria-label="Voir le détail du bien">...</button>
<nav aria-label="Navigation principale">...</nav>
<main role="main" aria-label="Contenu principal">...</main>
<img src="..." alt="Photo du bien - Appartement T3 Paris" />
<form aria-labelledby="form-title">...</form>
<input aria-required="true" aria-describedby="prix-hint" />
```

Les pages prioritaires à corriger (les plus visibles pour le jury) :
- `BiensPage.tsx` — ajouter `role="list"` sur la grille, `role="listitem"` sur les cartes
- `BienDetailPage.tsx` — ajouter `alt` sur les images, `aria-label` sur les boutons
- `Header/Navigation` — ajouter `aria-current="page"` sur le lien actif
- Formulaires de connexion/inscription — `aria-required`, `aria-describedby`

---

## Récapitulatif pour l'oral

### Points forts à mettre en avant

| Ce que tu montres | Critère(s) couvert(s) |
|---|---|
| Schéma Miro avec les 12 agences, VLANs, VPN | Architecture réseau (8 pts INFRA) |
| Démo live : connexion d'un poste au domaine ymmo.local | Démonstration VMs (10 pts INFRA) |
| Packet Tracer avec tunnel IPSec actif | Architecture + Sécurité (8+3 pts INFRA) |
| Application Ymmo fonctionnelle sur http://localhost | Application fonctionnelle (10 pts DEV) |
| Score /10 sur les biens (Python ML) | Application fonctionnelle + besoin métier |
| Tableau admin : gestion utilisateurs, transactions | POO, bonnes pratiques |
| Code C# montrant interfaces + Repository | SOLID, DRY, POO avancée |
| Dashboard Jira avec sprints complétés | Compétences transverses (gestion projet) |
| Proposition Azure avec coûts et architecture | Cloud hybride (5 pts INFRA) |
| Budget matériel détaillé Dell/Cisco | Budget infrastructure (2 pts INFRA) |
