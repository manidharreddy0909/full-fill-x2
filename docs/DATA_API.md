# Real-World Data Ingestion REST API Reference

All endpoints are prefixed under `/api/data` and require valid JWT Bearer Authentication (`SecurityContext`).

---

## Endpoint Summary

| Method | Endpoint | Description | Required Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/data/sources` | List all registered data adapters & mode | `Permission.DATA_READ` |
| `POST` | `/api/data/sources/mode` | Set ingestion mode (`LIVE`, `HYBRID`, `OFFLINE`) | `Permission.DATA_IMPORT` |
| `POST` | `/api/data/ingest/run` | Trigger on-demand ingestion cycle | `Permission.DATA_IMPORT` |
| `GET` | `/api/data/observations` | Query normalized external observations | `Permission.DATA_READ` |
| `GET` | `/api/data/signals` | Query validated external signals | `Permission.DATA_READ` |
| `GET` | `/api/data/quality/reports` | Retrieve data quality evaluation reports | `Permission.DATA_READ` |
| `POST` | `/api/data/entity/resolve` | Perform entity resolution for external text/coords | `Permission.DATA_READ` |
| `POST` | `/api/data/replay` | Execute historical data replay run | `Permission.DATA_IMPORT` |
