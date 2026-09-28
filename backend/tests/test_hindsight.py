"""
Unit & Integration Tests for Hindsight Experiential Resilience Memory (Phase 2A)

Tests:
1. Retain experience
2. Recall relevant experience
3. Reflect multiple experiences
4. Extract success condition
5. Extract failure boundary
6. Contradiction preservation
7. Transfer success
8. Transfer failure (boundary breach)
9. UNKNOWN when evidence is insufficient
10. Simulated vs observed provenance distinction
11. Governance cannot be bypassed
12. Outcome creates a new experience
13. CANONICAL RULE: Historical success + current boundary breach ==> Historical strategy NOT blindly reused!
"""
import pytest
import pytest_asyncio
from datetime import datetime, timezone
import uuid

from app.hindsight.models import (
    Experience,
    RecallQuery,
    RecallResult,
    ResilienceGenome,
    SuccessCondition,
    FailureBoundary,
    TransferAssessment,
    TransferabilityState,
    CurrentContext,
    RetainResult,
    OutcomeStatus,
    PolicyDecisionStatus,
    GenomeStatus,
)
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata
from app.hindsight.client import HindsightClient
from app.hindsight.retain import ExperienceRecorder
from app.hindsight.recall import ExperienceRetriever
from app.hindsight.reflect import ReflectionEngine
from app.hindsight.transfer import TransferEvaluator
from app.hindsight.service import HindsightOrchestratorService


@pytest.fixture
def hindsight_client():
    return HindsightClient(mode="mock")


@pytest.fixture
def recorder(hindsight_client):
    return ExperienceRecorder(client=hindsight_client)


@pytest.fixture
def retriever(hindsight_client):
    return ExperienceRetriever(client=hindsight_client)


@pytest.fixture
def reflector():
    return ReflectionEngine()


@pytest.fixture
def evaluator():
    return TransferEvaluator()


# ─── 1. Retain Experience Test ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_retain_experience(recorder):
    exp = Experience(
        experience_id=f"exp-test-{uuid.uuid4().hex[:6]}",
        incident_id="inc-test-01",
        incident_signature="CAPACITY_DEGRADATION:sup-001",
        decision="Shift order volume to Supplier C",
        action={"type": "SUPPLIER_SUBSTITUTION", "target": "sup-003"},
        predicted_outcome={"recovery_hours": 4.0},
        actual_outcome={"recovery_hours": 3.8, "status": "SUCCESS"},
        outcome_status=OutcomeStatus.SUCCESS,
        success_conditions=["Supplier capacity >= 50%"],
        failure_boundaries=["Supplier capacity < 30%"],
        provenance=ProvenanceMetadata(source_type=TruthStatus.OBSERVED, is_simulation=False),
        truth_status=TruthStatus.OBSERVED,
    )

    result = await recorder.retain_experience(exp)
    assert result.success is True
    assert result.experience_id == exp.experience_id
    assert result.truth_status == TruthStatus.OBSERVED


# ─── 2. Recall Relevant Experience Test ───────────────────────────────────────

@pytest.mark.asyncio
async def test_recall_relevant_experience(recorder, retriever):
    # Retain known test experience
    sig = f"TEST_DISRUPTION:{uuid.uuid4().hex[:4]}"
    exp = Experience(
        experience_id=f"exp-recall-{uuid.uuid4().hex[:6]}",
        incident_id="inc-recall-01",
        incident_signature=sig,
        decision="Reroute logistics via Rail",
        action={"type": "REROUTE"},
        outcome_status=OutcomeStatus.SUCCESS,
        confidence=0.95,
        truth_status=TruthStatus.OBSERVED,
    )
    await recorder.retain_experience(exp)

    # Query by incident signature
    recall_res: RecallResult = await retriever.recall(
        RecallQuery(incident_signature=sig, min_confidence=0.8)
    )

    assert recall_res.total_found >= 1
    found_ids = [e.experience_id for e in recall_res.experiences]
    assert exp.experience_id in found_ids
    assert recall_res.observed_count >= 1


# ─── 3 & 4 & 5. Reflect, Extract Conditions & Boundaries ───────────────────────

