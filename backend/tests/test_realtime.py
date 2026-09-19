"""
FULFILL-X Real-Time Intelligence & WebSocket Test Suite (Phase 11)
Tests Event Schemas, EventBus pub/sub, WebSocketManager, FastAPI WebSocket routes,
service event emissions, sequence ordering, replay buffer, and zero state-mutation safety.
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.events import (
    EventType,
    EventSeverity,
    EventEnvelope,
    ClientWsAction,
    ClientWsMessage,
)
from app.realtime.event_bus import EventBus, event_bus
from app.realtime.websocket_manager import WebSocketManager, websocket_manager
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.services.cockpit import CockpitService


@pytest.fixture(autouse=True)
def reset_realtime_state():
    event_bus.reset()
    websocket_manager.reset()
    yield
    event_bus.reset()
    websocket_manager.reset()


def test_event_schemas():
    """Verify EventEnvelope and ClientWsMessage schema validation."""
    envelope = EventEnvelope(
        event_type=EventType.SESSION_CREATED,
        payload={"preset": "double_punch", "seed": 42},
        session_id="sess-001",
        stage="OBSERVING",
        source="test_harness",
        severity=EventSeverity.INFO,
        sequence=1,
    )
    assert envelope.event_id.startswith("evt-")
    assert envelope.event_type == EventType.SESSION_CREATED
    assert envelope.sequence == 1
    assert envelope.payload["preset"] == "double_punch"

    client_msg = ClientWsMessage(action=ClientWsAction.PING, payload={"timestamp": 123456789})
    assert client_msg.action == ClientWsAction.PING


@pytest.mark.asyncio
async def test_event_bus_publish_subscribe():
    """Verify async pub/sub, sequence numbers, and callback execution."""
    received_events = []

    async def sample_subscriber(envelope: EventEnvelope):
        received_events.append(envelope)

    event_bus.subscribe(session_id="sess-test", callback=sample_subscriber)

    e1 = await event_bus.publish(
        event_type=EventType.STAGE_STARTED,
        payload={"stage": "ANALYZING_RISK"},
        session_id="sess-test",
        stage="ANALYZING_RISK",
    )
    e2 = await event_bus.publish(
        event_type=EventType.STAGE_COMPLETED,
        payload={"stage": "ANALYZING_RISK"},
        session_id="sess-test",
        stage="ANALYZING_RISK",
    )

    await asyncio.sleep(0.05)

    assert len(received_events) == 2
    assert received_events[0].sequence == 1
    assert received_events[1].sequence == 2
    assert received_events[0].event_type == EventType.STAGE_STARTED
    assert received_events[1].event_type == EventType.STAGE_COMPLETED


@pytest.mark.asyncio
async def test_event_bus_session_filtering_and_replay():
    """Verify session isolation and get_replay_events catch-up buffer."""
    sess_a_events = []
    sess_b_events = []

    event_bus.subscribe("sess-a", lambda e: sess_a_events.append(e))
    event_bus.subscribe("sess-b", lambda e: sess_b_events.append(e))

    await event_bus.publish(EventType.SPECIALIST_STARTED, payload={"agent_id": "inventory"}, session_id="sess-a")
    await event_bus.publish(EventType.SPECIALIST_STARTED, payload={"agent_id": "supplier"}, session_id="sess-b")
    await event_bus.publish(EventType.SPECIALIST_COMPLETED, payload={"agent_id": "inventory"}, session_id="sess-a")

    await asyncio.sleep(0.05)

    assert len(sess_a_events) == 2
    assert len(sess_b_events) == 1
    assert sess_a_events[0].payload["agent_id"] == "inventory"
    assert sess_b_events[0].payload["agent_id"] == "supplier"

    # Verify replay catch-up buffer
    replayed = event_bus.get_replay_events(session_id="sess-a", since_sequence=0, max_count=10)
    assert len(replayed) == 2
    assert replayed[0].event_type == EventType.SPECIALIST_STARTED
    assert replayed[1].event_type == EventType.SPECIALIST_COMPLETED


def test_websocket_api_ping_pong():
    """Test WebSocket endpoint handshake, PING -> PONG, and client subscription ACK."""
    client = TestClient(app)
    with client.websocket_connect("/ws/sess-ws-test") as websocket:
        # Send PING message
        websocket.send_json({"action": "PING", "payload": {"timestamp": 1000}})
        data = websocket.receive_json()
        assert data["event_type"] == "SYSTEM_WARNING"
        assert data["payload"]["status"] == "PONG"

        # Send SUBSCRIBE message
        websocket.send_json({"action": "SUBSCRIBE", "session_id": "sess-ws-test"})
        data = websocket.receive_json()
        assert data["event_type"] == "SYSTEM_WARNING"
        assert data["payload"]["status"] == "SUBSCRIBED"


def test_state_mutation_safety_realtime_events():
    """Verify publishing events causes ZERO mutation on WorldRepository or RiskRepository."""
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    world_before = world_repo.get_snapshot()
    risk_before = risk_repo.get_risk_map()

    # Publish 50 events across various event types
    for i in range(50):
        event_bus.publish_sync(
            EventType.RISK_UPDATED,
            payload={"fake_score": 0.99, "index": i},
            session_id="sess-safety-test",
            severity=EventSeverity.CRITICAL,
        )

    world_after = world_repo.get_snapshot()
    risk_after = risk_repo.get_risk_map()

    assert world_before.nodes == world_after.nodes, "SAFETY FAILURE: WorldRepository nodes mutated by EventBus publish"
    assert world_before.edges == world_after.edges, "SAFETY FAILURE: WorldRepository edges mutated by EventBus publish"
    assert risk_before.node_risks == risk_after.node_risks, "SAFETY FAILURE: RiskRepository mutated by EventBus publish"


@pytest.mark.asyncio
async def test_end_to_end_realtime_workflow():
    """Verify end-to-end Cockpit workflow emits ordered real-time events."""
    service = CockpitService.get_instance()

    received_timeline = []

    def on_event(envelope: EventEnvelope):
        received_timeline.append(envelope)

    session = service.create_session(preset="double_punch", seed=42)
    event_bus.subscribe(session.session_id, on_event)

    # Run ANALYZING_RISK and RUNNING_SPECIALISTS stages
    await service.run_stage(session.session_id, target_stage="ANALYZING_RISK")
    await service.run_stage(session.session_id, target_stage="RUNNING_SPECIALISTS")

    await asyncio.sleep(0.05)

    assert len(received_timeline) > 0
    event_types = [e.event_type for e in received_timeline]
    
    assert EventType.STAGE_STARTED in event_types
    assert EventType.STAGE_COMPLETED in event_types

    # Sequences should be strictly monotonically increasing
    sequences = [e.sequence for e in received_timeline]
    assert sequences == sorted(sequences)
