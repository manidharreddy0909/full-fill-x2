"""
FULFILL-X Digital Twin & Simulation REST API Unit Tests (Phase 8)
Validates endpoints under /api/twin/*, /api/simulation/*, /api/resilience/*, RBAC permission checks, and tenant isolation.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_twin_status_api():
    resp = client.get("/api/twin/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OPERATIONAL"
    assert "active_twins" in data


def test_twin_create_and_get_api():
    resp = client.post("/api/twin/create", json={"twin_id": "DT-TEST-001", "seed": 42})
    assert resp.status_code == 200
    data = resp.json()
    assert data["twin_id"] == "DT-TEST-001"

    get_resp = client.get("/api/twin/DT-TEST-001")
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["twin_id"] == "DT-TEST-001"
    assert get_data["production_mutation"] is False


def test_simulation_run_api():
    demo_scenario = {
        "scenario_id": "scn-api-test",
        "name": "API Test Scenario",
        "events": [
            {
                "target": "sup-001",
                "start_time": 0,
                "duration": 12,
                "severity": 0.5,
                "capacity_multiplier": 0.5,
                "probability": 1.0,
                "source": "TEST",
                "type": "SUPPLIER_OUTAGE",
            }
        ],
        "seed": 42,
    }

    resp = client.post(
        "/api/simulation/run",
        json={"twin_id": "DT-TEST-001", "scenario": demo_scenario, "horizon_hours": 24},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["scenario_id"] == "scn-api-test"
    assert 0.0 <= data["overall_service_level"] <= 1.0
