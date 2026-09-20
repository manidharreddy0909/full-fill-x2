# FULFILL-X — OBSERVABILITY EXPLAINED

> **Location**: `backend/app/realtime/` & `backend/app/observability/`  

---

## 1. Realtime Telemetry Architecture
- **WebSocket Route**: `WS /ws`
- **Broadcast Events**: `RISK_SIGNAL_INJECTED`, `DELIBERATION_STARTED`, `AGENT_PROPOSAL_GENERATED`, `ADVERSARY_ATTACK_COMPLETED`, `VERIFICATION_COMPLETED`, `MONTE_CARLO_COMPLETED`, `PLAN_APPROVED`.
- **Trace Logging**: Structured JSON log events with `X-Request-ID` correlation headers for end-to-end auditability.
