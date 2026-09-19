# Prometheus Metrics Specification

## 1. Metric Registry Summary
Exposed at `/metrics` in standard Prometheus text format:

| Metric Name | Type | Description | Bound Labels |
| :--- | :--- | :--- | :--- |
| `http_requests_total` | Counter | Total HTTP requests handled | `method`, `status`, `route` |
| `http_request_duration_seconds` | Summary | Request latency histogram | `method`, `route` |
| `websocket_connections` | Gauge | Active WebSocket connections | `session_group` |
| `events_published_total` | Counter | Total EventBus events published | `event_type`, `transport` |
| `events_consumed_total` | Counter | Total events processed | `event_type` |
| `ingestion_runs_total` | Counter | Real-world ingestion pipeline runs | `source_id` |
| `risk_calculations_total` | Counter | Risk calculation executions | `mode` |
| `agent_runs_total` | Counter | Specialist AI agent executions | `agent_type` |
| `alert_count_total` | Counter | Operational alerts triggered | `severity` |

---

## 2. Cardinality Control
High-cardinality values such as `user_id`, `event_id`, or `request_id` are strictly prohibited as metric label values to prevent Prometheus memory leaks.
