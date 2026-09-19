"""
FULFILL-X Adversary Agent (Phase 07)
Inherits from BaseAgent, implementing safe execution pipeline and deterministic stress testing
without mutating authoritative world or risk state.
"""

import time
import uuid
from typing import List, Dict, Any, Optional, Tuple

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
from app.schemas.coordinator import CandidatePlan
from app.schemas.adversary import AdversaryReport
from app.engine.adversary import AdversaryEngine


class AdversaryAgent(BaseAgent):
    """
    Adversary Agent responsible for red-teaming Candidate Plans, attacking assumptions,
    generating deterministic disruption scenarios, measuring resilience degradation on isolated snapshots,
    and outputting structured vulnerability reports.
    """

    id: AgentId = AgentId.ADVERSARY
    name: str = "Adversary Agent"
    color: str = "#EF4444"
    description: str = "Red-team adversary that attacks candidate plan assumptions, stress-tests network resilience, and identifies vulnerabilities."
    objective: AgentObjective = AgentObjective.REDUCE_SYSTEMIC_FRAGILITY
    system_prompt: str = (
        "You are the FULFILL-X Adversary Agent. "
        "Your mission is to challenge Candidate Plans with adversarial disruptions, attack implicit assumptions, "
        "measure network resilience degradation, and uncover hidden structural vulnerabilities. "
        "You MUST NOT mutate authoritative state or decide the final plan."
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
        return (
            f"Adversary red-team analysis for snapshot {input.world_snapshot.snapshot_id}. "
            f"Active risk level: {input.risk_score_map.overall_risk_score}."
        )

    async def reason(self, input: AgentInput) -> AgentProposal:
        # Default fallback proposal satisfying BaseAgent pipeline contract
        return AgentProposal(
            proposal_id=f"prop-adv-{uuid.uuid4().hex[:8]}",
            agent_id=self.id,
            snapshot_id=input.world_snapshot.snapshot_id,
            objective=self.objective,
            summary="Adversary red-team stress evaluation complete.",
            actions=[],
            affected_node_ids=[],
            affected_edge_ids=[],
            reasoning="Deterministic stress engine evaluated network vulnerabilities.",
        )

    def run_adversary(
        self,
        snapshot: WorldStateSnapshot,
        candidate_plans: List[CandidatePlan],
        risk_map: Optional[Dict[str, float]] = None,
        coordination_id: str = "",
        seed: int = 42,
    ) -> AdversaryReport:
        engine = AdversaryEngine(seed=seed)
        report = engine.run_adversary_analysis(
            snapshot=snapshot,
            candidate_plans=candidate_plans,
            risk_map=risk_map,
            coordination_id=coordination_id,
        )

        # Generate grounding narrative overview
        report.summary_narrative = (
            f"Adversary Red-Team analyzed {len(candidate_plans)} candidate plans against {report.scenarios_tested} disruption scenarios. "
            f"Identified {len(report.overall_vulnerabilities)} network-wide vulnerabilities and generated "
            f"{len(report.defensive_recommendations)} defensive countermeasures. "
            f"Top fragility vector: {report.overall_vulnerabilities[0].title if report.overall_vulnerabilities else 'None'}."
        )

        return report
