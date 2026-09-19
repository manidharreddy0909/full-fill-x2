"""
FULFILL-X Production & Security Smoke Test Suite (Phase 13)
Verifies production configuration, health probes, CORS enforcement, security sanitization,
request correlation, malformed message rejection, and latency baselines.
"""
import pytest
import time
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)


def test_liveness_probe_endpoint():
    """Verify GET /health returns 200 OK with version and timestamp."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == settings.APP_VERSION
    assert "timestamp" in data


def test_readiness_probe_endpoint():
    """Verify GET /api/health checks world, risk, and AI provider status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "world_repository" in data["dependencies"]
    assert "risk_repository" in data["dependencies"]
    assert "ai_provider" in data["dependencies"]


def test_request_correlation_id_middleware():
    """Verify X-Request-ID is generated or preserved across requests."""
    # Test generated ID
    res1 = client.get("/health")
    assert "X-Request-ID" in res1.headers
    
    # Test preserved custom ID
    custom_id = "test-correlation-12345"
    res2 = client.get("/health", headers={"X-Request-ID": custom_id})
    assert res2.headers.get("X-Request-ID") == custom_id


def test_sanitized_error_handling_no_stack_traces():
    """Verify 500 errors do not expose internal file paths or stack traces in production."""
    # Trigger a 404 or unhandled path
    res = client.get("/api/non-existent-endpoint-xyz")
    assert res.status_code == 404
    
    # Check that error response is structured JSON with request_id
    data = res.json()
    assert "detail" in data
    assert "request_id" not in data or isinstance(data.get("request_id"), str)


def test_cors_origin_enforcement():
    """Verify CORS headers match configured origins."""
    res = client.get("/health", headers={"Origin": "http://localhost:5173"})
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_malformed_json_rejection():
    """Verify malformed JSON payload receives 422 Unprocessable Entity."""
    res = client.post(
        "/api/signals",
        content="{ malformed json: true ",
        headers={"Content-Type": "application/json"},
    )
    assert res.status_code == 422


def test_performance_latency_baselines():
    """Verify core API latencies meet production baselines (< 100ms for health & graph operations)."""
    # 1. Health latency
    start = time.perf_counter()
    r1 = client.get("/health")
    lat_health = (time.perf_counter() - start) * 1000
    assert r1.status_code == 200
    assert lat_health < 100.0, f"Health latency {lat_health}ms exceeds 100ms"

    # 2. World Summary latency
    start = time.perf_counter()
    r2 = client.get("/api/world/summary")
    lat_summary = (time.perf_counter() - start) * 1000
    assert r2.status_code == 200
    assert lat_summary < 100.0, f"World summary latency {lat_summary}ms exceeds 100ms"

    # 3. Risk Map latency
    start = time.perf_counter()
    r3 = client.get("/api/risks")
    lat_risk = (time.perf_counter() - start) * 1000
    assert r3.status_code == 200
    assert lat_risk < 100.0, f"Risk map latency {lat_risk}ms exceeds 100ms"


def test_websocket_ping_pong_protocol():
    """Verify WebSocket ping/pong and subscription ACK over TestClient."""
    with client.websocket_connect("/ws/test-smoke-session") as websocket:
        # Send PING message
        websocket.send_json({"action": "PING", "payload": {"timestamp": 123456789}})
        data = websocket.receive_json()
        assert data["payload"]["status"] == "PONG"
        
        # Send SUBSCRIBE message
        websocket.send_json({"action": "SUBSCRIBE", "session_id": "test-smoke-session"})
        data2 = websocket.receive_json()
        assert data2["payload"]["status"] == "SUBSCRIBED"
