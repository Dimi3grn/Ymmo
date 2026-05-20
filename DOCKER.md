# Docker — Documentation technique

Ce document explique en détail l'architecture Docker mise en place pour le projet Ymmo.

---

## Vue d'ensemble

L'application est composée de **4 services** orchestrés par Docker Compose :

```
Browser :80
  └── nginx (frontend)
        ├── /api/scores, /api/stats, /api/predictions → data-service:8000
        ├── /api/*                                    → backend:5068
        └── /*                                        → fichiers statiques React

backend:5068  (C# ASP.NET Core)
  └── db:5432

data-service:8000  (Python FastAPI)
  └── db:5432

db:5432  (PostgreSQL 16)
  └── volume postgres_data (persistant)
```

Seul le service `frontend` est exposé publiquement sur le port 80.
Les autres services (`backend`, `data-service`, `db`) communiquent sur le **réseau interne Docker** uniquement.

---

## Structure des fichiers Docker

```
fil_rouge/
├── docker-compose.yml          # Orchestration des 4 services
├── backend/
│   ├── Dockerfile              # Build multi-stage .NET 10
│   └── .dockerignore           # Exclut bin/, obj/ du contexte de build
├── data-service/
│   └── Dockerfile              # Image Python 3.11-slim
└── frontend/
    ├── Dockerfile              # Build multi-stage Node + nginx
    └── nginx.conf              # Reverse proxy + SPA fallback
```

---

## docker-compose.yml — Explication détaillée

### Service `db`

```yaml
db:
  image: postgres:16-alpine
  restart: unless-stopped
  environment:
    POSTGRES_DB: ymmo
    POSTGRES_USER: ymmo
    POSTGRES_PASSWORD: ymmopassword
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ymmo -d ymmo"]
    interval: 5s
    timeout: 5s
    retries: 10
```

**Points clés :**
- `postgres:16-alpine` — image officielle PostgreSQL en version Alpine (légère, ~80 MB vs ~400 MB pour la version complète)
- `restart: unless-stopped` — le service redémarre automatiquement en cas de crash, sauf si arrêté manuellement
- `volumes: postgres_data` — les données sont stockées dans un volume nommé Docker, **persistant entre les `docker compose down`**. Sans ce volume, toutes les données seraient perdues à chaque arrêt.
- `healthcheck` — Docker vérifie que PostgreSQL est prêt à accepter des connexions avant de démarrer les services qui en dépendent. `pg_isready` est l'outil officiel PostgreSQL pour ce test. Sans healthcheck, le backend démarrerait avant que la BDD soit prête et planterait.

---

### Service `backend`

```yaml
backend:
  build: ./backend
  restart: unless-stopped
  depends_on:
    db:
      condition: service_healthy
  environment:
    DATABASE_URL: postgresql://ymmo:ymmopassword@db:5432/ymmo
    Jwt__Key: YmmoSuperSecretKey2025FiLRougeB2InfraDevYnov!
    Jwt__Issuer: YmmoAPI
    Jwt__Audience: YmmoApp
    AllowedOrigins: "http://localhost,http://localhost:80"
    PORT: "5068"
  ports:
    - "5068:5068"
```

**Points clés :**
- `build: ./backend` — Docker construit l'image depuis le `Dockerfile` dans le dossier `backend/`
- `depends_on: condition: service_healthy` — attend que le healthcheck de `db` soit passé avant de démarrer. C'est différent de `depends_on: db` simple qui n'attend que le démarrage du conteneur, pas que PostgreSQL soit opérationnel.
- `DATABASE_URL` — les variables d'environnement **surchargent** les valeurs de `appsettings.json`. En développement local, le backend lit `appsettings.json` (localhost:5432). En Docker, il lit `DATABASE_URL` avec l'hostname `db` (le nom du service Docker, résolu automatiquement par le DNS interne Docker).
- `Jwt__Key` — la notation `__` (double underscore) est la convention ASP.NET Core pour accéder à des clés imbriquées JSON via les variables d'environnement. `Jwt__Key` correspond à `{ "Jwt": { "Key": "..." } }` dans `appsettings.json`.

---

### Service `data-service`

