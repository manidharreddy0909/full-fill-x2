# Realtime Gateway Architecture

## 1. WebSocket Gateway Hardening
The WebSocket Manager (`backend/app/realtime/websocket_manager.py`) provides real-time streaming of system events to connected web clients with strict queue limits, backpressure management, and priority retention.

---

## 2. Priority Retention & Backpressure Policy
* **Max Client Queue**: `1000` events per active connection.
* **Critical / High Events**: `CRITICAL` (security, approvals, critical risks) and `HIGH` events are **never dropped**. If a client queue saturates, older low-priority events are discarded from the queue to preserve high-priority delivery.
* **Low / Normal Events**: Routine telemetry events are coalesced or dropped if queue limits are reached.
