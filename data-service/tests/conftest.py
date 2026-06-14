"""Test fixtures for the Ymmo data-service.

Spins up an in-memory SQLite database whose schema mirrors the subset of the
Postgres schema the routers query (double-quoted, PascalCase identifiers), seeds
it with deterministic sample data, and overrides the ``get_db`` dependency so the
FastAPI app runs against SQLite instead of Postgres.
"""
import datetime as dt
import os

# Point the module-level engine in database.py at SQLite so importing the app
# never requires the Postgres driver. Set before importing `database` (and
# load_dotenv, which does not override already-set env vars).
os.environ.setdefault("DATABASE_URL", "sqlite://")

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

import database
import main


# ── Schema (mirrors backend EF Core models: enums/bools stored as integers) ──
DDL = [
    """
    CREATE TABLE "Agences" (
        "Id" INTEGER PRIMARY KEY,
        "Nom" TEXT NOT NULL,
        "Ville" TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE "Biens" (
        "Id" INTEGER PRIMARY KEY,
        "Titre" TEXT NOT NULL DEFAULT '',
        "Type" INTEGER NOT NULL,
        "Statut" INTEGER NOT NULL,
        "Prix" NUMERIC NOT NULL,
        "Surface" REAL NOT NULL,
        "NbPieces" INTEGER NOT NULL,
        "NbChambres" INTEGER NOT NULL,
        "Ville" TEXT NOT NULL,
        "CodePostal" TEXT NOT NULL,
        "AnneeConstruction" INTEGER,
        "DPE" TEXT,
        "Ascenseur" INTEGER NOT NULL DEFAULT 0,
        "Parking" INTEGER NOT NULL DEFAULT 0,
        "Balcon" INTEGER NOT NULL DEFAULT 0,
        "Jardin" INTEGER NOT NULL DEFAULT 0,
        "Piscine" INTEGER NOT NULL DEFAULT 0,
        "AgenceId" INTEGER NOT NULL,
        "DateCreation" TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE "RendezVous" (
        "Id" INTEGER PRIMARY KEY,
        "DateHeure" TEXT NOT NULL,
        "Statut" INTEGER NOT NULL,
        "BienId" INTEGER NOT NULL,
        "ClientId" INTEGER NOT NULL,
        "AgentId" INTEGER NOT NULL
    )
    """,
    """
    CREATE TABLE "Transactions" (
        "Id" INTEGER PRIMARY KEY,
        "MontantFinal" NUMERIC NOT NULL,
        "Statut" INTEGER NOT NULL,
        "BienId" INTEGER NOT NULL,
        "DateCreation" TEXT NOT NULL,
        "DateFinalisation" TEXT
    )
    """,
]

# StatutBien: 0 Disponible, 1 SousCompromis, 2 Vendu, 3 Retire
# TypeBien:   0 Appartement, 1 Maison, 2 Terrain, 3 Local, 4 Bureau
# StatutTransaction: 0 EnCours, 1 SousCompromis, 2 Finalisee, 3 Annulee

_AGENCES = [
    (1, "Agence Centrale", "Paris"),
    (2, "Agence Sud", "Lyon"),
]

# (Id, Type, Statut, Prix, Surface, NbPieces, NbChambres, Ville, CP, Annee, DPE,
#  Asc, Park, Balc, Jard, Pisc, AgenceId)
_BIENS = [
    (1, 0, 0, 300000, 60, 3, 2, "Paris", "75011", 1990, "C", 1, 0, 1, 0, 0, 1),
    (2, 0, 0, 450000, 80, 4, 3, "Paris", "75015", 2005, "B", 1, 1, 1, 0, 0, 1),
    (3, 0, 0, 250000, 50, 2, 1, "Paris", "75019", 1970, "D", 0, 0, 0, 0, 0, 1),
    (4, 1, 0, 600000, 120, 5, 4, "Paris", "75016", 2010, "B", 0, 1, 1, 1, 1, 1),
    (5, 0, 0, 180000, 45, 2, 1, "Lyon", "69003", 1985, "E", 0, 1, 0, 0, 0, 2),
    (6, 0, 0, 220000, 65, 3, 2, "Lyon", "69006", 2000, "C", 1, 1, 1, 0, 0, 2),
    (7, 1, 0, 350000, 110, 5, 3, "Lyon", "69008", 2015, "A", 0, 1, 1, 1, 0, 2),
    (8, 0, 0, 200000, 55, 2, 1, "Lyon", "69002", 1995, "D", 1, 0, 1, 0, 0, 2),
    # Vendu (Statut 2) — used by predictions history, excluded from scoring/stats
    (9, 0, 2, 280000, 58, 3, 2, "Paris", "75011", 1990, "C", 1, 0, 1, 0, 0, 1),
    (10, 1, 2, 500000, 115, 5, 4, "Lyon", "69008", 2012, "B", 0, 1, 1, 1, 0, 2),
    # Edge cases: zero surface, retired
    (11, 2, 0, 90000, 0, 0, 0, "Lyon", "69001", None, None, 0, 0, 0, 0, 0, 2),
    (12, 0, 3, 175000, 48, 2, 1, "Paris", "75020", 1980, "E", 0, 0, 0, 0, 0, 1),
]

