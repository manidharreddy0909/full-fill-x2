"""
FULFILL-X Agent Memory Unit Tests (Phase 9)
Validates structured memory creation, provenance tracking, strength decay, and tenant isolation.
"""
import pytest
from app.agents.resilience.memory import AgentMemoryEngine
from app.agents.resilience.schemas import MemoryStatus, MemoryType


def test_add_and_query_memory():
    """Verify structured memory creation and tenant isolation."""
    engine = AgentMemoryEngine()

    mem1 = engine.add_memory(
        agent_id="inventory",
        lesson="Increase safety stock at Wh-001 by 1.5x during port congestion",
        organization_id="org-tenant-a",
        confidence=0.85,
    )
    assert mem1.memory_id.startswith("mem-")
    assert mem1.status == MemoryStatus.VALIDATED

    # Query tenant A
    res_a = engine.query_memories(organization_id="org-tenant-a", agent_id="inventory")
    assert len(res_a) == 1
    assert res_a[0].lesson == mem1.lesson

    # Query tenant B (must be empty to prove isolation)
    res_b = engine.query_memories(organization_id="org-tenant-b")
    assert len(res_b) == 0


def test_memory_decay_and_validation():
    """Verify memory decay rates and lesson validation."""
    engine = AgentMemoryEngine()
    mem = engine.add_memory(
        agent_id="supplier",
        lesson="Activate Sup-002 on Tier-1 outage",
        confidence=0.80,
    )

    # Apply 10% decay
    engine.apply_decay(decay_rate=0.10)
    assert mem.decay_factor == 0.90

    # Validate lesson boosts confidence
    validated = engine.validate_lesson(mem.memory_id)
    assert validated is not None
    assert validated.confidence > 0.80
