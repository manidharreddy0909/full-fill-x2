"""
FULFILL-X Skill Orchestration Service (Phase 3)

Master service wiring: generator, evaluator, validator, evolution, registry, hindsight.
Provides the canonical Phase 3 demonstration: Skill v1 -> Outcome -> Skill v2.
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.skills.models import (
    ResilienceSkill,
    SkillLifecycle,
    SkillLifecycleEventType,
    SkillLifecycleEvent,
    ValidationResult,
    EvolutionProposalStatus,
    GovernanceRequirement,
)
from app.skills.generator import SkillGenerator
from app.skills.evaluator import SkillApplicabilityEvaluator
from app.skills.validator import SkillValidationEngine
from app.skills.evolution import SkillOutcomeCalibrator, SkillEvolutionEngine
from app.skills.registry import SkillRegistry, skill_registry
from app.hindsight.models import (
    ResilienceGenome, RecallQuery, OutcomeStatus,
    Experience, SuccessCondition, FailureBoundary
)
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata
from app.hindsight.retain import ExperienceRecorder
from app.hindsight.recall import ExperienceRetriever
from app.hindsight.reflect import ReflectionEngine
from app.hindsight.client import HindsightClient

logger = logging.getLogger("fulfill-x.skills.service")


class SkillOrchestrationService:
    """
    Master service for Phase 3 Skill lifecycle management.
    """

    _instance = None

    def __init__(self):
        client = HindsightClient(mode="mock")
        self.recorder = ExperienceRecorder(client=client)
        self.retriever = ExperienceRetriever(client=client)
        self.reflector = ReflectionEngine()
        self.generator = SkillGenerator()
        self.evaluator = SkillApplicabilityEvaluator()
        self.validator = SkillValidationEngine()
        self.calibrator = SkillOutcomeCalibrator()
        self.evolver = SkillEvolutionEngine()
        self.registry = skill_registry

    @classmethod
    def get_instance(cls) -> "SkillOrchestrationService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def _retain_lifecycle_event(
        self,
        event_type: SkillLifecycleEventType,
        skill: ResilienceSkill,
        context: Dict[str, Any],
        evidence_impact: str = "",
    ) -> None:
        """Retain a skill lifecycle event in Hindsight memory."""
        exp = Experience(
            experience_id="sle-" + uuid.uuid4().hex[:6],
            incident_id="skill-lifecycle-" + uuid.uuid4().hex[:4],
            incident_signature=f"SKILL_EVENT:{event_type.value}:{skill.skill_id}",
            decision=f"{event_type.value} for skill '{skill.name}' {skill.version}",
            action={"event_type": event_type.value, "skill_id": skill.skill_id, "skill_version": skill.version},
            outcome_status=OutcomeStatus.SUCCESS,
            confidence=skill.confidence,
            truth_status=TruthStatus.OBSERVED,
            provenance=ProvenanceMetadata(
                source_type=TruthStatus.OBSERVED,
                is_simulation=False,
                recorded_by="SkillOrchestrationService",
                audit_notes=f"Skill lifecycle event: {event_type.value}. {evidence_impact}",
            ),
        )
        await self.recorder.retain_experience(exp)
        logger.info(f"HINDSIGHT_RETAINED: {event_type.value} for skill '{skill.name}' {skill.version}")

    async def generate_skill_from_genome(
        self,
        genome: ResilienceGenome,
        skill_name: Optional[str] = None,
    ) -> ResilienceSkill:
        """Generate a Candidate Skill from a Genome and retain creation event."""
        skill = self.generator.generate_from_genome(genome, skill_name=skill_name)
        self.registry.register(skill)
        await self._retain_lifecycle_event(
            SkillLifecycleEventType.SKILL_CREATED, skill,
            context={"genome_id": genome.id, "evidence": genome.evidence},
            evidence_impact=f"Skill created from genome with {genome.evidence} supporting experiences",
        )
        return skill

    async def validate_skill(
        self,
        skill: ResilienceSkill,
        world_state: Optional[Dict[str, Any]] = None,
        scenario: Optional[Dict[str, Any]] = None,
    ) -> ResilienceSkill:
        """Run validation and update skill lifecycle."""
        val_event = self.validator.validate(skill, world_state, scenario)
        updated_skill = self.validator.apply_validation_result(skill, val_event)

        # Update registry (register new version if lifecycle changed)
        # In-place update for same skill_id is allowed for lifecycle transitions
        self.registry._store[skill.skill_id] = updated_skill

        await self._retain_lifecycle_event(
            SkillLifecycleEventType.SKILL_VALIDATED, updated_skill,
            context={"validation_result": val_event.result.value, "simulation_run_id": val_event.simulation_run_id},
            evidence_impact=f"Validation result: {val_event.result.value}. Truth: SIMULATED.",
        )
        return updated_skill

    def evaluate_applicability(
        self,
        skill: ResilienceSkill,
        world_state: Dict[str, Any],
        scenario: Optional[Dict[str, Any]] = None,
    ):
        """Evaluate whether a skill is applicable to current conditions."""
        return self.evaluator.evaluate(skill, world_state, scenario)

    async def record_skill_used(
        self,
        skill: ResilienceSkill,
        world_state: Dict[str, Any],
    ) -> ResilienceSkill:
        """Record that a skill was selected for use. Does not execute it."""
        skill_dict = skill.model_dump()
        skill_dict["usage_count"] = skill.usage_count + 1
        skill_dict["last_used"] = datetime.now(timezone.utc).isoformat()
        updated_skill = ResilienceSkill(**skill_dict)
        self.registry._store[skill.skill_id] = updated_skill

        await self._retain_lifecycle_event(
            SkillLifecycleEventType.SKILL_USED, updated_skill,
            context={"world_state_snapshot": world_state},
            evidence_impact="Skill dispatched through governance gate.",
        )
        return updated_skill

    async def process_outcome(
        self,
        skill: ResilienceSkill,
        experience_id: str,
        predicted_recovery_hours: Optional[float],
        actual_recovery_hours: Optional[float],
        predicted_recovery_pct: Optional[float] = None,
        actual_recovery_pct: Optional[float] = None,
        demand_surge_factor: Optional[float] = None,
    ):
        """
        Process a real outcome against a skill's prediction.
        May generate an evolution proposal.
        Returns (calibration_evaluation, evolution_proposal_or_None).
        """
        # Evaluate outcome
        outcome_eval = self.calibrator.evaluate_outcome(
            skill=skill,
            experience_id=experience_id,
            predicted_recovery_hours=predicted_recovery_hours,
            actual_recovery_hours=actual_recovery_hours,
            predicted_recovery_pct=predicted_recovery_pct,
            actual_recovery_pct=actual_recovery_pct,
            demand_surge_factor=demand_surge_factor,
        )

        # Determine event type for hindsight
        from app.skills.models import SkillCalibrationResult
        if outcome_eval.calibration_result == SkillCalibrationResult.REINFORCES:
            evt = SkillLifecycleEventType.SKILL_SUCCEEDED
        elif outcome_eval.calibration_result == SkillCalibrationResult.CONTRADICTS:
            evt = SkillLifecycleEventType.SKILL_FAILED
        elif outcome_eval.calibration_result == SkillCalibrationResult.REVEALS_NEW_BOUNDARY:
            evt = SkillLifecycleEventType.BOUNDARY_VIOLATED
        else:
            evt = SkillLifecycleEventType.SKILL_USED

        await self._retain_lifecycle_event(
            evt, skill,
            context={"calibration_result": outcome_eval.calibration_result.value,
                     "experience_id": experience_id,
                     "confidence_delta": outcome_eval.confidence_delta},
            evidence_impact=outcome_eval.reason,
        )

        # Generate evolution proposal if warranted
        proposal = self.evolver.generate_evolution_proposal(skill, outcome_eval)

        if proposal:
            outcome_eval.evolution_proposal_id = proposal.proposal_id
            await self._retain_lifecycle_event(
                SkillLifecycleEventType.SKILL_EVOLUTION_PROPOSED, skill,
                context={"proposal_id": proposal.proposal_id,
                         "current_version": proposal.current_version,
                         "proposed_version": proposal.proposed_version},
                evidence_impact=f"Evolution proposed: {skill.version} -> {proposal.proposed_version}. Reason: {proposal.reason}",
            )

        return outcome_eval, proposal

    async def apply_accepted_evolution(
        self,
        current_skill: ResilienceSkill,
        proposal,
    ) -> ResilienceSkill:
        """
        Apply an accepted evolution proposal and register the new skill version.
        v1 remains immutable in registry.
        """
        proposal_dict = proposal.model_dump()
        proposal_dict["status"] = EvolutionProposalStatus.ACCEPTED.value
        from app.skills.models import SkillEvolutionProposal
        accepted_proposal = SkillEvolutionProposal(**proposal_dict)

        new_skill = self.evolver.apply_accepted_proposal(current_skill, accepted_proposal)
        self.registry.register(new_skill)

        await self._retain_lifecycle_event(
            SkillLifecycleEventType.SKILL_EVOLUTION_ACCEPTED, new_skill,
            context={"previous_version_id": current_skill.skill_id,
                     "new_skill_id": new_skill.skill_id,
                     "current_version": current_skill.version,
                     "new_version": new_skill.version},
            evidence_impact=(
                f"Skill evolved: '{current_skill.name}' "
                f"{current_skill.version} -> {new_skill.version}. "
                f"Confidence: {current_skill.confidence:.3f} -> {new_skill.confidence:.3f}"
            ),
        )
        return new_skill

    async def run_canonical_phase3_demo(self) -> Dict[str, Any]:
        """
        Canonical Phase 3 demonstration: Supplier B scenario.

        Demonstrates:
        1. Genome exists from Hindsight (Phase 2A)
        2. Skill v1 generated from Genome
        3. Skill v1 validated (PASS)
        4. New incident: Supplier D capacity = 28% -> BOUNDARY VIOLATION
        5. Skill NOT selected directly
        6. Alternative strategy used
        7. Actual outcome: 51 min vs predicted 42 min -> REVEALS_NEW_BOUNDARY
        8. Evolution Proposal: v1 -> v2 (demand surge < 1.5x condition added)
        9. v2 validated
        10. Hindsight retains all events
        """

        # Step 1: Get canonical genome from reflector
        genome = self.reflector.get_genome_by_id_or_strategy("Supplier Substitution")
        if not genome:
            from app.hindsight.models import GenomeStatus
            from datetime import datetime, timezone as tz
            genome = ResilienceGenome(
                id="genome-supplier-substitution",
                strategy="Supplier Substitution",
                purpose="Reroute procurement when primary supplier degrades",
                success_conditions=[
                    SuccessCondition(text="Substitute capacity > 40%", parameter="capacity", threshold="> 0.40", evidence_count=5, confidence=0.91),
                ],
                failure_boundaries=[
                    FailureBoundary(text="Substitute capacity < 40% causes cascade", parameter="capacity", threshold="< 0.40", severity="CRITICAL", evidence_count=3, confidence=0.89),
                ],
                evidence=7,
                confidence=0.88,
                status=GenomeStatus.VALIDATED,
            )

        # Step 2 & 3: Generate Skill v1 and validate
        skill_v1 = await self.generate_skill_from_genome(genome, "Conditional Supplier Substitution")

        world_for_validation = {
            "capacity": 0.75, "route_health": "HEALTHY",
            "alternate_supplier_available": True, "demand_surge_factor": 1.0,
        }
        skill_v1 = await self.validate_skill(skill_v1, world_for_validation)

        # Step 4: New incident - Supplier D capacity = 28%
        incident_world = {
            "capacity": 0.28, "route_health": "HEALTHY",
            "alternate_supplier_available": True, "demand_surge_factor": 1.4,
        }
        applicability = self.evaluate_applicability(skill_v1, incident_world)

        # Step 5: Boundary violation detected - skill NOT selected directly
        boundary_violated = not applicability.applicable

        # Step 6: Alternative strategy used (emergency inventory draw)
        alternative_strategy = "Emergency Inventory Draw (Warehouse C Reserves)"

        # Step 7: Simulate outcome - actual recovery 51 min vs predicted 42 min
        predicted_hours = 0.70   # 42 min
        actual_hours = 0.85      # 51 min (9 min longer)
        demand_surge = 1.4

        # Record skill was considered and boundary violated
        await self._retain_lifecycle_event(
            SkillLifecycleEventType.BOUNDARY_VIOLATED, skill_v1,
            context={"capacity": 0.28, "boundary": "capacity < 40%", "alternative_selected": alternative_strategy},
            evidence_impact="Skill v1 rejected due to capacity boundary violation. Alternative selected.",
        )

        # Step 8: Process outcome -> evolution proposal
        outcome_eval, proposal = await self.process_outcome(
            skill=skill_v1,
            experience_id="exp-supplier-b-" + uuid.uuid4().hex[:4],
            predicted_recovery_hours=predicted_hours,
            actual_recovery_hours=actual_hours,
            predicted_recovery_pct=91.0,
            actual_recovery_pct=78.0,
            demand_surge_factor=demand_surge,
        )

        # Step 9: Accept proposal and create v2
        new_skill_v2 = None
        v2_validation = None
        if proposal:
            proposal_dict = proposal.model_dump()
            proposal_dict["status"] = EvolutionProposalStatus.ACCEPTED.value
            from app.skills.models import SkillEvolutionProposal
            accepted = SkillEvolutionProposal(**proposal_dict)
            new_skill_v2 = self.evolver.apply_accepted_proposal(skill_v1, accepted)
            try:
                self.registry.register(new_skill_v2)
            except ValueError:
                pass  # Already registered in idempotent demo

            # Step 10: Validate v2
            v2_world = {**world_for_validation, "demand_surge_factor": 0.9}
            v2_val_event = self.validator.validate(new_skill_v2, v2_world)
            v2_validation = v2_val_event.result.value

            await self._retain_lifecycle_event(
                SkillLifecycleEventType.SKILL_EVOLUTION_ACCEPTED, new_skill_v2,
                context={"previous_version": skill_v1.version, "new_version": new_skill_v2.version},
                evidence_impact=f"Skill v2 created. New boundary: demand surge constraint added.",
            )

        # Build v1 preserved proof
        v1_from_registry = self.registry.get(skill_v1.skill_id)
        v1_still_immutable = (
            v1_from_registry is not None and
            v1_from_registry.version == "v1" and
            (new_skill_v2 is None or v1_from_registry.skill_id != new_skill_v2.skill_id)
        )

        return {
            "phase": "PHASE_3_CANONICAL_DEMO",
            "genome_used": genome.id,
            "step_1_genome": {"id": genome.id, "strategy": genome.strategy, "evidence": genome.evidence, "confidence": genome.confidence},
            "step_2_skill_v1_generated": {"skill_id": skill_v1.skill_id, "name": skill_v1.name, "version": skill_v1.version, "lifecycle": skill_v1.lifecycle_status.value},
            "step_3_skill_v1_validated": {"validation_result": skill_v1.validation_status.value, "lifecycle": skill_v1.lifecycle_status.value},
            "step_4_incident": {"supplier_d_capacity": 0.28, "demand_surge": demand_surge},
            "step_5_boundary_violated": boundary_violated,
            "step_5_applicability": {"applicable": applicability.applicable, "reason": applicability.reason},
            "step_6_alternative_strategy": alternative_strategy,
            "step_7_outcome": {"predicted_hours": predicted_hours, "actual_hours": actual_hours, "prediction_error_hours": round(actual_hours - predicted_hours, 2), "predicted_pct": 91.0, "actual_pct": 78.0},
            "step_8_calibration": outcome_eval.calibration_result.value,
            "step_8_reason": outcome_eval.reason,
            "step_8_new_boundary": outcome_eval.new_boundary_discovered,
            "step_8_evolution_proposal": proposal.model_dump() if proposal else None,
            "step_9_skill_v2": {"skill_id": new_skill_v2.skill_id, "version": new_skill_v2.version, "confidence": new_skill_v2.confidence, "lifecycle": new_skill_v2.lifecycle_status.value} if new_skill_v2 else None,
            "step_10_v2_validation": v2_validation,
            "v1_still_immutable": v1_still_immutable,
            "v1_skill_id_preserved": skill_v1.skill_id,
            "hindsight_events_retained": True,
        }


skill_orchestration_service = SkillOrchestrationService.get_instance()
