"""
FULFILL-X Event Transport Abstraction & Implementations (Phase 5)
Supports Free-First InMemory default transport and Redis Streams distributed transport.
"""
import asyncio
import logging
from abc import ABC, abstractmethod
from collections import deque, defaultdict
from typing import Dict, List, Set, Optional, Callable, Awaitable, Any
from app.schemas.events import EventEnvelope, EventType, EventSeverity
from app.config import settings

logger = logging.getLogger("fulfillx.realtime.transport")


class EventTransport(ABC):
    """Abstract Event Transport Protocol contract."""

    @property
    @abstractmethod
    def transport_type(self) -> str:
        """Transport identifier ('memory', 'redis')."""
        pass

    @abstractmethod
    def subscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        """Subscribe async callback to a specific session_id or None for global events."""
        pass

    @abstractmethod
    def unsubscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        """Unsubscribe callback from session."""
        pass

    @abstractmethod
    async def publish(self, envelope: EventEnvelope) -> EventEnvelope:
        """Publish event envelope across transport."""
        pass

    @abstractmethod
    def get_replay_events(
        self,
        session_id: str,
        since_sequence: int = 0,
        max_count: int = 50,
        organization_id: Optional[str] = None,
    ) -> List[EventEnvelope]:
        """Retrieve bounded historical events for catch-up replay."""
        pass

    @abstractmethod
    async def health(self) -> Dict[str, Any]:
        """Return transport health status and metrics."""
        pass

    @abstractmethod
    def reset(self) -> None:
        """Reset state for tests."""
        pass


class InMemoryEventTransport(EventTransport):
    """Free-First Local In-Memory Event Transport Implementation."""

    def __init__(self, max_replay_per_session: int = 100):
        self._max_replay = max_replay_per_session
        self._subscribers: Dict[Optional[str], Set[Callable[[EventEnvelope], Awaitable[None]]]] = defaultdict(set)
        self._sequences: Dict[str, int] = defaultdict(int)
        self._replay_buffers: Dict[str, deque] = defaultdict(lambda: deque(maxlen=self._max_replay))
        self._published_count = 0
        self._lock = asyncio.Lock()

    @property
    def transport_type(self) -> str:
        return "memory"

    def subscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        self._subscribers[session_id].add(callback)

    def unsubscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        if session_id in self._subscribers:
            self._subscribers[session_id].discard(callback)
            if not self._subscribers[session_id]:
                del self._subscribers[session_id]

    async def publish(self, envelope: EventEnvelope) -> EventEnvelope:
        seq_key = envelope.session_id or "global"
        async with self._lock:
            self._sequences[seq_key] += 1
            envelope.sequence = self._sequences[seq_key]
            self._published_count += 1

        if envelope.session_id:
            self._replay_buffers[envelope.session_id].append(envelope)

        target_callbacks = set(self._subscribers.get(envelope.session_id, set()))
        if envelope.session_id is not None:
            target_callbacks.update(self._subscribers.get(None, set()))

        for callback in target_callbacks:
            try:
                res = callback(envelope)
                if asyncio.iscoroutine(res):
                    await res
            except Exception as err:
                logger.error(f"InMemoryEventTransport callback error: {err}", exc_info=True)

        return envelope

    def get_replay_events(
        self,
        session_id: str,
        since_sequence: int = 0,
        max_count: int = 50,
        organization_id: Optional[str] = None,
    ) -> List[EventEnvelope]:
        if session_id not in self._replay_buffers:
            return []
        buffer = self._replay_buffers[session_id]
        events = []
        for evt in buffer:
            if evt.sequence > since_sequence:
                if organization_id and hasattr(evt, "organization_id"):
                    if evt.organization_id != organization_id and evt.organization_id != "org-fulfillx-default":
                        continue
                events.append(evt)
        return events[-max_count:]

    async def health(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "transport_type": "memory",
            "total_published": self._published_count,
            "active_sessions": len(self._replay_buffers),
            "subscriber_groups": len(self._subscribers),
        }

    def reset(self) -> None:
        self._subscribers.clear()
        self._sequences.clear()
        self._replay_buffers.clear()
        self._published_count = 0


class RedisEventTransport(EventTransport):
    """
    Distributed Redis Event Transport Implementation.
    Uses Redis Streams / PubSub for cross-instance event distribution with fallback to InMemory.
    """

    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self._redis_url = redis_url
        self._memory_fallback = InMemoryEventTransport()
        self._redis_client = None
        self._is_connected = False
        self._stream_key = "fulfillx:events:stream"
        self._published_count = 0

    @property
    def transport_type(self) -> str:
        return "redis"

    async def _ensure_connection(self) -> bool:
        if self._is_connected and self._redis_client is not None:
            return True
        try:
            import redis.asyncio as aioredis
            self._redis_client = aioredis.from_url(self._redis_url, decode_responses=True, socket_timeout=2.0)
            await self._redis_client.ping()
            self._is_connected = True
            logger.info("Connected to Redis Event Transport stream")
            return True
        except Exception as e:
            logger.warning(f"Redis Event Transport connection offline ({e}), defaulting to in-memory fallback")
            self._is_connected = False
            return False

    def subscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        self._memory_fallback.subscribe(session_id, callback)

    def unsubscribe(self, session_id: Optional[str], callback: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        self._memory_fallback.unsubscribe(session_id, callback)

    async def publish(self, envelope: EventEnvelope) -> EventEnvelope:
        # Publish locally to subscribers first
        env = await self._memory_fallback.publish(envelope)
        
        # Publish to Redis Stream asynchronously if connected
        if await self._ensure_connection():
            try:
                data = {
                    "event_id": env.event_id,
                    "event_type": env.event_type.value if hasattr(env.event_type, "value") else str(env.event_type),
                    "organization_id": env.organization_id,
                    "session_id": env.session_id or "",
                    "payload_json": env.model_dump_json(),
                }
                await self._redis_client.xadd(self._stream_key, data, maxlen=10000)
                self._published_count += 1
            except Exception as e:
                logger.warning(f"Failed to xadd event to Redis Stream: {e}")
                self._is_connected = False

        return env

    def get_replay_events(
        self,
        session_id: str,
        since_sequence: int = 0,
        max_count: int = 50,
        organization_id: Optional[str] = None,
    ) -> List[EventEnvelope]:
        return self._memory_fallback.get_replay_events(session_id, since_sequence, max_count, organization_id)

    async def health(self) -> Dict[str, Any]:
        is_alive = await self._ensure_connection()
        return {
            "status": "healthy" if is_alive else "degraded",
            "transport_type": "redis",
            "redis_connected": is_alive,
            "published_redis": self._published_count,
            "fallback_memory": await self._memory_fallback.health(),
        }

    def reset(self) -> None:
        self._memory_fallback.reset()
        self._published_count = 0


class TransportFactory:
    """Factory for selecting configured EventTransport instance."""
    _instance: Optional[EventTransport] = None

    @classmethod
    def get_transport(cls) -> EventTransport:
        if cls._instance is None:
            mode = getattr(settings, "EVENT_TRANSPORT", "memory").lower()
            if mode == "redis":
                redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")
                cls._instance = RedisEventTransport(redis_url=redis_url)
            else:
                cls._instance = InMemoryEventTransport()
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        if cls._instance:
            cls._instance.reset()
        cls._instance = None
