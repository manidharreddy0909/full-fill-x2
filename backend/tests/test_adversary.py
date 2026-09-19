"""
FULFILL-X Adversary Engine & Stress Testing Framework Test Suite (Phase 07)
Comprehensive tests covering schema validation, attack taxonomy, deterministic attack generation,
targeting strategy, candidate plan stress simulation, state mutation safety, 8-dimension resilience scoring,
vulnerabilities detection, assumption attacks, Adversary Agent safe execution, and REST API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.world import WorldStateSnapshot
from app.schemas.coordinator import CandidatePlan, CandidatePlanStatus, TradeOff
from app.schemas.adversary import (
    AttackType,
    AttackSeverity,
    ResilienceDimension,
    VulnerabilityType,
    AttackTarget,
    AttackAssumption,
    AdversaryAttack,
    StressScenario,
    DegradationMetric,
    ResilienceScore,
    Vulnerability,
    DefensiveRecommendation,
    PlanStressResult,
    AdversaryStatus,
    AdversaryReport,
)
from app.engine.adversary import (
    AdversaryEngine,
    AttackGenerator,
    StressSimulator,
    ResilienceScorer,
    VulnerabilityDetector,
    AttackTargetingStrategy,
)
from app.agents.adversary import AdversaryAgent
from app.services.adversary import adversary_service
from app.services.coordinator import coordinator_service
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_state_before_test():
    WorldRepository.get_instance().seed_world(preset="healthy", seed=42)
    RiskRepository.get_instance()._initialize_baseline_signals()


@pytest.mark.asyncio
async def test_adversary_schemas():
    """Verifies Pydantic schema validation and serialization for adversary models."""
    attack = AdversaryAttack(
        attack_id="atk-001",
        attack_type=AttackType.SUPPLIER_FAILURE,
        severity=AttackSeverity.CRITICAL,
        targets=[
            AttackTarget(
                entity_id="node-sup-01",
                entity_type="SUPPLIER",
                entity_name="Primary Supplier",
                current_capacity=100.0,
                risk_score=0.8,
            )
        ],
        duration_days=10.0,
        capacity_loss_pct=100.0,
        description="Supplier shutdown",
    )
    assert attack.attack_id == "atk-001"
    assert attack.attack_type == AttackType.SUPPLIER_FAILURE
    assert len(attack.targets) == 1

    report = AdversaryReport(
        report_id="report-001",
        timestamp="2026-09-19T12:00:00Z",
        scenarios_tested=5,
        attack_suite=[attack],
    )
    assert report.report_id == "report-001"
    assert report.scenarios_tested == 5


@pytest.mark.asyncio
async def test_attack_taxonomy_completeness():
    """Verifies all 12 controlled taxonomy attack types exist."""
    expected_types = [
        "SUPPLIER_FAILURE",
        "SUPPLIER_CAPACITY_REDUCTION",
        "PORT_CLOSURE",
        "PORT_CONGESTION",
        "TRANSPORT_DELAY",
        "TRANSPORT_MODE_FAILURE",
        "WAREHOUSE_CAPACITY_REDUCTION",
        "FULFILLMENT_CENTER_FAILURE",
        "DEMAND_SPIKE",
        "INVENTORY_SHOCK",
        "MULTI_NODE_FAILURE",
        "COMPOUND_DISRUPTION",
    ]
    for t_str in expected_types:
        assert AttackType(t_str) is not None


@pytest.mark.asyncio
async def test_attack_generator_determinism():
    """Verifies attack generator produces 100% identical attack suites given identical seed."""
    snap = WorldRepository.get_instance().get_snapshot()

    gen1 = AttackGenerator(seed=42)
    attacks1 = gen1.generate_attack_suite(snap)

    gen2 = AttackGenerator(seed=42)
    attacks2 = gen2.generate_attack_suite(snap)

    assert len(attacks1) == len(attacks2)
    for a1, a2 in zip(attacks1, attacks2):
        assert a1.attack_id == a2.attack_id
        assert a1.attack_type == a2.attack_type
        assert a1.severity == a2.severity
        assert a1.capacity_loss_pct == a2.capacity_loss_pct


@pytest.mark.asyncio
async def test_targeting_strategy():
    """Verifies red-team targeting identifies network bottlenecks and exposed suppliers."""
    snap = WorldRepository.get_instance().get_snapshot()
    targets = AttackTargetingStrategy.identify_targets(snap)

    assert len(targets) > 0
    # Should contain suppliers, ports, warehouses, or edges
    target_types = {t.entity_type for t in targets}
    assert len(target_types) > 1


@pytest.mark.asyncio
async def test_stress_simulator_snapshot_isolation():
    """Verifies stress simulator executes on isolated snapshot copy without mutating world repository state."""
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    world_before = world_repo.get_snapshot().model_dump()
    risk_before = risk_repo.get_risk_map().model_dump()

    snap = world_repo.get_snapshot()
    attack = AdversaryAttack(
        attack_id="atk-test",
        attack_type=AttackType.COMPOUND_DISRUPTION,
        severity=AttackSeverity.CRITICAL,
        capacity_loss_pct=80.0,
        description="Isolation verification attack",
    )

    metrics_summary, deg_metrics = StressSimulator.simulate(snap, candidate_plan=None, attack=attack)
    assert metrics_summary["service_level"] < 96.5

    world_after = world_repo.get_snapshot().model_dump()
    risk_after = risk_repo.get_risk_map().model_dump()

    # Strict immutability check
    assert world_before == world_after
    assert risk_before == risk_after


@pytest.mark.asyncio
async def test_eight_dimension_resilience_scoring():
    """Verifies transparent resilience score calculation across 8 explicit dimensions."""
    metrics_summary = {
        "service_level": 82.0,
        "total_cost": 180000.0,
        "avg_delay_hrs": 18.0,
        "emissions_kg": 14000.0,
        "unmet_demand": 150.0,
    }
    attack = AdversaryAttack(
        attack_id="atk-001",
        attack_type=AttackType.SUPPLIER_FAILURE,
        capacity_loss_pct=50.0,
        duration_days=7.0,
        description="Test attack",
    )

    score, dimensions = ResilienceScorer.calculate_scores(metrics_summary, attack, candidate_plan=None)
    assert 0.0 <= score <= 100.0
    assert len(dimensions) == 8

    dim_types = {d.dimension for d in dimensions}
    assert len(dim_types) == 8
    for d in dimensions:
        assert d.baseline_score >= 0.0
        assert d.explanation != ""


@pytest.mark.asyncio
async def test_vulnerability_detection_and_recommendations():
    """Verifies structural vulnerability detection and pairing with defensive recommendations."""
    snap = WorldRepository.get_instance().get_snapshot()
    vulns, recs = VulnerabilityDetector.detect_vulnerabilities(snap, candidate_plans=[], attacks=[])

    assert len(vulns) > 0
    assert len(recs) > 0
    v_types = {v.type for v in vulns}
    assert VulnerabilityType.SINGLE_SOURCE_DEPENDENCY in v_types


@pytest.mark.asyncio
async def test_adversary_service_end_to_end():
    """Verifies end-to-end Adversary analysis execution through service layer."""
    coord_res = await coordinator_service.run_coordination()
    report = await adversary_service.run_adversary_analysis(candidate_plans=coord_res.candidate_plans, seed=42)

    assert report.scenarios_tested > 0
    assert len(report.plan_stress_results) == len(coord_res.candidate_plans)
    assert len(report.overall_vulnerabilities) > 0
    assert len(report.defensive_recommendations) > 0
    assert report.summary_narrative != ""


@pytest.mark.asyncio
async def test_state_mutation_safety_adversary_service():
    """Strictly proves world_repo and risk_repo remain 100% unmutated after running full adversary service."""
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    world_before = world_repo.get_snapshot().model_dump()
    risk_before = risk_repo.get_risk_map().model_dump()

    await adversary_service.run_adversary_analysis(seed=42)

    world_after = world_repo.get_snapshot().model_dump()
    risk_after = risk_repo.get_risk_map().model_dump()

    assert world_before == world_after
    assert risk_before == risk_after


@pytest.mark.asyncio
async def test_adversary_rest_api_endpoints():
    """Verifies all FastAPI REST endpoints for the adversary module."""
    # 1. GET /api/adversary/status
    res_status = client.get("/api/adversary/status")
    assert res_status.status_code == 200
    assert res_status.json()["error"] is None
    assert res_status.json()["data"]["status"] == "READY"


    # 2. POST /api/adversary/run
    res_run = client.post("/api/adversary/run", json={"seed": 42})
    assert res_run.status_code == 200
    report_data = res_run.json()["data"]
    assert report_data["scenarios_tested"] > 0

    # 3. GET /api/adversary/findings
    res_findings = client.get("/api/adversary/findings")
    assert res_findings.status_code == 200
    assert res_findings.json()["data"]["report_id"] == report_data["report_id"]

    # 4. POST /api/adversary/attack-suite
    res_suite = client.post("/api/adversary/attack-suite", json={"seed": 42})
    assert res_suite.status_code == 200
    assert len(res_suite.json()["data"]) > 0
