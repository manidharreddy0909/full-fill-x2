"""
FULFILL-X AI Provider Factory (Phase 04)
Matching docs/AI_ARCHITECTURE.md (P04-008)
"""
import os
import logging
from typing import Dict
from app.providers.base import AIProvider
from app.providers.mock import MockAIProvider
from app.providers.gemini import GeminiProvider
from app.providers.ollama import OllamaProvider
from app.providers.bedrock import BedrockProvider
from app.schemas.ai import AIProviderType, ProviderInfo, AIProvidersSummaryResponse

logger = logging.getLogger("fulfillx.providers")


class ProviderFactory:
    """
    Singleton Factory managing AI Provider instances, fallback chains, and health registry.
    """

    _instance: "ProviderFactory | None" = None

    def __init__(self):
        self._providers: Dict[str, AIProvider] = {
            AIProviderType.MOCK.value: MockAIProvider(),
            AIProviderType.GEMINI.value: GeminiProvider(),
            AIProviderType.OLLAMA.value: OllamaProvider(),
            AIProviderType.BEDROCK.value: BedrockProvider(),
        }

    @classmethod
    def get_instance(cls) -> "ProviderFactory":
        if cls._instance is None:
            cls._instance = ProviderFactory()
        return cls._instance

    @property
    def active_provider_name(self) -> str:
        env_val = os.getenv("FULFILLX_AI_PROVIDER", "mock").lower()
        if env_val in self._providers:
            return env_val
        return "mock"

    def get_provider(self, name: str | None = None) -> AIProvider:
        target_name = (name or self.active_provider_name).lower()
        if target_name in self._providers:
            return self._providers[target_name]
        logger.warning(f"Unknown provider '{name}', falling back to 'mock'")
        return self._providers["mock"]

    async def get_provider_with_fallback(self, name: str | None = None) -> AIProvider:
        primary = self.get_provider(name)
        info = await primary.health()
        if info.available:
            return primary
        
        logger.info(f"Primary provider '{info.name}' unavailable ({info.status_details}). Falling back to 'mock'")
        return self._providers["mock"]

    async def get_summary(self) -> AIProvidersSummaryResponse:
        infos: list[ProviderInfo] = []
        for name, provider in self._providers.items():
            try:
                info = await provider.health()
                infos.append(info)
            except Exception as ex:
                infos.append(
                    ProviderInfo(
                        name=AIProviderType(name),
                        configured=False,
                        available=False,
                        status_details=f"Health check failed: {str(ex)}",
                    )
                )

        active = AIProviderType(self.active_provider_name)
        return AIProvidersSummaryResponse(
            active_provider=active,
            providers=infos,
        )


def get_ai_provider(name: str | None = None) -> AIProvider:
    """Helper function to get provider instance."""
    return ProviderFactory.get_instance().get_provider(name)
