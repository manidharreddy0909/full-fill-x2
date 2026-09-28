"""
FULFILL-X Skills REST API (Phase 3)
"""
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.skills.registry import skill_registry
from app.skills.service import SkillOrchestrationService

logger = logging.getLogger("fulfill-x.api.skills")
router = APIRouter(prefix="/api/skills", tags=["Resilience Skills"])


class ValidateSkillRequest(BaseModel):
    skill_id: str
    world_state: Optional[Dict[str, Any]] = None
    scenario: Optional[Dict[str, Any]] = None


class EvaluateApplicabilityRequest(BaseModel):
    skill_id: str
    world_state: Dict[str, Any]
    scenario: Optional[Dict[str, Any]] = None


class ProcessOutcomeRequest(BaseModel):
    skill_id: str
    experience_id: str
    predicted_recovery_hours: Optional[float] = None
    actual_recovery_hours: Optional[float] = None
    predicted_recovery_pct: Optional[float] = None
    actual_recovery_pct: Optional[float] = None
    demand_surge_factor: Optional[float] = None


@router.get("/list")
def list_skills():
    """List all registered skills."""
    skills = skill_registry.list_all()
    return {"skills": [s.model_dump() for s in skills], "total": len(skills)}


@router.get("/active")
def list_active_skills():
    """List all active/validated skills."""
    skills = skill_registry.list_active()
    return {"skills": [s.model_dump() for s in skills], "total": len(skills)}


@router.get("/{skill_id}")
def get_skill(skill_id: str):
    """Get a specific skill by ID."""
    skill = skill_registry.get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill not found: {skill_id}")
    return skill.model_dump()


@router.get("/{skill_id}/history")
def get_skill_version_history(skill_id: str):
    """Get complete version history for a skill."""
    history = skill_registry.version_history(skill_id)
    if not history:
        raise HTTPException(status_code=404, detail=f"Skill not found: {skill_id}")
    return {"version_history": [s.model_dump() for s in history], "versions_count": len(history)}


@router.post("/validate")
async def validate_skill(request: ValidateSkillRequest):
    """Validate a skill through simulation."""
    skill = skill_registry.get(request.skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill not found: {request.skill_id}")
    service = SkillOrchestrationService.get_instance()
    updated_skill = await service.validate_skill(skill, request.world_state, request.scenario)
    return {
        "skill_id": updated_skill.skill_id,
        "validation_status": updated_skill.validation_status.value,
        "lifecycle_status": updated_skill.lifecycle_status.value,
        "validation_history": [v.model_dump() for v in updated_skill.validation_history],
    }


@router.post("/evaluate-applicability")
def evaluate_applicability(request: EvaluateApplicabilityRequest):
    """Evaluate whether a skill is applicable to current conditions."""
    skill = skill_registry.get(request.skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill not found: {request.skill_id}")
    service = SkillOrchestrationService.get_instance()
    report = service.evaluate_applicability(skill, request.world_state, request.scenario)
    return report.model_dump()


@router.post("/process-outcome")
async def process_outcome(request: ProcessOutcomeRequest):
    """Process an actual outcome against a skill's prediction."""
    skill = skill_registry.get(request.skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill not found: {request.skill_id}")
    service = SkillOrchestrationService.get_instance()
    outcome_eval, proposal = await service.process_outcome(
        skill=skill,
        experience_id=request.experience_id,
        predicted_recovery_hours=request.predicted_recovery_hours,
        actual_recovery_hours=request.actual_recovery_hours,
        predicted_recovery_pct=request.predicted_recovery_pct,
        actual_recovery_pct=request.actual_recovery_pct,
        demand_surge_factor=request.demand_surge_factor,
    )
    return {
        "outcome_evaluation": outcome_eval.model_dump(),
        "evolution_proposal": proposal.model_dump() if proposal else None,
    }


@router.post("/canonical-demo")
async def run_canonical_demo():
    """Run the canonical Phase 3 Supplier B demonstration."""
    service = SkillOrchestrationService.get_instance()
    result = await service.run_canonical_phase3_demo()
    return result
