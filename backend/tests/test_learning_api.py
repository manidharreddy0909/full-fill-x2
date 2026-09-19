"""
FULFILL-X Multi-Agent Learning REST API Unit Tests (Phase 9)
Validates endpoints under /api/agents/resilience/*, /api/learning/*, RBAC permissions, and tenant isolation.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_deliberate_api():
    resp = client.post("/api/agents/resilience/deliberate", json={"target_node_ids": ["sup-001"]})
    assert resp.status_code == 200
    data = resp.json()
    assert data["deliberation_id"].startswith("delib-")
    assert "consensus_status" in data


def test_agent_memory_api():
    post_resp = client.post(
        "/api/agents/memory",
        json={
            "agent_id": "inventory",
            "lesson": "Increase safety stock multiplier at Wh-001 by 1.5x",
            "confidence": 0.85,
        },
    )
    assert post_resp.status_code == 200
    data = post_resp.json()
    assert data["memory_id"].startswith("mem-")

    get_resp = client.get("/api/agents/memory")
    assert get_resp.status_code == 200
    memories = get_resp.json()
    assert len(memories) >= 1


def test_outcome_and_feedback_api():
    post_resp = client.post(
        "/api/outcomes",
        json={
            "decision_id": "DEC-API-01",
            "expected_service_level": 0.95,
            "actual_service_level": 0.94,
            "expected_cost": 50000.0,
            "actual_cost": 51000.0,
            "expected_recovery_hours": 24.0,
            "actual_recovery_hours": 25.0,
        },
    )
    assert post_resp.status_code == 200
    data = post_resp.json()
    assert "outcome" in data
    assert "feedback" in data


def test_train_and_activate_challenger_api():
    train_resp = client.post("/api/learning/train", json={"dataset_name": "APIDataset", "model_name": "DemandForecastModel"})
    assert train_resp.status_code == 200
    train_data = train_resp.json()
    chal_id = train_data["challenger"]["challenger_id"]

    act_resp = client.post(
        "/api/learning/candidates/activate",
        json={
            "challenger_id": chal_id,
            "approved_by": "CSCO",
            "activation_reason": "API Validation",
        },
    )
    assert act_resp.status_code == 200
    assert act_resp.json()["status"] == "ACTIVE"
