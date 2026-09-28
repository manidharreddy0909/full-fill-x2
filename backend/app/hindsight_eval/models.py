"""
FULFILL-X Hindsight Learning Evaluation Models (Phase 5)

Structured schemas for the central experiment:
MEMORYLESS AGENT vs HINDSIGHT-ENABLED AGENT
under repeated operational scenarios.
"""
from enum import Enum
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field

from app.hindsight.provenance import TruthStatus, ProvenanceMetadata


class AgentMode(str, Enum):
    MEMORYLESS = "MEMORYLESS"
    HINDSIGHT = "HINDSIGHT"


class EvaluationScenarioType(str, Enum):
    BASELINE = "BASELINE"
    RELATED = "RELATED"
    TRANSFER = "TRANSFER"
    BOUNDARY = "BOUNDARY"
    NOVEL = "NOVEL"
    CONTRADICTORY = "CONTRADICTORY"
    STALE = "STALE"
    DEGRADATION = "DEGRADATION"
    DEMAND_SURGE = "DEMAND_SURGE"
    DEPENDENCY_FAILURE = "DEPENDENCY_FAILURE"
    TOPOLOGY_CHANGE = "TOPOLOGY_CHANGE"


class EvaluationScenario(BaseModel):
    """
    Standardized synthetic evaluation scenario with separate ground truth.
    Ground truth is for evaluation scoring only and is NEVER leaked to agents.
    """
    scenario_id: str = Field(default_factory=lambda: "eval-sc-" + uuid.uuid4().hex[:6])
    incident_signature: str
    scenario_type: EvaluationScenarioType
    world_state: Dict[str, Any] = Field(default_factory=dict)
    conditions: Dict[str, Any] = Field(default_factory=dict)
    available_strategies: List[str] = Field(
        default_factory=lambda: [
            "Supplier Substitution (Secondary Sourcing)",
            "Emergency Inventory Draw (Warehouse C Reserves)",
            "Production Rescheduling & Alternate Dispatch",
            "Baseline (No Action)",
        ]
    )
    # Ground truth is for evaluation engine scoring only:
    ground_truth_simulation: Dict[str, Any] = Field(default_factory=dict)
    expected_risk: str = "MEDIUM"
    difficulty: str = "NORMAL"  # EASY | NORMAL | HARD | NOVEL
    relationship_to_previous_cases: str = "Independent baseline"
    provenance: ProvenanceMetadata = Field(
        default_factory=lambda: ProvenanceMetadata(
            source_type=TruthStatus.SIMULATED,
            is_simulation=True,
            recorded_by="ScenarioSequenceGenerator",
            audit_notes="Synthetic evaluation scenario",
        )
    )


class CausalAttribution(BaseModel):
    """
    Explicit causal decision attribution proving memory caused behavioral differences.
    """
    memory_recalled: bool = False
    evidence_used: bool = False
    boundary_influenced: bool = False
    skill_influenced: bool = False
    decision_changed: bool = False
    outcome_improved: bool = False
    recalled_experience_ids: List[str] = Field(default_factory=list)
    evidence_summary: str = "No memory recalled"


class EpisodeTrace(BaseModel):
    """
    Detailed machine-readable trace of a single evaluation episode.
    """
    episode_index: int
    scenario_id: str
    scenario_type: EvaluationScenarioType
    agent_mode: AgentMode
    observed_state: Dict[str, Any] = Field(default_factory=dict)
    recalled_experiences: List[str] = Field(default_factory=list)
    relevant_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    genome_status: Optional[str] = None
    selected_skill: Optional[str] = None
    transfer_assessment: Optional[str] = None  # TRANSFERABLE | PARTIAL | NON_TRANSFERABLE | UNKNOWN
    decision: str
    decision_rationale: str = ""
    predicted_outcome: Dict[str, Any] = Field(default_factory=dict)
    simulated_outcome: Dict[str, Any] = Field(default_factory=dict)
    prediction_error_hours: float = 0.0
    prediction_error_pct: float = 0.0
    success: bool
    unsafe_action: bool = False
    repeated_mistake: bool = False
    unknown_detected: bool = False
    boundary_avoided: bool = False
    attribution: CausalAttribution = Field(default_factory=CausalAttribution)
    executed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LearningCurvePoint(BaseModel):
    """Cumulative performance point along sequence."""
    episode: int
    cumulative_success_rate: float
    cumulative_mistake_rate: float
    cumulative_unsafe_rate: float
    avg_prediction_error: float


class ExperimentMetrics(BaseModel):
    """Statistical summary metrics for one agent mode across an evaluation run."""
    agent_mode: AgentMode
    total_episodes: int = 0
    success_count: int = 0
    recovery_success_rate: float = 0.0
    repeated_mistake_count: int = 0
    repeated_mistake_rate: float = 0.0
    unsafe_action_count: int = 0
    unsafe_action_rate: float = 0.0
    evidence_reuse_count: int = 0
    evidence_reuse_rate: float = 0.0
    unknown_detection_count: int = 0
    unknown_detection_rate: float = 0.0
    boundary_avoidance_count: int = 0
    boundary_avoidance_rate: float = 0.0
    transfer_accuracy_rate: float = 0.0
    avg_prediction_error_hours: float = 0.0
    early_episode_success_rate: float = 0.0  # First 1/3 episodes
    late_episode_success_rate: float = 0.0   # Last 1/3 episodes
    learning_gain: float = 0.0               # late - early


class EvaluationExperimentReport(BaseModel):
    """
    Complete A/B evaluation report comparing Memoryless vs Hindsight.
    All numbers generated from executed simulation runs. No fake benchmarks.
    """
    experiment_id: str = Field(default_factory=lambda: "exp-ab-" + uuid.uuid4().hex[:8])
    title: str = "Hindsight Learning Evaluation (Memoryless vs Hindsight)"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    scenario_count: int
    seed: int = 42
    memoryless_metrics: ExperimentMetrics
    hindsight_metrics: ExperimentMetrics
    learning_curves_memoryless: List[LearningCurvePoint]
    learning_curves_hindsight: List[LearningCurvePoint]
    episodes_memoryless: List[EpisodeTrace]
    episodes_hindsight: List[EpisodeTrace]
    statistical_summary: Dict[str, Any] = Field(default_factory=dict)
    hindsight_dependency_verified: bool = True
    hindsight_advantage_summary: str = ""
