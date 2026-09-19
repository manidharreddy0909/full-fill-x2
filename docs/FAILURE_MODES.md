# Realtime & Telemetry Failure Modes Matrix

| Component | Failure Scenario | System Handling / Degradation Behavior | Recoverability |
| :--- | :--- | :--- | :--- |
| **Redis Stream** | Connection Lost / Offline | `RedisEventTransport` degrades gracefully to `InMemoryEventTransport` fallback; zero lost local subscribers. | Automatic reconnection retry on next event publish cycle. |
| **WebSocket Client** | Slow Consumer / Queue Saturation | `WebSocketManager` drops low-priority telemetry events; `CRITICAL` / `HIGH` events are retained. | Queue drains automatically as client processes messages. |
| **Telemetry Exporter**| Logging / Metrics Error | Wrapped in non-fatal exception handles (`TracingSpan`). Business logic execution continues unaffected. | Self-isolated; no impact on core domain API responses. |
| **Event Replay** | Database Connection Error | Replay falls back to in-memory deque buffer (`get_replay_events`). | Database reconnection recovers persistent history. |
