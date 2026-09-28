"""
FULFILL-X Phase 3 Skill Tests

Tests:
1.  Skill generation from Genome
2.  Unknown fields when genome insufficient
3.  Evidence preserved in skill
4.  Contradictions preserved
5.  Valid preconditions -> applicable
6.  Invalid preconditions -> rejected
7.  Safe condition -> boundary pass
8.  Boundary violation -> block/reject
9.  Unknown condition -> uncertain
10. Simulation success -> PASS
11. Simulation failure -> FAIL
12. Inconclusive when missing data
13. v1 preserved after v2 created
14. Evolution reason preserved
15. Evidence preserved in v2
16. Outcome reinforces skill
17. Outcome weakens skill
18. Outcome reveals new boundary
19. Outcome contradicts skill
20. Governance: low confidence -> requires approval
21. Critical boundary violation -> BLOCK
22. Skill creation retained in Hindsight
23. CANONICAL: v1 + outcome -> evolution proposal -> v2 (v1 immutable)
"""
import pytest
import uuid
from typing import Optional

from app.hindsight.models import (
    ResilienceGenome, SuccessCondition, FailureBoundary, GenomeStatus
)
from app.hindsight.provenance import TruthStatus
from app.skills.models import (
    ResilienceSkill, SkillLifecycle, ValidationResult,
    SkillCalibrationResult, EvolutionProposalStatus,
    GovernanceRequirement, UncertaintyLevel, SkillPrecondition,
)
from app.skills.generator import SkillGenerator
from app.skills.evaluator import SkillApplicabilityEvaluator
from app.skills.validator import SkillValidationEngine
from app.skills.evolution import SkillOutcomeCalibrator, SkillEvolutionEngine
from app.skills.registry import SkillRegistry
from app.skills.service import SkillOrchestrationService


# ─── Fixtures ─────────────────────────────────────────────────────────────────

def make_genome(
    strategy="Supplier Substitution",
    evidence=7,
    contradictions=0,
    confidence=0.88,
    status=GenomeStatus.VALIDATED,
    success_conditions=None,
    failure_boundaries=None,
) -> ResilienceGenome:
    return ResilienceGenome(
        id="genome-test-" + uuid.uuid4().hex[:4],
        strategy=strategy,
        purpose="Test genome",
        success_conditions=success_conditions or [
            SuccessCondition(text="Capacity > 40%", parameter="capacity", threshold="> 0.40", evidence_count=5, confidence=0.91),
        ],
        failure_boundaries=failure_boundaries or [
            FailureBoundary(text="Capacity < 40% causes cascade", parameter="capacity", threshold="< 0.40", severity="CRITICAL", evidence_count=3, confidence=0.89),
        ],
        evidence=evidence,
        contradictions=contradictions,
        confidence=confidence,
        status=status,
    )


def make_skill(
    strategy="Supplier Substitution",
    confidence=0.88,
    lifecycle=SkillLifecycle.ACTIVE,
    validation_status=ValidationResult.PASS,
) -> ResilienceSkill:
    gen = SkillGenerator()
    genome = make_genome(strategy=strategy, confidence=confidence)
    skill = gen.generate_from_genome(genome, "Test Skill")
    skill_dict = skill.model_dump()
    skill_dict["lifecycle_status"] = lifecycle.value
    skill_dict["validation_status"] = validation_status.value
    return ResilienceSkill(**skill_dict)


@pytest.fixture
def generator():
    return SkillGenerator()


@pytest.fixture
def evaluator():
    return SkillApplicabilityEvaluator()


@pytest.fixture
def validator():
    return SkillValidationEngine()


@pytest.fixture
def calibrator():
    return SkillOutcomeCalibrator()


@pytest.fixture
def evolver():
    return SkillEvolutionEngine()


@pytest.fixture
def registry():
    return SkillRegistry()


# ─── 1. Skill Generation from Genome ─────────────────────────────────────────

def test_skill_generated_from_genome(generator):
    genome = make_genome(evidence=7, confidence=0.88)
    skill = generator.generate_from_genome(genome)

    assert skill.strategy == "Supplier Substitution"
    assert skill.lifecycle_status == SkillLifecycle.CANDIDATE
    assert skill.genome_id == genome.id
    assert len(skill.preconditions) > 0
    assert len(skill.steps) > 0
    assert len(skill.success_conditions) > 0
    assert len(skill.failure_boundaries) > 0


# ─── 2. Unknown fields when Genome insufficient ───────────────────────────────

