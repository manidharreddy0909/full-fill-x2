"""
FULFILL-X Skill Evolution Engine (Phase 3)

Connects observed outcomes back to Skill calibration.
Generates structured SkillEvolutionProposals when new evidence warrants skill modification.

Rules:
- Do NOT automatically rewrite the Skill
- Generate evidence-backed proposals
- High-risk changes require explicit acceptance
- Historical versions remain immutable
- v1 is never destroyed by v2
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from app.skills.models import (
    ResilienceSkill,
    SkillLifecycle,
    SkillEvolutionProposal,
    SkillOutcomeEvaluation,
    SkillCalibrationResult,
    EvolutionProposalStatus,
    SkillPrecondition,
    ValidationResult,
    GovernanceRequirement,
    UncertaintyLevel,
)
from app.hindsight.models import FailureBoundary
from app.hindsight.provenance import TruthStatus

logger = logging.getLogger("fulfill-x.skills.evolution")


# Tolerance thresholds for determining calibration result
REINFORCEMENT_TOLERANCE_HOURS = 0.1   # Prediction within 6 min -> reinforces
WEAKNESS_THRESHOLD_HOURS = 0.5        # Prediction off by > 30 min -> weakens/reveals
NEW_BOUNDARY_THRESHOLD_PCT = 0.15     # Actual worse by > 15% -> reveals new boundary
CONTRADICTION_THRESHOLD_PCT = 0.30    # Actual worse by > 30% -> contradicts


class SkillOutcomeCalibrator:
    """
    Connects actual operational outcomes to Skill evaluation and confidence calibration.
    """

    def evaluate_outcome(
        self,
        skill: ResilienceSkill,
        experience_id: str,
        predicted_recovery_hours: Optional[float],
        actual_recovery_hours: Optional[float],
        predicted_recovery_pct: Optional[float] = None,
        actual_recovery_pct: Optional[float] = None,
        demand_surge_factor: Optional[float] = None,
        additional_context: Optional[Dict[str, Any]] = None,
    ) -> SkillOutcomeEvaluation:
        """
        Evaluate how a real outcome compares to the skill's prediction.
        Determine whether it reinforces, weakens, reveals a boundary, or contradicts.
        """
        eval_id = "soe-" + uuid.uuid4().hex[:6]
        context = additional_context or {}

        # Calculate prediction error
        prediction_error = None
        if predicted_recovery_hours is not None and actual_recovery_hours is not None:
            prediction_error = actual_recovery_hours - predicted_recovery_hours

        # Recovery percentage error
        pct_error = None
        if predicted_recovery_pct is not None and actual_recovery_pct is not None:
            pct_error = actual_recovery_pct - predicted_recovery_pct

        # Determine calibration result
        calibration, reason, new_boundary, confidence_delta = self._determine_calibration(
            prediction_error=prediction_error,
            pct_error=pct_error,
            skill=skill,
            demand_surge_factor=demand_surge_factor,
        )

        evaluation = SkillOutcomeEvaluation(
            evaluation_id=eval_id,
            skill_id=skill.skill_id,
            skill_version=skill.version,
            experience_id=experience_id,
            predicted_recovery_hours=predicted_recovery_hours,
            actual_recovery_hours=actual_recovery_hours,
            prediction_error_hours=prediction_error,
            predicted_recovery_pct=predicted_recovery_pct,
            actual_recovery_pct=actual_recovery_pct,
            calibration_result=calibration,
            confidence_delta=round(confidence_delta, 3),
            reason=reason,
            new_boundary_discovered=new_boundary,
            truth_status=TruthStatus.OBSERVED,
        )

        logger.info(
            f"SKILL_OUTCOME_EVALUATED: skill='{skill.name}' v={skill.version} "
            f"calibration={calibration.value} "
            f"prediction_error={prediction_error} "
            f"confidence_delta={confidence_delta:+.3f}"
        )

        return evaluation

    def _determine_calibration(
        self,
        prediction_error: Optional[float],
        pct_error: Optional[float],
        skill: ResilienceSkill,
        demand_surge_factor: Optional[float],
    ):
        """
        Determine what the outcome means for the skill's model.
        Returns (SkillCalibrationResult, reason, new_boundary_text, confidence_delta)
        """
        if prediction_error is None:
            return (
                SkillCalibrationResult.NEUTRAL,
                "Insufficient outcome data to evaluate skill calibration.",
                None,
                0.0,
            )

        abs_error = abs(prediction_error)

        # CONTRADICTS: actual was dramatically worse than predicted
        if pct_error is not None and pct_error < -(CONTRADICTION_THRESHOLD_PCT * 100):
            reason = (
                f"Actual recovery ({-pct_error:.1f}% below prediction) dramatically contradicts "
                f"skill model. Historical strategy model needs fundamental revision."
            )
            new_boundary = None
            if demand_surge_factor and demand_surge_factor > 1.4:
                new_boundary = (
                    f"Strategy fails to achieve predicted recovery when demand surge factor > {demand_surge_factor:.1f}x "
                    f"(observed {-pct_error:.1f}% recovery deficit)"
                )
            return (SkillCalibrationResult.CONTRADICTS, reason, new_boundary, -0.20)

        # REVEALS_NEW_BOUNDARY: actual significantly worse with demand surge context
        if prediction_error > WEAKNESS_THRESHOLD_HOURS and demand_surge_factor and demand_surge_factor > 1.3:
            reason = (
                f"Actual recovery took {prediction_error:.1f} hours longer than predicted "
                f"({skill.name}) with demand surge factor {demand_surge_factor:.1f}x. "
                f"Evidence suggests an unknown demand-related boundary condition."
            )
            new_boundary = (
                f"Recovery time significantly exceeded prediction when demand surge factor was "
                f"{demand_surge_factor:.1f}x. Proposed new condition: demand surge < 1.5x required."
            )
            return (SkillCalibrationResult.REVEALS_NEW_BOUNDARY, reason, new_boundary, -0.10)

        # WEAKENS: actual somewhat worse (no demand context)
        if prediction_error > REINFORCEMENT_TOLERANCE_HOURS:
            reason = (
                f"Actual recovery took {prediction_error:.1f} hours longer than predicted. "
                f"Skill model is slightly optimistic. Confidence adjusted downward."
            )
            return (SkillCalibrationResult.WEAKENS, reason, None, -0.05)

        # REINFORCES: actual within tolerance
        reason = (
            f"Actual outcome aligned with skill prediction "
            f"(error: {prediction_error:+.1f} hours). "
            f"Evidence reinforces skill confidence."
        )
        return (SkillCalibrationResult.REINFORCES, reason, None, +0.03)


class SkillEvolutionEngine:
    """
    Generates SkillEvolutionProposals when new evidence warrants a version bump.
    Does NOT automatically apply changes.
    """

    def generate_evolution_proposal(
        self,
        skill: ResilienceSkill,
        outcome_evaluation: SkillOutcomeEvaluation,
    ) -> Optional[SkillEvolutionProposal]:
        """
        Generate a proposal to create a new skill version based on outcome evidence.

        Returns None if the outcome does not warrant a version change.
        Returns SkillEvolutionProposal if a version change is warranted.
        """
        if outcome_evaluation.calibration_result == SkillCalibrationResult.REINFORCES:
            logger.info(f"EVOLUTION_NOT_NEEDED: Outcome reinforces skill '{skill.name}' {skill.version}")
            return None

        if outcome_evaluation.calibration_result == SkillCalibrationResult.NEUTRAL:
            logger.info(f"EVOLUTION_SKIPPED: Neutral outcome for skill '{skill.name}' {skill.version}")
            return None

        # Determine new version number
        try:
            current_v_num = int(skill.version.lstrip("v"))
            proposed_version = f"v{current_v_num + 1}"
        except (ValueError, AttributeError):
            proposed_version = f"{skill.version}_evolved"

        # New boundaries to add
        new_boundaries: List[FailureBoundary] = []
        changed_boundaries: List[str] = []

        if outcome_evaluation.new_boundary_discovered:
            new_boundary = FailureBoundary(
                text=outcome_evaluation.new_boundary_discovered,
                verified=False,  # Not yet verified - hypothesis from outcome
                parameter="demand_surge_factor" if "demand surge" in outcome_evaluation.new_boundary_discovered.lower() else None,
                threshold="<= 1.5" if "demand surge" in outcome_evaluation.new_boundary_discovered.lower() else None,
                severity="WARNING",
                evidence_count=1,
                confidence=0.65,
            )
            new_boundaries.append(new_boundary)
            changed_boundaries.append(
                f"NEW BOUNDARY (HYPOTHESIS): {outcome_evaluation.new_boundary_discovered}"
            )

        # New preconditions implied by contradictions
        new_preconditions = []
        changed_conditions = []

        if outcome_evaluation.calibration_result == SkillCalibrationResult.REVEALS_NEW_BOUNDARY:
            changed_conditions.append(
                f"Additional condition implied by evidence: demand surge factor must remain manageable"
            )

        # Compute updated confidence
        confidence_after = max(0.1, min(0.99, skill.confidence + outcome_evaluation.confidence_delta))

        # Validation required for all risk-changing proposals
        validation_required = outcome_evaluation.calibration_result in (
            SkillCalibrationResult.CONTRADICTS,
            SkillCalibrationResult.REVEALS_NEW_BOUNDARY,
        )

        proposal = SkillEvolutionProposal(
            skill_id=skill.skill_id,
            current_version=skill.version,
            proposed_version=proposed_version,
            triggering_experience_id=outcome_evaluation.experience_id,
            reason=outcome_evaluation.reason,
            changed_conditions=changed_conditions,
            changed_boundaries=changed_boundaries,
            new_preconditions=new_preconditions,
            new_failure_boundaries=new_boundaries,
            confidence_before=skill.confidence,
            confidence_after=round(confidence_after, 3),
            supporting_evidence=[outcome_evaluation.experience_id],
            contradicting_evidence=[],
            validation_required=validation_required,
            status=EvolutionProposalStatus.PROPOSED,
        )

        logger.info(
            f"EVOLUTION_PROPOSED: skill='{skill.name}' "
            f"{skill.version} -> {proposed_version} "
            f"calibration={outcome_evaluation.calibration_result.value} "
            f"confidence {skill.confidence:.3f} -> {confidence_after:.3f} "
            f"validation_required={validation_required}"
        )

        return proposal

    def apply_accepted_proposal(
        self,
        current_skill: ResilienceSkill,
        proposal: SkillEvolutionProposal,
    ) -> ResilienceSkill:
        """
        Create a NEW Skill version from an accepted evolution proposal.

        INVARIANT: current_skill is NOT mutated. v1 remains historically immutable.
        This creates an entirely new ResilienceSkill object representing the new version.
        """
        if proposal.status != EvolutionProposalStatus.ACCEPTED:
            raise ValueError(
                f"Cannot apply proposal in status {proposal.status.value}. "
                "Only ACCEPTED proposals can be applied."
            )

        # Inherit all from current skill but update changed fields
        new_failure_boundaries = list(current_skill.failure_boundaries) + proposal.new_failure_boundaries
        new_preconditions = list(current_skill.preconditions) + proposal.new_preconditions

        new_skill = ResilienceSkill(
            # New identity - new skill_id for this version
            skill_id="skill-" + uuid.uuid4().hex[:8],
            name=current_skill.name,
            version=proposal.proposed_version,
            purpose=current_skill.purpose,
            strategy=current_skill.strategy,

            # Updated structure
            preconditions=new_preconditions,
            steps=current_skill.steps,
            expected_effects=current_skill.expected_effects,
            risks=current_skill.risks,

            # Updated boundaries and conditions
            success_conditions=current_skill.success_conditions,
            failure_boundaries=new_failure_boundaries,
            transfer_constraints=current_skill.transfer_constraints,

            # Updated evidence
            evidence=current_skill.evidence + 1,
            supporting_experiences=current_skill.supporting_experiences + [proposal.triggering_experience_id],
            contradicting_experiences=current_skill.contradicting_experiences,

            genome_id=current_skill.genome_id,

            # Updated confidence
            confidence=proposal.confidence_after,
            uncertainty=current_skill.uncertainty,

            freshness=f"Evolved from {current_skill.version}",

            # Reset lifecycle - new version starts as CANDIDATE
            lifecycle_status=SkillLifecycle.CANDIDATE,
            validation_status=ValidationResult.INCONCLUSIVE,

            usage_count=0,
            success_count=0,
            failure_count=0,

            governance_requirement=current_skill.governance_requirement,

            # Versioning lineage
            previous_version_id=current_skill.skill_id,
            evolution_reason=proposal.reason,

            provenance=current_skill.provenance,
        )

        logger.info(
            f"SKILL_EVOLVED: '{new_skill.name}' {proposal.current_version} -> {proposal.proposed_version} "
            f"new_skill_id={new_skill.skill_id} "
            f"previous_skill_id={current_skill.skill_id} "
            f"confidence {proposal.confidence_before:.3f} -> {proposal.confidence_after:.3f}"
        )

        return new_skill


skill_outcome_calibrator = SkillOutcomeCalibrator()
skill_evolution_engine = SkillEvolutionEngine()
