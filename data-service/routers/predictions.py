from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.model_selection import cross_val_score

from database import get_db
from utils import sanitize, safe_round

router = APIRouter()

# Minimum number of historical biens required before we trust a prediction.
MIN_SAMPLES = 5

# The DB stores Type as an integer (EF Core enum); the API speaks human labels.
TYPE_BIEN_LABELS = {
    0: "Appartement", 1: "Maison", 2: "Terrain", 3: "Local", 4: "Bureau",
}
TYPE_LABEL_TO_CODE = {v: k for k, v in TYPE_BIEN_LABELS.items()}


def _load_history(db: Session) -> pd.DataFrame:
    """Biens disponibles ou vendus, utilisés comme historique de prix."""
    query = text("""
        SELECT "Type", "Ville", "Prix", "Surface", "NbPieces"
        FROM "Biens"
        WHERE "Statut" IN (0, 2)
    """)
    rows = db.execute(query).fetchall()
    if not rows:
        return pd.DataFrame(columns=["type", "ville", "prix", "surface", "nb_pieces"])

    df = pd.DataFrame(rows, columns=["type", "ville", "prix", "surface", "nb_pieces"])
    df["prix"] = pd.to_numeric(df["prix"], errors="coerce")
    df["surface"] = pd.to_numeric(df["surface"], errors="coerce")
    df["nb_pieces"] = pd.to_numeric(df["nb_pieces"], errors="coerce")
    # Drop rows we cannot learn from (missing price/features).
    df = df.dropna(subset=["prix", "surface", "nb_pieces"])
    return df


