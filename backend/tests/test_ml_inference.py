"""
FULFILL-X Inference Engine & Predictive Signal Unit Tests (Phase 6)
"""
import pytest
from app.ml.schemas import MLTaskType, PredictionHorizon
from app.ml.inference import PredictionService
from app.repository.world import WorldRepository


@pytest.mark.asyncio
async def test_prediction_service_inference_and_signal_publishing():
    world_repo = WorldRepository.get_instance()
    world_before = list(world_repo.graph.nodes.keys())

    pred = await PredictionService.predict_entity(
        organization_id="org-test",
        entity_id="wh-chicago",
        task_type=MLTaskType.DEMAND_FORECASTING,
        horizon=PredictionHorizon.H24,
    )

    assert pred.entity_id == "wh-chicago"
    assert pred.predicted_value is not None
    assert pred.human_explanation is not None

    # Assert world state graph nodes remain unchanged (Zero state mutation)
    world_after = list(world_repo.graph.nodes.keys())
    assert world_before == world_after