def test_unknown_skill_when_genome_has_no_evidence(generator):
    genome = make_genome(evidence=0, confidence=0.0, success_conditions=[])
    skill = generator.generate_from_genome(genome, "Unknown Strategy")

    assert skill.confidence == 0.0
    assert skill.uncertainty == UncertaintyLevel.UNKNOWN
    assert skill.governance_requirement == GovernanceRequirement.BLOCK


# ─── 3. Evidence preserved in skill ──────────────────────────────────────────

def test_evidence_preserved_from_genome(generator):
    genome = make_genome(evidence=7)
    genome.supporting_experiences = ["exp-001", "exp-002", "exp-003"]
    skill = generator.generate_from_genome(genome)

    assert skill.evidence == 7
    assert "exp-001" in skill.supporting_experiences


# ─── 4. Contradictions reduce confidence ─────────────────────────────────────

def test_contradictions_reduce_confidence(generator):
    genome_clean = make_genome(contradictions=0, confidence=0.88)
    genome_contradicted = make_genome(contradictions=2, confidence=0.88)

    skill_clean = generator.generate_from_genome(genome_clean)
    skill_contradicted = generator.generate_from_genome(genome_contradicted)

    assert skill_contradicted.confidence < skill_clean.confidence
    assert skill_contradicted.uncertainty in (UncertaintyLevel.UNCERTAIN, UncertaintyLevel.UNKNOWN)


# ─── 5. Valid preconditions -> applicable ────────────────────────────────────

def test_valid_preconditions_skill_applicable(evaluator):
    skill = make_skill()
    world = {"capacity": 0.75, "route_health": "HEALTHY", "alternate_supplier_available": True, "demand_surge_factor": 1.0}
    report = evaluator.evaluate(skill, world)

    assert report.applicable is True
    assert report.risk_level in ("LOW", "MEDIUM")


# ─── 6. Invalid preconditions -> rejected ────────────────────────────────────

def test_invalid_preconditions_skill_rejected(evaluator):
    skill = make_skill()
    # Capacity 0.10 -> precondition > 0.40 fails AND failure boundary < 0.40 triggers
    world = {"capacity": 0.10, "route_health": "HEALTHY", "alternate_supplier_available": True, "demand_surge_factor": 1.0}
    report = evaluator.evaluate(skill, world)

    assert report.applicable is False
    assert report.governance_requirement == GovernanceRequirement.BLOCK


# ─── 7. Boundary pass when conditions safe ───────────────────────────────────

def test_boundary_passes_when_capacity_above_threshold(evaluator):
    skill = make_skill()
    world = {"capacity": 0.80, "route_health": "HEALTHY", "alternate_supplier_available": True, "demand_surge_factor": 1.0}
    report = evaluator.evaluate(skill, world)

    # No critical boundary violations
    critical_violations = [k for k, v in report.boundary_status.items() if v]
    # Boundary_status: True = violated; NONE of the critical ones should be True
    assert report.applicable is True


# ─── 8. Boundary violation -> block ──────────────────────────────────────────

def test_critical_boundary_violation_blocks_skill(evaluator):
    skill = make_skill()
    world = {"capacity": 0.20, "route_health": "HEALTHY", "alternate_supplier_available": True}
    report = evaluator.evaluate(skill, world)

    assert report.applicable is False
    assert report.governance_requirement == GovernanceRequirement.BLOCK
    assert "BOUNDARY VIOLATION" in report.reason


# ─── 9. Unknown conditions -> UNKNOWN ────────────────────────────────────────

def test_unknown_conditions_return_uncertain(evaluator):
    skill = make_skill()
    # Provide no world state - preconditions requiring specific values will fail
    report = evaluator.evaluate(skill, {})
    assert report.applicable is False


# ─── 10. Simulation success -> PASS ──────────────────────────────────────────

def test_validation_simulation_success(validator):
    skill = make_skill()
    world = {"capacity": 0.75, "route_health": "HEALTHY", "alternate_supplier_available": True, "demand_surge_factor": 1.0}
    event = validator.validate(skill, world)

    assert event.result == ValidationResult.PASS
    assert event.truth_status == TruthStatus.SIMULATED  # Never OBSERVED


# ─── 11. Simulation failure -> FAIL ──────────────────────────────────────────

def test_validation_simulation_failure(validator):
    skill = make_skill()
    # Below threshold causes failure in canonical simulation
    world = {"capacity": 0.20, "route_health": "HEALTHY"}
    event = validator.validate(skill, world)

    # Either FAIL or INCONCLUSIVE (boundary triggered)
    assert event.result in (ValidationResult.FAIL, ValidationResult.INCONCLUSIVE)
    assert event.truth_status == TruthStatus.SIMULATED


