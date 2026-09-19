"""
FULFILL-X Idempotency & Deduplication Engine Unit Tests (Phase 5)
"""
import pytest
from app.services.idempotency import IdempotencyEngine


@pytest.mark.asyncio
async def test_idempotency_engine_memory_deduplication():
    engine = IdempotencyEngine.get_instance()
    engine.reset()

    event_id = "evt-test-100"
    consumer_id = "consumer-risk-engine"
    org_id = "org-test-1"

    # Initially not processed
    assert await engine.is_processed(event_id, consumer_id, org_id) is False

    # Record execution
    await engine.record_execution(
        event_id=event_id,
        consumer_id=consumer_id,
        organization_id=org_id,
        status="COMPLETED",
        result_payload={"risk_score": 0.42},
    )

    # Subsequent check should return True (processed)
    assert await engine.is_processed(event_id, consumer_id, org_id) is True

    # Different consumer should be False
    assert await engine.is_processed(event_id, "consumer-agent-engine", org_id) is False
