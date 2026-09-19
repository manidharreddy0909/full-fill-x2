"""
FULFILL-X Hardened WebSocket Connection Manager Unit Tests (Phase 5)
"""
import pytest
from app.realtime.websocket_manager import WebSocketManager
from app.schemas.events import EventEnvelope, EventType, EventSeverity


@pytest.mark.asyncio
async def test_websocket_manager_stats_and_priority_retention():
    manager = WebSocketManager(max_queue_size=2)
    manager.reset()

    class DummyWebSocket:
        def __init__(self):
            self.sent_messages = []
        async def accept(self): pass
        async def send_json(self, data):
            self.sent_messages.append(data)

    ws = DummyWebSocket()
    await manager.connect(ws, session_id="sess-ws1", organization_id="org-ws1")

    assert manager.active_count() == 1
    assert manager.session_active_count("sess-ws1") == 1

    stats = manager.get_connection_stats()
    assert stats["active_connections"] == 1
    assert stats["session_groups"] == 1

    manager.reset()
    assert manager.active_count() == 0