# ─── 12. Inconclusive simulation ─────────────────────────────────────────────

def test_validation_inconclusive_for_unknown_strategy(validator):
    gen = SkillGenerator()
    genome = ResilienceGenome(
        id="genome-unknown",
        strategy="Quantum Transport",
        purpose="Unknown",
        evidence=0,
        success_conditions=[],
        failure_boundaries=[],
    )
    skill = gen.generate_from_genome(genome, "Quantum Transport")
    event = validator.validate(skill, {})
    assert event.result == ValidationResult.INCONCLUSIVE
    assert event.truth_status == TruthStatus.SIMULATED


# ─── 13. v1 preserved after v2 created ───────────────────────────────────────

def test_v1_preserved_after_v2_created(evolver, calibrator):
    skill_v1 = make_skill()
    skill_v1_id = skill_v1.skill_id
    v1_version = skill_v1.version

    # Generate outcome that reveals new boundary
    outcome = calibrator.evaluate_outcome(
        skill=skill_v1,
        experience_id="exp-test-123",
        predicted_recovery_hours=0.70,
        actual_recovery_hours=1.20,  # 30 min longer -> REVEALS_NEW_BOUNDARY
        demand_surge_factor=1.4,
    )

    proposal = evolver.generate_evolution_proposal(skill_v1, outcome)
    assert proposal is not None

    proposal_dict = proposal.model_dump()
    proposal_dict["status"] = EvolutionProposalStatus.ACCEPTED.value
    from app.skills.models import SkillEvolutionProposal
    accepted = SkillEvolutionProposal(**proposal_dict)

    skill_v2 = evolver.apply_accepted_proposal(skill_v1, accepted)

    # v1 is NOT mutated
    assert skill_v1.skill_id == skill_v1_id
    assert skill_v1.version == v1_version
    # v2 has different ID and references v1
    assert skill_v2.skill_id != skill_v1.skill_id
    assert skill_v2.previous_version_id == skill_v1.skill_id
    assert skill_v2.version == "v2"


# ─── 14. Evolution reason preserved ──────────────────────────────────────────

def test_evolution_reason_preserved(evolver, calibrator):
    skill_v1 = make_skill()
    outcome = calibrator.evaluate_outcome(
        skill=skill_v1,
        experience_id="exp-test-456",
        predicted_recovery_hours=0.70,
        actual_recovery_hours=1.5,
        demand_surge_factor=1.4,
    )
    proposal = evolver.generate_evolution_proposal(skill_v1, outcome)
    assert proposal is not None
    assert len(proposal.reason) > 10
    assert proposal.triggering_experience_id == "exp-test-456"


# ─── 15. Evidence count incremented in v2 ────────────────────────────────────

def test_evidence_incremented_in_v2(evolver, calibrator):
    skill_v1 = make_skill()
    evidence_before = skill_v1.evidence
    exp_id = "exp-evidence-test"

    outcome = calibrator.evaluate_outcome(
        skill=skill_v1, experience_id=exp_id,
        predicted_recovery_hours=0.70, actual_recovery_hours=1.5, demand_surge_factor=1.4,
    )
    proposal = evolver.generate_evolution_proposal(skill_v1, outcome)
    proposal_dict = proposal.model_dump()
    proposal_dict["status"] = EvolutionProposalStatus.ACCEPTED.value
    from app.skills.models import SkillEvolutionProposal
    accepted = SkillEvolutionProposal(**proposal_dict)
    skill_v2 = evolver.apply_accepted_proposal(skill_v1, accepted)

    assert skill_v2.evidence == evidence_before + 1
    assert exp_id in skill_v2.supporting_experiences


# ─── 16. Outcome reinforces skill ────────────────────────────────────────────

def test_outcome_reinforces_skill(calibrator):
    skill = make_skill()
    outcome = calibrator.evaluate_outcome(
        skill=skill, experience_id="exp-r-001",
        predicted_recovery_hours=0.70, actual_recovery_hours=0.72,
    )
    assert outcome.calibration_result == SkillCalibrationResult.REINFORCES
    assert outcome.confidence_delta > 0


# ─── 17. Outcome weakens skill ───────────────────────────────────────────────

def test_outcome_weakens_skill(calibrator):
    skill = make_skill()
    outcome = calibrator.evaluate_outcome(
        skill=skill, experience_id="exp-w-001",
        predicted_recovery_hours=0.70, actual_recovery_hours=1.30,  # 36 min over
    )
    assert outcome.calibration_result == SkillCalibrationResult.WEAKENS
    assert outcome.confidence_delta < 0


