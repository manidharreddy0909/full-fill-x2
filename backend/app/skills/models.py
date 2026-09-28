"""
FULFILL-X Resilience Skill Models (Phase 3)

A ResilienceSkill is a governed, versioned, evidence-backed operational capability.

Lifecycle:
  CANDIDATE -> UNDER_VALIDATION -> VALIDATED -> ACTIVE ->
  CHALLENGED -> REINFORCED -> MODIFIED -> DEPRECATED -> REJECTED
"""
from enum import Enum
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field

from app.hindsight.models import SuccessCondition, FailureBoundary, OutcomeStatus
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata


class SkillLifecycle(str, Enum):
    CANDIDATE = "CANDIDATE"
    UNDER_VALIDATION = "UNDER_VALIDATION"
    VALIDATED = "VALIDATED"
    ACTIVE = "ACTIVE"
    CHALLENGED = "CHALLENGED"
    REINFORCED = "REINFORCED"
    MODIFIED = "MODIFIED"
    DEPRECATED = "DEPRECATED"
    REJECTED = "REJECTED"


class ValidationResult(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    INCONCLUSIVE = "INCONCLUSIVE"


class SkillCalibrationResult(str, Enum):
    REINFORCES = "REINFORCES"
    WEAKENS = "WEAKENS"
    REVEALS_NEW_BOUNDARY = "REVEALS_NEW_BOUNDARY"
    CONTRADICTS = "CONTRADICTS"
    NEUTRAL = "NEUTRAL"


class EvolutionProposalStatus(str, Enum):
    PROPOSED = "PROPOSED"
    VALIDATION_REQUIRED = "VALIDATION_REQUIRED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class GovernanceRequirement(str, Enum):
    AUTO = "AUTO"
    MONITOR = "MONITOR"
    APPROVAL = "APPROVAL"
    BLOCK = "BLOCK"


class UncertaintyLevel(str, Enum):
    KNOWN = "KNOWN"
    PROBABLE = "PROBABLE"
    UNCERTAIN = "UNCERTAIN"
    UNKNOWN = "UNKNOWN"


class SkillPrecondition(BaseModel):
    """A structured condition that must be TRUE before the skill may be considered."""
    precondition_id: str = Field(default_factory=lambda: "pre-" + uuid.uuid4().hex[:6])
    description: str
    parameter: Optional[str] = None
    operator: Optional[str] = None
    threshold: Optional[Any] = None
    uncertainty: UncertaintyLevel = UncertaintyLevel.KNOWN
    verified: bool = True

    def evaluate(self, world_state: Dict[str, Any]) -> bool:
        """Deterministically check this precondition against world_state."""
        if self.parameter is None or self.threshold is None:
            return True
        observed = world_state.get(self.parameter)
        if observed is None:
            return False
        try:
            if self.operator in (">", "gt"):
                return float(observed) > float(self.threshold)
            elif self.operator in (">=", "gte"):
                return float(observed) >= float(self.threshold)
            elif self.operator in ("<", "lt"):
                return float(observed) < float(self.threshold)
            elif self.operator in ("<=", "lte"):
                return float(observed) <= float(self.threshold)
            elif self.operator in ("==", "eq"):
                return str(observed) == str(self.threshold)
            elif self.operator in ("!=", "ne"):
                return str(observed) != str(self.threshold)
        except (ValueError, TypeError):
            pass
        return False


class SkillStep(BaseModel):
    """One atomic operational step within a skill execution sequence."""
    step_number: int
    action: str
    node_target: Optional[str] = None
    timeout_seconds: int = 300
    abort_condition: Optional[str] = None
    estimated_effect: Optional[str] = None
    requires_confirmation: bool = False


class ValidationEvent(BaseModel):
    """Record of one validation run for a skill version."""
    validation_id: str = Field(default_factory=lambda: "val-" + uuid.uuid4().hex[:6])
    result: ValidationResult
    run_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    simulation_run_id: Optional[str] = None
    preconditions_met: bool = True
    boundary_violations: List[str] = Field(default_factory=list)
    predicted_outcome: Dict[str, Any] = Field(default_factory=dict)
    notes: str = ""
    truth_status: TruthStatus = TruthStatus.SIMULATED


class ChallengeRecord(BaseModel):
    """Record of one adversarial challenge test against this skill."""
    challenge_id: str = Field(default_factory=lambda: "chal-" + uuid.uuid4().hex[:6])
    challenger: str = "AdversaryAgent"
    stress_dimensions: List[str] = Field(default_factory=list)
    result: str = "UNKNOWN"
    challenged_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    notes: str = ""


class SkillApplicabilityReport(BaseModel):
    """
    Result of evaluating whether a Skill applies to a current situation.
    This is the interface required by the future Challenge Engine (Phase 4).
    """
    skill_id: str
    skill_version: str
    applicable: bool
    uncertainty: UncertaintyLevel
    precondition_status: Dict[str, bool]
    boundary_status: Dict[str, bool]
    predicted_effects: Dict[str, Any]
    risk_level: str
    confidence: float
    governance_requirement: GovernanceRequirement
    reason: str
    recommendation: str
    evaluated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ResilienceSkill(BaseModel):
    """
    A governed, versioned, evidence-backed operational capability.

    INVARIANT: Once a version is created, its fields are never mutated.
    New learning creates a new version. v1 remains historically immutable.
    """
    skill_id: str = Field(default_factory=lambda: "skill-" + uuid.uuid4().hex[:8])
    name: str
    version: str = "v1"
    purpose: str
    strategy: str

    preconditions: List[SkillPrecondition] = Field(default_factory=list)
    required_world_conditions: Dict[str, Any] = Field(default_factory=dict)
    steps: List[SkillStep] = Field(default_factory=list)
    expected_effects: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)

    success_conditions: List[SuccessCondition] = Field(default_factory=list)
    failure_boundaries: List[FailureBoundary] = Field(default_factory=list)
    transfer_constraints: List[str] = Field(default_factory=list)

    evidence: int = 0
    supporting_experiences: List[str] = Field(default_factory=list)
    contradicting_experiences: List[str] = Field(default_factory=list)

    genome_id: str

    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    uncertainty: UncertaintyLevel = UncertaintyLevel.UNKNOWN

    freshness: str = "New"
    last_validated: Optional[str] = None
    last_used: Optional[str] = None

    lifecycle_status: SkillLifecycle = SkillLifecycle.CANDIDATE
    validation_status: ValidationResult = ValidationResult.INCONCLUSIVE
    validation_history: List[ValidationEvent] = Field(default_factory=list)
    challenge_history: List[ChallengeRecord] = Field(default_factory=list)

    usage_count: int = 0
    success_count: int = 0
    failure_count: int = 0

    governance_requirement: GovernanceRequirement = GovernanceRequirement.APPROVAL

    previous_version_id: Optional[str] = None
    evolution_reason: Optional[str] = None

    provenance: ProvenanceMetadata = Field(default_factory=ProvenanceMetadata)

    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SkillEvolutionProposal(BaseModel):
    """
    Evidence-backed proposal to create a new version of an existing skill.
    High-risk changes must NOT automatically activate.
    """
    proposal_id: str = Field(default_factory=lambda: "evo-" + uuid.uuid4().hex[:8])
    skill_id: str
    current_version: str
    proposed_version: str

    triggering_experience_id: str
    reason: str

    changed_conditions: List[str] = Field(default_factory=list)
    changed_boundaries: List[str] = Field(default_factory=list)
    new_preconditions: List[SkillPrecondition] = Field(default_factory=list)
    new_failure_boundaries: List[FailureBoundary] = Field(default_factory=list)

    confidence_before: float
    confidence_after: float

    supporting_evidence: List[str] = Field(default_factory=list)
    contradicting_evidence: List[str] = Field(default_factory=list)

    validation_required: bool = True
    status: EvolutionProposalStatus = EvolutionProposalStatus.PROPOSED

    proposed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    resolved_at: Optional[str] = None
    resolved_by: Optional[str] = None