```yaml
data-service:
  build: ./data-service
  restart: unless-stopped
  depends_on:
    db:
      condition: service_healthy
  environment:
    DATABASE_URL: postgresql://ymmo:ymmopassword@db:5432/ymmo
    API_HOST: "0.0.0.0"
    API_PORT: "8000"
  ports:
    - "8000:8000"
```

**Points clés :**
- `API_HOST: "0.0.0.0"` — uvicorn doit écouter sur toutes les interfaces réseau du conteneur (pas juste `localhost`) pour être accessible depuis nginx. `0.0.0.0` signifie "accepte les connexions depuis n'importe quelle interface".
- Le service est exposé sur le port 8000 pour permettre le débogage direct en dev (`http://localhost:8000/docs`), mais en production seul nginx y accède via le réseau interne.

---

### Service `frontend`

```yaml
frontend:
  build: ./frontend
  restart: unless-stopped
  depends_on:
    - backend
    - data-service
  ports:
    - "80:80"
```

**Points clés :**
- C'est le **seul service exposé sur le port 80** — le point d'entrée unique de l'application.
- `depends_on` ici attend juste que les conteneurs soient démarrés (pas de healthcheck), ce qui est suffisant car nginx bufferise les requêtes en attendant que les backends soient disponibles.

---

### Volume nommé

```yaml
volumes:
  postgres_data:
```

La déclaration en bas du fichier crée un **volume nommé géré par Docker**. Contrairement à un bind mount (`./data:/var/lib/postgresql/data`), un volume nommé est géré entièrement par Docker dans son propre espace de stockage. Avantages : portable, pas de problèmes de permissions, sauvegardable avec `docker volume`.

---

## Dockerfiles — Explication détaillée

### backend/Dockerfile — Build multi-stage .NET 10

```dockerfile
# ── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY *.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

# ── Stage 2 : Runtime ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 5068
ENV ASPNETCORE_URLS=http://+:5068

ENTRYPOINT ["dotnet", "YmmoAPI.dll"]
```

**Pourquoi deux stages ?**

Le SDK .NET pèse ~700 MB (compilateur, outils, etc.). Le runtime ASP.NET pèse ~200 MB. En utilisant deux stages :
- Stage 1 (`sdk`) : compile et publie l'application
- Stage 2 (`aspnet`) : ne copie que les fichiers compilés, sans le SDK

**Résultat : l'image finale fait ~200 MB au lieu de ~700 MB.**

**Pourquoi `COPY *.csproj` avant `COPY . .` ?**

Le cache Docker fonctionne couche par couche. Si on copie tout d'un coup, le moindre changement de fichier source invalide le cache du `dotnet restore`, qui re-télécharge tous les packages NuGet (~30s).
En copiant d'abord le `.csproj` seul, le `dotnet restore` n'est re-exécuté que si les dépendances changent. Un simple changement de code ne re-déclenche que le `dotnet publish`.

**backend/.dockerignore**

```
bin/
obj/
*.user
.vs/
```

Le dossier `obj/` contient `project.assets.json` généré par Visual Studio sur Windows avec des chemins absolus locaux (`C:\Program Files\...`). Si ce fichier est copié dans le conteneur Linux, le `dotnet publish` échoue car ces chemins n'existent pas. Le `.dockerignore` l'exclut et force une résolution propre dans le conteneur.

---

### data-service/Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Points clés :**
- `python:3.11-slim` — variante légère de l'image Python sans les outils de build (gcc, make...). Suffisant pour installer les packages binaires pré-compilés de scikit-learn/numpy.
- `--no-cache-dir` — pip ne stocke pas le cache de téléchargement dans l'image, réduisant sa taille.
- Même pattern que le backend : `COPY requirements.txt` avant `COPY . .` pour optimiser le cache Docker.

---

### frontend/Dockerfile — Build multi-stage Node + nginx

