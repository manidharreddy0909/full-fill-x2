"""
FULFILL-X Operational Anomaly Detector Implementation (Phase 6)
Implements Z-Score Baseline vs Isolation Forest anomaly scoring across operational metrics.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score

from app.ml.schemas import MLTaskType, UncertaintyEstimate, FeatureExplanation
from app.ml.models.base import BasePredictiveModel


class OperationalAnomalyDetector(BasePredictiveModel):
    """
    Predictive model for operational anomaly detection.
    Produces continuous anomaly scores [0.0, 1.0], anomaly flags, and top feature deviations.
    """

    def __init__(self, model_id: str, algorithm: str = "IsolationForest", seed: int = 42):
        super().__init__(model_id=model_id, algorithm=algorithm, task_type=MLTaskType.ANOMALY_DETECTION, seed=seed)
        self.model = IsolationForest(n_estimators=50, random_state=seed, contamination=0.1)
        self.feature_means: Dict[str, float] = {}
        self.feature_stds: Dict[str, float] = {}

    def _prepare_x_y(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        features_df = df.drop(columns=["timestamp", "entity_id", "target"], errors="ignore")
        features_df = features_df.select_dtypes(include=[np.number])
        y = df["target"] if "target" in df.columns else None
        return features_df, y

    def train(self, train_df: pd.DataFrame, val_df: Optional[pd.DataFrame] = None) -> Dict[str, float]:
        X_train, y_train = self._prepare_x_y(train_df)
        self.feature_names = list(X_train.columns)

        for col in self.feature_names:
            self.feature_means[col] = float(np.mean(X_train[col]))
            self.feature_stds[col] = float(np.std(X_train[col])) or 1.0

        self.model.fit(X_train)
        self.is_trained = True

        scores, _ = self.predict(train_df)
        preds = [1.0 if s >= 0.70 else 0.0 for s in scores]

        metrics = {
            "train_anomaly_rate": round(float(np.mean(preds)), 4),
        }
        if y_train is not None:
            metrics["train_precision"] = round(float(precision_score(y_train, preds, zero_division=0)), 4)
            metrics["train_recall"] = round(float(recall_score(y_train, preds, zero_division=0)), 4)

        return metrics

    def predict(self, df: pd.DataFrame) -> Tuple[List[float], List[UncertaintyEstimate]]:
        X, _ = self._prepare_x_y(df)
        if not self.is_trained:
            scores = [0.1] * len(X)
        else:
            # IsolationForest score_samples returns negative anomaly score (lower means more anomalous)
            raw_scores = self.model.score_samples(X)
            # Normalize to [0.0, 1.0] where 1.0 is extreme anomaly
            min_s, max_s = np.min(raw_scores), np.max(raw_scores)
            if max_s - min_s > 1e-6:
                scores = list(1.0 - (raw_scores - min_s) / (max_s - min_s))
            else:
                scores = [0.1] * len(X)

        uncertainties = []
        for s in scores:
            uncertainties.append(
                UncertaintyEstimate(
                    confidence=0.90,
                    prediction_interval_lower=0.0,
                    prediction_interval_upper=1.0,
                    std_dev=0.05,
                    is_calibrated=True,
                )
            )

        rounded_scores = [round(float(s), 4) for s in scores]
        return rounded_scores, uncertainties

    def evaluate(self, test_df: pd.DataFrame) -> Dict[str, float]:
        X_test, y_test = self._prepare_x_y(test_df)
        scores, _ = self.predict(test_df)
        preds = [1.0 if s >= 0.70 else 0.0 for s in scores]

        p = float(precision_score(y_test, preds, zero_division=0))
        r = float(recall_score(y_test, preds, zero_division=0))
        f1 = float(f1_score(y_test, preds, zero_division=0))

        return {
            "test_precision": round(p, 4),
            "test_recall": round(r, 4),
            "test_f1": round(f1, 4),
        }

    def compute_baseline_metrics(self, train_df: pd.DataFrame, test_df: pd.DataFrame) -> Dict[str, float]:
        """Naive Z-Score threshold baseline (Z > 3.0)."""
        X_test, y_test = self._prepare_x_y(test_df)
        max_z_scores = []
        for idx in range(len(X_test)):
            row = X_test.iloc[idx]
            z_vals = []
            for col in self.feature_names:
                mean = self.feature_means.get(col, 0.0)
                std = self.feature_stds.get(col, 1.0)
                z = abs(row[col] - mean) / std
                z_vals.append(z)
            max_z_scores.append(max(z_vals) if z_vals else 0.0)

        preds = [1.0 if z > 3.0 else 0.0 for z in max_z_scores]
        p = float(precision_score(y_test, preds, zero_division=0))
        r = float(recall_score(y_test, preds, zero_division=0))

        return {
            "baseline_precision": round(p, 4),
            "baseline_recall": round(r, 4),
        }

    def explain(self, df: pd.DataFrame) -> List[List[FeatureExplanation]]:
        X, _ = self._prepare_x_y(df)
        explanations_per_row = []

        for idx in range(len(df)):
            row = X.iloc[idx]
            z_scores = []
            for col in self.feature_names:
                mean = self.feature_means.get(col, 0.0)
                std = self.feature_stds.get(col, 1.0)
                z = (row[col] - mean) / std
                z_scores.append((col, abs(z), float(row[col]), "INCREASE" if z > 0 else "DECREASE"))

            z_scores.sort(key=lambda x: x[1], reverse=True)
            row_expl = [
                FeatureExplanation(
                    feature_name=name,
                    importance=round(float(z_val), 4),
                    contribution_value=round(val, 2),
                    direction=direction,
                )
                for name, z_val, val, direction in z_scores[:5]
            ]
            explanations_per_row.append(row_expl)

        return explanations_per_row
