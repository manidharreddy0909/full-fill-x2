# Data Platform Security & Row-Level Tenant Isolation

## 1. Multi-Tenant Row Isolation
All relational ORM tables in `backend/app/models/data_ingestion.py` enforce `organization_id` column indexes. REST API handlers enforce tenant boundary checks against `SecurityContext` extracted from JWT bearer tokens.

---

## 2. RBAC Permission Matrix
Ingestion management operations require explicitly scoped Phase 3 RBAC permissions:
* `Permission.DATA_IMPORT` / `Permission.DATA_INGEST`: Required to trigger live/historical ingestion, change adapter modes, or execute data replays.
* `Permission.DATA_READ`: Required to query observations, signals, quality reports, and entity resolutions.

---

## 3. Untrusted Content Sanitization (Prompt Injection Defense)
External news feeds (RSS summaries, unstructured web text) are wrapped in `<UNTRUSTED_DATA>` XML tags and stripped of executable script/prompt injection patterns prior to forwarding into Specialist Agent context windows.
