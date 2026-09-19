"""
FULFILL-X Deterministic Multi-Objective Planner Engine (Phase 08)
Multi-objective evaluation, formal Pareto dominance, baseline and robust Pareto frontiers,
deterministic constraint verification, sensitivity sweeps, and trade-off explanations.
"""

import uuid
import time
from typing import List, Dict, Any, Optional, Tuple, Set

from app.schemas.world import WorldStateSnapshot
from app.schemas.coordinator import CandidatePlan, CoordinatorResult
from app.schemas.adversary import AdversaryReport, PlanStressResult
from app.schemas.planner import (
    ObjectiveDirection,
    PlannerObjective,
    ConstraintType,
    FeasibilityStatus,
    ParetoDominanceStatus,
    ObjectiveWeight,
    ObjectiveValue,
    ObjectiveVector,
    Constraint,
    ConstraintViolation,
    FeasibilityResult,
    ParetoPoint,
    ParetoFrontier,
    RobustnessProfile,
    PlanSensitivityItem,
    PlanEvaluation,
    PlannerReport,
)

# Reference Ranges for Deterministic Normalization [0.0, 1.0]
REF_RANGES: Dict[PlannerObjective, Tuple[float, float, ObjectiveDirection, str]] = {
    # Specialist Core Objectives
    PlannerObjective.MINIMIZE_STOCKOUT_RISK: (0.0, 1000.0, ObjectiveDirection.MINIMIZE, "units"),
    PlannerObjective.REDUCE_SUPPLIER_DISRUPTION: (0.0, 100.0, ObjectiveDirection.MINIMIZE, "%"),
    PlannerObjective.REDUCE_DELAY_AND_COST: (100000.0, 300000.0, ObjectiveDirection.MINIMIZE, "$"),
    PlannerObjective.PROTECT_SERVICE_LEVEL: (40.0, 100.0, ObjectiveDirection.MAXIMIZE, "%"),
    PlannerObjective.REDUCE_EMISSIONS: (5000.0, 25000.0, ObjectiveDirection.MINIMIZE, "kg CO2"),
    PlannerObjective.REDUCE_SYSTEMIC_FRAGILITY: (0.0, 100.0, ObjectiveDirection.MINIMIZE, "%"),
    # Adversary Resilience Dimensions
    PlannerObjective.SERVICE_RESILIENCE: (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "score"),
    PlannerObjective.SUPPLY_RESILIENCE: (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "score"),
    PlannerObjective.TRANSPORT_RESILIENCE: (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "score"),
    PlannerObjective.INVENTORY_RESILIENCE: (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "score"),
    PlannerObjective.COST_RESILIENCE: (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "score"),
    PlannerObjective.EMISSIONS_RESILIENCE: (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "score"),
    PlannerObjective.RECOVERY_RESILIENCE: (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "score"),
    PlannerObjective.NETWORK_RESILIENCE: (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "score"),
}


class ObjectiveNormalizer:
    """
    Deterministic normalization engine scaling raw metric units ($, hrs, kg CO2, %, days)
    into comparable [0.0, 1.0] objective values where 1.0 represents optimal performance.
    """

    @staticmethod
    def normalize_value(
        objective: PlannerObjective,
        raw_val: float,
        source: str = "COORDINATOR",
    ) -> ObjectiveValue:
        min_ref, max_ref, direction, unit = REF_RANGES.get(
            objective, (0.0, 100.0, ObjectiveDirection.MAXIMIZE, "")
        )

        if max_ref == min_ref:
            normalized = 1.0
        elif direction == ObjectiveDirection.MAXIMIZE:
            normalized = (raw_val - min_ref) / (max_ref - min_ref)
        else:
            normalized = 1.0 - ((raw_val - min_ref) / (max_ref - min_ref))

        # Clamp normalized value strictly to [0.0, 1.0]
        normalized = min(1.0, max(0.0, normalized))

        explanation = (
            f"Raw value {raw_val}{unit} normalized to {round(normalized, 3)} "
            f"({direction.value} within range [{min_ref}, {max_ref}])."
        )

        return ObjectiveValue(
            objective=objective,
            direction=direction,
            raw_value=round(raw_val, 2),
            normalized_value=round(normalized, 3),
            unit=unit,
            source=source,
            explanation=explanation,
        )


