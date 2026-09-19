"""
FULFILL-X Demo Mode Pydantic v2 Schemas (Phase 16)
Defines demo scenario models, state machine statuses, control requests, timelines, and reports.
"""
from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field

from app.schemas.cockpit import DecisionStage, ExecutiveSummary
from app.schemas.evaluation import EvaluationSummary


class DemoScenarioId(str, Enum):
    DEMO_01 = "DEMO-01"  # Supplier Shock
    DEMO_02 = "DEMO-02"  # Port Closure
    DEMO_03 = "DEMO-03"  # Demand Surge
    DEMO_04 = "DEMO-04"  # Compound Fulfillment Crisis
    DEMO_05 = "DEMO-05"  # Full Resilience Challenge (Primary Showcase)


class DemoStatus(str, Enum):
    IDLE = "IDLE"
    INITIALIZING = "INITIALIZING"
    OBSERVING = "OBSERVING"
    RISK_DETECTED = "RISK_DETECTED"
    SCENARIO_GENERATED = "SCENARIO_GENERATED"
    SPECIALISTS_RUNNING = "SPECIALISTS_RUNNING"
    COORDINATING = "COORDINATING"
    ADVERSARY_RUNNING = "ADVERSARY_RUNNING"
    OPTIMIZING = "OPTIMIZING"
    VERIFYING = "VERIFYING"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"
    RESET = "RESET"


class DemoModeType(str, Enum):
    STEP = "STEP"  # Presenter controls each stage step manually
    FAST = "FAST"  # Runs full demo workflow automatically


class DemoStepRecord(BaseModel):
    step_index: int
    stage: DecisionStage
    title: str
    status: str  # PENDING, IN_PROGRESS, COMPLETED, FAILED, SKIPPED
    duration_ms: float = 0.0
    summary: str = ""
    key_metrics: Dict[str, Any] = Field(default_factory=dict)
    evidence_ids: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DemoScenario(BaseModel):
    scenario_id: DemoScenarioId
    title: str
    subtitle: str
    description: str
    seed: int = 42
    preset: str = "double_punch"
    disruption_type: str
    affected_entities: List[str]
    expected_duration_seconds: int = 180
    systems_exercised: List[str]
    storyboard_steps: List[str]


class DemoSession(BaseModel):
    session_id: str = Field(default_factory=lambda: f"demo-session-{uuid.uuid4().hex[:8]}")
    scenario_id: DemoScenarioId = DemoScenarioId.DEMO_05
    mode: DemoModeType = DemoModeType.STEP
    status: DemoStatus = DemoStatus.IDLE
    seed: int = 42
    current_step_index: int = 0
    timeline: List[DemoStepRecord] = Field(default_factory=list)
    cockpit_session_id: Optional[str] = None
    evaluation_run_id: Optional[str] = None
    executive_summary: Optional[ExecutiveSummary] = None
    evaluation_summary: Optional[EvaluationSummary] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DemoStartRequest(BaseModel):
    scenario_id: DemoScenarioId = DemoScenarioId.DEMO_05
    mode: DemoModeType = DemoModeType.STEP
    seed: int = 42


class DemoStepRequest(BaseModel):
    session_id: str
    target_step_index: Optional[int] = None


class DemoApprovalRequest(BaseModel):
    session_id: str
    approver_name: str = "Chief Supply Chain Officer"
    decision_rationale: str = "Approved Plan C — Total Network Resilience"
    selected_plan_id: str = "Candidate C"


class DemoStatusResponse(BaseModel):
    active_session: Optional[DemoSession] = None
    available_scenarios: List[DemoScenario] = Field(default_factory=list)
    system_healthy: bool = True
    ai_provider: str = "mock"


class DemoReport(BaseModel):
    session_id: str
    scenario_id: DemoScenarioId
    seed: int
    mode: DemoModeType
    status: DemoStatus
    total_duration_ms: float
    workflow_completed: bool
    candidate_plan_selected: Optional[str]
    approval_decision: Optional[Dict[str, Any]]
    final_executive_summary: Optional[ExecutiveSummary]
    evaluation_summary: Optional[EvaluationSummary]
    timeline_steps: List[DemoStepRecord]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
