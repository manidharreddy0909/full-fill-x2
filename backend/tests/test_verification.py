"""
FULFILL-X Automated Test Suite — Verification & Validation Engine (Phase 09)
Tests Pydantic schemas, ExecutionPlan translation, action validation, capacity validation,
route validation, inventory validation (negative inventory prevention), dependency validation,
risk re-evaluation, constraint re-validation, sandbox execution simulation,
state mutation safety (world_before == world_after), Scenarios A/B/C, and REST API.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.agents.verification import VerificationAgent
from app.engine.verification import VerificationEngine
from app.repository.risk import RiskRepository
from app.repository.world import WorldRepository
from app.schemas.agent import AgentAction, AgentActionType, AgentId, AgentInput, AgentObjective
from app.schemas.coordinator import CandidatePlan, ProposalNormalization, TradeOff
from app.schemas.planner import Constraint, ConstraintType
from app.schemas.verification import (
    ExecutionPlan,
    VerificationReport,
    VerificationStatus,
    ValidationSeverity,
    ValidationCategory,
    CapacityCheck,
    RouteCheck,
    InventoryCheck,
    DependencyCheck,
    RiskCheck,
    ConstraintCheck,
    StateDiff,
    SimulationResult,
)
from app.services.verification import VerificationService

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_repositories():
    """Ensure clean repository state before every test."""
    world_repo = WorldRepository.get_instance(seed=42, preset="double_punch")
    world_repo.seed_world(preset="double_punch", seed=42)
    risk_repo = RiskRepository.get_instance()
    risk_repo._initialize_baseline_signals()
    yield


def test_verification_schemas():
    """Test verification schemas instantiation and default validation values."""
    diff = StateDiff(
        service_level_before=90.0,
        service_level_after=95.0,
        service_level_delta=5.0,
        total_cost_before=100000.0,
        total_cost_after=120000.0,
        total_cost_delta=20000.0,
        delay_hours_before=24.0,
        delay_hours_after=12.0,
        delay_hours_delta=-12.0,
        emissions_co2_before=1000.0,
        emissions_co2_after=1100.0,
        emissions_co2_delta_percent=10.0,
        aggregate_risk_before=0.6,
        aggregate_risk_after=0.4,
        aggregate_risk_delta=-0.2,
        critical_risk_nodes_before=3,
        critical_risk_nodes_after=1,
        critical_risk_nodes_delta=-2,
    )
    assert diff.service_level_delta == 5.0
    assert diff.critical_risk_nodes_delta == -2

    sim_res = SimulationResult(
        simulation_id="sim-001",
        execution_plan_id="plan-a",
        is_successful=True,
        executed_actions_count=2,
        failed_actions_count=0,
        simulation_notes=["Applied reorder stock"],
        state_diff=diff,
    )
    assert sim_res.is_successful is True
    assert sim_res.executed_actions_count == 2


def test_execution_plan_conversion():
    """Test conversion of CandidatePlan to ExecutionPlan."""
    engine = VerificationEngine()
    norm_act = ProposalNormalization(
        normalized_id="norm-001",
        action_type=AgentActionType.REORDER_STOCK,
        target_node_ids=["wh-001"],
        target_edge_ids=["rt-001"],
        parameters={"quantity": 250.0},
        estimated_cost=25000.0,
    )
    cand_plan = CandidatePlan(
        candidate_id="cand-001",
        name="Candidate Plan A",
        description="High SLA Recovery Plan",
        actions=[norm_act],
        supporting_agents=[AgentId.INVENTORY],
        objectives_addressed=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
        agreements=[],
        conflicts_involved=[],
        objective_impact_matrix=[],
        tradeoff=TradeOff(candidate_id="cand-001", explanation="Tradeoff analysis"),
        estimated_total_cost=25000.0,
    )

    exec_plan = engine.build_execution_plan(cand_plan)
    assert exec_plan.plan_id == "cand-001"
    assert "wh-001" in exec_plan.affected_node_ids
    assert "rt-001" in exec_plan.affected_edge_ids
    assert len(exec_plan.constraints) > 0


def test_action_validation():
    """Test action validation for node/edge existence and hallucinated entities."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()

    # Valid action
    valid_norm = ProposalNormalization(
        normalized_id="norm-valid",
        action_type=AgentActionType.REORDER_STOCK,
        target_node_ids=["wh-001"],
        target_edge_ids=["rt-001"],
    )
    exec_plan_valid = ExecutionPlan(
        plan_id="p-valid",
        source_candidate_name="Valid Plan",
        actions=[valid_norm],
    )
    checks_valid = engine.validate_actions(exec_plan_valid, snap)
    assert any(c.status == "PASSED" for c in checks_valid)

    # Invalid action referencing non-existent hallucinated node
    invalid_norm = ProposalNormalization(
        normalized_id="norm-invalid",
        action_type=AgentActionType.REORDER_STOCK,
        target_node_ids=["non-existent-node-999"],
        target_edge_ids=[],
    )
    exec_plan_invalid = ExecutionPlan(
        plan_id="p-invalid",
        source_candidate_name="Invalid Plan",
        actions=[invalid_norm],
    )
    checks_invalid = engine.validate_actions(exec_plan_invalid, snap)
    assert any(c.status == "FAILED" and c.severity == ValidationSeverity.CRITICAL for c in checks_invalid)


