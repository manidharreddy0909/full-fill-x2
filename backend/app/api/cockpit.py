"""
FULFILL-X Decision Cockpit REST API Router (Phase 10)
Exposes endpoints for creating decision sessions, orchestrating workflow stages, recording approval/rejection, and retrieving timelines.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from app.schemas.world import ApiResponse
from app.schemas.cockpit import (
    DecisionStage,
    DecisionSession,
    SessionCreateRequest,
    SessionRunRequest,
    SessionApproveRequest,
    SessionRejectRequest,
    CockpitStatusResponse,
)
from app.services.cockpit import CockpitService

router = APIRouter(prefix="/api/cockpit", tags=["Decision Cockpit"])
cockpit_service = CockpitService.get_instance()


@router.get("/status", response_model=ApiResponse[CockpitStatusResponse])
def get_cockpit_status() -> ApiResponse[CockpitStatusResponse]:
    """Get active status, active sessions count, and state immutability safety telemetry."""
    active_count = len(cockpit_service._sessions)
    res = CockpitStatusResponse(
        status="ACTIVE",
        active_sessions_count=active_count,
        state_mutation_safety=True,
        version="0.2.0",
    )
    return ApiResponse(data=res)


@router.post("/session", response_model=ApiResponse[DecisionSession])
def create_session(req: SessionCreateRequest = SessionCreateRequest()) -> ApiResponse[DecisionSession]:
    """Create a new DecisionSession capturing current world state snapshot, active signals, and risk map."""
    session = cockpit_service.create_session(preset=req.preset, seed=req.seed)
    return ApiResponse(data=session)


@router.get("/session/{session_id}", response_model=ApiResponse[DecisionSession])
def get_session(session_id: str) -> ApiResponse[DecisionSession]:
    """Retrieve an active or historic decision session by session_id."""
    session = cockpit_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision session '{session_id}' not found",
        )
    return ApiResponse(data=session)


@router.post("/session/{session_id}/run", response_model=ApiResponse[DecisionSession])
async def run_full_loop(session_id: str) -> ApiResponse[DecisionSession]:
    """Run full end-to-end decision loop from ANALYZING_RISK through READY_FOR_APPROVAL."""
    session = cockpit_service.get_session(session_id)
    if not session:
        session = cockpit_service.create_session()
        session_id = session.session_id

    updated_session = await cockpit_service.run_full_loop(session_id)
    return ApiResponse(data=updated_session)


@router.post("/session/{session_id}/stage", response_model=ApiResponse[DecisionSession])
async def run_stage(session_id: str, req: SessionRunRequest) -> ApiResponse[DecisionSession]:
    """Run a single decision workflow stage (e.g. RUNNING_SPECIALISTS, COORDINATING, ADVERSARIAL_TESTING, OPTIMIZING, VERIFYING)."""
    session = cockpit_service.get_session(session_id)
    if not session:
        session = cockpit_service.create_session()
        session_id = session.session_id

    target_stage = req.target_stage or DecisionStage.ANALYZING_RISK
    updated_session = await cockpit_service.run_stage(session_id, target_stage)
    return ApiResponse(data=updated_session)


@router.get("/session/{session_id}/status", response_model=ApiResponse[DecisionSession])
def get_session_status(session_id: str) -> ApiResponse[DecisionSession]:
    """Get active session timeline, workflow status, and stage progress."""
    session = cockpit_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision session '{session_id}' not found",
        )
    return ApiResponse(data=session)


@router.post("/session/{session_id}/approve", response_model=ApiResponse[DecisionSession])
def approve_plan(session_id: str, req: SessionApproveRequest) -> ApiResponse[DecisionSession]:
    """Record human approval decision for a candidate plan. Strictly non-destructive on live repositories."""
    session = cockpit_service.record_approval(
        session_id=session_id,
        plan_id=req.plan_id,
        approver=req.approver,
        rationale=req.rationale,
    )
    return ApiResponse(data=session)


@router.post("/session/{session_id}/reject", response_model=ApiResponse[DecisionSession])
def reject_plan(session_id: str, req: SessionRejectRequest) -> ApiResponse[DecisionSession]:
    """Record human rejection decision for a candidate plan."""
    session = cockpit_service.record_rejection(
        session_id=session_id,
        plan_id=req.plan_id,
        approver=req.approver,
        rationale=req.rationale,
    )
    return ApiResponse(data=session)


@router.post("/session/{session_id}/reset", response_model=ApiResponse[DecisionSession])
def reset_session(session_id: str) -> ApiResponse[DecisionSession]:
    """Reset decision session back to baseline OBSERVING stage."""
    session = cockpit_service.reset_session(session_id)
    return ApiResponse(data=session)
