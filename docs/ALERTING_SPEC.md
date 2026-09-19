# Operational Alert Engine Specification

## 1. Operational Rules & Triggers
The `AlertEngine` (`backend/app/services/alerts.py`) evaluates real-time operational conditions:

1. **Consumer Lag**: Triggered when event processing delay exceeds 500ms.
2. **WebSocket Saturation**: Triggered when a client queue reaches 90% capacity (`>900` items).
3. **Data Source Stale**: Triggered when an external feed produces zero observations over 2 refresh cycles.
4. **Critical Risk Event**: Triggered when network health drops below $0.50$ or composite risk score exceeds $0.85$.
5. **Auth Failure Spike**: Triggered when 5+ invalid authentication attempts occur within 1 minute.

---

## 2. Cooldown & Deduplication
Alerts compute SHA256 fingerprints based on `organization_id + source_component + title`. Identical alerts within `ALERT_COOLDOWN_SECONDS` (default: 300s) are suppressed to prevent alert storms.
