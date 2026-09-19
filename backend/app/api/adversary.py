"""
FULFILL-X Adversary REST API Router (Phase 07)
Exposes FastAPI endpoints for adversary engine status, red-team analysis,
candidate plan stress testing, attack suite preview, and vulnerability findings.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.schemas.world import ApiResponse
from app.schemas.coordinator import CandidatePlan
from app.schemas.adversary import (
    AdversaryStatus,
    AdversaryReport,
    AdversaryAttack,
    PlanStressResult,
)
from app.services.adversary import adversary_service

router = APIRouter(prefix="/api/adversary", tags=["Adversary Engine"])


class AdversaryRunRequest(BaseModel):
    candidate_plans: Optional[List[CandidatePlan]] = Field(default=None)
    coordination_id: str = Field(default="")
    seed: int = Field(default=42)


class StressTestRequest(BaseModel):
    candidate_plan: CandidatePlan
    attack: AdversaryAttack


@router.get("/status", response_model=ApiResponse[AdversaryStatus])
async def get_adversary_status() -> ApiResponse[AdversaryStatus]:
    """Returns current status and taxonomy capabilities of the Adversary Engine."""
    status = adversary_service.get_status()
    return ApiResponse(success=True, data=status)


@router.post("/run", response_model=ApiResponse[AdversaryReport])
async def run_adversary(req: AdversaryRunRequest) -> ApiResponse[AdversaryReport]:
    """Runs Adversary Red-Team analysis on candidate plans or triggers end-to-end coordinator flow."""
    try:
        report = await adversary_service.run_adversary_analysis(
            candidate_plans=req.candidate_plans,
            coordination_id=req.coordination_id,
            seed=req.seed,
        )
        return ApiResponse(success=True, data=report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Adversary execution failed: {str(e)}")


@router.post("/stress-test", response_model=ApiResponse[PlanStressResult])
async def stress_test_candidate_plan(req: StressTestRequest) -> ApiResponse[PlanStressResult]:
    """Stress tests a specific candidate plan against a targeted adversary attack."""
    try:
        result = adversary_service.run_stress_test(
            candidate_plan=req.candidate_plan,
            attack=req.attack,
        )
        return ApiResponse(success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Candidate plan stress test failed: {str(e)}")


@router.post("/attack-suite", response_model=ApiResponse[List[AdversaryAttack]])
async def generate_attack_suite(req: AdversaryRunRequest) -> ApiResponse[List[AdversaryAttack]]:
    """Generates and previews deterministic attack suite for current network state."""
    try:
        attacks = adversary_service.generate_attack_suite(
            candidate_plans=req.candidate_plans,
            seed=req.seed,
        )
        return ApiResponse(success=True, data=attacks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Attack suite generation failed: {str(e)}")


@router.get("/findings", response_model=ApiResponse[Optional[AdversaryReport]])
async def get_latest_findings() -> ApiResponse[Optional[AdversaryReport]]:
    """Returns latest generated adversary report findings."""
    report = adversary_service.get_latest_findings()
    return ApiResponse(success=True, data=report)
