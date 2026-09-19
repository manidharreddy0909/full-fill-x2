"""
FULFILL-X Model Trainer Pipeline (Phase 6)
Orchestrates training, validation, evaluation, naive baseline comparison, and artifact creation.
"""
import os
import hashlib
import joblib
import logging
from datetime import datetime, timezone
from typing import Dict, Tuple, Optional, Any
from app.ml.schemas import MLTaskType, ModelLifecycleStatus, ModelMetadata
from app.ml.datasets import DeterministicDatasetGenerator
from app.ml.models import DemandForecastingModel, DisruptionProbabilityModel, OperationalAnomalyDetector

logger = logging.getLogger("fulfillx.ml.training")


class ModelTrainer:
    """
    Model Training orchestrator with mandatory Naive Baseline comparison safeguard.
    """

    ARTIFACT_DIR = os.path.join(os.getcwd(), "artifacts", "models")

    @classmethod
    def train_and_validate(
        cls,
        task_type: MLTaskType,
        algorithm: str = "default",
        organization_id: str = "org-fulfillx-default",
        record_count: int = 500,
        seed: int = 42,
    ) -> Tuple[ModelMetadata, Any]:
        """
        Train predictive model, evaluate against test split and naive baseline.
        Returns (metadata, model_instance).
        """
        os.makedirs(cls.ARTIFACT_DIR, exist_ok=True)

        # Generate dataset
        meta_ds, full_df, (train_df, val_df, test_df) = DeterministicDatasetGenerator.generate_dataset(
            task_type=task_type,
            organization_id=organization_id,
            record_count=record_count,
            seed=seed,
        )

        model_id = f"mdl-{task_type.value.lower()}-{seed}"

        # Instantiate algorithm
        if task_type == MLTaskType.DEMAND_FORECASTING:
            model = DemandForecastingModel(model_id=model_id, algorithm=algorithm, seed=seed)
        elif task_type == MLTaskType.DISRUPTION_PROBABILITY:
            model = DisruptionProbabilityModel(model_id=model_id, algorithm=algorithm, seed=seed)
        else:
            model = OperationalAnomalyDetector(model_id=model_id, algorithm=algorithm, seed=seed)

        # Train & Evaluate
        train_metrics = model.train(train_df, val_df)
        test_metrics = model.evaluate(test_df)
        baseline_metrics = model.compute_baseline_metrics(train_df, test_df)

        all_metrics = {**train_metrics, **test_metrics}

        # Compare ML vs Baseline
        is_baseline_preferred = cls._evaluate_baseline_comparison(task_type, test_metrics, baseline_metrics)

        # Serialize model artifact cleanly
        artifact_path = os.path.join(cls.ARTIFACT_DIR, f"{model_id}.joblib")
        joblib.dump(model, artifact_path)

        # Compute checksum
        hasher = hashlib.sha256()
        with open(artifact_path, "rb") as f:
            hasher.update(f.read())
        checksum = hasher.hexdigest()

        status = ModelLifecycleStatus.VALIDATED if not is_baseline_preferred else ModelLifecycleStatus.CANDIDATE

        metadata = ModelMetadata(
            model_id=model_id,
            model_name=f"{task_type.value.replace('_', ' ').title()} Model",
            model_version="1.0.0",
            task_type=task_type,
            algorithm=model.algorithm,
            feature_schema_version="v1.0.0",
            training_dataset_id=meta_ds.dataset_id,
            metrics=all_metrics,
            baseline_metrics=baseline_metrics,
            is_baseline_preferred=is_baseline_preferred,
            status=status,
            created_at=datetime.now(timezone.utc),
            artifact_location=artifact_path,
            checksum=checksum,
            organization_id=organization_id,
        )

        logger.info(f"Model {model_id} trained & validated. Baseline preferred: {is_baseline_preferred}")
        return metadata, model

    @staticmethod
    def _evaluate_baseline_comparison(
        task_type: MLTaskType, test_metrics: Dict[str, float], baseline_metrics: Dict[str, float]
    ) -> bool:
        """Return True if naive baseline outperforms trained ML model."""
        if task_type == MLTaskType.DEMAND_FORECASTING:
            ml_mae = test_metrics.get("test_mae", 999.0)
            base_mae = baseline_metrics.get("baseline_mae", 0.0)
            return ml_mae > base_mae
        elif task_type == MLTaskType.DISRUPTION_PROBABILITY:
            ml_brier = test_metrics.get("test_brier", 1.0)
            base_brier = baseline_metrics.get("baseline_brier", 0.0)
            return ml_brier > base_brier
        else:
            ml_p = test_metrics.get("test_precision", 0.0)
            base_p = baseline_metrics.get("baseline_precision", 1.0)
            return ml_p < base_p
