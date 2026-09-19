"""
FULFILL-X Predictive ML Platform ORM Models (Phase 6)
Database models for datasets, model registry entries, prediction records, and drift reports.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Index, JSON, Float, Boolean, Integer
from app.db.session import Base


class MLDatasetModel(Base):
    __tablename__ = "ml_datasets"

    id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), nullable=False, default="org-fulfillx-default", index=True)
    label_definition = Column(String(128), nullable=False)
    record_count = Column(Integer, nullable=False, default=0)
    time_range_start = Column(DateTime(timezone=True), nullable=False)
    time_range_end = Column(DateTime(timezone=True), nullable=False)
    generation_mode = Column(String(32), nullable=False, default="SYNTHETIC")
    seed = Column(Integer, nullable=False, default=42)
    quality_score = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    metadata_json = Column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_ml_datasets_org_created", "organization_id", "created_at"),
    )


class MLModelRecordModel(Base):
    __tablename__ = "ml_models"

    id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), nullable=False, default="org-fulfillx-default", index=True)
    model_name = Column(String(128), nullable=False)
    model_version = Column(String(32), nullable=False)
    task_type = Column(String(64), nullable=False, index=True)
    algorithm = Column(String(64), nullable=False)
    feature_schema_version = Column(String(32), nullable=False, default="v1.0.0")
    training_dataset_id = Column(String(64), nullable=False)
    metrics_json = Column(JSON, nullable=True)
    baseline_metrics_json = Column(JSON, nullable=True)
    is_baseline_preferred = Column(Boolean, nullable=False, default=False)
    status = Column(String(32), nullable=False, default="TRAINED", index=True)
    artifact_location = Column(String(256), nullable=False)
    checksum = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_ml_models_org_task_status", "organization_id", "task_type", "status"),
    )


class MLPredictionRecordModel(Base):
    __tablename__ = "ml_predictions"

    id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), nullable=False, default="org-fulfillx-default", index=True)
    model_id = Column(String(64), nullable=False, index=True)
    model_version = Column(String(32), nullable=False)
    task_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=False, index=True)
    horizon = Column(String(16), nullable=False, default="24h")
    predicted_value = Column(Float, nullable=True)
    disruption_probability = Column(Float, nullable=True)
    anomaly_score = Column(Float, nullable=True)
    is_anomaly = Column(Boolean, nullable=True)
    confidence = Column(Float, nullable=False, default=1.0)
    generated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    payload_json = Column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_ml_predictions_org_entity_gen", "organization_id", "entity_id", "generated_at"),
    )


class MLDriftRecordModel(Base):
    __tablename__ = "ml_drift_reports"

    id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), nullable=False, default="org-fulfillx-default", index=True)
    model_id = Column(String(64), nullable=False, index=True)
    model_version = Column(String(32), nullable=False)
    prediction_drift_score = Column(Float, nullable=False, default=0.0)
    overall_status = Column(String(32), nullable=False, default="HEALTHY")
    evaluated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    details_json = Column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_ml_drift_org_model_eval", "organization_id", "model_id", "evaluated_at"),
    )
