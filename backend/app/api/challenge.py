"""
FULFILL-X Challenge Engine REST API Router (Phase 4)
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.challenge.service import challenge_service
from app.challenge.models import (
    ChallengeResult,
    GradientProbeResult,
    CounterfactualComparison,
    ChallengeMetrics,
    ChallengeScenarioType,
)
from app.skills.registry import skill_registry

router = APIRouter(prefix="/api/challenge", tags=["challenge"])


class RunChallengeRequest(BaseModel):
    skill_id: str
    scenario_type: ChallengeScenarioType = ChallengeScenarioType.BOUNDARY_TEST
    parameter: str = "capacity"
    test_value: float = 0.38
    demand_surge_factor: float = 1.0
    run_counterfactual: bool = True
    alternative_strategy: str = "Emergency Inventory Draw (Warehouse C Reserves)"


class GradientProbeRequest(BaseModel):
    skill_id: str
    parameter: str = "capacity"
    values: Optional[List[float]] = None


class CounterfactualRequest(BaseModel):
    skill_id: str
    world_state: Dict[str, Any] = Field(default_factory=dict)
    alternative_strategy: str = "Emergency Inventory Draw (Warehouse C Reserves)"


@router.get("/status")
async def get_challenge_engine_status():
    """Returns operational status and active active-learning metrics."""
    return {
        "status": "ONLINE",
        "phase": "Phase 4 — Challenge Engine, Counterfactual Learning & Adaptive Autonomy",
        "history_count": len(challenge_service.history),
        "metrics": challenge_service.metrics.model_dump(),
    }


@router.get("/metrics", response_model=ChallengeMetrics)
async def get_challenge_metrics():
    """Returns measurable outputs for active learning."""
    return challenge_service.metrics


@router.get("/history", response_model=List[ChallengeResult])
async def get_challenge_history(limit: int = Query(50, ge=1, le=200)):
    """Returns chronological challenge test history."""
    return challenge_service.history[-limit:]


@router.post("/run", response_model=ChallengeResult)
async def run_challenge(request: RunChallengeRequest):
    """Execute a single structured challenge against a skill."""
    skill = skill_registry.get(request.skill_id)
    if not skill:
        # Fallback to first available or raise
        active = skill_registry.list_active()
        if active:
            skill = active[0]
        else:
            raise HTTPException(status_code=404, detail=f"Skill '{request.skill_id}' not found")

    # Generate scenario
    if request.scenario_type == ChallengeScenarioType.BOUNDARY_TEST:
        sc = challenge_service.generator.generate_boundary_challenge(
            skill=skill,
            parameter=request.parameter,
            boundary_threshold=0.40,
            probe_below=(request.test_value < 0.40),
            delta=abs(round(0.40 - request.test_value, 3)),
        )
        sc.perturbations[request.parameter] = request.test_value
        sc.perturbations["demand_surge_factor"] = request.demand_surge_factor
    elif request.scenario_type == ChallengeScenarioType.DEMAND_SURGE:
        sc = challenge_service.generator.generate_demand_surge_challenge(
            skill=skill,
            surge_factor=request.demand_surge_factor,
        )
        sc.perturbations[request.parameter] = request.test_value
    elif request.scenario_type == ChallengeScenarioType.NOVEL_CONDITION:
        sc = challenge_service.generator.generate_novel_condition_challenge(skill=skill)
    elif request.scenario_type == ChallengeScenarioType.DEPENDENCY_FAILURE:
        sc = challenge_service.generator.generate_dependency_failure_challenge(skill=skill)
    elif request.scenario_type == ChallengeScenarioType.TOPOLOGY_CHANGE:
        sc = challenge_service.generator.generate_topology_change_challenge(skill=skill)
    elif request.scenario_type == ChallengeScenarioType.STALE_EVIDENCE:
        sc = challenge_service.generator.generate_stale_evidence_challenge(skill=skill)
    elif request.scenario_type == ChallengeScenarioType.CONFLICTING_EVIDENCE:
        sc = challenge_service.generator.generate_conflicting_evidence_challenge(skill=skill)
    else:
        sc = challenge_service.generator.generate_capacity_degradation_challenge(skill=skill)

    result = await challenge_service.run_challenge(
        skill=skill,
        scenario=sc,
        run_counterfactual=request.run_counterfactual,
        alternative_strategy=request.alternative_strategy,
    )
    return result


@router.post("/gradient-probe", response_model=GradientProbeResult)
async def run_gradient_probe(request: GradientProbeRequest):
    """Execute controlled boundary probing along a parameter gradient."""
    skill = skill_registry.get(request.skill_id)
    if not skill:
        active = skill_registry.list_active()
        if active:
            skill = active[0]
        else:
            raise HTTPException(status_code=404, detail=f"Skill '{request.skill_id}' not found")

    result = await challenge_service.run_gradient_probe(
        skill=skill,
        parameter=request.parameter,
        values=request.values,
    )
    return result


@router.post("/counterfactual", response_model=CounterfactualComparison)
async def evaluate_counterfactual(request: CounterfactualRequest):
    """Compare a skill against an alternative strategy."""
    skill = skill_registry.get(request.skill_id)
    if not skill:
        active = skill_registry.list_active()
        if active:
            skill = active[0]
        else:
            raise HTTPException(status_code=404, detail=f"Skill '{request.skill_id}' not found")

    result = challenge_service.counterfactual_engine.evaluate_counterfactual(
        skill=skill,
        scenario_id="req-" + request.skill_id,
        world_state=request.world_state,
        alternative_strategy=request.alternative_strategy,
    )
    return result


@router.post("/canonical-demo")
async def run_canonical_demo():
    """Execute the canonical 4-step Phase 4 demonstration."""
    return await challenge_service.run_canonical_phase4_demo()
