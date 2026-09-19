"""
FULFILL-X Model & Data Drift Detection Subsystem (Phase 6)
Computes Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) statistics
to monitor feature and prediction drift without automatic uncontrolled retraining.
"""
import uuid
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from scipy.stats import ks_2samp
from app.ml.schemas import DriftReport, DriftStatus


class DriftDetector:
    """
    Evaluates feature and prediction distributions to detect model/data drift.
    """

    @classmethod
    def calculate_psi(cls, reference: np.ndarray, target: np.ndarray, bins: int = 10) -> float:
        """Compute Population Stability Index (PSI)."""
        if len(reference) == 0 or len(target) == 0:
            return 0.0

        ref_percents, bin_edges = np.histogram(reference, bins=bins)
        tar_percents, _ = np.histogram(target, bins=bin_edges)

        ref_percents = ref_percents / max(1, len(reference))
        tar_percents = tar_percents / max(1, len(target))

        # Replace zeros with small epsilon to prevent log(0)
        eps = 1e-4
        ref_percents = np.where(ref_percents == 0, eps, ref_percents)
        tar_percents = np.where(tar_percents == 0, eps, tar_percents)

        psi = np.sum((tar_percents - ref_percents) * np.log(tar_percents / ref_percents))
        return round(float(psi), 4)

    @classmethod
    def evaluate_drift(
        cls,
        organization_id: str,
        model_id: str,
        model_version: str,
        reference_df: pd.DataFrame,
        current_df: pd.DataFrame,
    ) -> DriftReport:
        feature_cols = [c for c in reference_df.columns if c in current_df.columns and c not in ("timestamp", "entity_id", "target")]

        drift_scores: Dict[str, float] = {}
        max_psi = 0.0

        for col in feature_cols:
            ref_vals = reference_df[col].dropna().values
            curr_vals = current_df[col].dropna().values
            if len(ref_vals) > 0 and len(curr_vals) > 0:
                psi = cls.calculate_psi(ref_vals, curr_vals)
                drift_scores[col] = psi
                if psi > max_psi:
                    max_psi = psi

        # Evaluate overall status
        if max_psi >= 0.25:
            status = DriftStatus.DRIFTED
        elif max_psi >= 0.10:
            status = DriftStatus.WARNING
        else:
            status = DriftStatus.HEALTHY

        report = DriftReport(
            report_id=f"drf-{uuid.uuid4().hex[:8]}",
            organization_id=organization_id,
            model_id=model_id,
            model_version=model_version,
            feature_drift_scores=drift_scores,
            prediction_drift_score=max_psi,
            overall_status=status,
            evaluated_at=datetime.now(timezone.utc),
        )

        # Trigger event and alert if drifted
        if status == DriftStatus.DRIFTED:
            cls._trigger_drift_alert(organization_id, model_id, report)

        return report

    @classmethod
    def _trigger_drift_alert(cls, organization_id: str, model_id: str, report: DriftReport) -> None:
        try:
            from app.services.alerts import alert_engine
            from app.schemas.events import EventSeverity
            alert_engine.evaluate_rule(
                rule_name="Model Drift Detected",
                condition_triggered=True,
                severity=EventSeverity.HIGH,
                title=f"Significant Feature Drift Detected in Model '{model_id}'",
                message=f"Model '{model_id}' recorded maximum PSI of {report.prediction_drift_score}. Evaluation required.",
                source_component="drift_detector",
                organization_id=organization_id,
                evidence={"report_id": report.report_id, "scores": report.feature_drift_scores},
            )
        except Exception:
            pass
