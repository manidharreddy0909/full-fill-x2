"""
FULFILL-X Inference Engine & Predictive Signal Publisher (Phase 6)
Loads active models, computes inference, attaches uncertainty & explanations, and
emits PredictiveSignals into the deterministic Risk Engine.
"""
import uuid
import logging
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from app.ml.schemas import MLTaskType, Prediction, PredictionHorizon, UncertaintyEstimate
from app.ml.features import FeatureExtractor
from app.ml.registry import LocalModelRegistry
from app.ml.explainability import ExplanationGenerator
from app.schemas.signal import Signal, SignalType, SignalSeverity

logger = logging.getLogger("fulfillx.ml.inference")


class PredictionService:
    """
    Inference orchestrator producing strongly typed predictions and submitting
    PredictiveSignals to the Risk Engine without mutating authoritative world state.
    """

    @classmethod
    async def predict_entity(
        cls,
        organization_id: str,
        entity_id: str,
        task_type: MLTaskType,
        horizon: PredictionHorizon = PredictionHorizon.H24,
        operational_data: Optional[Dict[str, float]] = None,
        network_stats: Optional[Dict[str, Any]] = None,
        external_signals: Optional[List[Dict[str, Any]]] = None,
    ) -> Prediction:
        registry = LocalModelRegistry.get_instance()
        active_tuple = registry.get_active_model(organization_id, task_type)

        fset = FeatureExtractor.extract_features(
            entity_id=entity_id,
            operational_data=operational_data,
            network_stats=network_stats,
            external_signals=external_signals,
        )

        df = pd.DataFrame([{"timestamp": fset.timestamp, "entity_id": fset.entity_id, **fset.numerical_features}])

        if active_tuple:
            meta, model = active_tuple
            model_id = meta.model_id
            model_version = meta.model_version
            preds, uncertainties = model.predict(df)
            val = float(preds[0])
            unc = uncertainties[0]
            explanations = model.explain(df)[0]
        else:
            model_id = "mdl-fallback-default"
            model_version = "1.0.0"
            if task_type == MLTaskType.DEMAND_FORECASTING:
                val = 55.0
            elif task_type == MLTaskType.DISRUPTION_PROBABILITY:
                val = 0.25
            else:
                val = 0.15
            unc = UncertaintyEstimate(confidence=0.75, prediction_interval_lower=max(0.0, val - 10), prediction_interval_upper=val + 10)
            explanations = []

        human_expl = ExplanationGenerator.generate_human_explanation(
            task_type=task_type, entity_id=entity_id, explanations=explanations, val=val
        )

        pred = Prediction(
            prediction_id=f"pred-{uuid.uuid4().hex[:8]}",
            organization_id=organization_id,
            model_id=model_id,
            model_version=model_version,
            task_type=task_type,
            entity_id=entity_id,
            generated_at=datetime.now(timezone.utc),
            horizon=horizon,
            predicted_value=val if task_type == MLTaskType.DEMAND_FORECASTING else None,
            disruption_probability=val if task_type == MLTaskType.DISRUPTION_PROBABILITY else None,
            anomaly_score=val if task_type == MLTaskType.ANOMALY_DETECTION else None,
            is_anomaly=(val >= 0.70) if task_type == MLTaskType.ANOMALY_DETECTION else None,
            uncertainty=unc,
            explanations=explanations,
            human_explanation=human_expl,
            feature_schema_version=FeatureExtractor.FEATURE_SCHEMA_VERSION,
            provenance_id=f"prov-pred-{uuid.uuid4().hex[:6]}",
        )

        # Publish PredictiveSignal into Risk Engine without state mutation
        await cls._publish_predictive_signal(organization_id, pred)

        # Emit Realtime Event
        try:
            from app.realtime.event_bus import event_bus
            from app.schemas.events import EventType
            await event_bus.publish(
                event_type=EventType.PREDICTION_CREATED,
                payload=pred.model_dump(mode="json"),
                organization_id=organization_id,
                source="prediction_service",
            )
        except Exception as ex:
            logger.debug(f"Event publish failed for prediction: {ex}")

        return pred

    @classmethod
    async def _publish_predictive_signal(cls, organization_id: str, pred: Prediction) -> None:
        """Inject predictive intelligence into SignalFusionEngine / RiskRepository."""
        try:
            from app.repository.risk import RiskRepository
            from app.engine.fusion import signal_fusion_engine

            sev = SignalSeverity.HIGH if (pred.disruption_probability or 0.0) >= 0.5 or (pred.anomaly_score or 0.0) >= 0.7 else SignalSeverity.MEDIUM
            sig_type = SignalType.WEATHER if "WEATHER" in pred.human_explanation else SignalType.LOGISTICS

            sig = Signal(
                type=sig_type,
                severity=sev,
                title=f"Predictive Signal: {pred.task_type.value}",
                description=pred.human_explanation,
                confidence=pred.uncertainty.confidence,
                source=f"ml_model_{pred.model_id}",
                affected_node_ids=[pred.entity_id],
                created_at=pred.generated_at,
                raw_data={
                    "prediction_id": pred.prediction_id,
                    "task_type": pred.task_type.value,
                    "horizon": pred.horizon.value,
                    "disruption_probability": pred.disruption_probability,
                    "anomaly_score": pred.anomaly_score,
                    "human_explanation": pred.human_explanation,
                },
            )

            risk_repo = RiskRepository.get_instance()
            risk_repo.add_signal(sig)
            signal_fusion_engine.add_signal(sig)
            logger.debug(f"Published PredictiveSignal '{sig.id}' for entity '{pred.entity_id}'")
        except Exception as ex:
            logger.warning(f"Error publishing PredictiveSignal: {ex}")
