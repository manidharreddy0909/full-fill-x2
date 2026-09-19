"""
FULFILL-X Model Explainability Subsystem (Phase 6)
Generates deterministic evidence drivers and human-readable natural language explanations.
"""
from typing import List
from app.ml.schemas import MLTaskType, FeatureExplanation


class ExplanationGenerator:
    """
    Converts feature contributions into human-readable, deterministic explanation narratives.
    """

    @classmethod
    def generate_human_explanation(
        cls, task_type: MLTaskType, entity_id: str, explanations: List[FeatureExplanation], val: float
    ) -> str:
        if not explanations:
            return f"Predictive model assessed entity '{entity_id}' with standard baseline metrics."

        top_drivers = explanations[:3]
        driver_strings = [
            f"{i+1}. {d.feature_name.replace('_', ' ')} ({d.direction.lower()} by {abs(d.contribution_value)})"
            for i, d in enumerate(top_drivers)
        ]
        drivers_formatted = "; ".join(driver_strings)

        if task_type == MLTaskType.DEMAND_FORECASTING:
            return (
                f"Demand forecast for '{entity_id}' predicted at {val:.1f} units. "
                f"Primary drivers: {drivers_formatted}."
            )
        elif task_type == MLTaskType.DISRUPTION_PROBABILITY:
            prob_pct = int(val * 100)
            risk_level = "ELEVATED" if val >= 0.5 else "LOW"
            return (
                f"Disruption probability for '{entity_id}' evaluated at {prob_pct}% ({risk_level} risk). "
                f"Key drivers: {drivers_formatted}."
            )
        else:
            status_str = "ANOMALOUS" if val >= 0.70 else "NORMAL"
            return (
                f"Operational behavior for '{entity_id}' scored at {val:.2f} ({status_str}). "
                f"Significant metric deviations: {drivers_formatted}."
            )
