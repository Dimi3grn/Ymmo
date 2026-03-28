# Ymmo - Plateforme immobilière

Projet UF Infra & Dev B2 - Plateforme web de gestion d'achat et vente de biens immobiliers pour le groupe Ymmo.

## Architecture

```
fil_rouge/
├── backend/          # API C# ASP.NET Core (port 5062)
├── data-service/     # Microservice Python FastAPI (port 8000)
├── frontend/         # React + TypeScript + Tailwind (port 5173)
└── docs/             # Documentation fonctionnelle & technique
```

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | C# ASP.NET Core Web API + Entity Framework Core |
| Base de données | PostgreSQL |
| Data & Analyse | Python + FastAPI + Pandas + Scikit-learn |
| Frontend | React + TypeScript + Tailwind CSS |
| Auth | JWT (JSON Web Tokens) |

## Lancement

### Prérequis
- .NET 10 SDK
- Node.js 24+
- Python 3.14+
- PostgreSQL 16+

### Backend C#
```bash
cd backend
dotnet ef database update
dotnet run
```

### Microservice Data (Python)
```bash
cd data-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Comptes par défaut

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@ymmo.fr | Admin123! | Admin Siège |

## Fonctionnalités

- Recherche et consultation de biens immobiliers
- Gestion des annonces (CRUD)
- Authentification et gestion des rôles (Client, Agent, Admin Agence, Admin Siège)
- Dashboard analytique avec statistiques de marché
- Prédiction de prix par IA (régression linéaire)
- Identification des zones d'achat intéressantes
- Analyse des tendances du marché
