"""
FULFILL-X Phase 4 Challenge Engine Tests

Comprehensive tests covering:
1.  Boundary challenge generation (probe below vs probe above)
2.  Dependency failure challenge generation
3.  Demand shock challenge generation
4.  Topology change challenge generation
5.  Stale evidence challenge generation
6.  Conflicting evidence challenge generation
7.  Novel condition challenge generation (UNKNOWN zone)
8.  Controlled gradient boundary probing & transition point discovery
9.  Counterfactual: Skill vs Alternative Strategy (Emergency Inventory Draw)
10. Counterfactual: Skill vs Baseline (No Action)
11. Known boundary breach detection
12. New boundary discovery under uncharacterized conditions
13. Prediction error calculation (predicted vs simulated)
14. Hindsight retention: challenge retained with TruthStatus.SIMULATED
15. Hindsight recall: similar past challenge recognized & duplicate avoided
16. Unknown zone handling: system reports UNKNOWN without hallucinating confidence
17. Evolution proposal generation on challenge failure (old version immutable)
18. Immutability guarantee: skill version is not automatically overwritten
19. Adaptive autonomy: critical breach triggers BLOCK / APPROVAL
20. Adaptive autonomy: repeated survival enables AUTO
21. Truth status invariant: simulated evidence is NEVER promoted to OBSERVED
22. REST API endpoints verification
23. CANONICAL: End-to-end 4-step active learning demonstration
"""
import pytest
import uuid
from typing import Dict, Any

from app.challenge.models import (
    ChallengeScenario,
    ChallengeScenarioType,
    ChallengeStatus,
    ChallengeOutcomeStatus,
    BoundaryStatus,
    ChallengeResult,
    CounterfactualComparison,
    GradientProbeResult,
)
from app.challenge.generator import ChallengeScenarioGenerator
from app.challenge.counterfactual import CounterfactualEngine
from app.challenge.prioritizer import ChallengePrioritizer
from app.challenge.governance import AdaptiveAutonomyEngine
from app.challenge.service import ChallengeEngineService

from app.skills.models import (
    ResilienceSkill,
    SkillLifecycle,
    SkillPrecondition,
    GovernanceRequirement,
    UncertaintyLevel,
)
from app.skills.registry import skill_registry
from app.hindsight.models import (
    FailureBoundary,
    SuccessCondition,
    Experience,
)
from app.hindsight.provenance import TruthStatus


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def supplier_skill_v2() -> ResilienceSkill:
    """Canonical Supplier Substitution Skill v2."""
    skill = ResilienceSkill(
        skill_id="skill-test-supplier-v2",
        name="Supplier Substitution (Secondary Sourcing)",
        version="v2",
        purpose="Reroute raw material procurement to secondary qualified supplier.",
        strategy="Supplier Substitution",
        genome_id="genome-test-001",
        lifecycle_status=SkillLifecycle.VALIDATED,
        governance_requirement=GovernanceRequirement.AUTO,
        confidence=0.88,
        preconditions=[
            SkillPrecondition(
                description="Secondary supplier capacity >= 40%",
                parameter="capacity",
                operator=">=",
                threshold=0.40,
                uncertainty=UncertaintyLevel.KNOWN,
            )
        ],
        failure_boundaries=[
            FailureBoundary(
                boundary_id="fb-test-040",
                text="Secondary supplier capacity < 40%",
                parameter="capacity",
                threshold="< 0.40",
                severity="CRITICAL",
                evidence_count=5,
                confidence=0.90,
            )
        ],
    )
    if not skill_registry.get(skill.skill_id):
        skill_registry.register(skill)
    return skill


@pytest.fixture
def challenge_service() -> ChallengeEngineService:
    return ChallengeEngineService()


# ─── 1-7. Challenge Generation Tests ──────────────────────────────────────────

