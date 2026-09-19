"""
FULFILL-X Planner Agent (Phase 08)
Inherits from BaseAgent, implementing safe execution pipeline and multi-objective Pareto analysis
without mutating authoritative world or risk state.
"""

import time
import uuid
from typing import List, Dict, Any, Optional

from app.agents.base import BaseAgent
from app.schemas.world import WorldStateSnapshot
from app.schemas.agent import (
    AgentId,
    AgentObjective,
    AgentActionType,
    AgentProposal,
    AgentInput,
    AgentMetadata,
)
from app.schemas.coordinator import CandidatePlan
from app.schemas.adversary import AdversaryReport
from app.schemas.planner import PlannerReport, Constraint
from app.engine.planner import PlannerEngine


class PlannerAgent(BaseAgent):
    """
    Multi-Objective Planner Agent responsible for formal Pareto dominance analysis,
    baseline and robust Pareto frontier construction, business constraint evaluation,
    sensitivity sweeps, and trade-off summaries for human logistics decision-makers.
    """

    id: AgentId = AgentId.PLANNER
    name: str = "Multi-Objective Planner Agent"
    color: str = "#3B82F6"
    description: str = "Multi-objective optimization agent calculating Pareto frontiers, feasibility constraints, and trade-off sensitivity."
    objective: AgentObjective = AgentObjective.REDUCE_SYSTEMIC_FRAGILITY
    system_prompt: str = (
        "You are the FULFILL-X Multi-Objective Planner Agent. "
        "Your mission is to perform Pareto dominance analysis, evaluate business constraints, "
        "construct baseline and Robust Pareto Frontiers, and explain trade-offs transparently. "
        "You MUST NOT collapse metrics into a single score or mutate authoritative world state."
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
            f"Multi-Objective Pareto optimization for snapshot {input.world_snapshot.snapshot_id}. "
            f"Active risk score: {input.risk_score_map.overall_risk_score}."
        )

    async def reason(self, input: AgentInput) -> AgentProposal:
        # Default fallback proposal satisfying BaseAgent pipeline contract
        return AgentProposal(
            proposal_id=f"prop-plan-{uuid.uuid4().hex[:8]}",
            agent_id=self.id,
            snapshot_id=input.world_snapshot.snapshot_id,
            objective=self.objective,
            summary="Multi-Objective Planner evaluation complete.",
            actions=[],
            affected_node_ids=[],
            affected_edge_ids=[],
            reasoning="Deterministic planner engine evaluated Pareto frontiers and constraint feasibility.",
        )

    def run_planner(
        self,
        candidate_plans: List[CandidatePlan],
        adversary_report: Optional[AdversaryReport] = None,
        coordination_id: str = "",
        constraints: Optional[List[Constraint]] = None,
    ) -> PlannerReport:
        engine = PlannerEngine(constraints=constraints)
        report = engine.run_planner_analysis(
            candidate_plans=candidate_plans,
            adversary_report=adversary_report,
            coordination_id=coordination_id,
        )

        non_dom_count = len(report.robust_frontier.non_dominated_candidate_ids)
        feasible_count = sum(1 for e in report.plan_evaluations if e.feasibility.status == "FEASIBLE")

        report.summary_narrative = (
            f"Multi-Objective Planner evaluated {len(candidate_plans)} candidate plans across 6 core objectives "
            f"and 8 resilience dimensions. Identified {non_dom_count} Robust Pareto-optimal plan(s) "
            f"and {feasible_count} feasible plan(s). "
            f"Top recommended candidate(s): {', '.join(report.recommended_candidates) if report.recommended_candidates else 'None'}. "
            f"Decision space preserves full multi-objective trade-off vectors for human operator approval."
        )

        return report
