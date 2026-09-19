"""
FULFILL-X WebSocket Router
Exposes WebSocket endpoints (/ws and /ws/{session_id}) for real-time live operational event streams.
"""
import logging
import json
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.realtime.event_bus import event_bus
from app.realtime.websocket_manager import websocket_manager
from app.schemas.events import (
    ClientWsMessage,
    ClientWsAction,
    EventEnvelope,
    EventType,
    EventSeverity,
)

logger = logging.getLogger("fulfillx.api.websocket")

router = APIRouter(tags=["Real-Time WebSocket"])


@router.websocket("/ws")
async def websocket_global_endpoint(websocket: WebSocket):
    await handle_websocket_connection(websocket, session_id=None)


@router.websocket("/ws/{session_id}")
async def websocket_session_endpoint(websocket: WebSocket, session_id: str):
    await handle_websocket_connection(websocket, session_id=session_id)


async def handle_websocket_connection(websocket: WebSocket, session_id: Optional[str] = None):
    """Handle client connection lifecycle, token authentication, catch-up event replay, and message receiving loop."""
    from app.config import settings
    from app.core.security import JWTManager
    from app.services.auth import AuthService

    # 1. Authenticate Token (Query Param 'token' or Authorization Header)
    token = websocket.query_params.get("token")
    if not token and "authorization" in websocket.headers:
        auth_hdr = websocket.headers["authorization"]
        if auth_hdr.startswith("Bearer "):
            token = auth_hdr[7:].strip()

    org_id = "org-fulfillx-default"
    if token:
        try:
            sec_ctx = AuthService.get_instance().build_security_context_from_token(token)
            org_id = sec_ctx.organization_id
        except Exception as auth_err:
            logger.warning(f"Rejecting WS connection due to invalid token: {auth_err}")
            await websocket.close(code=1008, reason="Authentication failed: invalid token")
            return
    
    # 2. Check max connections limit per session
    if session_id and websocket_manager.session_active_count(session_id) >= settings.WS_MAX_CONNECTIONS_PER_SESSION:
        logger.warning(f"Rejecting WS connection: session {session_id} exceeded max connections ({settings.WS_MAX_CONNECTIONS_PER_SESSION})")
        await websocket.close(code=1008, reason="Max session connection limit exceeded")
        return

    await websocket_manager.connect(websocket, session_id=session_id)

    # Replay catch-up events if session_id is provided, filtered by org_id
    if session_id:
        recent_events = event_bus.get_replay_events(session_id=session_id, since_sequence=0, max_count=50)
        for event in recent_events:
            if hasattr(event, "organization_id") and event.organization_id != org_id and event.organization_id != "org-fulfillx-default":
                continue
            await websocket_manager.send_event(websocket, event)

    try:
        while True:
            raw_text = await websocket.receive_text()
            if not raw_text:
                continue

            if len(raw_text) > 1048576:  # 1MB max message payload
                logger.warning(f"Oversized WebSocket message ({len(raw_text)} bytes) rejected")
                continue

            try:
                msg_dict = json.loads(raw_text)
                client_msg = ClientWsMessage.model_validate(msg_dict)

                if client_msg.action == ClientWsAction.PING:
                    pong_event = EventEnvelope(
                        event_type=EventType.SYSTEM_WARNING,
                        payload={"status": "PONG", "received_at": client_msg.payload.get("timestamp")},
                        session_id=session_id,
                        source="websocket_server",
                        severity=EventSeverity.INFO,
                    )
                    await websocket_manager.send_event(websocket, pong_event)

                elif client_msg.action == ClientWsAction.SUBSCRIBE:
                    target_sub = client_msg.session_id or session_id
                    ack_event = EventEnvelope(
                        event_type=EventType.SYSTEM_WARNING,
                        payload={"status": "SUBSCRIBED", "session_id": target_sub},
                        session_id=target_sub,
                        source="websocket_server",
                        severity=EventSeverity.INFO,
                    )
                    await websocket_manager.send_event(websocket, ack_event)

            except Exception as parse_err:
                logger.warning(f"Invalid client WebSocket message received: {parse_err}")

    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as err:
        logger.error(f"WebSocket loop error: {err}")
        websocket_manager.disconnect(websocket)
