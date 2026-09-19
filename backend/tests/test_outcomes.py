"""
FULFILL-X Outcome Capture Engine Unit Tests (Phase 9)
Validates expected vs actual metric deviation calculations and component attribution mapping.
"""
import pytest
from app.agents.resilience.outcomes import OutcomeEngine


def test_outcome_capture_and_deviations():
    """Verify recording of observed outcomes and calculation of metric deviations."""
    engine = OutcomeEngine()

    outcome = engine.record_outcome(
        decision_id="DEC-45",
        expected_service_level=0.94,
        actual_service_level=0.918,
        expected_cost=1200000.0,
        actual_cost=1270000.0,
        expected_recovery_hours=36.0,
        actual_recovery_hours=41.0,
    )

    assert outcome.outcome_id.startswith("out-")
    assert round(outcome.service_deviation, 3) == -0.022
    assert outcome.cost_deviation == 70000.0
    assert outcome.recovery_deviation == 5.0
    assert "predictive_ml" in outcome.attribution_map
