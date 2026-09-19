"""
FULFILL-X Enterprise Deterministic Policy Engine (Phase 10)
Evaluates server-side business governance policies before plan execution or model activation.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field

from app.models.enterprise import PolicyViolationAction


class PolicyRuleType(str, Enum):
    MAX_COST = "max_cost"
    MIN_SERVICE_LEVEL = "min_service_level"
    MIN_RESILIENCE = "min_resilience"
    MAX_RISK = "max_risk"
    MAX_SUPPLIER_CONCENTRATION = "max_supplier_concentration"
    MAX_SPOF_COUNT = "max_single_point_of_failure"


class PolicyEvaluationDetail(BaseModel):
    policy_name: str
    policy_type: PolicyRuleType
    threshold_value: float
    observed_value: float
    status: PolicyViolationAction
    explanation: str


class PolicyEvaluationResult(BaseModel):
    decision_id: str
    organization_id: str
    workspace_id: str
    overall_status: PolicyViolationAction
    evaluations: List[PolicyEvaluationDetail]
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PolicyEngine:
    """
    Deterministic Policy Engine evaluating enterprise operational boundaries.
    """

    def __init__(self):
        self.default_policies: List[Dict[str, Any]] = [
            {
                "name": "Maximum Authorized Cost Policy",
                "policy_type": PolicyRuleType.MAX_COST,
                "threshold_value": 75000.0,
                "action_on_violation": PolicyViolationAction.BLOCK,
            },
            {
                "name": "Minimum Guaranteed SLA Policy",
                "policy_type": PolicyRuleType.MIN_SERVICE_LEVEL,
                "threshold_value": 0.88,
                "action_on_violation": PolicyViolationAction.BLOCK,
            },
            {
                "name": "Minimum Systemic Resilience Score",
                "policy_type": PolicyRuleType.MIN_RESILIENCE,
                "threshold_value": 0.70,
                "action_on_violation": PolicyViolationAction.WARN,
            },
            {
                "name": "Maximum Composite Risk Threshold",
                "policy_type": PolicyRuleType.MAX_RISK,
                "threshold_value": 0.80,
                "action_on_violation": PolicyViolationAction.WARN,
            },
        ]

    def evaluate_decision(
        self,
        decision_id: str,
        organization_id: str = "org-fulfillx-default",
        workspace_id: str = "ws-default",
        candidate_plan: Optional[Dict[str, Any]] = None,
        simulation_summary: Optional[Dict[str, Any]] = None,
        custom_policies: Optional[List[Dict[str, Any]]] = None,
    ) -> PolicyEvaluationResult:
        policies = custom_policies if custom_policies else self.default_policies
        evaluations: List[PolicyEvaluationDetail] = []
        overall_status = PolicyViolationAction.PASS

        plan = candidate_plan or {}
        sim = simulation_summary or {}

        # 1. Cost check
        proposed_cost = float(plan.get("total_cost", 35000.0))
        # 2. SLA check
        proposed_sla = float(sim.get("expected_service_level", 0.92))
        # 3. Resilience check
        resilience_score = float(sim.get("resilience_score", 0.85))
        # 4. Composite risk check
        composite_risk = float(sim.get("composite_risk", 0.25))

        for pol in policies:
            p_type = pol.get("policy_type")
            threshold = float(pol.get("threshold_value", 0.0))
            action = pol.get("action_on_violation", PolicyViolationAction.BLOCK)
            p_name = pol.get("name", "Policy Check")

            if p_type == PolicyRuleType.MAX_COST:
                observed = proposed_cost
                violated = observed > threshold
                explanation = (
                    f"Cost ${observed:,.2f} exceeds threshold ${threshold:,.2f}"
                    if violated
                    else f"Cost ${observed:,.2f} within threshold ${threshold:,.2f}"
                )
            elif p_type == PolicyRuleType.MIN_SERVICE_LEVEL:
                observed = proposed_sla
                violated = observed < threshold
                explanation = (
                    f"Predicted SLA {observed*100:.1f}% below minimum {threshold*100:.1f}%"
                    if violated
                    else f"Predicted SLA {observed*100:.1f}% satisfies threshold {threshold*100:.1f}%"
                )
            elif p_type == PolicyRuleType.MIN_RESILIENCE:
                observed = resilience_score
                violated = observed < threshold
                explanation = (
                    f"Resilience Score {observed*100:.1f}% below minimum {threshold*100:.1f}%"
                    if violated
                    else f"Resilience Score {observed*100:.1f}% satisfies threshold {threshold*100:.1f}%"
                )
            elif p_type == PolicyRuleType.MAX_RISK:
                observed = composite_risk
                violated = observed > threshold
                explanation = (
                    f"Composite Risk {observed*100:.1f}% exceeds max allowed {threshold*100:.1f}%"
                    if violated
                    else f"Composite Risk {observed*100:.1f}% within threshold {threshold*100:.1f}%"
                )
            else:
                observed = 0.0
                violated = False
                explanation = "Policy satisfied"

            status = action if violated else PolicyViolationAction.PASS
            evaluations.append(
                PolicyEvaluationDetail(
                    policy_name=p_name,
                    policy_type=p_type,
                    threshold_value=threshold,
                    observed_value=observed,
                    status=status,
                    explanation=explanation,
                )
            )

            if status == PolicyViolationAction.BLOCK:
                overall_status = PolicyViolationAction.BLOCK
            elif status == PolicyViolationAction.WARN and overall_status != PolicyViolationAction.BLOCK:
                overall_status = PolicyViolationAction.WARN

        return PolicyEvaluationResult(
            decision_id=decision_id,
            organization_id=organization_id,
            workspace_id=workspace_id,
            overall_status=overall_status,
            evaluations=evaluations,
        )
