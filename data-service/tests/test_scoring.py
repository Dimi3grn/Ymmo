"""Tests for the scoring router."""


def test_score_biens_list(client):
    data = client.get("/api/scores/biens").json()
    biens = data["biens"]
    # Only available biens (9 in the seed) are scored.
    assert len(biens) == 9
    for b in biens:
        assert 0 <= b["score_total"] <= 10
        for k in ("qualite_prix", "demande_zone", "prediction"):
            assert 0 <= b["detail"][k] <= 10
    # Sorted by score desc.
    scores = [b["score_total"] for b in biens]
    assert scores == sorted(scores, reverse=True)
    assert "methode" in data


def test_score_bien_detail(client):
    data = client.get("/api/scores/bien/1").json()
    assert data["bien_id"] == 1
    assert 0 <= data["score_total"] <= 10
    qp = data["detail"]["qualite_prix"]
    assert qp["prix_m2_bien"] > 0
    assert qp["prix_m2_moyen_ville"] > 0
    assert qp["nb_equipements"] == 2  # bien 1: ascenseur + balcon
    dem = data["detail"]["demande_zone"]
    assert dem["nb_biens_ville"] == 4  # available Paris biens: 1,2,3,4
    assert "interpretation" in data["detail"]["prediction"]


def test_score_bien_detail_consistent_with_list(client):
    """The per-bien detail score must match the composite list score."""
    list_data = client.get("/api/scores/biens").json()
    by_id = {b["bien_id"]: b for b in list_data["biens"]}
    detail = client.get("/api/scores/bien/1").json()
    assert detail["score_total"] == by_id[1]["score_total"]
    assert detail["detail"]["qualite_prix"]["score"] == by_id[1]["detail"]["qualite_prix"]


def test_score_bien_not_found(client):
    data = client.get("/api/scores/bien/9999").json()
    assert data["score"] is None
    assert "introuvable" in data["message"].lower()


def test_score_bien_unavailable(client):
    # bien 9 is Vendu -> not scored -> treated as not found.
    data = client.get("/api/scores/bien/9").json()
    assert data["score"] is None


def test_scores_empty_db(empty_client):
    data = empty_client.get("/api/scores/biens").json()
    assert data["biens"] == []
