"""
FULFILL-X Adversary Service (Phase 07)
Service layer orchestrating Adversary Agent red-teaming, candidate plan stress testing,
isolated snapshot simulation, multi-dimensional resilience scoring, vulnerability detection,
and report generation.
"""

import time
import uuid
from typing import List, Dict, Any, Optional

from app.schemas.world import WorldStateSnapshot
from app.schemas.coordinator import CandidatePlan, CoordinatorResult
from app.schemas.adversary import (
    AdversaryReport,
    AdversaryAttack,
    PlanStressResult,
    AdversaryStatus,
)
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.agents.adversary import AdversaryAgent
from app.services.coordinator import coordinator_service


class AdversaryService:
    """Orchestrates adversarial red-team stress testing across candidate plans."""

    def __init__(self):
        self.adversary_agent = AdversaryAgent()
        self._latest_report: Optional[AdversaryReport] = None

    def get_status(self) -> AdversaryStatus:
        return AdversaryStatus()

    async def run_adversary_analysis(
        self,
        candidate_plans: Optional[List[CandidatePlan]] = None,
        coordination_id: str = "",
        seed: int = 42,
    ) -> AdversaryReport:
        world_repo = WorldRepository.get_instance()
        risk_repo = RiskRepository.get_instance()

        snapshot = world_repo.get_snapshot()
        risk_map = risk_repo.get_risk_map().node_risks

        # If no candidate plans provided, run coordinator to generate them
        if candidate_plans is None or len(candidate_plans) == 0:
            coord_res: CoordinatorResult = await coordinator_service.run_coordination()
            candidate_plans = coord_res.candidate_plans
            coordination_id = coord_res.coordination_id

        # Run Adversary Agent deterministic analysis
        report = self.adversary_agent.run_adversary(
            snapshot=snapshot,
            candidate_plans=candidate_plans,
            risk_map=risk_map,
            coordination_id=coordination_id,
            seed=seed,
        )

        self._latest_report = report
        return report

    def get_latest_findings(self) -> Optional[AdversaryReport]:
        return self._latest_report

    def generate_attack_suite(
        self,
        candidate_plans: Optional[List[CandidatePlan]] = None,
        seed: int = 42,
    ) -> List[AdversaryAttack]:
        world_repo = WorldRepository.get_instance()
        risk_repo = RiskRepository.get_instance()

        snapshot = world_repo.get_snapshot()
        risk_map = risk_repo.get_risk_map().node_risks

        from app.engine.adversary import AttackGenerator
        generator = AttackGenerator(seed=seed)
        return generator.generate_attack_suite(snapshot, risk_map, candidate_plans or [])

    def run_stress_test(
        self,
        candidate_plan: CandidatePlan,
        attack: AdversaryAttack,
    ) -> PlanStressResult:
        world_repo = WorldRepository.get_instance()
        snapshot = world_repo.get_snapshot()

        from app.engine.adversary import StressSimulator, ResilienceScorer, AttackGenerator

        metrics_summary, degradation_metrics = StressSimulator.simulate(
            snapshot=snapshot,
            candidate_plan=candidate_plan,
            attack=attack,
        )

        overall_resilience, dimensions = ResilienceScorer.calculate_scores(
            metrics_summary=metrics_summary,
            attack=attack,
            candidate_plan=candidate_plan,
        )

        generator = AttackGenerator()
        assumptions = generator._extract_plan_assumptions(candidate_plan, snapshot)
        invalidated = [a for a in assumptions if a.is_invalidated]

        return PlanStressResult(
            candidate_id=candidate_plan.candidate_id,
            candidate_name=candidate_plan.name,
            overall_resilience_score=overall_resilience,
            resilience_dimensions=dimensions,
            degradation_metrics=degradation_metrics,
            vulnerabilities=[],
            invalidated_assumptions=invalidated,
            recovery_time_days=round(3.0 + (attack.duration_days * 0.4), 1),
            unmet_demand_units=metrics_summary["unmet_demand"],
        )


# Singleton instance
adversary_service = AdversaryService()
