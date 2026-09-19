"""
Integration tests for World REST API endpoints (P02-006 & P02-012)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_system_health_endpoint():
    res = client.get("/api/system/health")
    assert res.status_code == 200
    body = res.json()
    assert body["data"]["status"] == "HEALTHY"
    assert body["data"]["version"] == "0.2.0"


def test_get_world_snapshot_endpoint():
    res = client.get("/api/world")
    assert res.status_code == 200
    body = res.json()
    assert "data" in body
    snapshot = body["data"]
    assert "snapshot_id" in snapshot
    assert len(snapshot["nodes"]) == 23
    assert len(snapshot["edges"]) > 0


def test_get_world_summary_endpoint():
    res = client.get("/api/world/summary")
    assert res.status_code == 200
    body = res.json()
    summary = body["data"]
    assert summary["total_nodes"] == 23
    assert summary["suppliers_count"] == 5
    assert summary["customer_zones_count"] == 10


def test_get_node_by_id_success_and_404():
    res = client.get("/api/world/nodes/sup-001")
    assert res.status_code == 200
    node = res.json()["data"]
    assert node["id"] == "sup-001"
    assert node["name"] == "Apex Electronics"

    res_404 = client.get("/api/world/nodes/non-existent-node")
    assert res_404.status_code == 404


def test_get_edge_by_id_success_and_404():
    res = client.get("/api/world/edges/rt-001")
    assert res.status_code == 200
    edge = res.json()["data"]
    assert edge["id"] == "rt-001"

    res_404 = client.get("/api/world/edges/non-existent-edge")
    assert res_404.status_code == 404


def test_seed_and_reset_world_endpoints():
    # Seed double punch
    res = client.post("/api/world/seed", json={"preset": "double_punch", "seed": 42})
    assert res.status_code == 200
    snapshot = res.json()["data"]
    disrupted_nodes = [n for n in snapshot["nodes"] if n["is_disrupted"]]
    assert len(disrupted_nodes) >= 3

    # Seed healthy
    res_healthy = client.post("/api/world/seed", json={"preset": "healthy", "seed": 42})
    assert res_healthy.status_code == 200
    snapshot_h = res_healthy.json()["data"]
    disrupted_h = [n for n in snapshot_h["nodes"] if n["is_disrupted"]]
    assert len(disrupted_h) == 0
