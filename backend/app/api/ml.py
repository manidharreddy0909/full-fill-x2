"""
FULFILL-X Predictive ML Platform REST API Router (Phase 6)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List, Optional, Any

from app.api.deps import get_security_context, require_permission
from app.schemas.auth import Permission, SecurityContext
from app.schemas.world import ApiResponse
from app.ml.schemas import (
    MLTaskType, ModelMetadata, Prediction, PredictionHorizon, DriftReport,
    ModelCard, TrainingJobConfig, TrainingJobSummary
)
from app.ml.service import MLPlatformService

router = APIRouter(prefix="/api/ml", tags=["Predictive ML Platform"])


@router.get("/status", response_model=ApiResponse[Dict[str, Any]])
async def get_ml_status(
    ctx: SecurityContext = Depends(require_permission(Permission.ML_READ)),
) -> ApiResponse[Dict[str, Any]]:
    """Get status summary of active predictive models and ML platform."""
    service = MLPlatformService.get_instance()
    models = service.registry.list_models(ctx.organization_id)
    active_count = len([m for m in models if m.status == "ACTIVE"])

    return ApiResponse(
        data={
            "status": "healthy",
            "organization_id": ctx.organization_id,
            "total_models": len(models),
            "active_models": active_count,
            "tasks_covered": [t.value for t in MLTaskType],
        }
    )


@router.get("/models", response_model=ApiResponse[List[ModelMetadata]])
async def list_models(
    task_type: Optional[MLTaskType] = None,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_READ)),
) -> ApiResponse[List[ModelMetadata]]:
    """List all registered ML models in the model registry."""
    service = MLPlatformService.get_instance()
    models = service.registry.list_models(ctx.organization_id, task_type=task_type)
    return ApiResponse(data=models)


@router.get("/models/{model_id}", response_model=ApiResponse[ModelMetadata])
async def get_model(
    model_id: str,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_READ)),
) -> ApiResponse[ModelMetadata]:
    """Retrieve metadata for a specific registered ML model."""
    service = MLPlatformService.get_instance()
    meta = service.registry.get_metadata(model_id)
    if not meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Model '{model_id}' not found")
    return ApiResponse(data=meta)


@router.post("/models/{model_id}/activate", response_model=ApiResponse[Dict[str, Any]])
async def activate_model(
    model_id: str,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_ACTIVATE)),
) -> ApiResponse[Dict[str, Any]]:
    """Promote a validated model to ACTIVE state."""
    service = MLPlatformService.get_instance()
    success = service.registry.activate_model(ctx.organization_id, model_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to activate model '{model_id}'")
    return ApiResponse(data={"activated": True, "model_id": model_id})


@router.post("/models/rollback", response_model=ApiResponse[Dict[str, Any]])
async def rollback_model(
    task_type: MLTaskType,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_ACTIVATE)),
) -> ApiResponse[Dict[str, Any]]:
    """Rollback active model to previously active model."""
    service = MLPlatformService.get_instance()
    success = service.registry.rollback_model(ctx.organization_id, task_type)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Rollback failed for task '{task_type.value}'")
    return ApiResponse(data={"rolled_back": True, "task_type": task_type.value})


@router.post("/train", response_model=ApiResponse[TrainingJobSummary])
async def launch_training_job(
    config: TrainingJobConfig,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_TRAIN)),
) -> ApiResponse[TrainingJobSummary]:
    """Launch an ML model training job."""
    config.organization_id = ctx.organization_id
    service = MLPlatformService.get_instance()
    summary = service.trigger_training_job(config)
    return ApiResponse(data=summary)


@router.get("/jobs/{job_id}", response_model=ApiResponse[TrainingJobSummary])
async def get_training_job(
    job_id: str,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_READ)),
) -> ApiResponse[TrainingJobSummary]:
    """Retrieve status summary of a model training job."""
    service = MLPlatformService.get_instance()
    summary = service.get_job_summary(job_id)
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Training job '{job_id}' not found")
    return ApiResponse(data=summary)


@router.post("/predict", response_model=ApiResponse[Prediction])
async def predict_entity(
    entity_id: str,
    task_type: MLTaskType,
    horizon: PredictionHorizon = PredictionHorizon.H24,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_PREDICT)),
) -> ApiResponse[Prediction]:
    """Generate predictive inference for an entity."""
    service = MLPlatformService.get_instance()
    prediction = await service.generate_prediction(ctx.organization_id, entity_id, task_type, horizon)
    return ApiResponse(data=prediction)


@router.get("/drift/{model_id}", response_model=ApiResponse[DriftReport])
async def get_drift_report(
    model_id: str,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_EVALUATE)),
) -> ApiResponse[DriftReport]:
    """Evaluate feature and prediction drift for a registered model."""
    service = MLPlatformService.get_instance()
    report = service.evaluate_model_drift(ctx.organization_id, model_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Could not compute drift for model '{model_id}'")
    return ApiResponse(data=report)


@router.get("/cards/{model_id}", response_model=ApiResponse[ModelCard])
async def get_model_card(
    model_id: str,
    ctx: SecurityContext = Depends(require_permission(Permission.ML_READ)),
) -> ApiResponse[ModelCard]:
    """Retrieve governance Model Card for transparency auditing."""
    service = MLPlatformService.get_instance()
    card = service.get_model_card(model_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Model card for '{model_id}' not found")
    return ApiResponse(data=card)
