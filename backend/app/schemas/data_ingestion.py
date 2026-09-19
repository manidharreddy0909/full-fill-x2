"""
FULFILL-X Real-World Data & Ingestion Schemas (Phase 4)
Matching docs/DATA_INTEGRATION_ARCHITECTURE.md & docs/DATA_ADAPTER_SPEC.md
"""
from enum import Enum
from typing import Any
from datetime import datetime
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, ConfigDict


class DataSourceCategory(str, Enum):
    WEATHER = "WEATHER"
    NATURAL_DISASTER = "NATURAL_DISASTER"
    TRANSPORTATION = "TRANSPORTATION"
    ECONOMIC = "ECONOMIC"
    GEOSPATIAL = "GEOSPATIAL"
    NEWS_WEAK_SIGNAL = "NEWS_WEAK_SIGNAL"
    CUSTOM = "CUSTOM"


class DataSourceType(str, Enum):
    OPEN_METEO = "open_meteo"
    USGS_EARTHQUAKE = "usgs_earthquake"
    OPEN_STREET_MAP = "open_street_map"
    RSS_FEED = "rss_feed"
    CUSTOM_API = "custom_api"
    FIXTURE = "fixture"


class SourceHealthStatus(str, Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    STALE = "STALE"
    FAILING = "FAILING"
    DISABLED = "DISABLED"


class IngestionMode(str, Enum):
    LIVE = "LIVE"
    HYBRID = "HYBRID"
    OFFLINE = "OFFLINE"


class QualityStatus(str, Enum):
    VALID = "VALID"
    DEGRADED = "DEGRADED"
    REJECTED = "REJECTED"


class EntityMatchStatus(str, Enum):
    RESOLVED = "RESOLVED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    UNRESOLVED = "UNRESOLVED"


class DataSourceConfig(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    source_id: str = Field(..., description="Unique identifier for data source")
    name: str = Field(..., description="Human-readable data source name")
    category: DataSourceCategory = Field(..., description="Category classification")
    source_type: DataSourceType = Field(..., description="Adapter implementation type")
    endpoint_url: str = Field(..., description="Target API or RSS URL")
    requires_auth: bool = Field(default=False, description="Whether authentication is required")
    cost_tier: str = Field(default="FREE", description="FREE, LIMITED_FREE, PAID")
    license_type: str = Field(default="OPEN_DATA", description="Open Data Commons, Public Domain, etc.")
    refresh_interval_seconds: int = Field(default=300, ge=10, description="Polling interval")
    enabled: bool = Field(default=True, description="Whether ingestion is active")
    health_status: SourceHealthStatus = Field(default=SourceHealthStatus.HEALTHY, description="Current operational status")
    last_successful_fetch: datetime | None = Field(default=None, description="Timestamp of last fetch")
    last_attempt: datetime | None = Field(default=None, description="Timestamp of last fetch attempt")
    failure_count: int = Field(default=0, description="Consecutive error count")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional settings")


class RawRecord(BaseModel):
    record_id: UUID = Field(default_factory=uuid4, description="Internal record UUID")
    source_id: str = Field(..., description="Origin source identifier")
    source_record_id: str = Field(..., description="Original record ID from external provider")
    organization_id: str = Field(..., description="Tenant organization owner")
    raw_payload: dict[str, Any] = Field(..., description="Unmodified JSON payload")
    ingested_at: datetime = Field(default_factory=datetime.utcnow, description="Ingestion timestamp")
    observed_at: datetime = Field(default_factory=datetime.utcnow, description="External observation timestamp")
    content_hash: str = Field(..., description="SHA-256 hash of raw payload for deduplication")


class ExternalObservation(BaseModel):
    observation_id: UUID = Field(default_factory=uuid4, description="Observation UUID")
    organization_id: str = Field(..., description="Tenant identifier")
    source_id: str = Field(..., description="Data source identifier")
    source_record_id: str = Field(..., description="Provider record ID")
    observed_at: datetime = Field(..., description="Observation timestamp")
    ingested_at: datetime = Field(default_factory=datetime.utcnow, description="Ingestion timestamp")
    latitude: float | None = Field(default=None, description="Geographic latitude")
    longitude: float | None = Field(default=None, description="Geographic longitude")
    location_name: str | None = Field(default=None, description="Location text description")
    observation_type: str = Field(..., description="Category of observation")
    payload: dict[str, Any] = Field(default_factory=dict, description="Normalized metrics")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Source reliability score")
    quality_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Calculated quality score")
    provenance_id: str = Field(..., description="Traceability provenance UUID string")


class ExternalSignal(BaseModel):
    signal_id: UUID = Field(default_factory=uuid4, description="Signal UUID")
    organization_id: str = Field(..., description="Tenant identifier")
    source_id: str = Field(..., description="Data source identifier")
    signal_type: str = Field(..., description="DISRUPTION_STORM, DISRUPTION_EARTHQUAKE, PORT_CONGESTION, etc.")
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Calculated signal confidence")
    timestamp: datetime = Field(..., description="Signal occurrence timestamp")
    latitude: float | None = Field(default=None, description="Signal epicenter latitude")
    longitude: float | None = Field(default=None, description="Signal epicenter longitude")
    affected_entity_ids: list[str] = Field(default_factory=list, description="Resolved canonical graph node IDs")
    evidence: dict[str, Any] = Field(default_factory=dict, description="Supporting metrics and text summary")
    provenance_id: str = Field(..., description="Traceability provenance UUID string")


class EntityResolutionCandidate(BaseModel):
    candidate_id: UUID = Field(default_factory=uuid4, description="Candidate UUID")
    organization_id: str = Field(..., description="Tenant identifier")
    external_entity_name: str = Field(..., description="External entity name or title")
    external_latitude: float | None = Field(default=None, description="External latitude")
    external_longitude: float | None = Field(default=None, description="External longitude")
    matched_node_id: str | None = Field(default=None, description="Candidate canonical graph node ID")
    match_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Match confidence score")
    match_status: EntityMatchStatus = Field(default=EntityMatchStatus.UNRESOLVED, description="Resolution status")
    match_reason: str = Field(default="", description="Matching rationale")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")


class DataQualityReport(BaseModel):
    report_id: UUID = Field(default_factory=uuid4, description="Report UUID")
    organization_id: str = Field(..., description="Tenant identifier")
    source_id: str = Field(..., description="Target source ID")
    run_id: str = Field(..., description="Ingestion run identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Report timestamp")
    completeness_score: float = Field(..., ge=0.0, le=1.0)
    validity_score: float = Field(..., ge=0.0, le=1.0)
    freshness_score: float = Field(..., ge=0.0, le=1.0)
    overall_quality_score: float = Field(..., ge=0.0, le=1.0)
    status: QualityStatus = Field(..., description="VALID, DEGRADED, REJECTED")
    records_evaluated: int = Field(default=0)
    records_accepted: int = Field(default=0)
    records_rejected: int = Field(default=0)
    issues: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class IngestionRunSummary(BaseModel):
    run_id: UUID = Field(default_factory=uuid4, description="Run execution UUID")
    organization_id: str = Field(..., description="Tenant identifier")
    source_id: str = Field(..., description="Data source identifier")
    mode: IngestionMode = Field(..., description="LIVE, HYBRID, OFFLINE")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = Field(default=None)
    records_fetched: int = Field(default=0)
    records_processed: int = Field(default=0)
    records_accepted: int = Field(default=0)
    records_rejected: int = Field(default=0)
    signals_generated: int = Field(default=0)
    latency_ms: float = Field(default=0.0)
    status: str = Field(default="SUCCESS", description="SUCCESS, DEGRADED, FAILED")
    error_message: str | None = Field(default=None)


class DataReplayRequest(BaseModel):
    organization_id: str = Field(default="org-fulfillx-default")
    source_ids: list[str] = Field(default_factory=list)
    start_time: datetime | None = Field(default=None)
    end_time: datetime | None = Field(default=None)
    speed_multiplier: float = Field(default=1.0, ge=0.1, le=10.0)
    seed: int = Field(default=42)
