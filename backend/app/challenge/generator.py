"""
FULFILL-X Challenge Scenario Generator (Phase 4)

Generates targeted, hypothesis-driven challenge scenarios that probe specific assumptions,
failure boundaries, dependency structures, and uncertainty zones of resilience skills.
"""
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.challenge.models import (
    ChallengeScenario,
    ChallengeScenarioType,
    ChallengeStatus,
)
from app.skills.models import (
    ResilienceSkill,
    UncertaintyLevel,
)
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata

logger = logging.getLogger("fulfill-x.challenge.generator")


class ChallengeScenarioGenerator:
    """
    Synthesizes structured challenge scenarios specifically engineered
    to test the validity, robustness, and failure boundaries of a ResilienceSkill.
    """

    def generate_boundary_challenge(
        self,
        skill: ResilienceSkill,
        parameter: str = "capacity",
        boundary_threshold: float = 0.40,
        probe_below: bool = True,
        delta: float = 0.02,
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> ChallengeScenario:
        """
        Create a BOUNDARY_TEST scenario probing right below or above a known boundary threshold.
        Example: boundary is 0.40. probe_below=True -> 0.38. probe_below=False -> 0.42.
        """
        test_val = (boundary_threshold - delta) if probe_below else (boundary_threshold + delta)
        test_val = round(max(0.0, min(1.0, test_val)), 3)

        baseline = baseline_world or {
            "supplier_id": "sup-001",
            "capacity": 0.85,
            "demand_surge_factor": 1.0,
            "transit_delay_hours": 0.0,
            "stock_level_pct": 0.75,
        }

        perturbations = {
            parameter: test_val,
            "boundary_under_test": f"{parameter} threshold {boundary_threshold}",
            "is_breach_expected": probe_below,
        }

        target_assumption = (
            f"Skill '{skill.name}' is valid only when {parameter} > {boundary_threshold}. "
            f"Testing at {test_val} ({'BELOW' if probe_below else 'ABOVE'} threshold)."
        )

        expected = (
            "Skill should reject or fail recovery"
            if probe_below
            else "Skill should remain applicable and successfully recover"
        )

        return ChallengeScenario(
            id="cs-bnd-" + uuid.uuid4().hex[:6],
            skill_id=skill.skill_id,
            skill_version=skill.version,
            target_assumption=target_assumption,
            scenario_type=ChallengeScenarioType.BOUNDARY_TEST,
            baseline_world_state=baseline,
            perturbations=perturbations,
            expected_skill_behavior=expected,
            risk_level="HIGH" if probe_below else "MEDIUM",
            created_from="boundary_probing_engine",
            provenance=ProvenanceMetadata(
                source_type=TruthStatus.SIMULATED,
                is_simulation=True,
                recorded_by="ChallengeScenarioGenerator",
                audit_notes=f"Probing {parameter} at {test_val} against threshold {boundary_threshold}",
            ),
            status=ChallengeStatus.PLANNED,
        )

    def generate_capacity_degradation_challenge(
        self,
        skill: ResilienceSkill,
        degradation_pct: float = 0.60,  # e.g., drops capacity to 40% of original
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> ChallengeScenario:
        """Create a CAPACITY_DEGRADATION scenario removing precondition margin."""
        baseline = baseline_world or {
            "supplier_id": "sup-001",
            "capacity": 0.85,
            "demand_surge_factor": 1.0,
            "stock_level_pct": 0.70,
        }
        orig_cap = baseline.get("capacity", 0.85)
        new_cap = round(orig_cap * (1.0 - degradation_pct), 3)

        return ChallengeScenario(
            id="cs-cap-" + uuid.uuid4().hex[:6],
            skill_id=skill.skill_id,
            skill_version=skill.version,
            target_assumption=f"Skill assumes resilient operations under degraded capacity ({new_cap:.2f})",
            scenario_type=ChallengeScenarioType.CAPACITY_DEGRADATION,
            baseline_world_state=baseline,
            perturbations={"capacity": new_cap, "capacity_reduction_pct": degradation_pct},
            expected_skill_behavior="Evaluate whether skill handles capacity degradation gracefully",
            risk_level="HIGH",
            created_from="capacity_degradation_generator",
            provenance=ProvenanceMetadata(
                source_type=TruthStatus.SIMULATED,
                is_simulation=True,
                recorded_by="ChallengeScenarioGenerator",
            ),
        )

    def generate_dependency_failure_challenge(
        self,
        skill: ResilienceSkill,
        failed_dependency: str = "wh-chokepoint-01",
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> ChallengeScenario:
        """Create a DEPENDENCY_FAILURE scenario disabling an upstream or intermediate dependency."""
        baseline = baseline_world or {
            "primary_supplier": "sup-001",
            "active_routes": ["route-s1-w1", "route-w1-fc1"],
            "capacity": 0.65,
        }

        return ChallengeScenario(
            id="cs-dep-" + uuid.uuid4().hex[:6],
            skill_id=skill.skill_id,
            skill_version=skill.version,
            target_assumption=f"Skill assumes dependency '{failed_dependency}' remains available",
            scenario_type=ChallengeScenarioType.DEPENDENCY_FAILURE,
            baseline_world_state=baseline,
            perturbations={
                "failed_node": failed_dependency,
                "node_status": "OFFLINE",
                "route_blocked": True,
            },
            expected_skill_behavior="Skill must discover whether fallback path exists or fail gracefully",
            risk_level="CRITICAL",
            created_from="dependency_failure_generator",
        )

    def generate_topology_change_challenge(
        self,
        skill: ResilienceSkill,
        new_hub: str = "wh-alternative-03",
        extra_latency_hours: float = 3.5,
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> ChallengeScenario:
        """Create a TOPOLOGY_CHANGE scenario re-routing network flow through alternate hub."""
        baseline = baseline_world or {
            "active_hub": "wh-central-01",
            "capacity": 0.60,
            "transit_delay_hours": 0.0,
        }

        return ChallengeScenario(
            id="cs-top-" + uuid.uuid4().hex[:6],
            skill_id=skill.skill_id,
            skill_version=skill.version,
            target_assumption="Skill assumes static 2-echelon topology with direct transit",
            scenario_type=ChallengeScenarioType.TOPOLOGY_CHANGE,
            baseline_world_state=baseline,
            perturbations={
                "redirect_hub": new_hub,
                "transit_delay_hours": extra_latency_hours,
                "intermediate_transshipment": True,
            },
            expected_skill_behavior="Skill should adjust recovery estimates for added transit hops",
            risk_level="MEDIUM",
            created_from="topology_change_generator",
        )

    def generate_demand_surge_challenge(
        self,
        skill: ResilienceSkill,
        surge_factor: float = 1.6,
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> ChallengeScenario:
        """Create a DEMAND_SURGE challenge testing volume limits."""
        baseline = baseline_world or {
            "supplier_id": "sup-001",
            "capacity": 0.50,
            "demand_surge_factor": 1.0,
        }

        return ChallengeScenario(
            id="cs-dmd-" + uuid.uuid4().hex[:6],
            skill_id=skill.skill_id,
            skill_version=skill.version,
            target_assumption=f"Skill assumes demand surge is within nominal bounds (testing {surge_factor:.1f}x)",
            scenario_type=ChallengeScenarioType.DEMAND_SURGE,
            baseline_world_state=baseline,
            perturbations={
                "demand_surge_factor": surge_factor,
                "surge_units_spike": int(surge_factor * 1000),
            },
            expected_skill_behavior="Skill should evaluate inventory exhaustion under acute demand surge",
            risk_level="HIGH",
            created_from="demand_surge_generator",
        )

    def generate_stale_evidence_challenge(
        self,
        skill: ResilienceSkill,
        evidence_age_days: int = 120,
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> ChallengeScenario:
        """Create a STALE_EVIDENCE challenge where supporting evidence is older than freshness window."""
        baseline = baseline_world or {
            "capacity": 0.55,
            "evidence_timestamp_days_ago": evidence_age_days,
        }

        return ChallengeScenario(
            id="cs-stl-" + uuid.uuid4().hex[:6],
            skill_id=skill.skill_id,
            skill_version=skill.version,
            target_assumption=f"Skill assumes historical parameters are still representative despite {evidence_age_days}d age",
            scenario_type=ChallengeScenarioType.STALE_EVIDENCE,
            baseline_world_state=baseline,
            perturbations={
                "evidence_age_days": evidence_age_days,
                "staleness_discount_applied": True,
            },
            expected_skill_behavior="Skill confidence should discount stale evidence and request verification",
            risk_level="MEDIUM",
            created_from="stale_evidence_generator",
        )

    def generate_conflicting_evidence_challenge(
        self,
        skill: ResilienceSkill,
        contradicting_outcome: str = "Supplier substitution stalled due to labor strike",
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> ChallengeScenario:
        """Create a CONFLICTING_EVIDENCE challenge that challenges a core success assumption."""
        baseline = baseline_world or {
            "supplier_id": "sup-001",
            "capacity": 0.60,
        }

        return ChallengeScenario(
            id="cs-cnf-" + uuid.uuid4().hex[:6],
            skill_id=skill.skill_id,
            skill_version=skill.version,
            target_assumption="Skill assumes operational preconditions are sufficient for execution",
            scenario_type=ChallengeScenarioType.CONFLICTING_EVIDENCE,
            baseline_world_state=baseline,
            perturbations={
                "conflicting_evidence": contradicting_outcome,
                "external_factor": "LABOR_DISPUTE",
            },
            expected_skill_behavior="Skill should acknowledge contradiction, lower confidence, or fail validation",
            risk_level="HIGH",
            created_from="conflicting_evidence_generator",
        )

    def generate_novel_condition_challenge(
        self,
        skill: ResilienceSkill,
        novel_factor: str = "Extreme Arctic Polar Vortex at Port B",
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> ChallengeScenario:
        """Create a NOVEL_CONDITION challenge where Hindsight has zero prior evidence (UNKNOWN)."""
        baseline = baseline_world or {
            "unseen_weather_event": True,
            "historical_observation_count": 0,
            "capacity": 0.35,
        }

        return ChallengeScenario(
            id="cs-nvl-" + uuid.uuid4().hex[:6],
            skill_id=skill.skill_id,
            skill_version=skill.version,
            target_assumption="Skill encounters an unprecedented condition with zero historical coverage",
            scenario_type=ChallengeScenarioType.NOVEL_CONDITION,
            baseline_world_state=baseline,
            perturbations={
                "novel_factor": novel_factor,
                "historical_prior_coverage": 0.0,
                "uncertainty_level": UncertaintyLevel.UNKNOWN.value,
            },
            expected_skill_behavior="Skill must declare UNKNOWN rather than hallucinate high confidence",
            risk_level="CRITICAL",
            created_from="novel_condition_generator",
        )

    def generate_gradient_series(
        self,
        skill: ResilienceSkill,
        parameter: str = "capacity",
        values: Optional[List[float]] = None,
        baseline_world: Optional[Dict[str, Any]] = None,
    ) -> List[ChallengeScenario]:
        """
        Generate a bounded deterministic series of boundary challenge scenarios
        probing along a gradient (e.g. 0.45, 0.42, 0.41, 0.40, 0.39, 0.37, 0.35).
        """
        test_values = values or [0.45, 0.42, 0.41, 0.40, 0.39, 0.37, 0.35]
        scenarios: List[ChallengeScenario] = []

        for v in test_values:
            sc = self.generate_boundary_challenge(
                skill=skill,
                parameter=parameter,
                boundary_threshold=0.40,
                probe_below=(v < 0.40),
                delta=abs(round(0.40 - v, 3)),
                baseline_world=baseline_world,
            )
            sc.perturbations[parameter] = v
            sc.target_assumption = f"Controlled gradient probe: {parameter} = {v:.2f}"
            scenarios.append(sc)

        return scenarios
