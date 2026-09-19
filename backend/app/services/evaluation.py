"""
Evaluation Service for FULFILL-X Phase 12.
Provides evaluation orchestration, benchmark suite execution, report management,
run comparisons, real-time event publishing, and state isolation guarantees.
"""

from typing import Dict, List, Optional, Any
from app.evaluation.runner import EvaluationRunner
from app.evaluation.scenarios import ScenarioRegistry
from app.repository.evaluation import EvaluationRepository
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.schemas.evaluation import (
    EvaluationRun,
    EvaluationReport,
    BenchmarkComparison,
    BenchmarkScenario,
)
from app.schemas.events import EventType, EventSeverity
from app.realtime import event_bus


class EvaluationService:
    """Service layer for evaluation and benchmarking."""

    _instance: Optional["EvaluationService"] = None

    def __init__(self):
        self.runner = EvaluationRunner()
        self.repository = EvaluationRepository.get_instance()
        self.scenario_registry = ScenarioRegistry()
        self.world_repo = WorldRepository.get_instance()
        self.risk_repo = RiskRepository.get_instance()

    @classmethod
    def get_instance(cls) -> "EvaluationService":
        if cls._instance is None:
            cls._instance = EvaluationService()
        return cls._instance

    def get_status(self) -> Dict[str, Any]:
        """Return system evaluation harness status."""
        scenarios = self.scenario_registry.list_scenarios()
        runs = self.repository.list_runs(limit=10)
        reports = self.repository.list_reports(limit=5)
        latest_report = reports[0] if reports else None

        return {
            "status": "HEALTHY",
            "total_scenarios_registered": len(scenarios),
            "total_runs_executed": len(self.repository.list_runs(limit=1000)),
            "latest_report_id": latest_report.report_id if latest_report else None,
            "latest_overall_score": latest_report.summary.overall_score if latest_report else None,
            "recent_runs": [r.model_dump() for r in runs[:5]],
        }

    def list_scenarios(self) -> List[BenchmarkScenario]:
        """List all 8 registered benchmark scenarios."""
        return self.scenario_registry.list_scenarios()

    async def run_scenario(
        self, scenario_id: str, seed: Optional[int] = None
    ) -> EvaluationRun:
        """Execute a single scenario with real-time event broadcasting and state isolation."""
        # 1. Isolation check baseline
        world_node_count_before = len(self.world_repo.graph.nodes)
        risk_signal_count_before = len(self.risk_repo.list_signals())

        # 2. Broadcast EVALUATION_STARTED & SCENARIO_STARTED
        await event_bus.publish(
            event_type=EventType.EVALUATION_STARTED,
            payload={"scenario_id": scenario_id, "seed": seed},
            source="evaluation_service",
        )
        await event_bus.publish(
            event_type=EventType.SCENARIO_STARTED,
            payload={"scenario_id": scenario_id},
            source="evaluation_service",
        )

        # 3. Execute runner on isolated graph snapshot
        run = await self.runner.run_scenario(scenario_id, seed_override=seed)
        self.repository.save_run(run)

        # 4. Broadcast METRIC_CALCULATED & EVALUATION_COMPLETED/FAILED
        for metric_name, m_res in run.metrics.items():
            await event_bus.publish(
                event_type=EventType.METRIC_CALCULATED,
                payload={"metric": metric_name, "value": m_res.value, "status": m_res.status},
                source="evaluation_service",
            )

        if run.status.value == "COMPLETED":
            await event_bus.publish(
                event_type=EventType.EVALUATION_COMPLETED,
                payload={"run_id": run.run_id, "metrics_count": len(run.metrics)},
                source="evaluation_service",
            )
        else:
            await event_bus.publish(
                event_type=EventType.EVALUATION_FAILED,
                payload={"run_id": run.run_id, "error": run.error_message},
                severity=EventSeverity.ERROR,
                source="evaluation_service",
            )

        # 5. Isolation verification guarantee
        world_node_count_after = len(self.world_repo.graph.nodes)
        risk_signal_count_after = len(self.risk_repo.list_signals())

        assert world_node_count_before == world_node_count_after, "Production WorldRepository was mutated!"
        assert risk_signal_count_before == risk_signal_count_after, "Production RiskRepository was mutated!"

        return run

    async def run_all(self, benchmark_id: str = "BENCHMARK-V1") -> EvaluationReport:
        """Execute complete benchmark suite across all scenarios."""
        await event_bus.publish(
            event_type=EventType.EVALUATION_STARTED,
            payload={"benchmark_id": benchmark_id, "mode": "FULL_SUITE"},
            source="evaluation_service",
        )

        report = await self.runner.run_benchmark(benchmark_id)
        self.repository.save_report(report)

        for run in report.runs:
            self.repository.save_run(run)

        await event_bus.publish(
            event_type=EventType.EVALUATION_COMPLETED,
            payload={
                "report_id": report.report_id,
                "overall_score": report.summary.overall_score,
                "scenarios_evaluated": report.scenarios_evaluated,
            },
            source="evaluation_service",
        )

        return report

    def list_runs(self, limit: int = 50) -> List[EvaluationRun]:
        return self.repository.list_runs(limit=limit)

    def get_run(self, run_id: str) -> Optional[EvaluationRun]:
        return self.repository.get_run(run_id)

    def get_latest_report(self) -> Optional[EvaluationReport]:
        reports = self.repository.list_reports(limit=1)
        return reports[0] if reports else None

    def compare_runs(
        self, baseline_run_id: str, target_run_id: str
    ) -> BenchmarkComparison:
        """Compare baseline and target evaluation runs."""
        baseline = self.repository.get_run(baseline_run_id)
        target = self.repository.get_run(target_run_id)

        if not baseline:
            raise ValueError(f"Baseline run_id '{baseline_run_id}' not found.")
        if not target:
            raise ValueError(f"Target run_id '{target_run_id}' not found.")

        return self.runner.compare_runs(baseline, target)
