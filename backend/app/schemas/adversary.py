"""
FULFILL-X Adversary Pydantic Schemas (Phase 07)
Structured, deterministic, and serializable data models for adversarial red-teaming,
attack taxonomy, assumption testing, isolated snapshot stress simulation,
multi-dimensional resilience scoring, vulnerability detection, and defensive recommendations.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AttackType(str, Enum):
    SUPPLIER_FAILURE = "SUPPLIER_FAILURE"
    SUPPLIER_CAPACITY_REDUCTION = "SUPPLIER_CAPACITY_REDUCTION"
    PORT_CLOSURE = "PORT_CLOSURE"
    PORT_CONGESTION = "PORT_CONGESTION"
    TRANSPORT_DELAY = "TRANSPORT_DELAY"
    TRANSPORT_MODE_FAILURE = "TRANSPORT_MODE_FAILURE"
    WAREHOUSE_CAPACITY_REDUCTION = "WAREHOUSE_CAPACITY_REDUCTION"
    FULFILLMENT_CENTER_FAILURE = "FULFILLMENT_CENTER_FAILURE"
    DEMAND_SPIKE = "DEMAND_SPIKE"
    INVENTORY_SHOCK = "INVENTORY_SHOCK"
    MULTI_NODE_FAILURE = "MULTI_NODE_FAILURE"
    COMPOUND_DISRUPTION = "COMPOUND_DISRUPTION"

class AttackSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ResilienceDimension(str, Enum):
    SERVICE = "SERVICE_RESILIENCE"
    SUPPLY = "SUPPLY_RESILIENCE"
    TRANSPORT = "TRANSPORT_RESILIENCE"
    INVENTORY = "INVENTORY_RESILIENCE"
    COST = "COST_RESILIENCE"
    EMISSIONS = "EMISSIONS_RESILIENCE"
    RECOVERY = "RECOVERY_RESILIENCE"
    NETWORK = "NETWORK_RESILIENCE"

class VulnerabilityType(str, Enum):
    SINGLE_SOURCE_DEPENDENCY = "SINGLE_SOURCE_DEPENDENCY"
    BOTTLENECK_DEPENDENCY = "BOTTLENECK_DEPENDENCY"
    CAPACITY_FRAGILITY = "CAPACITY_FRAGILITY"
    ROUTE_FRAGILITY = "ROUTE_FRAGILITY"
    INVENTORY_FRAGILITY = "INVENTORY_FRAGILITY"
    RECOVERY_FRAGILITY = "RECOVERY_FRAGILITY"
    OBJECTIVE_FRAGILITY = "OBJECTIVE_FRAGILITY"
    COMPOUND_FAILURE = "COMPOUND_FAILURE"

class AttackTarget(BaseModel):
    entity_id: str = Field(..., description="Target node ID or edge ID")
    entity_type: str = Field(..., description="Entity type e.g. SUPPLIER, PORT, WAREHOUSE, EDGE")
    entity_name: str = Field(..., description="Human-readable entity name")
    current_capacity: float = Field(default=100.0, description="Baseline capacity before attack")
    risk_score: float = Field(default=0.0, description="Risk score of entity")

class AttackAssumption(BaseModel):
    assumption_id: str = Field(..., description="Unique ID for assumption attack")
    candidate_id: str = Field(..., description="Target candidate plan ID e.g. candidate_a")
    description: str = Field(..., description="Description of the plan assumption being tested")
    tested_attack_type: AttackType = Field(..., description="Attack type used to test assumption")
    is_invalidated: bool = Field(default=False, description="Whether attack invalidates assumption")
    evidence: str = Field(..., description="Evidence/rationale for invalidation or survival")

class AdversaryAttack(BaseModel):
    attack_id: str = Field(..., description="Unique attack identifier")
    attack_type: AttackType = Field(..., description="Taxonomy attack type")
    severity: AttackSeverity = Field(default=AttackSeverity.HIGH, description="Attack severity level")
    targets: List[AttackTarget] = Field(default_factory=list, description="Targeted nodes or edges")
    duration_days: float = Field(default=7.0, description="Disruption duration in days")
    capacity_loss_pct: float = Field(default=50.0, description="Capacity loss percentage (0-100)")
    cost_multiplier: float = Field(default=1.5, description="Cost inflation multiplier during disruption")
    delay_hours: float = Field(default=24.0, description="Additional transport delay hours")
    assumptions_attacked: List[AttackAssumption] = Field(default_factory=list, description="Plan assumptions targeted")
    description: str = Field(..., description="Human-readable description of attack injection")

class StressScenario(BaseModel):
    scenario_id: str = Field(..., description="Unique stress scenario identifier")
    name: str = Field(..., description="Human-readable scenario name")
    attacks: List[AdversaryAttack] = Field(default_factory=list, description="List of attacks in scenario")
    is_compound: bool = Field(default=False, description="True if scenario combines multiple disruption vectors")

class DegradationMetric(BaseModel):
    metric_name: str = Field(..., description="Name of measured metric e.g. Service Level, Total Cost")
    baseline_val: float = Field(..., description="Baseline value before attack")
    stressed_val: float = Field(..., description="Stressed value under attack")
    delta_pct: float = Field(..., description="Percentage change (+ is degradation or increase)")
    unit: str = Field(default="", description="Unit of measurement e.g. %, $, hrs, kg")

class ResilienceScore(BaseModel):
    dimension: ResilienceDimension = Field(..., description="1 of 8 explicit resilience dimensions")
    score: float = Field(..., ge=0.0, le=100.0, description="Resilience score between 0 and 100")
    baseline_score: float = Field(default=100.0, ge=0.0, le=100.0, description="Baseline un-stressed score")
    delta: float = Field(..., description="Score change (stressed - baseline)")
    explanation: str = Field(..., description="Transparent textual explanation of score calculation")
    evidence: List[str] = Field(default_factory=list, description="Supporting empirical evidence items")

class Vulnerability(BaseModel):
    vulnerability_id: str = Field(..., description="Unique vulnerability identifier")
    type: VulnerabilityType = Field(..., description="Vulnerability taxonomy type")
    severity: AttackSeverity = Field(default=AttackSeverity.HIGH, description="Vulnerability severity")
    title: str = Field(..., description="Short vulnerability title")
    affected_entities: List[str] = Field(default_factory=list, description="Affected node or edge IDs")
    affected_candidate_ids: List[str] = Field(default_factory=list, description="Candidate plans vulnerable to this")
    description: str = Field(..., description="Detailed vulnerability breakdown")
    evidence: str = Field(..., description="Empirical evidence from stress simulation")

class DefensiveRecommendation(BaseModel):
    recommendation_id: str = Field(..., description="Unique recommendation ID")
    vulnerability_id: str = Field(..., description="Linked vulnerability ID")
    title: str = Field(..., description="Short title of defensive countermeasure")
    description: str = Field(..., description="Actionable recommendation details")
    suggested_action_type: str = Field(..., description="Suggested mitigation action type")
    target_entities: List[str] = Field(default_factory=list, description="Entities targeted for fortification")
    estimated_mitigation_pct: float = Field(default=50.0, description="Estimated risk mitigation percentage")

class PlanStressResult(BaseModel):
    candidate_id: str = Field(..., description="Candidate plan identifier e.g. candidate_a")
    candidate_name: str = Field(..., description="Candidate plan name")
    overall_resilience_score: float = Field(..., ge=0.0, le=100.0, description="Overall weighted resilience score")
    resilience_dimensions: List[ResilienceScore] = Field(default_factory=list, description="8 dimension scores")
    degradation_metrics: List[DegradationMetric] = Field(default_factory=list, description="Metric deltas")
    vulnerabilities: List[Vulnerability] = Field(default_factory=list, description="Plan specific vulnerabilities")
    invalidated_assumptions: List[AttackAssumption] = Field(default_factory=list, description="Plan assumptions invalidated")
    recovery_time_days: float = Field(default=0.0, description="Estimated network recovery time in days")
    unmet_demand_units: float = Field(default=0.0, description="Estimated unmet customer demand units")

class AdversaryStatus(BaseModel):
    engine_version: str = "1.0.0"
    status: str = "READY"
    supported_attack_types: List[AttackType] = Field(default_factory=lambda: list(AttackType))
    supported_vulnerability_types: List[VulnerabilityType] = Field(default_factory=lambda: list(VulnerabilityType))

class AdversaryReport(BaseModel):
    report_id: str = Field(..., description="Unique adversary report identifier")
    coordination_id: str = Field(default="", description="Source coordinator result ID if applicable")
    timestamp: str = Field(..., description="ISO timestamp of report creation")
    scenarios_tested: int = Field(default=0, description="Number of stress scenarios evaluated")
    attack_suite: List[AdversaryAttack] = Field(default_factory=list, description="Generated attack suite")
    plan_stress_results: List[PlanStressResult] = Field(default_factory=list, description="Stress results per plan")
    overall_vulnerabilities: List[Vulnerability] = Field(default_factory=list, description="Network-wide vulnerabilities")
    defensive_recommendations: List[DefensiveRecommendation] = Field(default_factory=list, description="Countermeasures")
    summary_narrative: str = Field(default="", description="Narrative summary of findings")
    latency_ms: float = Field(default=0.0, description="Adversary execution latency in milliseconds")
