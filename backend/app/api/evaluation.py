"""
FULFILL-X Evaluation REST API Router (Phase 12).
Exposes endpoints for benchmark scenarios, scenario execution, suite runs, reports, and comparisons.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.schemas.evaluation import (
    EvaluationRun,
    EvaluationReport,
    BenchmarkScenario,
    BenchmarkComparison,
)
from app.services.evaluation import EvaluationService

router = APIRouter(prefix="/api/evaluation", tags=["Evaluation Harness"])
evaluation_service = EvaluationService()


class RunScenarioRequest(BaseModel):
    scenario_id: str = Field(..., json_schema_extra={"example": "SCENARIO-01"})
    seed: Optional[int] = Field(default=None, json_schema_extra={"example": 42})


class RunAllRequest(BaseModel):
    benchmark_id: str = Field(default="BENCHMARK-V1")


class CompareRunsRequest(BaseModel):
    baseline_run_id: str
    target_run_id: str


@router.get("/status")
async def get_evaluation_status():
    """Get overall evaluation harness status and recent metrics."""
    return evaluation_service.get_status()


@router.get("/scenarios", response_model=List[BenchmarkScenario])
async def list_benchmark_scenarios():
    """List all registered deterministic benchmark scenarios."""
    return evaluation_service.list_scenarios()


@router.post("/run", response_model=EvaluationRun)
async def run_benchmark_scenario(req: RunScenarioRequest):
    """Run a single benchmark scenario on isolated graph state."""
    try:
        run = await evaluation_service.run_scenario(scenario_id=req.scenario_id, seed=req.seed)
        return run
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Benchmark scenario run failed: {str(ex)}",
        )


@router.post("/run-all", response_model=EvaluationReport)
async def run_all_benchmark_scenarios(req: RunAllRequest):
    """Run complete benchmark suite across all registered scenarios."""
    try:
        report = await evaluation_service.run_all(benchmark_id=req.benchmark_id)
        return report
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Benchmark suite execution failed: {str(ex)}",
        )


@router.get("/runs", response_model=List[EvaluationRun])
async def list_evaluation_runs(limit: int = Query(default=50, ge=1, le=200)):
    """Retrieve history of executed evaluation runs."""
    return evaluation_service.list_runs(limit=limit)


@router.get("/runs/{run_id}", response_model=EvaluationRun)
async def get_evaluation_run(run_id: str):
    """Retrieve details for a specific evaluation run."""
    run = evaluation_service.get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation run '{run_id}' not found.",
        )
    return run


@router.get("/report", response_model=EvaluationReport)
async def get_latest_evaluation_report():
    """Retrieve the latest benchmark evaluation report. If none exists, run suite automatically."""
    report = evaluation_service.get_latest_report()
    if not report:
        report = await evaluation_service.run_all()
    return report


@router.post("/compare", response_model=BenchmarkComparison)
async def compare_evaluation_runs(req: CompareRunsRequest):
    """Compare baseline evaluation run against target evaluation run."""
    try:
        comparison = evaluation_service.compare_runs(
            baseline_run_id=req.baseline_run_id, target_run_id=req.target_run_id
        )
        return comparison
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comparison failed: {str(ex)}",
        )
