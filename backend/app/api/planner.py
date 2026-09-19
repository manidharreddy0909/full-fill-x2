"""
FULFILL-X Planner REST API Router (Phase 08)
Exposes FastAPI endpoints for multi-objective optimization status, Pareto analysis,
constraint verification, sensitivity sweeps, and planner reports.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.schemas.world import ApiResponse
from app.schemas.coordinator import CandidatePlan
from app.schemas.adversary import AdversaryReport
from app.schemas.planner import (
    PlannerStatus,
    PlannerReport,
    ParetoFrontier,
    PlanSensitivityItem,
    Constraint,
)
from app.services.planner import planner_service

router = APIRouter(prefix="/api/planner", tags=["Multi-Objective Planner Engine"])


class PlannerRunRequest(BaseModel):
    candidate_plans: Optional[List[CandidatePlan]] = Field(default=None)
    adversary_report: Optional[AdversaryReport] = Field(default=None)
    coordination_id: str = Field(default="")
    constraints: Optional[List[Constraint]] = Field(default=None)


@router.get("/status", response_model=ApiResponse[PlannerStatus])
async def get_planner_status() -> ApiResponse[PlannerStatus]:
    """Returns current status and capabilities of the Multi-Objective Planner Engine."""
    status = planner_service.get_status()
    return ApiResponse(data=status)


@router.post("/run", response_model=ApiResponse[PlannerReport])
async def run_planner(req: PlannerRunRequest) -> ApiResponse[PlannerReport]:
    """Runs Multi-Objective Pareto optimization across candidate plans and stress reports."""
    try:
        report = await planner_service.run_planner_analysis(
            candidate_plans=req.candidate_plans,
            adversary_report=req.adversary_report,
            coordination_id=req.coordination_id,
            constraints=req.constraints,
        )
        return ApiResponse(data=report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planner execution failed: {str(e)}")


@router.post("/pareto", response_model=ApiResponse[ParetoFrontier])
async def compute_pareto_frontier(req: PlannerRunRequest) -> ApiResponse[ParetoFrontier]:
    """Computes baseline and robust Pareto frontiers for candidate plans."""
    try:
        if not req.candidate_plans:
            raise HTTPException(status_code=400, detail="Candidate plans are required to compute Pareto frontier.")
        frontier = planner_service.compute_pareto(
            candidate_plans=req.candidate_plans,
            adversary_report=req.adversary_report,
        )
        return ApiResponse(data=frontier)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pareto frontier calculation failed: {str(e)}")


@router.post("/sensitivity", response_model=ApiResponse[List[PlanSensitivityItem]])
async def compute_sensitivity(req: PlannerRunRequest) -> ApiResponse[List[PlanSensitivityItem]]:
    """Performs sensitivity analysis sweeps across weight perturbations."""
    try:
        if not req.candidate_plans:
            raise HTTPException(status_code=400, detail="Candidate plans are required for sensitivity analysis.")
        items = planner_service.compute_sensitivity(
            candidate_plans=req.candidate_plans,
            adversary_report=req.adversary_report,
        )
        return ApiResponse(data=items)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensitivity analysis failed: {str(e)}")


@router.get("/report", response_model=ApiResponse[Optional[PlannerReport]])
async def get_latest_report() -> ApiResponse[Optional[PlannerReport]]:
    """Retrieves latest generated Multi-Objective Planner report."""
    report = planner_service.get_latest_report()
    return ApiResponse(data=report)