def test_generate_boundary_challenge(supplier_skill_v2):
    gen = ChallengeScenarioGenerator()

    # Probe below: 0.38 (should trigger failure expectation)
    sc_below = gen.generate_boundary_challenge(supplier_skill_v2, parameter="capacity", boundary_threshold=0.40, probe_below=True, delta=0.02)
    assert sc_below.scenario_type == ChallengeScenarioType.BOUNDARY_TEST
    assert sc_below.perturbations["capacity"] == 0.38
    assert sc_below.perturbations["is_breach_expected"] is True
    assert sc_below.provenance.is_simulation is True

    # Probe above: 0.42 (should trigger survival expectation)
    sc_above = gen.generate_boundary_challenge(supplier_skill_v2, parameter="capacity", boundary_threshold=0.40, probe_below=False, delta=0.02)
    assert sc_above.perturbations["capacity"] == 0.42
    assert sc_above.perturbations["is_breach_expected"] is False


def test_generate_dependency_failure_challenge(supplier_skill_v2):
    gen = ChallengeScenarioGenerator()
    sc = gen.generate_dependency_failure_challenge(supplier_skill_v2, failed_dependency="wh-north-01")
    assert sc.scenario_type == ChallengeScenarioType.DEPENDENCY_FAILURE
    assert sc.perturbations["failed_node"] == "wh-north-01"
    assert sc.risk_level == "CRITICAL"


def test_generate_demand_shock_challenge(supplier_skill_v2):
    gen = ChallengeScenarioGenerator()
    sc = gen.generate_demand_surge_challenge(supplier_skill_v2, surge_factor=1.6)
    assert sc.scenario_type == ChallengeScenarioType.DEMAND_SURGE
    assert sc.perturbations["demand_surge_factor"] == 1.6


def test_generate_topology_change_challenge(supplier_skill_v2):
    gen = ChallengeScenarioGenerator()
    sc = gen.generate_topology_change_challenge(supplier_skill_v2, new_hub="wh-backup-02", extra_latency_hours=4.0)
    assert sc.scenario_type == ChallengeScenarioType.TOPOLOGY_CHANGE
    assert sc.perturbations["redirect_hub"] == "wh-backup-02"
    assert sc.perturbations["transit_delay_hours"] == 4.0


def test_generate_stale_evidence_challenge(supplier_skill_v2):
    gen = ChallengeScenarioGenerator()
    sc = gen.generate_stale_evidence_challenge(supplier_skill_v2, evidence_age_days=180)
    assert sc.scenario_type == ChallengeScenarioType.STALE_EVIDENCE
    assert sc.perturbations["evidence_age_days"] == 180


def test_generate_conflicting_evidence_challenge(supplier_skill_v2):
    gen = ChallengeScenarioGenerator()
    sc = gen.generate_conflicting_evidence_challenge(supplier_skill_v2, contradicting_outcome="Customs embargo at destination port")
    assert sc.scenario_type == ChallengeScenarioType.CONFLICTING_EVIDENCE
    assert "conflicting_evidence" in sc.perturbations


def test_generate_novel_condition_challenge(supplier_skill_v2):
    gen = ChallengeScenarioGenerator()
    sc = gen.generate_novel_condition_challenge(supplier_skill_v2, novel_factor="Solar Flare Satellite Blackout")
    assert sc.scenario_type == ChallengeScenarioType.NOVEL_CONDITION
    assert sc.perturbations["historical_prior_coverage"] == 0.0


# ─── 8. Gradient Boundary Probing Test ────────────────────────────────────────

@pytest.mark.asyncio
async def test_gradient_boundary_probing(supplier_skill_v2, challenge_service):
    values = [0.45, 0.42, 0.40, 0.39, 0.37, 0.35]
    probe_res: GradientProbeResult = await challenge_service.run_gradient_probe(
        skill=supplier_skill_v2,
        parameter="capacity",
        values=values,
    )
    assert len(probe_res.steps) == len(values)
    # 0.45, 0.42, 0.40 survive
    assert probe_res.steps[0].skill_survived is True
    assert probe_res.steps[1].skill_survived is True
    # 0.39 fails (< 0.40)
    assert probe_res.steps[3].skill_survived is False
    assert probe_res.transition_point == 0.39
    assert probe_res.discovered_boundary is not None


# ─── 9-10. Counterfactual Engine Tests ────────────────────────────────────────

