"""
FULFILL-X Multi-Agent Deliberation & Debate Unit Tests (Phase 9)
Validates evidence-first deliberation sessions, bounded multi-agent debate (max 3 rounds),
and DecisionEvidenceBundle structure.
"""
import pytest
from app.agents.resilience.deliberation import DeliberationOrchestrator
from app.agents.resilience.schemas import ConsensusStatus


def test_deliberation_workflow():
    """Verify orchestration of multi-agent debate and evidence bundle generation."""
    orchestrator = DeliberationOrchestrator(max_rounds=3)

    session = orchestrator.deliberate(
        target_node_ids=["sup-001", "port-001"],
    )

    assert session.deliberation_id.startswith("delib-")
    assert len(session.rounds) == 2
    assert session.consensus_status == ConsensusStatus.AGREEMENT
    assert session.evidence_bundle.proposal_id.startswith("prop-")
    assert session.evidence_bundle.overall_confidence > 0.8
    assert "Consensus Candidate C" in session.final_recommendation
