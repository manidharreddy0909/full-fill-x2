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


from app.realtime.event_bus import event_bus
from app.schemas.events import EventType, EventSeverity

@router.post("", response_model=ApiResponse[Signal], status_code=status.HTTP_201_CREATED)
def inject_signal(req: SignalCreateRequest) -> ApiResponse[Signal]:
    """Inject a new weak signal into the Risk Engine."""
    sig = service.inject_signal(req)
    try:
        risk_map = service.get_risk_map()
        event_bus.publish_sync(
            EventType.SIGNAL_DETECTED,
            payload={
                "signal_id": str(sig.signal_id),
                "title": sig.title,
                "target_node_id": sig.target_node_id,
                "severity": str(sig.severity.value) if hasattr(sig.severity, "value") else str(sig.severity),
            },
            severity=EventSeverity.HIGH if str(sig.severity) in ["HIGH", "CRITICAL"] else EventSeverity.INFO,
        )
        event_bus.publish_sync(
            EventType.RISK_UPDATED,
            payload={
                "network_health": risk_map.network_health,
                "node_risks_count": len(risk_map.node_risks),
                "node_id": sig.target_node_id,
                "composite_risk": risk_map.node_risks.get(sig.target_node_id, {}).get("composite", 0.8) if isinstance(risk_map.node_risks.get(sig.target_node_id), dict) else getattr(risk_map.node_risks.get(sig.target_node_id), "composite", 0.8),
            },
        )
    except Exception:
        pass
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