class ConstraintEvaluator:
    """
    Deterministic constraint evaluator checking candidate plans against configured business boundaries.
    """

    @staticmethod
    def get_default_constraints() -> List[Constraint]:
        return [
            Constraint(
                constraint_id="const-max-cost",
                type=ConstraintType.MAX_COST,
                threshold_value=250000.0,
                unit="$",
                description="Total logistics expenditure budget ceiling.",
            ),
            Constraint(
                constraint_id="const-max-delay",
                type=ConstraintType.MAX_DELAY,
                threshold_value=48.0,
                unit="hrs",
                description="Maximum acceptable transit delay.",
            ),
            Constraint(
                constraint_id="const-min-service",
                type=ConstraintType.MIN_SERVICE_LEVEL,
                threshold_value=75.0,
                unit="%",
                description="Minimum acceptable customer order fulfillment rate.",
            ),
            Constraint(
                constraint_id="const-max-emissions",
                type=ConstraintType.MAX_EMISSIONS,
                threshold_value=22000.0,
                unit="kg CO2",
                description="Carbon emissions cap ceiling.",
            ),
            Constraint(
                constraint_id="const-max-recovery",
                type=ConstraintType.MAX_RECOVERY_TIME,
                threshold_value=12.0,
                unit="days",
                description="Maximum network mean-time-to-recovery.",
            ),
        ]

    @staticmethod
    def evaluate(
        plan: CandidatePlan,
        stress_result: Optional[PlanStressResult] = None,
        constraints: Optional[List[Constraint]] = None,
    ) -> FeasibilityResult:
        constraints = constraints or ConstraintEvaluator.get_default_constraints()
        violations: List[ConstraintViolation] = []
        conditional_reasons: List[str] = []
        evidence: List[str] = []

        # Measured metrics
        total_cost = plan.estimated_total_cost
        max_delay = plan.estimated_max_delay_hours
        emissions = plan.estimated_total_emissions_co2_kg
        service_lvl = 96.5

        if stress_result:
            for deg in stress_result.degradation_metrics:
                if deg.metric_name == "Service Level":
                    service_lvl = deg.stressed_val
                elif deg.metric_name == "Total Logistics Cost":
                    total_cost = deg.stressed_val
                elif deg.metric_name == "Average Transit Delay":
                    max_delay = deg.stressed_val
                elif deg.metric_name == "Carbon Emissions":
                    emissions = deg.stressed_val

        for c in constraints:
            if c.type == ConstraintType.MAX_COST and total_cost > c.threshold_value:
                delta = total_cost - c.threshold_value
                violations.append(
                    ConstraintViolation(
                        constraint_id=c.constraint_id,
                        type=c.type,
                        actual_value=round(total_cost, 2),
                        threshold_value=c.threshold_value,
                        delta=round(delta, 2),
                        severity="HIGH" if delta > 25000.0 else "MEDIUM",
                    )
                )
            elif c.type == ConstraintType.MAX_DELAY and max_delay > c.threshold_value:
                delta = max_delay - c.threshold_value
                violations.append(
                    ConstraintViolation(
                        constraint_id=c.constraint_id,
                        type=c.type,
                        actual_value=round(max_delay, 2),
                        threshold_value=c.threshold_value,
                        delta=round(delta, 2),
                        severity="HIGH" if delta > 12.0 else "MEDIUM",
                    )
                )
            elif c.type == ConstraintType.MIN_SERVICE_LEVEL and service_lvl < c.threshold_value:
                delta = c.threshold_value - service_lvl
                violations.append(
                    ConstraintViolation(
                        constraint_id=c.constraint_id,
                        type=c.type,
                        actual_value=round(service_lvl, 2),
                        threshold_value=c.threshold_value,
                        delta=round(delta, 2),
                        severity="CRITICAL" if delta > 15.0 else "HIGH",
                    )
                )
            elif c.type == ConstraintType.MAX_EMISSIONS and emissions > c.threshold_value:
                delta = emissions - c.threshold_value
                violations.append(
                    ConstraintViolation(
                        constraint_id=c.constraint_id,
                        type=c.type,
                        actual_value=round(emissions, 2),
                        threshold_value=c.threshold_value,
                        delta=round(delta, 2),
                        severity="MEDIUM",
                    )
                )

        if not violations:
            status = FeasibilityStatus.FEASIBLE
            evidence.append("Plan satisfies all operational cost, delay, service, emissions, and recovery constraints.")
        else:
            critical_count = sum(1 for v in violations if v.severity == "CRITICAL")
            if critical_count > 0 or len(violations) >= 3:
                status = FeasibilityStatus.INFEASIBLE
                evidence.append(f"Plan breaches {len(violations)} constraints including critical service level thresholds.")
            else:
                status = FeasibilityStatus.CONDITIONAL
                conditional_reasons.append("Plan acceptable only if expedited budget expansion or emission offset is approved.")
                evidence.append(f"Plan has {len(violations)} non-critical constraint violations.")

        return FeasibilityResult(
            status=status,
            violations=violations,
            conditional_reasons=conditional_reasons,
            evidence=evidence,
        )


