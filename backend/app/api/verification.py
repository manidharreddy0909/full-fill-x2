"""
FULFILL-X Verification REST API Endpoints (Phase 09)
Exposes plan verification, sandbox simulation, and report retrieval endpoints.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.verification import (
    ExecutionPlan,
    VerificationReport,
    VerificationRequest,
    VerificationStatusResponse,
)
from app.services.verification import VerificationService

router = APIRouter(prefix="/api/verification", tags=["Verification Engine"])
verification_service = VerificationService.get_instance()


@router.get("/status", response_model=VerificationStatusResponse)
async def get_verification_status():
    """Get Verification Engine status, engine version, and supported rules count."""
    return verification_service.get_status()


@router.post("/run", response_model=VerificationReport)
async def run_plan_verification(request: VerificationRequest):
    """Run full deterministic verification and sandbox simulation on a CandidatePlan."""
    try:
        report = verification_service.verify_plan(
            candidate_plan=request.candidate_plan,
            coordination_id=request.coordination_id,
        )
        return report
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(ex)}",
        )


@router.post("/simulate", response_model=VerificationReport)
async def simulate_execution_plan(plan: ExecutionPlan):
    """Run custom sandbox execution simulation for a specific ExecutionPlan."""
    try:
        report = verification_service.simulate_custom_execution(plan)
        return report
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sandbox simulation failed: {str(ex)}",
        )


@router.get("/report", response_model=VerificationReport)
async def get_latest_verification_report(candidate_id: Optional[str] = Query(None)):
    """Retrieve the latest generated verification report."""
    report = verification_service.get_latest_report(candidate_id=candidate_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No verification report available yet. Run /api/verification/run first.",
        )
    return report
