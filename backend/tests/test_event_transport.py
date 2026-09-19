"""
FULFILL-X Distributed Event Transport Unit & Integration Tests (Phase 5)
"""
import pytest
from app.realtime.transport import InMemoryEventTransport, RedisEventTransport, TransportFactory
from app.schemas.events import EventEnvelope, EventType, EventSeverity


@pytest.mark.asyncio
async def test_in_memory_event_transport_lifecycle():
    transport = InMemoryEventTransport()
    events_received = []

    async def callback(evt: EventEnvelope):
        events_received.append(evt)

    transport.subscribe(session_id="session-t1", callback=callback)

    env = EventEnvelope(
        event_type=EventType.STAGE_STARTED,
        session_id="session-t1",
        stage="INGESTION",
    )
    published_env = await transport.publish(env)

    assert published_env.sequence == 1
    assert len(events_received) == 1
    assert events_received[0].stage == "INGESTION"

    replays = transport.get_replay_events("session-t1")
    assert len(replays) == 1

    health = await transport.health()
    assert health["status"] == "healthy"
    assert health["transport_type"] == "memory"


@pytest.mark.asyncio
async def test_redis_transport_fallback():
    transport = RedisEventTransport(redis_url="redis://localhost:9999/0")  # invalid port to trigger fallback
    events_received = []

    async def callback(evt: EventEnvelope):
        events_received.append(evt)

    transport.subscribe(session_id="session-r1", callback=callback)

    env = EventEnvelope(
        event_type=EventType.SIGNAL_DETECTED,
        session_id="session-r1",
    )
    published_env = await transport.publish(env)

    assert len(events_received) == 1
    health = await transport.health()
    assert health["transport_type"] == "redis"
    assert health["redis_connected"] is False  # Fallback active


def test_transport_factory():
    TransportFactory.reset()
    t = TransportFactory.get_transport()
    assert t is not None
    assert t.transport_type == "memory"
