"""
FULFILL-X Digital Twin & Monte Carlo Simulation Schemas (Phase 8)
Strict Pydantic v2 schemas defining immutable state, scenario events, bounded distributions,
Monte Carlo outputs, resilience metrics, strategy evaluation, and calibration.
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4
from pydantic import BaseModel, Field, ConfigDict, field_validator


class SimulationHorizon(str, Enum):
    H6 = "6h"
    H12 = "12h"
    H24 = "24h"
    H48 = "48h"
    H72 = "72h"
    D7 = "7d"
    D14 = "14d"
    D30 = "30d"

    def to_hours(self) -> int:
        mapping = {
            SimulationHorizon.H6: 6,
            SimulationHorizon.H12: 12,
            SimulationHorizon.H24: 24,
            SimulationHorizon.H48: 48,
            SimulationHorizon.H72: 72,
            SimulationHorizon.D7: 168,
            SimulationHorizon.D14: 336,
            SimulationHorizon.D30: 720,
        }
        return mapping[self]


class DisruptionType(str, Enum):
    SUPPLIER_OUTAGE = "SUPPLIER_OUTAGE"
    PORT_CONGESTION = "PORT_CONGESTION"
    PORT_CLOSURE = "PORT_CLOSURE"
    WAREHOUSE_OUTAGE = "WAREHOUSE_OUTAGE"
    FC_CAPACITY_REDUCTION = "FC_CAPACITY_REDUCTION"
    TRANSPORT_DELAY = "TRANSPORT_DELAY"
    ROUTE_FAILURE = "ROUTE_FAILURE"
    DEMAND_SURGE = "DEMAND_SURGE"
    INVENTORY_SHRINKAGE = "INVENTORY_SHRINKAGE"
    WEATHER_DISRUPTION = "WEATHER_DISRUPTION"
    EARTHQUAKE = "EARTHQUAKE"
    COMPOUND = "COMPOUND"


class DisruptionEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"evt-{uuid4().hex[:8]}")
    target: str = Field(..., description="Target node ID, edge ID, or region")
    start_time: int = Field(default=0, ge=0, description="Simulation step hour when event triggers")
    duration: int = Field(default=24, gt=0, description="Duration in hours")
    severity: float = Field(default=0.5, ge=0.0, le=1.0, description="Disruption magnitude [0,1]")
    capacity_multiplier: float = Field(default=0.0, ge=0.0, le=1.0, description="Remaining capacity multiplier [0,1]")
    probability: float = Field(default=1.0, ge=0.0, le=1.0, description="Event occurrence probability")
    source: str = Field(default="USER", description="Source (USER, ADVERSARY, HISTORICAL, GNN)")
    type: DisruptionType = Field(default=DisruptionType.SUPPLIER_OUTAGE)

    model_config = ConfigDict(frozen=True)


class DistributionType(str, Enum):
    NORMAL = "NORMAL"
    LOGNORMAL = "LOGNORMAL"
    TRIANGULAR = "TRIANGULAR"
    CATEGORICAL = "CATEGORICAL"
    UNIFORM = "UNIFORM"


class SimulationDistribution(BaseModel):
    distribution_type: DistributionType = Field(default=DistributionType.NORMAL)
    parameters: Dict[str, float] = Field(default_factory=lambda: {"mean": 0.0, "std": 1.0})
    min_value: float = Field(default=0.0)
    max_value: float = Field(default=100.0)
    seed: int = Field(default=42)

    model_config = ConfigDict(frozen=True)


class ScenarioConfig(BaseModel):
    scenario_id: str = Field(default_factory=lambda: f"scn-{uuid4().hex[:8]}")
    name: str = Field(..., max_length=120)
    description: Optional[str] = None
    events: List[DisruptionEvent] = Field(default_factory=list)
    demand_shock_pct: float = Field(default=0.0, ge=-1.0, le=10.0, description="Network-wide demand multiplier delta")
    recovery_delay_multiplier: float = Field(default=1.0, ge=0.1, le=10.0)
    seed: int = Field(default=42)


class NodeSimState(BaseModel):
    node_id: str
    node_type: str
    inventory: float = Field(ge=0.0)
    max_capacity: float = Field(gt=0.0)
    current_capacity: float = Field(ge=0.0)
    backlog: float = Field(default=0.0, ge=0.0)
    lead_time_hours: float = Field(default=24.0, gt=0.0)
    is_disrupted: bool = Field(default=False)
    disruption_multiplier: float = Field(default=1.0, ge=0.0, le=1.0)
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)

    model_config = ConfigDict(frozen=False)


class EdgeSimState(BaseModel):
    edge_id: str
    source_id: str
    target_id: str
    transit_load: float = Field(default=0.0, ge=0.0)
    max_capacity: float = Field(default=1000.0, gt=0.0)
    is_disrupted: bool = Field(default=False)
    delay_hours: float = Field(default=0.0, ge=0.0)

    model_config = ConfigDict(frozen=False)


class DigitalTwinState(BaseModel):
    twin_id: str = Field(..., description="Unique Twin instance ID (e.g. DT-2026-001)")
    world_snapshot_id: str = Field(...)
    graph_snapshot_id: str = Field(...)
    twin_version: str = Field(default="1.0.0")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    seed: int = Field(default=42)
    scenario_id: str = Field(default="baseline")
    step: int = Field(default=0, ge=0, description="Current simulation hour step")
    max_steps: int = Field(default=72, gt=0)
    nodes: Dict[str, NodeSimState] = Field(default_factory=dict)
    edges: Dict[str, EdgeSimState] = Field(default_factory=dict)
    total_demand: float = Field(default=0.0, ge=0.0)
    fulfilled_demand: float = Field(default=0.0, ge=0.0)
    backlog: float = Field(default=0.0, ge=0.0)
    total_cost: float = Field(default=0.0, ge=0.0)
    disrupted_nodes_count: int = Field(default=0, ge=0)
    active_disruptions: List[DisruptionEvent] = Field(default_factory=list)
    production_mutation: bool = Field(default=False, description="Strict safety constraint flag")
    mode: str = Field(default="SIMULATION")

    @field_validator("production_mutation")
    @classmethod
    def enforce_no_production_mutation(cls, v: bool) -> bool:
        if v is True:
            raise ValueError("Simulation state MUST NOT mutate production state.")
        return v


class SimulationStepOutcome(BaseModel):
    step: int
    fulfilled_demand: float
    total_demand: float
    service_level: float
    backlog: float
    active_disruptions_count: int
    capacity_utilization: float
    total_cost: float
    node_disruptions: Dict[str, float] = Field(default_factory=dict)


class SimulationRunResult(BaseModel):
    run_id: str = Field(default_factory=lambda: f"sim-{uuid4().hex[:8]}")
    twin_id: str
    scenario_id: str
    seed: int
    horizon_hours: int
    step_outcomes: List[SimulationStepOutcome] = Field(default_factory=list)
    overall_service_level: float
    total_backlog: float
    total_cost: float
    recovery_time_hours: float
    time_to_failure_hours: Optional[float] = None
    max_disrupted_nodes: int
    stockout_occurred: bool


class MonteCarloConfig(BaseModel):
    scenario_id: str = Field(default="baseline")
    n_simulations: int = Field(default=1000, ge=10, le=5000, description="Bounded iteration count")
    seed: int = Field(default=42)
    horizon: SimulationHorizon = Field(default=SimulationHorizon.H72)
    max_workers: int = Field(default=4, ge=1, le=16)


class Percentiles(BaseModel):
    p10: float
    p25: float
    p50: float
    p75: float
    p90: float


class ResilienceMetrics(BaseModel):
    service_level_dist: Percentiles
    cost_dist: Percentiles
    recovery_time_dist: Percentiles
    backlog_dist: Percentiles
    affected_nodes_dist: Percentiles
    service_resilience: float = Field(..., ge=0.0, le=1.0)
    recovery_resilience: float = Field(..., ge=0.0, le=1.0)
    cost_resilience: float = Field(..., ge=0.0, le=1.0)
    network_resilience: float = Field(..., ge=0.0, le=1.0)
    customer_resilience: float = Field(..., ge=0.0, le=1.0)
    inventory_resilience: float = Field(..., ge=0.0, le=1.0)
    transportation_resilience: float = Field(..., ge=0.0, le=1.0)
    compound_resilience: float = Field(..., ge=0.0, le=1.0)
    resilience_score: float = Field(..., ge=0.0, le=100.0)
    stockout_probability: float = Field(..., ge=0.0, le=1.0)
    cvar_cost_95: float = Field(..., ge=0.0)
    var_cost_95: float = Field(..., ge=0.0)
    ttr_p90: float = Field(..., ge=0.0)
    ttf_median: Optional[float] = None
    weights_used: Dict[str, float] = Field(default_factory=dict)


class ResilienceCurvePoint(BaseModel):
    step_hour: int
    service_level: float
    inventory_level: float
    backlog: float
    risk_score: float
    disrupted_count: int


class ResilienceCurve(BaseModel):
    points: List[ResilienceCurvePoint] = Field(default_factory=list)


class MonteCarloResult(BaseModel):
    mc_id: str = Field(default_factory=lambda: f"mc-{uuid4().hex[:8]}")
    twin_id: str
    scenario_id: str
    n_simulations: int
    seed: int
    horizon_hours: int
    execution_time_sec: float
    metrics: ResilienceMetrics
    resilience_curve: ResilienceCurve
    runs: List[SimulationRunResult] = Field(default_factory=list)


class CriticalityResult(BaseModel):
    node_id: str
    node_name: str
    node_type: str
    failure_probability: float
    expected_downstream_impact: float
    service_impact: float
    cost_impact: float
    propagation_depth: int
    downstream_customers: int
    criticality_rank: int
    criticality_score: float


class StrategyAction(BaseModel):
    action_id: str = Field(default_factory=lambda: f"act-{uuid4().hex[:6]}")
    type: str = Field(..., description="INVENTORY_INCREASE, ALTERNATE_SUPPLIER, SAFETY_STOCK, REROUTE, SPLIT_DEMAND")
    target: str = Field(..., description="Node or Edge ID")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class StrategyConfig(BaseModel):
    strategy_id: str = Field(default_factory=lambda: f"strat-{uuid4().hex[:6]}")
    name: str
    description: Optional[str] = None
    actions: List[StrategyAction] = Field(default_factory=list)


class StrategySimulationRequest(BaseModel):
    scenario_config: ScenarioConfig
    candidate_strategies: List[StrategyConfig] = Field(default_factory=list)
    mc_config: MonteCarloConfig = Field(default_factory=MonteCarloConfig)


class StrategyMetricSummary(BaseModel):
    strategy_id: str
    name: str
    service_p10: float
    service_p50: float
    service_p90: float
    cost_p90: float
    ttr_p90: float
    cvar_95: float
    stockout_prob: float
    threshold_breach_prob: float
    robustness_score: float


class StrategyComparisonResult(BaseModel):
    comparison_id: str = Field(default_factory=lambda: f"cmp-{uuid4().hex[:8]}")
    baseline: StrategyMetricSummary
    candidates: List[StrategyMetricSummary] = Field(default_factory=list)
    recommended_strategy_id: str
    trade_offs: Dict[str, str] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TwinCalibrationReport(BaseModel):
    calibration_id: str = Field(default_factory=lambda: f"cal-{uuid4().hex[:8]}")
    twin_id: str
    world_snapshot_id: str
    mae_service_level: float
    rmse_service_level: float
    recovery_time_error_hours: float
    status: str = Field(default="CALIBRATED", description="CALIBRATED or NEEDS_CALIBRATION")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
