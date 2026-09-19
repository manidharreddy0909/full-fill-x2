"""
FULFILL-X Demo API Endpoints (Phase 16)
Exposes control interfaces for Competition Demo Mode state machine.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query

from app.schemas.world import ApiResponse
from app.schemas.demo import (
    DemoScenario,
    DemoSession,
    DemoStartRequest,
    DemoStepRequest,
    DemoApprovalRequest,
    DemoStatusResponse,
    DemoReport,
)
from app.demo.scenarios import DemoScenarioRegistry
from app.demo.service import DemoService

router = APIRouter(prefix="/api/demo", tags=["Demo Mode"])


@router.get("/status", response_model=ApiResponse[DemoStatusResponse])
def get_demo_status() -> ApiResponse[DemoStatusResponse]:
    """Get current Demo Engine status, active session, and available scenarios."""
    service = DemoService.get_instance()
    status_info = service.get_status()
    resp = DemoStatusResponse(
        active_session=status_info["active_session"],
        available_scenarios=status_info["available_scenarios"],
        system_healthy=status_info["system_healthy"],
        ai_provider=status_info["ai_provider"],
    )
    return ApiResponse(data=resp)


@router.get("/scenarios", response_model=ApiResponse[List[DemoScenario]])
def list_demo_scenarios() -> ApiResponse[List[DemoScenario]]:
    """List all registered competition demo scenarios."""
    scenarios = DemoScenarioRegistry.list_scenarios()
    return ApiResponse(data=scenarios)


@router.post("/start", response_model=ApiResponse[DemoSession])
async def start_demo(request: DemoStartRequest) -> ApiResponse[DemoSession]:
    """Start a new competition demo session."""
    service = DemoService.get_instance()
    try:
        session = await service.start_demo(
            scenario_id=request.scenario_id,
            mode=request.mode,
            seed=request.seed,
        )
        return ApiResponse(data=session)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start demo session: {str(e)}",
        )


@router.post("/step", response_model=ApiResponse[DemoSession])
async def step_demo(request: DemoStepRequest) -> ApiResponse[DemoSession]:
    """Advance active demo session by one step or to target index."""
    service = DemoService.get_instance()
    try:
        session = await service.step_demo(
            session_id=request.session_id,
            target_step_index=request.target_step_index,
        )
        return ApiResponse(data=session)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to step demo: {str(e)}",
        )


@router.post("/pause", response_model=ApiResponse[DemoSession])
async def pause_demo(session_id: str = Query(...)) -> ApiResponse[DemoSession]:
    """Pause active demo session execution."""
    service = DemoService.get_instance()
    session = await service.pause_demo(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo session not found")
    return ApiResponse(data=session)


@router.post("/resume", response_model=ApiResponse[DemoSession])
async def resume_demo(session_id: str = Query(...)) -> ApiResponse[DemoSession]:
    """Resume paused demo session execution."""
    service = DemoService.get_instance()
    session = await service.resume_demo(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo session not found")
    return ApiResponse(data=session)


@router.post("/reset", response_model=ApiResponse[dict])
def reset_demo() -> ApiResponse[dict]:
    """Reset Demo Engine state and world repository to clean baseline."""
    service = DemoService.get_instance()
    service.reset_demo()
    return ApiResponse(data={"message": "Demo engine reset to clean baseline state"})


@router.post("/approve", response_model=ApiResponse[DemoSession])
async def approve_demo_plan(request: DemoApprovalRequest) -> ApiResponse[DemoSession]:
    """Execute human decision approval gate in demo mode."""
    service = DemoService.get_instance()
    try:
        session = await service.approve_plan(
            session_id=request.session_id,
            approver_name=request.approver_name,
            decision_rationale=request.decision_rationale,
            selected_plan_id=request.selected_plan_id,
        )
        return ApiResponse(data=session)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve plan: {str(e)}",
        )


@router.post("/reject", response_model=ApiResponse[DemoSession])
async def reject_demo_plan(
    session_id: str = Query(...),
    approver_name: str = Query("Chief Supply Chain Officer"),
    decision_rationale: str = Query("Rejected due to unacceptable risk delta"),
) -> ApiResponse[DemoSession]:
    """Execute human decision rejection gate in demo mode."""
    service = DemoService.get_instance()
    try:
        session = await service.reject_plan(
            session_id=session_id,
            approver_name=approver_name,
            decision_rationale=decision_rationale,
        )
        return ApiResponse(data=session)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject plan: {str(e)}",
        )


@router.get("/session/{session_id}", response_model=ApiResponse[DemoSession])
def get_demo_session(session_id: str) -> ApiResponse[DemoSession]:
    """Fetch demo session details."""
    service = DemoService.get_instance()
    status_info = service.get_status()
    sess = status_info["active_session"]
    if not sess or sess.session_id != session_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo session not found")
    return ApiResponse(data=sess)


@router.get("/report/{session_id}", response_model=ApiResponse[DemoReport])
def get_demo_report(session_id: str) -> ApiResponse[DemoReport]:
    """Fetch or generate competition demo report for session."""
    service = DemoService.get_instance()
    try:
        report = service.get_report(session_id)
        return ApiResponse(data=report)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}",
        )
