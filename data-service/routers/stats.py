import time
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
import pandas as pd

from database import get_db

router = APIRouter()

_stats_cache: dict = {}
CACHE_TTL = 60


def _cached(key: str, fn, db):
    now = time.time()
    if key in _stats_cache and (now - _stats_cache[key]["ts"]) < CACHE_TTL:
        return _stats_cache[key]["data"]
    result = fn(db)
    _stats_cache[key] = {"data": result, "ts": now}
    return result


@router.get("/marche")
def stats_marche(db: Session = Depends(get_db)):
    """Statistiques générales du marché : prix moyen, médian, nb biens par type/ville."""
    query = text("""
        SELECT "Type", "Ville", "Prix", "Surface", "NbPieces", "Statut"
        FROM "Biens"
        WHERE "Statut" = 0
    """)
    rows = db.execute(query).fetchall()

    if not rows:
        return {"message": "Aucun bien disponible", "data": {}}

    df = pd.DataFrame(rows, columns=["type", "ville", "prix", "surface", "nb_pieces", "statut"])

    return {
        "total_biens": len(df),
        "prix_moyen": round(float(df["prix"].mean()), 2),
        "prix_median": round(float(df["prix"].median()), 2),
        "surface_moyenne": round(float(df["surface"].mean()), 2),
        "par_type": df.groupby("type").agg(
            count=("prix", "count"),
            prix_moyen=("prix", "mean"),
            surface_moyenne=("surface", "mean"),
        ).round(2).to_dict("index"),
        "par_ville": df.groupby("ville").agg(
            count=("prix", "count"),
            prix_moyen=("prix", "mean"),
        ).round(2).to_dict("index"),
    }


@router.get("/ventes")
def stats_ventes(db: Session = Depends(get_db)):
    """Rapports de ventes : volume, chiffre d'affaires, évolution."""
    query = text("""
        SELECT "MontantFinal", "Statut", "DateCreation", "DateFinalisation"
        FROM "Transactions"
    """)
    rows = db.execute(query).fetchall()

    if not rows:
        return {"message": "Aucune transaction", "data": {}}

    df = pd.DataFrame(rows, columns=["montant", "statut", "date_creation", "date_finalisation"])

    finalisees = df[df["statut"] == 2]  # StatutTransaction.Finalisee

    return {
        "total_transactions": len(df),
        "transactions_finalisees": len(finalisees),
        "chiffre_affaires": round(float(finalisees["montant"].sum()), 2),
        "montant_moyen": round(float(finalisees["montant"].mean()), 2) if len(finalisees) > 0 else 0,
        "par_statut": df["statut"].value_counts().to_dict(),
    }


@router.get("/agences")
def stats_agences(db: Session = Depends(get_db)):
    """Performance par agence : nb biens, nb ventes, CA."""
    query = text("""
        SELECT a."Id", a."Nom", a."Ville",
               COUNT(DISTINCT b."Id") as nb_biens,
               COUNT(DISTINCT t."Id") as nb_ventes,
               COALESCE(SUM(t."MontantFinal"), 0) as ca
        FROM "Agences" a
        LEFT JOIN "Biens" b ON b."AgenceId" = a."Id"
        LEFT JOIN "Transactions" t ON t."BienId" = b."Id" AND t."Statut" = 2
        GROUP BY a."Id", a."Nom", a."Ville"
        ORDER BY ca DESC
    """)
    rows = db.execute(query).fetchall()

    return [
        {
            "id": row[0],
            "nom": row[1],
            "ville": row[2],
            "nb_biens": row[3],
            "nb_ventes": row[4],
            "chiffre_affaires": float(row[5]),
        }
        for row in rows
    ]
