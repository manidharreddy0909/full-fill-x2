"""
FULFILL-X Hardened Realtime WebSocket Connection Manager (Phase 5)
Handles client connections, session/tenant filtering, backpressure queues, priority retention,
heartbeat tracking, and integration with EventBus.
"""
import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Set, Optional, List, Any
from uuid import uuid4
from fastapi import WebSocket, WebSocketDisconnect

from app.schemas.events import EventEnvelope, EventType, EventSeverity

logger = logging.getLogger("fulfillx.realtime.websocket_manager")


class ConnectionMetadata:
    def __init__(
        self,
        connection_id: str,
        websocket: WebSocket,
        organization_id: str = "org-fulfillx-default",
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        max_queue_size: int = 1000,
    ):
        self.connection_id = connection_id
        self.websocket = websocket
        self.organization_id = organization_id
        self.user_id = user_id
        self.session_id = session_id
        self.connected_at = datetime.now(timezone.utc)
        self.last_ping_at = datetime.now(timezone.utc)
        self.queue: asyncio.Queue = asyncio.Queue(maxsize=max_queue_size)
        self.messages_sent = 0
        self.messages_dropped = 0
        self.send_task: Optional[asyncio.Task] = None


class WebSocketManager:
    def __init__(self, max_queue_size: int = 1000):
        self._max_queue_size = max_queue_size
        self._active_connections: Set[WebSocket] = set()
        self._session_connections: Dict[str, Set[WebSocket]] = {}
        self._socket_sessions: Dict[WebSocket, Optional[str]] = {}
        self._connection_meta: Dict[WebSocket, ConnectionMetadata] = {}
        self._total_events_broadcast = 0
        self._total_events_dropped = 0

    async def connect(
        self,
        websocket: WebSocket,
        session_id: Optional[str] = None,
        organization_id: str = "org-fulfillx-default",
        user_id: Optional[str] = None,
    ) -> None:
        """Accept a WebSocket connection and register session & tenant metadata."""
        await websocket.accept()
        conn_id = f"conn-{uuid4().hex[:10]}"
        meta = ConnectionMetadata(
            connection_id=conn_id,
            websocket=websocket,
            organization_id=organization_id,
            user_id=user_id,
            session_id=session_id,
            max_queue_size=self._max_queue_size,
        )

        self._active_connections.add(websocket)
        self._socket_sessions[websocket] = session_id
        self._connection_meta[websocket] = meta

        if session_id:
            if session_id not in self._session_connections:
                self._session_connections[session_id] = set()
            self._session_connections[session_id].add(websocket)

        # Start async worker queue sender for this client
        meta.send_task = asyncio.create_task(self._queue_sender_loop(meta))

        logger.info(
            f"WebSocket client connected (ID: {conn_id}, Org: {organization_id}, Session: {session_id}, Total: {len(self._active_connections)})"
        )

    def disconnect(self, websocket: WebSocket) -> None:
        """Disconnect and clean up socket registrations and sender tasks."""
        if websocket in self._active_connections:
            self._active_connections.remove(websocket)

        meta = self._connection_meta.pop(websocket, None)
        if meta and meta.send_task:
            meta.send_task.cancel()

        session_id = self._socket_sessions.pop(websocket, None)
        if session_id and session_id in self._session_connections:
            self._session_connections[session_id].discard(websocket)
            if not self._session_connections[session_id]:
                del self._session_connections[session_id]

        logger.info(
            f"WebSocket client disconnected (Session: {session_id}, Total active: {len(self._active_connections)})"
        )

    async def _queue_sender_loop(self, meta: ConnectionMetadata) -> None:
        """Worker task processing queued messages for a single WebSocket connection."""
        try:
            while True:
                envelope = await meta.queue.get()
                try:
                    payload_data = envelope.model_dump(mode="json")
                    await meta.websocket.send_json(payload_data)
                    meta.messages_sent += 1
                except Exception as err:
                    logger.warning(f"Error sending message to connection {meta.connection_id}: {err}")
                    self.disconnect(meta.websocket)
                    break
                finally:
                    meta.queue.task_done()
        except asyncio.CancelledError:
            pass

    async def send_event(self, websocket: WebSocket, envelope: EventEnvelope) -> bool:
        """Enqueue event envelope for sending to client with priority backpressure handling."""
        meta = self._connection_meta.get(websocket)
        if not meta:
            try:
                payload_data = envelope.model_dump(mode="json")
                await websocket.send_json(payload_data)
                return True
            except Exception:
                return False

        # Tenant isolation check
        if (
            hasattr(envelope, "organization_id")
            and envelope.organization_id != meta.organization_id
            and envelope.organization_id != "org-fulfillx-default"
        ):
            return True  # Silently skip cross-tenant event

        # Queue depth backpressure evaluation
        if meta.queue.full():
            # Priority retention: High/Critical severity events drop low-priority items in queue
            if envelope.severity in (EventSeverity.HIGH, EventSeverity.CRITICAL):
                try:
                    # Drop oldest item in queue to make room for critical event
                    meta.queue.get_nowait()
                    meta.queue.task_done()
                    meta.messages_dropped += 1
                    self._total_events_dropped += 1
                except Exception:
                    pass
                meta.queue.put_nowait(envelope)
                self._total_events_broadcast += 1
                return True
            else:
                # Drop routine low-priority telemetry if queue saturation occurs
                meta.messages_dropped += 1
                self._total_events_dropped += 1
                return False

        meta.queue.put_nowait(envelope)
        self._total_events_broadcast += 1
        return True

    async def broadcast(self, envelope: EventEnvelope) -> None:
        """Broadcast event to all active WebSocket connections."""
        if not self._active_connections:
            return
        for connection in list(self._active_connections):
            await self.send_event(connection, envelope)

    async def broadcast_to_session(self, session_id: str, envelope: EventEnvelope) -> None:
        """Broadcast event to clients subscribed to a specific session (and global clients)."""
        target_sockets = set()
        if session_id in self._session_connections:
            target_sockets.update(self._session_connections[session_id])
        for sock, sid in self._socket_sessions.items():
            if sid is None:
                target_sockets.add(sock)

        if not target_sockets:
            return

        for connection in list(target_sockets):
            await self.send_event(connection, envelope)

    def update_heartbeat(self, websocket: WebSocket) -> None:
        """Update last heartbeat timestamp for connection."""
        meta = self._connection_meta.get(websocket)
        if meta:
            meta.last_ping_at = datetime.now(timezone.utc)

    def active_count(self) -> int:
        return len(self._active_connections)

    def session_active_count(self, session_id: str) -> int:
        return len(self._session_connections.get(session_id, set()))

    def get_connection_stats(self) -> Dict[str, Any]:
        """Return metrics on active connections and queue saturation."""
        total_queue_depth = sum(m.queue.qsize() for m in self._connection_meta.values())
        return {
            "active_connections": len(self._active_connections),
            "session_groups": len(self._session_connections),
            "total_broadcast": self._total_events_broadcast,
            "total_dropped": self._total_events_dropped,
            "total_queue_depth": total_queue_depth,
        }

    def reset(self) -> None:
        """Reset state for unit tests."""
        for meta in list(self._connection_meta.values()):
            if meta.send_task:
                meta.send_task.cancel()
        self._active_connections.clear()
        self._session_connections.clear()
        self._socket_sessions.clear()
        self._connection_meta.clear()
        self._total_events_broadcast = 0
        self._total_events_dropped = 0


# Global singleton instance
websocket_manager = WebSocketManager()


async def on_event_bus_published(envelope: EventEnvelope) -> None:
    """EventBus subscriber callback that relays published events to WebSockets."""
    if envelope.session_id:
        await websocket_manager.broadcast_to_session(envelope.session_id, envelope)
    else:
        await websocket_manager.broadcast(envelope)
