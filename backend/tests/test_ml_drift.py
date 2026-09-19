"""
FULFILL-X Drift Detector Unit Tests (Phase 6)
"""
import pytest
import numpy as np
import pandas as pd
from app.ml.drift import DriftDetector
from app.ml.schemas import DriftStatus


def test_calculate_psi():
    ref = np.random.normal(50.0, 5.0, 100)
    curr_same = np.random.normal(50.0, 5.0, 100)
    psi_low = DriftDetector.calculate_psi(ref, curr_same)
    assert psi_low < 0.15

    curr_shifted = np.random.normal(80.0, 5.0, 100)
    psi_high = DriftDetector.calculate_psi(ref, curr_shifted)
    assert psi_high > 0.25


def test_evaluate_drift():
    ref_df = pd.DataFrame({"capacity_utilization": np.random.normal(0.65, 0.05, 100)})
    curr_df = pd.DataFrame({"capacity_utilization": np.random.normal(0.65, 0.05, 100)})

    report = DriftDetector.evaluate_drift("org-test", "mdl-test", "1.0.0", ref_df, curr_df)
    assert report.overall_status in (DriftStatus.HEALTHY, DriftStatus.WARNING)
    assert "capacity_utilization" in report.feature_drift_scores
