"""
FULFILL-X Verification & Validation Schemas (Phase 09)
Structured Pydantic v2 schemas for ExecutionPlan, multi-layer validation checks,
sandbox execution simulation, risk re-evaluation, state diffs, and verification reports.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.agent import AgentId, AgentObjective, AgentActionType
from app.schemas.coordinator import CandidatePlan, ProposalNormalization
from app.schemas.planner import FeasibilityStatus, Constraint


class VerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    CONDITIONAL = "CONDITIONAL"
    REJECTED = "REJECTED"


class ValidationSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class ValidationCategory(str, Enum):
    ACTION = "ACTION"
    CAPACITY = "CAPACITY"
    ROUTE = "ROUTE"
    INVENTORY = "INVENTORY"
    DEPENDENCY = "DEPENDENCY"
    RISK = "RISK"
    CONSTRAINT = "CONSTRAINT"
    SIMULATION = "SIMULATION"


class ExecutionPlan(BaseModel):
    plan_id: str = Field(..., description="Target candidate plan ID (e.g., candidate-a)")
    source_candidate_name: str = Field(..., description="Human-readable plan name")
    actions: List[ProposalNormalization] = Field(default_factory=list, description="Normalized plan actions")
    affected_node_ids: List[str] = Field(default_factory=list, description="All targeted node IDs")
    affected_edge_ids: List[str] = Field(default_factory=list, description="All targeted edge IDs")
    expected_metrics: Dict[str, float] = Field(default_factory=dict, description="Pre-simulation estimated metrics")
    constraints: List[Constraint] = Field(default_factory=list, description="Constraints to validate")
    assumptions: List[str] = Field(default_factory=list, description="Operational assumptions to test")
    provenance: Dict[str, Any] = Field(default_factory=dict, description="Origin specialist & coordinator tracking")
    adversarial_findings_summary: Optional[str] = Field(None, description="Reference adversary findings")


class ValidationCheck(BaseModel):
    check_id: str = Field(..., description="Unique check identifier")
    name: str = Field(..., description="Short check title")
    category: ValidationCategory
    status: str = Field(..., description="PASSED, WARNING, or FAILED")
    severity: ValidationSeverity
    message: str = Field(..., description="Human-readable explanation of check result")
    evidence: str = Field(..., description="Traceable quantitative evidence string")
    affected_entities: List[str] = Field(default_factory=list, description="Node or edge IDs associated with check")


class CapacityCheck(BaseModel):
    entity_id: str = Field(..., description="Node or edge ID being evaluated for capacity")
    entity_name: str = Field(..., description="Human-readable name of entity")
    capacity_type: str = Field(..., description="SUPPLIER, PORT, WAREHOUSE, FULFILLMENT, or TRANSPORT")
    requested_load: float = Field(..., description="Requested operational throughput / volume")
    available_capacity: float = Field(..., description="Maximum allowed capacity")
    capacity_utilization_percent: float = Field(..., description="Simulated utilization percentage")
    is_exceeded: bool = Field(..., description="True if requested exceeds capacity")
    status: ValidationSeverity = Field(..., description="INFO, WARNING, ERROR, or CRITICAL")
    message: str = Field(..., description="Detailed capacity evaluation message")


class RouteCheck(BaseModel):
    route_id: str = Field(..., description="Edge or transport route ID")
    source_node_id: str = Field(..., description="Origin node ID")
    target_node_id: str = Field(..., description="Destination node ID")
    exists_in_graph: bool = Field(True, description="True if route exists in world model")
    is_available: bool = Field(True, description="True if route is operational")
    is_blocked: bool = Field(False, description="True if route is disrupted/blocked")
    transport_mode: str = Field("GROUND", description="Transport mode used")
    status: ValidationSeverity = Field(ValidationSeverity.INFO)
    message: str = Field(..., description="Route validation detail")


class InventoryCheck(BaseModel):
    facility_id: str = Field(..., description="Warehouse or Fulfillment Center node ID")
    facility_name: str = Field(..., description="Facility name")
    current_stock: float = Field(..., description="Baseline available stock quantity")
    safety_stock_threshold: float = Field(..., description="Required safety stock level")
    requested_transfer_quantity: float = Field(0.0, description="Requested stock movement quantity")
    projected_stock_after: float = Field(..., description="Simulated stock level after execution")
    has_negative_inventory: bool = Field(False, description="True if projected stock < 0")
    violates_safety_stock: bool = Field(False, description="True if projected stock < safety stock")
    status: ValidationSeverity = Field(ValidationSeverity.INFO)
    message: str = Field(..., description="Inventory evaluation detail")


class DependencyCheck(BaseModel):
    node_id: str = Field(..., description="Target node ID")
    node_name: str = Field(..., description="Node name")
    dependencies_before: int = Field(..., description="Incoming dependency count before plan")
    dependencies_after: int = Field(..., description="Incoming dependency count after plan")
    is_single_source_created: bool = Field(False, description="True if plan creates a single source dependency")
    is_bottleneck_exacerbated: bool = Field(False, description="True if plan increases bottleneck concentration")
    status: ValidationSeverity = Field(ValidationSeverity.INFO)
    message: str = Field(..., description="Dependency change detail")


class RiskCheck(BaseModel):
    node_id: str = Field(..., description="Evaluated node ID")
    node_name: str = Field(..., description="Node name")
    risk_score_before: float = Field(..., description="Baseline risk score [0.0 - 1.0]")
    risk_score_after: float = Field(..., description="Simulated post-execution risk score [0.0 - 1.0]")
    risk_delta: float = Field(..., description="Change in risk score (after - before)")
    is_newly_created_risk: bool = Field(False, description="True if node risk jumped from LOW to HIGH/CRITICAL")
    is_displaced_risk: bool = Field(False, description="True if risk was shifted from one region to another")
    status: ValidationSeverity = Field(ValidationSeverity.INFO)
    message: str = Field(..., description="Risk re-evaluation detail")


class ConstraintCheck(BaseModel):
    constraint_id: str = Field(..., description="Constraint ID")
    name: str = Field(..., description="Constraint description")
    constraint_type: str = Field("HARD", description="HARD or SOFT")
    metric_name: str = Field(..., description="Target metric name")
    threshold: float = Field(..., description="Threshold limit")
    actual_simulated_value: float = Field(..., description="Simulated metric value")
    is_satisfied: bool = Field(..., description="True if simulated value satisfies threshold")
    status: ValidationSeverity = Field(ValidationSeverity.INFO)
    message: str = Field(..., description="Constraint re-validation message")


class StateDiff(BaseModel):
    service_level_before: float = Field(..., description="Baseline service level %")
    service_level_after: float = Field(..., description="Simulated service level %")
    service_level_delta: float = Field(..., description="Service level % change")
    
    total_cost_before: float = Field(..., description="Baseline estimated cost")
    total_cost_after: float = Field(..., description="Simulated estimated cost")
    total_cost_delta: float = Field(..., description="Cost change ($)")
    
    delay_hours_before: float = Field(..., description="Baseline transit delay hours")
    delay_hours_after: float = Field(..., description="Simulated transit delay hours")
    delay_hours_delta: float = Field(..., description="Transit delay hours change")

    emissions_co2_before: float = Field(..., description="Baseline emissions CO2 kg")
    emissions_co2_after: float = Field(..., description="Simulated emissions CO2 kg")
    emissions_co2_delta_percent: float = Field(..., description="Emissions % change")

    aggregate_risk_before: float = Field(..., description="Baseline mean risk score [0-1]")
    aggregate_risk_after: float = Field(..., description="Simulated mean risk score [0-1]")
    aggregate_risk_delta: float = Field(..., description="Mean risk score change")

    critical_risk_nodes_before: int = Field(..., description="Critical risk nodes count before")
    critical_risk_nodes_after: int = Field(..., description="Critical risk nodes count after")
    critical_risk_nodes_delta: int = Field(..., description="Critical risk nodes count change")


class SimulationResult(BaseModel):
    simulation_id: str = Field(..., description="Unique simulation ID")
    execution_plan_id: str = Field(..., description="Target plan ID")
    is_successful: bool = Field(..., description="True if sandbox simulation executed without panic/error")
    executed_actions_count: int = Field(..., description="Number of actions applied in sandbox graph")
    failed_actions_count: int = Field(0, description="Number of actions that failed to apply")
    simulation_notes: List[str] = Field(default_factory=list, description="Step-by-step simulation log")
    state_diff: StateDiff = Field(..., description="Before vs After state difference metrics")


class VerificationFinding(BaseModel):
    finding_id: str = Field(..., description="Unique finding ID")
    title: str = Field(..., description="Short finding summary")
    severity: ValidationSeverity = Field(..., description="INFO, WARNING, ERROR, or CRITICAL")
    category: ValidationCategory
    description: str = Field(..., description="Detailed explanation of finding")
    remediation_advice: str = Field(..., description="Recommended action to resolve finding")
    affected_entities: List[str] = Field(default_factory=list)


class VerificationReport(BaseModel):
    verification_id: str = Field(..., description="Unique verification report ID")
    candidate_id: str = Field(..., description="Evaluated candidate plan ID")
    candidate_name: str = Field(..., description="Candidate plan name")
    coordination_id: Optional[str] = Field(None, description="Associated coordination ID")
    timestamp: str = Field(..., description="Verification timestamp (ISO string)")
    status: VerificationStatus = Field(..., description="VERIFIED, CONDITIONAL, or REJECTED")
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Composite verification confidence score 0-100")
    summary_headline: str = Field(..., description="High-level verification verdict headline")
    narrative_explanation: str = Field(..., description="Human-readable verification narrative")
    
    total_checks_count: int = Field(..., description="Total validation checks executed")
    passed_checks_count: int = Field(..., description="Count of passed checks")
    warning_checks_count: int = Field(..., description="Count of warning checks")
    failed_checks_count: int = Field(..., description="Count of failed checks")

    validation_checks: List[ValidationCheck] = Field(default_factory=list)
    capacity_checks: List[CapacityCheck] = Field(default_factory=list)
    route_checks: List[RouteCheck] = Field(default_factory=list)
    inventory_checks: List[InventoryCheck] = Field(default_factory=list)
    dependency_checks: List[DependencyCheck] = Field(default_factory=list)
    risk_checks: List[RiskCheck] = Field(default_factory=list)
    constraint_checks: List[ConstraintCheck] = Field(default_factory=list)

    simulation_result: SimulationResult = Field(..., description="Sandbox execution simulation output")
    findings: List[VerificationFinding] = Field(default_factory=list)


class VerificationStatusResponse(BaseModel):
    status: str = Field("READY", description="Verification engine status")
    engine_version: str = Field("1.0.0", description="Engine version")
    supported_rules_count: int = Field(10, description="Total deterministic verification rules enforced")
    immutability_guarantee: str = Field("ZERO_MUTATION_SANDBOX", description="Safety boundary guarantee")


class VerificationRequest(BaseModel):
    candidate_plan: CandidatePlan = Field(..., description="Candidate plan to verify")
    coordination_id: Optional[str] = Field(None, description="Coordination session ID")
    custom_constraints: List[Constraint] = Field(default_factory=list, description="Optional custom constraints")
