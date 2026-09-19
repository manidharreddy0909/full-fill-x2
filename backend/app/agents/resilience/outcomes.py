"""
FULFILL-X Outcome Capture Engine (Phase 9)
Records ground-truth observed outcomes against expected decision predictions.
Calculates metric deviations (service level, cost, recovery hours) and component attribution.
"""
from typing import Dict, List, Optional
from uuid import uuid4

from app.agents.resilience.schemas import OutcomeRecord


class OutcomeEngine:
    """
    Engine for recording operational decision outcomes and deviations.
    """

    def __init__(self):
        self._outcomes: Dict[str, OutcomeRecord] = {}

    def record_outcome(
        self,
        decision_id: str,
        expected_service_level: float,
        actual_service_level: float,
        expected_cost: float,
        actual_cost: float,
        expected_recovery_hours: float,
        actual_recovery_hours: float,
        organization_id: str = "org-fulfillx-default",
        attribution_map: Optional[Dict[str, float]] = None,
    ) -> OutcomeRecord:
        """
        Record observed outcome and calculate absolute deviations vs expected values.
        """
        svc_dev = round(actual_service_level - expected_service_level, 4)
        cost_dev = round(actual_cost - expected_cost, 2)
        rec_dev = round(actual_recovery_hours - expected_recovery_hours, 2)

        attr = attribution_map or {
            "predictive_ml": 0.35,
            "gnn_causal": 0.25,
            "digital_twin": 0.25,
            "specialist_agents": 0.15,
        }

        rec = OutcomeRecord(
            outcome_id=f"out-{uuid4().hex[:8]}",
            decision_id=decision_id,
            organization_id=organization_id,
            expected_service_level=expected_service_level,
            actual_service_level=actual_service_level,
            expected_cost=expected_cost,
            actual_cost=actual_cost,
            expected_recovery_hours=expected_recovery_hours,
            actual_recovery_hours=actual_recovery_hours,
            service_deviation=svc_dev,
            cost_deviation=cost_dev,
            recovery_deviation=rec_dev,
            attribution_map=attr,
        )
        self._outcomes[rec.outcome_id] = rec
        return rec

    def get_outcome(self, outcome_id: str) -> Optional[OutcomeRecord]:
        return self._outcomes.get(outcome_id)

    def list_outcomes(self, organization_id: str = "org-fulfillx-default") -> List[OutcomeRecord]:
        return [o for o in self._outcomes.values() if o.organization_id == organization_id]
