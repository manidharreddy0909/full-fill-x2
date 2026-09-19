"""
FULFILL-X Predictive AI / ML Platform Pydantic v2 Schemas (Phase 6)
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, ConfigDict


class MLTaskType(str, Enum):
    DEMAND_FORECASTING = "DEMAND_FORECASTING"
    DISRUPTION_PROBABILITY = "DISRUPTION_PROBABILITY"
    ANOMALY_DETECTION = "ANOMALY_DETECTION"


class ModelLifecycleStatus(str, Enum):
    TRAINED = "TRAINED"
    VALIDATED = "VALIDATED"
    CANDIDATE = "CANDIDATE"
    ACTIVE = "ACTIVE"
    RETIRED = "RETIRED"
    REJECTED = "REJECTED"


class DatasetGenerationMode(str, Enum):
    SYNTHETIC = "SYNTHETIC"
    REPLAY = "REPLAY"
    LIVE = "LIVE"


class DriftStatus(str, Enum):
    HEALTHY = "HEALTHY"
    WARNING = "WARNING"
    DRIFTED = "DRIFTED"


class PredictionHorizon(str, Enum):
    H6 = "6h"
    H12 = "12h"
    H24 = "24h"
    H48 = "48h"
    D7 = "7d"


class FeatureSet(BaseModel):
    """Container for computed features for a single entity and timestamp."""
    feature_schema_version: str = "v1.0.0"
    entity_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    numerical_features: Dict[str, float] = Field(default_factory=dict)
    categorical_features: Dict[str, str] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DatasetMetadata(BaseModel):
    """Metadata for a generated ML training or benchmark dataset."""
    dataset_id: str
    organization_id: str = "org-fulfillx-default"
    source_ids: List[str] = Field(default_factory=list)
    feature_schema_version: str = "v1.0.0"
    label_definition: str
    record_count: int
    time_range_start: datetime
    time_range_end: datetime
    generation_mode: DatasetGenerationMode = DatasetGenerationMode.SYNTHETIC
    seed: int = 42
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    quality_score: float = 1.0
    provenance_id: Optional[str] = None


class ModelMetadata(BaseModel):
    """Metadata describing a trained ML model in the registry."""
    model_config = ConfigDict(protected_namespaces=())
    model_id: str
    model_name: str
    model_version: str
    task_type: MLTaskType
    algorithm: str
    feature_schema_version: str = "v1.0.0"
    training_dataset_id: str
    metrics: Dict[str, float] = Field(default_factory=dict)
    baseline_metrics: Dict[str, float] = Field(default_factory=dict)
    is_baseline_preferred: bool = False
    status: ModelLifecycleStatus = ModelLifecycleStatus.TRAINED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    artifact_location: str
    checksum: str
    organization_id: str = "org-fulfillx-default"


class UncertaintyEstimate(BaseModel):
    """Quantified uncertainty metrics for predictions."""
    confidence: float = Field(..., ge=0.0, le=1.0)
    prediction_interval_lower: Optional[float] = None
    prediction_interval_upper: Optional[float] = None
    std_dev: Optional[float] = None
    is_calibrated: bool = True


class FeatureExplanation(BaseModel):
    """Individual feature importance and contribution to a prediction."""
    feature_name: str
    importance: float
    contribution_value: float
    direction: str  # "INCREASE" or "DECREASE"


class Prediction(BaseModel):
    """Authoritative prediction result container."""
    model_config = ConfigDict(protected_namespaces=())
    prediction_id: str
    organization_id: str = "org-fulfillx-default"
    model_id: str
    model_version: str
    task_type: MLTaskType
    entity_id: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    horizon: PredictionHorizon = PredictionHorizon.H24
    predicted_value: Optional[float] = None
    disruption_probability: Optional[float] = None
    anomaly_score: Optional[float] = None
    is_anomaly: Optional[bool] = None
    uncertainty: UncertaintyEstimate
    explanations: List[FeatureExplanation] = Field(default_factory=list)
    human_explanation: str
    feature_schema_version: str = "v1.0.0"
    provenance_id: Optional[str] = None


class DriftReport(BaseModel):
    """Data and prediction drift monitoring report."""
    model_config = ConfigDict(protected_namespaces=())
    report_id: str
    organization_id: str = "org-fulfillx-default"
    model_id: str
    model_version: str
    feature_drift_scores: Dict[str, float] = Field(default_factory=dict)
    prediction_drift_score: float = 0.0
    overall_status: DriftStatus = DriftStatus.HEALTHY
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ModelCard(BaseModel):
    """Structured Model Card for transparency, governance, and auditing."""
    model_config = ConfigDict(protected_namespaces=())
    model_id: str
    model_name: str
    version: str
    purpose: str
    training_data_summary: str
    features_used: List[str]
    evaluation_metrics: Dict[str, float]
    limitations: List[str]
    known_failure_modes: List[str]
    prohibited_uses: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    owner: str = "fulfillx-ml-team"


class TrainingJobConfig(BaseModel):
    """Configuration payload for launching an ML model training job."""
    organization_id: str = "org-fulfillx-default"
    task_type: MLTaskType
    algorithm: Optional[str] = None
    dataset_id: Optional[str] = None
    random_seed: int = 42
    hyperparameters: Dict[str, Any] = Field(default_factory=dict)


class TrainingJobSummary(BaseModel):
    """Summary status of an async ML training job."""
    job_id: str
    organization_id: str = "org-fulfillx-default"
    task_type: MLTaskType
    status: str  # "QUEUED", "RUNNING", "COMPLETED", "FAILED"
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    trained_model_id: Optional[str] = None
    metrics: Dict[str, float] = Field(default_factory=dict)
    error_message: Optional[str] = None
