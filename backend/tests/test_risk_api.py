"""
Integration tests for Signals & Risk REST API endpoints (P03-010 & P03-015)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_and_get_signals():
    res = client.get("/api/signals")
    assert res.status_code == 200
    body = res.json()["data"]
    assert "signals" in body
    assert "total" in body


def test_inject_and_resolve_signal_workflow():
    # 1. Inject signal
    create_req = {
        "type": "GEOPOLITICAL",
        "severity": "HIGH",
        "title": "Strait Canal Route Delay",
        "description": "Navigational bottleneck causing freight slowdowns",
        "confidence": 0.85,
        "region": "APAC",
        "source": "Maritime Intel",
        "affected_node_ids": ["sup-002", "port-002"],
        "affected_edge_ids": ["rt-003"],
    }
    res_inject = client.post("/api/signals", json=create_req)
    assert res_inject.status_code == 201
    sig = res_inject.json()["data"]
    sig_id = sig["id"]
    assert sig["title"] == "Strait Canal Route Delay"

    # 2. Get signal by ID
    res_get = client.get(f"/api/signals/{sig_id}")
    assert res_get.status_code == 200
    assert res_get.json()["data"]["id"] == sig_id

    # 3. Verify risk map reflected injected signal
    res_risk = client.get("/api/risks")
    assert res_risk.status_code == 200
    risk_map = res_risk.json()["data"]
    assert "sup-002" in risk_map["node_risks"]

    # 4. Resolve signal
    res_resolve = client.patch(f"/api/signals/{sig_id}/resolve")
    assert res_resolve.status_code == 200
    assert res_resolve.json()["data"]["status"] == "RESOLVED"


def test_get_risk_map_and_node_risk_detail():
    res = client.get("/api/risks")
    assert res.status_code == 200
    risk_map = res.json()["data"]
    assert "node_risks" in risk_map
    assert "network_health" in risk_map

    res_detail = client.get("/api/risks/nodes/sup-001")
    assert res_detail.status_code == 200
    detail = res_detail.json()["data"]
    assert detail["node_id"] == "sup-001"
    assert "risk_scores" in detail
    assert "explanation" in detail


def test_recalculate_and_reset_risk_endpoints():
    res_recalc = client.post("/api/risks/recalculate")
    assert res_recalc.status_code == 200

    res_reset = client.post("/api/risks/reset")
    assert res_reset.status_code == 200
    assert "data" in res_reset.json()
