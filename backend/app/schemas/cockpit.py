"""
FULFILL-X Decision Cockpit Pydantic v2 Schemas (Phase 10)
Matching docs/DECISION_COCKPIT_SPEC.md & docs/PRODUCT_SPEC.md
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional, Any
from uuid import uuid4
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.world import WorldStateSnapshot
from app.schemas.signal import Signal
from app.schemas.risk import RiskScoreMap
from app.schemas.agent import AgentResult
from app.schemas.coordinator import CoordinatorResult, CandidatePlan
from app.schemas.adversary import AdversaryReport
from app.schemas.planner import PlannerReport
from app.schemas.verification import VerificationReport, VerificationStatus


class DecisionStage(str, Enum):
    OBSERVING = "OBSERVING"
    ANALYZING_RISK = "ANALYZING_RISK"
    RUNNING_SPECIALISTS = "RUNNING_SPECIALISTS"
    COORDINATING = "COORDINATING"
    ADVERSARIAL_TESTING = "ADVERSARIAL_TESTING"
    OPTIMIZING = "OPTIMIZING"
    VERIFYING = "VERIFYING"
    READY_FOR_APPROVAL = "READY_FOR_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"


class DecisionStageStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"


class DecisionWorkflowStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"
    PARTIAL = "PARTIAL"


class DecisionStageRecord(BaseModel):
    model_config = ConfigDict(frozen=True)

    stage: DecisionStage = Field(..., description="Workflow stage identifier")
    status: DecisionStageStatus = Field(default=DecisionStageStatus.NOT_STARTED, description="Stage execution status")
    start_time: Optional[datetime] = Field(default=None, description="Stage execution start timestamp")
    end_time: Optional[datetime] = Field(default=None, description="Stage execution completion timestamp")
    duration_ms: float = Field(default=0.0, description="Stage duration in milliseconds")
    summary: str = Field(default="", description="Key output summary of the stage")
    key_metrics: Dict[str, Any] = Field(default_factory=dict, description="Stage key metrics dictionary")
    errors: List[str] = Field(default_factory=list, description="List of stage error messages")
    warnings: List[str] = Field(default_factory=list, description="List of stage warning messages")


class DecisionTimeline(BaseModel):
    model_config = ConfigDict(frozen=True)

    stages: List[DecisionStageRecord] = Field(default_factory=list, description="Ordered stage records")


class EvidenceLink(BaseModel):
    model_config = ConfigDict(frozen=True)

    evidence_id: str = Field(default_factory=lambda: f"ev-{uuid4().hex[:8]}", description="Unique evidence ID")
    source_stage: DecisionStage = Field(..., description="Stage where evidence originated")
    entity_type: str = Field(..., description="Type of entity (e.g. signal, risk_node, proposal, plan, attack, verification)")
    entity_id: str = Field(..., description="Target entity identifier")
    title: str = Field(..., description="Short evidence title")
    description: str = Field(..., description="Detailed evidence description")
    provenance_chain: List[str] = Field(default_factory=list, description="Traceability chain from source to conclusion")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional structured evidence parameters")


class ExecutiveSummary(BaseModel):
    model_config = ConfigDict(frozen=True)

    network_health_score: float = Field(..., ge=0.0, le=1.0, description="Baseline network health score")
    critical_risk_count: int = Field(..., ge=0, description="Count of critical risk nodes/signals")
    affected_node_count: int = Field(..., ge=0, description="Count of elevated risk nodes")
    active_disruption_count: int = Field(..., ge=0, description="Count of active disruptions")
    specialist_proposal_count: int = Field(..., ge=0, description="Total proposals from specialist agents")
    candidate_plan_count: int = Field(..., ge=0, description="Reconciled candidate plans count")
    adversarial_vulnerability_count: int = Field(..., ge=0, description="Count of red-team vulnerabilities detected")
    pareto_candidate_count: int = Field(..., ge=0, description="Count of non-dominated Pareto plans")
    verification_status: VerificationStatus = Field(..., description="Authoritative verification status")
    verification_pass_rate: float = Field(..., ge=0.0, le=100.0, description="Percentage of passed verification checks")


class ApprovalDecision(BaseModel):
    model_config = ConfigDict(frozen=True)

    decision_id: str = Field(default_factory=lambda: f"dec-{uuid4().hex[:8]}", description="Unique decision ID")
    plan_id: str = Field(..., description="Target candidate plan ID")
    plan_name: str = Field(..., description="Candidate plan name")
    status: str = Field(..., description="Decision outcome ('APPROVED' or 'REJECTED')")
    approver: str = Field(..., description="Approver persona or user string")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Decision timestamp")
    rationale: str = Field(..., description="Human rationale for decision")
    applied_actions_summary: List[str] = Field(default_factory=list, description="Summary of plan actions approved")


class AuditEvent(BaseModel):
    model_config = ConfigDict(frozen=True)

    event_id: str = Field(default_factory=lambda: f"evt-{uuid4().hex[:8]}", description="Audit event ID")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Timestamp")
    actor: str = Field(..., description="System component or human actor")
    stage: DecisionStage = Field(..., description="Associated workflow stage")
    action: str = Field(..., description="Action description")
    details: Dict[str, Any] = Field(default_factory=dict, description="Contextual parameters")


class CockpitError(BaseModel):
    model_config = ConfigDict(frozen=True)

    error_id: str = Field(default_factory=lambda: f"err-{uuid4().hex[:8]}", description="Error ID")
    stage: DecisionStage = Field(..., description="Workflow stage where error occurred")
    code: str = Field(..., description="Error classification code")
    message: str = Field(..., description="User-facing error description")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Error timestamp")


class DecisionSession(BaseModel):
    model_config = ConfigDict(frozen=True)

    session_id: str = Field(default_factory=lambda: f"sess-{uuid4().hex[:8]}", description="Unique decision session ID")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Session creation time")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Session last update time")
    current_stage: DecisionStage = Field(default=DecisionStage.OBSERVING, description="Current workflow stage")
    workflow_status: DecisionWorkflowStatus = Field(default=DecisionWorkflowStatus.IN_PROGRESS, description="Overall workflow status")
    world_snapshot: WorldStateSnapshot = Field(..., description="Baseline world snapshot")
    active_signals: List[Signal] = Field(default_factory=list, description="Active ingested signals")
    active_risks: Optional[RiskScoreMap] = Field(default=None, description="Current risk map")
    specialist_proposals: Dict[str, AgentResult] = Field(default_factory=dict, description="Specialist agent proposals")
    coordination_result: Optional[CoordinatorResult] = Field(default=None, description="Reconciled coordinator result")
    adversary_report: Optional[AdversaryReport] = Field(default=None, description="Adversary red-team stress report")
    planner_report: Optional[PlannerReport] = Field(default=None, description="Multi-objective optimization report")
    verification_report: Optional[VerificationReport] = Field(default=None, description="Authoritative verification report")
    approval_decision: Optional[ApprovalDecision] = Field(default=None, description="Human approval decision")
    timeline: DecisionTimeline = Field(default_factory=DecisionTimeline, description="Stage execution timeline")
    summary: Optional[ExecutiveSummary] = Field(default=None, description="Executive summary dashboard metrics")
    evidence_chain: List[EvidenceLink] = Field(default_factory=list, description="Traceable evidence links")
    audit_trail: List[AuditEvent] = Field(default_factory=list, description="Chronological audit event trail")
    errors: List[CockpitError] = Field(default_factory=list, description="Logged cockpit errors")


class SessionCreateRequest(BaseModel):
    preset: str = Field(default="healthy", description="World preset ('healthy', 'double_punch')")
    seed: int = Field(default=42, description="Random seed for reproducibility")


class SessionRunRequest(BaseModel):
    target_stage: Optional[DecisionStage] = Field(default=None, description="Specific stage to run, or None for full loop")


class SessionApproveRequest(BaseModel):
    plan_id: str = Field(..., description="ID of selected candidate plan to approve")
    approver: str = Field(default="Chief Supply Chain Officer", description="Approver identifier")
    rationale: str = Field(default="Plan verified and satisfies all operational safety constraints.", description="Reason for approval")


class SessionRejectRequest(BaseModel):
    plan_id: str = Field(..., description="ID of candidate plan to reject")
    approver: str = Field(default="Chief Risk Officer", description="Rejecter identifier")
    rationale: str = Field(..., description="Reason for rejection")


class CockpitStatusResponse(BaseModel):
    status: str = Field(..., description="Cockpit engine health status")
    active_sessions_count: int = Field(..., description="Count of active in-memory sessions")
    state_mutation_safety: bool = Field(default=True, description="State immutability assertion boolean")
    version: str = Field(default="0.2.0", description="Engine version")
