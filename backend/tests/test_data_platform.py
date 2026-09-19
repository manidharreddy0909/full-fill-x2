"""
FULFILL-X Data Platform Service & API Unit Tests (Phase 2)
Tests provenance, quality checks, seeding, export/import, retention, and REST endpoints.
"""
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.data import DataPlatformService

client = TestClient(app)


@pytest.mark.asyncio
async def test_data_platform_service_status():
    """Test DataPlatformService get_status response."""
    service = DataPlatformService.get_instance()
    status = await service.get_status()
    assert status["mode"] in ("MEMORY", "POSTGRES")
    assert "record_counts" in status
    assert "retention_policy" in status


@pytest.mark.asyncio
async def test_data_quality_checks():
    """Test automated data quality validation checks."""
    service = DataPlatformService.get_instance()
    report = await service.run_data_quality_checks()
    assert report["status"] in ("PASSED", "WARNING")
    assert report["quality_score"] >= 0.0
    assert "findings" in report


@pytest.mark.asyncio
async def test_data_export_and_import():
    """Test JSON export and round-trip data import."""
    service = DataPlatformService.get_instance()
    
    # Export JSON
    exp_res = await service.export_data(format_type="json")
    assert exp_res["format"] == "json"
    assert "content" in exp_res

    # Import JSON
    imp_res = await service.import_data(content_str=exp_res["content"], format_type="json")
    assert imp_res["status"] == "IMPORTED"
    assert imp_res["nodes_imported"] > 0


@pytest.mark.asyncio
async def test_data_export_csv():
    """Test CSV export formatting."""
    service = DataPlatformService.get_instance()
    exp_res = await service.export_data(format_type="csv")
    assert exp_res["format"] == "csv"
    assert "Entity_Type" in exp_res["content"]


@pytest.mark.asyncio
async def test_data_platform_rest_endpoints():
    """Test Data Platform REST API endpoints."""
    # GET /api/data/status
    res_status = client.get("/api/data/status")
    assert res_status.status_code == 200
    assert "mode" in res_status.json()

    # GET /api/data/stats
    res_stats = client.get("/api/data/stats")
    assert res_stats.status_code == 200
    assert "counts" in res_stats.json()

    # GET /api/data/quality
    res_qual = client.get("/api/data/quality")
    assert res_qual.status_code == 200
    assert "quality_score" in res_qual.json()

    # GET /api/data/provenance
    res_prov = client.get("/api/data/provenance")
    assert res_prov.status_code == 200

    # POST /api/data/seed
    res_seed = client.post("/api/data/seed", json={"seed": 42, "preset": "healthy"})
    assert res_seed.status_code == 200
    assert res_seed.json()["status"] == "SEEDED"
