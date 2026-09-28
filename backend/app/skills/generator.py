"""
FULFILL-X Skill Generator (Phase 3)

Deterministic service that converts a sufficiently supported Resilience Genome
into a Candidate Skill.

Rules:
- If Genome does not have enough info for a field -> mark UNKNOWN, do not hallucinate
- Evidence, contradictions, confidence are inherited directly from Genome
- Success conditions and failure boundaries are inherited verbatim
- Steps and effects are derived from strategy archetype knowledge
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

from app.hindsight.models import ResilienceGenome, GenomeStatus, SuccessCondition, FailureBoundary
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata
from app.skills.models import (
    ResilienceSkill,
    SkillLifecycle,
    SkillPrecondition,
    SkillStep,
    ValidationResult,
    GovernanceRequirement,
    UncertaintyLevel,
)

logger = logging.getLogger("fulfill-x.skills.generator")

# Strategy archetypes: structural templates for known strategy types
# These provide operational structure when the Genome has insufficient step data
STRATEGY_ARCHETYPES: Dict[str, Dict[str, Any]] = {
    "Supplier Substitution": {
        "purpose": "Reroute raw material procurement from degraded primary supplier to verified alternate supplier",
        "preconditions": [
            {"description": "Alternate supplier available and qualified", "parameter": "alternate_supplier_available", "operator": "==", "threshold": True},
            {"description": "Alternate supplier capacity exceeds 40%", "parameter": "capacity", "operator": ">", "threshold": 0.40},
            {"description": "Direct logistics route is healthy", "parameter": "route_health", "operator": "==", "threshold": "HEALTHY"},
            {"description": "Demand surge factor is within manageable range", "parameter": "demand_surge_factor", "operator": "<=", "threshold": 1.5},
        ],
        "steps": [
            {"step_number": 1, "action": "Verify alternate supplier qualification status and current capacity telemetry", "timeout_seconds": 120, "requires_confirmation": False},
            {"step_number": 2, "action": "Issue substitution order to alternate supplier node", "node_target": "sup-alt", "timeout_seconds": 300, "abort_condition": "supplier_acceptance_timeout", "requires_confirmation": True},
            {"step_number": 3, "action": "Reroute logistics transit to alternate supplier location", "timeout_seconds": 600, "requires_confirmation": False},
            {"step_number": 4, "action": "Monitor recovery metrics and confirm SLA trajectory", "timeout_seconds": 3600, "requires_confirmation": False},
        ],
        "expected_effects": [
            "Primary supply gap covered by alternate supplier within 2-4 hours",
            "Service level maintained above 88% threshold",
            "No secondary cascade to dependent warehouse nodes",
        ],
        "risks": [
            "Alternate supplier may have hidden capacity constraints not reflected in telemetry",
            "Route diversion may add 1-2 hour transit latency",
            "Qualification data may be stale if > 6 hours old",
        ],
        "transfer_constraints": [
            "Do NOT activate if primary supplier capacity < 40% AND alternate capacity also < 40%",
            "Do NOT activate if demand surge factor > 1.5x (insufficient buffer)",
            "Do NOT activate if route health is DISRUPTED",
        ],
        "governance_requirement": GovernanceRequirement.APPROVAL,
    },
    "Emergency Inventory Draw": {
        "purpose": "Draw from healthy regional warehouse reserves to cover deficit at affected node",
        "preconditions": [
            {"description": "Source warehouse reserve buffer exceeds 150%", "parameter": "source_reserve_pct", "operator": ">", "threshold": 1.50},
            {"description": "Ground transportation routes open", "parameter": "ground_route_status", "operator": "==", "threshold": "OPEN"},
            {"description": "Deficit node reachable within SLA window", "parameter": "transit_hours", "operator": "<=", "threshold": 6.0},
        ],
        "steps": [
            {"step_number": 1, "action": "Confirm source warehouse reserve buffer level via inventory telemetry", "timeout_seconds": 60, "requires_confirmation": False},
            {"step_number": 2, "action": "Issue draw authorization for reserve transfer volume", "timeout_seconds": 300, "requires_confirmation": True},
            {"step_number": 3, "action": "Dispatch ground logistics from source to deficit node", "timeout_seconds": 600, "requires_confirmation": False},
            {"step_number": 4, "action": "Confirm receipt and verify deficit node recovery", "timeout_seconds": 7200, "requires_confirmation": False},
        ],
        "expected_effects": [
            "Deficit node inventory restored within 2-6 hours",
            "Source node buffer reduced but remains above operational minimum",
            "SLA breach avoided",
        ],
        "risks": [
            "Source warehouse drawdown may create secondary vulnerability",
            "Ground transit disruption could delay delivery beyond SLA window",
        ],
        "transfer_constraints": [
            "Do NOT activate if source reserve buffer < 120%",
            "Do NOT activate if ground routes are disrupted",
        ],
        "governance_requirement": GovernanceRequirement.APPROVAL,
    },
}

_DEFAULT_ARCHETYPE = {
    "purpose": "UNKNOWN - Insufficient genome data to derive operational purpose",
    "preconditions": [],
    "steps": [
        {"step_number": 1, "action": "UNKNOWN - Manual operational plan required", "timeout_seconds": 600, "requires_confirmation": True}
    ],
    "expected_effects": ["UNKNOWN - Expected effects must be derived from additional simulation"],
    "risks": ["UNKNOWN - Risk profile requires human assessment"],
    "transfer_constraints": ["UNKNOWN - Transfer constraints require domain expert review"],
    "governance_requirement": GovernanceRequirement.BLOCK,
}


class SkillGenerator:
    """
    Deterministic service that converts a Resilience Genome into a Candidate Skill.

    Does NOT generate LLM text blobs.
    Does NOT invent evidence.
    Does NOT activate skills automatically.
    """

    def generate_from_genome(
        self,
        genome: ResilienceGenome,
        skill_name: Optional[str] = None,
        initial_version: str = "v1",
    ) -> ResilienceSkill:
        """
        Convert a Resilience Genome into a Candidate Skill.

        The skill inherits evidence, conditions, boundaries, confidence,
        and supporting experiences directly from the genome.
        """
        # Determine archetype template
        archetype = STRATEGY_ARCHETYPES.get(genome.strategy, _DEFAULT_ARCHETYPE)
        is_known_archetype = genome.strategy in STRATEGY_ARCHETYPES

        # Build preconditions: from archetype template (structured), supplemented by genome conditions
        preconditions: List[SkillPrecondition] = []
        for pre in archetype["preconditions"]:
            preconditions.append(SkillPrecondition(
                description=pre["description"],
                parameter=pre.get("parameter"),
                operator=pre.get("operator"),
                threshold=pre.get("threshold"),
                uncertainty=UncertaintyLevel.KNOWN if is_known_archetype else UncertaintyLevel.UNCERTAIN,
            ))

        # Supplement with any capacity/route_health conditions extracted from success conditions
        genome_params = {sc.parameter for sc in genome.success_conditions if sc.parameter}
        archetype_params = {p.get("parameter") for p in archetype["preconditions"] if p.get("parameter")}
        for sc in genome.success_conditions:
            if sc.parameter and sc.parameter not in archetype_params:
                # This is a genome-derived condition not in the archetype - add it
                op = ">" if ">" in (sc.threshold or "") else ">="
                try:
                    threshold_val = float(sc.threshold.replace(">", "").replace("=", "").strip()) if sc.threshold else None
                except (ValueError, AttributeError):
                    threshold_val = None
                preconditions.append(SkillPrecondition(
                    description=f"Genome condition: {sc.text}",
                    parameter=sc.parameter,
                    operator=op if threshold_val is not None else None,
                    threshold=threshold_val,
                    uncertainty=UncertaintyLevel.PROBABLE,
                ))

        # Build steps from archetype
        steps: List[SkillStep] = []
        for s in archetype["steps"]:
            steps.append(SkillStep(
                step_number=s["step_number"],
                action=s["action"],
                node_target=s.get("node_target"),
                timeout_seconds=s.get("timeout_seconds", 300),
                abort_condition=s.get("abort_condition"),
                requires_confirmation=s.get("requires_confirmation", False),
            ))

        # Determine confidence from genome
        # Confidence is DERIVED from genome, not invented
        if genome.evidence == 0 or not genome.success_conditions:
            confidence = 0.0
            uncertainty = UncertaintyLevel.UNKNOWN
        elif genome.contradictions > 0:
            confidence = max(0.2, genome.confidence - genome.contradictions * 0.12)
            uncertainty = UncertaintyLevel.UNCERTAIN
        elif genome.evidence >= 5:
            confidence = genome.confidence
            uncertainty = UncertaintyLevel.KNOWN
        elif genome.evidence >= 2:
            confidence = genome.confidence * 0.85
            uncertainty = UncertaintyLevel.PROBABLE
        else:
            confidence = genome.confidence * 0.6
            uncertainty = UncertaintyLevel.UNCERTAIN

        # Governance requirement: low confidence or contradictions -> APPROVAL or BLOCK
        if confidence < 0.4 or genome.status == GenomeStatus.CONTRADICTED:
            governance = GovernanceRequirement.BLOCK
        elif confidence < 0.7 or genome.contradictions > 0:
            governance = GovernanceRequirement.APPROVAL
        elif genome.evidence < 3:
            governance = GovernanceRequirement.MONITOR
        else:
            governance = archetype.get("governance_requirement", GovernanceRequirement.APPROVAL)

        skill_name_final = skill_name or f"Conditional {genome.strategy}"

        skill = ResilienceSkill(
            name=skill_name_final,
            version=initial_version,
            purpose=archetype["purpose"],
            strategy=genome.strategy,
            preconditions=preconditions,
            steps=steps,
            expected_effects=archetype["expected_effects"],
            risks=archetype["risks"],
            success_conditions=genome.success_conditions,
            failure_boundaries=genome.failure_boundaries,
            transfer_constraints=archetype["transfer_constraints"],
            evidence=genome.evidence,
            supporting_experiences=genome.supporting_experiences,
            contradicting_experiences=[],
            genome_id=genome.id,
            confidence=round(confidence, 3),
            uncertainty=uncertainty,
            freshness="Generated from Genome",
            lifecycle_status=SkillLifecycle.CANDIDATE,
            validation_status=ValidationResult.INCONCLUSIVE,
            governance_requirement=governance,
            provenance=ProvenanceMetadata(
                source_type=TruthStatus.DERIVED,
                is_simulation=False,
                confidence=round(confidence, 3),
                recorded_by="SkillGenerator",
                audit_notes=f"Generated deterministically from Genome '{genome.id}' (evidence={genome.evidence}, contradictions={genome.contradictions})",
            ),
        )

        logger.info(
            f"SKILL_GENERATED: name='{skill.name}' version={skill.version} "
            f"genome='{genome.id}' lifecycle={skill.lifecycle_status.value} "
            f"confidence={skill.confidence:.3f} uncertainty={skill.uncertainty.value} "
            f"governance={skill.governance_requirement.value}"
        )

        return skill


skill_generator = SkillGenerator()
