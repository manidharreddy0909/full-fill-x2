"""
FULFILL-X Base Graph Model Interface (Phase 7)
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple
from app.graph.schemas import GraphFeatures, GraphPrediction, GraphTaskType


class BaseGraphModel(ABC):
    """
    Abstract interface for Graph ML models (PyTorch GNN & NetworkX Fallbacks).
    """

    def __init__(self, model_id: str, model_version: str = "1.0.0"):
        self.model_id = model_id
        self.model_version = model_version
        self.is_trained = False

    @abstractmethod
    def fit(self, train_samples: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train model on list of GraphSamples and return training metrics."""
        pass

    @abstractmethod
    def predict_node_risk(
        self,
        features: GraphFeatures,
        target_node_id: str,
        horizon_hours: int = 24
    ) -> GraphPrediction:
        """Predict node risk score and returns typed GraphPrediction."""
        pass

    @abstractmethod
    def save(self, filepath: str) -> None:
        """Serialize model parameters and metadata to file."""
        pass

    @abstractmethod
    def load(self, filepath: str) -> None:
        """Deserialize model parameters and metadata from file."""
        pass
