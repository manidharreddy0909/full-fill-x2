# Event Replay & Catch-Up Specification

## 1. Replay Semantics
When a WebSocket client reconnects or a session initializes, `get_replay_events` supplies bounded historical events (`since_sequence`) to catch up UI state without missed transitions.

---

## 2. Multi-Tenant Replay Boundary
* **Isolation Rule**: Events with `organization_id != target_org_id` are strictly filtered out of replay buffers.
* **Deterministic Sequence**: Sequence numbers strictly increment per session key, providing monotonic ordering during catch-up.
