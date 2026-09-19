"""
FULFILL-X Real-World Data Ingestion REST API Router (Phase 4)
Matching docs/DATA_API.md
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.api.deps import get_security_context, require_permission
from app.adapters.registry import AdapterRegistry
from app.schemas.auth import Permission, SecurityContext
from app.schemas.data_ingestion import (
    DataSourceConfig,
    ExternalObservation,
    ExternalSignal,
    IngestionRunSummary,
    DataQualityReport,
    EntityResolutionCandidate,
    DataReplayRequest,
    IngestionMode,
)
from app.services.ingestion import RealDataIngestionService
from app.services.data_quality import DataQualityEngine
from app.services.entity_resolution import EntityResolutionService
from app.services.data_replay import DataReplayService

router = APIRouter(prefix="/api/data", tags=["Real-World Data & Ingestion"])

registry = AdapterRegistry.get_instance()
ingestion_service = RealDataIngestionService.get_instance()
entity_resolution_service = EntityResolutionService()
replay_service = DataReplayService.get_instance()


@router.get("/sources", response_model=dict)
async def list_data_sources(
    ctx: SecurityContext = Depends(get_security_context),
):
    """List all registered data sources and health configurations."""
    configs = registry.list_configs()
    return {
        "status": "SUCCESS",
        "mode": registry.mode.value,
        "count": len(configs),
        "data": configs,
    }


@router.post("/sources/mode", response_model=dict)
async def set_ingestion_mode(
    mode: IngestionMode,
    ctx: SecurityContext = Depends(get_security_context),
    _: None = Depends(require_permission(Permission.DATA_IMPORT)),
):
    """Set active ingestion mode (LIVE, HYBRID, OFFLINE)."""
    registry.set_ingestion_mode(mode)
    return {
        "status": "SUCCESS",
        "message": f"Ingestion mode updated to '{mode.value}'",
        "mode": mode.value,
    }


@router.post("/ingest/run", response_model=dict)
async def trigger_ingestion_run(
    source_id: Optional[str] = Query(default=None),
    ctx: SecurityContext = Depends(get_security_context),
    _: None = Depends(require_permission(Permission.DATA_IMPORT)),
):
    """Manually trigger ingestion run for a single source or all sources."""
    if source_id:
        summary = await ingestion_service.run_ingestion_for_source(
            source_id=source_id, organization_id=ctx.organization_id
        )
        return {"status": "SUCCESS", "data": summary}
    else:
        summaries = await ingestion_service.run_all_sources(organization_id=ctx.organization_id)
        return {"status": "SUCCESS", "count": len(summaries), "data": summaries}


@router.get("/observations", response_model=dict)
async def list_observations(
    ctx: SecurityContext = Depends(get_security_context),
):
    """List ingested external observations."""
    obs = ingestion_service.list_observations()
    return {"status": "SUCCESS", "count": len(obs), "data": obs}


@router.get("/signals", response_model=dict)
async def list_external_signals(
    ctx: SecurityContext = Depends(get_security_context),
):
    """List validated external disruption signals."""
    signals = ingestion_service.list_signals()
    return {"status": "SUCCESS", "count": len(signals), "data": signals}


@router.get("/quality", response_model=dict)
async def list_quality_reports(
    ctx: SecurityContext = Depends(get_security_context),
):
    """List data quality evaluation reports."""
    reports = ingestion_service.list_quality_reports()
    return {"status": "SUCCESS", "count": len(reports), "data": reports}


@router.post("/entity-resolution/resolve", response_model=dict)
async def resolve_external_entity(
    entity_name: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    ctx: SecurityContext = Depends(get_security_context),
):
    """Resolve an external entity string/location to a canonical graph node ID."""
    candidate = entity_resolution_service.resolve_entity(
        organization_id=ctx.organization_id,
        entity_name=entity_name,
        latitude=latitude,
        longitude=longitude,
    )
    return {"status": "SUCCESS", "data": candidate}


@router.post("/replay/run", response_model=dict)
async def run_data_replay(
    req: DataReplayRequest,
    ctx: SecurityContext = Depends(get_security_context),
    _: None = Depends(require_permission(Permission.DATA_IMPORT)),
):
    """Execute historical data replay session."""
    req.organization_id = ctx.organization_id
    res = await replay_service.run_replay(req)
    return {"status": "SUCCESS", "data": res}
