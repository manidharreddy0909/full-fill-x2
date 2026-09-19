"""
FULFILL-X In-Process Asynchronous EventBus
Provides thread-safe async pub/sub, monotonic sequence numbering, session-filtering,
bounded in-memory replay buffer, and zero-side-effect observational event broadcasting.
Delegates transport operations to EventTransport abstraction (Phase 5).
"""
import asyncio
import logging
from typing import Dict, List, Set, Optional, Callable, Awaitable, Any
from app.schemas.events import EventEnvelope, EventType, EventSeverity

logger = logging.getLogger("fulfillx.realtime.event_bus")


class EventBus:
    def __init__(self, max_replay_per_session: int = 100):
        self._max_replay = max_replay_per_session

    def subscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        """Subscribe an async callback to events for a specific session_id or None for all events."""
        from app.realtime.transport import TransportFactory
        TransportFactory.get_transport().subscribe(session_id, callback)
        logger.debug(f"EventBus subscriber added for session {session_id}")

    def unsubscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        """Unsubscribe a callback."""
        from app.realtime.transport import TransportFactory
        TransportFactory.get_transport().unsubscribe(session_id, callback)

    async def publish(
        self,
        event_type: EventType,
        payload: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        stage: Optional[str] = None,
        source: str = "system",
        severity: EventSeverity = EventSeverity.INFO,
        organization_id: str = "org-fulfillx-default",
        correlation_id: Optional[str] = None,
        causation_id: Optional[str] = None,
        producer: str = "fulfillx-backend",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> EventEnvelope:
        """
        Publish an event envelope.
        Increments session sequence number, buffers in transport, and dispatches to subscribers.
        Zero state mutation on domain repositories.
        """
        from app.realtime.transport import TransportFactory

        payload = payload or {}
        metadata = metadata or {}

        envelope = EventEnvelope(
            event_type=event_type,
            payload=payload,
            organization_id=organization_id,
            session_id=session_id,
            stage=stage,
            source=source,
            severity=severity,
            sequence=0,
            correlation_id=correlation_id,
            causation_id=causation_id,
            producer=producer,
            metadata=metadata,
        )

        # Publish via EventTransport (handles sequence numbering, replay buffer, and dispatching to subscribers)
        transport = TransportFactory.get_transport()
        envelope = await transport.publish(envelope)

        # Dispatch async persistence sink record
        try:
            await self._persist_event(envelope)
        except Exception as err:
            logger.warning(f"Error persisting event sink record: {err}")

        return envelope

    async def _persist_event(self, envelope: EventEnvelope) -> None:
        """Asynchronously record published event into database persistence sink."""
        from app.config import settings
        if settings.PERSISTENCE_MODE != "postgres":
            return
        try:
            from app.db.session import get_async_sessionmaker
            from app.models.db import EventHistoryModel
            async with get_async_sessionmaker()() as session:
                model = EventHistoryModel(
                    event_type=envelope.event_type.value if hasattr(envelope.event_type, "value") else str(envelope.event_type),
                    sequence=envelope.sequence,
                    session_id=envelope.session_id,
                    stage=envelope.stage,
                    source=envelope.source,
                    severity=envelope.severity.value if hasattr(envelope.severity, "value") else str(envelope.severity),
                    payload=envelope.payload or {},
                )
                session.add(model)
                await session.commit()
        except Exception as ex:
            logger.debug(f"Async event persistence sink error: {ex}")

    def publish_sync(
        self,
        event_type: EventType,
        payload: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        stage: Optional[str] = None,
        source: str = "system",
        severity: EventSeverity = EventSeverity.INFO,
    ) -> EventEnvelope:
        """Synchronous wrapper for publish."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.publish(event_type, payload, session_id, stage, source, severity))
        except RuntimeError:
            asyncio.run(self.publish(event_type, payload, session_id, stage, source, severity))
        
        # Build envelope for immediate return if needed
        return EventEnvelope(
            event_type=event_type,
            payload=payload or {},
            session_id=session_id,
            stage=stage,
            source=source,
            severity=severity,
            sequence=0,
        )

    def get_replay_events(
        self,
        session_id: str,
        since_sequence: int = 0,
        max_count: int = 50,
        organization_id: Optional[str] = None,
    ) -> List[EventEnvelope]:
        """Retrieve recent events for session catch-up after reconnect."""
        from app.realtime.transport import TransportFactory
        return TransportFactory.get_transport().get_replay_events(
            session_id=session_id,
            since_sequence=since_sequence,
            max_count=max_count,
            organization_id=organization_id,
        )

    def reset(self) -> None:
        """Reset all subscribers, sequence counters, and replay buffers (for tests)."""
        from app.realtime.transport import TransportFactory
        TransportFactory.reset()


# Global singleton instance
event_bus = EventBus()
