"""
FULFILL-X Coordinator Agent (Phase 06)
Inherits from BaseAgent, implementing the safe execution pipeline and deterministic
proposal reconciliation without mutating authoritative world or risk state.
"""

import time
import uuid
from typing import Tuple, List, Dict, Any, Optional
from app.agents.base import BaseAgent
from app.schemas.world import WorldStateSnapshot
from app.schemas.risk import RiskScoreMap
from app.schemas.agent import (
  AgentId,
  AgentObjective,
  AgentActionType,
  AgentAction,
  AgentProposal,
  AgentResult,
  AgentResultStatus,
  AgentInput,
  AgentMetadata,
)
from app.schemas.coordinator import (
  CoordinatorResult,
  CoordinatorResultStatus,
  Agreement,
  Conflict,
  CandidatePlan,
)
from app.engine.reconciliation import ReconciliationEngine

class CoordinatorAgent(BaseAgent):
  """
  Coordinator Agent responsible for normalizing, comparing, and reconciling
  proposals from all 6 specialist agents into candidate plan options.
  """

  id: AgentId = "coordinator"
  name: str = "Coordinator Agent"
  color: str = "#8B5CF6"
  description: str = "Normalizes specialist proposals, detects agreements/conflicts, and synthesizes candidate plans."
  objective: AgentObjective = AgentObjective.REDUCE_SYSTEMIC_FRAGILITY
  system_prompt: str = (
    "You are the FULFILL-X Coordinator Agent. "
    "Your mission is to reconcile specialist proposals into candidate plan options. "
    "Do NOT select a single winning plan. Surface agreements, conflicts, and trade-offs transparently."
  )
  allowed_action_types: List[AgentActionType] = list(AgentActionType)

  def get_metadata(self) -> AgentMetadata:
    return AgentMetadata(
      id=self.id,
      name=self.name,
      color=self.color,
      objective=self.objective,
      description=self.description,
      allowed_action_types=self.allowed_action_types,
    )

  def build_prompt(self, input: AgentInput) -> str:
    props_count = len(input.other_agent_proposals)
    return f"Coordinator evaluation across {props_count} specialist proposals."

  async def reason(self, input: AgentInput) -> AgentProposal:
    """
    Executes deterministic reconciliation across specialist proposals in AgentInput.
    """
    raw_props = input.other_agent_proposals
    proposals: List[AgentProposal] = []
    
    for p_dict in raw_props:
      if isinstance(p_dict, AgentProposal):
        proposals.append(p_dict)
      elif isinstance(p_dict, dict):
        try:
          proposals.append(AgentProposal.model_validate(p_dict))
        except Exception:
          pass

    # Execute Reconciliation Engine
    normalized_actions, agreements, conflicts, candidates = ReconciliationEngine.reconcile(
      input.world_snapshot,
      proposals,
    )
    
    total_props = len(proposals)
    total_agreements = len(agreements)
    total_conflicts = len(conflicts)
    total_candidates = len(candidates)
    
    summary = (
      f"Reconciled {total_props} specialist proposals into {total_candidates} Candidate Plans. "
      f"Identified {total_agreements} agreements and {total_conflicts} operational conflicts."
    )
    
    first_actions: List[AgentAction] = []
    if candidates and candidates[0].actions:
      norm = candidates[0].actions[0]
      first_actions.append(
        AgentAction(
          action_id=f"ACT-{uuid.uuid4().hex[:6]}",
          action_type=norm.action_type,
          target_node_id=norm.target_node_ids[0] if norm.target_node_ids else None,
          target_edge_id=norm.target_edge_ids[0] if norm.target_edge_ids else None,
          parameters=norm.parameters,
          estimated_cost=norm.estimated_cost,
          estimated_delay_hours=norm.estimated_delay_hours,
          estimated_emissions_co2_kg=norm.estimated_emissions_co2_kg,
        )
      )

    return AgentProposal(
      proposal_id=f"PROP-{uuid.uuid4().hex[:6]}",
      agent_id=self.id,
      agent_name=self.name,
      objective=self.objective,
      summary=summary,
      actions=first_actions,
      affected_node_ids=list(set([nid for prop in proposals for nid in prop.affected_node_ids])),
      affected_edge_ids=list(set([eid for prop in proposals for eid in prop.affected_edge_ids])),
      expected_impacts={"candidates_generated": total_candidates, "conflicts_detected": total_conflicts},
      confidence=0.95,
      evidence_signal_ids=list(set([sig for prop in proposals for sig in prop.evidence_signal_ids])),
      reasoning_trace=[
        f"Step 1: Collected {total_props} specialist proposals across 6 domains.",
        f"Step 2: Normalized actions into {len(normalized_actions)} unified operational targets.",
        f"Step 3: Detected {total_agreements} reinforcing proposal agreements.",
        f"Step 4: Identified {total_conflicts} multi-agent operational conflicts.",
        f"Step 5: Synthesized {total_candidates} Candidate Plan options with explicit trade-off matrices.",
      ],
    )
