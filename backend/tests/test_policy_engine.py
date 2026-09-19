"""
FULFILL-X Deterministic Policy Engine Unit Tests (Phase 10)
"""
import pytest
from app.governance.policy_engine import PolicyEngine, PolicyRuleType
from app.models.enterprise import PolicyViolationAction


def test_policy_engine_pass_case():
    engine = PolicyEngine()
    result = engine.evaluate_decision(
        decision_id="DEC-TEST-01",
        candidate_plan={"total_cost": 45000.0},
        simulation_summary={"expected_service_level": 0.94, "resilience_score": 0.85, "composite_risk": 0.20},
    )
    assert result.overall_status == PolicyViolationAction.PASS
    assert len(result.evaluations) >= 4


def test_policy_engine_block_on_excessive_cost():
    engine = PolicyEngine()
    result = engine.evaluate_decision(
        decision_id="DEC-TEST-HIGH-COST",
        candidate_plan={"total_cost": 150000.0},
        simulation_summary={"expected_service_level": 0.94, "resilience_score": 0.85},
    )
    assert result.overall_status == PolicyViolationAction.BLOCK
    cost_eval = next(e for e in result.evaluations if e.policy_type == PolicyRuleType.MAX_COST)
    assert cost_eval.status == PolicyViolationAction.BLOCK
    assert "exceeds threshold" in cost_eval.explanation


def test_policy_engine_block_on_low_sla():
    engine = PolicyEngine()
    result = engine.evaluate_decision(
        decision_id="DEC-TEST-LOW-SLA",
        candidate_plan={"total_cost": 30000.0},
        simulation_summary={"expected_service_level": 0.70, "resilience_score": 0.85},
    )
    assert result.overall_status == PolicyViolationAction.BLOCK
    sla_eval = next(e for e in result.evaluations if e.policy_type == PolicyRuleType.MIN_SERVICE_LEVEL)
    assert sla_eval.status == PolicyViolationAction.BLOCK
    assert "below minimum" in sla_eval.explanation
