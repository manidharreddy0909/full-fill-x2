"""
FULFILL-X Digital Twin & Monte Carlo Resilience REST API Endpoints (Phase 8)
Endpoints under /api/twin/*, /api/simulation/*, /api/resilience/*
Protected with SecurityContext, RBAC, tenant isolation, and validation.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_security_context
from app.schemas.auth import Permission, SecurityContext
from app.simulation.schemas import (
    CriticalityResult,
    DigitalTwinState,
    MonteCarloConfig,
    MonteCarloResult,
    ScenarioConfig,
    SimulationHorizon,
    SimulationRunResult,
    StrategyComparisonResult,
    StrategyConfig,
    StrategySimulationRequest,
    TwinCalibrationReport,
)
from app.simulation.service import DigitalTwinPlatformService

router = APIRouter(prefix="/api", tags=["Simulation & Digital Twin"])


class CreateTwinRequest(BaseModel):
    twin_id: Optional[str] = None
    seed: int = Field(default=42)


class RunSimulationRequest(BaseModel):
    twin_id: str = Field(default="DT-DEFAULT")
    scenario: ScenarioConfig
    horizon_hours: int = Field(default=72, ge=6, le=720)


class RunMonteCarloRequest(BaseModel):
    twin_id: str = Field(default="DT-DEFAULT")
    scenario: ScenarioConfig
    config: Optional[MonteCarloConfig] = None


class CalibrateTwinRequest(BaseModel):
    twin_id: str
    sim_run: SimulationRunResult
    observed_service_levels: List[float]
    observed_recovery_hours: float = Field(default=24.0)


@router.get("/twin/status", response_model=Dict[str, Any])
def get_twin_status(
    context: SecurityContext = Depends(get_security_context),
) -> Dict[str, Any]:
    if not context.has_permission(Permission.TWIN_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission TWIN_READ required")
    svc = DigitalTwinPlatformService.get_instance()
    return {
        "status": "OPERATIONAL",
        "active_twins": len(svc.twins),
        "engine_version": "1.0.0-phase8",
        "mode": "SIMULATION_ISOLATED",
    }


@router.post("/twin/create", response_model=Dict[str, Any])
def create_digital_twin(
    body: CreateTwinRequest,
    context: SecurityContext = Depends(get_security_context),
) -> Dict[str, Any]:
    if not context.has_permission(Permission.TWIN_CREATE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission TWIN_CREATE required")
    svc = DigitalTwinPlatformService.get_instance()
    twin = svc.create_twin(twin_id=body.twin_id, seed=body.seed)
    return {
        "twin_id": twin.twin_id,
        "world_snapshot_id": twin.world_snapshot_id,
        "graph_snapshot_id": twin.graph_snapshot_id,
        "twin_version": twin.twin_version,
        "seed": twin.seed,
    }


@router.get("/twin/{id}", response_model=Dict[str, Any])
def get_digital_twin(
    id: str,
    context: SecurityContext = Depends(get_security_context),
) -> Dict[str, Any]:
    if not context.has_permission(Permission.TWIN_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission TWIN_READ required")
    svc = DigitalTwinPlatformService.get_instance()
    twin = svc.get_twin(twin_id=id)
    state = twin.create_isolated_state()
    return {
        "twin_id": twin.twin_id,
        "world_snapshot_id": twin.world_snapshot_id,
        "graph_snapshot_id": twin.graph_snapshot_id,
        "nodes_count": len(state.nodes),
        "edges_count": len(state.edges),
        "production_mutation": state.production_mutation,
        "mode": state.mode,
    }


@router.post("/simulation/run", response_model=SimulationRunResult)
def run_simulation(
    body: RunSimulationRequest,
    context: SecurityContext = Depends(get_security_context),
) -> SimulationRunResult:
    if not context.has_permission(Permission.SIMULATION_RUN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission SIMULATION_RUN required")
    svc = DigitalTwinPlatformService.get_instance()
    return svc.run_single_simulation(
        twin_id=body.twin_id,
        scenario=body.scenario,
        horizon_hours=body.horizon_hours,
    )


@router.post("/simulation/monte-carlo", response_model=MonteCarloResult)
def run_monte_carlo(
    body: RunMonteCarloRequest,
    context: SecurityContext = Depends(get_security_context),
) -> MonteCarloResult:
    if not context.has_permission(Permission.SIMULATION_RUN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission SIMULATION_RUN required")
    svc = DigitalTwinPlatformService.get_instance()
    return svc.run_monte_carlo(
        twin_id=body.twin_id,
        scenario=body.scenario,
        config=body.config,
    )


@router.post("/resilience/analyze", response_model=List[CriticalityResult])
def analyze_resilience(
    body: RunMonteCarloRequest,
    context: SecurityContext = Depends(get_security_context),
) -> List[CriticalityResult]:
    if not context.has_permission(Permission.RESILIENCE_ANALYZE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission RESILIENCE_ANALYZE required")
    svc = DigitalTwinPlatformService.get_instance()
    mc_result = svc.run_monte_carlo(twin_id=body.twin_id, scenario=body.scenario, config=body.config)
    return svc.analyze_criticality(twin_id=body.twin_id, mc_result=mc_result)


@router.post("/resilience/compare-strategies", response_model=StrategyComparisonResult)
def compare_strategies(
    body: StrategySimulationRequest,
    context: SecurityContext = Depends(get_security_context),
) -> StrategyComparisonResult:
    if not context.has_permission(Permission.STRATEGY_SIMULATE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission STRATEGY_SIMULATE required")
    svc = DigitalTwinPlatformService.get_instance()
    return svc.compare_strategies(
        twin_id="DT-DEFAULT",
        scenario=body.scenario_config,
        candidate_strategies=body.candidate_strategies,
        mc_config=body.mc_config,
    )


@router.post("/twin/calibrate", response_model=TwinCalibrationReport)
def calibrate_twin(
    body: CalibrateTwinRequest,
    context: SecurityContext = Depends(get_security_context),
) -> TwinCalibrationReport:
    if not context.has_permission(Permission.TWIN_MANAGE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission TWIN_MANAGE required")
    svc = DigitalTwinPlatformService.get_instance()
    return svc.calibrate_twin(
        twin_id=body.twin_id,
        sim_result=body.sim_run,
        observed_service_levels=body.observed_service_levels,
        observed_recovery_hours=body.observed_recovery_hours,
    )