```dockerfile
# ── Stage 1 : Build React ─────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2 : Serveur nginx ───────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**Pourquoi deux stages ?**

Node.js et `node_modules` pèsent ~300 MB. La SPA React buildée est juste du HTML/CSS/JS statique (~500 KB). nginx:alpine pèse ~10 MB.

En utilisant deux stages, l'image finale contient uniquement nginx + les fichiers statiques. **Node.js ne se retrouve pas dans l'image de production.**

**`npm ci` vs `npm install`**

`npm ci` (clean install) :
- Installe exactement les versions de `package-lock.json` sans les modifier
- Plus rapide en CI/CD
- Échoue si `package.json` et `package-lock.json` sont désynchronisés

---

### frontend/nginx.conf — Reverse proxy

```nginx
server {
    listen 80;

    # Routes Python — déclarées AVANT /api pour priorité
    location ^~ /api/scores { proxy_pass http://data-service:8000; }
    location ^~ /api/stats { proxy_pass http://data-service:8000; }
    location ^~ /api/predictions { proxy_pass http://data-service:8000; }

    # Routes C#
    location /api { proxy_pass http://backend:5068; }

    # SPA React — fallback sur index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Pourquoi l'ordre des `location` est important ?**

nginx évalue les locations par ordre de priorité. Le préfixe `^~` (caret-tilde) signifie "priorité sur les expressions régulières". Sans `^~`, `/api/scores` pourrait matcher la règle générique `/api` et être envoyé vers le backend C# au lieu du data service Python.

**`try_files $uri $uri/ /index.html`**

C'est le fallback SPA. Quand l'utilisateur accède à `/biens/5` directement :
1. nginx cherche un fichier `/biens/5` → introuvable
2. nginx cherche un dossier `/biens/5/` → introuvable
3. nginx sert `index.html` → React Router prend le relais et affiche la bonne page

Sans ce fallback, une actualisation sur `/biens/5` retournerait une erreur 404.

**Résolution DNS interne Docker**

Les noms `data-service` et `backend` dans nginx.conf sont les noms des services Docker Compose. Docker intègre un serveur DNS interne qui résout ces noms vers les IPs des conteneurs correspondants. C'est transparent et automatique.

---

## Ordre de démarrage

```
1. db          démarre et initialise PostgreSQL
2.             healthcheck pg_isready passe (après ~5s)
3. backend     démarre, exécute db.Database.Migrate() automatiquement
4. data-service démarre, se connecte à PostgreSQL
5. frontend    démarre nginx
```

L'auto-migration dans `Program.cs` (`db.Database.Migrate()`) crée les tables et insère les données de seed (agences, admin) au premier démarrage, sans intervention manuelle.

---

## Commandes utiles

```bash
# Démarrer tout le projet
docker compose up

# Démarrer en arrière-plan
docker compose up -d

# Rebuild et démarrer (après modification du code)
docker compose up --build

# Arrêter sans supprimer les données
docker compose down

# Arrêter ET supprimer la base de données
docker compose down -v

# Voir les logs d'un service
docker compose logs -f backend
docker compose logs -f data-service

# Exécuter une commande dans un conteneur
docker compose exec db psql -U ymmo -d ymmo

# Charger les données de démo (première fois)
docker compose cp reset.sql db:/reset.sql
docker compose exec db psql -U ymmo -d ymmo -f /reset.sql
docker compose cp seed_biens.sql db:/seed_biens.sql
docker compose exec db psql -U ymmo -d ymmo -f /seed_biens.sql
docker compose cp seed_photos.sql db:/seed_photos.sql
docker compose exec db psql -U ymmo -d ymmo -f /seed_photos.sql
docker compose cp seed_agents_clients.sql db:/seed_agents_clients.sql
docker compose exec db psql -U ymmo -d ymmo -f /seed_agents_clients.sql
docker compose cp seed_rdv.sql db:/seed_rdv.sql
docker compose exec db psql -U ymmo -d ymmo -f /seed_rdv.sql

# Purger le cache de build (en cas de corruption)
docker builder prune -af
```

---

## Sécurité réseau

| Service | Accessible depuis l'extérieur | Port exposé |
|---|---|---|
| frontend (nginx) | ✅ Oui | 80 |
| backend (C#) | ✅ Oui (debug) | 5068 |
| data-service (Python) | ✅ Oui (debug) | 8000 |
| db (PostgreSQL) | ✅ Oui (debug) | 5432 |

> En production réelle, seul le port 80 devrait être exposé. Les ports 5068, 8000 et 5432 seraient retirés du `docker-compose.yml` et les services ne seraient accessibles que via le réseau interne Docker.
