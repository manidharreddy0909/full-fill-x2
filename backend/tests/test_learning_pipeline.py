"""
FULFILL-X Continuous Learning Pipeline Unit Tests (Phase 9)
Validates dataset versioning, Challenger model retraining, human approval gates, and one-click rollback.
"""
import pytest
from app.agents.resilience.learning import ContinuousLearningPipeline
from app.agents.resilience.outcomes import OutcomeEngine
from app.agents.resilience.schemas import ChallengerStatus


def test_learning_pipeline_training_and_governance():
    """Verify dataset creation, challenger model training, activation gate, and rollback."""
    outcome_engine = OutcomeEngine()
    out = outcome_engine.record_outcome(
        decision_id="DEC-101",
        expected_service_level=0.90,
        actual_service_level=0.88,
        expected_cost=10000.0,
        actual_cost=10500.0,
        expected_recovery_hours=12.0,
        actual_recovery_hours=13.0,
    )

    pipeline = ContinuousLearningPipeline()
    ds = pipeline.create_dataset(name="TestDataset", outcomes=[out])
    assert ds.dataset_id.startswith("ds-")

    chal, run = pipeline.train_challenger(dataset_id=ds.dataset_id, model_name="DemandForecastModel")
    assert chal.status == ChallengerStatus.CANDIDATE
    assert run.is_improvement is True

    # Human Activation Gate
    activated = pipeline.activate_challenger(
        challenger_id=chal.challenger_id,
        approved_by="CSCO",
        activation_reason="Validated baseline improvement",
    )
    assert activated.status == ChallengerStatus.ACTIVE
    assert pipeline.active_models["DemandForecastModel"] == chal.challenger_id

    # One-Click Rollback
    reverted_id = pipeline.rollback_model("DemandForecastModel", approved_by="Ops Lead")
    assert reverted_id == "m-demand-v1.0"
    assert pipeline.active_models["DemandForecastModel"] == "m-demand-v1.0"
