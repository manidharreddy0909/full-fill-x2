# Event Schema & Versioning Specification

## 1. Hardened Event Envelope
All operational events emitted across FULFILL-X follow the strongly typed `EventEnvelope` schema (`backend/app/schemas/events.py`):

```json
{
  "event_id": "evt-7a8b9c0d",
  "event_type": "RISK_UPDATED",
  "timestamp": "2026-09-20T02:38:21.000Z",
  "organization_id": "org-fulfillx-default",
  "session_id": "sess-demo-05",
  "stage": "RISK_FUSION",
  "source": "risk_service",
  "severity": "HIGH",
  "sequence": 42,
  "correlation_id": "corr-req-1029",
  "causation_id": "evt-7a8b9c0c",
  "producer": "fulfillx-backend",
  "payload": {
    "node_id": "sup-001",
    "risk_score": 0.82
  },
  "metadata": {},
  "schema_version": "1.0.0"
}
```

---

## 2. Event Versioning Protocol
* **Major Version (v1.0.0 -> v2.0.0)**: Breaking schema payload change. Consumers enforce compatibility checks.
* **Minor Version (v1.0.0 -> v1.1.0)**: Non-breaking field additions. Replay engine parses earlier event versions safely without error.
