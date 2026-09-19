"""
FULFILL-X Main API Router
"""
from fastapi import APIRouter
from app.api.world import router as world_router
from app.api.signals import router as signals_router
from app.api.risks import router as risks_router
from app.api.ai import router as ai_router
from app.schemas.world import ApiResponse

api_router = APIRouter()
api_router.include_router(world_router)
api_router.include_router(signals_router)
api_router.include_router(risks_router)
api_router.include_router(ai_router)

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
