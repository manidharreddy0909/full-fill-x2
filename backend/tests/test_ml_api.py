"""
FULFILL-X ML Platform REST API Unit Tests (Phase 6)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ml_status_endpoint():
    res = client.get("/api/ml/status")
    assert res.status_code == 200
    body = res.json()
    assert body["data"]["status"] == "healthy"
    assert "active_models" in body["data"]


def test_list_ml_models_endpoint():
    res = client.get("/api/ml/models")
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body["data"], list)


def test_predict_endpoint():
    res = client.post("/api/ml/predict?entity_id=wh-chicago&task_type=DEMAND_FORECASTING&horizon=24h")
    assert res.status_code == 200
    body = res.json()
    assert body["data"]["entity_id"] == "wh-chicago"
    assert body["data"]["predicted_value"] is not None