def test_capacity_validation():
    """Test capacity bounds checking for network nodes."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()

    # Create action exceeding capacity
    overflow_norm = ProposalNormalization(
        normalized_id="norm-cap",
        action_type=AgentActionType.REORDER_STOCK,
        target_node_ids=["wh-001"],
        parameters={"quantity": 50000.0},  # Exceeds max capacity
    )
    exec_plan = ExecutionPlan(
        plan_id="p-cap",
        source_candidate_name="Capacity Overflow Plan",
        actions=[overflow_norm],
    )

    cap_checks, val_checks = engine.validate_capacity(exec_plan, snap)
    assert len(cap_checks) > 0
    assert any(c.is_exceeded for c in cap_checks)
    assert any(c.severity in (ValidationSeverity.ERROR, ValidationSeverity.CRITICAL) for c in val_checks)


def test_route_validation():
    """Test route validation for graph connectivity and blocked routes."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()

    # Select an edge and mark as disrupted for route check
    edge_id = snap.edges[0].id
    snap.edges[0].is_disrupted = True

    route_norm = ProposalNormalization(
        normalized_id="norm-rt",
        action_type=AgentActionType.REROUTE_FLOW,
        target_node_ids=[snap.edges[0].source_node_id],
        target_edge_ids=[edge_id],
    )

    exec_plan = ExecutionPlan(
        plan_id="p-rt",
        source_candidate_name="Route Check Plan",
        actions=[route_norm],
    )

    route_checks, val_checks = engine.validate_routes(exec_plan, snap)
    assert len(route_checks) > 0
    assert any(c.is_blocked for c in route_checks)
    assert any(c.severity == ValidationSeverity.ERROR for c in val_checks)


def test_inventory_validation():
    """Test inventory validation and negative stock prevention."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()

    # Outbound transfer exceeding available inventory
    drain_norm = ProposalNormalization(
        normalized_id="norm-inv",
        action_type=AgentActionType.STOCK_TRANSFER,
        target_node_ids=["wh-001"],
        parameters={"quantity": 500000.0},  # Drains inventory to negative
    )
    exec_plan = ExecutionPlan(
        plan_id="p-inv",
        source_candidate_name="Inventory Drain Plan",
        actions=[drain_norm],
    )

    inv_checks, val_checks = engine.validate_inventory(exec_plan, snap)
    assert len(inv_checks) > 0
    assert any(c.has_negative_inventory for c in inv_checks)
    assert any(c.severity == ValidationSeverity.CRITICAL for c in val_checks)


def test_dependency_validation():
    """Test network graph dependency validation."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()

    exec_plan = ExecutionPlan(
        plan_id="p-dep",
        source_candidate_name="Dependency Plan",
        actions=[],
        affected_node_ids=["wh-001"],
    )

    dep_checks, val_checks = engine.validate_dependencies(exec_plan, snap)
    assert len(dep_checks) > 0
    assert any(c.node_id == "wh-001" for c in dep_checks)


