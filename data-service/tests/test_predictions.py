"""Tests for the predictions router (incl. the reliability metric)."""


def test_prix_known_city(client):
    data = client.get("/api/predictions/prix?ville=Paris&surface=60&nb_pieces=3&type_bien=Appartement").json()
    assert data["prediction"] is not None
    assert data["prediction"] >= 0
    detail = data["fiabilite_detail"]
    assert detail["ville_connue"] is True
    assert detail["type_connu"] is True
    assert 0 <= detail["score"] <= 100
    assert detail["niveau"] in {"élevée", "moyenne", "faible"}
    assert detail["echantillon"] >= 5
    # Interval brackets the point estimate.
    low, high = detail["intervalle_estimation"]
    assert low <= data["prediction"] <= high


def test_prix_unknown_city_is_flagged(client):
    data = client.get("/api/predictions/prix?ville=Berlin&surface=60&nb_pieces=3").json()
    detail = data["fiabilite_detail"]
    assert detail["ville_connue"] is False
    assert "Berlin" in detail["message"]
    # Unknown city must not claim high reliability.
    assert detail["niveau"] != "élevée"


def test_prix_unknown_type_is_flagged(client):
    data = client.get("/api/predictions/prix?ville=Paris&surface=60&nb_pieces=3&type_bien=Chateau").json()
    assert data["fiabilite_detail"]["type_connu"] is False


def test_prix_input_validation(client):
    # surface must be > 0
    assert client.get("/api/predictions/prix?ville=Paris&surface=0&nb_pieces=3").status_code == 422
    assert client.get("/api/predictions/prix?ville=Paris&surface=-5&nb_pieces=3").status_code == 422
    # nb_pieces must be >= 0
    assert client.get("/api/predictions/prix?ville=Paris&surface=60&nb_pieces=-1").status_code == 422
    # ville required / non-empty
    assert client.get("/api/predictions/prix?surface=60&nb_pieces=3").status_code == 422


def test_prix_insufficient_data(empty_client):
    data = empty_client.get("/api/predictions/prix?ville=Paris&surface=60&nb_pieces=3").json()
    assert data["prediction"] is None
    assert "pas assez" in data["message"].lower()


def test_fiabilite_metric(client):
    data = client.get("/api/predictions/fiabilite").json()
    assert data["suffisant"] is True
    assert 0 <= data["score"] <= 100
    assert data["niveau"] in {"élevée", "moyenne", "faible"}
    assert data["echantillon"] >= 5
    assert data["rmse"] is not None and data["rmse"] >= 0
    assert data["mae"] is not None and data["mae"] >= 0
    assert "Paris" in data["villes_couvertes"]
    assert "Appartement" in data["types_couverts"]


def test_fiabilite_insufficient(empty_client):
    data = empty_client.get("/api/predictions/fiabilite").json()
    assert data["suffisant"] is False
    assert data["echantillon"] == 0


def test_zones_interessantes(client):
    data = client.get("/api/predictions/zones-interessantes").json()
    zones = data["zones"]
    assert len(zones) == 2
    # Sorted ascending by prix/m2; cheapest is "best".
    prix_m2 = [z["prix_m2_moyen"] for z in zones]
    assert prix_m2 == sorted(prix_m2)
    assert data["meilleure_zone"] == zones[0]["ville"]


def test_tendances(client):
    data = client.get("/api/predictions/tendances").json()
    assert data["nb_total_biens"] > 0
    assert isinstance(data["evolution_mensuelle"], list)
    assert len(data["evolution_mensuelle"]) > 0
    assert {"mois", "prix_moyen", "nb_biens"} <= set(data["evolution_mensuelle"][0])
