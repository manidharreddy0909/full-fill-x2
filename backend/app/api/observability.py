"""
FULFILL-X Observability & Telemetry REST API Router (Phase 5)
Provides RBAC-protected, tenant-isolated endpoints for system pulse, event inspection,
traces, operational alerts, and Prometheus metrics.
"""
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.schemas.auth import Permission, SecurityContext
from app.api.deps import get_security_context, require_permission
from app.realtime.transport import TransportFactory
from app.realtime.websocket_manager import websocket_manager
from app.realtime.event_bus import event_bus
from app.core.metrics import metrics_registry
from app.services.alerts import AlertEngine
from app.schemas.events import EventEnvelope, EventSeverity

router = APIRouter(prefix="/api/observability", tags=["Observability & Telemetry"])


class AlertAcknowledgeRequest(BaseModel):
    alert_id: str = Field(..., description="Target alert ID to acknowledge")


@router.get("/status")
async def get_observability_status(
    sec_ctx: SecurityContext = Depends(require_permission(Permission.OBSERVABILITY_READ)),
):
    """
    Get composite system observability status (Event Transport, WebSockets, Metrics, Alert Engine).
    """
    transport = TransportFactory.get_transport()
    transport_health = await transport.health()
    ws_stats = websocket_manager.get_connection_stats()
    active_alerts = AlertEngine.get_instance().list_alerts(sec_ctx.organization_id)

    return {
        "status": "healthy",
        "organization_id": sec_ctx.organization_id,
        "transport": transport_health,
        "websockets": ws_stats,
        "active_alerts_count": len([a for a in active_alerts if a.get("status") == "ACTIVE"]),
        "metrics_summary": metrics_registry.get_summary_dict(),
    }


@router.get("/events")
async def get_event_stream(
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    since_sequence: int = Query(0, description="Sequence watermark"),
    limit: int = Query(50, ge=1, le=200, description="Max events to return"),
    sec_ctx: SecurityContext = Depends(require_permission(Permission.EVENTS_INSPECT)),
):
    """
    Retrieve live event stream with tenant isolation and sequence filtering.
    """
    target_session = session_id or "global"
    events = event_bus.get_replay_events(
        session_id=target_session,
        since_sequence=since_sequence,
        max_count=limit,
    )
    # Tenant filtering
    filtered_events = [
        evt for evt in events
        if getattr(evt, "organization_id", None) == sec_ctx.organization_id or getattr(evt, "organization_id", None) == "org-fulfillx-default"
    ]
    return {
        "organization_id": sec_ctx.organization_id,
        "session_id": target_session,
        "count": len(filtered_events),
        "events": filtered_events,
    }


@router.get("/alerts")
async def list_operational_alerts(
    sec_ctx: SecurityContext = Depends(require_permission(Permission.ALERTS_READ)),
):
    """
    List active operational alerts for tenant.
    """
    alerts = AlertEngine.get_instance().list_alerts(sec_ctx.organization_id)
    return {
        "organization_id": sec_ctx.organization_id,
        "alerts_count": len(alerts),
        "alerts": alerts,
    }


@router.post("/alerts/acknowledge")
async def acknowledge_alert(
    req: AlertAcknowledgeRequest,
    sec_ctx: SecurityContext = Depends(require_permission(Permission.ALERTS_MANAGE)),
):
    """
    Acknowledge an operational alert.
    """
    engine = AlertEngine.get_instance()
    success = await engine.acknowledge_alert(
        alert_id=req.alert_id,
        acknowledged_by=sec_ctx.display_name,
        organization_id=sec_ctx.organization_id,
    )
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found or already acknowledged")

    return {
        "status": "acknowledged",
        "alert_id": req.alert_id,
        "acknowledged_by": sec_ctx.display_name,
    }


@router.get("/metrics")
async def get_observability_metrics(
    sec_ctx: SecurityContext = Depends(require_permission(Permission.METRICS_READ)),
):
    """
    Get JSON formatted telemetry metrics snapshot.
    """
    return {
        "organization_id": sec_ctx.organization_id,
        "metrics": metrics_registry.get_summary_dict(),
    }
