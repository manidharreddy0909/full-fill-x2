"""
FULFILL-X Local Model Registry Unit Tests (Phase 6)
"""
import pytest
from app.ml.schemas import MLTaskType, ModelLifecycleStatus, ModelMetadata
from app.ml.registry import LocalModelRegistry
from app.ml.training import ModelTrainer


def test_model_registry_lifecycle():
    registry = LocalModelRegistry()
    registry.reset()

    meta1, model1 = ModelTrainer.train_and_validate(MLTaskType.DEMAND_FORECASTING, seed=42)
    meta2, model2 = ModelTrainer.train_and_validate(MLTaskType.DEMAND_FORECASTING, seed=99)

    registry.register_model(meta1, model1)
    registry.register_model(meta2, model2)

    # Activate meta1
    activated = registry.activate_model("org-test", meta1.model_id)
    assert activated

    active_tuple = registry.get_active_model("org-test", MLTaskType.DEMAND_FORECASTING)
    assert active_tuple is not None
    assert active_tuple[0].model_id == meta1.model_id

    # Activate meta2
    registry.activate_model("org-test", meta2.model_id)
    active_tuple2 = registry.get_active_model("org-test", MLTaskType.DEMAND_FORECASTING)
    assert active_tuple2[0].model_id == meta2.model_id

    # Rollback to meta1
    rolled = registry.rollback_model("org-test", MLTaskType.DEMAND_FORECASTING)
    assert rolled
    active_tuple3 = registry.get_active_model("org-test", MLTaskType.DEMAND_FORECASTING)
    assert active_tuple3[0].model_id == meta1.model_id
