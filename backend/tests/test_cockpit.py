"""
FULFILL-X Decision Cockpit Unit & Integration Tests (Phase 10)
Tests schemas, workflow state machine, orchestration service, evidence chain, approval/rejection gates, audit trail, REST APIs, and state mutation safety.
"""
import pytest
from fastapi.testclient import TestClient

from app.schemas.cockpit import (
    DecisionStage,
    DecisionStageStatus,
    DecisionWorkflowStatus,
    DecisionSession,
    SessionCreateRequest,
    SessionRunRequest,
    SessionApproveRequest,
    SessionRejectRequest,
    ApprovalDecision,
    ExecutiveSummary,
)
from app.schemas.verification import VerificationStatus
from app.services.cockpit import CockpitService
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.main import app


@pytest.fixture
def test_client():
    return TestClient(app)


def test_cockpit_schemas():
    """Test schema defaults and validation."""
    summary = ExecutiveSummary(
        network_health_score=0.92,
        critical_risk_count=1,
        affected_node_count=3,
        active_disruption_count=2,
        specialist_proposal_count=16,
        candidate_plan_count=3,
        adversarial_vulnerability_count=2,
        pareto_candidate_count=2,
        verification_status=VerificationStatus.VERIFIED,
        verification_pass_rate=100.0,
    )
    assert summary.network_health_score == 0.92
    assert summary.verification_status == VerificationStatus.VERIFIED
    assert summary.verification_pass_rate == 100.0


def test_session_creation():
    """Test decision session creation and baseline capture."""
    service = CockpitService.get_instance()
    session = service.create_session(preset="healthy", seed=42)

    assert session.session_id.startswith("sess-")
    assert session.current_stage == DecisionStage.OBSERVING
    assert session.workflow_status == DecisionWorkflowStatus.IN_PROGRESS
    assert len(session.timeline.stages) == 8
    assert session.world_snapshot is not None
    assert session.summary is not None
    assert len(session.audit_trail) > 0


@pytest.mark.asyncio
async def test_workflow_state_machine_stage_run():
    """Test running individual workflow stages through CockpitService."""
    service = CockpitService.get_instance()
    session = service.create_session(preset="double_punch", seed=42)

    # 1. Run Risk Analysis stage
    session = await service.run_stage(session.session_id, DecisionStage.ANALYZING_RISK)
    assert session.current_stage == DecisionStage.ANALYZING_RISK
    assert session.active_risks is not None
    stg_risk = next(s for s in session.timeline.stages if s.stage == DecisionStage.ANALYZING_RISK)
    assert stg_risk.status == DecisionStageStatus.COMPLETED

    # 2. Run Specialists stage
    session = await service.run_stage(session.session_id, DecisionStage.RUNNING_SPECIALISTS)
    assert session.current_stage == DecisionStage.RUNNING_SPECIALISTS
    assert len(session.specialist_proposals) == 6

    # 3. Run Coordinating stage
    session = await service.run_stage(session.session_id, DecisionStage.COORDINATING)
    assert session.current_stage == DecisionStage.COORDINATING
    assert session.coordination_result is not None
    assert len(session.coordination_result.candidate_plans) == 3


@pytest.mark.asyncio
async def test_cockpit_orchestration_full_loop():
    """Test full decision loop execution from ANALYZING_RISK through READY_FOR_APPROVAL."""
    service = CockpitService.get_instance()
    session = service.create_session(preset="double_punch", seed=42)

    session = await service.run_full_loop(session.session_id)

    assert session.current_stage in (DecisionStage.READY_FOR_APPROVAL, DecisionStage.VERIFYING)
    assert session.coordination_result is not None
    assert session.adversary_report is not None
    assert session.planner_report is not None
    assert session.verification_report is not None
    assert session.summary is not None
    assert len(session.evidence_chain) > 0