def test_counterfactual_skill_vs_alternative(supplier_skill_v2):
    engine = CounterfactualEngine()
    world = {"capacity": 0.35, "demand_surge_factor": 1.0}

    cf: CounterfactualComparison = engine.evaluate_counterfactual(
        skill=supplier_skill_v2,
        scenario_id="sc-cf-test",
        world_state=world,
        alternative_strategy="Emergency Inventory Draw (Warehouse C Reserves)",
    )
    # Skill should fail under 35% capacity
    assert cf.skill_outcome["success"] is False
    # Alternative emergency inventory draw should succeed
    assert cf.alternative_outcome["success"] is True
    assert cf.delta_service_level < 0  # Alternative has higher service level
    assert cf.provenance.is_simulation is True
    assert cf.provenance.source_type == TruthStatus.SIMULATED


def test_counterfactual_skill_vs_baseline(supplier_skill_v2):
    engine = CounterfactualEngine()
    world = {"capacity": 0.60, "demand_surge_factor": 1.0}

    cf: CounterfactualComparison = engine.evaluate_counterfactual(
        skill=supplier_skill_v2,
        scenario_id="sc-cf-base",
        world_state=world,
        alternative_strategy="Baseline (No Action)",
    )
    # At 60% capacity, skill succeeds and clearly beats baseline
    assert cf.skill_outcome["success"] is True
    assert cf.delta_service_level > 0.30
    assert "superior" in cf.recommendation.lower()


# ─── 11-13. Boundary Discovery & Prediction Error ──────────────────────────────

@pytest.mark.asyncio
async def test_known_boundary_breach_detected(supplier_skill_v2, challenge_service):
    sc = challenge_service.generator.generate_boundary_challenge(
        supplier_skill_v2, parameter="capacity", boundary_threshold=0.40, probe_below=True, delta=0.02
    )
    sc.perturbations["capacity"] = 0.38

    cr: ChallengeResult = await challenge_service.run_challenge(supplier_skill_v2, sc, run_counterfactual=False)
    assert cr.skill_survived is False
    assert cr.failure_detected is True
    assert cr.boundary_status == BoundaryStatus.BOUNDARY_BREACH
    assert cr.outcome_status == ChallengeOutcomeStatus.FAILED


@pytest.mark.asyncio
async def test_new_boundary_discovered_under_demand_surge(supplier_skill_v2, challenge_service):
    sc = challenge_service.generator.generate_demand_surge_challenge(
        supplier_skill_v2, surge_factor=1.6
    )
    sc.perturbations["capacity"] = 0.65  # Capacity is fine
    sc.perturbations["demand_surge_factor"] = 1.6  # Demand surge breaks it

    cr: ChallengeResult = await challenge_service.run_challenge(supplier_skill_v2, sc, run_counterfactual=False)
    assert cr.skill_survived is False
    assert cr.new_boundary_detected is not None
    assert "demand_surge_factor" in cr.new_boundary_detected
    assert cr.boundary_status == BoundaryStatus.NEW_BOUNDARY_REVEALED
    assert cr.outcome_status == ChallengeOutcomeStatus.BOUNDARY_DISCOVERED


@pytest.mark.asyncio
async def test_prediction_error_captured(supplier_skill_v2, challenge_service):
    sc = challenge_service.generator.generate_boundary_challenge(
        supplier_skill_v2, parameter="capacity", boundary_threshold=0.40, probe_below=True, delta=0.02
    )
    sc.perturbations["capacity"] = 0.38

    cr: ChallengeResult = await challenge_service.run_challenge(supplier_skill_v2, sc, run_counterfactual=False)
    assert cr.prediction_error_hours is not None
    # Prediction error is non-zero
    assert abs(cr.prediction_error_hours) > 0.0


# ─── 14-16. Hindsight Retention, Recall & Unknown Zone ────────────────────────

@pytest.mark.asyncio
async def test_challenge_retained_in_hindsight_as_simulated(supplier_skill_v2, challenge_service):
    sc = challenge_service.generator.generate_boundary_challenge(
        supplier_skill_v2, parameter="capacity", boundary_threshold=0.40, probe_below=False, delta=0.05
    )
    sc.perturbations["capacity"] = 0.45

    cr: ChallengeResult = await challenge_service.run_challenge(supplier_skill_v2, sc)
    assert cr.retained_experience_id is not None

    # Retrieve from Hindsight client memory store
    exp_data = challenge_service.recorder.client._memory_store.get(cr.retained_experience_id)
    assert exp_data is not None
    assert exp_data.get("truth_status") in (TruthStatus.SIMULATED, TruthStatus.SIMULATED.value)
    assert exp_data["provenance"]["is_simulation"] is True