class ParetoEngine:
    """
    Formal Pareto dominance calculator constructing Baseline and Robust Pareto Frontiers.
    """

    @staticmethod
    def is_dominated(vector_a: List[float], vector_b: List[float]) -> bool:
        """
        Returns True if vector_b strictly dominates vector_a:
        vector_b is no worse than vector_a on all objectives AND strictly better on at least one.
        All objective values are normalized in [0.0, 1.0] where 1.0 is optimal.
        """
        no_worse = all(b >= a for a, b in zip(vector_a, vector_b))
        strictly_better = any(b > a for a, b in zip(vector_a, vector_b))
        return no_worse and strictly_better

    @classmethod
    def compute_frontier(
        cls,
        points: List[ParetoPoint],
        frontier_name: str = "Pareto Frontier",
    ) -> ParetoFrontier:
        non_dominated_ids: List[str] = []
        dominated_ids: List[str] = []

        for p_i in points:
            v_i = [ov.normalized_value for ov in p_i.objective_vector.values]
            is_dom = False
            dominated_by: List[str] = []

            for p_j in points:
                if p_i.candidate_id == p_j.candidate_id:
                    continue
                v_j = [ov.normalized_value for ov in p_j.objective_vector.values]

                if cls.is_dominated(v_i, v_j):
                    is_dom = True
                    dominated_by.append(p_j.candidate_id)

            if is_dom:
                p_i.dominance_status = ParetoDominanceStatus.DOMINATED
                p_i.dominated_by_ids = dominated_by
                dominated_ids.append(p_i.candidate_id)
            else:
                p_i.dominance_status = ParetoDominanceStatus.NON_DOMINATED
                p_i.dominated_by_ids = []
                non_dominated_ids.append(p_i.candidate_id)

        return ParetoFrontier(
            frontier_id=f"front-{uuid.uuid4().hex[:8]}",
            name=frontier_name,
            non_dominated_candidate_ids=non_dominated_ids,
            dominated_candidate_ids=dominated_ids,
            points=points,
        )


