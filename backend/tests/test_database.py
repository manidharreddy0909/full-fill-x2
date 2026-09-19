"""
FULFILL-X Database ORM & Connection Unit Tests (Phase 2)
"""
import pytest
import pytest_asyncio
from app.db.session import check_database_health, Base
from app.models.db import (
    WorldSnapshotModel,
    SignalModel,
    RiskSnapshotModel,
    DataProvenanceModel,
)


@pytest.mark.asyncio
async def test_database_health_check():
    """Test health check query response."""
    health = await check_database_health()
    assert "status" in health
    assert "connected" in health
    assert "mode" in health


@pytest.mark.asyncio
async def test_orm_model_instantiation():
    """Test ORM model creation and schema metadata."""
    snap = WorldSnapshotModel(
        seed=42,
        preset="healthy",
        total_nodes=15,
        total_edges=18,
        network_health_score=0.95,
        data_payload={"nodes": {}, "edges": {}},
    )
    assert snap.seed == 42
    assert snap.network_health_score == 0.95

    sig = SignalModel(
        signal_type="WEATHER",
        severity="CRITICAL",
        title="Storm Warning",
        description="Typhoon approach",
        confidence=1.0,
        affected_node_ids=["port-001"],
        affected_edge_ids=[],
    )
    assert sig.signal_type == "WEATHER"
    assert sig.confidence == 1.0

    prov = DataProvenanceModel(
        entity_id="entity-test-01",
        entity_type="Signal",
        source_type="synthetic",
        collector="TestCollector",
        content_hash="abc123hash",
    )
    assert prov.entity_id == "entity-test-01"
    assert prov.content_hash == "abc123hash"
