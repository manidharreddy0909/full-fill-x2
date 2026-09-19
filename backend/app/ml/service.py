"""
FULFILL-X ML Platform Orchestration Service (Phase 6)
Integrates training jobs, feature engineering, registry lifecycle, inference, drift, and model cards.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from app.ml.schemas import (
    MLTaskType, ModelLifecycleStatus, ModelMetadata, Prediction, PredictionHorizon,
    DriftReport, ModelCard, TrainingJobConfig, TrainingJobSummary
)
from app.ml.training import ModelTrainer
from app.ml.registry import LocalModelRegistry
from app.ml.inference import PredictionService
from app.ml.drift import DriftDetector
from app.ml.datasets import DeterministicDatasetGenerator

logger = logging.getLogger("fulfillx.ml.service")


class MLPlatformService:
    """
    Singleton service managing end-to-end ML platform operations.
    """

    _instance: Optional["MLPlatformService"] = None

    def __init__(self):
        self.registry = LocalModelRegistry.get_instance()
        self.jobs: Dict[str, TrainingJobSummary] = {}
        self._ensure_default_models()

    @classmethod
    def get_instance(cls) -> "MLPlatformService":
        if cls._instance is None:
            cls._instance = MLPlatformService()
        return cls._instance

    def _ensure_default_models(self) -> None:
        """Initialize default validated Tier A local baseline models if empty."""
        org_id = "org-fulfillx-default"
        for task in [MLTaskType.DEMAND_FORECASTING, MLTaskType.DISRUPTION_PROBABILITY, MLTaskType.ANOMALY_DETECTION]:
            if not self.registry.get_active_model(org_id, task):
                try:
                    meta, model = ModelTrainer.train_and_validate(task_type=task, organization_id=org_id, seed=42)
                    self.registry.register_model(meta, model)
                    self.registry.activate_model(org_id, meta.model_id)
                    logger.info(f"Default ML model for '{task.value}' initialized & activated.")
                except Exception as ex:
                    logger.warning(f"Could not train default ML model for '{task.value}': {ex}")

    def trigger_training_job(self, config: TrainingJobConfig) -> TrainingJobSummary:
        """Launch background model training job."""
        job_id = f"job-{uuid.uuid4().hex[:8]}"
        summary = TrainingJobSummary(
            job_id=job_id,
            organization_id=config.organization_id,
            task_type=config.task_type,
            status="RUNNING",
            started_at=datetime.now(timezone.utc),
        )
        self.jobs[job_id] = summary

        try:
            meta, model = ModelTrainer.train_and_validate(
                task_type=config.task_type,
                algorithm=config.algorithm or "default",
                organization_id=config.organization_id,
                seed=config.random_seed,
            )
            self.registry.register_model(meta, model)
            
            summary.status = "COMPLETED"
            summary.completed_at = datetime.now(timezone.utc)
            summary.trained_model_id = meta.model_id
            summary.metrics = meta.metrics
            logger.info(f"Training job '{job_id}' completed for model '{meta.model_id}'")
        except Exception as ex:
            summary.status = "FAILED"
            summary.completed_at = datetime.now(timezone.utc)
            summary.error_message = str(ex)
            logger.error(f"Training job '{job_id}' failed: {ex}")

        return summary

    def get_job_summary(self, job_id: str) -> Optional[TrainingJobSummary]:
        return self.jobs.get(job_id)

    async def generate_prediction(
        self,
        organization_id: str,
        entity_id: str,
        task_type: MLTaskType,
        horizon: PredictionHorizon = PredictionHorizon.H24,
        operational_data: Optional[Dict[str, float]] = None,
    ) -> Prediction:
        """Generate prediction for an entity."""
        return await PredictionService.predict_entity(
            organization_id=organization_id,
            entity_id=entity_id,
            task_type=task_type,
            horizon=horizon,
            operational_data=operational_data,
        )

    def evaluate_model_drift(self, organization_id: str, model_id: str) -> Optional[DriftReport]:
        meta = self.registry.get_metadata(model_id)
        if not meta:
            return None

        # Generate reference vs current test datasets
        _, ref_df, _ = DeterministicDatasetGenerator.generate_dataset(meta.task_type, organization_id, record_count=100, seed=42)
        _, curr_df, _ = DeterministicDatasetGenerator.generate_dataset(meta.task_type, organization_id, record_count=100, seed=99)

        return DriftDetector.evaluate_drift(organization_id, model_id, meta.model_version, ref_df, curr_df)

    def get_model_card(self, model_id: str) -> Optional[ModelCard]:
        meta = self.registry.get_metadata(model_id)
        if not meta:
            return None

        return ModelCard(
            model_id=meta.model_id,
            model_name=meta.model_name,
            version=meta.model_version,
            purpose=f"Predictive ML model for {meta.task_type.value}",
            training_data_summary=f"Dataset {meta.training_dataset_id} with 500 records",
            features_used=["capacity_utilization", "lead_time_hours", "recent_risk_score", "external_signal_count"],
            evaluation_metrics=meta.metrics,
            limitations=["Local Free-First training dataset", "Evaluated on Seed 42 benchmark"],
            known_failure_modes=["Extreme unexpected black swan disruptions beyond feature distribution"],
            prohibited_uses=["Unvalidated direct state mutation without deterministic Risk Engine approval"],
            created_at=meta.created_at,
            owner="fulfillx-ml-team",
        )

    def reset(self) -> None:
        self.registry.reset()
        self.jobs.clear()
        self._ensure_default_models()
