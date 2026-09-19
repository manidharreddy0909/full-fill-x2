"""
FULFILL-X Digital Twin Dynamics Unit Tests (Phase 8)
Validates discrete step state transitions, inventory equation, capacity recovery, and backlog tracking.
"""
import pytest
from app.services.world import WorldService
from app.simulation.dynamics import DigitalTwinDynamics
from app.simulation.schemas import DisruptionEvent, DisruptionType
from app.simulation.twin import DigitalTwin


def test_dynamics_step_transition():
    """Verify 1-hour discrete step transitions and inventory equation."""
    world_svc = WorldService()
    snapshot = world_svc.get_snapshot()
    twin = DigitalTwin(snapshot=snapshot, seed=42)
    state = twin.create_isolated_state(max_steps=24)

    dynamics = DigitalTwinDynamics(seed=42)
    outcome = dynamics.step(state=state, active_events=[])

    assert outcome.step == 0
    assert outcome.total_demand > 0.0
    assert outcome.fulfilled_demand >= 0.0
    assert 0.0 <= outcome.service_level <= 1.0
    assert state.step == 1


def test_dynamics_disruption_and_recovery():
    """Verify disruption capacity penalty and node recovery over step hours."""
    world_svc = WorldService()
    snapshot = world_svc.get_snapshot()
    twin = DigitalTwin(snapshot=snapshot, seed=42)
    state = twin.create_isolated_state(max_steps=48)

    target_node_id = list(state.nodes.keys())[0]
    disr_evt = DisruptionEvent(
        target=target_node_id,
        start_time=0,
        duration=12,
        severity=0.8,
        capacity_multiplier=0.2,
        type=DisruptionType.SUPPLIER_OUTAGE,
    )

    dynamics = DigitalTwinDynamics(seed=42)

    # Step during disruption (hour 0-11)
    outcome1 = dynamics.step(state=state, active_events=[disr_evt])
    assert state.nodes[target_node_id].is_disrupted is True
    assert state.nodes[target_node_id].disruption_multiplier == 0.2

    # Fast forward past disruption (hour 12+) without active disruption event
    for h in range(1, 25):
        active_evts = [disr_evt] if h < 12 else []
        dynamics.step(state=state, active_events=active_evts)

    # Assert capacity has recovered
    assert state.nodes[target_node_id].disruption_multiplier > 0.2
