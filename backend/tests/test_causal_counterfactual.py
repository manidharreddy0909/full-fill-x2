"""
Tests for FULFILL-X Counterfactual Engine and Graph Drift Detector (Phase 7)
"""
import pytest
from app.repository.world import WorldRepository
from app.graph.adapter import GraphMLAdapter
from app.graph.features import GraphFeatureExtractor
from app.graph.counterfactual import CounterfactualEngine
from app.graph.drift import GraphDriftDetector
from app.graph.schemas import CounterfactualRequest


def test_counterfactual_engine_sandbox():
    world_repo = WorldRepository.get_instance(seed=42, preset="disrupted_supplier")
    graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(world_repo.get_snapshot())

    engine = CounterfactualEngine()
    req = CounterfactualRequest(
        target_node_id="sup-001",
        parameter_overrides={"capacity": 80.0, "utilization": 0.40}
    )

    run = engine.run_counterfactual(graph_snap, req)
    assert run.target_node_id == "sup-001"
    assert run.counterfactual_network_risk < run.baseline_network_risk
    assert run.risk_delta > 0.0
    assert run.service_delta >= 0.0


def test_graph_drift_detector():
    world_repo = WorldRepository.get_instance(seed=42)
    extractor = GraphFeatureExtractor()

    snap1 = GraphMLAdapter.snapshot_to_graph_snapshot(world_repo.get_snapshot())
    features1 = extractor.extract_features(snap1)

    snap2 = GraphMLAdapter.snapshot_to_graph_snapshot(world_repo.get_snapshot())
    features2 = extractor.extract_features(snap2)

    detector = GraphDriftDetector()
    report = detector.compute_drift(features1, features2)

    assert report.is_drift_detected is False
    assert report.degree_distribution_psi >= 0.0