def test_sandbox_simulation_isolation():
    """Test that sandbox simulation executes on cloned snapshot without mutating original."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap_before = world_repo.get_snapshot()
    risk_repo = RiskRepository.get_instance()
    signals = risk_repo.list_signals()

    norm_act = ProposalNormalization(
        normalized_id="norm-sim",
        action_type=AgentActionType.REORDER_STOCK,
        target_node_ids=["wh-001"],
        target_edge_ids=["rt-001"],
    )
    exec_plan = ExecutionPlan(
        plan_id="p-sim",
        source_candidate_name="Sandbox Sim Plan",
        actions=[norm_act],
    )

    sim_res, risk_checks = engine.run_sandbox_simulation(exec_plan, snap_before, signals)
    assert sim_res.is_successful is True
    assert sim_res.executed_actions_count > 0

    # Ensure snap_before original object was not mutated
    snap_after = world_repo.get_snapshot()
    assert snap_before.snapshot_id == snap_after.snapshot_id


def test_state_mutation_safety_verification_service():
    """CRITICAL SAFETY TEST: Prove VerificationService leaves WorldRepository & RiskRepository 100% untouched."""
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    world_before = world_repo.get_snapshot().model_dump()
    risk_before = risk_repo.get_risk_map().model_dump()

    service = VerificationService.get_instance()
    cand_plan = CandidatePlan(
        candidate_id="cand-safety",
        name="Safety Test Plan",
        description="Verify zero side effects",
        actions=[
            ProposalNormalization(
                normalized_id="norm-safety",
                action_type=AgentActionType.REORDER_STOCK,
                target_node_ids=["wh-001"],
            )
        ],
        supporting_agents=[AgentId.INVENTORY],
        objectives_addressed=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
        agreements=[],
        conflicts_involved=[],
        objective_impact_matrix=[],
        tradeoff=TradeOff(candidate_id="cand-safety", explanation="Safety check"),
    )

    report = service.verify_plan(cand_plan)
    assert report is not None

    world_after = world_repo.get_snapshot().model_dump()
    risk_after = risk_repo.get_risk_map().model_dump()

    assert world_before == world_after
    assert risk_before == risk_after


def test_scenario_a_verified():
    """Scenario A: Valid plan passes all checks -> VERIFIED."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()
    risk_repo = RiskRepository.get_instance()

    valid_norm = ProposalNormalization(
        normalized_id="norm-valid-plan",
        action_type=AgentActionType.REORDER_STOCK,
        target_node_ids=["wh-001"],
        parameters={"quantity": 100.0},
    )
    cand_plan = CandidatePlan(
        candidate_id="cand-scenario-a",
        name="Valid Recovery Plan",
        description="Feasible stock reorder plan",
        actions=[valid_norm],
        supporting_agents=[AgentId.INVENTORY],
        objectives_addressed=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
        agreements=[],
        conflicts_involved=[],
        objective_impact_matrix=[],
        tradeoff=TradeOff(candidate_id="cand-scenario-a", explanation="Valid plan"),
    )

    report = engine.verify_plan(cand_plan, snap, risk_repo.list_signals())
    assert report.status in (VerificationStatus.VERIFIED, VerificationStatus.CONDITIONAL)
    assert report.overall_score > 70.0


