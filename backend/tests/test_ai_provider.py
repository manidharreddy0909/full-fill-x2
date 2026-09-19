"""
Unit tests for AI Provider Abstraction & Adapters (P04-001, P04-004 - P04-008, P04-014, P04-015)
"""
import pytest
from app.providers.mock import MockAIProvider
from app.providers.gemini import GeminiProvider
from app.providers.ollama import OllamaProvider
from app.providers.bedrock import BedrockProvider
from app.providers.factory import ProviderFactory, get_ai_provider
from app.schemas.ai import AIRequest, AIProviderType, TaskType


@pytest.mark.asyncio
async def test_mock_provider_determinism_and_contract():
    provider = MockAIProvider()
    req = AIRequest(
        task_type=TaskType.SCENARIO_GEN,
        prompt="Generate double punch disruption",
        input_context={"affected_node_ids": ["sup-001"]},
    )

    resp1 = await provider.generate(req)
    resp2 = await provider.generate(req)

    assert resp1.status == "SUCCESS"
    assert resp1.provider == AIProviderType.MOCK
    assert resp1.content == resp2.content
    assert resp1.structured_output == resp2.structured_output
    assert "severity_multiplier" in resp1.structured_output


@pytest.mark.asyncio
async def test_mock_provider_custom_expected_schema():
    provider = MockAIProvider()
    schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "score": {"type": "number"},
            "is_critical": {"type": "boolean"},
        },
        "required": ["title", "score"],
    }
    req = AIRequest(prompt="Test custom schema", expected_schema=schema)

    resp = await provider.generate(req)
    assert resp.status == "SUCCESS"
    assert resp.structured_output is not None
    assert isinstance(resp.structured_output.get("title"), str)
    assert isinstance(resp.structured_output.get("score"), (int, float))
    assert isinstance(resp.structured_output.get("is_critical"), bool)


@pytest.mark.asyncio
async def test_provider_health_and_capabilities():
    mock_p = MockAIProvider()
    health = await mock_p.health()
    assert health.available is True
    assert health.configured is True
    assert len(health.models) > 0

    caps = mock_p.capabilities()
    assert caps["structured_output"] is True
    assert caps["offline_support"] is True


@pytest.mark.asyncio
async def test_provider_factory_and_fallback():
    factory = ProviderFactory.get_instance()
    
    mock_p = factory.get_provider("mock")
    assert isinstance(mock_p, MockAIProvider)

    gemini_p = factory.get_provider("gemini")
    assert isinstance(gemini_p, GeminiProvider)

    ollama_p = factory.get_provider("ollama")
    assert isinstance(ollama_p, OllamaProvider)

    bedrock_p = factory.get_provider("bedrock")
    assert isinstance(bedrock_p, BedrockProvider)

    # Unknown provider falls back to mock
    unknown_p = factory.get_provider("non_existent_vendor")
    assert isinstance(unknown_p, MockAIProvider)


@pytest.mark.asyncio
async def test_unconfigured_providers_report_health_gracefully():
    # Gemini without API key
    gemini_p = GeminiProvider()
    g_health = await gemini_p.health()
    if not gemini_p.api_key:
        assert g_health.configured is False
        assert g_health.available is False

    # Bedrock without AWS creds
    bedrock_p = BedrockProvider()
    b_health = await bedrock_p.health()
    if not bedrock_p.is_configured:
        assert b_health.configured is False
        assert b_health.available is False
