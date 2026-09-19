# FULFILL-X — Phase 11: Real-Time Intelligence & Live Operational Event Layer Specification

## 1. Overview & Purpose
Phase 11 transforms FULFILL-X into a **real-time event-driven intelligence system**.
It introduces an in-process asynchronous `EventBus`, a session-filtered `WebSocketManager`, lifecycle event producers across all domain services (`Cockpit`, `Risk`, `Specialists`, `Adversary`, `Planner`, `Verification`), lightweight event replay catch-up, a frontend `RealtimeWebSocketClient`, a Zustand `realtimeStore`, and live reactive updates for 2D/3D visualizations, toast alerts, and the Decision Cockpit.

```text
Domain Services (Cockpit, Risk, Specialists, Adversary, Planner, Verification)
                         ↓
               EventBus.publish_sync() / publish()
                         ↓ (In-Process Pub/Sub + Sequence Numbers + Replay Log)
             WebSocketManager.broadcast_to_session()
                         ↓
          Connected Clients (WS /ws or /ws/{session_id})
                         ↓
          RealtimeWebSocketClient (Frontend Auto-Reconnect & Deduplication)
                         ↓
             RealtimeStore & UI / 2D / 3D / Event Toasts
```

---

## 2. Core Event Architecture & Envelope

Every event published across FULFILL-X follows a strict, versioned envelope format (`EventEnvelope`):

| Field | Type | Description |
|---|---|---|
| `event_id` | `str` | Unique event identifier (`evt-<10-char-hex>`) |
| `event_type` | `EventType` | Enum lifecycle event type |
| `timestamp` | `str` | ISO-8601 UTC timestamp |
| `session_id` | `Optional[str]` | Target decision session ID (if applicable) |
| `stage` | `Optional[str]` | Active workflow stage (`OBSERVING`, `ANALYZING_RISK`, etc.) |
| `source` | `str` | Emitting component (e.g. `CockpitService`, `RiskEngine`, `WebSocketServer`) |
| `severity` | `EventSeverity` | `INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `sequence` | `int` | Monotonically increasing sequence number per session |
| `payload` | `Dict[str, Any]` | Event-specific metric deltas, status details, or finding references |
| `schema_version` | `str` | Default `"1.0.0"` |

---

## 3. Supported Event Types

- **Session & Stage Lifecycle**: `SESSION_CREATED`, `SESSION_STARTED`, `STAGE_STARTED`, `STAGE_COMPLETED`, `STAGE_FAILED`, `SESSION_COMPLETED`
- **Risk Intelligence**: `SIGNAL_DETECTED`, `SIGNAL_FUSED`, `RISK_UPDATED`
- **Specialist Multi-Agent**: `SPECIALIST_STARTED`, `SPECIALIST_COMPLETED`, `SPECIALIST_FAILED`
- **Coordinator Reconciliation**: `COORDINATOR_STARTED`, `COORDINATOR_COMPLETED`
- **Adversary Red-Team**: `ADVERSARY_STARTED`, `ADVERSARY_FINDING`, `ADVERSARY_COMPLETED`
- **Multi-Objective Planner**: `PLANNER_STARTED`, `PLAN_GENERATED`
- **Verification Engine**: `VERIFICATION_STARTED`, `VERIFICATION_COMPLETED`
- **Decision Cockpit & Human Approval**: `DECISION_READY`, `APPROVAL_REQUESTED`, `DECISION_APPROVED`, `DECISION_REJECTED`
- **System Alerts**: `SYSTEM_WARNING`, `SYSTEM_ERROR`

---

## 4. Reconnection & Catch-Up Replay Strategy
1. **Frontend Auto-Reconnect**: Exponential backoff reconnects automatically (`1s`, `2s`, `4s`, `8s`, max `16s`).
2. **Duplicate & Sequence Protection**: The client tracks `lastSequence` and silently drops any frames with `sequence <= lastSequence`.
3. **Catch-Up Replay**: When connecting to `/ws/{session_id}`, the server automatically replays recent events from the in-memory bounded replay buffer (`deque(maxlen=100)`) before streaming live events.
4. **REST Fallback**: If WebSocket connections fail or are blocked, all core features remain 100% operational via standard REST endpoints.

---

## 5. Security & Immutability Rules
- **Observational System**: Publishing events, subscribing to WebSockets, or receiving events **never** mutates authoritative `WorldRepository` or `RiskRepository` state.
- **Client Message Validation**: All incoming WebSocket client messages are validated against `ClientWsMessage`. Clients cannot execute arbitrary backend code or inject fake authoritative domain events.
