"""
FULFILL-X Abstract AI Provider Interface (Phase 04)
Matching docs/AI_ARCHITECTURE.md (P04-001)
"""
from abc import ABC, abstractmethod
from typing import Any
from app.schemas.ai import AIRequest, AIResponse, ProviderInfo


class AIProvider(ABC):
    """
    Abstract Base Class for vendor-neutral AI Model Adapters.
    Integrates Gemini, Ollama, Bedrock, and Mock providers cleanly.
    """

    @abstractmethod
    async def generate(self, request: AIRequest) -> AIResponse:
        """
        Execute an AI reasoning request and return a structured response.
        Must handle vendor payload translation, timeouts, and error catching.
        """
        pass

    @abstractmethod
    async def health(self) -> ProviderInfo:
        """
        Check provider configuration and endpoint reachability.
        Returns ProviderInfo with health status and ping latency.
        """
        pass

    @abstractmethod
    def capabilities(self) -> dict[str, Any]:
        """
        Return provider capabilities metadata (e.g. streaming, structured output, max context size).
        """
        pass
