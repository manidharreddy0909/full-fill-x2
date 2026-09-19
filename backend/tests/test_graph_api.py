"""
Tests for FULFILL-X Graph & Causal API Endpoints (Phase 7)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_graph_snapshot_api():
    response = client.get("/api/graph/snapshot")
    assert response.status_code == 200
    data = response.json()
    assert "snapshot_id" in data
    assert data["node_count"] > 0


def test_get_graph_features_api():
    response = client.get("/api/graph/features")
    assert response.status_code == 200
    data = response.json()
    assert data["schema_version"] == "1.0.0"


def test_predict_node_risk_api():
    response = client.post("/api/gnn/predict?target_node_id=sup-001&horizon_hours=24")
    assert response.status_code == 200
    data = response.json()
    assert data["target_id"] == "sup-001"
    assert "predicted_risk" in data


def test_analyze_propagation_api():
    response = client.post("/api/graph/propagate?origin_node_id=sup-001&max_depth=4")
    assert response.status_code == 200
    data = response.json()
    assert data["origin_node_id"] == "sup-001"


def test_get_causal_hypotheses_api():
    response = client.get("/api/causal/hypotheses?origin_node_id=sup-001")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_run_counterfactual_api():
    payload = {
        "target_node_id": "sup-001",
        "parameter_overrides": {"capacity": 85.0}
    }
    response = client.post("/api/causal/counterfactual", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_node_id"] == "sup-001"
    assert "risk_delta" in data
