# Realtime & Observability Operations Runbook

## 1. System Health Monitoring
Operators can verify deep system health using the `/health/deep` endpoint:

```bash
curl http://localhost:8000/health/deep
```

Expected Output:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "persistence_mode": "postgres",
  "event_transport": { "status": "healthy", "transport_type": "memory" },
  "websocket_gateway": { "active_connections": 3, "total_queue_depth": 0 }
}
```

---

## 2. Acknowledging Active Alerts via API
```bash
curl -X POST http://localhost:8000/api/observability/alerts/acknowledge \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"alert_id": "alt-12345678"}'
```
