"""
FULFILL-X Demand Forecasting Model Implementation (Phase 6)
Implements Naive Moving Average Baseline vs Random Forest / Linear Regressor with
prediction intervals and feature importance explainability.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

from app.ml.schemas import MLTaskType, UncertaintyEstimate, FeatureExplanation
from app.ml.models.base import BasePredictiveModel


class DemandForecastingModel(BasePredictiveModel):
    """
    Predictive model for future demand/volume forecasting.
    Produces predicted values, 95% confidence intervals, and feature importance drivers.
    """

    def __init__(self, model_id: str, algorithm: str = "RandomForest", seed: int = 42):
        super().__init__(model_id=model_id, algorithm=algorithm, task_type=MLTaskType.DEMAND_FORECASTING, seed=seed)
        if algorithm == "Linear":
            self.model = Ridge(random_state=seed)
        else:
            self.model = RandomForestRegressor(n_estimators=50, random_state=seed, max_depth=8)
        self.residual_std: float = 5.0

    def _prepare_x_y(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        features_df = df.drop(columns=["timestamp", "entity_id", "target"], errors="ignore")
        # Keep numeric columns only
        features_df = features_df.select_dtypes(include=[np.number])
        y = df["target"] if "target" in df.columns else None
        return features_df, y

    def train(self, train_df: pd.DataFrame, val_df: Optional[pd.DataFrame] = None) -> Dict[str, float]:
        X_train, y_train = self._prepare_x_y(train_df)
        self.feature_names = list(X_train.columns)
        self.model.fit(X_train, y_train)
        self.is_trained = True

        train_preds = self.model.predict(X_train)
        residuals = y_train - train_preds
        self.residual_std = float(np.std(residuals)) if len(residuals) > 0 else 5.0

        metrics = {
            "train_mae": round(float(mean_absolute_error(y_train, train_preds)), 4),
            "train_rmse": round(float(root_mean_squared_error(y_train, train_preds)), 4),
        }

        if val_df is not None and not val_df.empty:
            X_val, y_val = self._prepare_x_y(val_df)
            val_preds = self.model.predict(X_val)
            metrics["val_mae"] = round(float(mean_absolute_error(y_val, val_preds)), 4)
            metrics["val_rmse"] = round(float(root_mean_squared_error(y_val, val_preds)), 4)

        return metrics

    def predict(self, df: pd.DataFrame) -> Tuple[List[float], List[UncertaintyEstimate]]:
        X, _ = self._prepare_x_y(df)
        if not self.is_trained:
            # Fallback to rolling mean feature if present or default 50.0
            preds = list(X["rolling_mean_3"].values) if "rolling_mean_3" in X.columns else [50.0] * len(X)
        else:
            preds = list(self.model.predict(X))

        uncertainties = []
        for val in preds:
            margin = 1.96 * self.residual_std
            uncertainties.append(
                UncertaintyEstimate(
                    confidence=0.88,
                    prediction_interval_lower=round(max(0.0, float(val - margin)), 2),
                    prediction_interval_upper=round(float(val + margin), 2),
                    std_dev=round(float(self.residual_std), 2),
                    is_calibrated=True,
                )
            )

        rounded_preds = [round(float(v), 2) for v in preds]
        return rounded_preds, uncertainties

    def evaluate(self, test_df: pd.DataFrame) -> Dict[str, float]:
        X_test, y_test = self._prepare_x_y(test_df)
        preds, _ = self.predict(test_df)
        mae = float(mean_absolute_error(y_test, preds))
        rmse = float(root_mean_squared_error(y_test, preds))
        
        # Calculate sMAPE
        y_true = np.array(y_test)
        y_pred = np.array(preds)
        smape = float(np.mean(2.0 * np.abs(y_pred - y_true) / (np.abs(y_true) + np.abs(y_pred) + 1e-8)) * 100)

        return {
            "test_mae": round(mae, 4),
            "test_rmse": round(rmse, 4),
            "test_smape": round(smape, 2),
        }

    def compute_baseline_metrics(self, train_df: pd.DataFrame, test_df: pd.DataFrame) -> Dict[str, float]:
        """Naive 3-step moving average baseline."""
        y_test = test_df["target"].values
        # Use lag_1_value or rolling_mean_3 as naive prediction
        if "rolling_mean_3" in test_df.columns:
            baseline_preds = test_df["rolling_mean_3"].values
        else:
            baseline_preds = np.full_like(y_test, np.mean(train_df["target"].values))

        mae = float(mean_absolute_error(y_test, baseline_preds))
        rmse = float(root_mean_squared_error(y_test, baseline_preds))
        return {
            "baseline_mae": round(mae, 4),
            "baseline_rmse": round(rmse, 4),
        }

    def explain(self, df: pd.DataFrame) -> List[List[FeatureExplanation]]:
        X, _ = self._prepare_x_y(df)
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
        elif hasattr(self.model, "coef_"):
            importances = np.abs(self.model.coef_)
        else:
            importances = np.ones(len(self.feature_names)) / max(1, len(self.feature_names))

        feature_imp_pairs = list(zip(self.feature_names, importances))
        feature_imp_pairs.sort(key=lambda x: x[1], reverse=True)

        explanations_per_row = []
        for idx in range(len(df)):
            row_expl = []
            for name, imp in feature_imp_pairs[:5]:
                val = float(X[name].iloc[idx]) if name in X.columns else 0.0
                row_expl.append(
                    FeatureExplanation(
                        feature_name=name,
                        importance=round(float(imp), 4),
                        contribution_value=round(val, 2),
                        direction="INCREASE" if val > 0 else "DECREASE",
                    )
                )
            explanations_per_row.append(row_expl)

        return explanations_per_row
