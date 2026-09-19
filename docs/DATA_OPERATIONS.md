# Data Platform Operations Runbook

## 1. Monitoring Ingestion Health
* **Health Endpoint**: `GET /api/data/sources` returns adapter health statuses (`HEALTHY`, `DEGRADED`, `OFFLINE`).
* **Background Scheduler**: Managed by `IngestionScheduler` (`backend/app/services/scheduler.py`).

---

## 2. Troubleshooting & Common Actions

### Forcing Ingestion Cycle
```bash
curl -X POST http://localhost:8000/api/data/ingest/run \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mode": "LIVE"}'
```

### Switching to Offline Deterministic Mode
```bash
curl -X POST http://localhost:8000/api/data/sources/mode \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mode": "OFFLINE"}'
```
