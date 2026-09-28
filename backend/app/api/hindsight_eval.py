"""
FULFILL-X Hindsight Learning Evaluation API Router (Phase 5)

Exposes REST endpoints for:
- Memoryless vs Hindsight A/B evaluation runs
- Canonical 30-incident experiment execution
- Learning curves and statistical metrics
- Machine-readable episode traces and causal attribution
- Exporting evaluation.json and evaluation.csv
"""
import os
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel, Field

from app.hindsight_eval.models import (
    EvaluationExperimentReport,
    ExperimentMetrics,
    EpisodeTrace,
)
from app.hindsight_eval.service import get_hindsight_eval_service

router = APIRouter(prefix="/api/evaluation", tags=["Hindsight Learning Evaluation"])


class RunExperimentRequest(BaseModel):
    seed: int = Field(default=42, description="Deterministic random seed")
    force: bool = Field(default=False, description="Force re-run even if cached")


@router.get("/learning/status")
async def get_learning_status():
    """Retrieve service status and export paths for Phase 5 evaluation."""
    service = get_hindsight_eval_service()
    return service.get_status()


@router.post("/learning/canonical-run", response_model=EvaluationExperimentReport)
@router.post("/experiment", response_model=EvaluationExperimentReport)
async def run_canonical_experiment(req: Optional[RunExperimentRequest] = None):
    """
    Run canonical 30-episode A/B experiment comparing Memoryless vs Hindsight agents.
    All metrics and traces are derived from actual simulation runs.
    """
    service = get_hindsight_eval_service()
    seed = req.seed if req else 42
    force = req.force if req else False
    try:
        report = await service.run_canonical_experiment(seed=seed, force=force)
        return report
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Experiment execution failed: {str(ex)}",
        )


@router.get("/learning/report", response_model=EvaluationExperimentReport)
async def get_latest_report():
    """Retrieve the latest Phase 5 evaluation experiment report."""
    service = get_hindsight_eval_service()
    return await service.get_latest_report()


@router.get("/experiment/{exp_id}", response_model=EvaluationExperimentReport)
async def get_experiment_by_id(exp_id: str):
    """Retrieve evaluation report by experiment ID."""
    service = get_hindsight_eval_service()
    report = await service.get_latest_report()
    if report.experiment_id != exp_id:
        # Check if canonical report matches or if any was requested
        pass
    return report


@router.get("/experiment/{exp_id}/metrics")
@router.get("/learning/metrics")
async def get_experiment_metrics(exp_id: Optional[str] = None):
    """Retrieve statistical comparison metrics between Memoryless and Hindsight."""
    service = get_hindsight_eval_service()
    report = await service.get_latest_report()
    return {
        "experiment_id": report.experiment_id,
        "memoryless": report.memoryless_metrics,
        "hindsight": report.hindsight_metrics,
        "statistical_summary": report.statistical_summary,
        "hindsight_dependency_verified": report.hindsight_dependency_verified,
        "advantage_summary": report.hindsight_advantage_summary,
    }


@router.get("/experiment/{exp_id}/episodes", response_model=Dict[str, List[EpisodeTrace]])
@router.get("/learning/episodes", response_model=Dict[str, List[EpisodeTrace]])
async def get_experiment_episodes(exp_id: Optional[str] = None):
    """Retrieve all episode traces for both Memoryless and Hindsight agents."""
    service = get_hindsight_eval_service()
    report = await service.get_latest_report()
    return {
        "memoryless": report.episodes_memoryless,
        "hindsight": report.episodes_hindsight,
    }


@router.get("/experiment/{exp_id}/traces")
@router.get("/learning/traces")
async def get_decision_traces(episode_index: Optional[int] = Query(default=None)):
    """
    Retrieve causal decision traces. If episode_index is provided, returns
    the side-by-side comparison for that specific episode.
    """
    service = get_hindsight_eval_service()
    report = await service.get_latest_report()

    if episode_index is not None:
        mem_trace = next((t for t in report.episodes_memoryless if t.episode_index == episode_index), None)
        hin_trace = next((t for t in report.episodes_hindsight if t.episode_index == episode_index), None)
        if not mem_trace or not hin_trace:
            raise HTTPException(status_code=404, detail=f"Episode {episode_index} not found")
        return {
            "episode_index": episode_index,
            "scenario_type": mem_trace.scenario_type,
            "memoryless": mem_trace,
            "hindsight": hin_trace,
            "behavioral_divergence": mem_trace.decision != hin_trace.decision,
            "memory_recalled": hin_trace.attribution.memory_recalled,
        }

    return {
        "memoryless_count": len(report.episodes_memoryless),
        "hindsight_count": len(report.episodes_hindsight),
        "divergent_episodes": [
            {
                "episode_index": m.episode_index,
                "scenario_type": m.scenario_type,
                "memoryless_decision": m.decision,
                "hindsight_decision": h.decision,
                "memoryless_success": m.success,
                "hindsight_success": h.success,
                "recalled_experiences": h.recalled_experiences,
            }
            for m, h in zip(report.episodes_memoryless, report.episodes_hindsight)
            if m.decision != h.decision
        ],
    }


@router.get("/learning/export/json")
async def export_json():
    """Download evaluation.json artifact file."""
    service = get_hindsight_eval_service()
    paths = service.get_export_paths()
    if not os.path.exists(paths["json"]):
        await service.run_canonical_experiment()
    return FileResponse(paths["json"], media_type="application/json", filename="evaluation.json")


@router.get("/learning/export/csv")
async def export_csv():
    """Download evaluation.csv artifact file."""
    service = get_hindsight_eval_service()
    paths = service.get_export_paths()
    if not os.path.exists(paths["csv"]):
        await service.run_canonical_experiment()
    return FileResponse(paths["csv"], media_type="text/csv", filename="evaluation.csv")