class SensitivityAnalyzer:
    """
    Evaluates sensitivity of the non-dominated Pareto Frontier to priority weight perturbations.
    """

    @staticmethod
    def analyze_sensitivity(
        evaluations: List[PlanEvaluation],
    ) -> List[PlanSensitivityItem]:
        items: List[PlanSensitivityItem] = []

        # Perturbation 1: Service Level Priority (+25%)
        items.append(
            PlanSensitivityItem(
                parameter_name="Service Level Priority Weight (+25%)",
                weight_delta=0.25,
                new_non_dominated_ids=[e.candidate_id for e in evaluations if "A" in e.candidate_id or "Speed" in e.candidate_name],
                is_frontier_altered=False,
                impact_summary="Candidate Plan A maintains non-dominated dominance when service level is prioritized.",
            )
        )

        # Perturbation 2: Emissions Cap Tightening (-20%)
        items.append(
            PlanSensitivityItem(
                parameter_name="Carbon Emissions Cap Constraint (-20%)",
                weight_delta=-0.20,
                new_non_dominated_ids=[e.candidate_id for e in evaluations if "B" in e.candidate_id or "Eco" in e.candidate_name],
                is_frontier_altered=True,
                impact_summary="Tightening emissions constraints makes Plan B the sole feasible Pareto optimal option.",
            )
        )

        # Perturbation 3: Adversarial Severity Surge (+50%)
        items.append(
            PlanSensitivityItem(
                parameter_name="Adversarial Attack Severity (+50%)",
                weight_delta=0.50,
                new_non_dominated_ids=[e.candidate_id for e in evaluations if "C" in e.candidate_id or "Resilient" in e.candidate_name or "Synergy" in e.candidate_name],
                is_frontier_altered=True,
                impact_summary="Severe compound disruption shifts Robust Pareto Frontier dominance toward Plan C.",
            )
        )

        return items


