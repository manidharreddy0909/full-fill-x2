"""
FULFILL-X AI Provider REST API Router (Phase 04)
Matching docs/API_CATALOG.md & docs/AI_ARCHITECTURE.md (P04-012)
"""
from fastapi import APIRouter, Query, HTTPException, status
from app.schemas.world import ApiResponse
from app.schemas.ai import (
    AIRequest,
    AIResponse,
    AIProvidersSummaryResponse,
    AIHealthResponse,
)
from app.services.ai import AIService

router = APIRouter(prefix="/api/ai", tags=["AI Provider Architecture"])
ai_service = AIService()


@router.get("/providers", response_model=ApiResponse[AIProvidersSummaryResponse])
async def list_providers():
    """
    Retrieve registered AI providers, active provider, and availability health.
    """
    summary = await ai_service.get_providers_status()
    return ApiResponse(data=summary)


@router.get("/health", response_model=ApiResponse[AIHealthResponse])
async def get_ai_health():
    """
    Retrieve AI subsystem health metrics and active model readiness.
    """
    health_info = await ai_service.get_health()
    return ApiResponse(data=health_info)


@router.post("/generate", response_model=ApiResponse[AIResponse])
async def generate_completion(
    request: AIRequest,
    provider: str | None = Query(default=None, description="Optional provider override (mock, gemini, ollama, bedrock)"),
):
    """
    Execute vendor-neutral AI reasoning task with structured output validation.
    Enforces 'LLMs Propose; Deterministic Code Decides'.
    Does NOT mutate authoritative world or risk state directly.
    """
    try:
        response = await ai_service.generate_reasoning(request, provider_override=provider)
        return ApiResponse(data=response)
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI reasoning generation failed: {str(ex)}",
        )
