"""
FULFILL-X Master Resilience OS REST API Router (Phase 10)
Exposes endpoints under /api/resilience-os/* for full cycle execution, scorecard retrieval,
degradation mode control, and chaos fault injection.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_security_context
from app.schemas.auth import Permission, SecurityContext
from app.models.enterprise import ExecutionMode
from app.services.resilience_os import ResilienceOSService, ResilienceScorecard, ResilienceCycleStatus
from app.core.degradation import SystemDegradationManager, SystemOperationalMode, FaultInjectionRequest, SystemHealthStatus

router = APIRouter(prefix="/api/resilience-os", tags=["Resilience OS Control Plane"])


class ExecuteCycleRequest(BaseModel):
    target_node_ids: List[str] = Field(default_factory=lambda: ["sup-001", "port-001"])
    authorized_by: str = Field(default="Head of Resilience Operations")
    execution_mode: ExecutionMode = ExecutionMode.DRY_RUN


class SetOperationalModeRequest(BaseModel):
    mode: SystemOperationalMode


@router.post("/cycle/execute", response_model=ResilienceCycleStatus)
async def execute_resilience_cycle(
    body: ExecuteCycleRequest,
    context: SecurityContext = Depends(get_security_context),
) -> ResilienceCycleStatus:
    if not context.has_permission(Permission.RESILIENCE_OS_RUN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission RESILIENCE_OS_RUN required")
    svc = ResilienceOSService.get_instance()
    return await svc.execute_resilience_cycle(
        organization_id=context.organization_id,
        workspace_id=context.workspace_id,
        target_node_ids=body.target_node_ids,
        authorized_by=body.authorized_by,
        execution_mode=body.execution_mode,
    )


@router.get("/scorecard", response_model=ResilienceScorecard)
def get_resilience_scorecard(
    context: SecurityContext = Depends(get_security_context),
) -> ResilienceScorecard:
    if not context.has_permission(Permission.RESILIENCE_OS_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission RESILIENCE_OS_READ required")
    svc = ResilienceOSService.get_instance()
    return svc.calculate_scorecard()


@router.get("/degradation/status", response_model=SystemHealthStatus)
def get_system_degradation_status(
    context: SecurityContext = Depends(get_security_context),
) -> SystemHealthStatus:
    mgr = SystemDegradationManager.get_instance()
    return mgr.get_status()


@router.post("/degradation/mode", response_model=SystemHealthStatus)
def set_system_operational_mode(
    body: SetOperationalModeRequest,
    context: SecurityContext = Depends(get_security_context),
) -> SystemHealthStatus:
    if not context.has_permission(Permission.GOVERNANCE_MANAGE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission GOVERNANCE_MANAGE required")
    mgr = SystemDegradationManager.get_instance()
    return mgr.set_mode(body.mode)


@router.post("/degradation/fault", response_model=SystemHealthStatus)
def inject_chaos_fault(
    body: FaultInjectionRequest,
    context: SecurityContext = Depends(get_security_context),
) -> SystemHealthStatus:
    if not context.has_permission(Permission.GOVERNANCE_MANAGE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission GOVERNANCE_MANAGE required")
    mgr = SystemDegradationManager.get_instance()
    return mgr.inject_fault(body)


@router.post("/degradation/clear", response_model=SystemHealthStatus)
def clear_chaos_faults(
    context: SecurityContext = Depends(get_security_context),
) -> SystemHealthStatus:
    if not context.has_permission(Permission.GOVERNANCE_MANAGE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission GOVERNANCE_MANAGE required")
    mgr = SystemDegradationManager.get_instance()
    return mgr.clear_faults()
