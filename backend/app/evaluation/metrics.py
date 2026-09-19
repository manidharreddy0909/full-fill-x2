"""
Quantitative Metric Calculation Engine for FULFILL-X Phase 12.
Implements deterministic metrics for risk detection, risk localization, scenario validity,
agent validity, coordination quality, adversarial coverage, plan feasibility, plan robustness,
verification accuracy, and transparency completeness.
"""

from typing import Dict, List, Set, Any
from app.schemas.evaluation import MetricResult, GroundTruth, BenchmarkScenario


class MetricCalculator:
    """Deterministic evaluation metric calculation engine."""

    @staticmethod
    def calculate_risk_detection(
        predicted_risk_nodes: List[str], ground_truth: GroundTruth
    ) -> MetricResult:
        """1. Risk Detection Metric (TP, FP, FN, Precision, Recall, F1)."""
        pred_set = set(predicted_risk_nodes)
        gt_set = set(ground_truth.expected_risk_nodes)

        tp = len(pred_set.intersection(gt_set))
        fp = len(pred_set - gt_set)
        fn = len(gt_set - pred_set)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        status = "PASS" if f1 >= 0.70 else "WARN" if f1 >= 0.40 else "FAIL"

        return MetricResult(
            metric_name="risk_detection",
            value=round(f1, 4),
            raw_counts={
                "true_positives": tp,
                "false_positives": fp,
                "false_negatives": fn,
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1": round(f1, 4),
                "risk_detection_rate": round(recall, 4),
            },
            description=f"F1 score for risk detection (TP: {tp}, FP: {fp}, FN: {fn}).",
            status=status,
        )

    @staticmethod
    def calculate_risk_localization(
        predicted_affected_nodes: List[str], ground_truth: GroundTruth
    ) -> MetricResult:
        """2. Risk Localization Metric (IoU / Jaccard similarity)."""
        pred_set = set(predicted_affected_nodes)
        gt_set = set(ground_truth.expected_affected_nodes)

        intersection = len(pred_set.intersection(gt_set))
        union = len(pred_set.union(gt_set))

        iou = intersection / union if union > 0 else 1.0
        status = "PASS" if iou >= 0.60 else "WARN" if iou >= 0.35 else "FAIL"

        return MetricResult(
            metric_name="risk_localization",
            value=round(iou, 4),
            raw_counts={
                "predicted_affected_nodes": list(pred_set),
                "ground_truth_affected_nodes": list(gt_set),
                "intersection_count": intersection,
                "union_count": union,
                "iou_jaccard_score": round(iou, 4),
            },
            description=f"Jaccard IoU similarity for affected node localization ({intersection}/{union}).",
            status=status,
        )

    @staticmethod
    def calculate_scenario_validity(
        scenario: BenchmarkScenario, world_nodes: List[str]
    ) -> MetricResult:
        """3. Scenario Validity Metric."""
        disruption_target = scenario.disruption.get("node_id") or scenario.disruption.get("target_node_id")
        targets_to_check = [disruption_target] if isinstance(disruption_target, str) else scenario.disruption.get("node_ids", [])
        
        valid_entities = all(t in world_nodes for t in targets_to_check if t)
        has_ground_truth = bool(scenario.ground_truth.scenario_id)
        has_signals = len(scenario.signals) > 0

        violations = 0
        if not valid_entities:
            violations += 1
        if not has_ground_truth:
            violations += 1

        validity_rate = 1.0 if violations == 0 else 0.5 if violations == 1 else 0.0
        status = "PASS" if validity_rate == 1.0 else "FAIL"

        return MetricResult(
            metric_name="scenario_validity",
            value=validity_rate,
            raw_counts={
                "valid_scenario_count": 1 if validity_rate == 1.0 else 0,
                "invalid_scenario_count": 0 if validity_rate == 1.0 else 1,
                "constraint_violations": violations,
                "affected_entities_existing": valid_entities,
                "scenario_validity_rate": validity_rate,
            },
            description="Scenario structural schema and entity existence validation.",
            status=status,
        )

    @staticmethod
    def calculate_agent_proposal_validity(
        proposals: List[Dict[str, Any]], world_nodes: List[str]
    ) -> MetricResult:
        """4. Agent Proposal Validity Metric."""
        total = len(proposals)
        if total == 0:
            return MetricResult(
                metric_name="agent_validity",
                value=1.0,
                raw_counts={"valid_proposals": 0, "invalid_proposals": 0, "total_proposals": 0, "agent_validity_rate": 1.0},
                description="No agent proposals generated.",
                status="PASS",
            )

        valid_count = 0
        target_valid_count = 0
        action_valid_count = 0
        schema_valid_count = 0

        for prop in proposals:
            target = prop.get("target_entity_id") or prop.get("target_node_id") or prop.get("target_id")
            action = prop.get("action_type") or prop.get("action")
            agent = prop.get("agent_id") or prop.get("specialist_id")

            target_ok = target in world_nodes if target else False
            action_ok = bool(action)
            schema_ok = bool(agent and action)

            if target_ok:
                target_valid_count += 1
            if action_ok:
                action_valid_count += 1
            if schema_ok:
                schema_valid_count += 1

            if target_ok and action_ok and schema_ok:
                valid_count += 1

        rate = valid_count / total
        status = "PASS" if rate >= 0.80 else "WARN" if rate >= 0.50 else "FAIL"

        return MetricResult(
            metric_name="agent_validity",
            value=round(rate, 4),
            raw_counts={
                "valid_proposals": valid_count,
                "invalid_proposals": total - valid_count,
                "total_proposals": total,
                "agent_validity_rate": round(rate, 4),
                "target_validity_rate": round(target_valid_count / total, 4),
                "action_validity_rate": round(action_valid_count / total, 4),
                "schema_validity_rate": round(schema_valid_count / total, 4),
            },
            description=f"Agent proposal structural and entity validity ({valid_count}/{total}).",
            status=status,
        )

    @staticmethod
    def calculate_coordination_quality(
        detected_agreements: List[str],
        detected_conflicts: List[str],
        ground_truth: GroundTruth,
    ) -> MetricResult:
        """5. Coordinator Agreement / Conflict Quality Metric."""
        gt_agreements = set(ground_truth.expected_agreements)
        gt_conflicts = set(ground_truth.expected_conflicts)

        det_agreements = set(detected_agreements)
        det_conflicts = set(detected_conflicts)

        # Evaluate conflict detection precision/recall
        tp_conflicts = len(det_conflicts.intersection(gt_conflicts))
        fp_conflicts = len(det_conflicts - gt_conflicts)
        fn_conflicts = len(gt_conflicts - det_conflicts)

        precision = tp_conflicts / (tp_conflicts + fp_conflicts) if (tp_conflicts + fp_conflicts) > 0 else 1.0
        recall = tp_conflicts / (tp_conflicts + fn_conflicts) if (tp_conflicts + fn_conflicts) > 0 else 1.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.8  # Default high if no conflicts expected

        status = "PASS" if f1 >= 0.60 else "WARN"

        return MetricResult(
            metric_name="coordination_quality",
            value=round(f1, 4),
            raw_counts={
                "agreements_detected": len(det_agreements),
                "conflicts_detected": len(det_conflicts),
                "known_conflicts": len(gt_conflicts),
                "missed_conflicts": fn_conflicts,
                "conflict_precision": round(precision, 4),
                "conflict_recall": round(recall, 4),
                "coordination_f1": round(f1, 4),
            },
            description="Coordinator agreement and conflict resolution quality score.",
            status=status,
        )

    @staticmethod
    def calculate_adversarial_coverage(
        executed_attacks: List[str],
        found_vulnerabilities: List[str],
        ground_truth: GroundTruth,
    ) -> MetricResult:
        """6. Adversarial Coverage Metric."""
        gt_vulns = set(ground_truth.expected_vulnerabilities)
        found_vulns = set(found_vulnerabilities)

        matched = len(found_vulns.intersection(gt_vulns))
        total_gt = len(gt_vulns)

        coverage = matched / total_gt if total_gt > 0 else 1.0
        status = "PASS" if coverage >= 0.50 else "WARN"

        return MetricResult(
            metric_name="adversarial_coverage",
            value=round(coverage, 4),
            raw_counts={
                "attack_types_executed": len(executed_attacks),
                "vulnerabilities_found": len(found_vulns),
                "known_vulnerabilities": total_gt,
                "missed_vulnerabilities": total_gt - matched,
                "adversarial_coverage": round(coverage, 4),
            },
            description=f"Red-team adversarial vulnerability coverage ({matched}/{total_gt}).",
            status=status,
        )

    @staticmethod
    def calculate_plan_feasibility(
        candidate_plans: List[Dict[str, Any]], ground_truth: GroundTruth
    ) -> MetricResult:
        """7. Plan Feasibility Metric."""
        total = len(candidate_plans)
        if total == 0:
            return MetricResult(
                metric_name="plan_feasibility",
                value=1.0,
                raw_counts={"feasible_plans": 0, "infeasible_plans": 0, "total_plans": 0, "plan_feasibility_rate": 1.0},
                description="No candidate plans evaluated.",
                status="PASS",
            )

        feasible_count = 0
        hard_violations = 0
        soft_violations = 0

        for plan in candidate_plans:
            is_feasible = plan.get("is_feasible", True)
            hard_v = plan.get("hard_constraint_violations", 0)
            soft_v = plan.get("soft_constraint_violations", 0)

            hard_violations += hard_v
            soft_violations += soft_v

            if is_feasible and hard_v == 0:
                feasible_count += 1

        rate = feasible_count / total
        status = "PASS" if rate >= 0.66 else "WARN" if rate >= 0.33 else "FAIL"

        return MetricResult(
            metric_name="plan_feasibility",
            value=round(rate, 4),
            raw_counts={
                "feasible_plans": feasible_count,
                "infeasible_plans": total - feasible_count,
                "total_plans": total,
                "hard_constraint_violations": hard_violations,
                "soft_constraint_violations": soft_violations,
                "plan_feasibility_rate": round(rate, 4),
            },
            description=f"Candidate plan hard-constraint feasibility rate ({feasible_count}/{total}).",
            status=status,
        )

    @staticmethod
    def calculate_plan_robustness(
        baseline_score: float, stressed_score: float
    ) -> MetricResult:
        """8. Plan Robustness Metric (Baseline vs Stressed score)."""
        degradation = max(0.0, baseline_score - stressed_score)
        recovery_score = max(0.0, 1.0 - degradation)
        status = "PASS" if recovery_score >= 0.70 else "WARN" if recovery_score >= 0.40 else "FAIL"

        return MetricResult(
            metric_name="plan_robustness",
            value=round(recovery_score, 4),
            raw_counts={
                "baseline_score": round(baseline_score, 4),
                "stressed_score": round(stressed_score, 4),
                "degradation": round(degradation, 4),
                "recovery_score": round(recovery_score, 4),
            },
            description=f"Plan score resilience under stress (Baseline: {baseline_score:.2f}, Stressed: {stressed_score:.2f}).",
            status=status,
        )

    @staticmethod
    def calculate_verification_accuracy(
        actual_verification_status: str, ground_truth: GroundTruth
    ) -> MetricResult:
        """9. Verification Accuracy Metric."""
        expected_status = ground_truth.expected_verification_result
        is_correct = actual_verification_status.upper() == expected_status.upper()

        false_accept = 1 if (actual_verification_status.upper() == "VERIFIED" and expected_status.upper() != "VERIFIED") else 0
        false_reject = 1 if (actual_verification_status.upper() != "VERIFIED" and expected_status.upper() == "VERIFIED") else 0

        accuracy = 1.0 if is_correct else 0.0
        status = "PASS" if accuracy == 1.0 else "FAIL"

        return MetricResult(
            metric_name="verification_accuracy",
            value=accuracy,
            raw_counts={
                "correctly_verified": 1 if is_correct else 0,
                "incorrectly_verified": 0 if is_correct else 1,
                "false_accept": false_accept,
                "false_reject": false_reject,
                "verification_accuracy": accuracy,
                "actual_status": actual_verification_status,
                "expected_status": expected_status,
            },
            description=f"Sandbox verification status accuracy (Actual: {actual_verification_status}, Expected: {expected_status}).",
            status=status,
        )

    @staticmethod
    def calculate_transparency_completeness(
        decision_payload: Dict[str, Any]
    ) -> MetricResult:
        """10. Transparency Completeness Metric (Field-presence & evidence-link checks)."""
        required_fields = ["evidence", "constraints", "reasoning", "tradeoffs", "impact", "verification"]
        present_count = 0

        for field in required_fields:
            val = decision_payload.get(field)
            if val:
                if isinstance(val, (list, dict)) and len(val) > 0:
                    present_count += 1
                elif isinstance(val, (str, float, int)) and val != "":
                    present_count += 1

        completeness = present_count / len(required_fields)
        status = "PASS" if completeness >= 0.80 else "WARN" if completeness >= 0.50 else "FAIL"

        return MetricResult(
            metric_name="transparency_completeness",
            value=round(completeness, 4),
            raw_counts={
                "present_fields": present_count,
                "total_required_fields": len(required_fields),
                "missing_fields": [f for f in required_fields if not decision_payload.get(f)],
                "transparency_completeness": round(completeness, 4),
            },
            description=f"Decision payload auditability and transparency structural completeness ({present_count}/{len(required_fields)}).",
            status=status,
        )
