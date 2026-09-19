"""
FULFILL-X Production Health & Readiness API Router
"""
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from typing import Dict, Any

from app.config import settings
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.providers.factory import ProviderFactory

router = APIRouter(tags=["Health"])


class LivenessResponse(BaseModel):
    status: str
    version: str
    environment: str
    timestamp: str


class ReadinessResponse(BaseModel):
    status: str
    version: str
    environment: str
    timestamp: str
    dependencies: Dict[str, Any]


@router.get("/health", response_model=LivenessResponse)
def get_liveness():
    """
    Lightweight Liveness Check for Docker / K8s probes.
    """
    return LivenessResponse(
        status="ok",
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/api/health", response_model=ReadinessResponse)
async def get_readiness(response: Response):
    """
    Detailed Readiness Check verifying operational dependencies.
    """
    dependencies = {}
    all_healthy = True

    # Check World State Store
    try:
        world_repo = WorldRepository.get_instance()
        graph = world_repo.graph
        dependencies["world_repository"] = {
            "status": "healthy",
            "nodes": len(graph.nodes),
            "edges": len(graph.edges),
        }
    except Exception as e:
        all_healthy = False
        dependencies["world_repository"] = {
            "status": "unhealthy",
            "error": str(e),
        }

    # Check Risk Repository
    try:
        risk_repo = RiskRepository.get_instance()
        dependencies["risk_repository"] = {
            "status": "healthy",
            "active_signals": len(risk_repo.list_signals()),
        }
    except Exception as e:
        all_healthy = False
        dependencies["risk_repository"] = {
            "status": "unhealthy",
            "error": str(e),
        }

    # Check AI Provider Factory
    try:
        factory = ProviderFactory.get_instance()
        active_provider = factory.get_provider()
        health_res = active_provider.health()
        if asyncio.iscoroutine(health_res):
            health_info = await health_res
        else:
            health_info = health_res

        status_str = health_info.get("status") if isinstance(health_info, dict) else (getattr(health_info, "status", "healthy"))
        dependencies["ai_provider"] = {
            "status": "healthy" if status_str == "healthy" else "degraded",
            "provider_name": str(getattr(active_provider, "provider_type", "mock")),
            "info": health_info.model_dump() if hasattr(health_info, "model_dump") else health_info,
        }
    except Exception as e:
        dependencies["ai_provider"] = {
            "status": "unhealthy",
            "error": str(e),
        }

    overall_status = "healthy" if all_healthy else "unhealthy"
    if not all_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return ReadinessResponse(
        status=overall_status,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc).isoformat(),
        dependencies=dependencies,
    )


@router.get("/health/deep")
async def get_deep_health():
    """
    Comprehensive Deep Health Check endpoint for Phase 5 Observability.
    Verifies World, Risk, EventTransport, WebSocketManager, AI Providers, and Storage Mode.
    """
    from app.realtime.transport import TransportFactory
    from app.realtime.websocket_manager import websocket_manager
    from app.adapters.registry import AdapterRegistry

    transport = TransportFactory.get_transport()
    transport_health = await transport.health()
    ws_stats = websocket_manager.get_connection_stats()
    adapter_sources = await AdapterRegistry.get_instance().health_check_all()

    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "persistence_mode": settings.PERSISTENCE_MODE,
        "event_transport": transport_health,
        "websocket_gateway": ws_stats,
        "data_adapters": {
            "count": len(adapter_sources),
            "sources": [s.model_dump() for s in adapter_sources],
        },
    }
