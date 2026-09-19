"""
Unit tests for Deterministic Synthetic Network Generator (P02-003 & P02-008)
"""
import pytest
from app.generator.synthetic import SyntheticDataGenerator, generate_world
from app.schemas.world import NodeType, EdgeType


def test_generator_node_counts_and_types():
    graph = generate_world(seed=42, preset="healthy")
    
    suppliers = graph.get_nodes_by_type(NodeType.SUPPLIER)
    ports = graph.get_nodes_by_type(NodeType.PORT)
    warehouses = graph.get_nodes_by_type(NodeType.WAREHOUSE)
    fcs = graph.get_nodes_by_type(NodeType.FULFILLMENT_CENTER)
    customer_zones = graph.get_nodes_by_type(NodeType.CUSTOMER_ZONE)

    assert len(suppliers) == 5
    assert len(ports) == 3
    assert len(warehouses) == 3
    assert len(fcs) == 2
    assert len(customer_zones) == 10
    assert len(graph.nodes) == 23


def test_same_seed_reproducibility():
    """Verify seed=42 == seed=42 exact deterministic equality invariant."""
    world_a1 = generate_world(seed=42, preset="healthy").to_snapshot()
    world_a2 = generate_world(seed=42, preset="healthy").to_snapshot()

    assert world_a1.snapshot_id == world_a2.snapshot_id
    assert len(world_a1.nodes) == len(world_a2.nodes)
    assert len(world_a1.edges) == len(world_a2.edges)
    
    for n1, n2 in zip(world_a1.nodes, world_a2.nodes):
        assert n1.id == n2.id
        assert n1.position == n2.position
        assert n1.risk_scores == n2.risk_scores
        assert n1.inventory_level == n2.inventory_level

    for e1, e2 in zip(world_a1.edges, world_a2.edges):
        assert e1.id == e2.id
        assert e1.source_node_id == e2.source_node_id
        assert e1.target_node_id == e2.target_node_id
        assert e1.load == e2.load


def test_different_seed_variation():
    """Verify seed=42 != seed=43 generates distinct attribute variations."""
    world_a = generate_world(seed=42, preset="healthy").to_snapshot()
    world_b = generate_world(seed=43, preset="healthy").to_snapshot()

    assert world_a.snapshot_id != world_b.snapshot_id
    # Risk scores and inventory levels should differ due to seed variation
    assert world_a.nodes[0].risk_scores != world_b.nodes[0].risk_scores


def test_graph_structural_integrity():
    """Verify all edge references connect to existing nodes."""
    graph = generate_world(seed=42)
    node_ids = set(graph.nodes.keys())

    for edge in graph.edges.values():
        assert edge.source_node_id in node_ids, f"Edge {edge.id} has invalid source {edge.source_node_id}"
        assert edge.target_node_id in node_ids, f"Edge {edge.id} has invalid target {edge.target_node_id}"


def test_double_punch_preset_overlay():
    """Verify double_punch preset injects disruption into Port of Osaka, APAC WH, and Apex Electronics."""
    graph = generate_world(seed=42, preset="double_punch")
    
    port_osaka = graph.get_node("port-001")
    apac_wh = graph.get_node("wh-001")
    apex_sup = graph.get_node("sup-001")

    assert port_osaka is not None and port_osaka.is_disrupted is True
    assert apac_wh is not None and apac_wh.is_disrupted is True
    assert apex_sup is not None and apex_sup.is_disrupted is True

    assert "sig-typhoon-hana" in port_osaka.disruption_source_ids
    assert "sig-factory-fire-sz" in apex_sup.disruption_source_ids
