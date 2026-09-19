"""
FULFILL-X Ollama Local AI Provider Adapter (Phase 04)
Matching docs/AI_ARCHITECTURE.md (P04-006)
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


class OllamaProvider(AIProvider):
    """
    Local Ollama Open-Source AI Provider Adapter.
    Connects to local Ollama instance (default http://localhost:11434).
    """

    def __init__(self, base_url: str | None = None, model_name: str | None = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model_name = model_name or os.getenv("OLLAMA_MODEL", "llama3:latest")

    async def generate(self, request: AIRequest) -> AIResponse:
        start_time = time.perf_counter()
        url = f"{self.base_url.rstrip('/')}/api/generate"

        system_part = f"System: {request.system_prompt}\n\n" if request.system_prompt else ""
        prompt_text = f"{system_part}Prompt: {request.prompt}"
        if request.input_context:
            prompt_text += f"\nContext: {json.dumps(request.input_context)}"

        payload: dict[str, Any] = {
            "model": self.model_name,
            "prompt": prompt_text,
            "stream": False,
            "options": {
                "temperature": request.temperature,
                "num_predict": request.max_tokens,
            },
        }

        if request.expected_schema:
            payload["format"] = "json"

        try:
            async with httpx.AsyncClient(timeout=request.timeout_seconds) as client:
                resp = await client.post(url, json=payload)

            latency_ms = (time.perf_counter() - start_time) * 1000.0

            if resp.status_code != 200:
                return AIResponse(
                    request_id=request.request_id,
                    provider=AIProviderType.OLLAMA,
                    model_name=self.model_name,
                    content="",
                    latency_ms=round(latency_ms, 2),
                    status="PROVIDER_ERROR",
                    error=AIError(
                        code=f"HTTP_{resp.status_code}",
                        message=f"Ollama server returned HTTP {resp.status_code}",
                    ),
                )

            data = resp.json()
            text_content = data.get("response", "")

            structured_out: dict[str, Any] | None = None
            if request.expected_schema or text_content.strip().startswith("{"):
                try:
                    structured_out = json.loads(text_content)
                except Exception:
                    structured_out = None

            prompt_eval_count = data.get("prompt_eval_count", 0)
            eval_count = data.get("eval_count", 0)

            return AIResponse(
                request_id=request.request_id,
                provider=AIProviderType.OLLAMA,
                model_name=self.model_name,
                content=text_content,
                structured_output=structured_out,
                usage=AIUsage(
                    prompt_tokens=prompt_eval_count,
                    completion_tokens=eval_count,
                    total_tokens=prompt_eval_count + eval_count,
                    estimated_cost_usd=0.0,
                ),
                latency_ms=round(latency_ms, 2),
                status="SUCCESS",
            )

        except httpx.TimeoutException:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return AIResponse(
                request_id=request.request_id,
                provider=AIProviderType.OLLAMA,
                model_name=self.model_name,
                content="",
                latency_ms=round(latency_ms, 2),
                status="TIMEOUT",
                error=AIError(
                    code="TIMEOUT",
                    message=f"Ollama request timed out after {request.timeout_seconds}s",
                ),
            )
        except Exception as ex:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return AIResponse(
                request_id=request.request_id,
                provider=AIProviderType.OLLAMA,
                model_name=self.model_name,
                content="",
                latency_ms=round(latency_ms, 2),
                status="PROVIDER_ERROR",
                error=AIError(
                    code="UNAVAILABLE",
                    message=f"Local Ollama server unavailable at {self.base_url}: {str(ex)}",
                ),
            )

    async def health(self) -> ProviderInfo:
        start = time.perf_counter()
        url = f"{self.base_url.rstrip('/')}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(url)
            lat = (time.perf_counter() - start) * 1000.0

            if resp.status_code == 200:
                models_data = resp.json().get("models", [])
                model_names = [m.get("name") for m in models_data] or [self.model_name]
                return ProviderInfo(
                    name=AIProviderType.OLLAMA,
                    configured=True,
                    available=True,
                    models=model_names,
                    latency_ms=round(lat, 2),
                    status_details=f"Ollama Server Available at {self.base_url}",
                )
            else:
                return ProviderInfo(
                    name=AIProviderType.OLLAMA,
                    configured=True,
                    available=False,
                    models=[self.model_name],
                    status_details=f"Ollama server returned status {resp.status_code}",
                )
        except Exception as ex:
            return ProviderInfo(
                name=AIProviderType.OLLAMA,
                configured=True,
                available=False,
                models=[self.model_name],
                status_details=f"Ollama server offline at {self.base_url}: {str(ex)}",
            )

    def capabilities(self) -> dict[str, Any]:
        return {
            "streaming": True,
            "structured_output": True,
            "vision": False,
            "max_context_window": 8192,
            "offline_support": True,
        }
