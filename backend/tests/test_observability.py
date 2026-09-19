"""
FULFILL-X Observability, Telemetry & Metrics Unit & REST API Tests (Phase 5)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.metrics import metrics_registry
from app.core.telemetry import redact_sensitive_data, TracingSpan

client = TestClient(app)


def test_sensitive_data_redaction():
    text = "User login with password='SuperSecretPassword123' and Bearer eyJhbGciOiJIUzI1NiJ9.token"
    redacted = redact_sensitive_data(text)
    assert "SuperSecretPassword123" not in redacted
    assert "[REDACTED_SECRET]" in redacted


def test_tracing_span_context():
    with TracingSpan("test-span", correlation_id="corr-999") as span:
        assert span.correlation_id == "corr-999"


def test_metrics_registry():
    metrics_registry.reset()
    metrics_registry.increment("test_requests_total", labels={"route": "/api/test"})
    metrics_registry.observe("test_latency_seconds", 0.045)

    prometheus_text = metrics_registry.generate_prometheus_text()
    assert "test_requests_total" in prometheus_text
    assert 'route="/api/test"' in prometheus_text

    summary = metrics_registry.get_summary_dict()
    assert "counters" in summary
    assert "histograms" in summary


def test_prometheus_metrics_endpoint():
    res = client.get("/api/metrics")
    assert res.status_code == 200
    assert "text/plain" in res.headers["content-type"]


def test_deep_health_endpoint():
    res = client.get("/health/deep")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "healthy"
    assert "event_transport" in body
    assert "websocket_gateway" in body
