"""
Integration tests for AI Provider REST API Endpoints (P04-012, P04-015)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_ai_providers_endpoint():
    response = client.get("/api/ai/providers")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["error"] is None
    assert "data" in json_data
    data = json_data["data"]
    assert "active_provider" in data
    assert len(data["providers"]) >= 4


def test_get_ai_health_endpoint():
    response = client.get("/api/ai/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["error"] is None
    data = json_data["data"]
    assert "status" in data
    assert "active_provider" in data
    assert data["available_count"] >= 1


def test_ai_generate_endpoint():
    payload = {
        "task_type": "SCENARIO_GEN",
        "prompt": "Simulate port closure at port-001",
        "input_context": {"affected_node_ids": ["port-001"]},
        "temperature": 0.2,
    }
    response = client.post("/api/ai/generate", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["error"] is None
    data = json_data["data"]
    assert data["status"] == "SUCCESS"
    assert data["provider"] == "mock"
    assert data["structured_output"] is not None
    assert data["structured_output"]["scenario_name"] == "Synthetic Disruption Overlay"
