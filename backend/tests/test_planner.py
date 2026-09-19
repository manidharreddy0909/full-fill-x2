"""
FULFILL-X Multi-Objective Planner & Optimization Engine Test Suite (Phase 08)
Comprehensive tests covering schema validation, objective normalization, constraint evaluation,
formal Pareto dominance, baseline and robust Pareto frontiers, sensitivity analysis,
PlannerAgent safe execution, state mutation safety, and REST API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.world import WorldStateSnapshot
from app.schemas.coordinator import CandidatePlan, CandidatePlanStatus, TradeOff
from app.schemas.planner import (
    ObjectiveDirection,
    PlannerObjective,
    ConstraintType,
    FeasibilityStatus,
    ParetoDominanceStatus,
    ObjectiveValue,
    ObjectiveVector,
    Constraint,
    ConstraintViolation,
    FeasibilityResult,
    ParetoPoint,
    ParetoFrontier,
    RobustnessProfile,
    PlanSensitivityItem,
    PlanEvaluation,
    PlannerReport,
)
from app.engine.planner import (
    PlannerEngine,
    ObjectiveNormalizer,
    ConstraintEvaluator,
    ParetoEngine,
    SensitivityAnalyzer,
)
from app.agents.planner import PlannerAgent
from app.services.planner import planner_service
from app.services.coordinator import coordinator_service
from app.services.adversary import adversary_service
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_state_before_test():
    WorldRepository.get_instance().seed_world(preset="healthy", seed=42)
    RiskRepository.get_instance()._initialize_baseline_signals()


@pytest.mark.asyncio
async def test_planner_schemas():
    """Verifies Pydantic schema validation and serialization for planner models."""
    val = ObjectiveValue(
        objective=PlannerObjective.REDUCE_DELAY_AND_COST,
        direction=ObjectiveDirection.MINIMIZE,
        raw_value=150000.0,
        normalized_value=0.75,
        unit="$",
        source="COORDINATOR",
        explanation="Test normalization",
    )
    assert val.objective == PlannerObjective.REDUCE_DELAY_AND_COST
    assert val.normalized_value == 0.75

    vec = ObjectiveVector(candidate_id="candidate_a", values=[val])
    assert vec.candidate_id == "candidate_a"
    assert len(vec.values) == 1


@pytest.mark.asyncio
async def test_objective_normalization_clamping():
    """Verifies deterministic min-max objective normalization scaled strictly to [0.0, 1.0]."""
    # 1. Cost (MINIMIZE range [100000, 300000])
    cost_low = ObjectiveNormalizer.normalize_value(PlannerObjective.REDUCE_DELAY_AND_COST, 100000.0)
    assert cost_low.normalized_value == 1.0  # Lowest cost is optimal

    cost_high = ObjectiveNormalizer.normalize_value(PlannerObjective.REDUCE_DELAY_AND_COST, 300000.0)
    assert cost_high.normalized_value == 0.0  # Highest cost is worst

    # 2. Service Level (MAXIMIZE range [40, 100])
    srv_high = ObjectiveNormalizer.normalize_value(PlannerObjective.PROTECT_SERVICE_LEVEL, 100.0)
    assert srv_high.normalized_value == 1.0

    srv_low = ObjectiveNormalizer.normalize_value(PlannerObjective.PROTECT_SERVICE_LEVEL, 40.0)
    assert srv_low.normalized_value == 0.0


@pytest.mark.asyncio
async def test_constraint_evaluator():
    """Verifies deterministic constraint evaluation for FEASIBLE, INFEASIBLE, and CONDITIONAL plans."""
    tradeoff = TradeOff(
        candidate_id="plan-good",
        positive_objectives=[PlannerObjective.PROTECT_SERVICE_LEVEL],
        negative_objectives=[PlannerObjective.REDUCE_DELAY_AND_COST],
        explanation="Test tradeoff",
    )
    plan_good = CandidatePlan(
        candidate_id="plan-good",
        name="Good Plan",
        description="Test plan description",
        actions=[],
        tradeoff=tradeoff,
        estimated_total_cost=180000.0,
        estimated_max_delay_hours=24.0,
        estimated_total_emissions_co2_kg=12000.0,
        status=CandidatePlanStatus.VALID,
    )
    res_good = ConstraintEvaluator.evaluate(plan_good)
    assert res_good.status == FeasibilityStatus.FEASIBLE
    assert len(res_good.violations) == 0

    plan_bad = CandidatePlan(
        candidate_id="plan-bad",
        name="Expensive Delayed Plan",
        description="Bad plan description",
        actions=[],
        tradeoff=tradeoff,
        estimated_total_cost=350000.0,  # Exceeds $250k
        estimated_max_delay_hours=72.0,   # Exceeds 48h
        estimated_total_emissions_co2_kg=30000.0,  # Exceeds 22k CO2
        status=CandidatePlanStatus.VALID,
    )
    res_bad = ConstraintEvaluator.evaluate(plan_bad)
    assert res_bad.status == FeasibilityStatus.INFEASIBLE
    assert len(res_bad.violations) >= 3



@pytest.mark.asyncio
async def test_pareto_dominance_logic():
    """Verifies formal Pareto dominance: A dominates B iff A is no worse on all objectives and strictly better on >=1."""
    # Plan A: [0.8, 0.8, 0.8]
    # Plan B: [0.6, 0.6, 0.6]  -> Plan A dominates Plan B
    # Plan C: [0.9, 0.5, 0.7]  -> Incomparable with Plan A
    v_a = [0.8, 0.8, 0.8]
    v_b = [0.6, 0.6, 0.6]
    v_c = [0.9, 0.5, 0.7]

    assert ParetoEngine.is_dominated(v_b, v_a) is True
    assert ParetoEngine.is_dominated(v_a, v_b) is False
    assert ParetoEngine.is_dominated(v_c, v_a) is False
    assert ParetoEngine.is_dominated(v_a, v_c) is False


@pytest.mark.asyncio
async def test_pareto_frontier_construction():
    """Verifies construction of baseline and robust Pareto frontiers."""
    p_a = ParetoPoint(
        candidate_id="candidate-a",
        candidate_name="Plan A",
        objective_vector=ObjectiveVector(
            candidate_id="candidate-a",
            values=[
                ObjectiveValue(objective=PlannerObjective.PROTECT_SERVICE_LEVEL, direction=ObjectiveDirection.MAXIMIZE, raw_value=95.0, normalized_value=0.9, unit="%"),
                ObjectiveValue(objective=PlannerObjective.REDUCE_DELAY_AND_COST, direction=ObjectiveDirection.MINIMIZE, raw_value=200000.0, normalized_value=0.5, unit="$"),
            ],
        ),
        feasibility=FeasibilityResult(status=FeasibilityStatus.FEASIBLE),
        dominance_status=ParetoDominanceStatus.NON_DOMINATED,
    )

    p_b = ParetoPoint(
        candidate_id="candidate-b",
        candidate_name="Plan B",
        objective_vector=ObjectiveVector(
            candidate_id="candidate-b",
            values=[
                ObjectiveValue(objective=PlannerObjective.PROTECT_SERVICE_LEVEL, direction=ObjectiveDirection.MAXIMIZE, raw_value=85.0, normalized_value=0.6, unit="%"),
                ObjectiveValue(objective=PlannerObjective.REDUCE_DELAY_AND_COST, direction=ObjectiveDirection.MINIMIZE, raw_value=250000.0, normalized_value=0.3, unit="$"),
            ],
        ),
        feasibility=FeasibilityResult(status=FeasibilityStatus.FEASIBLE),
        dominance_status=ParetoDominanceStatus.NON_DOMINATED,
    )

    frontier = ParetoEngine.compute_frontier([p_a, p_b], "Test Frontier")
    assert "candidate-a" in frontier.non_dominated_candidate_ids
    assert "candidate-b" in frontier.dominated_candidate_ids


@pytest.mark.asyncio
async def test_planner_service_end_to_end():
    """Verifies end-to-end Multi-Objective Planner analysis through service layer."""
    coord_res = await coordinator_service.run_coordination()
    adv_report = await adversary_service.run_adversary_analysis(candidate_plans=coord_res.candidate_plans)

    report = await planner_service.run_planner_analysis(
        candidate_plans=coord_res.candidate_plans,
        adversary_report=adv_report,
    )

    assert len(report.plan_evaluations) == len(coord_res.candidate_plans)
    assert len(report.baseline_frontier.points) == len(coord_res.candidate_plans)
    assert len(report.robust_frontier.points) == len(coord_res.candidate_plans)
    assert len(report.sensitivity_analysis) > 0
    assert len(report.recommended_candidates) > 0
    assert report.summary_narrative != ""


@pytest.mark.asyncio
async def test_state_mutation_safety_planner_service():
    """Strictly proves world_repo and risk_repo remain 100% unmutated after running full planner service."""
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    world_before = world_repo.get_snapshot().model_dump()
    risk_before = risk_repo.get_risk_map().model_dump()

    await planner_service.run_planner_analysis()

    world_after = world_repo.get_snapshot().model_dump()
    risk_after = risk_repo.get_risk_map().model_dump()

    assert world_before == world_after
    assert risk_before == risk_after


@pytest.mark.asyncio
async def test_planner_rest_api_endpoints():
    """Verifies all FastAPI REST endpoints for the planner module."""
    # 1. GET /api/planner/status
    res_status = client.get("/api/planner/status")
    assert res_status.status_code == 200
    assert res_status.json()["error"] is None
    assert res_status.json()["data"]["status"] == "READY"

    # 2. POST /api/planner/run
    res_run = client.post("/api/planner/run", json={})
    assert res_run.status_code == 200
    report_data = res_run.json()["data"]
    assert len(report_data["plan_evaluations"]) > 0

    # 3. GET /api/planner/report
    res_report = client.get("/api/planner/report")
    assert res_report.status_code == 200
    assert res_report.json()["data"]["report_id"] == report_data["report_id"]
