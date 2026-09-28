"""
Hindsight Experience Recorder (Phase 2A)

Converts verified decisions, sandbox simulations, and live operational execution
episodes into persistent Hindsight memories without modifying agent internals.
"""
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import uuid

from app.hindsight.models import (
    Experience,
    RetainRequest,
    RetainResult,
    OutcomeStatus,
    PolicyDecisionStatus,
)
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata
from app.hindsight.client import HindsightClient

logger = logging.getLogger("fulfill-x.hindsight.retain")


class ExperienceRecorder:
    """
    Minimally invasive recorder capturing execution outcomes into Hindsight.
    """
    def __init__(self, client: Optional[HindsightClient] = None):
        self.client = client or HindsightClient.get_instance()

    async def retain_experience(self, experience: Experience) -> RetainResult:
        """
        Directly retain a validated Experience object.
        """
        # Safety assertion: check simulated vs observed boundary
        experience.provenance.validate_simulation_boundary()

        payload = experience.model_dump()
        result = await self.client.retain(payload)

        logger.info(
            f"HINDSIGHT_RETAIN: id={experience.experience_id} "
            f"incident={experience.incident_signature} "
            f"outcome={experience.outcome_status.value} "
            f"truth_status={experience.truth_status.value} "
            f"confidence={experience.confidence:.2f}"
        )

        return RetainResult(
            success=result.get("success", True),
            experience_id=experience.experience_id,
            stored_at=datetime.now(timezone.utc).isoformat(),
            message="Experience retained into Hindsight operational memory",
            truth_status=experience.truth_status,
        )

    async def record_from_decision_outcome(
        self,
        incident_signature: str,
        decision: str,
        action: Dict[str, Any],
        world_snapshot: Dict[str, Any],
        predicted_outcome: Dict[str, Any],
        actual_outcome: Dict[str, Any],
        outcome_status: OutcomeStatus = OutcomeStatus.SUCCESS,
        success_conditions: Optional[List[str]] = None,
        failure_boundaries: Optional[List[str]] = None,
        is_simulation: bool = False,
        recorded_by: str = "OperatorDecisionGate",
        human_override: bool = False,
        policy_decision: PolicyDecisionStatus = PolicyDecisionStatus.COMPLIANT,
        confidence: float = 0.85,
    ) -> RetainResult:
        """
        Convenience adapter callable from the decision cockpit or verification service.
        Converts execution outputs into a structured Experience.
        """
        truth_status = TruthStatus.SIMULATED if is_simulation else TruthStatus.OBSERVED

        provenance = ProvenanceMetadata(
            source_type=truth_status,
            is_simulation=is_simulation,
            recorded_by=recorded_by,
            confidence=confidence,
            audit_notes=f"Generated via Decision Flow. Human Override: {human_override}",
        )

        experience = Experience(
            experience_id=f"exp-{uuid.uuid4().hex[:8]}",
            incident_id=f"inc-{uuid.uuid4().hex[:6]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            incident_signature=incident_signature,
            world_state=world_snapshot,
            decision=decision,
            action=action,
            predicted_outcome=predicted_outcome,
            actual_outcome=actual_outcome,
            outcome_status=outcome_status,
            success_conditions=success_conditions or [],
            failure_boundaries=failure_boundaries or [],
            provenance=provenance,
            human_override=human_override,
            policy_decision=policy_decision,
            confidence=confidence,
            truth_status=truth_status,
        )

        return await self.retain_experience(experience)


experience_recorder = ExperienceRecorder()
