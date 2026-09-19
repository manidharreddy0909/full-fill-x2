"""
FULFILL-X Main API Router
"""
from fastapi import APIRouter
from app.api.world import router as world_router
from app.api.signals import router as signals_router
from app.api.risks import router as risks_router
from app.api.ai import router as ai_router
from app.api.agents import router as agents_router
from app.api.coordinator import router as coordinator_router
from app.api.adversary import router as adversary_router
from app.api.planner import router as planner_router
from app.api.verification import router as verification_router
from app.api.cockpit import router as cockpit_router
from app.api.websocket import router as websocket_router
from app.api.health import router as health_router
from app.api.evaluation import router as evaluation_router
from app.api.demo import router as demo_router
from app.api.data import router as data_router
from app.api.ingestion import router as ingestion_router
from app.api.auth import router as auth_router
from app.api.observability import router as observability_router
from app.core.metrics import metrics_registry
from app.schemas.world import ApiResponse

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(health_router)
api_router.include_router(world_router)
api_router.include_router(signals_router)
api_router.include_router(risks_router)
api_router.include_router(ai_router)
api_router.include_router(agents_router)
api_router.include_router(coordinator_router)
api_router.include_router(adversary_router)
api_router.include_router(planner_router)
api_router.include_router(verification_router)
api_router.include_router(cockpit_router)
api_router.include_router(websocket_router)
api_router.include_router(evaluation_router)
api_router.include_router(demo_router)
api_router.include_router(data_router)
api_router.include_router(ingestion_router)
api_router.include_router(observability_router)


@api_router.get("/metrics", tags=["Observability & Telemetry"])
@api_router.get("/api/metrics", tags=["Observability & Telemetry"])
def get_prometheus_metrics():
    """Prometheus exposition format endpoint."""
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(metrics_registry.generate_prometheus_text())




system_router = APIRouter(prefix="/api/system", tags=["System"])


@system_router.get("/health", response_model=ApiResponse[dict])
def get_health() -> ApiResponse[dict]:
    return ApiResponse(
        data={
            "status": "HEALTHY",
            "version": "0.2.0",
            "environment": "development",
            "system": "FULFILL-X",
        }
    )


api_router.include_router(system_router)
