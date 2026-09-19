"""
FULFILL-X Signal Pydantic Schemas
Matching docs/DATA_MODEL.md & docs/RISK_ENGINE_SPEC.md (P03-002)
"""
from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, field_validator, ConfigDict


class SignalType(str, Enum):
    WEATHER = "WEATHER"
    GEOPOLITICAL = "GEOPOLITICAL"
    SUPPLIER_HEALTH = "SUPPLIER_HEALTH"
    DEMAND_SHIFT = "DEMAND_SHIFT"
    LOGISTICS = "LOGISTICS"
    REGULATORY = "REGULATORY"
    CYBER = "CYBER"


class SignalSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SignalStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DISMISSED = "DISMISSED"
    PROMOTED = "PROMOTED"
    RESOLVED = "RESOLVED"


class Signal(BaseModel):
    id: UUID = Field(default_factory=uuid4, description="Unique signal UUID")
    type: SignalType = Field(..., description="Type of disruption signal")
    severity: SignalSeverity = Field(default=SignalSeverity.MEDIUM, description="Signal severity level")
    title: str = Field(default="Disruption Signal", max_length=150, description="Signal headline title")
    description: str = Field(default="", description="Detailed signal narrative")
    confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="Confidence rating score [0,1]")
    region: str = Field(default="GLOBAL", description="Geographic region")
    source: str = Field(default="SignalIngestor", description="Data provider or intelligence source")
    affected_node_ids: list[str] = Field(default_factory=list, description="Target node IDs directly impacted")
    affected_edge_ids: list[str] = Field(default_factory=list, description="Target edge IDs directly impacted")
    geographic_scope: dict[str, Any] = Field(default_factory=dict, description="GeoJSON coordinates or area")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Signal detection timestamp")
    expires_at: datetime | None = Field(default=None, description="Expiration timestamp")
    status: SignalStatus = Field(default=SignalStatus.ACTIVE, description="Signal lifecycle status")
    raw_data: dict[str, Any] = Field(default_factory=dict, description="Unstructured source payload")

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: float) -> float:
        if isinstance(v, (int, float)):
            return max(0.0, min(1.0, float(v)))
        return v


class SignalCreateRequest(BaseModel):
    type: SignalType
    severity: SignalSeverity = SignalSeverity.MEDIUM
    title: str
    description: str = ""
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    region: str = "GLOBAL"
    source: str = "SyntheticSignalProvider"
    affected_node_ids: list[str] = []
    affected_edge_ids: list[str] = []
    expires_in_hours: float | None = 72.0


class FusedSignal(BaseModel):
    fused_id: str = Field(..., description="Derived fused signal identifier")
    type: SignalType = Field(..., description="Signal type")
    target_node_id: str = Field(..., description="Affected target node ID")
    severity: SignalSeverity = Field(..., description="Max severity across fused group")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Fused compound confidence = 1 - ∏(1 - c_i)")
    contributing_signal_ids: list[UUID] = Field(..., description="Original signal UUIDs fused into this canonical signal")
    earliest_timestamp: datetime = Field(..., description="Earliest detection time")
    latest_timestamp: datetime = Field(..., description="Latest detection time")
    titles: list[str] = Field(default_factory=list, description="Aggregated signal headlines")
