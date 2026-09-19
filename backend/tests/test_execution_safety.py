"""
FULFILL-X Execution Safety Plane Unit Tests (Phase 10)
"""
import pytest
from app.execution.safety import MockExecutionProvider, ExecutionRequest
from app.models.enterprise import ExecutionMode, ExecutionStatus


@pytest.mark.asyncio
async def test_execution_safety_dry_run_mode():
    provider = MockExecutionProvider()
    req = ExecutionRequest(
        decision_id="DEC-EXEC-01",
        authorized_by="Lead Operator",
        execution_mode=ExecutionMode.DRY_RUN,
        human_approved=True,
        policy_verified=True,
    )
    result = await provider.execute_plan(req)
    assert result.status == ExecutionStatus.COMPLETED
    assert result.execution_mode == ExecutionMode.DRY_RUN
    assert "DRY RUN PASSED" in result.result_summary


@pytest.mark.asyncio
async def test_execution_safety_blocks_unapproved():
    provider = MockExecutionProvider()
    req = ExecutionRequest(
        decision_id="DEC-EXEC-UNAPPROVED",
        authorized_by="Unauthorized Agent",
        execution_mode=ExecutionMode.LIVE,
        human_approved=False,
        policy_verified=True,
    )
    result = await provider.execute_plan(req)
    assert result.status == ExecutionStatus.CANCELLED
    assert "Human operator approval is required" in result.result_summary


@pytest.mark.asyncio
async def test_execution_safety_blocks_policy_failed():
    provider = MockExecutionProvider()
    req = ExecutionRequest(
        decision_id="DEC-EXEC-BAD-POLICY",
        authorized_by="Lead Operator",
        execution_mode=ExecutionMode.LIVE,
        human_approved=True,
        policy_verified=False,
    )
    result = await provider.execute_plan(req)
    assert result.status == ExecutionStatus.FAILED
    assert "Policy evaluation failed" in result.result_summary
