"""
Tests for FULFILL-X GNN Models, Baselines, Trainer, and Registry (Phase 7)
"""
import pytest
from app.repository.world import WorldRepository
from app.graph.adapter import GraphMLAdapter
from app.graph.features import GraphFeatureExtractor
from app.graph.models.fallback import NetworkXGNNFallback
from app.graph.models.sage import GraphSAGEPredictor
from app.graph.datasets import GraphDatasetGenerator
from app.graph.training import GraphModelTrainer
from app.graph.registry import LocalGraphModelRegistry
from app.graph.schemas import GraphTaskType


def test_networkx_fallback_model():
    world_repo = WorldRepository.get_instance(seed=42)
    graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(world_repo.get_snapshot())
    extractor = GraphFeatureExtractor()
    features = extractor.extract_features(graph_snap)

    model = NetworkXGNNFallback(model_id="test-fallback")
    pred = model.predict_node_risk(features, target_node_id="sup-001", horizon_hours=24)

    assert pred.target_id == "sup-001"
    assert 0.0 <= pred.predicted_risk <= 1.0
    assert pred.is_gnn_preferred is True


def test_graphsage_predictor():
    world_repo = WorldRepository.get_instance(seed=42)
    graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(world_repo.get_snapshot())
    extractor = GraphFeatureExtractor()
    features = extractor.extract_features(graph_snap)

    model = GraphSAGEPredictor(model_id="test-sage")
    pred = model.predict_node_risk(features, target_node_id="sup-001", horizon_hours=24)

    assert pred.target_id == "sup-001"
    assert 0.0 <= pred.predicted_risk <= 1.0


def test_graph_model_trainer_and_registry():
    gen = GraphDatasetGenerator(seed=42)
    train_samples = gen.generate_dataset(num_scenarios=4)
    val_samples = gen.generate_dataset(num_scenarios=2)

    trainer = GraphModelTrainer()
    model, metadata = trainer.train_node_risk_model(train_samples, val_samples, seed=42)

    assert metadata.model_id.startswith("gnn-sage-node_risk-")
    assert metadata.gnn_metric <= metadata.baseline_metric
    assert metadata.is_gnn_preferred is True

    registry = LocalGraphModelRegistry.get_instance()
    registry.register_model(metadata, model)

    active_m, active_meta = registry.get_active_model(GraphTaskType.NODE_RISK_PREDICTION)
    assert active_meta.model_id == metadata.model_id
