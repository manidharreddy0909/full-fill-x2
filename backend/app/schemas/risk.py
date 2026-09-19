"""
FULFILL-X Risk Engine Pydantic Schemas
Matching docs/RISK_ENGINE_SPEC.md & docs/DATA_MODEL.md (P03-006 & P03-009)
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from app.schemas.world import NodeRiskScores


class RiskLevel(str, Enum):
    LOW = "LOW"            # composite < 0.25
    MEDIUM = "MEDIUM"      # 0.25 <= composite < 0.60
    HIGH = "HIGH"          # 0.60 <= composite < 0.85
    CRITICAL = "CRITICAL"  # composite >= 0.85


class SignalContribution(BaseModel):
    signal_id: str = Field(..., description="Signal or FusedSignal ID")
    signal_type: str = Field(..., description="SignalType value")
    signal_severity: str = Field(..., description="SignalSeverity value")
    contribution: float = Field(..., ge=0.0, le=1.0, description="Calculated risk contribution [0,1]")
    is_direct: bool = Field(default=True, description="Direct impact vs propagated")


class RiskExplanation(BaseModel):
    node_id: str = Field(..., description="Target node ID")
    node_name: str = Field(..., description="Target node name")
    composite: float = Field(..., ge=0.0, le=1.0, description="Composite risk score [0,1]")
    risk_level: RiskLevel = Field(..., description="Risk severity level band")
    contributing_signals: list[SignalContribution] = Field(default_factory=list, description="Traceable contributing signals")
    propagated_from: list[str] = Field(default_factory=list, description="Upstream node IDs that propagated risk")
    affected_downstream_nodes: list[str] = Field(default_factory=list, description="Downstream node IDs affected")
    dominant_dimension: str = Field(default="operational", description="Highest dimensional risk driver")
    explanation_text: str = Field(..., description="Deterministic operational summary text")


class NodeRiskDetail(BaseModel):
    node_id: str
    node_name: str
    risk_scores: NodeRiskScores
    risk_level: RiskLevel
    explanation: RiskExplanation


class RiskScoreMap(BaseModel):
    snapshot_id: UUID = Field(default_factory=uuid4)
    computed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    node_risks: dict[str, NodeRiskScores] = Field(default_factory=dict)
    edge_risks: dict[str, float] = Field(default_factory=dict)
    explanations: dict[str, RiskExplanation] = Field(default_factory=dict)
    network_health: float = Field(default=1.0, ge=0.0, le=1.0)
    highest_risk_nodes: list[str] = Field(default_factory=list)
