# Tracing & Correlation Specification

## 1. Trace Context Propagation
End-to-end workflows carry a unique `correlation_id` header (`X-Correlation-ID`) across HTTP requests, event envelopes, agent proposals, and decision approvals.

```text
HTTP Request (X-Correlation-ID: corr-1001)
   ↓
Data Ingestion (EventEnvelope.correlation_id: corr-1001)
   ↓
Risk Engine Calculation (correlation_id: corr-1001)
   ↓
Specialist Agent Proposals (correlation_id: corr-1001)
   ↓
Decision Cockpit Approval (correlation_id: corr-1001)
```

---

## 2. Non-Fatal Isolation
Tracing hooks run in non-fatal context wrappers (`TracingSpan`). A tracing exporter issue will never crash or degrade core business logic or decision processing.
