"""
FULFILL-X In-Process Asynchronous EventBus
Provides thread-safe async pub/sub, monotonic sequence numbering, session-filtering,
bounded in-memory replay buffer, and zero-side-effect observational event broadcasting.
"""
import asyncio
import logging
from collections import deque, defaultdict
from typing import Dict, List, Set, Optional, Callable, Awaitable, Any
from app.schemas.events import EventEnvelope, EventType, EventSeverity

logger = logging.getLogger("fulfillx.realtime.event_bus")


class EventBus:
    def __init__(self, max_replay_per_session: int = 100):
        self._max_replay = max_replay_per_session
        # Subscribers: session_id -> Set[Callable[[EventEnvelope], Awaitable[None]]]
        # Key None represents global subscribers interested in all sessions
        self._subscribers: Dict[Optional[str], Set[Callable[[EventEnvelope], Awaitable[None]]]] = defaultdict(set)
        # Sequence counter per session (and 'global' for non-session events)
        self._sequences: Dict[str, int] = defaultdict(int)
        # Bounded replay buffers per session_id
        self._replay_buffers: Dict[str, deque] = defaultdict(lambda: deque(maxlen=self._max_replay))
        self._lock = asyncio.Lock()

    def subscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        """Subscribe an async callback to events for a specific session_id or None for all events."""
        self._subscribers[session_id].add(callback)
        logger.debug(f"EventBus subscriber added for session {session_id}")

    def unsubscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        """Unsubscribe a callback."""
        if session_id in self._subscribers:
            self._subscribers[session_id].discard(callback)
            if not self._subscribers[session_id]:
                del self._subscribers[session_id]

    async def publish(
        self,
        event_type: EventType,
        payload: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        stage: Optional[str] = None,
        source: str = "system",
        severity: EventSeverity = EventSeverity.INFO,
    ) -> EventEnvelope:
        """
        Publish an event envelope.
        Increments session sequence number, buffers in memory, and dispatches to subscribers.
        Zero state mutation on domain repositories.
        """
        payload = payload or {}
        seq_key = session_id or "global"
        
        async with self._lock:
            self._sequences[seq_key] += 1
            sequence_num = self._sequences[seq_key]

        envelope = EventEnvelope(
            event_type=event_type,
            payload=payload,
            session_id=session_id,
            stage=stage,
            source=source,
            severity=severity,
            sequence=sequence_num,
        )

        # Buffer for replay if session_id exists
        if session_id:
            self._replay_buffers[session_id].append(envelope)

        # Determine target callbacks (session-specific + global)
        target_callbacks = set(self._subscribers.get(session_id, set()))
        if session_id is not None:
            target_callbacks.update(self._subscribers.get(None, set()))

        # Notify subscribers
        for callback in target_callbacks:
            try:
                res = callback(envelope)
                if asyncio.iscoroutine(res):
                    await res
            except Exception as err:
                logger.error(f"Error in EventBus callback subscriber: {err}", exc_info=True)

        return envelope

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
        seq_key = session_id or "global"
        return EventEnvelope(
            event_type=event_type,
            payload=payload or {},
            session_id=session_id,
            stage=stage,
            source=source,
            severity=severity,
            sequence=self._sequences.get(seq_key, 0),
        )

    def get_replay_events(
        self,
        session_id: str,
        since_sequence: int = 0,
        max_count: int = 50,
    ) -> List[EventEnvelope]:
        """Retrieve recent events for session catch-up after reconnect."""
        if session_id not in self._replay_buffers:
            return []
        
        buffer = self._replay_buffers[session_id]
        events = [evt for evt in buffer if evt.sequence > since_sequence]
        return events[-max_count:]

    def reset(self) -> None:
        """Reset all subscribers, sequence counters, and replay buffers (for tests)."""
        self._subscribers.clear()
        self._sequences.clear()
        self._replay_buffers.clear()


# Global singleton instance
event_bus = EventBus()
