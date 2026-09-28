"""
FULFILL-X Skill Applicability Evaluator (Phase 3)

Evaluates whether a ResilienceSkill is applicable to a current world situation.
Checks preconditions, failure boundaries, confidence, governance.

This is the interface required by the future Challenge Engine (Phase 4).
Callable with: skill + world_state + scenario
Returns: SkillApplicabilityReport
"""
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.skills.models import (
    ResilienceSkill,
    SkillApplicabilityReport,
    SkillLifecycle,
    GovernanceRequirement,
    UncertaintyLevel,
)

logger = logging.getLogger("fulfill-x.skills.evaluator")


class SkillApplicabilityEvaluator:
    """
    Deterministically evaluates skill applicability.

    Golden rules:
    - NEVER select a skill solely because it has highest similarity
    - Preconditions must be evaluated structurally, not by text similarity
    - Failure boundaries must be checked before applicability is declared
    - UNKNOWN is a valid and important output
    """

    def evaluate(
        self,
        skill: ResilienceSkill,
        world_state: Dict[str, Any],
        scenario: Optional[Dict[str, Any]] = None,
    ) -> SkillApplicabilityReport:
        """
        Evaluate skill applicability against current world state.

        Parameters
        ----------
        skill : ResilienceSkill
        world_state : dict - Current network state (capacity, route_health, etc.)
        scenario : dict - Optional additional incident context

        Returns
        -------
        SkillApplicabilityReport
        """
        # 1. Check lifecycle: deprecated/rejected skills cannot be applied
        if skill.lifecycle_status in (SkillLifecycle.DEPRECATED, SkillLifecycle.REJECTED):
            return SkillApplicabilityReport(
                skill_id=skill.skill_id,
                skill_version=skill.version,
                applicable=False,
                uncertainty=UncertaintyLevel.KNOWN,
                precondition_status={},
                boundary_status={},
                predicted_effects={},
                risk_level="CRITICAL",
                confidence=0.0,
                governance_requirement=GovernanceRequirement.BLOCK,
                reason=f"Skill lifecycle is {skill.lifecycle_status.value}. Not eligible for activation.",
                recommendation="Select an alternative active skill or escalate to human coordinator.",
            )

        # 2. Evaluate preconditions
        precondition_status: Dict[str, bool] = {}
        failed_preconditions = []
        unknown_preconditions = []

        for pre in skill.preconditions:
            if pre.uncertainty == UncertaintyLevel.UNKNOWN:
                # Cannot evaluate unknown preconditions
                precondition_status[pre.precondition_id] = False
                unknown_preconditions.append(pre.description)
            else:
                result = pre.evaluate(world_state)
                precondition_status[pre.precondition_id] = result
                if not result:
                    failed_preconditions.append(pre.description)

        # 3. Evaluate failure boundaries (safety first)
        boundary_status: Dict[str, bool] = {}
        critical_violations = []
        warning_violations = []

        for fb in skill.failure_boundaries:
            violated = False
            if fb.parameter == "capacity":
                capacity = world_state.get("capacity")
                if capacity is not None:
                    threshold_val = 0.40
                    try:
                        if fb.threshold:
                            threshold_val = float(fb.threshold.replace("<", "").strip())
                    except (ValueError, AttributeError):
                        pass
                    violated = float(capacity) < threshold_val
            elif fb.parameter == "route_health":
                route = world_state.get("route_health", world_state.get("route_status"))
                violated = route in ("DISRUPTED", "DEGRADED", "DOWN")
            else:
                # Non-parameterized boundary: check if world_state has explicit override
                violated = world_state.get(f"boundary_violated_{fb.parameter}", False)

            boundary_status[fb.boundary_id] = violated
            if violated:
                if fb.severity == "CRITICAL":
                    critical_violations.append(fb.text)
                else:
                    warning_violations.append(fb.text)

        # 4. Determine applicability
        if critical_violations:
            applicable = False
            uncertainty = UncertaintyLevel.KNOWN
            risk_level = "CRITICAL"
            governance_req = GovernanceRequirement.BLOCK
            reason = (
                f"BOUNDARY VIOLATION: {len(critical_violations)} critical failure boundary(ies) triggered. "
                f"Skill is historically relevant but NOT safe to transfer under current conditions. "
                f"Violations: {'; '.join(critical_violations)}"
            )
            recommendation = (
                "Do NOT execute this skill. Select an alternative strategy that does not breach "
                "current capacity or operational constraints."
            )
            confidence = 0.0

        elif unknown_preconditions:
            applicable = False
            uncertainty = UncertaintyLevel.UNKNOWN
            risk_level = "UNKNOWN"
            governance_req = GovernanceRequirement.BLOCK
            reason = (
                f"UNKNOWN CONDITIONS: {len(unknown_preconditions)} precondition(s) cannot be evaluated. "
                f"Insufficient world state telemetry to assess skill applicability."
            )
            recommendation = "Gather additional telemetry or escalate to human operator for manual assessment."
            confidence = 0.0

        elif failed_preconditions:
            applicable = False
            uncertainty = UncertaintyLevel.PROBABLE
            risk_level = "HIGH"
            governance_req = GovernanceRequirement.APPROVAL
            reason = (
                f"PRECONDITIONS NOT MET: {len(failed_preconditions)} precondition(s) unsatisfied. "
                f"Failed: {'; '.join(failed_preconditions)}"
            )
            recommendation = "Adapt skill parameters or identify alternative strategy with different preconditions."
            confidence = skill.confidence * 0.3

        elif warning_violations:
            applicable = True
            uncertainty = UncertaintyLevel.UNCERTAIN
            risk_level = "MEDIUM"
            governance_req = GovernanceRequirement.APPROVAL
            reason = (
                f"PARTIAL APPLICABILITY: All critical boundaries satisfied, but {len(warning_violations)} "
                f"warning-level boundary(ies) triggered. Proceed with additional monitoring. "
                f"Warnings: {'; '.join(warning_violations)}"
            )
            recommendation = "Activate with enhanced monitoring. Require human operator to acknowledge warning conditions."
            confidence = skill.confidence * 0.75

        else:
            # All conditions pass
            applicable = True
            uncertainty = skill.uncertainty if skill.uncertainty != UncertaintyLevel.UNKNOWN else UncertaintyLevel.PROBABLE
            risk_level = "LOW" if skill.confidence > 0.8 else "MEDIUM"
            governance_req = skill.governance_requirement
            reason = (
                f"All {len(skill.preconditions)} preconditions satisfied. "
                f"No failure boundaries triggered. "
                f"Skill is applicable under current conditions."
            )
            recommendation = f"Proceed through governance gate ({skill.governance_requirement.value}). Confidence: {skill.confidence:.1%}"
            confidence = skill.confidence

        # 5. Build predicted effects
        predicted_effects: Dict[str, Any] = {
            "expected_effects": skill.expected_effects,
            "risks": skill.risks,
            "estimated_confidence": round(confidence, 3),
            "truth_status": "SIMULATED - not an observed production outcome",
        }

        report = SkillApplicabilityReport(
            skill_id=skill.skill_id,
            skill_version=skill.version,
            applicable=applicable,
            uncertainty=uncertainty,
            precondition_status=precondition_status,
            boundary_status=boundary_status,
            predicted_effects=predicted_effects,
            risk_level=risk_level,
            confidence=round(confidence, 3),
            governance_requirement=governance_req,
            reason=reason,
            recommendation=recommendation,
        )

        logger.info(
            f"SKILL_EVALUATED: skill='{skill.name}' v={skill.version} "
            f"applicable={applicable} uncertainty={uncertainty.value} "
            f"risk={risk_level} governance={governance_req.value} "
            f"critical_violations={len(critical_violations)}"
        )

        return report


skill_applicability_evaluator = SkillApplicabilityEvaluator()