def test_reflect_extract_conditions_and_boundaries(reflector):
    exp1 = Experience(
        experience_id="exp-ref-1",
        incident_id="inc-1",
        incident_signature="CAPACITY_DEGRADATION:sup-002",
        decision="Supplier Substitution",
        outcome_status=OutcomeStatus.SUCCESS,
        success_conditions=["Substitute capacity > 40%", "Route healthy"],
        confidence=0.9,
    )
    exp2 = Experience(
        experience_id="exp-ref-2",
        incident_id="inc-2",
        incident_signature="CAPACITY_DEGRADATION:sup-002",
        decision="Supplier Substitution",
        outcome_status=OutcomeStatus.FAILURE,
        failure_boundaries=["Substitute capacity < 40% causes secondary delay"],
        confidence=0.85,
    )

    genome: ResilienceGenome = reflector.reflect_experiences(
        [exp1, exp2], strategy_name="Supplier Substitution"
    )

    assert genome.strategy == "Supplier Substitution"
    assert len(genome.success_conditions) >= 2
    assert len(genome.failure_boundaries) >= 1
    assert any("Substitute capacity > 40%" in sc.text for sc in genome.success_conditions)
    assert any("Substitute capacity < 40%" in fb.text for fb in genome.failure_boundaries)
    assert genome.confidence > 0.5


# ─── 6. Contradiction Preservation Test ───────────────────────────────────────

def test_contradiction_preservation(reflector):
    # Two experiences with conflicting observations for the same parameter
    exp_success = Experience(
        experience_id="exp-contra-1",
        incident_id="inc-contra-1",
        incident_signature="PORT_CLOSURE:port-001",
        decision="Air Freight Bypass",
        outcome_status=OutcomeStatus.SUCCESS,
        success_conditions=["Air charter booking confirmed"],
        confidence=0.9,
    )
    exp_failure = Experience(
        experience_id="exp-contra-2",
        incident_id="inc-contra-2",
        incident_signature="PORT_CLOSURE:port-001",
        decision="Air Freight Bypass",
        outcome_status=OutcomeStatus.FAILURE,
        failure_boundaries=["Air charter booking confirmed but customs blocked"],
        confidence=0.85,
    )

    genome = reflector.reflect_experiences([exp_success, exp_failure], strategy_name="Air Freight Bypass")
    assert genome.contradictions >= 1
    assert genome.status == GenomeStatus.CONTRADICTED


# ─── 7. Transfer Success Test ────────────────────────────────────────────────

def test_transfer_success(evaluator):
    genome = ResilienceGenome(
        id="genome-test-transfer",
        strategy="Warehouse Reallocation",
        purpose="Balance regional inventories",
        success_conditions=[
            SuccessCondition(text="Source stock >= 150%", parameter="capacity", threshold="> 0.40")
        ],
        failure_boundaries=[
            FailureBoundary(text="Source stock < 100%", parameter="capacity", threshold="< 0.40")
        ],
        evidence=4,
    )

    # Operating under healthy capacity (75%)
    ctx = CurrentContext(
        incident_signature="INVENTORY_IMBALANCE:wh-001",
        target_node_id="wh-001",
        current_capacity=0.75,
        route_status="HEALTHY",
    )

    assessment: TransferAssessment = evaluator.evaluate(genome, ctx)
    assert assessment.status == TransferabilityState.TRANSFERABLE
    assert len(assessment.transferable_conditions) >= 1
    assert len(assessment.violated_conditions) == 0


# ─── 8. Transfer Failure (Boundary Breach) Test ───────────────────────────────

def test_transfer_failure_boundary_breach(evaluator):
    genome = ResilienceGenome(
        id="genome-supplier-sub",
        strategy="Supplier Substitution",
        purpose="Substitute degraded supplier",
        success_conditions=[
            SuccessCondition(text="Capacity must exceed 40%", parameter="capacity", threshold="> 0.40")
        ],
        failure_boundaries=[
            FailureBoundary(text="Capacity < 40% causes cascade", parameter="capacity", threshold="< 0.40", severity="CRITICAL")
        ],
        evidence=5,
    )

    # Current capacity is 28% (< 40% threshold)
    ctx = CurrentContext(
        incident_signature="CAPACITY_DEGRADATION:sup-002",
        target_node_id="sup-002",
        current_capacity=0.28,
        route_status="HEALTHY",
    )

    assessment: TransferAssessment = evaluator.evaluate(genome, ctx)
    assert assessment.status in (TransferabilityState.PARTIAL, TransferabilityState.NON_TRANSFERABLE)
    assert len(assessment.violated_conditions) >= 1
    assert "materially different capacity conditions" in assessment.reason
    assert assessment.requires_human_approval is True


