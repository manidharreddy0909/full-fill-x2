"""
Unit tests for World Model Pydantic Schemas (P02-001)
"""
import pytest
from pydantic import ValidationError
from app.schemas.world import (
    NodeType,
    EdgeType,
    Position3D,
    NodeRiskScores,
    WorldNode,
    WorldEdge,
    WorldStateSnapshot,
    Product,
)


def test_position_3d_schema():
    pos = Position3D(x=1.5, y=-2.0, z=10.0)
    assert pos.x == 1.5
    assert pos.y == -2.0
    assert pos.z == 10.0

    # Immutability check
    with pytest.raises(ValidationError):
        pos.x = 5.0  # type: ignore


def test_node_risk_scores_clamping_and_validation():
    scores = NodeRiskScores(
        composite=0.8,
        financial=0.5,
        sla=0.9,
        operational=0.4,
        sustainability=0.1,
    )
    assert scores.composite == 0.8
    assert scores.financial == 0.5

    # Test clamping
    scores_clamped = NodeRiskScores(composite=1.5)  # mode='before' validator clamps 1.5 -> 1.0
    assert scores_clamped.composite == 1.0

    with pytest.raises(ValidationError):
        NodeRiskScores(financial=1.5)  # Should raise ge/le validation error


def test_world_node_creation():
    node = WorldNode(
        id="sup-001",
        type=NodeType.SUPPLIER,
        name="Apex Electronics",
        position=Position3D(x=0.0, y=0.0, z=-15.0),
        tier=1,
        region="APAC",
        risk_scores=NodeRiskScores(composite=0.2),
        inventory_level=0.95,
        capacity=2000.0,
        is_disrupted=False,
    )
    assert node.id == "sup-001"
    assert node.type == NodeType.SUPPLIER
    assert node.position.z == -15.0
    assert node.tier == 1


def test_world_edge_creation():
    edge = WorldEdge(
        id="rt-001",
        source_node_id="sup-001",
        target_node_id="wh-001",
        type=EdgeType.ROUTE,
        load=0.75,
        capacity=1000.0,
        delay_hours=4.0,
        cost_per_unit=12.5,
        emissions_per_unit=1.8,
        is_disrupted=False,
    )
    assert edge.id == "rt-001"
    assert edge.source_node_id == "sup-001"
    assert edge.load == 0.75


def test_world_state_snapshot_serialization():
    node = WorldNode(
        id="sup-001",
        type=NodeType.SUPPLIER,
        name="Apex Electronics",
        position=Position3D(x=0.0, y=0.0, z=-15.0),
        capacity=1000.0,
        is_disrupted=False,
    )
    edge = WorldEdge(
        id="rt-001",
        source_node_id="sup-001",
        target_node_id="wh-001",
        capacity=500.0,
        delay_hours=0.0,
        cost_per_unit=10.0,
        emissions_per_unit=1.0,
        is_disrupted=False,
    )
    snapshot = WorldStateSnapshot(
        nodes=[node],
        edges=[edge],
        network_health_score=0.95,
        total_risk_score=0.05,
    )

    json_str = snapshot.model_dump_json()
    restored = WorldStateSnapshot.model_validate_json(json_str)

    assert restored.snapshot_id == snapshot.snapshot_id
    assert len(restored.nodes) == 1
    assert restored.nodes[0].id == "sup-001"
    assert restored.edges[0].id == "rt-001"
    assert restored.network_health_score == 0.95
