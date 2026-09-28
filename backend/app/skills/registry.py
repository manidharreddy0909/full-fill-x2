"""
FULFILL-X Skill Registry (Phase 3)

In-memory store for Resilience Skills. Maintains all versions.
Historical versions are never deleted - immutability is enforced.
"""
import logging
from typing import Dict, List, Optional

from app.skills.models import ResilienceSkill, SkillLifecycle

logger = logging.getLogger("fulfill-x.skills.registry")


class SkillRegistry:
    """
    Stores all skill versions. Never deletes historical versions.

    Schema: { skill_id -> ResilienceSkill }
    Skills are keyed by skill_id (which is unique per version).
    Current active version of a named skill is tracked separately.
    """

    def __init__(self):
        # All versions: { skill_id -> ResilienceSkill }
        self._store: Dict[str, ResilienceSkill] = {}
        # Active version per strategy name: { strategy_name -> skill_id }
        self._active_by_strategy: Dict[str, str] = {}
        self._seed_canonical_skills()

    def _seed_canonical_skills(self) -> None:
        """Seed the canonical Supplier Substitution Skill v1 for demonstration."""
        from app.hindsight.models import SuccessCondition, FailureBoundary
        from app.skills.models import (
            SkillPrecondition, SkillStep, ValidationEvent,
            ValidationResult, GovernanceRequirement, UncertaintyLevel
        )
        from app.hindsight.provenance import TruthStatus, ProvenanceMetadata
        from datetime import datetime, timezone

        canonical = ResilienceSkill(
            skill_id="skill-supplier-sub-v1",
            name="Conditional Supplier Substitution",
            version="v1",
            purpose="Reroute raw material procurement from degraded primary supplier to verified alternate supplier",
            strategy="Supplier Substitution",
            preconditions=[
                SkillPrecondition(
                    precondition_id="pre-alt-avail",
                    description="Alternate supplier available and qualified",
                    parameter="alternate_supplier_available",
                    operator="==",
                    threshold=True,
                    uncertainty=UncertaintyLevel.KNOWN,
                ),
                SkillPrecondition(
                    precondition_id="pre-capacity",
                    description="Alternate supplier capacity exceeds 40%",
                    parameter="capacity",
                    operator=">",
                    threshold=0.40,
                    uncertainty=UncertaintyLevel.KNOWN,
                ),
                SkillPrecondition(
                    precondition_id="pre-route",
                    description="Direct logistics route is healthy",
                    parameter="route_health",
                    operator="==",
                    threshold="HEALTHY",
                    uncertainty=UncertaintyLevel.KNOWN,
                ),
            ],
            steps=[
                SkillStep(step_number=1, action="Verify alternate supplier qualification and capacity telemetry", timeout_seconds=120),
                SkillStep(step_number=2, action="Issue substitution order to alternate supplier", node_target="sup-alt", timeout_seconds=300, requires_confirmation=True),
                SkillStep(step_number=3, action="Reroute logistics transit to alternate supplier", timeout_seconds=600),
                SkillStep(step_number=4, action="Monitor recovery metrics and confirm SLA trajectory", timeout_seconds=3600),
            ],
            expected_effects=[
                "Primary supply gap covered within 2-4 hours",
                "Service level maintained above 88%",
                "No secondary cascade to dependent warehouse nodes",
            ],
            risks=[
                "Alternate supplier may have hidden capacity constraints",
                "Route diversion may add 1-2 hour transit latency",
                "Qualification data may be stale if > 6 hours old",
            ],
            success_conditions=[
                SuccessCondition(
                    text="Substitute supplier capacity > 40% observed under surge conditions",
                    verified=True,
                    parameter="capacity",
                    threshold="> 0.40",
                    evidence_count=5,
                    confidence=0.91,
                ),
            ],
            failure_boundaries=[
                FailureBoundary(
                    text="Substitute capacity < 40% historically associated with secondary stockout cascades",
                    verified=True,
                    parameter="capacity",
                    threshold="< 0.40",
                    severity="CRITICAL",
                    evidence_count=3,
                    confidence=0.89,
                ),
            ],
            transfer_constraints=[
                "Do NOT activate if capacity < 40% AND demand surge > 1.5x",
                "Do NOT activate if route health is DISRUPTED",
            ],
            evidence=7,
            supporting_experiences=["exp-canonical-001", "exp-canonical-002"],
            genome_id="genome-supplier-substitution",
            confidence=0.88,
            uncertainty=UncertaintyLevel.KNOWN,
            freshness="Empirically validated",
            lifecycle_status=SkillLifecycle.ACTIVE,
            validation_status=ValidationResult.PASS,
            validation_history=[
                ValidationEvent(
                    validation_id="val-canonical-001",
                    result=ValidationResult.PASS,
                    preconditions_met=True,
                    predicted_outcome={
                        "predicted_recovery_pct": 91.0,
                        "predicted_recovery_hours": 3.2,
                        "truth_status": "SIMULATED - not an observed production outcome",
                    },
                    notes="Canonical simulation passed. Strategy performs within bounds under standard conditions.",
                    truth_status=TruthStatus.SIMULATED,
                )
            ],
            governance_requirement=GovernanceRequirement.APPROVAL,
            provenance=ProvenanceMetadata(
                source_type=TruthStatus.DERIVED,
                is_simulation=False,
                confidence=0.88,
                recorded_by="SkillRegistry.seed",
                audit_notes="Canonical skill seeded from empirical genome evidence",
            ),
        )
        self._store[canonical.skill_id] = canonical
        self._active_by_strategy[canonical.strategy] = canonical.skill_id

    def register(self, skill: ResilienceSkill) -> None:
        """Store a skill. Never overwrites existing skill_ids (immutability)."""
        if skill.skill_id in self._store:
            raise ValueError(
                f"Skill version already exists: skill_id={skill.skill_id}. "
                "Create a new version with a new skill_id instead of mutating historical records."
            )
        self._store[skill.skill_id] = skill
        # Only track as active if VALIDATED or ACTIVE
        if skill.lifecycle_status in (SkillLifecycle.VALIDATED, SkillLifecycle.ACTIVE):
            self._active_by_strategy[skill.strategy] = skill.skill_id
        logger.info(f"SKILL_REGISTERED: skill_id={skill.skill_id} name='{skill.name}' v={skill.version}")

    def get(self, skill_id: str) -> Optional[ResilienceSkill]:
        return self._store.get(skill_id)

    def get_active_for_strategy(self, strategy: str) -> Optional[ResilienceSkill]:
        skill_id = self._active_by_strategy.get(strategy)
        if skill_id:
            return self._store.get(skill_id)
        return None

    def list_all(self) -> List[ResilienceSkill]:
        return list(self._store.values())

    def list_active(self) -> List[ResilienceSkill]:
        return [
            s for s in self._store.values()
            if s.lifecycle_status in (SkillLifecycle.ACTIVE, SkillLifecycle.VALIDATED)
        ]

    def version_history(self, base_skill_id: str) -> List[ResilienceSkill]:
        """Walk version chain from a skill_id back through all previous versions."""
        history = []
        current_id = base_skill_id
        seen = set()
        while current_id and current_id not in seen:
            seen.add(current_id)
            skill = self._store.get(current_id)
            if skill:
                history.append(skill)
                current_id = skill.previous_version_id
            else:
                break
        history.reverse()  # Oldest first
        return history

    def promote_to_active(self, skill_id: str) -> None:
        """Mark a VALIDATED skill as ACTIVE and update active pointer."""
        skill = self._store.get(skill_id)
        if not skill:
            raise ValueError(f"Skill not found: {skill_id}")
        if skill.lifecycle_status != SkillLifecycle.VALIDATED:
            raise ValueError(f"Skill must be VALIDATED before promotion. Current: {skill.lifecycle_status.value}")
        skill_dict = skill.model_dump()
        skill_dict["lifecycle_status"] = SkillLifecycle.ACTIVE.value
        updated = ResilienceSkill(**skill_dict)
        self._store[skill_id] = updated
        self._active_by_strategy[skill.strategy] = skill_id
        logger.info(f"SKILL_PROMOTED: skill_id={skill_id} name='{skill.name}' -> ACTIVE")


skill_registry = SkillRegistry()
