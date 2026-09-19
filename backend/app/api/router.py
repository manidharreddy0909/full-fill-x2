"""
FULFILL-X Main API Router
"""
from fastapi import APIRouter
from app.api.world import router as world_router
from app.schemas.world import ApiResponse

api_router = APIRouter()
api_router.include_router(world_router)

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
