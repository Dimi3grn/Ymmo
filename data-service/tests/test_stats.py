"""Tests for the stats router."""


def test_marche_shape_and_types(client):
    data = client.get("/api/stats/marche").json()
    assert data["total_biens"] == 9  # 9 available biens in the seed (incl. bien 11)
    assert isinstance(data["prix_moyen"], float)
    assert isinstance(data["prix_median"], float)
    # par_type keys are stringified ints (frontend maps them via a label table).
    assert set(data["par_type"]).issubset({"0", "1", "2", "3", "4"})
    for entry in data["par_type"].values():
        assert {"count", "prix_moyen", "surface_moyenne"} <= set(entry)
    assert "Paris" in data["par_ville"] and "Lyon" in data["par_ville"]


def test_marche_only_counts_available(client):
    # Vendu/Retire biens (9, 10, 12) must be excluded.
    data = client.get("/api/stats/marche").json()
    total = sum(v["count"] for v in data["par_ville"].values())
    assert total == data["total_biens"] == 9


def test_ventes_chiffre_affaires(client):
    data = client.get("/api/stats/ventes").json()
    assert data["total_transactions"] == 3
    assert data["transactions_finalisees"] == 2
    assert data["chiffre_affaires"] == 780000.0  # 285000 + 495000
    assert data["montant_moyen"] == 390000.0
    # Readable status labels instead of opaque numeric keys.
    assert "Finalisee" in data["par_statut"]
    assert data["par_statut"]["Finalisee"] == 2


def test_agences_sorted_by_ca(client):
    data = client.get("/api/stats/agences").json()
    assert isinstance(data, list) and len(data) == 2
    cas = [a["chiffre_affaires"] for a in data]
    assert cas == sorted(cas, reverse=True)
    # Lyon agence sold bien 10 (495000) -> ranks first.
    assert data[0]["ville"] == "Lyon"
    assert data[0]["chiffre_affaires"] == 495000.0


def test_populaires_ranking(client):
    data = client.get("/api/stats/populaires").json()
    biens = data["biens"]
    assert len(biens) > 0
    # bien 1 has 3 RDV, 2 of which not cancelled (statuts 3,0,1 -> all non-annule = 3).
    top = biens[0]
    assert top["bien_id"] == 1
    assert top["nb_visites"] == 3
    assert top["type_libelle"] == "Appartement"
    # Sorted by nb_visites desc.
    visites = [b["nb_visites"] for b in biens]
    assert visites == sorted(visites, reverse=True)


def test_populaires_excludes_cancelled_and_unavailable(client):
    data = client.get("/api/stats/populaires?limit=50").json()
    ids = {b["bien_id"] for b in data["biens"]}
    # Vendu/Retire biens never appear.
    assert 9 not in ids and 10 not in ids and 12 not in ids
    # bien 2 had one RDV (statut 3) -> 1 visit counted.
    b2 = next(b for b in data["biens"] if b["bien_id"] == 2)
    assert b2["nb_visites"] == 1


def test_populaires_limit_param(client):
    data = client.get("/api/stats/populaires?limit=2").json()
    assert len(data["biens"]) == 2


def test_populaires_limit_validation(client):
    assert client.get("/api/stats/populaires?limit=0").status_code == 422
    assert client.get("/api/stats/populaires?limit=999").status_code == 422
