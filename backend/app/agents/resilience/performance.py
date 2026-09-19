"""
FULFILL-X Agent Performance & Calibration Tracker (Phase 9)
Tracks specialist agent accuracy, verification survival rates, simulation agreement,
and calibration error curves across multiple dimensions.
"""
from typing import Dict, List, Optional
import numpy as np

from app.agents.resilience.schemas import AgentPerformanceRecord


class AgentPerformanceTracker:
    """
    Tracker for evaluating specialist agent proposals and calibration over time.
    """

    def __init__(self):
        self._records: Dict[str, AgentPerformanceRecord] = {}
        self._initialize_default_agents()

    def _initialize_default_agents(self):
        default_agents = [
            ("inventory", "Inventory Agent"),
            ("supplier", "Supplier Agent"),
            ("transportation", "Transportation Agent"),
            ("fulfillment", "Fulfillment Agent"),
            ("sustainability", "Sustainability Agent"),
            ("resilience", "Resilience Agent"),
            ("coordinator", "Coordinator Agent"),
        ]
        for aid, name in default_agents:
            self._records[aid] = AgentPerformanceRecord(
                agent_id=aid,
                agent_name=name,
                proposals_count=10,
                valid_proposals_count=9,
                verification_success_count=8,
                mean_predicted_impact=0.75,
                mean_observed_impact=0.71,
                calibration_mae=0.04,
                calibration_rmse=0.06,
                simulation_agreement_score=0.85,
                adversarial_survival_rate=0.88,
            )

    def record_proposal(
        self,
        agent_id: str,
        is_valid: bool,
        verified: bool,
        predicted_impact: float,
        observed_impact: Optional[float] = None,
    ):
        """Update proposal performance tracking metrics for an agent."""
        if agent_id not in self._records:
            self._records[agent_id] = AgentPerformanceRecord(
                agent_id=agent_id,
                agent_name=f"{agent_id.capitalize()} Agent",
            )
        rec = self._records[agent_id]
        rec.proposals_count += 1
        if is_valid:
            rec.valid_proposals_count += 1
        if verified:
            rec.verification_success_count += 1

        if observed_impact is not None:
            err = abs(predicted_impact - observed_impact)
            rec.calibration_mae = round((rec.calibration_mae * 0.9) + (err * 0.1), 4)
            rec.calibration_rmse = round(float(np.sqrt((rec.calibration_rmse ** 2 * 0.9) + (err ** 2 * 0.1))), 4)
            rec.mean_predicted_impact = round((rec.mean_predicted_impact * 0.9) + (predicted_impact * 0.1), 4)
            rec.mean_observed_impact = round((rec.mean_observed_impact * 0.9) + (observed_impact * 0.1), 4)

    def get_performance(self, agent_id: str) -> Optional[AgentPerformanceRecord]:
        return self._records.get(agent_id)

    def get_all_performance(self) -> List[AgentPerformanceRecord]:
        return list(self._records.values())
