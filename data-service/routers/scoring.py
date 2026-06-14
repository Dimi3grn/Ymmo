import time

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder

from database import get_db
from utils import sanitize, safe_round

router = APIRouter()

_cache: dict = {"data": None, "ts": 0}
CACHE_TTL = 60


def _get_biens_df(db: Session) -> pd.DataFrame:
    query = text("""
        SELECT b."Id", b."Type", b."Ville", b."CodePostal", b."Prix", b."Surface",
               b."NbPieces", b."NbChambres", b."Ascenseur", b."Parking",
               b."Balcon", b."Jardin", b."Piscine", b."DPE", b."Statut",
               b."AnneeConstruction",
               (SELECT COUNT(*) FROM "RendezVous" r WHERE r."BienId" = b."Id") as nb_rdv,
               (SELECT COUNT(*) FROM "Biens" b2 WHERE b2."Ville" = b."Ville" AND b2."Statut" = 0) as offre_ville,
               (SELECT COUNT(*) FROM "RendezVous" r2
                JOIN "Biens" b3 ON r2."BienId" = b3."Id"
                WHERE b3."Ville" = b."Ville") as demande_ville
        FROM "Biens" b
        WHERE b."Statut" = 0
    """)
    rows = db.execute(query).fetchall()
    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows, columns=[
        "id", "type", "ville", "code_postal", "prix", "surface",
        "nb_pieces", "nb_chambres", "ascenseur", "parking",
        "balcon", "jardin", "piscine", "dpe", "statut",
        "annee_construction", "nb_rdv", "offre_ville", "demande_ville"
    ])
    # Numeric coercion so downstream maths never blow up on stray nulls.
    for col in ["prix", "surface", "nb_pieces", "offre_ville", "demande_ville"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["prix"] = df["prix"].fillna(0.0)
    df["surface"] = df["surface"].fillna(0.0)
    for flag in ["ascenseur", "parking", "balcon", "jardin", "piscine"]:
        df[flag] = pd.to_numeric(df[flag], errors="coerce").fillna(0).astype(int)
    return df.reset_index(drop=True)


def _prix_m2(df: pd.DataFrame) -> pd.Series:
    return df["prix"].astype(float) / df["surface"].replace(0, 1)


def _score_qualite_prix(df: pd.DataFrame) -> pd.Series:
    """
    Rapport qualité/prix : compare le prix/m² du bien au prix/m² moyen de sa ville.
    Plus le bien est en dessous de la moyenne = meilleur score.
    Bonus pour les équipements.
    """
    df = df.copy()
    df["prix_m2"] = _prix_m2(df)
    ville_avg = df.groupby("ville")["prix_m2"].transform("mean")

    ratio = (ville_avg - df["prix_m2"]) / ville_avg.replace(0, 1)
    ratio_score = (ratio.clip(-0.5, 0.5) + 0.5) * 6

    equipements = (
        df["ascenseur"].astype(int) +
        df["parking"].astype(int) +
        df["balcon"].astype(int) +
        df["jardin"].astype(int) +
        df["piscine"].astype(int)
    )
    equip_score = equipements / 5 * 4

    return (ratio_score + equip_score).clip(0, 10).fillna(0)


def _score_demande(df: pd.DataFrame) -> pd.Series:
    """
    Score de demande : ratio demande/offre dans la ville.
    Plus il y a de demandes par rapport à l'offre, plus la zone est attractive.
    """
    ratio = df["demande_ville"].astype(float) / df["offre_ville"].replace(0, 1)
    return (ratio * 3).clip(0, 10).fillna(0)


def _score_prediction(df: pd.DataFrame) -> pd.Series:
    """
    Score de prédiction : compare le prix affiché au prix estimé par régression.
    Si le prix estimé > prix affiché → bonne affaire → score élevé.
    """
    if len(df) < 5:
        return pd.Series([5.0] * len(df), index=df.index)

    le_type = LabelEncoder()
    le_ville = LabelEncoder()
    df_copy = df.copy()
    df_copy["type_enc"] = le_type.fit_transform(df_copy["type"].astype(str))
    df_copy["ville_enc"] = le_ville.fit_transform(df_copy["ville"].astype(str))

    features = df_copy[["type_enc", "ville_enc", "surface", "nb_pieces"]].values.astype(float)
    prix = df_copy["prix"].values.astype(float)

    model = LinearRegression()
    model.fit(features, prix)
    predictions = model.predict(features)

    diff_pct = (predictions - prix) / np.clip(prix, 1, None)
    scores = np.clip((np.clip(diff_pct, -0.3, 0.3) + 0.3) / 0.6 * 10, 0, 10)
    return pd.Series(scores, index=df.index).fillna(5.0)


def _compute_all_scores(db: Session):
    """Calcul et mise en cache des scores."""
    now = time.time()
    if _cache["data"] and (now - _cache["ts"]) < CACHE_TTL:
        return _cache["data"]

    df = _get_biens_df(db)
    if df.empty:
        result = {"biens": [], "methode": {}}
        _cache["data"] = result
        _cache["ts"] = now
        return result

    df = df.reset_index(drop=True)
    qp = _score_qualite_prix(df).reset_index(drop=True)
    dem = _score_demande(df).reset_index(drop=True)
    pred = _score_prediction(df).reset_index(drop=True)
    score_total = (qp * 0.4 + dem * 0.3 + pred * 0.3).round(1)

    results = []
    for pos in range(len(df)):
        row = df.iloc[pos]
        results.append({
            "bien_id": int(row["id"]),
            "ville": row["ville"],
            "prix": safe_round(row["prix"]),
            "surface": safe_round(row["surface"]),
            "score_total": safe_round(score_total.iloc[pos], 1),
            "detail": {
                "qualite_prix": safe_round(qp.iloc[pos], 1),
                "demande_zone": safe_round(dem.iloc[pos], 1),
                "prediction": safe_round(pred.iloc[pos], 1),
            }
        })

    results.sort(key=lambda x: (x["score_total"] is not None, x["score_total"]), reverse=True)

    result = sanitize({
        "biens": results,
        "methode": {
            "qualite_prix": "Comparaison prix/m² vs moyenne ville + bonus équipements (40%)",
            "demande_zone": "Ratio demandes de visite / offre disponible dans la ville (30%)",
            "prediction": "Écart entre prix estimé par ML et prix affiché (30%)",
        }
    })
    _cache["data"] = result
    _cache["ts"] = now
    return result


@router.get("/biens")
def score_biens(db: Session = Depends(get_db)):
    """Score composite /10 pour chaque bien disponible (cache 60s)."""
    return _compute_all_scores(db)


@router.get("/bien/{bien_id}")
def score_bien(bien_id: int, db: Session = Depends(get_db)):
    """Score détaillé pour un bien spécifique (utilise le cache)."""
    all_scores = _compute_all_scores(db)
    bien_scores = {b["bien_id"]: b for b in all_scores.get("biens", [])}

    if bien_id not in bien_scores:
        return {"message": "Bien introuvable ou non disponible", "score": None}

    cached = bien_scores[bien_id]

    df = _get_biens_df(db)
    match = df[df["id"] == bien_id]
    if match.empty:
        return {"message": "Bien introuvable ou non disponible", "score": None}
    row = match.iloc[0]

    prix_m2 = float(row["prix"]) / max(float(row["surface"]), 1)
    # Moyenne ville cohérente avec le calcul du score (moyenne des prix/m²).
    ville_df = df[df["ville"] == row["ville"]].copy()
    ville_avg = float(_prix_m2(ville_df).mean()) if not ville_df.empty else prix_m2

    qp_score = cached["detail"]["qualite_prix"]
    dem_score = cached["detail"]["demande_zone"]
    pred_score = cached["detail"]["prediction"]

    return sanitize({
        "bien_id": bien_id,
        "score_total": cached["score_total"],
        "detail": {
            "qualite_prix": {
                "score": qp_score,
                "prix_m2_bien": safe_round(prix_m2),
                "prix_m2_moyen_ville": safe_round(ville_avg),
                "nb_equipements": int(row["ascenseur"]) + int(row["parking"]) + int(row["balcon"]) + int(row["jardin"]) + int(row["piscine"]),
            },
            "demande_zone": {
                "score": dem_score,
                "nb_demandes_ville": int(row["demande_ville"]),
                "nb_biens_ville": int(row["offre_ville"]),
            },
            "prediction": {
                "score": pred_score,
                "interpretation": "Le modèle estime que ce bien est " + (
                    "sous-évalué (bonne affaire)" if (pred_score or 0) > 6
                    else "correctement évalué" if (pred_score or 0) > 4
                    else "au-dessus du marché"
                ),
            }
        }
    })
