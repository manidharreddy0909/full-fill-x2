"""
FULFILL-X Multi-Agent Resilience & Continuous Learning Schemas (Phase 9)
Pydantic v2 schemas defining agent memory, calibration performance, evidence-first deliberation,
expected vs actual outcome capture, feedback records, learning datasets, and Challenger model governance.
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4
from pydantic import BaseModel, Field, ConfigDict, field_validator


class MemoryType(str, Enum):
    CASE = "CASE"
    DECISION = "DECISION"
    OUTCOME = "OUTCOME"
    FAILURE = "FAILURE"
    SUCCESS = "SUCCESS"
    CONSTRAINT = "CONSTRAINT"
    PATTERN = "PATTERN"
    LESSON = "LESSON"


class MemoryStatus(str, Enum):
    PROPOSED = "PROPOSED"
    VALIDATING = "VALIDATING"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class ConsensusStatus(str, Enum):
    AGREEMENT = "AGREEMENT"
    PARTIAL_AGREEMENT = "PARTIAL_AGREEMENT"
    CONFLICT = "CONFLICT"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


class FeedbackType(str, Enum):
    CORRECT = "CORRECT"
    PARTIALLY_CORRECT = "PARTIALLY_CORRECT"
    INCORRECT = "INCORRECT"
    UNOBSERVABLE = "UNOBSERVABLE"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class ChallengerStatus(str, Enum):
    TRAINED = "TRAINED"
    VALIDATED = "VALIDATED"
    CANDIDATE = "CANDIDATE"
    ACTIVE = "ACTIVE"
    REJECTED = "REJECTED"
    RETIRED = "RETIRED"


class AgentMemory(BaseModel):
    memory_id: str = Field(default_factory=lambda: f"mem-{uuid4().hex[:8]}")
    organization_id: str = Field(default="org-fulfillx-default")
    agent_id: str = Field(...)
    memory_type: MemoryType = Field(default=MemoryType.LESSON)
    event_reference: Optional[str] = Field(default=None)
    context: Dict[str, Any] = Field(default_factory=dict)
    decision: Dict[str, Any] = Field(default_factory=dict)
    expected_outcome: Dict[str, Any] = Field(default_factory=dict)
    actual_outcome: Optional[Dict[str, Any]] = Field(default=None)
    lesson: str = Field(...)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    source: str = Field(default="OBSERVED_SIMULATION")
    decay_factor: float = Field(default=1.0, ge=0.0, le=1.0)
    status: MemoryStatus = Field(default=MemoryStatus.VALIDATED)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None


class AgentPerformanceRecord(BaseModel):
    agent_id: str
    agent_name: str
    proposals_count: int = Field(default=0, ge=0)
    valid_proposals_count: int = Field(default=0, ge=0)
    verification_success_count: int = Field(default=0, ge=0)
    mean_predicted_impact: float = Field(default=0.0)
    mean_observed_impact: float = Field(default=0.0)
    calibration_mae: float = Field(default=0.0, ge=0.0)
    calibration_rmse: float = Field(default=0.0, ge=0.0)
    simulation_agreement_score: float = Field(default=0.8, ge=0.0, le=1.0)
    adversarial_survival_rate: float = Field(default=0.85, ge=0.0, le=1.0)


class AgentDebateMessage(BaseModel):
    round_index: int = Field(default=0, ge=0)
    agent_id: str
    agent_name: str
    position: str
    reasoning: str
    evidence_references: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)


class DeliberationRound(BaseModel):
    round_index: int = Field(default=0, ge=0)
    messages: List[AgentDebateMessage] = Field(default_factory=list)
    consensus_status: ConsensusStatus = Field(default=ConsensusStatus.PARTIAL_AGREEMENT)
    conflict_summary: Optional[str] = None


class DecisionEvidenceBundle(BaseModel):
    proposal_id: str = Field(default_factory=lambda: f"bun-{uuid4().hex[:8]}")
    agent_id: str = Field(default="coordinator")
    specialist_proposals: List[Dict[str, Any]] = Field(default_factory=list)
    gnn_propagation_trace_id: Optional[str] = None
    causal_hypothesis_id: Optional[str] = None
    monte_carlo_sim_id: Optional[str] = None
    adversarial_attack_id: Optional[str] = None
    verification_result_id: Optional[str] = None
    historical_lessons: List[str] = Field(default_factory=list)
    overall_confidence: float = Field(default=0.85, ge=0.0, le=1.0)


class DeliberationSession(BaseModel):
    deliberation_id: str = Field(default_factory=lambda: f"delib-{uuid4().hex[:8]}")
    organization_id: str = Field(default="org-fulfillx-default")
    target_node_ids: List[str] = Field(default_factory=list)
    rounds: List[DeliberationRound] = Field(default_factory=list)
    evidence_bundle: DecisionEvidenceBundle
    consensus_status: ConsensusStatus = Field(default=ConsensusStatus.AGREEMENT)
    final_recommendation: str = Field(...)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OutcomeRecord(BaseModel):
    outcome_id: str = Field(default_factory=lambda: f"out-{uuid4().hex[:8]}")
    decision_id: str
    organization_id: str = Field(default="org-fulfillx-default")
    expected_service_level: float = Field(ge=0.0, le=1.0)
    actual_service_level: float = Field(ge=0.0, le=1.0)
    expected_cost: float = Field(ge=0.0)
    actual_cost: float = Field(ge=0.0)
    expected_recovery_hours: float = Field(ge=0.0)
    actual_recovery_hours: float = Field(ge=0.0)
    service_deviation: float = Field(default=0.0)
    cost_deviation: float = Field(default=0.0)
    recovery_deviation: float = Field(default=0.0)
    attribution_map: Dict[str, float] = Field(default_factory=dict)
    observed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FeedbackRecord(BaseModel):
    feedback_id: str = Field(default_factory=lambda: f"fbk-{uuid4().hex[:8]}")
    outcome_id: str
    organization_id: str = Field(default="org-fulfillx-default")
    feedback_type: FeedbackType = Field(default=FeedbackType.CORRECT)
    accuracy_score: float = Field(default=0.9, ge=0.0, le=1.0)
    comments: str = Field(default="Ground-truth outcome alignment verified")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LearningExample(BaseModel):
    example_id: str = Field(default_factory=lambda: f"ex-{uuid4().hex[:8]}")
    features: Dict[str, Any] = Field(default_factory=dict)
    prediction: float
    actual: float
    error: float
    data_origin: str = Field(default="OBSERVED", description="OBSERVED, REPLAY, SYNTHETIC, SIMULATION, COUNTERFACTUAL")


class LearningDataset(BaseModel):
    dataset_id: str = Field(default_factory=lambda: f"ds-{uuid4().hex[:8]}")
    organization_id: str = Field(default="org-fulfillx-default")
    name: str
    version: str = Field(default="1.0.0")
    record_count: int = Field(ge=0)
    checksum: str
    data_origin: str = Field(default="OBSERVED")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LearningRunResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    run_id: str = Field(default_factory=lambda: f"lrun-{uuid4().hex[:8]}")
    dataset_id: str
    model_name: str
    train_mae: float
    val_mae: float
    train_rmse: float
    val_rmse: float
    baseline_mae: float
    is_improvement: bool
    execution_time_sec: float


class ChallengerModelRecord(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    challenger_id: str = Field(default_factory=lambda: f"chal-{uuid4().hex[:8]}")
    organization_id: str = Field(default="org-fulfillx-default")
    model_name: str
    version: str
    active_model_id: str
    baseline_metric: float
    challenger_metric: float
    status: ChallengerStatus = Field(default=ChallengerStatus.CANDIDATE)
    checksum: str
    artifact_path: str
    activation_reason: Optional[str] = None
    approved_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PolicyEvaluationRecord(BaseModel):
    evaluation_id: str = Field(default_factory=lambda: f"peval-{uuid4().hex[:8]}")
    situation: Dict[str, Any] = Field(default_factory=dict)
    candidate_actions: List[Dict[str, Any]] = Field(default_factory=list)
    simulated_service_level: float
    observed_service_level: float
    robustness_score: float
    validated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LessonValidationRecord(BaseModel):
    lesson_id: str = Field(default_factory=lambda: f"les-{uuid4().hex[:8]}")
    agent_id: str
    lesson_text: str
    evidence_count: int = Field(ge=1)
    confidence: float = Field(ge=0.0, le=1.0)
    status: MemoryStatus = Field(default=MemoryStatus.VALIDATED)
    validated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
