"""
FULFILL-X Adaptive Autonomy & Governance Bridge (Phase 4)

Translates active learning challenge results into calibrated governance autonomy levels:
AUTO -> AUTO + MONITOR -> HUMAN APPROVAL -> BLOCK.

Preserves the fundamental invariant:
CONFIDENCE != AUTHORIZATION.
Existing governance and safety policies remain strictly authoritative.
"""
import logging
from typing import Dict, Any, List, Optional, Tuple

from app.skills.models import (
    GovernanceRequirement,
    ResilienceSkill,
    UncertaintyLevel,
)
from app.challenge.models import (
    ChallengeResult,
    ChallengeOutcomeStatus,
    BoundaryStatus,
)

logger = logging.getLogger("fulfill-x.challenge.governance")


class AdaptiveAutonomyEngine:
    """
    Evaluates empirical challenge evidence against governance policies
    to dynamically adjust recommended operational autonomy levels.
    """

    def evaluate_adaptive_autonomy(
        self,
        skill: ResilienceSkill,
        recent_challenge_results: List[ChallengeResult],
        current_uncertainty: UncertaintyLevel = UncertaintyLevel.KNOWN,
    ) -> Tuple[GovernanceRequirement, str]:
        """
        Calculates the recommended governance requirement based on:
        1. Critical boundary violations -> BLOCK
        2. New failure boundary discovered / recent failure -> APPROVAL
        3. High uncertainty (UNCERTAIN or UNKNOWN) -> APPROVAL or BLOCK
        4. Moderate confidence / minor warnings -> MONITOR
        5. Consistent survival (> 3 successful challenges, confidence >= 0.85, 0 failures) -> AUTO

        Returns:
            (GovernanceRequirement, reason)
        """
        # 1. Hard check on critical boundary breach
        has_critical_breach = any(
            cr.boundary_status == BoundaryStatus.BOUNDARY_BREACH
            and cr.failure_detected
            for cr in recent_challenge_results[-3:]
        )
        if has_critical_breach:
            reason = (
                f"GOVERNANCE LOCK (BLOCK): Recent challenge detected a critical failure boundary breach "
                f"for skill '{skill.name}' {skill.version}. Autonomy suspended until re-validated."
            )
            logger.warning(reason)
            return GovernanceRequirement.BLOCK, reason

        # 2. Check for newly discovered boundaries or recent failures
        has_new_boundary = any(
            cr.new_boundary_detected is not None
            for cr in recent_challenge_results[-3:]
        )
        has_recent_failure = any(
            cr.outcome_status == ChallengeOutcomeStatus.FAILED
            for cr in recent_challenge_results[-3:]
        )

        if has_new_boundary or has_recent_failure:
            reason = (
                f"GOVERNANCE STEP-DOWN (APPROVAL): Recent challenge revealed a previously unknown boundary "
                f"or failure for skill '{skill.name}' {skill.version}. Human operator approval required."
            )
            logger.info(reason)
            return GovernanceRequirement.APPROVAL, reason

        # 3. Check uncertainty zone
        if current_uncertainty == UncertaintyLevel.UNKNOWN:
            reason = (
                f"GOVERNANCE HOLD (APPROVAL): Operating in UNKNOWN zone with zero prior empirical evidence. "
                f"Autonomous execution blocked; human sign-off mandatory."
            )
            return GovernanceRequirement.APPROVAL, reason

        if current_uncertainty == UncertaintyLevel.UNCERTAIN:
            reason = (
                f"GOVERNANCE MONITOR (APPROVAL): Operating in UNCERTAIN zone near boundary. "
                f"Human oversight required."
            )
            return GovernanceRequirement.APPROVAL, reason

        # 4. Check confidence and track record
        successful_challenges = [
            cr for cr in recent_challenge_results
            if cr.skill_survived and cr.outcome_status == ChallengeOutcomeStatus.SURVIVED
        ]
        success_count = len(successful_challenges)

        if skill.confidence >= 0.85 and success_count >= 2 and not has_recent_failure:
            reason = (
                f"GOVERNANCE AUTONOMY (AUTO): Skill '{skill.name}' {skill.version} demonstrated robust "
                f"survival across {success_count} challenge tests with high confidence ({skill.confidence:.2f}). "
                f"Approved for automated execution."
            )
            return GovernanceRequirement.AUTO, reason

        elif skill.confidence >= 0.70:
            reason = (
                f"GOVERNANCE MONITOR (MONITOR): Skill '{skill.name}' {skill.version} meets baseline validity "
                f"with confidence ({skill.confidence:.2f}). Approved for auto-execution with active telemetry monitoring."
            )
            return GovernanceRequirement.MONITOR, reason

        else:
            reason = (
                f"GOVERNANCE LOW-CONFIDENCE (APPROVAL): Confidence ({skill.confidence:.2f}) below autonomous threshold. "
                f"Human approval required."
            )
            return GovernanceRequirement.APPROVAL, reason
