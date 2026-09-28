"""
FULFILL-X Challenge Engine Models (Phase 4)

Structured schemas for active learning, counterfactual scenarios, boundary probing,
and adaptive autonomy governance.
"""
from enum import Enum
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field

from app.hindsight.models import (
    SuccessCondition,
    FailureBoundary,
    OutcomeStatus,
)
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata
from app.skills.models import (
    GovernanceRequirement,
    UncertaintyLevel,
    ResilienceSkill,
)


class ChallengeScenarioType(str, Enum):
    NORMAL_VARIATION = "NORMAL_VARIATION"
    BOUNDARY_TEST = "BOUNDARY_TEST"
    DEPENDENCY_FAILURE = "DEPENDENCY_FAILURE"
    CAPACITY_DEGRADATION = "CAPACITY_DEGRADATION"
    TOPOLOGY_CHANGE = "TOPOLOGY_CHANGE"
    DEMAND_SURGE = "DEMAND_SURGE"
    STALE_EVIDENCE = "STALE_EVIDENCE"
    CONFLICTING_EVIDENCE = "CONFLICTING_EVIDENCE"
    NOVEL_CONDITION = "NOVEL_CONDITION"


class ChallengeStatus(str, Enum):
    PLANNED = "PLANNED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    ABORTED = "ABORTED"


class ChallengeOutcomeStatus(str, Enum):
    SURVIVED = "SURVIVED"
    FAILED = "FAILED"
    BOUNDARY_DISCOVERED = "BOUNDARY_DISCOVERED"
    INCONCLUSIVE = "INCONCLUSIVE"
    UNKNOWN = "UNKNOWN"


class BoundaryStatus(str, Enum):
    WITHIN_BOUNDARY = "WITHIN_BOUNDARY"
    BOUNDARY_BREACH = "BOUNDARY_BREACH"
    NEW_BOUNDARY_REVEALED = "NEW_BOUNDARY_REVEALED"
    BOUNDARY_UNCERTAIN = "BOUNDARY_UNCERTAIN"


class ChallengeScenario(BaseModel):
    """
    Structured challenge scenario designed to test specific assumptions
    or failure boundaries of a resilience skill.
    """
    id: str = Field(default_factory=lambda: "cs-" + uuid.uuid4().hex[:8])
    skill_id: str
    skill_version: str
    target_assumption: str
    scenario_type: ChallengeScenarioType
    baseline_world_state: Dict[str, Any] = Field(default_factory=dict)
    perturbations: Dict[str, Any] = Field(default_factory=dict)
    expected_skill_behavior: str
    risk_level: str = "MEDIUM"  # LOW | MEDIUM | HIGH | CRITICAL
    created_from: str = "active_learning"
    provenance: ProvenanceMetadata = Field(
        default_factory=lambda: ProvenanceMetadata(
            source_type=TruthStatus.SIMULATED,
            is_simulation=True,
            recorded_by="ChallengeScenarioGenerator",
            audit_notes="Synthetic challenge scenario for boundary testing",
        )
    )
    status: ChallengeStatus = ChallengeStatus.PLANNED
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class CounterfactualComparison(BaseModel):
    """
    Direct comparison between applying a skill action vs alternative action / baseline.
    Strictly marked SIMULATED.
    """
    comparison_id: str = Field(default_factory=lambda: "cf-" + uuid.uuid4().hex[:8])
    scenario_id: str
    skill_id: str
    skill_version: str
    skill_name: str
    skill_action: Dict[str, Any] = Field(default_factory=dict)
    skill_outcome: Dict[str, Any] = Field(default_factory=dict)  # recovery_hours, service_level, cost, success
    alternative_strategy_id: str
    alternative_name: str
    alternative_action: Dict[str, Any] = Field(default_factory=dict)
    alternative_outcome: Dict[str, Any] = Field(default_factory=dict)
    delta_service_level: float = 0.0
    delta_recovery_hours: float = 0.0
    delta_cost: float = 0.0
    recommendation: str
    provenance: ProvenanceMetadata = Field(
        default_factory=lambda: ProvenanceMetadata(
            source_type=TruthStatus.SIMULATED,
            is_simulation=True,
            recorded_by="CounterfactualEngine",
            audit_notes="Simulated counterfactual evaluation comparing skill vs alternative",
        )
    )


class ChallengeResult(BaseModel):
    """
    Full result of executing a ChallengeScenario against a ResilienceSkill.
    """
    challenge_id: str = Field(default_factory=lambda: "cr-" + uuid.uuid4().hex[:8])
    skill_id: str
    skill_version: str
    scenario: ChallengeScenario
    predicted_behavior: Dict[str, Any] = Field(default_factory=dict)
    actual_simulated_behavior: Dict[str, Any] = Field(default_factory=dict)
    prediction_error_hours: Optional[float] = None
    prediction_error_pct: Optional[float] = None
    boundary_status: BoundaryStatus
    skill_survived: bool
    failure_detected: bool
    new_boundary_detected: Optional[str] = None
    confidence_before: float
    confidence_after: float
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    recommendation: str
    outcome_status: ChallengeOutcomeStatus
    provenance: ProvenanceMetadata = Field(
        default_factory=lambda: ProvenanceMetadata(
            source_type=TruthStatus.SIMULATED,
            is_simulation=True,
            recorded_by="ChallengeEngineService",
            audit_notes="Executed challenge test outcome",
        )
    )
    counterfactual: Optional[CounterfactualComparison] = None
    adaptive_governance: GovernanceRequirement = GovernanceRequirement.MONITOR
    retained_experience_id: Optional[str] = None
    evolution_proposal_id: Optional[str] = None
    executed_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class GradientProbeStep(BaseModel):
    """Single probe step along a parameter gradient."""
    step_index: int
    parameter: str
    value: float
    skill_applicable: bool
    skill_survived: bool
    service_level: float
    recovery_hours: float
    boundary_breached: bool
    uncertainty: UncertaintyLevel


class GradientProbeResult(BaseModel):
    """Result of controlled boundary probing along a parameter gradient."""
    probe_id: str = Field(default_factory=lambda: "gp-" + uuid.uuid4().hex[:8])
    skill_id: str
    skill_version: str
    parameter: str
    steps: List[GradientProbeStep]
    transition_point: Optional[float] = None
    discovered_boundary: Optional[str] = None
    recommendation: str
    provenance: ProvenanceMetadata = Field(
        default_factory=lambda: ProvenanceMetadata(
            source_type=TruthStatus.SIMULATED,
            is_simulation=True,
            recorded_by="ChallengeScenarioGenerator",
            audit_notes="Controlled gradient boundary probing",
        )
    )


class ChallengeMetrics(BaseModel):
    """Measurable outputs for active learning and challenge engine performance."""
    challenge_count: int = 0
    challenge_success_rate: float = 0.0
    challenge_failure_rate: float = 0.0
    boundary_discoveries: int = 0
    unknown_scenarios: int = 0
    prediction_error_avg_hours: float = 0.0
    skill_versions_created: int = 0
    repeated_failures: int = 0
    avoided_failures: int = 0
    evidence_reuse: int = 0
    challenge_reuse: int = 0