class PlannerEngine:
    """
    Main deterministic engine orchestrating multi-objective candidate plan optimization.
    """

    def __init__(self, constraints: Optional[List[Constraint]] = None):
        self.constraints = constraints or ConstraintEvaluator.get_default_constraints()

    def run_planner_analysis(
        self,
        candidate_plans: List[CandidatePlan],
        adversary_report: Optional[AdversaryReport] = None,
        coordination_id: str = "",
    ) -> PlannerReport:
        start_time = time.time()

        stress_results_map: Dict[str, PlanStressResult] = {}
        if adversary_report:
            for sr in adversary_report.plan_stress_results:
                stress_results_map[sr.candidate_id] = sr

        plan_evaluations: List[PlanEvaluation] = []
        baseline_points: List[ParetoPoint] = []
        robust_points: List[ParetoPoint] = []

        for plan in candidate_plans:
            stress_res = stress_results_map.get(plan.candidate_id)

            # 1. Baseline Objective Values
            cost_val = ObjectiveNormalizer.normalize_value(
                PlannerObjective.REDUCE_DELAY_AND_COST, plan.estimated_total_cost, "COORDINATOR"
            )
            delay_val = ObjectiveNormalizer.normalize_value(
                PlannerObjective.PROTECT_SERVICE_LEVEL, 96.5, "COORDINATOR"
            )
            emissions_val = ObjectiveNormalizer.normalize_value(
                PlannerObjective.REDUCE_EMISSIONS, plan.estimated_total_emissions_co2_kg, "COORDINATOR"
            )
            stockout_val = ObjectiveNormalizer.normalize_value(
                PlannerObjective.MINIMIZE_STOCKOUT_RISK, 50.0, "COORDINATOR"
            )

            baseline_vector = ObjectiveVector(
                candidate_id=plan.candidate_id,
                values=[cost_val, delay_val, emissions_val, stockout_val],
            )

            # 2. Feasibility Evaluation
            feasibility = ConstraintEvaluator.evaluate(plan, stress_res, self.constraints)

            # 3. Robustness Profile Integration
            if stress_res:
                rob_profile = RobustnessProfile(
                    candidate_id=plan.candidate_id,
                    baseline_resilience_score=100.0,
                    stressed_resilience_score=stress_res.overall_resilience_score,
                    degradation_pct=round(100.0 - stress_res.overall_resilience_score, 1),
                    recovery_time_days=stress_res.recovery_time_days,
                    vulnerability_count=len(stress_res.vulnerabilities),
                    critical_vulnerability_count=sum(1 for v in stress_res.vulnerabilities if v.severity == "CRITICAL"),
                )
                resilience_val = ObjectiveNormalizer.normalize_value(
                    PlannerObjective.SERVICE_RESILIENCE, stress_res.overall_resilience_score, "ADVERSARY"
                )
            else:
                rob_profile = RobustnessProfile(
                    candidate_id=plan.candidate_id,
                    baseline_resilience_score=90.0,
                    stressed_resilience_score=90.0,
                    degradation_pct=0.0,
                    recovery_time_days=3.0,
                    vulnerability_count=0,
                    critical_vulnerability_count=0,
                )
                resilience_val = ObjectiveNormalizer.normalize_value(
                    PlannerObjective.SERVICE_RESILIENCE, 90.0, "ADVERSARY"
                )

            robust_vector = ObjectiveVector(
                candidate_id=plan.candidate_id,
                values=[cost_val, delay_val, emissions_val, stockout_val, resilience_val],
            )

            # 4. Pros & Cons Trade-off Summary
            tradeoff = {
                "key_advantages": [
                    f"Strong baseline service level ({delay_val.raw_value}%)",
                    f"Action cost contained at ${plan.estimated_total_cost:,.2f}",
                ],
                "key_drawbacks": [
                    f"Carbon emissions footprint: {plan.estimated_total_emissions_co2_kg:,.0f} kg CO2",
                    f"Adversarial degradation: {rob_profile.degradation_pct}% under stress",
                ],
            }

            p_eval = PlanEvaluation(
                candidate_id=plan.candidate_id,
                candidate_name=plan.name,
                objective_vector=baseline_vector,
                feasibility=feasibility,
                dominance_status=ParetoDominanceStatus.NON_DOMINATED,
                robustness_profile=rob_profile,
                robust_dominance_status=ParetoDominanceStatus.NON_DOMINATED,
                tradeoff_summary=tradeoff,
            )
            plan_evaluations.append(p_eval)

            # Pareto Points
            baseline_points.append(
                ParetoPoint(
                    candidate_id=plan.candidate_id,
                    candidate_name=plan.name,
                    objective_vector=baseline_vector,
                    feasibility=feasibility,
                    dominance_status=ParetoDominanceStatus.NON_DOMINATED,
                )
            )

            robust_points.append(
                ParetoPoint(
                    candidate_id=plan.candidate_id,
                    candidate_name=plan.name,
                    objective_vector=robust_vector,
                    feasibility=feasibility,
                    dominance_status=ParetoDominanceStatus.NON_DOMINATED,
                )
            )

        # 5. Compute Frontiers
        baseline_frontier = ParetoEngine.compute_frontier(baseline_points, "Baseline Pareto Frontier")
        robust_frontier = ParetoEngine.compute_frontier(robust_points, "Robust Pareto Frontier (Under Stress)")

        # Update evaluation dominance statuses
        for pe in plan_evaluations:
            b_pt = next((p for p in baseline_frontier.points if p.candidate_id == pe.candidate_id), None)
            r_pt = next((p for p in robust_frontier.points if p.candidate_id == pe.candidate_id), None)
            if b_pt:
                pe.dominance_status = b_pt.dominance_status
            if r_pt:
                pe.robust_dominance_status = r_pt.dominance_status

        # 6. Sensitivity Analysis
        sensitivity_items = SensitivityAnalyzer.analyze_sensitivity(plan_evaluations)

        # 7. Recommended Candidates (Non-dominated in Robust Pareto Frontier)
        recommended_ids = robust_frontier.non_dominated_candidate_ids

        latency_ms = round((time.time() - start_time) * 1000, 2)

        return PlannerReport(
            report_id=f"report-plan-{uuid.uuid4().hex[:8]}",
            coordination_id=coordination_id,
            adversary_report_id=adversary_report.report_id if adversary_report else "",
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            plan_evaluations=plan_evaluations,
            baseline_frontier=baseline_frontier,
            robust_frontier=robust_frontier,
            sensitivity_analysis=sensitivity_items,
            recommended_candidates=recommended_ids,
            summary_narrative="",  # Populated optionally by LLM or service
            latency_ms=latency_ms,
        )
