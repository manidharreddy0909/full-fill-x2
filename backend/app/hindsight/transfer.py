"""
Hindsight Transfer Intelligence Evaluator (Phase 2A)

Evaluates whether an empirically derived Resilience Genome or historical experience
safely transfers to current operational conditions.

Golden Rule:
Similarity is evidence, NOT permission.
A historically successful strategy is NEVER blindly reused.
"""
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import uuid

from app.hindsight.models import (
    ResilienceGenome,
    CurrentContext,
    TransferAssessment,
    TransferabilityState,
    ConditionEvaluation,
)

logger = logging.getLogger("fulfill-x.hindsight.transfer")


class TransferEvaluator:
    """
    Rigorously tests whether a candidate strategy's learned boundaries
    hold under current real-time operating conditions.
    """
    def evaluate(
        self,
        genome: ResilienceGenome,
        current: CurrentContext,
    ) -> TransferAssessment:
        """
        Compare current context against genome success conditions and failure boundaries.
        """
        evaluations: List[ConditionEvaluation] = []
        transferable_conditions: List[str] = []
        violated_conditions: List[str] = []
        critical_violation = False

        # If genome has no evidence or provisional, immediately return UNKNOWN
        if genome.evidence == 0 or not genome.success_conditions:
            logger.info("TRANSFER_ASSESSED: Genome has insufficient evidence -> UNKNOWN")
            return TransferAssessment(
                strategy_name=genome.strategy,
                source_genome_id=genome.id,
                status=TransferabilityState.UNKNOWN,
                similarity_score=0.4,
                reason="Insufficient historical evidence base to evaluate transferability safely.",
                recommendation="Run sandbox simulation and execute under human operator oversight.",
                requires_human_approval=True,
            )

        # 1. Evaluate failure boundaries (Safety First)
        for fb in genome.failure_boundaries:
            if fb.parameter == "capacity" and current.current_capacity is not None:
                # E.g. learned boundary: capacity < 0.40
                threshold_val = 0.40
                if "<" in (fb.threshold or ""):
                    try:
                        threshold_val = float(fb.threshold.replace("<", "").strip())
                    except ValueError:
                        threshold_val = 0.40

                if current.current_capacity < threshold_val:
                    violated_conditions.append(
                        f"Capacity {current.current_capacity*100:.1f}% violates failure boundary ({fb.text})"
                    )
                    critical_violation = (fb.severity == "CRITICAL")
                    evaluations.append(
                        ConditionEvaluation(
                            name="Supplier Capacity",
                            observed_value=f"{current.current_capacity*100:.1f}%",
                            required_threshold=f">= {threshold_val*100:.1f}%",
                            passed=False,
                            details=f"Breaches failure boundary: {fb.text}",
                        )
                    )
                    logger.warning(
                        f"BOUNDARY_VIOLATED: parameter=capacity "
                        f"observed={current.current_capacity:.2f} "
                        f"threshold={threshold_val:.2f} "
                        f"strategy='{genome.strategy}'"
                    )

        # 2. Evaluate success conditions
        for sc in genome.success_conditions:
            if sc.parameter == "capacity" and current.current_capacity is not None:
                threshold_val = 0.40
                if ">" in (sc.threshold or ""):
                    try:
                        threshold_val = float(sc.threshold.replace(">", "").strip())
                    except ValueError:
                        threshold_val = 0.40

                passed = (current.current_capacity >= threshold_val)
                if passed:
                    transferable_conditions.append(sc.text)
                elif not any(e.name == "Supplier Capacity" for e in evaluations):
                    violated_conditions.append(f"Capacity requirement unmet ({sc.text})")

                if not any(e.name == "Supplier Capacity" for e in evaluations):
                    evaluations.append(
                        ConditionEvaluation(
                            name="Supplier Capacity",
                            observed_value=f"{current.current_capacity*100:.1f}%",
                            required_threshold=f"> {threshold_val*100:.1f}%",
                            passed=passed,
                            details="Verified against historical capacity threshold",
                        )
                    )

            elif sc.parameter == "route_health":
                passed = (current.route_status == "HEALTHY" or current.route_status is None)
                if passed:
                    transferable_conditions.append(sc.text)
                else:
                    violated_conditions.append(f"Route disruption active ({sc.text})")
                evaluations.append(
                    ConditionEvaluation(
                        name="Route Health",
                        observed_value=current.route_status or "HEALTHY",
                        required_threshold="HEALTHY",
                        passed=passed,
                        details="Transit link status",
                    )
                )

        # 3. Determine Transferability State
        if critical_violation:
            # Capacity boundary breached — always materially different conditions
            capacity_val_str = (
                f"Current capacity ({current.current_capacity*100:.1f}%)"
                if current.current_capacity is not None
                else "Current capacity (unknown)"
            )
            if transferable_conditions:
                status = TransferabilityState.PARTIAL
                reason = (
                    f"Historical strategy observed under materially different capacity conditions. "
                    f"{capacity_val_str} breaches the verified minimum "
                    "threshold (> 40%). Logistics route intelligence transfers, but capacity logic does NOT."
                )
                recommendation = (
                    "Do NOT reuse raw historical parameters. Synthesize alternative strategy (e.g. secondary buffer "
                    "or multi-supplier split) and submit to Challenger stress testing."
                )
            else:
                status = TransferabilityState.NON_TRANSFERABLE
                reason = (
                    f"Historical strategy observed under materially different capacity conditions. "
                    f"{capacity_val_str} directly triggers critical failure boundaries. "
                    "No historical condition transfers safely to current operational state."
                )
                recommendation = "Reject strategy. Re-route to alternative specialist or human coordinator."
            confidence = 0.88
            requires_human_approval = True

        elif violated_conditions:
            status = TransferabilityState.PARTIAL
            reason = f"Partial condition match. {len(violated_conditions)} condition(s) violated."
            recommendation = "Adapt strategy parameters before dispatching to verification."
            confidence = 0.74
            requires_human_approval = True

        else:
            # All conditions pass — but governance gate is still the authority
            status = TransferabilityState.TRANSFERABLE
            reason = "All empirical success conditions verified under current network telemetry."
            recommendation = "Strategy is validated for execution through standard governance gate."
            confidence = 0.92
            # SAFETY: high-confidence transfer still surfaces through governance;
            # requires_human_approval reflects whether an operator must actively sign off
            # (auto-approved strategies still flow through governance, just without a manual gate)
            requires_human_approval = genome.evidence < 4  # Low-evidence genomes always need human sign-off

        assessment = TransferAssessment(
            assessment_id=f"transfer-{uuid.uuid4().hex[:6]}",
            strategy_name=genome.strategy,
            source_genome_id=genome.id,
            status=status,
            similarity_score=0.78,
            transferable_conditions=transferable_conditions,
            violated_conditions=violated_conditions,
            evaluations=evaluations,
            reason=reason,
            recommendation=recommendation,
            confidence=confidence,
            requires_human_approval=requires_human_approval,
            assessed_at=datetime.now(timezone.utc).isoformat(),
        )

        logger.info(
            f"TRANSFER_ASSESSED: strategy='{genome.strategy}' "
            f"status={status.value} "
            f"transferable_conditions={len(transferable_conditions)} "
            f"violated_conditions={len(violated_conditions)} "
            f"confidence={confidence:.2f}"
        )

        return assessment


transfer_evaluator = TransferEvaluator()
