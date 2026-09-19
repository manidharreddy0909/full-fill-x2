"""
FULFILL-X Master Resilience OS Control Plane Unit & Integration Tests (Phase 10)
"""
import pytest
from app.services.resilience_os import ResilienceOSService
from app.models.enterprise import CycleStage, ExecutionMode


@pytest.mark.asyncio
async def test_resilience_scorecard_calculation():
    svc = ResilienceOSService.get_instance()
    card = svc.calculate_scorecard()
    assert 0.0 <= card.overall_resilience <= 1.0
    assert card.service_resilience > 0.0
    assert card.prediction_confidence > 0.0
    assert card.data_quality_score > 0.0


@pytest.mark.asyncio
async def test_resilience_cycle_execution_and_decision_record():
    svc = ResilienceOSService.get_instance()
    status = await svc.execute_resilience_cycle(
        organization_id="org-tenant-alpha",
        workspace_id="ws-production-01",
        target_node_ids=["sup-001", "port-001"],
        authorized_by="Lead Operator",
        execution_mode=ExecutionMode.DRY_RUN,
    )

    assert status.stage == CycleStage.COMPLETE
    assert status.completed_at is not None
    assert status.executive_record is not None
    assert status.executive_record.organization_id == "org-tenant-alpha"
    assert status.executive_record.workspace_id == "ws-production-01"
    assert status.executive_record.execution_mode == "DRY_RUN"
    assert status.executive_record.verification_passed is True