def test_approval_and_rejection_gates():
    """Test recording human approval and rejection decisions."""
    service = CockpitService.get_instance()
    session = service.create_session()

    # Approve Plan A
    session = service.record_approval(
        session_id=session.session_id,
        plan_id="plan-candidate-a",
        approver="Chief Supply Chain Officer",
        rationale="Plan A maximizes SLA recovery with zero verification errors.",
    )
    assert session.current_stage == DecisionStage.APPROVED
    assert session.workflow_status == DecisionWorkflowStatus.COMPLETED
    assert session.approval_decision is not None
    assert session.approval_decision.status == "APPROVED"
    assert session.approval_decision.plan_id == "plan-candidate-a"

    # Reject Plan B
    session_b = service.create_session()
    session_b = service.record_rejection(
        session_id=session_b.session_id,
        plan_id="plan-candidate-c",
        approver="Chief Risk Officer",
        rationale="Plan C introduces excessive emissions and route vulnerability.",
    )
    assert session_b.current_stage == DecisionStage.REJECTED
    assert session_b.workflow_status == DecisionWorkflowStatus.REJECTED
    assert session_b.approval_decision is not None
    assert session_b.approval_decision.status == "REJECTED"


def test_session_reset():
    """Test resetting decision session back to baseline OBSERVING stage."""
    service = CockpitService.get_instance()
    session = service.create_session()
    session = service.record_approval(session.session_id, "plan-candidate-a", "Officer", "Approved")

    reset_sess = service.reset_session(session.session_id)
    assert reset_sess.current_stage == DecisionStage.OBSERVING
    assert reset_sess.workflow_status == DecisionWorkflowStatus.IN_PROGRESS
    assert reset_sess.approval_decision is None
    assert len(reset_sess.specialist_proposals) == 0


@pytest.mark.asyncio
async def test_state_mutation_safety_cockpit_service():
    """Assert that CockpitService full loop, approval, rejection, and reset cause ZERO mutation on authoritative repositories."""
    service = CockpitService.get_instance()
    session = service.create_session(preset="double_punch", seed=42)

    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    world_before = world_repo.get_snapshot()
    risk_before = risk_repo.get_risk_map()

    # Execute full loop
    await service.run_full_loop(session.session_id)
    assert world_repo.get_snapshot().nodes == world_before.nodes
    assert world_repo.get_snapshot().edges == world_before.edges
    assert risk_repo.get_risk_map().node_risks == risk_before.node_risks

    # Record approval
    service.record_approval(session.session_id, "plan-candidate-a", "Test User", "Test Rationale")
    assert world_repo.get_snapshot().nodes == world_before.nodes
    assert world_repo.get_snapshot().edges == world_before.edges
    assert risk_repo.get_risk_map().node_risks == risk_before.node_risks

    # Reset session
    service.reset_session(session.session_id)
    assert world_repo.get_snapshot().nodes == world_before.nodes
    assert world_repo.get_snapshot().edges == world_before.edges
    assert risk_repo.get_risk_map().node_risks == risk_before.node_risks


def test_cockpit_rest_api_endpoints(test_client):
    """Test FastAPI REST endpoints for Cockpit router."""
    # 1. GET /api/cockpit/status
    res = test_client.get("/api/cockpit/status")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["status"] == "ACTIVE"
    assert data["state_mutation_safety"] is True

    # 2. POST /api/cockpit/session
    res_create = test_client.post("/api/cockpit/session", json={"preset": "healthy", "seed": 42})
    assert res_create.status_code == 200
    sess = res_create.json()["data"]
    sess_id = sess["session_id"]
    assert sess_id.startswith("sess-")
    assert sess["current_stage"] == "OBSERVING"

    # 3. GET /api/cockpit/session/{id}
    res_get = test_client.get(f"/api/cockpit/session/{sess_id}")
    assert res_get.status_code == 200
    assert res_get.json()["data"]["session_id"] == sess_id

    # 4. POST /api/cockpit/session/{id}/stage
    res_stage = test_client.post(f"/api/cockpit/session/{sess_id}/stage", json={"target_stage": "ANALYZING_RISK"})
    assert res_stage.status_code == 200
    assert res_stage.json()["data"]["current_stage"] == "ANALYZING_RISK"

    # 5. POST /api/cockpit/session/{id}/approve
    res_app = test_client.post(
        f"/api/cockpit/session/{sess_id}/approve",
        json={"plan_id": "plan-candidate-a", "approver": "Director", "rationale": "Verified"},
    )
    assert res_app.status_code == 200
    assert res_app.json()["data"]["current_stage"] == "APPROVED"

    # 6. POST /api/cockpit/session/{id}/reset
    res_reset = test_client.post(f"/api/cockpit/session/{sess_id}/reset")
    assert res_reset.status_code == 200
    assert res_reset.json()["data"]["current_stage"] == "OBSERVING"