class SkillOutcomeEvaluation(BaseModel):
    """
    Evaluates the effect of a real outcome on an existing Skill.
    """
    evaluation_id: str = Field(default_factory=lambda: "soe-" + uuid.uuid4().hex[:6])
    skill_id: str
    skill_version: str
    experience_id: str

    predicted_recovery_hours: Optional[float] = None
    actual_recovery_hours: Optional[float] = None
    prediction_error_hours: Optional[float] = None

    predicted_recovery_pct: Optional[float] = None
    actual_recovery_pct: Optional[float] = None

    calibration_result: SkillCalibrationResult
    confidence_delta: float = 0.0

    reason: str
    new_boundary_discovered: Optional[str] = None
    evolution_proposal_id: Optional[str] = None

    evaluated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    truth_status: TruthStatus = TruthStatus.OBSERVED


class SkillLifecycleEventType(str, Enum):
    SKILL_CREATED = "SKILL_CREATED"
    SKILL_VALIDATED = "SKILL_VALIDATED"
    SKILL_USED = "SKILL_USED"
    SKILL_SUCCEEDED = "SKILL_SUCCEEDED"
    SKILL_FAILED = "SKILL_FAILED"
    BOUNDARY_VIOLATED = "BOUNDARY_VIOLATED"
    SKILL_CHALLENGED = "SKILL_CHALLENGED"
    SKILL_MODIFIED = "SKILL_MODIFIED"
    SKILL_DEPRECATED = "SKILL_DEPRECATED"
    SKILL_EVOLUTION_PROPOSED = "SKILL_EVOLUTION_PROPOSED"
    SKILL_EVOLUTION_ACCEPTED = "SKILL_EVOLUTION_ACCEPTED"


class SkillLifecycleEvent(BaseModel):
    """A significant lifecycle event retained in Hindsight memory."""
    event_id: str = Field(default_factory=lambda: "sle-" + uuid.uuid4().hex[:6])
    event_type: SkillLifecycleEventType
    skill_id: str
    skill_name: str
    skill_version: str
    genome_id: str
    context: Dict[str, Any] = Field(default_factory=dict)
    evidence_impact: str = ""
    occurred_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    truth_status: TruthStatus = TruthStatus.OBSERVED
