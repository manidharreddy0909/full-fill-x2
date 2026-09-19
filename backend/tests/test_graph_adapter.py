"""
Tests for FULFILL-X GraphML Adapter and Feature Extractor (Phase 7)
"""
import pytest
from app.repository.world import WorldRepository
from app.graph.adapter import GraphMLAdapter
from app.graph.features import GraphFeatureExtractor
from app.graph.datasets import GraphDatasetGenerator


def test_graph_adapter_conversion():
    world_repo = WorldRepository.get_instance(seed=42, preset="healthy")
    world_snap = world_repo.get_snapshot()

    graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(world_snap)
    assert graph_snap.node_count > 0
    assert graph_snap.edge_count > 0
    assert graph_snap.graph_version == "1.0.0"

    nx_graph = GraphMLAdapter.to_networkx(graph_snap)
    assert len(nx_graph.nodes()) == graph_snap.node_count
    assert len(nx_graph.edges()) <= graph_snap.edge_count


def test_graph_feature_extraction():
    world_repo = WorldRepository.get_instance(seed=42, preset="disrupted_supplier")
    world_snap = world_repo.get_snapshot()

    graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(world_snap)
    extractor = GraphFeatureExtractor()
    features = extractor.extract_features(graph_snap)

    assert features.schema_version == "1.0.0"
    assert len(features.node_features) == graph_snap.node_count
    assert len(features.edge_index[0]) > 0

    first_node_id = list(features.node_features.keys())[0]
    n_feat = features.node_features[first_node_id]
    assert len(n_feat.combined_feature_vector) == 22


def test_graph_dataset_generator():
    gen = GraphDatasetGenerator(seed=42)
    samples = gen.generate_dataset(num_scenarios=4, preset="healthy")
    assert len(samples) == 4

    train, val, test = gen.split_dataset(samples)
    assert len(train) >= 1
    assert len(val) >= 1
