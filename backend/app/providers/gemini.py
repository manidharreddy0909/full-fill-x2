"""
FULFILL-X Google Gemini AI Provider Adapter (Phase 04)
Matching docs/AI_ARCHITECTURE.md (P04-005)
"""
import os
import time
import json
from typing import Any
import httpx
from app.providers.base import AIProvider
from app.schemas.ai import (
    AIRequest,
    AIResponse,
    AIProviderType,
    AIUsage,
    AIError,
    ProviderInfo,
)


class GeminiProvider(AIProvider):
    """
    Google Gemini AI Provider Adapter.
    Uses REST / Async HTTP to Google Gemini API (gemini-1.5-pro / gemini-1.5-flash).
    """

    def __init__(self, model_name: str | None = None):
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    @property
    def api_key(self) -> str | None:
        return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    async def generate(self, request: AIRequest) -> AIResponse:
        start_time = time.perf_counter()
        key = self.api_key

        if not key:
            return AIResponse(
                request_id=request.request_id,
                provider=AIProviderType.GEMINI,
                model_name=self.model_name,
                content="",
                status="PROVIDER_ERROR",
                error=AIError(
                    code="NOT_CONFIGURED",
                    message="GEMINI_API_KEY environment variable is not set",
                ),
            )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={key}"

        system_instruction_part = ""
        if request.system_prompt:
            system_instruction_part = f"SYSTEM INSTRUCTION: {request.system_prompt}\n\n"

        prompt_body = f"{system_instruction_part}USER PROMPT: {request.prompt}"
        if request.input_context:
            prompt_body += f"\nINPUT CONTEXT: {json.dumps(request.input_context)}"

        payload: dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt_body}]}],
            "generationConfig": {
                "temperature": request.temperature,
                "maxOutputTokens": request.max_tokens,
            },
        }

        if request.expected_schema:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        try:
            async with httpx.AsyncClient(timeout=request.timeout_seconds) as client:
                resp = await client.post(url, json=payload)

            latency_ms = (time.perf_counter() - start_time) * 1000.0

            if resp.status_code != 200:
                return AIResponse(
                    request_id=request.request_id,
                    provider=AIProviderType.GEMINI,
                    model_name=self.model_name,
                    content="",
                    latency_ms=round(latency_ms, 2),
                    status="PROVIDER_ERROR",
                    error=AIError(
                        code=f"HTTP_{resp.status_code}",
                        message=f"Gemini API returned HTTP {resp.status_code}: {resp.text[:200]}",
                    ),
                )

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return AIResponse(
                    request_id=request.request_id,
                    provider=AIProviderType.GEMINI,
                    model_name=self.model_name,
                    content="",
                    latency_ms=round(latency_ms, 2),
                    status="PROVIDER_ERROR",
                    error=AIError(
                        code="EMPTY_RESPONSE",
                        message="Gemini returned zero candidates",
                    ),
                )

            parts = candidates[0].get("content", {}).get("parts", [])
            text_content = "".join([p.get("text", "") for p in parts])

            structured_out: dict[str, Any] | None = None
            if request.expected_schema or text_content.strip().startswith("{"):
                try:
                    structured_out = json.loads(text_content)
                except Exception:
                    structured_out = None

            usage_meta = data.get("usageMetadata", {})
            prompt_tokens = usage_meta.get("promptTokenCount", 0)
            candidates_tokens = usage_meta.get("candidatesTokenCount", 0)

            return AIResponse(
                request_id=request.request_id,
                provider=AIProviderType.GEMINI,
                model_name=self.model_name,
                content=text_content,
                structured_output=structured_out,
                usage=AIUsage(
                    prompt_tokens=prompt_tokens,
                    completion_tokens=candidates_tokens,
                    total_tokens=prompt_tokens + candidates_tokens,
                    estimated_cost_usd=0.0001,
                ),
                latency_ms=round(latency_ms, 2),
                status="SUCCESS",
            )

        except httpx.TimeoutException:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return AIResponse(
                request_id=request.request_id,
                provider=AIProviderType.GEMINI,
                model_name=self.model_name,
                content="",
                latency_ms=round(latency_ms, 2),
                status="TIMEOUT",
                error=AIError(
                    code="TIMEOUT",
                    message=f"Gemini request timed out after {request.timeout_seconds}s",
                ),
            )
        except Exception as e:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return AIResponse(
                request_id=request.request_id,
                provider=AIProviderType.GEMINI,
                model_name=self.model_name,
                content="",
                latency_ms=round(latency_ms, 2),
                status="PROVIDER_ERROR",
                error=AIError(code="EXCEPTION", message=str(e)),
            )

    async def health(self) -> ProviderInfo:
        key = self.api_key
        if not key:
            return ProviderInfo(
                name=AIProviderType.GEMINI,
                configured=False,
                available=False,
                models=[self.model_name],
                status_details="GEMINI_API_KEY environment variable not set",
            )

        start = time.perf_counter()
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}?key={key}"
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(url)
            lat = (time.perf_counter() - start) * 1000.0

            if resp.status_code == 200:
                return ProviderInfo(
                    name=AIProviderType.GEMINI,
                    configured=True,
                    available=True,
                    models=[self.model_name, "gemini-1.5-pro", "gemini-1.5-flash"],
                    latency_ms=round(lat, 2),
                    status_details="Gemini API Connected & Available",
                )
            else:
                return ProviderInfo(
                    name=AIProviderType.GEMINI,
                    configured=True,
                    available=False,
                    models=[self.model_name],
                    status_details=f"API returned status {resp.status_code}",
                )
        except Exception as ex:
            return ProviderInfo(
                name=AIProviderType.GEMINI,
                configured=True,
                available=False,
                models=[self.model_name],
                status_details=f"Health check connection error: {str(ex)}",
            )

    def capabilities(self) -> dict[str, Any]:
        return {
            "streaming": True,
            "structured_output": True,
            "vision": True,
            "max_context_window": 1000000,
            "offline_support": False,
        }
