"""
FULFILL-X Signal Intelligence REST API Endpoints (P03-010)
"""
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.signal import (
    Signal,
    SignalCreateRequest,
    SignalSeverity,
    SignalStatus,
    SignalType,
)
from app.schemas.world import ApiResponse
from app.services.risk import RiskService

router = APIRouter(prefix="/api/signals", tags=["Signal Intelligence"])
service = RiskService()


@router.get("", response_model=ApiResponse[dict])
def list_signals(
    severity: SignalSeverity | None = Query(default=None),
    signal_type: SignalType | None = Query(default=None),
    status_filter: SignalStatus | None = Query(default=None, alias="status"),
) -> ApiResponse[dict]:
    signals = service.list_signals(severity=severity, signal_type=signal_type, status=status_filter)
    critical_count = sum(1 for s in signals if s.severity == SignalSeverity.CRITICAL and s.status == SignalStatus.ACTIVE)
    
    return ApiResponse(
        data={
            "signals": [s.model_dump() for s in signals],
            "total": len(signals),
            "active_critical": critical_count,
        }
    )


@router.get("/{signal_id}", response_model=ApiResponse[Signal])
def get_signal_by_id(signal_id: UUID) -> ApiResponse[Signal]:
    sig = service.get_signal(signal_id)
    if not sig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "SIGNAL_NOT_FOUND", "message": f"Signal '{signal_id}' not found"},
        )
    return ApiResponse(data=sig)


@router.post("", response_model=ApiResponse[Signal], status_code=status.HTTP_201_CREATED)
def inject_signal(req: SignalCreateRequest) -> ApiResponse[Signal]:
    """Inject a new weak signal into the Risk Engine."""
    sig = service.inject_signal(req)
    return ApiResponse(data=sig)


@router.patch("/{signal_id}/resolve", response_model=ApiResponse[Signal])
def resolve_signal(signal_id: UUID) -> ApiResponse[Signal]:
    """Mark a signal as resolved and trigger risk recalculation."""
    sig = service.resolve_signal(signal_id)
    if not sig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "SIGNAL_NOT_FOUND", "message": f"Signal '{signal_id}' not found"},
        )
    return ApiResponse(data=sig)
