"""
FULFILL-X Graph & Causal Platform Master Orchestrator (Phase 7)
Coordinates world state adaptation, GNN inference, propagation tracing, causal hypothesis generation,
and counterfactual simulation.
"""
import time
import threading
from typing import Dict, List, Optional, Any
from app.repository.world import WorldRepository
from app.graph.adapter import GraphMLAdapter
from app.graph.features import GraphFeatureExtractor
from app.graph.datasets import GraphDatasetGenerator
from app.graph.training import GraphModelTrainer
from app.graph.registry import LocalGraphModelRegistry
from app.graph.propagation import PropagationEngine
from app.graph.causal import CausalHypothesisGenerator
from app.graph.counterfactual import CounterfactualEngine
from app.graph.drift import GraphDriftDetector
from app.graph.schemas import (
    GraphSnapshot,
    GraphFeatures,
    GraphPrediction,
    PropagationTrace,
    CausalHypothesis,
    CounterfactualRequest,
    CounterfactualRun,
    GraphTaskType,
    GraphModelMetadata,
)
from app.realtime.event_bus import event_bus
from app.schemas.events import EventType


class GraphPlatformService:
    """
    Master Service orchestrating Phase 7 Graph Neural Networks,
    Propagation Analysis, Causal Intelligence, and Counterfactual Simulations.
    """

    _instance: Optional["GraphPlatformService"] = None
    _lock: threading.RLock = threading.RLock()

    def __init__(self):
        self.lock = threading.RLock()
        self.world_repo = WorldRepository.get_instance()
        self.extractor = GraphFeatureExtractor()
        self.dataset_gen = GraphDatasetGenerator()
        self.trainer = GraphModelTrainer()
        self.registry = LocalGraphModelRegistry.get_instance()
        self.propagation_engine = PropagationEngine()
        self.causal_generator = CausalHypothesisGenerator()
        self.counterfactual_engine = CounterfactualEngine()
        self.drift_detector = GraphDriftDetector()
        self.event_bus = event_bus

        self._initialize_default_models()

    @classmethod
    def get_instance(cls) -> "GraphPlatformService":
        """Get or initialize singleton service instance."""
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def _initialize_default_models(self) -> None:
        """Initialize and register default validated GraphSAGE model if none exists."""
        with self.lock:
            try:
                active_model, _ = self.registry.get_active_model(GraphTaskType.NODE_RISK_PREDICTION)
                if active_model and hasattr(active_model, "is_trained") and active_model.is_trained:
                    return
            except Exception:
                pass

            train_samples = self.dataset_gen.generate_dataset(num_scenarios=4, preset="healthy")
            val_samples = self.dataset_gen.generate_dataset(num_scenarios=2, preset="disrupted_supplier")
            model, metadata = self.trainer.train_node_risk_model(train_samples, val_samples, seed=42)
            self.registry.register_model(metadata, model)

    def get_current_graph_snapshot(self) -> GraphSnapshot:
        """Fetch current WorldStateSnapshot and adapt to GraphSnapshot."""
        with self.lock:
            world_snap = self.world_repo.get_snapshot()
            graph_snap = GraphMLAdapter.snapshot_to_graph_snapshot(world_snap)
            return graph_snap

    def get_graph_features(self) -> GraphFeatures:
        """Extract graph features for current snapshot."""
        snap = self.get_current_graph_snapshot()
        return self.extractor.extract_features(snap)

    def predict_node_risk(self, target_node_id: str, horizon_hours: int = 24) -> GraphPrediction:
        """Execute GNN node risk prediction."""
        with self.lock:
            snap = self.get_current_graph_snapshot()
            features = self.extractor.extract_features(snap)

            model, meta = self.registry.get_active_model(GraphTaskType.NODE_RISK_PREDICTION)
            pred = model.predict_node_risk(features, target_node_id, horizon_hours)

            # Publish GNN Prediction Event
            self.event_bus.publish_sync(
                EventType.GNN_PREDICTION_CREATED,
                {
                    "prediction_id": pred.prediction_id,
                    "target_node_id": target_node_id,
                    "predicted_risk": pred.predicted_risk,
                    "model_id": pred.model_id,
                },
                source="GraphPlatformService"
            )

            return pred

    def analyze_propagation(self, origin_node_id: str, max_depth: int = 4) -> PropagationTrace:
        """Analyze multi-hop disruption propagation."""
        with self.lock:
            snap = self.get_current_graph_snapshot()
            features = self.extractor.extract_features(snap)

            trace = self.propagation_engine.analyze_propagation(
                snapshot=snap,
                origin_node_id=origin_node_id,
                features=features,
                max_depth=max_depth
            )

            # Publish Propagation Event
            self.event_bus.publish_sync(
                EventType.GRAPH_PROPAGATION_DETECTED,
                {
                    "trace_id": trace.trace_id,
                    "origin_node_id": origin_node_id,
                    "depth": trace.depth,
                    "affected_node_count": len(trace.affected_nodes),
                    "expected_impact": trace.expected_impact,
                },
                source="GraphPlatformService"
            )

            return trace

    def generate_causal_hypotheses(self, origin_node_id: str) -> List[CausalHypothesis]:
        """Generate causal hypotheses for network disruption."""
        with self.lock:
            snap = self.get_current_graph_snapshot()
            trace = self.analyze_propagation(origin_node_id)
            hypotheses = self.causal_generator.generate_hypotheses(snap, trace)

            for h in hypotheses:
                self.event_bus.publish_sync(
                    EventType.CAUSAL_HYPOTHESIS_CREATED,
                    {
                        "hypothesis_id": h.hypothesis_id,
                        "cause_node_id": h.cause_node_id,
                        "effect_node_id": h.effect_node_id,
                        "confidence": h.confidence,
                        "status": h.causal_status,
                    },
                    source="GraphPlatformService"
                )

            return hypotheses

    def run_counterfactual(self, request: CounterfactualRequest) -> CounterfactualRun:
        """Execute sandboxed counterfactual simulation."""
        with self.lock:
            snap = self.get_current_graph_snapshot()
            cf_run = self.counterfactual_engine.run_counterfactual(snap, request)

            self.event_bus.publish_sync(
                EventType.COUNTERFACTUAL_COMPLETED,
                {
                    "run_id": cf_run.run_id,
                    "target_node_id": cf_run.target_node_id,
                    "risk_delta": cf_run.risk_delta,
                    "service_delta": cf_run.service_delta,
                },
                source="GraphPlatformService"
            )

            return cf_run