@pytest.mark.asyncio
async def test_similar_challenge_recognized_via_recall(supplier_skill_v2, challenge_service):
    # Challenge 1
    sc1 = challenge_service.generator.generate_boundary_challenge(
        supplier_skill_v2, parameter="capacity", boundary_threshold=0.40, probe_below=True, delta=0.02
    )
    sc1.perturbations["capacity"] = 0.38
    await challenge_service.run_challenge(supplier_skill_v2, sc1)

    initial_reuse = challenge_service.metrics.challenge_reuse

    # Challenge 2 with same condition
    sc2 = challenge_service.generator.generate_boundary_challenge(
        supplier_skill_v2, parameter="capacity", boundary_threshold=0.40, probe_below=True, delta=0.02
    )
    sc2.perturbations["capacity"] = 0.38
    await challenge_service.run_challenge(supplier_skill_v2, sc2)

    # Challenge reuse metric should increment
    assert challenge_service.metrics.challenge_reuse >= initial_reuse + 1


@pytest.mark.asyncio
async def test_novel_condition_identifies_unknown_without_hallucinating(supplier_skill_v2, challenge_service):
    sc = challenge_service.generator.generate_novel_condition_challenge(
        supplier_skill_v2, novel_factor="Geomagnetic Solar Storm Disrupts GPS Logistics"
    )

    cr: ChallengeResult = await challenge_service.run_challenge(supplier_skill_v2, sc)
    assert cr.outcome_status == ChallengeOutcomeStatus.UNKNOWN
    assert cr.boundary_status == BoundaryStatus.BOUNDARY_UNCERTAIN
    assert "UNKNOWN ZONE" in cr.recommendation


# ─── 17-18. Evolution Proposal & Skill Immutability ───────────────────────────

@pytest.mark.asyncio
async def test_challenge_failure_produces_evolution_proposal_immutable_v1(supplier_skill_v2, challenge_service):
    orig_version = supplier_skill_v2.version
    orig_confidence = supplier_skill_v2.confidence

    sc = challenge_service.generator.generate_demand_surge_challenge(supplier_skill_v2, surge_factor=1.6)
    sc.perturbations["capacity"] = 0.60
    sc.perturbations["demand_surge_factor"] = 1.6

    cr: ChallengeResult = await challenge_service.run_challenge(supplier_skill_v2, sc)

    # Evolution proposal generated
    assert cr.evolution_proposal_id is not None

    # CRITICAL: Old skill version must remain immutable!
    assert supplier_skill_v2.version == orig_version
    assert supplier_skill_v2.version == "v2"


# ─── 19-21. Governance & Truth Safety ─────────────────────────────────────────

def test_critical_boundary_breach_forces_governance_block(supplier_skill_v2):
    engine = AdaptiveAutonomyEngine()
    fake_cr = ChallengeResult(
        challenge_id="cr-test",
        skill_id=supplier_skill_v2.skill_id,
        skill_version=supplier_skill_v2.version,
        scenario=ChallengeScenario(
            skill_id=supplier_skill_v2.skill_id,
            skill_version=supplier_skill_v2.version,
            target_assumption="test",
            scenario_type=ChallengeScenarioType.BOUNDARY_TEST,
            expected_skill_behavior="fail",
        ),
        boundary_status=BoundaryStatus.BOUNDARY_BREACH,
        skill_survived=False,
        failure_detected=True,
        confidence_before=0.88,
        confidence_after=0.75,
        recommendation="Critical boundary breached",
        outcome_status=ChallengeOutcomeStatus.FAILED,
    )

    req, reason = engine.evaluate_adaptive_autonomy(supplier_skill_v2, [fake_cr])
    assert req == GovernanceRequirement.BLOCK
    assert "BLOCK" in reason


