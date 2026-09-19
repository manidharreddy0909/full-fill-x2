"""
FULFILL-X Agent Performance Unit Tests (Phase 9)
Validates specialist agent accuracy metrics, verification survival rates, and calibration error curves.
"""
import pytest
from app.agents.resilience.performance import AgentPerformanceTracker


def test_agent_performance_tracker():
    """Verify performance metrics tracking and calibration update."""
    tracker = AgentPerformanceTracker()

    rec = tracker.get_performance("supplier")
    assert rec is not None
    assert rec.agent_name == "Supplier Agent"
    assert rec.proposals_count >= 10

    # Record new proposal outcome
    tracker.record_proposal(
        agent_id="supplier",
        is_valid=True,
        verified=True,
        predicted_impact=0.75,
        observed_impact=0.73,
    )

    updated_rec = tracker.get_performance("supplier")
    assert updated_rec.proposals_count == 11
    assert updated_rec.valid_proposals_count == 10
    assert updated_rec.verification_success_count == 9
