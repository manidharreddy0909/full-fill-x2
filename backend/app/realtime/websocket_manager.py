"""
FULFILL-X WebSocket Connection Manager
Handles client connections, session-specific broadcasting, automatic exception recovery,
stale connection cleanup, and integration with EventBus.
"""
import logging
import json
import asyncio
from typing import Dict, Set, Optional, List
from fastapi import WebSocket, WebSocketDisconnect
from app.schemas.events import EventEnvelope, EventType, EventSeverity

logger = logging.getLogger("fulfillx.realtime.websocket_manager")


class WebSocketManager:
    def __init__(self):
        # Global set of all connected sockets
        self._active_connections: Set[WebSocket] = set()
        # Session ID -> set of connected sockets
        self._session_connections: Dict[str, Set[WebSocket]] = {}
        # Socket -> assigned session_id
        self._socket_sessions: Dict[WebSocket, Optional[str]] = {}

    async def connect(self, websocket: WebSocket, session_id: Optional[str] = None) -> None:
        """Accept a WebSocket connection and register session filter."""
        await websocket.accept()
        self._active_connections.add(websocket)
        self._socket_sessions[websocket] = session_id
        
        if session_id:
            if session_id not in self._session_connections:
                self._session_connections[session_id] = set()
            self._session_connections[session_id].add(websocket)

        logger.info(f"WebSocket client connected (Session: {session_id}, Total active: {len(self._active_connections)})")

    def disconnect(self, websocket: WebSocket) -> None:
        """Disconnect and clean up socket registrations."""
        if websocket in self._active_connections:
            self._active_connections.remove(websocket)
        
        session_id = self._socket_sessions.pop(websocket, None)
        if session_id and session_id in self._session_connections:
            self._session_connections[session_id].discard(websocket)
            if not self._session_connections[session_id]:
                del self._session_connections[session_id]

        logger.info(f"WebSocket client disconnected (Session: {session_id}, Total active: {len(self._active_connections)})")

    async def send_event(self, websocket: WebSocket, envelope: EventEnvelope) -> bool:
        """Send an event envelope to a specific WebSocket. Returns True if success, False if failed."""
        try:
            payload_data = envelope.model_dump(mode="json")
            await websocket.send_json(payload_data)
            return True
        except Exception as err:
            logger.warning(f"Failed to send message to WebSocket client: {err}")
            self.disconnect(websocket)
            return False

    async def broadcast(self, envelope: EventEnvelope) -> None:
        """Broadcast event to all connected WebSocket clients."""
        if not self._active_connections:
            return
        
        dead_sockets: List[WebSocket] = []
        for connection in list(self._active_connections):
            success = await self.send_event(connection, envelope)
            if not success:
                dead_sockets.append(connection)

    async def broadcast_to_session(self, session_id: str, envelope: EventEnvelope) -> None:
        """Broadcast event to clients subscribed to a specific session (and global clients)."""
        target_sockets = set()
        
        # Session-specific sockets
        if session_id in self._session_connections:
            target_sockets.update(self._session_connections[session_id])
        
        # Global sockets (sockets connected without a session_id filter)
        for sock, sid in self._socket_sessions.items():
            if sid is None:
                target_sockets.add(sock)

        if not target_sockets:
            return

        for connection in list(target_sockets):
            await self.send_event(connection, envelope)

    def active_count(self) -> int:
        return len(self._active_connections)

    def session_active_count(self, session_id: str) -> int:
        return len(self._session_connections.get(session_id, set()))

    def reset(self) -> None:
        """Reset state for tests."""
        self._active_connections.clear()
        self._session_connections.clear()
        self._socket_sessions.clear()


# Global singleton instance
websocket_manager = WebSocketManager()


def on_event_bus_published(envelope: EventEnvelope) -> None:
    """EventBus subscriber callback that relays published events to WebSockets."""
    try:
        loop = asyncio.get_running_loop()
        if envelope.session_id:
            loop.create_task(websocket_manager.broadcast_to_session(envelope.session_id, envelope))
        else:
            loop.create_task(websocket_manager.broadcast(envelope))
    except RuntimeError:
        pass
