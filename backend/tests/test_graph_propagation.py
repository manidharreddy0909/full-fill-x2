"""
Tests for FULFILL-X Disruption Propagation and Causal Engines (Phase 7)
"""
import pytest
from app.repository.world import WorldRepository
from app.graph.adapter import GraphMLAdapter
from app.graph.propagation import PropagationEngine
from app.graph.causal import CausalHypothesisGenerator
from app.graph.schemas import CausalStatus


def test_disruption_propagation_engine():
    world_repo = WorldRepository.get_instance(seed=42, preset="disrupted_supplier")
    graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(world_repo.get_snapshot())

    engine = PropagationEngine()
    trace = engine.analyze_propagation(graph_snap, origin_node_id="sup-001", max_depth=4)

    assert trace.origin_node_id == "sup-001"
    assert trace.depth >= 0
    assert len(trace.affected_nodes) >= 1
    assert 0.0 <= trace.propagation_probability <= 1.0
    assert trace.expected_impact in ("LOW", "MEDIUM", "HIGH", "CRITICAL")


def test_causal_hypothesis_generator():
    world_repo = WorldRepository.get_instance(seed=42, preset="disrupted_supplier")
    graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(world_repo.get_snapshot())

    engine = PropagationEngine()
    trace = engine.analyze_propagation(graph_snap, origin_node_id="sup-001", max_depth=4)

    generator = CausalHypothesisGenerator()
    hypotheses = generator.generate_hypotheses(graph_snap, trace)

    assert len(hypotheses) >= 1
    h1 = hypotheses[0]
    assert h1.cause_node_id == "sup-001"
    assert len(h1.assumptions) >= 1
    assert h1.causal_status in (CausalStatus.CAUSAL_HYPOTHESIS, CausalStatus.INSUFFICIENT_EVIDENCE)
