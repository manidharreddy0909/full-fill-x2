"""
FULFILL-X Feedback Engine Unit Tests (Phase 9)
Validates feedback record generation and accuracy scoring against captured outcomes.
"""
import pytest
from app.agents.resilience.feedback import FeedbackEngine
from app.agents.resilience.outcomes import OutcomeEngine
from app.agents.resilience.schemas import FeedbackType


def test_feedback_generation():
    """Verify feedback record classification based on outcome deviations."""
    outcome_engine = OutcomeEngine()
    feedback_engine = FeedbackEngine()

    out = outcome_engine.record_outcome(
        decision_id="DEC-46",
        expected_service_level=0.90,
        actual_service_level=0.89,
        expected_cost=50000.0,
        actual_cost=51000.0,
        expected_recovery_hours=24.0,
        actual_recovery_hours=24.5,
    )

    fbk = feedback_engine.generate_feedback(out)
    assert fbk.feedback_id.startswith("fbk-")
    assert fbk.feedback_type == FeedbackType.CORRECT
    assert fbk.accuracy_score == 0.95
