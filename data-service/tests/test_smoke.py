"""Characterization smoke tests: hit every endpoint and assert 200 + JSON."""
import pytest

ENDPOINTS = [
    "/api/health",
    "/api/stats/marche",
    "/api/stats/ventes",
    "/api/stats/agences",
    "/api/stats/populaires",
    "/api/predictions/prix?ville=Paris&surface=60&nb_pieces=3",
    "/api/predictions/fiabilite",
    "/api/predictions/zones-interessantes",
    "/api/predictions/tendances",
    "/api/scores/biens",
    "/api/scores/bien/1",
]


@pytest.mark.parametrize("path", ENDPOINTS)
def test_endpoint_returns_json(client, path):
    resp = client.get(path)
    assert resp.status_code == 200, f"{path} -> {resp.status_code}: {resp.text[:300]}"
    # Must be JSON-serializable already (FastAPI encoded it) and parseable.
    resp.json()
    # No invalid JSON tokens (NaN/Infinity) which JSON.parse would reject.
    assert "NaN" not in resp.text and "Infinity" not in resp.text


@pytest.mark.parametrize("path", ENDPOINTS)
def test_endpoint_handles_empty_db(empty_client, path):
    """Every endpoint must degrade gracefully with no data (no 500)."""
    resp = empty_client.get(path)
    assert resp.status_code == 200, f"{path} -> {resp.status_code}: {resp.text[:300]}"
    resp.json()
    assert "NaN" not in resp.text and "Infinity" not in resp.text