# ─── 9. UNKNOWN When Evidence is Insufficient ─────────────────────────────────

def test_transfer_unknown_when_insufficient_evidence(evaluator):
    provisional_genome = ResilienceGenome(
        strategy="Quantum Transport",
        purpose="Unproven speculative strategy",
        evidence=0,
        success_conditions=[],
        failure_boundaries=[],
    )
    ctx = CurrentContext(
        incident_signature="UNKNOWN_DISRUPTION:node-99",
        target_node_id="node-99",
    )

    assessment = evaluator.evaluate(provisional_genome, ctx)
    assert assessment.status == TransferabilityState.UNKNOWN
    assert "Insufficient historical evidence" in assessment.reason


# ─── 10. Simulated vs Observed Provenance Distinction ─────────────────────────

def test_simulated_vs_observed_provenance():
    # Attempting to declare simulation as OBSERVED must fail assertion
    provenance = ProvenanceMetadata(
        source_type=TruthStatus.OBSERVED,
        is_simulation=True,
    )
    with pytest.raises(ValueError, match="CRITICAL INTEGRITY VIOLATION"):
        provenance.validate_simulation_boundary()

    # Valid simulation provenance passes
    sim_provenance = ProvenanceMetadata(
        source_type=TruthStatus.SIMULATED,
        is_simulation=True,
    )
    sim_provenance.validate_simulation_boundary()
    assert sim_provenance.source_type == TruthStatus.SIMULATED


# ─── 11. Governance Cannot Be Bypassed ────────────────────────────────────────

def test_governance_cannot_be_bypassed(evaluator):
    genome = ResilienceGenome(
        strategy="High-Risk Route Override",
        purpose="Route hazardous cargo through restricted sector",
        success_conditions=[SuccessCondition(text="Speed advantage > 2x")],
        failure_boundaries=[FailureBoundary(text="Violates environmental zone", severity="CRITICAL")],
        evidence=2,
    )
    ctx = CurrentContext(
        incident_signature="CRITICAL_DELAY:edge-001",
        target_node_id="edge-001",
        current_capacity=0.2,
    )

    assessment = evaluator.evaluate(genome, ctx)
    # Even if similarity is high, human operator approval remains mandatory
    assert assessment.requires_human_approval is True


# ─── 12 & 13. CANONICAL VERTICAL SLICE & CLOSED LEARNING LOOP ─────────────────

@pytest.mark.asyncio
async def test_canonical_vertical_slice_before_and_after():
    """
    Demonstrates:
    1. BEFORE MEMORY: Naive strategy selection attempts direct substitution without knowing boundary.
    2. AFTER MEMORY: Recalls historical substitution, catches capacity boundary (28% < 40%),
       refuses blind reuse, adapts to Emergency Draw from Warehouse C, validates, verifies,
       and retains new experience.
    """
    service = HindsightOrchestratorService.get_instance()

    # BEFORE MEMORY
    before_res = await service.run_canonical_slice(supplier_d_capacity=0.28, enable_memory=False)
    assert before_res["mode"] == "BEFORE_MEMORY"
    assert before_res["memory_recalled"] is False
    assert "Supplier D Substitution (Blind)" in before_res["strategy_selected"]

    # AFTER MEMORY
    after_res = await service.run_canonical_slice(supplier_d_capacity=0.28, enable_memory=True)
    assert after_res["mode"] == "AFTER_MEMORY"
    assert after_res["memory_recalled"] is True
    assert after_res["boundary_violated"] is True
    assert after_res["executed_strategy"] == "Emergency Inventory Draw (Warehouse C Reserves)"
    assert after_res["learning_loop_closed"] is True
    assert after_res["new_experience_retained"].startswith("exp-")
    assert "BEHAVIOR CHANGE" in after_res["behavior_change"]
