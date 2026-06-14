# Ymmo Data Service

Microservice FastAPI d'analyse et de prédiction immobilière. Il lit la base
PostgreSQL partagée (tables créées par le backend C#) et expose des statistiques,
des scores et des prédictions de prix.

En production il n'est joignable que via nginx, qui route trois préfixes vers ce
service : `/api/stats`, `/api/scores`, `/api/predictions`.

## Endpoints

### Statistiques — `/api/stats`
| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/stats/marche` | Prix moyen/médian, surface moyenne, répartition par type et par ville (biens disponibles). |
| GET | `/api/stats/ventes` | Volume de transactions, chiffre d'affaires, répartition par statut (libellés lisibles). |
| GET | `/api/stats/agences` | Performance par agence (nb biens, nb ventes, CA), triée par CA. |
| GET | `/api/stats/populaires?limit=10` | **Biens les plus populaires**, classés par nombre de demandes de visite (rendez-vous non annulés). `limit` ∈ [1, 50]. |

### Scoring — `/api/scores`
| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/scores/biens` | Score composite /10 de chaque bien disponible (qualité/prix 40 %, demande 30 %, prédiction 30 %). Cache 60 s. |
| GET | `/api/scores/bien/{id}` | Détail du score d'un bien (sous-scores + explications). |

### Prédictions — `/api/predictions`
| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/predictions/prix?ville=&surface=&nb_pieces=&type_bien=` | Estimation de prix par régression linéaire + **indicateur de fiabilité**. `surface` > 0, `nb_pieces` ≥ 0. |
| GET | `/api/predictions/fiabilite` | **Métrique de fiabilité globale** du modèle (R², R² validation croisée, RMSE, MAE, couverture villes/types). |
| GET | `/api/predictions/zones-interessantes` | Villes classées par prix/m² croissant. |
| GET | `/api/predictions/tendances` | Évolution mensuelle du prix moyen. |

### Indicateur de fiabilité

`/api/predictions/prix` renvoie, en plus de `prediction`, un objet `fiabilite_detail` :

```json
{
  "score": 41,
  "niveau": "moyenne",
  "echantillon": 20,
  "r2": 0.78,
  "r2_validation_croisee": 0.12,
  "rmse": 145000.0,
  "mae": 98000.0,
  "ville_connue": true,
  "type_connu": true,
  "intervalle_estimation": [205000.0, 495000.0],
  "message": "Estimation basée sur des biens comparables."
}
```

Le score (0–100) combine l'ajustement en échantillon (R²) et un facteur de
généralisation issu de la validation croisée, puis est pénalisé lorsque la ville
ou le type demandé sont absents de l'historique (l'estimation est alors
explicitement signalée comme extrapolée plutôt que renvoyée silencieusement).

## Développement

```bash
cd data-service
python -m venv .venv
.venv/Scripts/activate        # Windows : .venv\Scripts\activate
pip install -r requirements-dev.txt

# Lancer le service (PostgreSQL requis, cf. docker-compose.yml)
uvicorn main:app --reload --port 8000
# Docs interactives : http://localhost:8000/docs
```

### Tests

Les tests tournent contre une base SQLite en mémoire (schéma calqué sur Postgres,
données déterministes) — **aucune base externe n'est nécessaire** :

```bash
cd data-service
pip install -r requirements-dev.txt
pytest
```

## Robustesse

- Les valeurs `NaN`/`Infinity` sont neutralisées avant sérialisation (JSON valide).
- Les colonnes numériques sont converties défensivement (`Prix`, `Surface`, …).
- Les divisions par une surface nulle et les jeux de données vides sont gérés.
- `pool_pre_ping` recycle les connexions PostgreSQL mortes.
