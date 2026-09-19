"""
FULFILL-X Real-Time Module
Exports EventBus, WebSocketManager, and registers event bridge.
"""
from app.realtime.event_bus import EventBus, event_bus
from app.realtime.websocket_manager import WebSocketManager, websocket_manager, on_event_bus_published

# Auto-subscribe websocket broadcaster to event_bus
event_bus.subscribe(None, on_event_bus_published)

__all__ = [
    "EventBus",
    "event_bus",
    "WebSocketManager",
    "websocket_manager",
]