def test_repeated_survival_enables_auto_governance(supplier_skill_v2):
    engine = AdaptiveAutonomyEngine()
    supplier_skill_v2.confidence = 0.92

    fake_crs = [
        ChallengeResult(
            challenge_id=f"cr-{i}",
            skill_id=supplier_skill_v2.skill_id,
            skill_version=supplier_skill_v2.version,
            scenario=ChallengeScenario(
                skill_id=supplier_skill_v2.skill_id,
                skill_version=supplier_skill_v2.version,
                target_assumption="test",
                scenario_type=ChallengeScenarioType.NORMAL_VARIATION,
                expected_skill_behavior="pass",
            ),
            boundary_status=BoundaryStatus.WITHIN_BOUNDARY,
            skill_survived=True,
            failure_detected=False,
            confidence_before=0.90,
            confidence_after=0.92,
            recommendation="Survived",
            outcome_status=ChallengeOutcomeStatus.SURVIVED,
        )
        for i in range(3)
    ]

    req, reason = engine.evaluate_adaptive_autonomy(supplier_skill_v2, fake_crs)
    assert req == GovernanceRequirement.AUTO
    assert "AUTO" in reason


def test_truth_status_never_becomes_observed():
    gen = ChallengeScenarioGenerator()
    dummy_skill = ResilienceSkill(
        skill_id="s1",
        name="Test",
        version="v1",
        purpose="Test purpose",
        strategy="Test strategy",
        genome_id="genome-test",
    )
    sc = gen.generate_boundary_challenge(dummy_skill)
    assert sc.provenance.is_simulation is True
    assert sc.provenance.source_type == TruthStatus.SIMULATED


# ─── 22. REST API Verification ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_challenge_rest_api_endpoints():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. GET /api/challenge/status
    res = client.get("/api/challenge/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ONLINE"
    assert "Phase 4" in data["phase"]

    # 2. GET /api/challenge/metrics
    res = client.get("/api/challenge/metrics")
    assert res.status_code == 200

    # 3. POST /api/challenge/run
    run_payload = {
        "skill_id": "skill-canonical-supplier-sub",
        "scenario_type": "BOUNDARY_TEST",
        "parameter": "capacity",
        "test_value": 0.45,
        "run_counterfactual": True,
    }
    res = client.post("/api/challenge/run", json=run_payload)
    assert res.status_code == 200
    cr_data = res.json()
    assert "challenge_id" in cr_data
    assert cr_data["skill_survived"] is True

    # 4. POST /api/challenge/counterfactual
    cf_payload = {
        "skill_id": "skill-canonical-supplier-sub",
        "world_state": {"capacity": 0.35},
        "alternative_strategy": "Emergency Inventory Draw (Warehouse C Reserves)",
    }
    res = client.post("/api/challenge/counterfactual", json=cf_payload)
    assert res.status_code == 200
    cf_data = res.json()
    assert "comparison_id" in cf_data
    assert cf_data["provenance"]["is_simulation"] is True


# ─── 23. CANONICAL DEMO TEST ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_canonical_phase4_demo_end_to_end(challenge_service):
    demo_result = await challenge_service.run_canonical_phase4_demo()

    assert demo_result["skill_under_test"]["version"] == "v2"
    # Challenge 1 passed
    assert demo_result["challenge_1"]["outcome_status"] == "SURVIVED"
    assert demo_result["challenge_1"]["survived"] is True
    # Challenge 2 failed with boundary breach
    assert demo_result["challenge_2"]["outcome_status"] == "FAILED"
    assert demo_result["challenge_2"]["boundary_status"] == "BOUNDARY_BREACH"
    # Challenge 3 recalled evidence & flagged UNCERTAIN
    assert demo_result["challenge_3"]["uncertainty_zone"] == "UNCERTAIN"
    # Challenge 4 counterfactual showed alternative superior and produced evolution proposal
    assert demo_result["challenge_4"]["counterfactual_comparison"]["delta_service_level"] is not None
    assert demo_result["challenge_4"]["evolution_proposal_id"] is not None
    # Autonomy was stepped down from AUTO to APPROVAL
    assert demo_result["challenge_4"]["adaptive_governance_result"] in ("APPROVAL", "BLOCK")
    # Skill immutability
    assert demo_result["skill_immutability_verified"] is True