# (Id, BienId, Statut, ClientId, AgentId) — visits drive demande/popularity
_RDV = [
    (1, 1, 3, 100, 200),
    (2, 1, 0, 101, 200),
    (3, 1, 1, 102, 200),
    (4, 2, 3, 103, 200),
    (5, 4, 0, 104, 200),
    (6, 6, 3, 105, 201),
    (7, 6, 3, 106, 201),
    (8, 7, 0, 107, 201),
]

# (Id, MontantFinal, Statut, BienId, DateFinalisation)
_TX = [
    (1, 285000, 2, 9, "2026-02-10"),
    (2, 495000, 2, 10, "2026-03-05"),
    (3, 310000, 0, 1, None),  # en cours, not counted in CA
]


def _seed(conn):
    for row in _AGENCES:
        conn.execute(
            text('INSERT INTO "Agences" ("Id","Nom","Ville") VALUES (:a,:b,:c)'),
            {"a": row[0], "b": row[1], "c": row[2]},
        )
    base = dt.date(2026, 1, 1)
    for i, b in enumerate(_BIENS):
        conn.execute(
            text(
                'INSERT INTO "Biens" ("Id","Titre","Type","Statut","Prix","Surface",'
                '"NbPieces","NbChambres","Ville","CodePostal","AnneeConstruction","DPE",'
                '"Ascenseur","Parking","Balcon","Jardin","Piscine","AgenceId","DateCreation")'
                ' VALUES (:id,:titre,:type,:statut,:prix,:surface,:pieces,:chambres,'
                ':ville,:cp,:annee,:dpe,:asc,:park,:balc,:jard,:pisc,:ag,:date)'
            ),
            {
                "id": b[0], "titre": f"Bien {b[0]}", "type": b[1], "statut": b[2],
                "prix": b[3], "surface": b[4], "pieces": b[5], "chambres": b[6],
                "ville": b[7], "cp": b[8], "annee": b[9], "dpe": b[10],
                "asc": b[11], "park": b[12], "balc": b[13], "jard": b[14],
                "pisc": b[15], "ag": b[16],
                "date": (base + dt.timedelta(days=i * 10)).isoformat(),
            },
        )
    for r in _RDV:
        conn.execute(
            text(
                'INSERT INTO "RendezVous" ("Id","DateHeure","Statut","BienId","ClientId","AgentId")'
                ' VALUES (:id,:dh,:st,:bien,:cli,:ag)'
            ),
            {"id": r[0], "dh": "2026-04-01T10:00:00", "st": r[2],
             "bien": r[1], "cli": r[3], "ag": r[4]},
        )
    for t in _TX:
        conn.execute(
            text(
                'INSERT INTO "Transactions" ("Id","MontantFinal","Statut","BienId",'
                '"DateCreation","DateFinalisation") VALUES (:id,:m,:st,:bien,:dc,:df)'
            ),
            {"id": t[0], "m": t[1], "st": t[2], "bien": t[3],
             "dc": "2026-01-15", "df": t[4]},
        )


@pytest.fixture()
def db_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    with engine.begin() as conn:
        for stmt in DDL:
            conn.execute(text(stmt))
        _seed(conn)
    yield engine
    engine.dispose()


@pytest.fixture()
def empty_engine():
    """Engine with the schema but no rows — exercises empty-data branches."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    with engine.begin() as conn:
        for stmt in DDL:
            conn.execute(text(stmt))
    yield engine
    engine.dispose()


def _client_for(engine):
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[database.get_db] = override_get_db
    # Clear scoring/stats module-level caches between tests for isolation.
    try:
        from routers import scoring as _scoring
        _scoring._cache.update({"data": None, "ts": 0})
    except Exception:
        pass
    try:
        from routers import stats as _stats
        _stats._stats_cache.clear()
    except Exception:
        pass
    client = TestClient(main.app)
    return client


@pytest.fixture()
def client(db_engine):
    c = _client_for(db_engine)
    yield c
    main.app.dependency_overrides.clear()


@pytest.fixture()
def empty_client(empty_engine):
    c = _client_for(empty_engine)
    yield c
    main.app.dependency_overrides.clear()
