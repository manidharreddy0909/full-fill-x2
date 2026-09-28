"""
FULFILL-X Counterfactual Engine (Phase 4)

Executes counterfactual simulation branches comparing:
"What would have happened if we used Skill A?"
vs
"What would have happened if we used Alternative Strategy B (or Baseline)?"

Strictly preserves TruthStatus.SIMULATED and is_simulation=True.
Never mutates authoritative world state or promotes simulation to observed reality.
"""
import logging
from typing import Dict, Any, Optional, Tuple
import uuid

from app.challenge.models import CounterfactualComparison
from app.skills.models import ResilienceSkill, ValidationResult
from app.skills.validator import SkillValidationEngine
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata

logger = logging.getLogger("fulfill-x.challenge.counterfactual")


class CounterfactualEngine:
    """
    Simulates counterfactual branches under identical perturbed world states.
    Reuses deterministic simulation and validation logic.
    """

    def __init__(self, validator: Optional[SkillValidationEngine] = None):
        self.validator = validator or SkillValidationEngine()

    def simulate_skill_action(
        self,
        skill: ResilienceSkill,
        world_state: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Simulate the primary skill intervention in the given world state.
        Returns outcome dict: recovery_hours, service_level, cost, success, boundary_violated.
        """
        cap = float(world_state.get("capacity", 0.70))
        demand_surge = float(world_state.get("demand_surge_factor", 1.0))
        transit_delay = float(world_state.get("transit_delay_hours", 0.0))

        # Check preconditions & boundaries
        is_precondition_ok = True
        boundary_violated = False

        for pre in skill.preconditions:
            if not pre.evaluate(world_state):
                is_precondition_ok = False

        for fb in skill.failure_boundaries:
            if fb.parameter == "capacity":
                thresh = 0.40
                if fb.threshold:
                    try:
                        thresh = float(fb.threshold.replace("<", "").replace("<=", "").strip())
                    except Exception:
                        pass
                if cap < thresh:
                    boundary_violated = True
            elif fb.parameter == "demand_surge_factor":
                thresh = 1.3
                if demand_surge > thresh:
                    boundary_violated = True

        # Calculate simulated outcomes based on strategy type
        if "supplier" in skill.name.lower() or "substitution" in skill.name.lower():
            if boundary_violated or cap < 0.40:
                # Capacity below boundary -> failure or degraded recovery
                success = False
                service_level = round(max(0.40, cap * 1.1), 3)
                recovery_hours = round(6.5 + transit_delay, 1)
                cost = 8500.0
            elif demand_surge > 1.4:
                # Demand surge overload
                success = False
                service_level = 0.72
                recovery_hours = 5.8
                cost = 11000.0
            else:
                # Safe operation
                success = True
                service_level = round(min(0.96, 0.82 + cap * 0.15), 3)
                recovery_hours = round(max(1.5, 3.2 + transit_delay * 0.5), 1)
                cost = 9800.0
        else:
            # Generic skill
            success = is_precondition_ok and not boundary_violated
            service_level = 0.88 if success else 0.55
            recovery_hours = 2.5 if success else 7.0
            cost = 7000.0

        return {
            "strategy": skill.name,
            "action_type": "SKILL_EXECUTION",
            "success": success,
            "boundary_violated": boundary_violated,
            "service_level": service_level,
            "recovery_hours": recovery_hours,
            "cost": cost,
            "capacity": cap,
            "demand_surge": demand_surge,
        }

    def simulate_alternative_action(
        self,
        alternative_strategy: str,
        world_state: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Simulate an alternative recovery strategy or baseline inaction.
        """
        cap = float(world_state.get("capacity", 0.70))
        demand_surge = float(world_state.get("demand_surge_factor", 1.0))
        alt_lower = alternative_strategy.lower()

        if "inventory" in alt_lower or "reserve" in alt_lower:
            # Emergency inventory draw: robust against supplier capacity collapse
            # because it sources from reserves rather than the degraded supplier
            success = True
            service_level = 0.92
            recovery_hours = 1.8
            cost = 14200.0
            action_desc = "Emergency inventory draw from Warehouse C regional reserves"
        elif "production" in alt_lower or "reroute" in alt_lower:
            success = cap >= 0.30
            service_level = 0.78 if success else 0.52
            recovery_hours = 4.2 if success else 8.5
            cost = 5200.0
            action_desc = "Production rescheduling and alternate line dispatch"
        else:
            # Baseline (No Action)
            success = False
            service_level = round(max(0.20, cap * 0.8), 3)
            recovery_hours = 12.0
            cost = 0.0
            action_desc = "Baseline (No Action / Standard backlog absorption)"

        return {
            "strategy": alternative_strategy,
            "action_type": "ALTERNATIVE_EXECUTION",
            "action_description": action_desc,
            "success": success,
            "service_level": service_level,
            "recovery_hours": recovery_hours,
            "cost": cost,
        }

    def evaluate_counterfactual(
        self,
        skill: ResilienceSkill,
        scenario_id: str,
        world_state: Dict[str, Any],
        alternative_strategy: str = "Emergency Inventory Draw (Warehouse C Reserves)",
    ) -> CounterfactualComparison:
        """
        Execute both counterfactual branches and construct the comparison.
        """
        skill_res = self.simulate_skill_action(skill, world_state)
        alt_res = self.simulate_alternative_action(alternative_strategy, world_state)

        delta_sl = round(skill_res["service_level"] - alt_res["service_level"], 3)
        delta_rec = round(skill_res["recovery_hours"] - alt_res["recovery_hours"], 2)
        delta_cost = round(skill_res["cost"] - alt_res["cost"], 2)

        # Recommendation synthesis
        if not skill_res["success"] and alt_res["success"]:
            rec = (
                f"COUNTERFACTUAL RECOMMENDATION: Alternative '{alternative_strategy}' is superior "
                f"under current conditions. Skill '{skill.name}' fails recovery (service level {skill_res['service_level']:.1%}, "
                f"recovery {skill_res['recovery_hours']}h), whereas alternative achieves {alt_res['service_level']:.1%} "
                f"in {alt_res['recovery_hours']}h."
            )
        elif skill_res["success"] and not alt_res["success"]:
            rec = (
                f"COUNTERFACTUAL CONFIRMATION: Skill '{skill.name}' is strictly superior to alternative "
                f"'{alternative_strategy}' (service level delta {delta_sl:+.1%}, recovery delta {delta_rec:+.1f}h)."
            )
        else:
            rec = (
                f"COUNTERFACTUAL TRADE-OFF: Skill '{skill.name}' vs '{alternative_strategy}'. "
                f"Service level diff: {delta_sl:+.1%}, Recovery diff: {delta_rec:+.1f}h, Cost diff: ${delta_cost:+,.0f}."
            )

        return CounterfactualComparison(
            comparison_id="cf-" + uuid.uuid4().hex[:8],
            scenario_id=scenario_id,
            skill_id=skill.skill_id,
            skill_version=skill.version,
            skill_name=skill.name,
            skill_action={
                "type": "SKILL_ACTION",
                "skill_name": skill.name,
                "version": skill.version,
            },
            skill_outcome=skill_res,
            alternative_strategy_id="alt-" + uuid.uuid4().hex[:6],
            alternative_name=alternative_strategy,
            alternative_action={
                "type": "ALTERNATIVE_ACTION",
                "description": alt_res.get("action_description", alternative_strategy),
            },
            alternative_outcome=alt_res,
            delta_service_level=delta_sl,
            delta_recovery_hours=delta_rec,
            delta_cost=delta_cost,
            recommendation=rec,
            provenance=ProvenanceMetadata(
                source_type=TruthStatus.SIMULATED,
                is_simulation=True,
                recorded_by="CounterfactualEngine",
                audit_notes="Counterfactual comparison between primary skill and alternative intervention",
            ),
        )
