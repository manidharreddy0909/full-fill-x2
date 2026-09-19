"""
Unit tests for WorldRepository & State Store (P02-004)
"""
import pytest
from app.repository.world import WorldRepository
from app.schemas.world import NodeType


def test_repository_singleton_and_snapshot():
    repo = WorldRepository.get_instance(seed=42)
    snapshot = repo.get_snapshot()

    assert snapshot is not None
    assert len(snapshot.nodes) == 23
    assert snapshot.network_health_score > 0.0


def test_repository_get_node_and_edge():
    repo = WorldRepository.get_instance(seed=42)

    sup = repo.get_node("sup-001")
    assert sup is not None
    assert sup.name == "Apex Electronics"
    assert sup.type == NodeType.SUPPLIER

    edge = repo.get_edge("rt-001")
    assert edge is not None
    assert edge.source_node_id == "sup-001"


def test_repository_seed_and_reset():
    repo = WorldRepository.get_instance(seed=42)
    
    # Seed with double punch
    snap_disrupted = repo.seed_world(preset="double_punch", seed=42)
    assert repo.get_node("sup-001").is_disrupted is True

    # Reset back to baseline
    snap_reset = repo.reset_world()
    assert snap_reset is not None
    assert repo.get_node("sup-001").is_disrupted is True  # last seeded snapshot was double punch

    # Seed back to healthy
    snap_healthy = repo.seed_world(preset="healthy", seed=42)
    assert repo.get_node("sup-001").is_disrupted is False


def test_repository_summary_metrics():
    repo = WorldRepository.get_instance(seed=42)
    repo.seed_world(preset="healthy", seed=42)
    summary = repo.get_summary()

    assert summary.total_nodes == 23
    assert summary.suppliers_count == 5
    assert summary.warehouses_count == 3
    assert summary.fulfillment_centers_count == 2
    assert summary.customer_zones_count == 10
    assert summary.ports_count == 3
    assert summary.disrupted_nodes_count == 0
    assert summary.network_health_score > 0.8
