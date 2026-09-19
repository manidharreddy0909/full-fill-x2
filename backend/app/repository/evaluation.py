"""
Evaluation Repository for FULFILL-X Phase 12.
In-memory bounded repository for evaluation runs and benchmark reports.
"""

from typing import Dict, List, Optional
from app.schemas.evaluation import EvaluationRun, EvaluationReport


class EvaluationRepository:
    """Bounded in-memory repository for evaluation runs and reports."""

    _instance: Optional["EvaluationRepository"] = None

    def __init__(self, max_runs: int = 200, max_reports: int = 50):
        self._runs: Dict[str, EvaluationRun] = {}
        self._reports: Dict[str, EvaluationReport] = {}
        self._max_runs = max_runs
        self._max_reports = max_reports

    @classmethod
    def get_instance(cls) -> "EvaluationRepository":
        if cls._instance is None:
            cls._instance = EvaluationRepository()
        return cls._instance

    def save_run(self, run: EvaluationRun) -> EvaluationRun:
        if len(self._runs) >= self._max_runs:
            oldest_key = next(iter(self._runs))
            del self._runs[oldest_key]
        self._runs[run.run_id] = run
        return run

    def get_run(self, run_id: str) -> Optional[EvaluationRun]:
        return self._runs.get(run_id)

    def list_runs(self, limit: int = 50) -> List[EvaluationRun]:
        runs_list = list(self._runs.values())
        return sorted(runs_list, key=lambda r: r.started_at, reverse=True)[:limit]

    def save_report(self, report: EvaluationReport) -> EvaluationReport:
        if len(self._reports) >= self._max_reports:
            oldest_key = next(iter(self._reports))
            del self._reports[oldest_key]
        self._reports[report.report_id] = report
        return report

    def get_report(self, report_id: str) -> Optional[EvaluationReport]:
        return self._reports.get(report_id)

    def list_reports(self, limit: int = 20) -> List[EvaluationReport]:
        reports_list = list(self._reports.values())
        return sorted(reports_list, key=lambda r: r.timestamp, reverse=True)[:limit]

    def clear(self):
        """Reset repository contents."""
        self._runs.clear()
        self._reports.clear()
