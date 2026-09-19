"""
FULFILL-X Planner Service (Phase 08)
Service layer orchestrating Multi-Objective Planner Agent optimization, candidate evaluation,
Pareto dominance calculations, robustness integration, sensitivity sweeps, and report caching.
"""

import time
import uuid
from typing import List, Dict, Any, Optional

from app.schemas.world import WorldStateSnapshot
from app.schemas.coordinator import CandidatePlan, CoordinatorResult
from app.schemas.adversary import AdversaryReport
from app.schemas.planner import (
    PlannerReport,
    PlannerStatus,
    ParetoFrontier,
    PlanSensitivityItem,
    Constraint,
)
from app.agents.planner import PlannerAgent
from app.services.coordinator import coordinator_service
from app.services.adversary import adversary_service


class PlannerService:
    """Orchestrates multi-objective Pareto optimization across candidate plans and stress reports."""

    def __init__(self):
        self.planner_agent = PlannerAgent()
        self._latest_report: Optional[PlannerReport] = None

    def get_status(self) -> PlannerStatus:
        return PlannerStatus()

    async def run_planner_analysis(
        self,
        candidate_plans: Optional[List[CandidatePlan]] = None,
        adversary_report: Optional[AdversaryReport] = None,
        coordination_id: str = "",
        constraints: Optional[List[Constraint]] = None,
    ) -> PlannerReport:
        # 1. Fetch candidate plans if not provided
        if candidate_plans is None or len(candidate_plans) == 0:
            coord_res: CoordinatorResult = await coordinator_service.run_coordination()
            candidate_plans = coord_res.candidate_plans
            coordination_id = coord_res.coordination_id

        # 2. Fetch adversary report if not provided
        if adversary_report is None:
            adversary_report = await adversary_service.run_adversary_analysis(
                candidate_plans=candidate_plans,
                coordination_id=coordination_id,
            )

        # 3. Run Planner Agent multi-objective analysis
        report = self.planner_agent.run_planner(
            candidate_plans=candidate_plans,
            adversary_report=adversary_report,
            coordination_id=coordination_id,
            constraints=constraints,
        )

        self._latest_report = report
        return report

    def get_latest_report(self) -> Optional[PlannerReport]:
        return self._latest_report

    def compute_pareto(
        self,
        candidate_plans: List[CandidatePlan],
        adversary_report: Optional[AdversaryReport] = None,
    ) -> ParetoFrontier:
        report = self.planner_agent.run_planner(
            candidate_plans=candidate_plans,
            adversary_report=adversary_report,
        )
        return report.robust_frontier

    def compute_sensitivity(
        self,
        candidate_plans: List[CandidatePlan],
        adversary_report: Optional[AdversaryReport] = None,
    ) -> List[PlanSensitivityItem]:
        report = self.planner_agent.run_planner(
            candidate_plans=candidate_plans,
            adversary_report=adversary_report,
        )
        return report.sensitivity_analysis


# Singleton instance
planner_service = PlannerService()
