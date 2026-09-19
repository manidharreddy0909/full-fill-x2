"""
FULFILL-X Abstract Base Predictive Model Interface (Phase 6)
"""
import pandas as pd
from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Any, Optional
from app.ml.schemas import MLTaskType, UncertaintyEstimate, FeatureExplanation


class BasePredictiveModel(ABC):
    """
    Abstract contract interface for all FULFILL-X predictive algorithms.
    Enforces training, prediction, evaluation, explainability, and baseline comparison.
    """

    def __init__(self, model_id: str, algorithm: str, task_type: MLTaskType, seed: int = 42):
        self.model_id = model_id
        self.algorithm = algorithm
        self.task_type = task_type
        self.seed = seed
        self.is_trained = False
        self.feature_names: List[str] = []

    @abstractmethod
    def train(self, train_df: pd.DataFrame, val_df: Optional[pd.DataFrame] = None) -> Dict[str, float]:
        """Train model and return training/validation metric dictionary."""
        pass

    @abstractmethod
    def predict(self, df: pd.DataFrame) -> Tuple[List[float], List[UncertaintyEstimate]]:
        """
        Perform inference on feature dataframe.
        Returns tuple of (predictions/probabilities, uncertainty_estimates).
        """
        pass

    @abstractmethod
    def evaluate(self, test_df: pd.DataFrame) -> Dict[str, float]:
        """Evaluate model against ground truth test dataframe."""
        pass

    @abstractmethod
    def compute_baseline_metrics(self, train_df: pd.DataFrame, test_df: pd.DataFrame) -> Dict[str, float]:
        """Compute naive baseline metrics to enforce ML vs Baseline comparison safeguard."""
        pass

    @abstractmethod
    def explain(self, df: pd.DataFrame) -> List[List[FeatureExplanation]]:
        """Generate feature importance / contribution explanations for input rows."""
        pass
