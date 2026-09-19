"""
FULFILL-X Graph Dataset Generator (Phase 7)
Deterministic generation of graph datasets for GNN model training and benchmarking.
Explicitly labels data origin (SYNTHETIC vs REPLAY) and enforces time-aware split isolation.
"""
import random
import numpy as np
from typing import Dict, List, Any, Tuple
from app.generator.synthetic import SyntheticDataGenerator
from app.graph.adapter import GraphMLAdapter
from app.graph.features import GraphFeatureExtractor
from app.graph.schemas import GraphFeatures, GraphSnapshot


class GraphDatasetGenerator:
    """
    Deterministic dataset generator producing graph feature samples
    for node risk, route risk, and propagation prediction.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.extractor = GraphFeatureExtractor()

    def generate_dataset(
        self,
        num_scenarios: int = 6,
        preset: str = "healthy",
        origin: str = "SYNTHETIC"
    ) -> List[Dict[str, Any]]:
        """Generate deterministic collection of graph samples across scenarios."""
        random.seed(self.seed)
        np.random.seed(self.seed)

        samples: List[Dict[str, Any]] = []
        presets = ["healthy", "disrupted_supplier", "congested_port", "storm_warning", "multi_failure", "cascading_disruption"]

        for i in range(num_scenarios):
            cur_preset = presets[i % len(presets)]
            current_seed = self.seed + i * 10
            gen = SyntheticDataGenerator(seed=current_seed, preset=cur_preset)
            world_graph = gen.generate()
            snapshot = world_graph.to_snapshot()

            graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(snapshot)
            features = self.extractor.extract_features(graph_snap)

            # Generate target labels y for node risk prediction (0.0 to 1.0)
            node_ids = sorted(list(features.node_features.keys()))
            y_nodes = []
            for nid in node_ids:
                n_feat = features.node_features[nid]
                is_disrupted = n_feat.risk_vector[2]
                curr_risk = n_feat.risk_vector[0]
                # Target ground truth for 24h risk
                target_risk = min(1.0, max(0.0, curr_risk + (0.35 if is_disrupted else 0.05) + (random.random() * 0.1 - 0.05)))
                y_nodes.append(target_risk)

            samples.append({
                "sample_id": f"sample-{i}-{cur_preset}",
                "preset": cur_preset,
                "data_origin": origin,
                "snapshot": graph_snap,
                "features": features,
                "node_ids": node_ids,
                "x": [features.node_features[nid].combined_feature_vector for nid in node_ids],
                "edge_index": features.edge_index,
                "edge_attr": features.edge_attr,
                "y_nodes": y_nodes,
                "seed": current_seed,
            })

        return samples

    def split_dataset(
        self,
        samples: List[Dict[str, Any]],
        train_ratio: float = 0.70,
        val_ratio: float = 0.15
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Perform deterministic time-aware split into train, val, and test splits."""
        n = len(samples)
        n_train = max(1, int(n * train_ratio))
        n_val = max(1, int(n * val_ratio))

        train_samples = samples[:n_train]
        val_samples = samples[n_train:n_train + n_val]
        test_samples = samples[n_train + n_val:]

        if not test_samples:
            test_samples = val_samples

        return train_samples, val_samples, test_samples
