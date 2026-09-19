"""
FULFILL-X Real-World Data Ingestion & Quality Engine Tests (Phase 4)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ingestion import RealDataIngestionService
from app.services.data_quality import DataQualityEngine
from app.services.entity_resolution import EntityResolutionService
from app.services.data_replay import DataReplayService
from datetime import datetime, timezone
from app.schemas.data_ingestion import ExternalObservation, DataReplayRequest

client = TestClient(app)


def test_data_quality_engine():
    """Verify DataQualityEngine evaluation scores."""
    engine = DataQualityEngine()
    obs = [
        ExternalObservation(
            organization_id="org-test",
            source_id="src-test",
            source_record_id="rec-001",
            observed_at=datetime.now(timezone.utc),
            latitude=51.92,
            longitude=4.47,
            observation_type="TEST_OBS",
            provenance_id="prov-001",
        )
    ]
    report = engine.evaluate_observations("org-test", "src-test", "run-001", obs)
    assert report.completeness_score == 1.0
    assert report.validity_score == 1.0
    assert report.status.value in ["VALID", "DEGRADED"]


def test_entity_resolution_service():
    """Verify EntityResolutionService alias and spatial matching."""
    service = EntityResolutionService()

    # Alias match
    cand_alias = service.resolve_entity("org-test", "Port of Rotterdam")
    assert cand_alias.match_status.value == "RESOLVED"
    assert cand_alias.matched_node_id == "port-rotterdam"

    # Spatial match
    cand_spatial = service.resolve_entity("org-test", "Unknown Cargo Hub", latitude=51.9, longitude=4.4)
    assert cand_spatial.match_status.value in ["RESOLVED", "NEEDS_REVIEW"]


@pytest.mark.asyncio
async def test_real_data_ingestion_service_loop():
    """Verify end-to-end ingestion pipeline execution."""
    service = RealDataIngestionService.get_instance()
    summary = await service.run_ingestion_for_source("src-weather-openmeteo")
    assert summary is not None
    assert summary.records_processed > 0
    assert summary.status in ["SUCCESS", "DEGRADED"]


@pytest.mark.asyncio
async def test_data_replay_service():
    """Verify historical data replay execution."""
    service = DataReplayService.get_instance()
    req = DataReplayRequest(organization_id="org-test", seed=42)
    result = await service.run_replay(req)
    assert result["status"] == "COMPLETED"
    assert result["runs_executed"] > 0
