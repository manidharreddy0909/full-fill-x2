"""
FULFILL-X Coordinator Pydantic Schemas (Phase 06)
Structured data models for multi-agent proposal normalization, agreement detection,
conflict identification, trade-off analysis, objective impact matrix, and candidate plan options.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.agent import AgentId, AgentObjective, AgentProposal, AgentAction, AgentActionType

class ConflictType(str, Enum):
  MUTUALLY_EXCLUSIVE_ROUTE = "MUTUALLY_EXCLUSIVE_ROUTE"
  RESOURCE_CONTENTION = "RESOURCE_CONTENTION"
  OBJECTIVE_OPPOSITION = "OBJECTIVE_OPPOSITION"
  PARAMETER_MISMATCH = "PARAMETER_MISMATCH"
  POLICY_INCOMPATIBILITY = "POLICY_INCOMPATIBILITY"

class CandidatePlanStatus(str, Enum):
  VALID = "VALID"
  INVALID = "INVALID"
  PARTIAL = "PARTIAL"
  REQUIRES_SIMULATION = "REQUIRES_SIMULATION"

class CoordinatorResultStatus(str, Enum):
  SUCCESS = "SUCCESS"
  PARTIAL_PROPOSALS = "PARTIAL_PROPOSALS"
  NO_PROPOSALS = "NO_PROPOSALS"
  NO_VALID_CANDIDATES = "NO_VALID_CANDIDATES"
  COORDINATION_ERROR = "COORDINATION_ERROR"

class ProposalNormalization(BaseModel):
  normalized_id: str = Field(..., description="Unique ID for normalized action representation")
  action_type: AgentActionType
  target_node_ids: List[str] = Field(default_factory=list)
  target_edge_ids: List[str] = Field(default_factory=list)
  parameters: Dict[str, Any] = Field(default_factory=dict)
  source_proposal_ids: List[str] = Field(default_factory=list)
  supporting_agent_ids: List[AgentId] = Field(default_factory=list)
  supporting_objectives: List[AgentObjective] = Field(default_factory=list)
  estimated_cost: float = 0.0
  estimated_delay_hours: float = 0.0
  estimated_emissions_co2_kg: float = 0.0

class Agreement(BaseModel):
  agreement_id: str = Field(..., description="Unique identifier for agreement")
  type: str = Field("REINFORCING_OBJECTIVE", description="Type of agreement")
  proposal_ids: List[str] = Field(..., description="Traceable original proposal IDs")
  agent_ids: List[AgentId] = Field(..., description="Agents contributing to agreement")
  affected_entities: List[str] = Field(default_factory=list, description="Shared node/edge target IDs")
  shared_intent: str = Field(..., description="Shared operational intent description")
  reason: str = Field(..., description="Detailed explanation of agreement")

class Conflict(BaseModel):
  conflict_id: str = Field(..., description="Unique identifier for conflict")
  proposal_id_a: str
  proposal_id_b: str
  agent_id_a: AgentId
  agent_id_b: AgentId
  conflict_type: ConflictType
  affected_entities: List[str] = Field(default_factory=list)
  objective_a: AgentObjective
  objective_b: AgentObjective
  reason: str = Field(..., description="Detailed explanation of why actions conflict")

class ObjectiveImpact(BaseModel):
  objective: AgentObjective
  impact_score: float = Field(0.0, ge=-1.0, le=1.0, description="Score from -1.0 (negative) to +1.0 (positive)")
  confidence: float = Field(0.8, ge=0.0, le=1.0)
  evidence_summary: str = Field(..., description="Traceable evidence string for score derivation")

class TradeOff(BaseModel):
  candidate_id: str
  positive_objectives: List[AgentObjective] = Field(default_factory=list)
  negative_objectives: List[AgentObjective] = Field(default_factory=list)
  neutral_objectives: List[AgentObjective] = Field(default_factory=list)
  explanation: str = Field(..., description="Human-readable trade-off comparison string")

class CandidatePlan(BaseModel):
  candidate_id: str = Field(..., description="Unique candidate plan ID (e.g. candidate-a)")
  name: str = Field(..., description="Descriptive candidate plan title")
  description: str = Field(..., description="High level operational summary of candidate plan")
  actions: List[ProposalNormalization] = Field(default_factory=list)
  supporting_agents: List[AgentId] = Field(default_factory=list)
  objectives_addressed: List[AgentObjective] = Field(default_factory=list)
  agreements: List[Agreement] = Field(default_factory=list)
  conflicts_involved: List[Conflict] = Field(default_factory=list)
  objective_impact_matrix: List[ObjectiveImpact] = Field(default_factory=list)
  tradeoff: TradeOff
  estimated_total_cost: float = 0.0
  estimated_max_delay_hours: float = 0.0
  estimated_total_emissions_co2_kg: float = 0.0
  status: CandidatePlanStatus = CandidatePlanStatus.VALID
  violations: List[str] = Field(default_factory=list)

class CoordinatorResult(BaseModel):
  coordination_id: str
  snapshot_id: str
  timestamp: str
  status: CoordinatorResultStatus
  input_proposal_count: int
  missing_agent_ids: List[AgentId] = Field(default_factory=list)
  agreements: List[Agreement] = Field(default_factory=list)
  conflicts: List[Conflict] = Field(default_factory=list)
  candidate_plans: List[CandidatePlan] = Field(default_factory=list)
  summary: str = Field(..., description="Executive coordinator reconciliation summary")
  latency_ms: float = 0.0
  provider_used: str = "deterministic"
