"""
FULFILL-X Coordinator Service (Phase 06)
Service layer orchestrating specialist proposal gathering, partial failure handling,
deterministic reconciliation engine execution, and structured CoordinatorResult generation.
"""

import time
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.schemas.agent import AgentProposal, AgentId
from app.schemas.coordinator import (
  CoordinatorResult,
  CoordinatorResultStatus,
  Agreement,
  Conflict,
  CandidatePlan,
)
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.services.agents import AgentService
from app.agents.coordinator import CoordinatorAgent
from app.engine.reconciliation import ReconciliationEngine

SPECIALIST_IDS: List[AgentId] = [
  "inventory",
  "supplier",
  "transportation",
  "fulfillment",
  "sustainability",
  "resilience",
]

class CoordinatorService:
  """Orchestrates specialist agent proposal collection and reconciliation."""

  def __init__(self, agent_service: Optional[AgentService] = None):
    self.coordinator_agent = CoordinatorAgent()
    self.agent_service = agent_service or AgentService()

  async def run_coordination(
    self,
    proposals: Optional[List[AgentProposal]] = None,
    target_node_ids: Optional[List[str]] = None,
  ) -> CoordinatorResult:
    start_time = time.perf_counter()
    missing_agents: List[AgentId] = []
    
    # 1. Fetch or receive specialist proposals
    if proposals is None or len(proposals) == 0:
      all_specs_res = await self.agent_service.run_all_specialists(target_node_ids or [])
      proposals = []
      executed_agents = set()
      
      for agent_id, res in all_specs_res.results.items():
        if res.status == "PROPOSED" and res.proposal:
          proposals.append(res.proposal)
          executed_agents.add(agent_id)
        else:
          missing_agents.append(agent_id) # type: ignore
          
      for spec_id in SPECIALIST_IDS:
        if spec_id not in executed_agents and spec_id not in missing_agents:
          missing_agents.append(spec_id)
    else:
      provided_agents = set(p.agent_id for p in proposals)
      for spec_id in SPECIALIST_IDS:
        if spec_id not in provided_agents:
          missing_agents.append(spec_id)

    # 2. Retrieve authoritative state snapshots for reconciliation
    world_repo = WorldRepository.get_instance()
    world_snap = world_repo.get_snapshot()
    
    # 3. Determine status
    if len(proposals) == 0:
      status = CoordinatorResultStatus.NO_PROPOSALS
      summary = "No specialist proposals available for reconciliation."
      normalized_actions, agreements, conflicts, candidate_plans = [], [], [], []
    else:
      if len(missing_agents) > 0:
        status = CoordinatorResultStatus.PARTIAL_PROPOSALS
      else:
        status = CoordinatorResultStatus.SUCCESS
        
      # Execute deterministic reconciliation
      normalized_actions, agreements, conflicts, candidate_plans = ReconciliationEngine.reconcile(
        world_snap,
        proposals,
      )
      
      summary = (
        f"Reconciled {len(proposals)} specialist proposals into {len(candidate_plans)} Candidate Plan options. "
        f"Identified {len(agreements)} agreements and {len(conflicts)} operational conflicts."
      )

    latency_ms = (time.perf_counter() - start_time) * 1000.0

    return CoordinatorResult(
      coordination_id=f"coord-{uuid.uuid4().hex[:8]}",
      snapshot_id=str(world_snap.snapshot_id),
      timestamp=datetime.now(timezone.utc).isoformat(),
      status=status,
      input_proposal_count=len(proposals),
      missing_agent_ids=missing_agents,
      agreements=agreements,
      conflicts=conflicts,
      candidate_plans=candidate_plans,
      summary=summary,
      latency_ms=round(latency_ms, 2),
      provider_used="deterministic",
    )


# Singleton instance
coordinator_service = CoordinatorService()
