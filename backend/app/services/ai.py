"""
FULFILL-X AI Service & Safety Boundary (Phase 04)
Matching docs/AI_ARCHITECTURE.md (P04-009, P04-010)
"""
import logging
from typing import Any
from app.providers.factory import ProviderFactory
from app.schemas.ai import (
    AIRequest,
    AIResponse,
    AIError,
    AIProvidersSummaryResponse,
    AIHealthResponse,
    AIProviderType,
)

logger = logging.getLogger("fulfillx.ai_service")


class AIService:
    """
    AI Orchestration Service & Safety Boundary.
    Enforces 'LLMs Propose; Deterministic Code Decides'.
    Validates all model outputs against expected schemas and prevents unvalidated state mutations.
    """

    def __init__(self, factory: ProviderFactory | None = None):
        self.factory = factory or ProviderFactory.get_instance()

    async def generate_reasoning(self, request: AIRequest, provider_override: str | None = None) -> AIResponse:
        """
        Execute AI reasoning request safely through provider factory.
        Validates structured output if an expected schema is supplied.
        """
        # Resolve provider with automatic fallback if unavailable
        provider = await self.factory.get_provider_with_fallback(provider_override)

        # Invoke provider
        response = await provider.generate(request)

        # Validate structured output against expected schema if provided
        if response.status == "SUCCESS" and request.expected_schema:
            val_error = self._validate_structured_output(response.structured_output, request.expected_schema)
            if val_error:
                response.status = "SCHEMA_VALIDATION_ERROR"
                response.error = AIError(
                    code="SCHEMA_VALIDATION_FAILED",
                    message=f"Structured output failed schema validation: {val_error}",
                )

        logger.info(
            f"AI Request '{request.request_id}' completed via provider '{response.provider}' "
            f"in {response.latency_ms}ms with status '{response.status}'"
        )
        return response

    async def get_providers_status(self) -> AIProvidersSummaryResponse:
        return await self.factory.get_summary()

    async def get_health(self) -> AIHealthResponse:
        summary = await self.factory.get_summary()
        available_count = sum(1 for p in summary.providers if p.available)

        status_str = "HEALTHY"
        if available_count == 0:
            status_str = "DEGRADED"
        elif summary.active_provider == AIProviderType.MOCK:
            status_str = "HEALTHY_MOCK_MODE"

        return AIHealthResponse(
            status=status_str,
            active_provider=summary.active_provider,
            available_count=available_count,
            details={
                "total_registered_providers": len(summary.providers),
                "configured_providers": [p.name.value for p in summary.providers if p.configured],
                "available_providers": [p.name.value for p in summary.providers if p.available],
            },
        )

    def _validate_structured_output(
        self, data: dict[str, Any] | None, expected_schema: dict[str, Any]
    ) -> str | None:
        """
        Validates dictionary data against basic JSON Schema requirements.
        Returns error string if invalid, None if valid.
        """
        if data is None:
            return "Expected structured output JSON object, but got None"

        required_keys = expected_schema.get("required", [])
        for r_key in required_keys:
            if r_key not in data:
                return f"Missing required property '{r_key}' in AI output"

        properties = expected_schema.get("properties", {})
        for prop_name, prop_spec in properties.items():
            if prop_name in data:
                val = data[prop_name]
                expected_type = prop_spec.get("type")
                if expected_type == "string" and not isinstance(val, str):
                    return f"Property '{prop_name}' expected string, got {type(val).__name__}"
                elif expected_type == "number" and not isinstance(val, (int, float)):
                    return f"Property '{prop_name}' expected number, got {type(val).__name__}"
                elif expected_type == "integer" and not isinstance(val, int):
                    return f"Property '{prop_name}' expected integer, got {type(val).__name__}"
                elif expected_type == "boolean" and not isinstance(val, bool):
                    return f"Property '{prop_name}' expected boolean, got {type(val).__name__}"
                elif expected_type == "array" and not isinstance(val, list):
                    return f"Property '{prop_name}' expected array, got {type(val).__name__}"

        return None
