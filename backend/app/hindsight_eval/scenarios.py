"""
FULFILL-X Evaluation Scenario Generator (Phase 5)

Generates standardized incident sequences for empirical learning evaluation.
Includes repeated patterns, related-but-not-identical situations, boundary cases,
contradictory evidence, and novel unknown conditions.
"""
from typing import Dict, Any, List, Optional
import uuid

from app.hindsight_eval.models import (
    EvaluationScenario,
    EvaluationScenarioType,
)
from app.hindsight.provenance import TruthStatus, ProvenanceMetadata


class ScenarioSequenceGenerator:
    """
    Synthesizes diverse evaluation sequences with deliberate learning opportunities.
    """

    @staticmethod
    def generate_canonical_30_sequence() -> List[EvaluationScenario]:
        """
        Creates the canonical 30-incident benchmark sequence specified in Phase 5:
        - 6 repeated-pattern scenarios
        - 6 related-but-not-identical scenarios
        - 4 boundary scenarios
        - 4 dependency failures
        - 3 demand shocks
        - 3 topology changes
        - 2 stale-evidence cases
        - 2 novel/unknown cases
        """
        scenarios: List[EvaluationScenario] = []

        # ── 1. Episode 1: Initial Baseline Safe Operation ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-01",
                incident_signature="CAPACITY_DROP:sup-001:cap=0.65",
                scenario_type=EvaluationScenarioType.BASELINE,
                world_state={"supplier_id": "sup-001", "capacity": 0.65, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="LOW",
                difficulty="EASY",
                relationship_to_previous_cases="Initial baseline condition. Nominal capacity margin.",
                ground_truth_simulation={"recommended_strategy": "Supplier Substitution (Secondary Sourcing)", "expected_success": True},
            )
        )

        # ── 2. Episode 2: Repeated Pattern #1 - Critical Capacity Failure (28%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-02",
                incident_signature="CAPACITY_COLLAPSE:sup-002:cap=0.28",
                scenario_type=EvaluationScenarioType.DEGRADATION,
                world_state={"supplier_id": "sup-002", "capacity": 0.28, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="Acute supplier failure below 40% boundary. Substitution will fail; Emergency Inventory Draw required.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 3. Episode 3: Boundary Test #1 - Above Boundary (42%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-03",
                incident_signature="BOUNDARY_CHECK:sup-001:cap=0.42",
                scenario_type=EvaluationScenarioType.BOUNDARY,
                world_state={"supplier_id": "sup-001", "capacity": 0.42, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="MEDIUM",
                difficulty="NORMAL",
                relationship_to_previous_cases="Immediately above 40% threshold. Substitution valid.",
                ground_truth_simulation={"recommended_strategy": "Supplier Substitution (Secondary Sourcing)", "expected_success": True},
            )
        )

        # ── 4. Episode 4: Related Scenario #1 - Modest Capacity (36%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-04",
                incident_signature="RELATED_TRANSFER:sup-003:cap=0.36",
                scenario_type=EvaluationScenarioType.RELATED,
                world_state={"supplier_id": "sup-003", "capacity": 0.36, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="HIGH",
                difficulty="NORMAL",
                relationship_to_previous_cases="Capacity 36% (< 40%). Related to Ep 2 failure. Requires transfer reasoning.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 5. Episode 5: Repeated Pattern #2 - Repetition of Critical Capacity (28%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-05",
                incident_signature="CAPACITY_COLLAPSE:sup-002:cap=0.28",
                scenario_type=EvaluationScenarioType.DEGRADATION,
                world_state={"supplier_id": "sup-002", "capacity": 0.28, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="EXACT REPEAT of Episode 2. Tests repeated mistake avoidance.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 6. Episode 6: Dependency Failure #1 - Intermediate Warehouse Offline ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-06",
                incident_signature="DEPENDENCY_OUTAGE:wh-hub-01",
                scenario_type=EvaluationScenarioType.DEPENDENCY_FAILURE,
                world_state={"failed_node": "wh-hub-01", "capacity": 0.50, "demand_surge_factor": 1.0, "route_health": "DISRUPTED"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="Primary hub node down. Requires Production Rescheduling or bypass route.",
                ground_truth_simulation={"recommended_strategy": "Production Rescheduling & Alternate Dispatch", "expected_success": True},
            )
        )

        # ── 7. Episode 7: Demand Shock #1 - 1.5x Surge ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-07",
                incident_signature="DEMAND_SURGE:factor=1.5",
                scenario_type=EvaluationScenarioType.DEMAND_SURGE,
                world_state={"supplier_id": "sup-001", "capacity": 0.55, "demand_surge_factor": 1.5, "route_health": "NORMAL"},
                expected_risk="HIGH",
                difficulty="NORMAL",
                relationship_to_previous_cases="Demand surge breaks nominal substitution; requires inventory buffer support.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 8. Episode 8: Topology Change #1 - Secondary Route Latency ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-08",
                incident_signature="TOPOLOGY_REROUTE:hub-03:delay=4h",
                scenario_type=EvaluationScenarioType.TOPOLOGY_CHANGE,
                world_state={"supplier_id": "sup-001", "capacity": 0.60, "transit_delay_hours": 4.0, "route_health": "DEGRADED"},
                expected_risk="MEDIUM",
                difficulty="NORMAL",
                relationship_to_previous_cases="Topology redirected with transit delay penalty.",
                ground_truth_simulation={"recommended_strategy": "Supplier Substitution (Secondary Sourcing)", "expected_success": True},
            )
        )

        # ── 9. Episode 9: Stale Evidence #1 - 120-Day Old Records ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-09",
                incident_signature="STALE_SUPPLIER_RECORD:age=120d",
                scenario_type=EvaluationScenarioType.STALE,
                world_state={"supplier_id": "sup-004", "capacity": 0.50, "evidence_age_days": 120, "route_health": "NORMAL"},
                expected_risk="MEDIUM",
                difficulty="NORMAL",
                relationship_to_previous_cases="Historical evidence is aged; requires verification before commitment.",
                ground_truth_simulation={"recommended_strategy": "Supplier Substitution (Secondary Sourcing)", "expected_success": True},
            )
        )

        # ── 10. Episode 10: Novel Condition #1 - Solar Storm Blackout (UNKNOWN) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-10",
                incident_signature="NOVEL_SPACE_WEATHER:solar_storm",
                scenario_type=EvaluationScenarioType.NOVEL,
                world_state={"unseen_event": "Solar Flare Blackout", "capacity": 0.35, "historical_prior_coverage": 0.0},
                expected_risk="CRITICAL",
                difficulty="NOVEL",
                relationship_to_previous_cases="Completely novel condition. Correct behavior is UNKNOWN detection.",
                ground_truth_simulation={"expected_unknown": True, "recommended_strategy": "UNKNOWN"},
            )
        )

        # ── 11. Episode 11: Transfer Test #1 - Capacity 32% + Normal Demand ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-11",
                incident_signature="TRANSFER_EVAL:sup-002:cap=0.32",
                scenario_type=EvaluationScenarioType.TRANSFER,
                world_state={"supplier_id": "sup-002", "capacity": 0.32, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="HIGH",
                difficulty="NORMAL",
                relationship_to_previous_cases="Transfer from Ep 2 boundary. Rejects substitution -> selects Inventory draw.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 12. Episode 12: Repeated Pattern #3 - Repetition of Critical Capacity (28%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-12",
                incident_signature="CAPACITY_COLLAPSE:sup-002:cap=0.28",
                scenario_type=EvaluationScenarioType.DEGRADATION,
                world_state={"supplier_id": "sup-002", "capacity": 0.28, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="REPEAT of Episode 2 & 5. Verifies persistent mistake avoidance.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 13. Episode 13: Boundary Test #2 - Below Boundary (38%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-13",
                incident_signature="BOUNDARY_CHECK:sup-001:cap=0.38",
                scenario_type=EvaluationScenarioType.BOUNDARY,
                world_state={"supplier_id": "sup-001", "capacity": 0.38, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="HIGH",
                difficulty="NORMAL",
                relationship_to_previous_cases="Boundary violation at 38% (< 40%). Rejects substitution.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 14. Episode 14: Contradictory Evidence #1 - Labor Strike Strike Reports ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-14",
                incident_signature="CONTRADICTION:port_labor_strike",
                scenario_type=EvaluationScenarioType.CONTRADICTORY,
                world_state={"supplier_id": "sup-001", "capacity": 0.60, "conflicting_evidence": "Labor strike halts loading", "route_health": "DEGRADED"},
                expected_risk="HIGH",
                difficulty="HARD",
                relationship_to_previous_cases="External conflict contradicting standard supplier substitution.",
                ground_truth_simulation={"recommended_strategy": "Production Rescheduling & Alternate Dispatch", "expected_success": True},
            )
        )

        # ── 15. Episode 15: Related Scenario #2 - Capacity 34% + Normal Demand ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-15",
                incident_signature="RELATED_TRANSFER:sup-005:cap=0.34",
                scenario_type=EvaluationScenarioType.RELATED,
                world_state={"supplier_id": "sup-005", "capacity": 0.34, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="HIGH",
                difficulty="NORMAL",
                relationship_to_previous_cases="Capacity 34%. Related to prior 40% boundary breach. Recommends Inventory Draw.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 16. Episode 16: Dependency Failure #2 - Port Chokepoint Down ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-16",
                incident_signature="DEPENDENCY_OUTAGE:port-rotterdam",
                scenario_type=EvaluationScenarioType.DEPENDENCY_FAILURE,
                world_state={"failed_node": "port-rotterdam", "capacity": 0.45, "demand_surge_factor": 1.0, "route_health": "DOWN"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="Major seaport chokepoint blocked.",
                ground_truth_simulation={"recommended_strategy": "Production Rescheduling & Alternate Dispatch", "expected_success": True},
            )
        )

        # ── 17. Episode 17: Demand Shock #2 - 1.8x Acute Spike ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-17",
                incident_signature="DEMAND_SURGE:factor=1.8",
                scenario_type=EvaluationScenarioType.DEMAND_SURGE,
                world_state={"supplier_id": "sup-001", "capacity": 0.50, "demand_surge_factor": 1.8, "route_health": "NORMAL"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="Severe demand surge exceeding single-source replenishment.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 18. Episode 18: Repeated Pattern #4 - Similar Critical Capacity (29%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-18",
                incident_signature="CAPACITY_COLLAPSE:sup-002:cap=0.29",
                scenario_type=EvaluationScenarioType.DEGRADATION,
                world_state={"supplier_id": "sup-002", "capacity": 0.29, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="Near-repeat of Episode 2 (29% vs 28%). Memoryless fails; Hindsight avoids.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 19. Episode 19: Topology Change #2 - Rail Network Disruption ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-19",
                incident_signature="TOPOLOGY_REROUTE:rail-corridor-east",
                scenario_type=EvaluationScenarioType.TOPOLOGY_CHANGE,
                world_state={"supplier_id": "sup-001", "capacity": 0.55, "transit_delay_hours": 6.0, "route_health": "DEGRADED"},
                expected_risk="MEDIUM",
                difficulty="NORMAL",
                relationship_to_previous_cases="Transit route detour with added delay.",
                ground_truth_simulation={"recommended_strategy": "Supplier Substitution (Secondary Sourcing)", "expected_success": True},
            )
        )

        # ── 20. Episode 20: Transfer Test #2 - Capacity 31% + 1.2x Demand ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-20",
                incident_signature="TRANSFER_EVAL:sup-002:cap=0.31:dmd=1.2",
                scenario_type=EvaluationScenarioType.TRANSFER,
                world_state={"supplier_id": "sup-002", "capacity": 0.31, "demand_surge_factor": 1.2, "route_health": "NORMAL"},
                expected_risk="HIGH",
                difficulty="NORMAL",
                relationship_to_previous_cases="Related-but-not-identical transfer case. Partial transfer evaluation.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 21. Episode 21: Boundary Test #3 - Immediate Margin (41%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-21",
                incident_signature="BOUNDARY_CHECK:sup-001:cap=0.41",
                scenario_type=EvaluationScenarioType.BOUNDARY,
                world_state={"supplier_id": "sup-001", "capacity": 0.41, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="MEDIUM",
                difficulty="NORMAL",
                relationship_to_previous_cases="Marginally above boundary (41%). Substitution valid.",
                ground_truth_simulation={"recommended_strategy": "Supplier Substitution (Secondary Sourcing)", "expected_success": True},
            )
        )

        # ── 22. Episode 22: Stale Evidence #2 - 150-Day Old Supplier Profile ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-22",
                incident_signature="STALE_SUPPLIER_RECORD:age=150d",
                scenario_type=EvaluationScenarioType.STALE,
                world_state={"supplier_id": "sup-005", "capacity": 0.48, "evidence_age_days": 150, "route_health": "NORMAL"},
                expected_risk="MEDIUM",
                difficulty="NORMAL",
                relationship_to_previous_cases="Stale profile discount applied.",
                ground_truth_simulation={"recommended_strategy": "Supplier Substitution (Secondary Sourcing)", "expected_success": True},
            )
        )

        # ── 23. Episode 23: Dependency Failure #3 - Secondary Sourcing Partner Bankrupt ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-23",
                incident_signature="DEPENDENCY_OUTAGE:sup-backup-02",
                scenario_type=EvaluationScenarioType.DEPENDENCY_FAILURE,
                world_state={"failed_node": "sup-backup-02", "capacity": 0.20, "demand_surge_factor": 1.0, "route_health": "DOWN"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="Secondary supplier unviable.",
                ground_truth_simulation={"recommended_strategy": "Production Rescheduling & Alternate Dispatch", "expected_success": True},
            )
        )

        # ── 24. Episode 24: Repeated Pattern #5 - Repetition of Critical Capacity (28%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-24",
                incident_signature="CAPACITY_COLLAPSE:sup-002:cap=0.28",
                scenario_type=EvaluationScenarioType.DEGRADATION,
                world_state={"supplier_id": "sup-002", "capacity": 0.28, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="5th repeat of 28% capacity failure scenario.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 25. Episode 25: Demand Shock #3 - 1.6x Surge + Tight Stock ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-25",
                incident_signature="DEMAND_SURGE:factor=1.6:stock_low",
                scenario_type=EvaluationScenarioType.DEMAND_SURGE,
                world_state={"supplier_id": "sup-001", "capacity": 0.52, "demand_surge_factor": 1.6, "stock_level_pct": 0.30},
                expected_risk="HIGH",
                difficulty="HARD",
                relationship_to_previous_cases="Demand surge with reduced initial buffer.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 26. Episode 26: Boundary Test #4 - Boundary Breach (37%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-26",
                incident_signature="BOUNDARY_CHECK:sup-001:cap=0.37",
                scenario_type=EvaluationScenarioType.BOUNDARY,
                world_state={"supplier_id": "sup-001", "capacity": 0.37, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="HIGH",
                difficulty="NORMAL",
                relationship_to_previous_cases="Clear breach of 40% threshold. Substitution invalid.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 27. Episode 27: Topology Change #3 - Multi-Modal Air Freight Switch ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-27",
                incident_signature="TOPOLOGY_REROUTE:air_bridge",
                scenario_type=EvaluationScenarioType.TOPOLOGY_CHANGE,
                world_state={"supplier_id": "sup-001", "capacity": 0.65, "transit_delay_hours": 1.0, "route_health": "NORMAL"},
                expected_risk="LOW",
                difficulty="EASY",
                relationship_to_previous_cases="Air bridge topology with low transit delay.",
                ground_truth_simulation={"recommended_strategy": "Supplier Substitution (Secondary Sourcing)", "expected_success": True},
            )
        )

        # ── 28. Episode 28: Novel Condition #2 - Cyber Threat Locks Port Terminal ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-28",
                incident_signature="NOVEL_CYBER_RANSOMWARE:terminal_lock",
                scenario_type=EvaluationScenarioType.NOVEL,
                world_state={"unseen_event": "SCADA Ransomware Lockout", "historical_prior_coverage": 0.0, "capacity": 0.15},
                expected_risk="CRITICAL",
                difficulty="NOVEL",
                relationship_to_previous_cases="Zero historical prior. Correct system behavior is UNKNOWN detection.",
                ground_truth_simulation={"expected_unknown": True, "recommended_strategy": "UNKNOWN"},
            )
        )

        # ── 29. Episode 29: Repeated Pattern #6 - Final Repetition (28%) ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-29",
                incident_signature="CAPACITY_COLLAPSE:sup-002:cap=0.28",
                scenario_type=EvaluationScenarioType.DEGRADATION,
                world_state={"supplier_id": "sup-002", "capacity": 0.28, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="CRITICAL",
                difficulty="HARD",
                relationship_to_previous_cases="Final repetition of critical supplier capacity scenario.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        # ── 30. Episode 30: Transfer Test #3 - Capacity 33% + Normal Demand ──
        scenarios.append(
            EvaluationScenario(
                scenario_id="eval-sc-30",
                incident_signature="TRANSFER_EVAL:sup-006:cap=0.33",
                scenario_type=EvaluationScenarioType.TRANSFER,
                world_state={"supplier_id": "sup-006", "capacity": 0.33, "demand_surge_factor": 1.0, "route_health": "NORMAL"},
                expected_risk="HIGH",
                difficulty="NORMAL",
                relationship_to_previous_cases="Final transfer assessment. Successfully transfers avoidance rule.",
                ground_truth_simulation={"recommended_strategy": "Emergency Inventory Draw (Warehouse C Reserves)", "expected_success": True},
            )
        )

        return scenarios
