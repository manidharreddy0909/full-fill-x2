"""
FULFILL-X Predictive Models Unit Tests (Phase 6)
"""
import pytest
from app.ml.schemas import MLTaskType
from app.ml.datasets import DeterministicDatasetGenerator
from app.ml.models.forecasting import DemandForecastingModel
from app.ml.models.disruption import DisruptionProbabilityModel
from app.ml.models.anomaly import OperationalAnomalyDetector
from app.ml.training import ModelTrainer


def test_demand_forecasting_model():
    meta, df, (train_df, val_df, test_df) = DeterministicDatasetGenerator.generate_dataset(
        MLTaskType.DEMAND_FORECASTING, record_count=200, seed=42
    )
    model = DemandForecastingModel(model_id="test-forecasting", seed=42)
    train_metrics = model.train(train_df, val_df)
    assert "train_mae" in train_metrics
    assert model.is_trained

    preds, uncertainties = model.predict(test_df)
    assert len(preds) == len(test_df)
    assert uncertainties[0].prediction_interval_lower <= preds[0] <= uncertainties[0].prediction_interval_upper

    eval_metrics = model.evaluate(test_df)
    assert "test_mae" in eval_metrics
    assert "test_smape" in eval_metrics


def test_disruption_probability_model():
    meta, df, (train_df, val_df, test_df) = DeterministicDatasetGenerator.generate_dataset(
        MLTaskType.DISRUPTION_PROBABILITY, record_count=200, seed=42
    )
    model = DisruptionProbabilityModel(model_id="test-disruption", seed=42)
    train_metrics = model.train(train_df, val_df)
    assert "train_brier" in train_metrics

    probs, uncertainties = model.predict(test_df)
    assert 0.0 <= probs[0] <= 1.0

    eval_metrics = model.evaluate(test_df)
    assert "test_brier" in eval_metrics


def test_model_trainer_baseline_comparison():
    metadata, model = ModelTrainer.train_and_validate(
        task_type=MLTaskType.DEMAND_FORECASTING, record_count=200, seed=42
    )
    assert metadata.model_id.startswith("mdl-demand_forecasting")
    assert metadata.checksum is not None
    assert "baseline_mae" in metadata.baseline_metrics
