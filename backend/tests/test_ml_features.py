"""
FULFILL-X Feature Engineering & Feature Store Unit Tests (Phase 6)
"""
import pytest
from datetime import datetime, timezone
from app.ml.features import FeatureExtractor
from app.ml.store import MemoryFeatureStore, FeatureStoreFactory


def test_feature_extractor_lifecycle():
    fset = FeatureExtractor.extract_features(
        entity_id="wh-chicago",
        operational_data={"capacity": 100.0, "current_load": 75.0, "lead_time_hours": 24.0},
        network_stats={"degree": 4},
        historical_values=[40.0, 45.0, 50.0],
    )

    assert fset.entity_id == "wh-chicago"
    assert fset.feature_schema_version == "v1.0.0"
    assert "capacity_utilization" in fset.numerical_features
    assert fset.numerical_features["capacity_utilization"] == 0.75
    assert fset.numerical_features["rolling_mean_3"] == 45.0


def test_feature_store_write_and_read():
    store = MemoryFeatureStore()
    fset = FeatureExtractor.extract_features(entity_id="sup-001")
    store.write_features("org-test", fset)

    latest = store.get_latest_features("org-test", "sup-001")
    assert latest is not None
    assert latest.entity_id == "sup-001"
