"""
FULFILL-X Data Platform REST API Router (Phase 2)
Provides operational endpoints for data status, quality, provenance, history, seeding, export, import, and purging.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Response, Body
from pydantic import BaseModel
from app.services.data import DataPlatformService

router = APIRouter(prefix="/api/data", tags=["Data Platform"])


class SeedRequest(BaseModel):
    seed: int = 42
    preset: str = "healthy"


class ExportRequest(BaseModel):
    format: str = "json"  # "json", "jsonl", "csv"


class ImportRequest(BaseModel):
    content: str
    format: str = "json"


@router.get("/status")
async def get_data_platform_status():
    """Return persistence status, database health, record counts, and retention settings."""
    service = DataPlatformService.get_instance()
    return await service.get_status()


@router.get("/stats")
async def get_data_platform_stats():
    """Return aggregated record counts and storage statistics."""
    service = DataPlatformService.get_instance()
    status = await service.get_status()
    return {
        "mode": status["mode"],
        "connected": status["database_connected"],
        "counts": status["record_counts"],
    }


@router.get("/provenance")
async def list_data_provenance(limit: int = Query(default=50, ge=1, le=500)):
    """List data provenance records tracking dataset lineage, content hashes, and licenses."""
    service = DataPlatformService.get_instance()
    records = await service.list_provenance(limit=limit)
    return {"total": len(records), "provenance_records": records}


@router.get("/quality")
async def run_data_quality_report():
    """Execute automated data quality, orphan reference, and checksum validation checks."""
    service = DataPlatformService.get_instance()
    return await service.run_data_quality_checks()


@router.get("/history/signals")
async def list_signals_history():
    """Fetch historical disruption signals."""
    service = DataPlatformService.get_instance()
    signals = service.risk_repo.list_signals()
    return {
        "total": len(signals),
        "signals": [s.model_dump(mode="json") for s in signals],
    }


@router.get("/history/risks")
async def get_risk_history():
    """Fetch current and historical risk scores."""
    service = DataPlatformService.get_instance()
    rm = service.risk_repo.get_risk_map()
    return {
        "overall_risk_level": rm.overall_risk_level.value if hasattr(rm.overall_risk_level, "value") else str(rm.overall_risk_level),
        "average_risk_score": rm.average_risk_score,
        "nodes_affected_count": len(rm.node_risks),
        "node_risks": {k: v.model_dump(mode="json") for k, v in rm.node_risks.items()},
    }


@router.post("/seed")
async def seed_data_platform(req: SeedRequest):
    """Reseed world state deterministically."""
    service = DataPlatformService.get_instance()
    return await service.seed_database(seed=req.seed, preset=req.preset)


@router.post("/export")
async def export_data_platform(req: ExportRequest):
    """Export system data to JSON, JSONL, or CSV format."""
    service = DataPlatformService.get_instance()
    try:
        export_res = await service.export_data(format_type=req.format)
        return Response(
            content=export_res["content"],
            media_type=export_res["content_type"],
            headers={"Content-Disposition": f'attachment; filename="{export_res["filename"]}"'},
        )
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))


@router.post("/import")
async def import_data_platform(req: ImportRequest):
    """Import system data from JSON payload."""
    service = DataPlatformService.get_instance()
    try:
        return await service.import_data(content_str=req.content, format_type=req.format)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))


@router.post("/purge")
async def purge_retention_data():
    """Purge data older than configured retention policy thresholds."""
    service = DataPlatformService.get_instance()
    return await service.purge_retention_data()
