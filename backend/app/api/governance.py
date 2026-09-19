"""
FULFILL-X Enterprise Governance & Policy REST API Router (Phase 10)
Exposes endpoints under /api/policies/*, /api/execution/*, /api/governance/*
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_security_context
from app.schemas.auth import Permission, SecurityContext
from app.models.enterprise import ExecutionMode
from app.governance.policy_engine import PolicyEngine, PolicyEvaluationResult
from app.execution.safety import MockExecutionProvider, ExecutionRequest, ExecutionResult
from app.governance.model_card import ModelGovernanceEngine, ModelCard
from app.governance.data_retention import DataGovernanceEngine, DataCategory, PurgeEvaluationResult

router = APIRouter(prefix="/api", tags=["Enterprise Governance & Policy"])


class EvaluatePolicyRequest(BaseModel):
    decision_id: str
    candidate_plan: Optional[Dict[str, Any]] = None
    simulation_summary: Optional[Dict[str, Any]] = None


class AuthorizeExecutionRequest(BaseModel):
    decision_id: str
    authorized_by: str = Field(default="Head of Operations")
    execution_mode: ExecutionMode = ExecutionMode.DRY_RUN
    candidate_plan: Dict[str, Any] = Field(default_factory=dict)
    policy_verified: bool = True
    human_approved: bool = True


@router.post("/policies/evaluate", response_model=PolicyEvaluationResult)
def evaluate_policy(
    body: EvaluatePolicyRequest,
    context: SecurityContext = Depends(get_security_context),
) -> PolicyEvaluationResult:
    if not context.has_permission(Permission.POLICY_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission POLICY_READ required")
    engine = PolicyEngine()
    return engine.evaluate_decision(
        decision_id=body.decision_id,
        organization_id=context.organization_id,
        workspace_id=context.workspace_id,
        candidate_plan=body.candidate_plan,
        simulation_summary=body.simulation_summary,
    )


@router.post("/execution/authorize", response_model=ExecutionResult)
async def authorize_execution(
    body: AuthorizeExecutionRequest,
    context: SecurityContext = Depends(get_security_context),
) -> ExecutionResult:
    if not context.has_permission(Permission.EXECUTION_AUTHORIZE):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission EXECUTION_AUTHORIZE required")
    provider = MockExecutionProvider()
    req = ExecutionRequest(
        decision_id=body.decision_id,
        organization_id=context.organization_id,
        workspace_id=context.workspace_id,
        authorized_by=body.authorized_by,
        execution_mode=body.execution_mode,
        candidate_plan=body.candidate_plan,
        policy_verified=body.policy_verified,
        human_approved=body.human_approved,
    )
    return await provider.execute_plan(req)


@router.get("/governance/model-card/{model_name}", response_model=ModelCard)
def get_model_card(
    model_name: str,
    version: str = "1.0.0",
    context: SecurityContext = Depends(get_security_context),
) -> ModelCard:
    if not context.has_permission(Permission.GOVERNANCE_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission GOVERNANCE_READ required")
    engine = ModelGovernanceEngine()
    return engine.generate_model_card(
        model_name=model_name,
        version=version,
        checksum="sha256-a1b2c3d4e5f67890",
        evaluation_metrics={"val_mae": 0.042, "val_rmse": 0.058, "accuracy": 0.941},
        status="ACTIVE",
    )


@router.get("/governance/data-retention/evaluate", response_model=PurgeEvaluationResult)
def evaluate_data_retention(
    category: DataCategory = DataCategory.EVENTS,
    context: SecurityContext = Depends(get_security_context),
) -> PurgeEvaluationResult:
    if not context.has_permission(Permission.GOVERNANCE_READ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission GOVERNANCE_READ required")
    engine = DataGovernanceEngine()
    return engine.evaluate_retention(category=category, record_timestamps=[])
