"""
FULFILL-X Real-World Data Ingestion SQLAlchemy ORM Models (Phase 4)
Matching docs/DATA_MODEL.md & docs/DATABASE_SPEC.md
"""
from datetime import datetime
from uuid import uuid4
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    JSON,
    Text,
    ForeignKey,
    Index,
    UniqueConstraint,
)
from app.db.base import Base


class DataSourceModel(Base):
    """Configuration and health metrics for external data sources."""

    __tablename__ = "data_sources"

    id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False, index=True)
    source_type = Column(String(64), nullable=False)
    endpoint_url = Column(Text, nullable=False)
    requires_auth = Column(Boolean, default=False)
    cost_tier = Column(String(32), default="FREE")
    license_type = Column(String(64), default="OPEN_DATA")
    refresh_interval_seconds = Column(Integer, default=300)
    enabled = Column(Boolean, default=True, index=True)
    health_status = Column(String(32), default="HEALTHY", index=True)
    last_successful_fetch = Column(DateTime, nullable=True)
    last_attempt = Column(DateTime, nullable=True)
    failure_count = Column(Integer, default=0)
    source_metadata = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SourceRunModel(Base):
    """Log of ingestion execution runs per data source."""

    __tablename__ = "source_runs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid4()))
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    source_id = Column(String(64), ForeignKey("data_sources.id"), nullable=False, index=True)
    mode = Column(String(32), nullable=False, default="OFFLINE")
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    records_fetched = Column(Integer, default=0)
    records_processed = Column(Integer, default=0)
    records_accepted = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    signals_generated = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    status = Column(String(32), default="SUCCESS", index=True)
    error_message = Column(Text, nullable=True)


class RawRecordModel(Base):
    """Unmodified raw payload store for audit, replay, and provenance."""

    __tablename__ = "raw_records"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid4()))
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    source_id = Column(String(64), nullable=False, index=True)
    source_record_id = Column(String(256), nullable=False, index=True)
    content_hash = Column(String(64), nullable=False, index=True)
    raw_payload = Column(JSON, nullable=False)
    ingested_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    observed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("organization_id", "source_id", "content_hash", name="uq_raw_record_hash"),
    )


class ExternalObservationModel(Base):
    """Normalized external observation metric record."""

    __tablename__ = "external_observations"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid4()))
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    source_id = Column(String(64), nullable=False, index=True)
    source_record_id = Column(String(256), nullable=False, index=True)
    observed_at = Column(DateTime, nullable=False, index=True)
    ingested_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(256), nullable=True)
    observation_type = Column(String(64), nullable=False, index=True)
    payload = Column(JSON, nullable=False, default=dict)
    confidence = Column(Float, default=1.0)
    quality_score = Column(Float, default=1.0)
    provenance_id = Column(String(64), nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("organization_id", "source_id", "source_record_id", name="uq_obs_source_record"),
    )


class ExternalSignalModel(Base):
    """Validated external risk signal generated from raw observations."""

    __tablename__ = "external_signals"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid4()))
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    source_id = Column(String(64), nullable=False, index=True)
    signal_type = Column(String(64), nullable=False, index=True)
    severity = Column(String(32), nullable=False, index=True)
    confidence = Column(Float, nullable=False, default=1.0)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    affected_entity_ids = Column(JSON, nullable=False, default=list)
    evidence = Column(JSON, nullable=False, default=dict)
    provenance_id = Column(String(64), nullable=False, index=True)


class EntityResolutionCandidateModel(Base):
    """Mapping proposals matching external names/locations to canonical graph nodes."""

    __tablename__ = "entity_resolution_candidates"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid4()))
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    external_entity_name = Column(String(256), nullable=False, index=True)
    external_latitude = Column(Float, nullable=True)
    external_longitude = Column(Float, nullable=True)
    matched_node_id = Column(String(64), nullable=True, index=True)
    match_score = Column(Float, default=0.0)
    match_status = Column(String(32), default="UNRESOLVED", index=True)
    match_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class EntityAliasModel(Base):
    """Authoritative alias lookup table for entity resolution."""

    __tablename__ = "entity_aliases"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid4()))
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    alias_name = Column(String(256), nullable=False, index=True)
    canonical_node_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("organization_id", "alias_name", name="uq_tenant_entity_alias"),
    )


class DataQualityReportModel(Base):
    """Quality metrics report per ingestion run."""

    __tablename__ = "data_quality_reports"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid4()))
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    source_id = Column(String(64), nullable=False, index=True)
    run_id = Column(String(64), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completeness_score = Column(Float, nullable=False, default=1.0)
    validity_score = Column(Float, nullable=False, default=1.0)
    freshness_score = Column(Float, nullable=False, default=1.0)
    overall_quality_score = Column(Float, nullable=False, default=1.0)
    status = Column(String(32), nullable=False, default="VALID", index=True)
    records_evaluated = Column(Integer, default=0)
    records_accepted = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    issues = Column(JSON, nullable=False, default=list)
    warnings = Column(JSON, nullable=False, default=list)
