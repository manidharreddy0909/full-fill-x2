"""
FULFILL-X Execution Safety Plane (Phase 10)
Safe-by-design execution provider interface enforcing DRY_RUN mode by default.
"""
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from uuid import uuid4
from pydantic import BaseModel, Field

from app.models.enterprise import ExecutionMode, ExecutionStatus


class ExecutionRequest(BaseModel):
    decision_id: str
    organization_id: str = "org-fulfillx-default"
    workspace_id: str = "ws-default"
    authorized_by: str = Field(..., description="Human operator signature")
    execution_mode: ExecutionMode = ExecutionMode.DRY_RUN
    candidate_plan: Dict[str, Any] = Field(default_factory=dict)
    policy_verified: bool = True
    human_approved: bool = True


class ExecutionResult(BaseModel):
    execution_id: str = Field(default_factory=lambda: f"exec-{uuid4().hex[:10]}")
    decision_id: str
    organization_id: str
    workspace_id: str
    execution_mode: ExecutionMode
    status: ExecutionStatus
    authorized_by: str
    result_summary: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ExecutionProvider(ABC):
    @abstractmethod
    async def execute_plan(self, req: ExecutionRequest) -> ExecutionResult:
        pass


class MockExecutionProvider(ExecutionProvider):
    """
    Default safe mock execution provider performing simulated or dry-run execution.
    """

    async def execute_plan(self, req: ExecutionRequest) -> ExecutionResult:
        if not req.human_approved:
            return ExecutionResult(
                decision_id=req.decision_id,
                organization_id=req.organization_id,
                workspace_id=req.workspace_id,
                execution_mode=req.execution_mode,
                status=ExecutionStatus.CANCELLED,
                authorized_by=req.authorized_by,
                result_summary="Execution rejected: Human operator approval is required.",
            )

        if not req.policy_verified:
            return ExecutionResult(
                decision_id=req.decision_id,
                organization_id=req.organization_id,
                workspace_id=req.workspace_id,
                execution_mode=req.execution_mode,
                status=ExecutionStatus.FAILED,
                authorized_by=req.authorized_by,
                result_summary="Execution blocked: Policy evaluation failed or returned BLOCK.",
            )

        if req.execution_mode == ExecutionMode.DRY_RUN:
            summary = (
                f"DRY RUN PASSED: Decision {req.decision_id} validated. "
                f"No real-world state mutated. Actions verified for target nodes."
            )
        elif req.execution_mode == ExecutionMode.SIMULATED:
            summary = (
                f"SIMULATED EXECUTION COMPLETED: Applied plan to isolated Digital Twin sandbox. "
                f"State updated in simulation mode."
            )
        else:
            summary = (
                f"LIVE EXECUTION COMPLETED (DRY-RUN PROTECTED): Simulated live execution "
                f"by operator '{req.authorized_by}'."
            )

        return ExecutionResult(
            decision_id=req.decision_id,
            organization_id=req.organization_id,
            workspace_id=req.workspace_id,
            execution_mode=req.execution_mode,
            status=ExecutionStatus.COMPLETED,
            authorized_by=req.authorized_by,
            result_summary=summary,
        )
