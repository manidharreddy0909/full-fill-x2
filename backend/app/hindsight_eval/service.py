"""
FULFILL-X Hindsight Learning Evaluation Service (Phase 5)

Manages and orchestrates evaluation experiments, caching canonical reports,
and serving statistical learning metrics for the UI and verification suites.
"""
import logging
import os
from typing import Optional, Dict, Any

from app.hindsight_eval.models import EvaluationExperimentReport
from app.hindsight_eval.runner import EvaluationExperimentRunner

logger = logging.getLogger("fulfill-x.hindsight_eval.service")


class HindsightEvaluationService:
    """
    Singleton service managing Hindsight learning evaluation runs and metrics.
    """
    _instance: Optional["HindsightEvaluationService"] = None

    def __init__(self, export_dir: Optional[str] = None):
        self.runner = EvaluationExperimentRunner(export_dir=export_dir)
        self._latest_report: Optional[EvaluationExperimentReport] = None
        self._is_running: bool = False

    @classmethod
    def get_instance(cls) -> "HindsightEvaluationService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def is_running(self) -> bool:
        return self._is_running

    async def run_canonical_experiment(
        self,
        seed: int = 42,
        force: bool = False,
    ) -> EvaluationExperimentReport:
        """
        Execute the canonical 30-episode A/B experiment between Memoryless and Hindsight agents.
        """
        if self._latest_report is not None and not force:
            logger.info("RETURNING_CACHED_CANONICAL_REPORT")
            return self._latest_report

        self._is_running = True
        try:
            logger.info(f"STARTING_CANONICAL_EXPERIMENT: seed={seed}")
            report = await self.runner.run_experiment(seed=seed)
            self._latest_report = report
            return report
        finally:
            self._is_running = False

    async def get_latest_report(self) -> EvaluationExperimentReport:
        """
        Get the latest evaluation report, running canonical benchmark if none exists.
        """
        if self._latest_report is None:
            return await self.run_canonical_experiment(seed=42, force=False)
        return self._latest_report

    def get_export_paths(self) -> Dict[str, str]:
        """Return paths to generated evaluation.json and evaluation.csv."""
        return {
            "json": os.path.join(self.runner.export_dir, "evaluation.json"),
            "csv": os.path.join(self.runner.export_dir, "evaluation.csv"),
        }

    def get_status(self) -> Dict[str, Any]:
        """Status summary of evaluation service."""
        return {
            "status": "IDLE" if not self._is_running else "RUNNING",
            "has_report": self._latest_report is not None,
            "experiment_id": self._latest_report.experiment_id if self._latest_report else None,
            "scenario_count": self._latest_report.scenario_count if self._latest_report else 0,
            "export_paths": self.get_export_paths(),
        }


def get_hindsight_eval_service() -> HindsightEvaluationService:
    return HindsightEvaluationService.get_instance()


hindsight_eval_service = HindsightEvaluationService.get_instance()
