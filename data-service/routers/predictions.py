from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder

from database import get_db

router = APIRouter()


@router.get("/prix")
def prediction_prix(
    ville: str,
    surface: float,
    nb_pieces: int,
    type_bien: str = "Appartement",
    db: Session = Depends(get_db),
):
    """Prédiction du prix d'un bien basée sur les données historiques."""
    query = text("""
        SELECT "Type", "Ville", "Prix", "Surface", "NbPieces"
        FROM "Biens"
        WHERE "Statut" IN (0, 2)
    """)
    rows = db.execute(query).fetchall()

    if len(rows) < 5:
        return {
            "prediction": None,
            "message": "Pas assez de données pour une prédiction fiable",
        }

    df = pd.DataFrame(rows, columns=["type", "ville", "prix", "surface", "nb_pieces"])

    le_type = LabelEncoder()
    le_ville = LabelEncoder()
    df["type_enc"] = le_type.fit_transform(df["type"])
    df["ville_enc"] = le_ville.fit_transform(df["ville"])

    X = df[["type_enc", "ville_enc", "surface", "nb_pieces"]].values
    y = df["prix"].values.astype(float)

    model = LinearRegression()
    model.fit(X, y)

    try:
        type_enc = le_type.transform([type_bien])[0]
    except ValueError:
        type_enc = 0

    try:
        ville_enc = le_ville.transform([ville])[0]
    except ValueError:
        ville_enc = 0

    features = np.array([[type_enc, ville_enc, surface, nb_pieces]])
    prediction = model.predict(features)[0]

    return {
        "prediction": round(max(0, float(prediction)), 2),
        "ville": ville,
        "surface": surface,
        "nb_pieces": nb_pieces,
        "type_bien": type_bien,
        "fiabilite": f"Basée sur {len(df)} biens",
    }


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
    df["prix_m2"] = df["prix"].astype(float) / df["surface"]

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

    return {
        "zones": zones.to_dict("records"),
        "meilleure_zone": zones.iloc[0]["ville"] if len(zones) > 0 else None,
    }


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
        return {"message": "Aucune donnée disponible"}

    df = pd.DataFrame(rows, columns=["ville", "prix", "surface", "date_creation"])
    df["date_creation"] = pd.to_datetime(df["date_creation"])
    df["mois"] = df["date_creation"].dt.to_period("M").astype(str)

    evolution = (
        df.groupby("mois")
        .agg(
            prix_moyen=("prix", "mean"),
            nb_biens=("prix", "count"),
        )
        .round(2)
        .reset_index()
    )

    return {
        "evolution_mensuelle": evolution.to_dict("records"),
        "nb_total_biens": len(df),
    }
