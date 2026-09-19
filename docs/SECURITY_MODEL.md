# FULFILL-X — ZERO-TRUST SECURITY MODEL (PHASE 3)

## 1. Core Principles
1. **Never Trust, Always Verify**: Every request must carry a valid cryptographic context or resolve to the default isolated context.
2. **Explicit Data Boundaries**: Multi-tenant data queries MUST be scoped to the caller's `organization_id`.
3. **Defense in Depth**: Security headers (`nosniff`, `DENY`, `1; mode=block`), sliding window rate limiting (120 req/min), and AI prompt injection schema boundaries.

---

## 2. Realtime WebSocket Tenant Scoping
WebSocket connections are verified via JWT token or initial handshake query parameter. Event bus broadens events scoped to `EventEnvelope.organization_id`, ensuring clients only receive events matching their active tenant context.
