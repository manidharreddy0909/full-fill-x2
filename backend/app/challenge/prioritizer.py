"""
FULFILL-X Active Learning & Challenge Prioritizer (Phase 4)

Prioritizes challenge scenarios based on boundary proximity, uncertainty,
evidence freshness, contradiction risk, and historical failure propensity.
Performs Hindsight recall before challenge execution to reuse past evidence and avoid duplicate tests.
"""
import logging
from typing import Dict, Any, List, Optional, Tuple
import math

from app.challenge.models import (
    ChallengeScenario,
    ChallengeScenarioType,
)
from app.skills.models import (
    ResilienceSkill,
    UncertaintyLevel,
)
from app.hindsight.recall import ExperienceRetriever
from app.hindsight.models import RecallQuery, Experience

logger = logging.getLogger("fulfill-x.challenge.prioritizer")


class ChallengePrioritizer:
    """
    Active Learning prioritizer selecting the most informative, boundary-testing
    scenarios while preventing redundant testing through Hindsight recall.
    """

    def __init__(self, retriever: Optional[ExperienceRetriever] = None):
        self.retriever = retriever

    def assess_uncertainty_zone(
        self,
        skill: ResilienceSkill,
        scenario: ChallengeScenario,
        historical_matches: Optional[List[Experience]] = None,
    ) -> UncertaintyLevel:
        """
        Explicitly categorizes scenario into KNOWN, PROBABLE, UNCERTAIN, or UNKNOWN.
        Rules:
        - Novel condition with 0 historical prior -> UNKNOWN
        - Insufficient evidence (< 2 matches) outside safe envelope -> UNCERTAIN
        - Close to boundary (within 5% of threshold) -> UNCERTAIN
        - Moderate evidence (2-4 matches) -> PROBABLE
        - Strong evidence (>= 5 matches) within verified conditions -> KNOWN
        """
        # 1. Novel condition
        if scenario.scenario_type == ChallengeScenarioType.NOVEL_CONDITION:
            return UncertaintyLevel.UNKNOWN

        perturbations = scenario.perturbations or {}
        if perturbations.get("historical_prior_coverage", 1.0) == 0.0:
            return UncertaintyLevel.UNKNOWN

        # 2. Boundary proximity
        cap = perturbations.get("capacity")
        if cap is not None:
            # If within [0.38, 0.42] around 0.40 boundary
            if 0.38 <= float(cap) <= 0.42:
                return UncertaintyLevel.UNCERTAIN

        # 3. Check historical evidence count
        matches = historical_matches or []
        count = len(matches)

        if scenario.scenario_type in (
            ChallengeScenarioType.CONFLICTING_EVIDENCE,
            ChallengeScenarioType.STALE_EVIDENCE,
        ):
            return UncertaintyLevel.UNCERTAIN

        if count == 0 and perturbations.get("is_breach_expected", False):
            return UncertaintyLevel.UNCERTAIN
        elif count >= 5:
            return UncertaintyLevel.KNOWN
        elif count >= 2:
            return UncertaintyLevel.PROBABLE
        else:
            return UncertaintyLevel.UNCERTAIN

    async def recall_previous_challenge(
        self,
        skill: ResilienceSkill,
        scenario: ChallengeScenario,
    ) -> Tuple[bool, Optional[Experience], float]:
        """
        Perform Hindsight recall before executing a new challenge.
        Returns:
            (has_similar_challenge, prior_experience, similarity_score)
        """
        if not self.retriever:
            return False, None, 0.0

        query_sig = f"CHALLENGE:{skill.name}:{scenario.scenario_type.value}"
        cap = scenario.perturbations.get("capacity")
        if cap is not None:
            query_sig += f":cap={cap:.2f}"

        recall_res = await self.retriever.recall(
            RecallQuery(
                incident_signature=query_sig,
                world_state_context=scenario.perturbations,
                top_k=3,
                min_confidence=0.5,
            )
        )

        if recall_res.experiences:
            top_exp = recall_res.experiences[0]
            # Calculate parameter similarity
            score = 0.85
            if cap is not None and "capacity" in top_exp.world_state:
                prev_cap = float(top_exp.world_state.get("capacity", 0.0))
                diff = abs(prev_cap - float(cap))
                score = max(0.0, 1.0 - diff * 2.0)
            return True, top_exp, round(score, 3)

        return False, None, 0.0

    def compute_priority_score(
        self,
        skill: ResilienceSkill,
        scenario: ChallengeScenario,
        uncertainty: UncertaintyLevel,
        has_prior_challenge: bool,
    ) -> float:
        """
        Compute an active learning acquisition score [0.0, 100.0].
        Prioritizes:
        - UNCERTAIN / Boundary probing (high information gain)
        - High risk / critical severity
        - Stale or conflicting evidence
        - De-prioritizes duplicate tests if prior challenge is already verified
        """
        base_score = 50.0

        # Type bonuses
        if scenario.scenario_type == ChallengeScenarioType.BOUNDARY_TEST:
            base_score += 25.0
        elif scenario.scenario_type == ChallengeScenarioType.CONFLICTING_EVIDENCE:
            base_score += 20.0
        elif scenario.scenario_type == ChallengeScenarioType.DEPENDENCY_FAILURE:
            base_score += 15.0
        elif scenario.scenario_type == ChallengeScenarioType.NOVEL_CONDITION:
            base_score += 20.0
        elif scenario.scenario_type == ChallengeScenarioType.STALE_EVIDENCE:
            base_score += 10.0

        # Uncertainty bonus
        if uncertainty == UncertaintyLevel.UNCERTAIN:
            base_score += 15.0
        elif uncertainty == UncertaintyLevel.UNKNOWN:
            base_score += 10.0
        elif uncertainty == UncertaintyLevel.PROBABLE:
            base_score += 5.0

        # Duplicate penalty: if identical challenge already confirmed, lower priority
        if has_prior_challenge:
            base_score -= 20.0

        return max(0.0, min(100.0, round(base_score, 1)))

    def rank_scenarios(
        self,
        skill: ResilienceSkill,
        scenarios: List[ChallengeScenario],
    ) -> List[Tuple[ChallengeScenario, float, UncertaintyLevel]]:
        """Rank a batch of challenge scenarios for execution order."""
        ranked = []
        for sc in scenarios:
            uncertainty = self.assess_uncertainty_zone(skill, sc)
            score = self.compute_priority_score(skill, sc, uncertainty, has_prior_challenge=False)
            ranked.append((sc, score, uncertainty))

        ranked.sort(key=lambda x: x[1], reverse=True)
        return ranked