def _train_model(df: pd.DataFrame) -> dict:
    """Entraîne la régression et calcule des métriques de fiabilité.

    Retourne un dict avec le modèle, les encodeurs, les classes connues et des
    indicateurs de fiabilité (R², RMSE, MAE, R² en validation croisée).
    """
    le_type = LabelEncoder()
    le_ville = LabelEncoder()
    df = df.copy()
    df["type"] = pd.to_numeric(df["type"], errors="coerce").fillna(-1).astype(int)
    df["type_enc"] = le_type.fit_transform(df["type"])
    df["ville_enc"] = le_ville.fit_transform(df["ville"].astype(str))

    X = df[["type_enc", "ville_enc", "surface", "nb_pieces"]].values.astype(float)
    y = df["prix"].values.astype(float)

    model = LinearRegression()
    model.fit(X, y)

    preds = model.predict(X)
    n = int(len(df))
    r2 = float(r2_score(y, preds)) if n >= 2 else None
    rmse = float(np.sqrt(np.mean((preds - y) ** 2)))
    mae = float(mean_absolute_error(y, preds))

    # Validation croisée (estimation honnête, hors échantillon) si assez de données.
    cv_r2 = None
    if n >= 10:
        try:
            scores = cross_val_score(LinearRegression(), X, y, cv=min(5, n // 2), scoring="r2")
            cv_r2 = float(np.mean(scores))
        except Exception:
            cv_r2 = None

    # Encodage de repli = ville/type le plus fréquent (moins biaisé que 0).
    fallback_type = int(le_type.transform([df["type"].mode().iloc[0]])[0])
    fallback_ville = int(le_ville.transform([df["ville"].astype(str).mode().iloc[0]])[0])

    return {
        "model": model,
        "le_type": le_type,
        "le_ville": le_ville,
        "known_types": set(le_type.classes_),
        "known_villes": set(le_ville.classes_),
        "fallback_type": fallback_type,
        "fallback_ville": fallback_ville,
        "n": n,
        "r2": r2,
        "cv_r2": cv_r2,
        "rmse": rmse,
        "mae": mae,
        "prix_moyen": float(np.mean(y)),
    }


def _niveau(score: float) -> str:
    if score >= 70:
        return "élevée"
    if score >= 40:
        return "moyenne"
    return "faible"


def _base_quality(trained: dict) -> float:
    """Qualité globale du modèle ∈ [0, 1].

    Combine l'ajustement en échantillon (R²) avec un facteur de généralisation
    déduit de la validation croisée, afin de pénaliser le sur-apprentissage sans
    écraser brutalement le score à zéro.
    """
    r2 = trained["r2"]
    cv = trained["cv_r2"]
    base = max(0.0, min(1.0, r2)) if r2 is not None else 0.3

    if cv is None:
        generalisation = 0.7              # validation croisée indisponible : neutre
    elif cv >= 0:
        generalisation = max(0.0, min(1.0, cv / max(base, 1e-6)))
    else:
        generalisation = 0.25             # généralise mal, mais reste informatif

    quality = base * (0.4 + 0.6 * generalisation)
    if trained["n"] < 10:
        quality *= 0.85
    return max(0.0, min(1.0, quality))


def _reliability_score(trained: dict, ville_connue: bool, type_connu: bool) -> dict:
    """Construit un indicateur de fiabilité 0-100 + niveau lisible."""
    score = _base_quality(trained) * 100.0
    if not ville_connue:
        score *= 0.6
    if not type_connu:
        score *= 0.8

    score = int(round(max(0.0, min(100.0, score))))
    return {"score": score, "niveau": _niveau(score)}


@router.get("/prix")
def prediction_prix(
    ville: str = Query(..., min_length=1),
    surface: float = Query(..., gt=0, le=100000),
    nb_pieces: int = Query(..., ge=0, le=100),
    type_bien: str = Query("Appartement", min_length=1),
    db: Session = Depends(get_db),
):
    """Prédiction du prix d'un bien basée sur les données historiques."""
    df = _load_history(db)

    if len(df) < MIN_SAMPLES:
        return {
            "prediction": None,
            "message": f"Pas assez de données pour une prédiction fiable "
                       f"(minimum {MIN_SAMPLES} biens, {len(df)} disponibles)",
        }

    trained = _train_model(df)

    type_code = TYPE_LABEL_TO_CODE.get(type_bien)
    type_connu = type_code is not None and type_code in trained["known_types"]
    ville_connue = ville in trained["known_villes"]

    type_enc = (int(trained["le_type"].transform([type_code])[0])
                if type_connu else trained["fallback_type"])
    ville_enc = (int(trained["le_ville"].transform([ville])[0])
                 if ville_connue else trained["fallback_ville"])

    features = np.array([[type_enc, ville_enc, surface, nb_pieces]], dtype=float)
    prediction = max(0.0, float(trained["model"].predict(features)[0]))

    fiab = _reliability_score(trained, ville_connue, type_connu)
    rmse = trained["rmse"]
    intervalle = [safe_round(max(0.0, prediction - rmse)), safe_round(prediction + rmse)]

    messages = []
    if not ville_connue:
        messages.append(f"Ville '{ville}' absente de l'historique : estimation extrapolée.")
    if not type_connu:
        messages.append(f"Type '{type_bien}' absent de l'historique : estimation extrapolée.")
    message = " ".join(messages) if messages else "Estimation basée sur des biens comparables."

    return sanitize({
        "prediction": safe_round(prediction),
        "ville": ville,
        "surface": surface,
        "nb_pieces": nb_pieces,
        "type_bien": type_bien,
        "fiabilite": f"Fiabilité {fiab['niveau']} — basée sur {trained['n']} biens",
        "fiabilite_detail": {
            "score": fiab["score"],
            "niveau": fiab["niveau"],
            "echantillon": trained["n"],
            "r2": safe_round(trained["r2"], 3),
            "r2_validation_croisee": safe_round(trained["cv_r2"], 3),
            "rmse": safe_round(rmse),
            "mae": safe_round(trained["mae"]),
            "ville_connue": ville_connue,
            "type_connu": type_connu,
            "intervalle_estimation": intervalle,
            "message": message,
        },
    })


@router.get("/fiabilite")
def fiabilite_modele(db: Session = Depends(get_db)):
    """Métrique de fiabilité globale du modèle de prédiction de prix.

    Expose la qualité du modèle (R², R² validation croisée, RMSE, MAE), la
    taille de l'échantillon et la couverture (villes / types connus).
    """
    df = _load_history(db)
    n = int(len(df))

    if n < MIN_SAMPLES:
        return sanitize({
            "suffisant": False,
            "echantillon": n,
            "minimum_requis": MIN_SAMPLES,
            "message": "Échantillon insuffisant pour évaluer la fiabilité du modèle.",
        })

    trained = _train_model(df)
    score = int(round(_base_quality(trained) * 100))

    return sanitize({
        "suffisant": True,
        "score": score,
        "niveau": _niveau(score),
        "echantillon": n,
        "r2": safe_round(trained["r2"], 3),
        "r2_validation_croisee": safe_round(trained["cv_r2"], 3),
        "rmse": safe_round(trained["rmse"]),
        "mae": safe_round(trained["mae"]),
        "prix_moyen": safe_round(trained["prix_moyen"]),
        "erreur_relative_moyenne": safe_round(
            (trained["mae"] / trained["prix_moyen"]) if trained["prix_moyen"] else None, 3
        ),
        "villes_couvertes": sorted(trained["known_villes"]),
        "types_couverts": sorted(
            TYPE_BIEN_LABELS.get(int(c), str(c)) for c in trained["known_types"]
        ),
        "message": "R² en validation croisée privilégié quand disponible "
                   "(estimation hors échantillon).",
    })


@router.get("/zones-interessantes")
def zones_interessantes(db: Session = Depends(get_db)):
    """Identifier les zones où le prix/m² est le plus intéressant."""
    query = text("""
        SELECT "Ville", "CodePostal", "Prix", "Surface"
        FROM "Biens"
        WHERE "Statut" IN (0, 2) AND "Surface" > 0
    """)
    rows = db.execute(query).fetchall()

    if not rows:
        return {"message": "Aucune donnée disponible", "zones": []}

    df = pd.DataFrame(rows, columns=["ville", "code_postal", "prix", "surface"])
    df["prix"] = pd.to_numeric(df["prix"], errors="coerce")
    df["surface"] = pd.to_numeric(df["surface"], errors="coerce")
    df = df[(df["surface"] > 0) & df["prix"].notna()]

    if df.empty:
        return {"message": "Aucune donnée exploitable", "zones": []}

    df["prix_m2"] = df["prix"] / df["surface"]

    zones = (
        df.groupby("ville")
        .agg(
            prix_m2_moyen=("prix_m2", "mean"),
            nb_biens=("prix", "count"),
            prix_moyen=("prix", "mean"),
        )
        .round(2)
        .sort_values("prix_m2_moyen")
        .reset_index()
    )

    return sanitize({
        "zones": zones.to_dict("records"),
        "meilleure_zone": zones.iloc[0]["ville"] if len(zones) > 0 else None,
    })


@router.get("/tendances")
def tendances_marche(db: Session = Depends(get_db)):
    """Analyse des tendances : évolution des prix dans le temps."""
    query = text("""
        SELECT "Ville", "Prix", "Surface", "DateCreation"
        FROM "Biens"
        ORDER BY "DateCreation"
    """)
    rows = db.execute(query).fetchall()

    if not rows:
        return {"message": "Aucune donnée disponible", "evolution_mensuelle": []}

    df = pd.DataFrame(rows, columns=["ville", "prix", "surface", "date_creation"])
    df["prix"] = pd.to_numeric(df["prix"], errors="coerce")
    df["date_creation"] = pd.to_datetime(df["date_creation"], errors="coerce")
    df = df.dropna(subset=["date_creation", "prix"])

    if df.empty:
        return {"message": "Aucune donnée exploitable", "evolution_mensuelle": []}

    df["mois"] = df["date_creation"].dt.to_period("M").astype(str)

    evolution = (
        df.groupby("mois")
        .agg(prix_moyen=("prix", "mean"), nb_biens=("prix", "count"))
        .round(2)
        .reset_index()
    )

    return sanitize({
        "evolution_mensuelle": evolution.to_dict("records"),
        "nb_total_biens": int(len(df)),
    })
