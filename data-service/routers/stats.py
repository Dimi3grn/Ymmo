import time

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
import pandas as pd

from database import get_db
from utils import sanitize, safe_round

router = APIRouter()

_stats_cache: dict = {}
CACHE_TTL = 60

# StatutTransaction: 0 EnCours, 1 SousCompromis, 2 Finalisee, 3 Annulee
STATUT_TRANSACTION_LABELS = {
    0: "EnCours",
    1: "SousCompromis",
    2: "Finalisee",
    3: "Annulee",
}
# StatutRendezVous: 0 Planifie, 1 Confirme, 2 Annule, 3 Effectue
RDV_ANNULE = 2

TYPE_BIEN_LABELS = {
    0: "Appartement",
    1: "Maison",
    2: "Terrain",
    3: "Local",
    4: "Bureau",
}


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
    def _compute(db):
        query = text("""
            SELECT "Type", "Ville", "Prix", "Surface", "NbPieces", "Statut"
            FROM "Biens"
            WHERE "Statut" = 0
        """)
        rows = db.execute(query).fetchall()

        if not rows:
            return {"message": "Aucun bien disponible", "total_biens": 0, "data": {}}

        df = pd.DataFrame(rows, columns=["type", "ville", "prix", "surface", "nb_pieces", "statut"])
        df["prix"] = pd.to_numeric(df["prix"], errors="coerce")
        df["surface"] = pd.to_numeric(df["surface"], errors="coerce")

        par_type = (
            df.groupby("type")
            .agg(count=("prix", "count"), prix_moyen=("prix", "mean"), surface_moyenne=("surface", "mean"))
            .round(2)
            .to_dict("index")
        )
        # Keys are property-type ints; expose as strings (the frontend maps them
        # via a label table keyed by the numeric string).
        par_type = {str(int(k)): v for k, v in par_type.items()}

        par_ville = (
            df.groupby("ville")
            .agg(count=("prix", "count"), prix_moyen=("prix", "mean"))
            .round(2)
            .to_dict("index")
        )

        return sanitize({
            "total_biens": int(len(df)),
            "prix_moyen": safe_round(df["prix"].mean()),
            "prix_median": safe_round(df["prix"].median()),
            "surface_moyenne": safe_round(df["surface"].mean()),
            "par_type": par_type,
            "par_ville": par_ville,
        })

    return _cached("marche", _compute, db)


@router.get("/ventes")
def stats_ventes(db: Session = Depends(get_db)):
    """Rapports de ventes : volume, chiffre d'affaires, évolution."""
    def _compute(db):
        query = text("""
            SELECT "MontantFinal", "Statut", "DateCreation", "DateFinalisation"
            FROM "Transactions"
        """)
        rows = db.execute(query).fetchall()

        if not rows:
            return {"message": "Aucune transaction", "total_transactions": 0, "data": {}}

        df = pd.DataFrame(rows, columns=["montant", "statut", "date_creation", "date_finalisation"])
        df["montant"] = pd.to_numeric(df["montant"], errors="coerce")

        finalisees = df[df["statut"] == 2]  # StatutTransaction.Finalisee

        # Human-readable status breakdown with plain-int counts.
        par_statut = {
            STATUT_TRANSACTION_LABELS.get(int(k), str(int(k))): int(v)
            for k, v in df["statut"].value_counts().items()
        }

        return sanitize({
            "total_transactions": int(len(df)),
            "transactions_finalisees": int(len(finalisees)),
            "chiffre_affaires": safe_round(finalisees["montant"].sum()) or 0,
            "montant_moyen": safe_round(finalisees["montant"].mean()) if len(finalisees) > 0 else 0,
            "par_statut": par_statut,
        })

    return _cached("ventes", _compute, db)


@router.get("/agences")
def stats_agences(db: Session = Depends(get_db)):
    """Performance par agence : nb biens, nb ventes, CA."""
    def _compute(db):
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

        return sanitize([
            {
                "id": int(row[0]),
                "nom": row[1],
                "ville": row[2],
                "nb_biens": int(row[3]),
                "nb_ventes": int(row[4]),
                "chiffre_affaires": safe_round(row[5]) or 0,
            }
            for row in rows
        ])

    return _cached("agences", _compute, db)


@router.get("/populaires")
def biens_populaires(
    limit: int = Query(10, ge=1, le=50, description="Nombre de biens à retourner"),
    db: Session = Depends(get_db),
):
    """Biens les plus populaires, classés par nombre de demandes de visite.

    La popularité = nombre de rendez-vous (hors annulés) sur un bien disponible.
    Les rendez-vous effectués (visites réalisées) sont mis en avant séparément.
    """
    query = text("""
        SELECT b."Id", b."Titre", b."Type", b."Ville", b."CodePostal",
               b."Prix", b."Surface", b."NbPieces",
               COUNT(r."Id") AS nb_visites,
               COALESCE(SUM(CASE WHEN r."Statut" = 3 THEN 1 ELSE 0 END), 0) AS nb_effectuees
        FROM "Biens" b
        LEFT JOIN "RendezVous" r
               ON r."BienId" = b."Id" AND r."Statut" <> :annule
        WHERE b."Statut" = 0
        GROUP BY b."Id", b."Titre", b."Type", b."Ville", b."CodePostal",
                 b."Prix", b."Surface", b."NbPieces"
        ORDER BY nb_visites DESC, b."Prix" ASC
        LIMIT :limit
    """)
    rows = db.execute(query, {"annule": RDV_ANNULE, "limit": limit}).fetchall()

    if not rows:
        return {"message": "Aucun bien disponible", "biens": []}

    biens = []
    for row in rows:
        type_id = int(row[2])
        biens.append({
            "bien_id": int(row[0]),
            "titre": row[1],
            "type": type_id,
            "type_libelle": TYPE_BIEN_LABELS.get(type_id, f"Type {type_id}"),
            "ville": row[3],
            "code_postal": row[4],
            "prix": safe_round(row[5]),
            "surface": safe_round(row[6]),
            "nb_pieces": int(row[7]),
            "nb_visites": int(row[8]),
            "nb_visites_effectuees": int(row[9]),
        })

    return sanitize({
        "total": len(biens),
        "critere": "Nombre de demandes de visite (rendez-vous non annulés)",
        "biens": biens,
    })
