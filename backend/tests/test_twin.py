"""
FULFILL-X Digital Twin Unit Tests (Phase 8)
Validates executable DigitalTwin snapshots, snapshot isolation, versioning, and zero production state mutation.
"""
import pytest
from app.services.world import WorldService
from app.simulation.twin import DigitalTwin


def test_digital_twin_creation_and_isolation():
    """Verify Digital Twin initializes with deep-copied snapshot state and non-production mutation flags."""
    world_svc = WorldService()
    snapshot = world_svc.get_snapshot()

    twin = DigitalTwin(snapshot=snapshot, seed=42)
    assert twin.twin_id.startswith("DT-")
    assert twin.world_snapshot_id == str(snapshot.snapshot_id)
    assert twin.twin_version == "1.0.0"

    isolated_state = twin.create_isolated_state(max_steps=72)
    assert isolated_state.production_mutation is False
    assert isolated_state.mode == "SIMULATION"
    assert len(isolated_state.nodes) == len(snapshot.nodes)
    assert len(isolated_state.edges) == len(snapshot.edges)

    # Mutate isolated state and assert initial snapshot is untouched
    first_node_id = list(isolated_state.nodes.keys())[0]
    isolated_state.nodes[first_node_id].inventory = 99999.0

    fresh_state = twin.create_isolated_state(max_steps=72)
    assert fresh_state.nodes[first_node_id].inventory != 99999.0