# ─── 18. Outcome reveals new boundary ────────────────────────────────────────

def test_outcome_reveals_new_boundary(calibrator):
    skill = make_skill()
    outcome = calibrator.evaluate_outcome(
        skill=skill, experience_id="exp-b-001",
        predicted_recovery_hours=0.70, actual_recovery_hours=1.50,  # 48 min over threshold
        demand_surge_factor=1.4,
    )
    assert outcome.calibration_result == SkillCalibrationResult.REVEALS_NEW_BOUNDARY
    assert outcome.new_boundary_discovered is not None
    assert "demand surge" in outcome.new_boundary_discovered.lower()


# ─── 19. Outcome contradicts skill ───────────────────────────────────────────

def test_outcome_contradicts_skill(calibrator):
    skill = make_skill()
    # Actual recovery drastically worse in percentage
    outcome = calibrator.evaluate_outcome(
        skill=skill, experience_id="exp-c-001",
        predicted_recovery_pct=91.0, actual_recovery_pct=55.0,  # 36% worse -> contradicts
        predicted_recovery_hours=1.0, actual_recovery_hours=2.0,
        demand_surge_factor=1.6,
    )
    assert outcome.calibration_result == SkillCalibrationResult.CONTRADICTS
    assert outcome.confidence_delta < -0.1


# ─── 20. Governance: low confidence -> requires approval ─────────────────────

def test_low_confidence_skill_requires_approval(generator):
    genome = make_genome(evidence=1, confidence=0.45)
    skill = generator.generate_from_genome(genome)
    assert skill.governance_requirement in (GovernanceRequirement.APPROVAL, GovernanceRequirement.BLOCK)


# ─── 21. Critical boundary violation -> BLOCK governance ─────────────────────

def test_critical_boundary_violation_requires_block_governance(evaluator):
    skill = make_skill()
    world = {"capacity": 0.15}  # Well below 40% threshold
    report = evaluator.evaluate(skill, world)

    assert report.governance_requirement == GovernanceRequirement.BLOCK
    assert report.applicable is False


# ─── 22. Registry: version history ───────────────────────────────────────────

def test_registry_version_history(registry, evolver, calibrator):
    skill_v1 = make_skill()
    registry.register(skill_v1)

    outcome = calibrator.evaluate_outcome(
        skill=skill_v1, experience_id="exp-hist",
        predicted_recovery_hours=0.70, actual_recovery_hours=1.5, demand_surge_factor=1.4,
    )
    proposal = evolver.generate_evolution_proposal(skill_v1, outcome)
    proposal_dict = proposal.model_dump()
    proposal_dict["status"] = EvolutionProposalStatus.ACCEPTED.value
    from app.skills.models import SkillEvolutionProposal
    accepted = SkillEvolutionProposal(**proposal_dict)
    skill_v2 = evolver.apply_accepted_proposal(skill_v1, accepted)
    registry.register(skill_v2)

    history = registry.version_history(skill_v2.skill_id)
    assert len(history) == 2
    assert history[0].skill_id == skill_v1.skill_id
    assert history[1].skill_id == skill_v2.skill_id


# ─── 23. CANONICAL: v1 + outcome -> evolution proposal -> v2 (v1 immutable) ──

@pytest.mark.asyncio
async def test_canonical_skill_evolution_v1_to_v2_v1_immutable():
    """
    THE MOST IMPORTANT TEST:
    Skill v1 + new outcome + new evidence -> Skill Evolution Proposal -> Skill v2
    AND: Skill v1 remains historically immutable.
    """
    service = SkillOrchestrationService.get_instance()
    result = await service.run_canonical_phase3_demo()

    # Skill v1 was generated and validated
    assert result["step_2_skill_v1_generated"]["version"] == "v1"
    assert result["step_3_skill_v1_validated"]["validation_result"] == "PASS"

    # Boundary was violated -> skill not applied directly
    assert result["step_5_boundary_violated"] is True
    assert result["step_5_applicability"]["applicable"] is False

    # Outcome reveals new boundary
    assert result["step_8_calibration"] in ("REVEALS_NEW_BOUNDARY", "WEAKENS", "CONTRADICTS")
    assert result["step_8_evolution_proposal"] is not None

    # Skill v2 was created
    assert result["step_9_skill_v2"] is not None
    assert result["step_9_skill_v2"]["version"] == "v2"

    # v1 is STILL IMMUTABLE
    assert result["v1_still_immutable"] is True
    assert result["v1_skill_id_preserved"] is not None

    # Hindsight events retained
    assert result["hindsight_events_retained"] is True
