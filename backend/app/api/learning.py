"""
FULFILL-X Multi-Agent Resilience & Continuous Learning REST API Endpoints (Phase 9)
Endpoints under /api/agents/resilience/*, /api/agents/memory/*, /api/agents/performance/*, /api/outcomes/*, /api/feedback/*, /api/learning/*
Protected with SecurityContext, RBAC, tenant isolation, and validation.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, ConfigDict

from app.api.deps import get_security_context
from app.schemas.auth import Permission, SecurityContext
from app.agents.resilience.schemas import (
    AgentMemory,
    AgentPerformanceRecord,
    ChallengerModelRecord,
    DeliberationSession,
    FeedbackRecord,
    LearningDataset,
    LearningRunResult,
    MemoryType,
    OutcomeRecord,
    PolicyEvaluationRecord,
)
from app.agents.resilience.service import MultiAgentResilienceService

router = APIRouter(prefix="/api", tags=["Multi-Agent Resilience & Learning"])


class DeliberateRequest(BaseModel):
    target_node_ids: List[str] = Field(default_factory=lambda: ["sup-001", "port-001"])
    specialist_proposals: Optional[List[Dict[str, Any]]] = None


class AddMemoryRequest(BaseModel):
    agent_id: str
    lesson: str
    memory_type: MemoryType = MemoryType.LESSON
    event_reference: Optional[str] = None
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)


class RecordOutcomeRequest(BaseModel):
    decision_id: str
    expected_service_level: float = Field(ge=0.0, le=1.0)
    actual_service_level: float = Field(ge=0.0, le=1.0)
    expected_cost: float = Field(ge=0.0)
    actual_cost: float = Field(ge=0.0)
    expected_recovery_hours: float = Field(ge=0.0)
    actual_recovery_hours: float = Field(ge=0.0)


class TrainChallengerRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    dataset_name: str = Field(default="DemandOutcomeDataset")
    model_name: str = Field(default="DemandForecastModel")


class ActivateChallengerRequest(BaseModel):
    challenger_id: str
    approved_by: str = Field(default="Head of AI Operations")
    activation_reason: str = Field(default="Validated lower MAE baseline improvement")


class RollbackModelRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_name: str = Field(default="DemandForecastModel")
    approved_by: str = Field(default="Head of Operations")


class EvaluatePolicyRequest(BaseModel):
    situation: Dict[str, Any] = Field(default_factory=dict)
    candidate_actions: List[Dict[str, Any]] = Field(default_factory=list)


# 1. Deliberation
@router.post("/agents/resilience/deliberate", response_model=DeliberationSession)
def deliberate_resilience(
    body: DeliberateRequest,
    context: SecurityContext = Depends(get_security_context),
) -> DeliberationSession:
    if not context.has_permission(Permission.AGENT_DELIBERATE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission AGENT_DELIBERATE required")
    svc = MultiAgentResilienceService.get_instance()
    return svc.deliberate(
        organization_id=context.organization_id,
        target_node_ids=body.target_node_ids,
        specialist_proposals=body.specialist_proposals,
    )


# 2. Agent Memory
@router.post("/agents/memory", response_model=AgentMemory)
def add_agent_memory(
    body: AddMemoryRequest,
    context: SecurityContext = Depends(get_security_context),
) -> AgentMemory:
    if not context.has_permission(Permission.AGENT_MEMORY_WRITE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission AGENT_MEMORY_WRITE required")
    svc = MultiAgentResilienceService.get_instance()
    return svc.add_memory(
        agent_id=body.agent_id,
        lesson=body.lesson,
        organization_id=context.organization_id,
        memory_type=body.memory_type,
        event_reference=body.event_reference,
        confidence=body.confidence,
    )


@router.get("/agents/memory", response_model=List[AgentMemory])
def query_agent_memories(
    agent_id: Optional[str] = None,
    context: SecurityContext = Depends(get_security_context),
) -> List[AgentMemory]:
    if not context.has_permission(Permission.AGENT_MEMORY_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission AGENT_MEMORY_READ required")
    svc = MultiAgentResilienceService.get_instance()
    return svc.query_memories(
        organization_id=context.organization_id,
        agent_id=agent_id,
    )


@router.post("/agents/memory/validate", response_model=Dict[str, Any])
def validate_agent_memory(
    memory_id: str,
    context: SecurityContext = Depends(get_security_context),
) -> Dict[str, Any]:
    if not context.has_permission(Permission.AGENT_MEMORY_WRITE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission AGENT_MEMORY_WRITE required")
    svc = MultiAgentResilienceService.get_instance()
    mem = svc.validate_memory(memory_id=memory_id)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory record not found")
    return {"status": "VALIDATED", "memory_id": mem.memory_id, "confidence": mem.confidence}


# 3. Agent Performance
@router.get("/agents/performance", response_model=List[AgentPerformanceRecord])
def get_all_agent_performance(
    context: SecurityContext = Depends(get_security_context),
) -> List[AgentPerformanceRecord]:
    if not context.has_permission(Permission.AGENT_PERFORMANCE_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission AGENT_PERFORMANCE_READ required")
    svc = MultiAgentResilienceService.get_instance()
    return svc.get_all_agent_performance()


@router.get("/agents/performance/{agent_id}", response_model=AgentPerformanceRecord)
def get_agent_performance(
    agent_id: str,
    context: SecurityContext = Depends(get_security_context),
) -> AgentPerformanceRecord:
    if not context.has_permission(Permission.AGENT_PERFORMANCE_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission AGENT_PERFORMANCE_READ required")
    svc = MultiAgentResilienceService.get_instance()
    rec = svc.get_agent_performance(agent_id=agent_id)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Performance record for agent '{agent_id}' not found")
    return rec


# 4. Outcomes & Feedback
@router.post("/outcomes", response_model=Dict[str, Any])
def record_outcome(
    body: RecordOutcomeRequest,
    context: SecurityContext = Depends(get_security_context),
) -> Dict[str, Any]:
    if not context.has_permission(Permission.OUTCOME_WRITE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission OUTCOME_WRITE required")
    svc = MultiAgentResilienceService.get_instance()
    out, fbk = svc.record_outcome(
        decision_id=body.decision_id,
        expected_service_level=body.expected_service_level,
        actual_service_level=body.actual_service_level,
        expected_cost=body.expected_cost,
        actual_cost=body.actual_cost,
        expected_recovery_hours=body.expected_recovery_hours,
        actual_recovery_hours=body.actual_recovery_hours,
        organization_id=context.organization_id,
    )
    return {"outcome": out, "feedback": fbk}


@router.get("/outcomes", response_model=List[OutcomeRecord])
def list_outcomes(
    context: SecurityContext = Depends(get_security_context),
) -> List[OutcomeRecord]:
    if not context.has_permission(Permission.OUTCOME_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission OUTCOME_READ required")
    svc = MultiAgentResilienceService.get_instance()
    return svc.list_outcomes(organization_id=context.organization_id)


@router.get("/feedback", response_model=List[FeedbackRecord])
def list_feedback(
    context: SecurityContext = Depends(get_security_context),
) -> List[FeedbackRecord]:
    if not context.has_permission(Permission.FEEDBACK_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission FEEDBACK_READ required")
    svc = MultiAgentResilienceService.get_instance()
    return svc.list_feedback(organization_id=context.organization_id)


# 5. Continuous Learning & Challenger Governance
@router.post("/learning/train", response_model=Dict[str, Any])
def train_challenger_model(
    body: TrainChallengerRequest,
    context: SecurityContext = Depends(get_security_context),
) -> Dict[str, Any]:
    if not context.has_permission(Permission.LEARNING_TRAIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission LEARNING_TRAIN required")
    svc = MultiAgentResilienceService.get_instance()
    chal, run = svc.train_challenger(
        dataset_name=body.dataset_name,
        model_name=body.model_name,
        organization_id=context.organization_id,
    )
    return {"challenger": chal, "learning_run": run}


@router.post("/learning/candidates/activate", response_model=ChallengerModelRecord)
def activate_challenger_model(
    body: ActivateChallengerRequest,
    context: SecurityContext = Depends(get_security_context),
) -> ChallengerModelRecord:
    if not context.has_permission(Permission.LEARNING_ACTIVATE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission LEARNING_ACTIVATE required")
    svc = MultiAgentResilienceService.get_instance()
    return svc.activate_challenger(
        challenger_id=body.challenger_id,
        approved_by=body.approved_by,
        activation_reason=body.activation_reason,
    )


@router.post("/learning/rollback", response_model=Dict[str, Any])
def rollback_active_model(
    body: RollbackModelRequest,
    context: SecurityContext = Depends(get_security_context),
) -> Dict[str, Any]:
    if not context.has_permission(Permission.LEARNING_ACTIVATE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission LEARNING_ACTIVATE required")
    svc = MultiAgentResilienceService.get_instance()
    prev_id = svc.rollback_model(model_name=body.model_name, approved_by=body.approved_by)
    return {"status": "ROLLED_BACK", "model_name": body.model_name, "reverted_to_model_id": prev_id}


@router.post("/learning/policies/evaluate", response_model=PolicyEvaluationRecord)
def evaluate_policy(
    body: EvaluatePolicyRequest,
    context: SecurityContext = Depends(get_security_context),
) -> PolicyEvaluationRecord:
    if not context.has_permission(Permission.LEARNING_EVALUATE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission LEARNING_EVALUATE required")
    svc = MultiAgentResilienceService.get_instance()
    return svc.evaluate_policy(situation=body.situation, candidate_actions=body.candidate_actions)
