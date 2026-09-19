"""
FULFILL-X Planner Pydantic Schemas (Phase 08)
Structured, deterministic, and serializable data models for multi-objective planning,
Pareto dominance calculation, baseline and robust Pareto frontiers, constraint evaluation,
sensitivity sweeps, and trade-off explanations.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ObjectiveDirection(str, Enum):
    MINIMIZE = "MINIMIZE"
    MAXIMIZE = "MAXIMIZE"

class PlannerObjective(str, Enum):
    # Core Specialist Objectives
    MINIMIZE_STOCKOUT_RISK = "MINIMIZE_STOCKOUT_RISK"
    REDUCE_SUPPLIER_DISRUPTION = "REDUCE_SUPPLIER_DISRUPTION"
    REDUCE_DELAY_AND_COST = "REDUCE_DELAY_AND_COST"
    PROTECT_SERVICE_LEVEL = "PROTECT_SERVICE_LEVEL"
    REDUCE_EMISSIONS = "REDUCE_EMISSIONS"
    REDUCE_SYSTEMIC_FRAGILITY = "REDUCE_SYSTEMIC_FRAGILITY"
    # Adversarial Resilience Dimensions
    SERVICE_RESILIENCE = "SERVICE_RESILIENCE"
    SUPPLY_RESILIENCE = "SUPPLY_RESILIENCE"
    TRANSPORT_RESILIENCE = "TRANSPORT_RESILIENCE"
    INVENTORY_RESILIENCE = "INVENTORY_RESILIENCE"
    COST_RESILIENCE = "COST_RESILIENCE"
    EMISSIONS_RESILIENCE = "EMISSIONS_RESILIENCE"
    RECOVERY_RESILIENCE = "RECOVERY_RESILIENCE"
    NETWORK_RESILIENCE = "NETWORK_RESILIENCE"

class ConstraintType(str, Enum):
    MAX_COST = "MAX_COST"
    MAX_DELAY = "MAX_DELAY"
    MAX_EMISSIONS = "MAX_EMISSIONS"
    MIN_SERVICE_LEVEL = "MIN_SERVICE_LEVEL"
    MAX_STOCKOUT_RISK = "MAX_STOCKOUT_RISK"
    MAX_RECOVERY_TIME = "MAX_RECOVERY_TIME"
    MIN_RESILIENCE = "MIN_RESILIENCE"
    CAPACITY_LIMIT = "CAPACITY_LIMIT"
    ROUTE_AVAILABILITY = "ROUTE_AVAILABILITY"
    SUPPLIER_CAPACITY = "SUPPLIER_CAPACITY"

class FeasibilityStatus(str, Enum):
    FEASIBLE = "FEASIBLE"
    INFEASIBLE = "INFEASIBLE"
    CONDITIONAL = "CONDITIONAL"

class ParetoDominanceStatus(str, Enum):
    DOMINATES = "DOMINATES"
    DOMINATED = "DOMINATED"
    NON_DOMINATED = "NON_DOMINATED"
    INCOMPARABLE = "INCOMPARABLE"

class ObjectiveWeight(BaseModel):
    objective: PlannerObjective = Field(..., description="Target objective")
    weight: float = Field(..., ge=0.0, le=1.0, description="Normalized priority weight [0.0, 1.0]")

class ObjectiveValue(BaseModel):
    objective: PlannerObjective = Field(..., description="Target objective")
    direction: ObjectiveDirection = Field(..., description="Optimization direction (MINIMIZE or MAXIMIZE)")
    raw_value: float = Field(..., description="Un-normalized raw value with original unit")
    normalized_value: float = Field(..., ge=0.0, le=1.0, description="Normalized score in [0.0, 1.0] where 1.0 is optimal")
    unit: str = Field(default="", description="Original metric unit e.g. $, hrs, kg, %")
    source: str = Field(default="COORDINATOR", description="Data source: COORDINATOR or ADVERSARY")
    explanation: str = Field(default="", description="Explanation of metric value and calculation")

class ObjectiveVector(BaseModel):
    candidate_id: str = Field(..., description="Candidate plan identifier")
    values: List[ObjectiveValue] = Field(default_factory=list, description="Vector of all evaluated objective values")

class Constraint(BaseModel):
    constraint_id: str = Field(..., description="Unique constraint identifier")
    type: ConstraintType = Field(..., description="Constraint type category")
    threshold_value: float = Field(..., description="Boundary threshold limit")
    unit: str = Field(default="", description="Measurement unit")
    description: str = Field(..., description="Human-readable business boundary description")

class ConstraintViolation(BaseModel):
    constraint_id: str = Field(..., description="Linked constraint ID")
    type: ConstraintType = Field(..., description="Violation category")
    actual_value: float = Field(..., description="Actual measured value")
    threshold_value: float = Field(..., description="Boundary threshold limit")
    delta: float = Field(..., description="Magnitude of violation beyond threshold")
    severity: str = Field(default="HIGH", description="Violation severity level")

class FeasibilityResult(BaseModel):
    status: FeasibilityStatus = Field(..., description="Feasibility classification")
    violations: List[ConstraintViolation] = Field(default_factory=list, description="Explicit constraint violations")
    conditional_reasons: List[str] = Field(default_factory=list, description="Conditions required if CONDITIONAL")
    evidence: List[str] = Field(default_factory=list, description="Supporting evidence items")

class ParetoPoint(BaseModel):
    candidate_id: str = Field(..., description="Candidate plan ID")
    candidate_name: str = Field(..., description="Candidate plan name")
    objective_vector: ObjectiveVector = Field(..., description="Multi-objective vector")
    feasibility: FeasibilityResult = Field(..., description="Feasibility status")
    dominance_status: ParetoDominanceStatus = Field(..., description="Pareto dominance classification")
    dominated_by_ids: List[str] = Field(default_factory=list, description="IDs of plans that strictly dominate this point")

class ParetoFrontier(BaseModel):
    frontier_id: str = Field(..., description="Unique frontier identifier")
    name: str = Field(default="Baseline Pareto Frontier", description="Frontier title")
    non_dominated_candidate_ids: List[str] = Field(default_factory=list, description="IDs of non-dominated Pareto optimal plans")
    dominated_candidate_ids: List[str] = Field(default_factory=list, description="IDs of dominated plans")
    points: List[ParetoPoint] = Field(default_factory=list, description="All evaluated candidate points")

class RobustnessProfile(BaseModel):
    candidate_id: str = Field(..., description="Candidate plan ID")
    baseline_resilience_score: float = Field(..., ge=0.0, le=100.0, description="Baseline un-stressed resilience score")
    stressed_resilience_score: float = Field(..., ge=0.0, le=100.0, description="Adversarial stressed resilience score")
    degradation_pct: float = Field(..., description="Resilience degradation percentage under attack")
    recovery_time_days: float = Field(..., description="Network recovery time in days")
    vulnerability_count: int = Field(default=0, description="Total vulnerabilities detected")
    critical_vulnerability_count: int = Field(default=0, description="Critical vulnerabilities detected")

class PlanSensitivityItem(BaseModel):
    parameter_name: str = Field(..., description="Perturbed parameter name e.g. Cost Priority Weight")
    weight_delta: float = Field(..., description="Perturbation shift magnitude e.g. +0.20")
    new_non_dominated_ids: List[str] = Field(default_factory=list, description="Resulting non-dominated candidate IDs")
    is_frontier_altered: bool = Field(default=False, description="True if non-dominated set shifted under perturbation")
    impact_summary: str = Field(..., description="Description of sensitivity impact")

class PlanEvaluation(BaseModel):
    candidate_id: str = Field(..., description="Candidate plan ID")
    candidate_name: str = Field(..., description="Candidate plan name")
    objective_vector: ObjectiveVector = Field(..., description="Multi-objective vector")
    feasibility: FeasibilityResult = Field(..., description="Feasibility result")
    dominance_status: ParetoDominanceStatus = Field(..., description="Baseline Pareto dominance status")
    robustness_profile: RobustnessProfile = Field(..., description="Adversarial robustness profile")
    robust_dominance_status: ParetoDominanceStatus = Field(..., description="Robust Pareto dominance status")
    tradeoff_summary: Dict[str, Any] = Field(default_factory=dict, description="Key pros and cons trade-off summary")

class PlannerStatus(BaseModel):
    engine_version: str = "1.0.0"
    status: str = "READY"
    supported_objectives: List[PlannerObjective] = Field(default_factory=lambda: list(PlannerObjective))
    supported_constraints: List[ConstraintType] = Field(default_factory=lambda: list(ConstraintType))

class PlannerReport(BaseModel):
    report_id: str = Field(..., description="Unique planner report identifier")
    coordination_id: str = Field(default="", description="Source coordination ID")
    adversary_report_id: str = Field(default="", description="Source adversary report ID if present")
    timestamp: str = Field(..., description="ISO timestamp of report creation")
    plan_evaluations: List[PlanEvaluation] = Field(default_factory=list, description="Detailed evaluations per plan")
    baseline_frontier: ParetoFrontier = Field(..., description="Baseline Pareto Frontier")
    robust_frontier: ParetoFrontier = Field(..., description="Robust Pareto Frontier (under stress)")
    sensitivity_analysis: List[PlanSensitivityItem] = Field(default_factory=list, description="Sensitivity sweep results")
    recommended_candidates: List[str] = Field(default_factory=list, description="Pareto-optimal recommended candidate plan IDs")
    summary_narrative: str = Field(default="", description="Narrative trade-off summary for decision-makers")
    latency_ms: float = Field(default=0.0, description="Planner execution latency in milliseconds")
