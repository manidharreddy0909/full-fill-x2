"""
FULFILL-X Agent System Pydantic Schemas (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-002 - P05-005)
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.world import WorldStateSnapshot
from app.schemas.risk import RiskScoreMap
from app.schemas.signal import Signal


class AgentId(str, Enum):
    INVENTORY = "inventory"
    SUPPLIER = "supplier"
    TRANSPORTATION = "transportation"
    FULFILLMENT = "fulfillment"
    SUSTAINABILITY = "sustainability"
    RESILIENCE = "resilience"
    COORDINATOR = "coordinator"
    ADVERSARY = "adversary"
    PLANNER = "planner"
    VERIFICATION = "verification"



class AgentObjective(str, Enum):
    MINIMIZE_STOCKOUT_RISK = "MINIMIZE_STOCKOUT_RISK"
    REDUCE_SUPPLIER_DISRUPTION = "REDUCE_SUPPLIER_DISRUPTION"
    REDUCE_DELAY_AND_COST = "REDUCE_DELAY_AND_COST"
    PROTECT_SERVICE_LEVEL = "PROTECT_SERVICE_LEVEL"
    REDUCE_EMISSIONS = "REDUCE_EMISSIONS"
    REDUCE_SYSTEMIC_FRAGILITY = "REDUCE_SYSTEMIC_FRAGILITY"
    RECONCILE_AND_RANK = "RECONCILE_AND_RANK"
    ATTACK_AND_AUDIT = "ATTACK_AND_AUDIT"
    VERIFY_AND_SIMULATE = "VERIFY_AND_SIMULATE"


class AgentResultStatus(str, Enum):
    PROPOSED = "PROPOSED"
    INFEASIBLE = "INFEASIBLE"
    SIMULATION_REJECTED = "SIMULATION_REJECTED"
    TIMEOUT = "TIMEOUT"
    AI_ERROR = "AI_ERROR"
    PARTIAL = "PARTIAL"


class AgentActionType(str, Enum):
    REORDER_STOCK = "REORDER_STOCK"
    STOCK_TRANSFER = "STOCK_TRANSFER"
    SUPPLIER_SWITCH = "SUPPLIER_SWITCH"
    DUAL_SOURCE_ALLOCATION = "DUAL_SOURCE_ALLOCATION"
    REROUTE_FLOW = "REROUTE_FLOW"
    MODE_SWITCH = "MODE_SWITCH"
    ORDER_PRIORITY_CHANGE = "ORDER_PRIORITY_CHANGE"
    FC_REALLOCATION = "FC_REALLOCATION"
    EMISSIONS_ANNOTATION = "EMISSIONS_ANNOTATION"
    DIVERSIFY_DEPENDENCY = "DIVERSIFY_DEPENDENCY"


class AgentAction(BaseModel):
    action_id: str = Field(default_factory=lambda: f"ACT-{uuid4().hex[:6]}", description="Unique action ID")
    action_type: AgentActionType = Field(..., description="Action classification type")
    target_node_id: str | None = Field(default=None, description="Primary affected node ID")
    target_edge_id: str | None = Field(default=None, description="Primary affected edge ID")
    parameters: dict[str, Any] = Field(default_factory=dict, description="Action specific operational parameters")
    estimated_cost: float = Field(default=0.0, description="Estimated action cost in USD")
    estimated_delay_hours: float = Field(default=0.0, description="Estimated delay delta in hours")
    estimated_emissions_co2_kg: float = Field(default=0.0, description="Estimated CO2 emissions in kg")


class AgentConstraint(BaseModel):
    constraint_name: str
    description: str
    satisfied: bool = True
    violation_reason: str | None = None


class AgentInput(BaseModel):
    agent_id: AgentId
    world_snapshot: WorldStateSnapshot
    risk_map: RiskScoreMap
    active_signals: list[Signal] = Field(default_factory=list)
    target_node_ids: list[str] = Field(default_factory=list)
    constraints: list[AgentConstraint] = Field(default_factory=list)
    other_agent_proposals: list[dict[str, Any]] = Field(default_factory=list)


class AgentProposal(BaseModel):
    proposal_id: str = Field(default_factory=lambda: f"PROP-{uuid4().hex[:6]}", description="Unique proposal UUID")
    agent_id: AgentId = Field(..., description="Originating agent ID")
    agent_name: str = Field(..., description="Agent display name")
    objective: AgentObjective = Field(..., description="Agent primary objective")
    summary: str = Field(..., description="Natural language proposal summary")
    actions: list[AgentAction] = Field(default_factory=list, description="List of proposed operational actions")
    affected_node_ids: list[str] = Field(default_factory=list, description="All node IDs directly impacted")
    affected_edge_ids: list[str] = Field(default_factory=list, description="All edge IDs directly impacted")
    expected_impacts: dict[str, Any] = Field(default_factory=dict, description="Quantified performance delta")
    confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="Agent confidence rating")
    evidence_signal_ids: list[str] = Field(default_factory=list, description="Traceable signal IDs supporting proposal")
    reasoning_trace: list[str] = Field(default_factory=list, description="Step-by-step reasoning steps")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AgentResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: AgentResultStatus = Field(..., description="Execution status")
    agent_id: AgentId = Field(..., description="Target agent ID")
    proposal: AgentProposal | None = Field(default=None, description="Validated proposal payload if successful")
    violations: list[str] = Field(default_factory=list, description="Constraint or entity validation error messages")
    latency_ms: float = Field(default=0.0, description="Execution time in ms")
    provider_used: str = Field(default="mock", description="AI provider used for reasoning")


class AgentMetadata(BaseModel):
    id: AgentId
    name: str
    color: str
    objective: AgentObjective
    description: str
    allowed_action_types: list[AgentActionType]


class AllSpecialistProposalsResponse(BaseModel):
    snapshot_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    results: dict[str, AgentResult]
    total_agents: int
    successful_count: int
