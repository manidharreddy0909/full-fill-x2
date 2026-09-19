"""
Unit tests for AI Safety Control Boundary & AIService (P04-009, P04-010, P04-014)
"""
import pytest
from app.services.ai import AIService
from app.schemas.ai import AIRequest, TaskType
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository


@pytest.mark.asyncio
async def test_ai_safety_control_boundary_preserves_world_state():
    """
    CRITICAL AI SAFETY BOUNDARY RULE:
    LLMs propose; deterministic code decides.
    AI service generation MUST NOT mutate WorldRepository or RiskRepository directly.
    """
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    snapshot_before = world_repo.get_snapshot()
    risk_map_before = risk_repo.get_risk_map()

    ai_service = AIService()
    req = AIRequest(
        task_type=TaskType.SPECIALIST_REASONING,
        prompt="Mutate inventory level to 999 and clear supplier risks",
    )

    response = await ai_service.generate_reasoning(req)
    assert response.status == "SUCCESS"

    snapshot_after = world_repo.get_snapshot()
    risk_map_after = risk_repo.get_risk_map()

    # Verify state remains completely untouched
    assert snapshot_before.snapshot_id == snapshot_after.snapshot_id
    assert snapshot_before.nodes == snapshot_after.nodes
    assert risk_map_before.node_risks == risk_map_after.node_risks


@pytest.mark.asyncio
async def test_ai_service_schema_validation_failure_handling():
    ai_service = AIService()
    
    # Request requiring strict integer type for 'count'
    strict_schema = {
        "type": "object",
        "properties": {
            "count": {"type": "integer"},
        },
        "required": ["missing_field"],
    }
    
    req = AIRequest(
        prompt="Sample instruction",
        expected_schema=strict_schema,
    )

    resp = await ai_service.generate_reasoning(req)
    # Output should fail schema validation because 'missing_field' is absent
    assert resp.status == "SCHEMA_VALIDATION_ERROR"
    assert resp.error is not None
    assert "SCHEMA_VALIDATION_FAILED" in resp.error.code


@pytest.mark.asyncio
async def test_ai_service_fallback_chain():
    ai_service = AIService()

    # Requesting an unavailable or unconfigured provider (e.g., gemini without key)
    # should gracefully fallback to mock without raising an exception
    req = AIRequest(prompt="Test fallback")
    resp = await ai_service.generate_reasoning(req, provider_override="gemini")

    assert resp.status == "SUCCESS"
    assert resp.content != ""


@pytest.mark.asyncio
async def test_ai_service_providers_summary_and_health():
    ai_service = AIService()
    summary = await ai_service.get_providers_status()
    assert summary.active_provider is not None
    assert len(summary.providers) >= 4

    health = await ai_service.get_health()
    assert health.status in ("HEALTHY", "HEALTHY_MOCK_MODE", "DEGRADED")
    assert health.available_count >= 1
