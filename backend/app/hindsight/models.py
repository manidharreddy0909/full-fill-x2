"""
Hindsight Experiential Data Models (Phase 2A)

Strongly-typed Pydantic schemas for Experience Memory, Resilience Genome,
Recall, Reflection, and Transferability Assessment.
"""
from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field

from app.hindsight.provenance import TruthStatus, ProvenanceMetadata


class OutcomeStatus(str, Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    PARTIAL = "PARTIAL"
    PENDING = "PENDING"


class PolicyDecisionStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    OVERRIDDEN = "OVERRIDDEN"
    BLOCKED = "BLOCKED"
    WARNING = "WARNING"


class TransferabilityState(str, Enum):
    TRANSFERABLE = "TRANSFERABLE"
    PARTIAL = "PARTIAL"
    NON_TRANSFERABLE = "NON_TRANSFERABLE"
    UNKNOWN = "UNKNOWN"


class GenomeStatus(str, Enum):
    VALIDATED = "VALIDATED"
    PROVISIONAL = "PROVISIONAL"
    DEPRECATED = "DEPRECATED"
    CONTRADICTED = "CONTRADICTED"


class SuccessCondition(BaseModel):
    condition_id: str = Field(default_factory=lambda: f"sc-{uuid.uuid4().hex[:6]}")
    text: str
    verified: bool = True
    parameter: Optional[str] = None
    threshold: Optional[str] = None
    evidence_count: int = 1
    confidence: float = 0.85


class FailureBoundary(BaseModel):
    boundary_id: str = Field(default_factory=lambda: f"fb-{uuid.uuid4().hex[:6]}")
    text: str
    verified: bool = True
    parameter: Optional[str] = None
    threshold: Optional[str] = None
    severity: str = "CRITICAL"  # "CRITICAL" | "WARNING"
    evidence_count: int = 1
    confidence: float = 0.85


class Experience(BaseModel):
    """
    Authoritative record of completed operational episode with full lineage and grounding.
    """
    experience_id: str = Field(default_factory=lambda: f"exp-{uuid.uuid4().hex[:8]}")
    incident_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    incident_signature: str
    world_state: Dict[str, Any] = Field(default_factory=dict)
    topology_context: Dict[str, Any] = Field(default_factory=dict)
    observed_symptoms: List[str] = Field(default_factory=list)
    hypothesis: str = ""
    decision: str
    action: Dict[str, Any] = Field(default_factory=dict)
    alternative_actions: List[Dict[str, Any]] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    predicted_outcome: Dict[str, Any] = Field(default_factory=dict)
    actual_outcome: Dict[str, Any] = Field(default_factory=dict)
    outcome_status: OutcomeStatus = OutcomeStatus.PENDING
    failure_reason: Optional[str] = None
    success_conditions: List[str] = Field(default_factory=list)
    failure_boundaries: List[str] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    provenance: ProvenanceMetadata = Field(default_factory=ProvenanceMetadata)
    human_override: bool = False
    policy_decision: PolicyDecisionStatus = PolicyDecisionStatus.COMPLIANT
    skill_version: Optional[str] = None
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    truth_status: TruthStatus = TruthStatus.OBSERVED

    def model_post_init(self, __context: Any) -> None:
        # Guarantee truth status aligns with provenance
        if self.provenance.is_simulation and self.truth_status == TruthStatus.OBSERVED:
            self.truth_status = TruthStatus.SIMULATED


class RetainRequest(BaseModel):
    experience: Experience
    tags: List[str] = Field(default_factory=list)


class RetainResult(BaseModel):
    success: bool
    experience_id: str
    stored_at: str
    message: str
    truth_status: TruthStatus


class RecallQuery(BaseModel):
    incident_signature: Optional[str] = None
    target_node_ids: List[str] = Field(default_factory=list)
    disruption_type: Optional[str] = None
    min_confidence: float = 0.4
    limit: int = 10
    required_truth_status: Optional[List[TruthStatus]] = None
    include_simulated: bool = True


class RecallResult(BaseModel):
    experiences: List[Experience]
    total_found: int
    observed_count: int
    simulated_count: int
    derived_count: int
    query_signature: str
    relevance_scores: Dict[str, float] = Field(default_factory=dict)


class ResilienceGenome(BaseModel):
    """
    Synthesized operational resilience archetype derived from reflected experiences.
    """
    id: str = Field(default_factory=lambda: f"genome-{uuid.uuid4().hex[:8]}")
    strategy: str
    purpose: str
    success_conditions: List[SuccessCondition] = Field(default_factory=list)
    failure_boundaries: List[FailureBoundary] = Field(default_factory=list)
    evidence: int = 1
    contradictions: int = 0
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    last_validated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    freshness: str = "Just updated"
    supporting_experiences: List[str] = Field(default_factory=list)
    validation_history: List[str] = Field(default_factory=list)
    status: GenomeStatus = GenomeStatus.VALIDATED


class ConditionEvaluation(BaseModel):
    name: str
    observed_value: Any
    required_threshold: str
    passed: bool
    details: str = ""


class TransferAssessment(BaseModel):
    """
    Evaluator assessment on whether a historical strategy transfers to the current situation.
    Similarity is evidence, NOT permission.
    """
    assessment_id: str = Field(default_factory=lambda: f"transfer-{uuid.uuid4().hex[:6]}")
    strategy_name: str
    source_genome_id: Optional[str] = None
    source_experience_id: Optional[str] = None
    status: TransferabilityState
    similarity_score: float = Field(ge=0.0, le=1.0)
    transferable_conditions: List[str] = Field(default_factory=list)
    violated_conditions: List[str] = Field(default_factory=list)
    evaluations: List[ConditionEvaluation] = Field(default_factory=list)
    reason: str
    recommendation: str
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    requires_human_approval: bool = True
    assessed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CurrentContext(BaseModel):
    incident_signature: str
    target_node_id: str
    current_capacity: Optional[float] = None
    lead_time_days: Optional[float] = None
    route_status: Optional[str] = None
    active_disruptions: List[str] = Field(default_factory=list)
    node_metrics: Dict[str, Any] = Field(default_factory=dict)