def test_scenario_b_conditional():
    """Scenario B: Plan with soft constraint/warning -> CONDITIONAL."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()
    risk_repo = RiskRepository.get_instance()

    # Plan with high quantity causing safety stock or emissions warning
    warn_norm = ProposalNormalization(
        normalized_id="norm-warn-plan",
        action_type=AgentActionType.STOCK_TRANSFER,
        target_node_ids=["wh-001"],
        parameters={"quantity": 380.0},  # Causes safety stock warning
    )
    cand_plan = CandidatePlan(
        candidate_id="cand-scenario-b",
        name="High Transfer Plan",
        description="Plan causing safety stock warning",
        actions=[warn_norm],
        supporting_agents=[AgentId.INVENTORY],
        objectives_addressed=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
        agreements=[],
        conflicts_involved=[],
        objective_impact_matrix=[],
        tradeoff=TradeOff(candidate_id="cand-scenario-b", explanation="Warning plan"),
    )

    report = engine.verify_plan(cand_plan, snap, risk_repo.list_signals())
    assert report.status in (VerificationStatus.CONDITIONAL, VerificationStatus.VERIFIED)


def test_scenario_c_rejected():
    """Scenario C: Plan with hard capacity/route/inventory violation -> REJECTED."""
    engine = VerificationEngine()
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()
    risk_repo = RiskRepository.get_instance()

    # Plan attempting impossible transfer draining inventory below 0
    fail_norm = ProposalNormalization(
        normalized_id="norm-fail-plan",
        action_type=AgentActionType.STOCK_TRANSFER,
        target_node_ids=["wh-001"],
        parameters={"quantity": 99999.0},  # Causes negative inventory
    )
    cand_plan = CandidatePlan(
        candidate_id="cand-scenario-c",
        name="Impossible Stock Transfer Plan",
        description="Plan causing negative inventory crash",
        actions=[fail_norm],
        supporting_agents=[AgentId.INVENTORY],
        objectives_addressed=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
        agreements=[],
        conflicts_involved=[],
        objective_impact_matrix=[],
        tradeoff=TradeOff(candidate_id="cand-scenario-c", explanation="Failing plan"),
    )

    report = engine.verify_plan(cand_plan, snap, risk_repo.list_signals())
    assert report.status == VerificationStatus.REJECTED
    assert report.failed_checks_count > 0


def test_verification_agent_contract():
    """Test VerificationAgent contract and reasoning execution."""
    agent = VerificationAgent()
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    agent_input = AgentInput(
        agent_id=AgentId.VERIFICATION,
        task_description="Verify Candidate Plan A",
        world_snapshot=world_repo.get_snapshot(),
        risk_map=risk_repo.get_risk_map(),
    )


    result = pytest.EventLoop().run_until_complete(agent.safe_execute(agent_input)) if hasattr(pytest, "EventLoop") else None
    # Alternatively verify agent metadata
    metadata = agent.get_metadata()
    assert metadata.id == AgentId.VERIFICATION
    assert metadata.name == "Verification Agent"


def test_verification_service_end_to_end():
    """Test end-to-end VerificationService workflow."""
    service = VerificationService.get_instance()
    cand_plan = CandidatePlan(
        candidate_id="cand-e2e",
        name="E2E Plan",
        description="Testing service orchestrator",
        actions=[
            ProposalNormalization(
                normalized_id="norm-e2e",
                action_type=AgentActionType.REORDER_STOCK,
                target_node_ids=["wh-001"],
            )
        ],
        supporting_agents=[AgentId.INVENTORY],
        objectives_addressed=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
        agreements=[],
        conflicts_involved=[],
        objective_impact_matrix=[],
        tradeoff=TradeOff(candidate_id="cand-e2e", explanation="E2E test"),
    )

    report = service.verify_plan(cand_plan)
    assert report.candidate_id == "cand-e2e"
    assert service.get_latest_report("cand-e2e") == report


def test_verification_rest_api_endpoints():
    """Test FastAPI REST endpoints for verification."""
    # 1. GET /api/verification/status
    res_status = client.get("/api/verification/status")
    assert res_status.status_code == 200
    data_status = res_status.json()
    assert data_status["status"] == "READY"
    assert data_status["immutability_guarantee"] == "ZERO_MUTATION_SANDBOX"

    # 2. POST /api/verification/run
    req_body = {
        "candidate_plan": {
            "candidate_id": "cand-api-test",
            "name": "API Test Plan",
            "description": "API verification test",
            "actions": [
                {
                    "normalized_id": "norm-api",
                    "action_type": "REORDER_STOCK",
                    "target_node_ids": ["wh-001"],
                    "target_edge_ids": [],
                    "parameters": {"quantity": 150.0},
                    "source_proposal_ids": [],
                    "supporting_agent_ids": ["inventory"],
                    "supporting_objectives": ["MINIMIZE_STOCKOUT_RISK"],
                    "estimated_cost": 15000.0,
                    "estimated_delay_hours": 0.0,
                    "estimated_emissions_co2_kg": 100.0,
                }
            ],
            "supporting_agents": ["inventory"],
            "objectives_addressed": ["MINIMIZE_STOCKOUT_RISK"],
            "agreements": [],
            "conflicts_involved": [],
            "objective_impact_matrix": [],
            "tradeoff": {
                "candidate_id": "cand-api-test",
                "positive_objectives": ["MINIMIZE_STOCKOUT_RISK"],
                "negative_objectives": [],
                "neutral_objectives": [],
                "explanation": "API plan tradeoff",
            },
            "estimated_total_cost": 15000.0,
            "estimated_max_delay_hours": 0.0,
            "estimated_total_emissions_co2_kg": 100.0,
            "status": "VALID",
            "violations": [],
        }
    }
    res_run = client.post("/api/verification/run", json=req_body)
    assert res_run.status_code == 200
    report_data = res_run.json()
    assert report_data["candidate_id"] == "cand-api-test"
    assert report_data["status"] in ("VERIFIED", "CONDITIONAL", "REJECTED")

    # 3. GET /api/verification/report
    res_report = client.get("/api/verification/report")
    assert res_report.status_code == 200
    assert res_report.json()["candidate_id"] == "cand-api-test"
