"""
Benchmark Scenario Registry for FULFILL-X Phase 12.
Provides 8 deterministic benchmark scenarios with fixed ground-truth expectations.
"""

from typing import Dict, List, Optional
from app.schemas.evaluation import BenchmarkScenario, GroundTruth


def _get_scenario_01() -> BenchmarkScenario:
    """Scenario 01: Supplier Disruption"""
    return BenchmarkScenario(
        scenario_id="SCENARIO-01",
        name="Supplier Disruption Benchmark",
        description="Tier-1 APAC supplier failure causing downstream inventory pressure and requiring supplier mitigation.",
        seed=42,
        initial_conditions={"disruption_type": "SUPPLIER_OUTAGE", "target_node_id": "sup-001"},
        signals=[
            {
                "signal_id": "sig-001",
                "source": "SUPPLIER_STATUS_FEED",
                "severity": 0.85,
                "confidence": 0.92,
                "target_node_id": "sup-001",
                "message": "Major facility breakdown at Apex Electronics (sup-001).",
            }
        ],
        disruption={
            "node_id": "sup-001",
            "type": "SUPPLIER_OUTAGE",
            "severity": 0.85,
            "duration_days": 14,
        },
        ground_truth=GroundTruth(
            scenario_id="SCENARIO-01",
            expected_affected_nodes=["sup-001", "port-001", "wh-001"],
            expected_risk_nodes=["sup-001", "wh-001"],
            expected_risk_dimensions={"operational": 0.85, "sla": 0.65, "financial": 0.40},
            expected_disruption_type="SUPPLIER_OUTAGE",
            expected_vulnerabilities=["SINGLE_SOURCE_DEPENDENCY", "CAPACITY_BOTTLENECK"],
            expected_feasible_actions=["SUPPLIER_REALLOCATION", "INVENTORY_REALLOCATION"],
            expected_infeasible_actions=["UNVALIDATED_REROUTE"],
            expected_constraint_violations=[],
            expected_verification_result="VERIFIED",
            expected_agreements=["REALLOCATE_TO_BACKUP_SUPPLIER"],
            expected_conflicts=["EXPEDITED_AIR_FREIGHT_VS_COST"],
        ),
        expected_constraints=["SUPPLIER_CAPACITY", "LEAD_TIME_LIMIT"],
    )


def _get_scenario_02() -> BenchmarkScenario:
    """Scenario 02: Port Closure"""
    return BenchmarkScenario(
        scenario_id="SCENARIO-02",
        name="Port Closure Benchmark",
        description="Major port closure at Shanghai forcing ocean freight rerouting and mode shifts.",
        seed=101,
        initial_conditions={"disruption_type": "PORT_CLOSURE", "target_node_id": "port-002"},
        signals=[
            {
                "signal_id": "sig-002",
                "source": "MARITIME_INTELLIGENCE",
                "severity": 0.90,
                "confidence": 0.95,
                "target_node_id": "port-002",
                "message": "Port of Shanghai (port-002) closed due to severe weather & strike.",
            }
        ],
        disruption={
            "node_id": "port-002",
            "type": "PORT_CLOSURE",
            "severity": 0.90,
            "duration_days": 10,
        },
        ground_truth=GroundTruth(
            scenario_id="SCENARIO-02",
            expected_affected_nodes=["port-002", "wh-001", "wh-002"],
            expected_risk_nodes=["port-002", "wh-001"],
            expected_risk_dimensions={"sla": 0.88, "operational": 0.90, "financial": 0.55},
            expected_disruption_type="PORT_CLOSURE",
            expected_vulnerabilities=["PORT_CONGESTION", "ROUTE_BOTTLENECK"],
            expected_feasible_actions=["REROUTE_SHIPMENT", "MODE_SWITCH"],
            expected_infeasible_actions=["CONTINUE_ORIGINAL_ROUTE"],
            expected_constraint_violations=[],
            expected_verification_result="VERIFIED",
            expected_agreements=["REROUTE_VIA_PORT_OSAKA"],
            expected_conflicts=["AIR_FREIGHT_COST_SPIKE"],
        ),
        expected_constraints=["PORT_CAPACITY", "MAX_LEAD_TIME"],
    )


def _get_scenario_03() -> BenchmarkScenario:
    """Scenario 03: Demand Spike"""
    return BenchmarkScenario(
        scenario_id="SCENARIO-03",
        name="Demand Spike Benchmark",
        description="Unpredicted 200% surge in order volume in Customer Zone 1 putting extreme pressure on FC-001.",
        seed=202,
        initial_conditions={"disruption_type": "DEMAND_SPIKE", "target_node_id": "cz-001"},
        signals=[
            {
                "signal_id": "sig-003",
                "source": "DEMAND_FORECAST_FEED",
                "severity": 0.75,
                "confidence": 0.88,
                "target_node_id": "cz-001",
                "message": "Demand surge detected in Customer Zone US East (cz-001).",
            }
        ],
        disruption={
            "node_id": "cz-001",
            "type": "DEMAND_SPIKE",
            "severity": 0.75,
            "demand_multiplier": 2.5,
        },
        ground_truth=GroundTruth(
            scenario_id="SCENARIO-03",
            expected_affected_nodes=["cz-001", "fc-001", "wh-003"],
            expected_risk_nodes=["fc-001", "cz-001"],
            expected_risk_dimensions={"inventory": 0.80, "sla": 0.75, "financial": 0.30},
            expected_disruption_type="DEMAND_SPIKE",
            expected_vulnerabilities=["STOCKOUT_RISK", "FC_CAPACITY_OVERLOAD"],
            expected_feasible_actions=["INVENTORY_REALLOCATION", "EXPEDITED_FULFILLMENT"],
            expected_infeasible_actions=["CANCEL_CUSTOMER_ORDERS"],
            expected_constraint_violations=[],
            expected_verification_result="VERIFIED",
            expected_agreements=["REALLOCATE_FROM_WH_003_TO_FC_001"],
            expected_conflicts=["FULFILLMENT_COST_OVERRUN"],
        ),
        expected_constraints=["FC_THROUGHPUT_LIMIT", "SAFETY_STOCK_MIN"],
    )


def _get_scenario_04() -> BenchmarkScenario:
    """Scenario 04: Transportation Delay"""
    return BenchmarkScenario(
        scenario_id="SCENARIO-04",
        name="Transportation Delay Benchmark",
        description="7-day transit bottleneck on key ocean lane between APAC and EU.",
        seed=303,
        initial_conditions={"disruption_type": "TRANSPORTATION_DELAY", "target_node_id": "sup-002"},
        signals=[
            {
                "signal_id": "sig-004",
                "source": "CARRIER_TELEMETRY",
                "severity": 0.70,
                "confidence": 0.90,
                "target_node_id": "sup-002",
                "message": "Vessel transit delay of +7 days reported for carrier fleet.",
            }
        ],
        disruption={
            "node_id": "sup-002",
            "type": "TRANSPORTATION_DELAY",
            "severity": 0.70,
            "delay_days": 7,
        },
        ground_truth=GroundTruth(
            scenario_id="SCENARIO-04",
            expected_affected_nodes=["sup-002", "port-001", "wh-001"],
            expected_risk_nodes=["sup-002", "wh-001"],
            expected_risk_dimensions={"sla": 0.70, "operational": 0.60},
            expected_disruption_type="TRANSPORTATION_DELAY",
            expected_vulnerabilities=["CARRIER_DEPENDENCY", "TRANSIT_VARIABILITY"],
            expected_feasible_actions=["MODE_SWITCH", "REROUTE_SHIPMENT"],
            expected_infeasible_actions=["DO_NOTHING"],
            expected_constraint_violations=[],
            expected_verification_result="VERIFIED",
            expected_agreements=["SWITCH_OCEAN_TO_AIR_FREIGHT"],
            expected_conflicts=["SUSTAINABILITY_EMISSIONS_VS_SPEED"],
        ),
        expected_constraints=["EMISSIONS_CAP", "SLA_LEAD_TIME"],
    )


def _get_scenario_05() -> BenchmarkScenario:
    """Scenario 05: Warehouse Capacity Reduction"""
    return BenchmarkScenario(
        scenario_id="SCENARIO-05",
        name="Warehouse Capacity Reduction Benchmark",
        description="50% capacity reduction at APAC Regional Hub (wh-001) due to structural maintenance.",
        seed=404,
        initial_conditions={"disruption_type": "CAPACITY_REDUCTION", "target_node_id": "wh-001"},
        signals=[
            {
                "signal_id": "sig-005",
                "source": "WMS_ALERT",
                "severity": 0.80,
                "confidence": 0.95,
                "target_node_id": "wh-001",
                "message": "Wh-001 storage capacity degraded by 50%.",
            }
        ],
        disruption={
            "node_id": "wh-001",
            "type": "CAPACITY_REDUCTION",
            "severity": 0.80,
            "capacity_factor": 0.5,
        },
        ground_truth=GroundTruth(
            scenario_id="SCENARIO-05",
            expected_affected_nodes=["wh-001", "fc-001", "fc-002"],
            expected_risk_nodes=["wh-001", "fc-001"],
            expected_risk_dimensions={"operational": 0.80, "inventory": 0.75},
            expected_disruption_type="CAPACITY_REDUCTION",
            expected_vulnerabilities=["WAREHOUSE_BOTTLENECK"],
            expected_feasible_actions=["OFFLOAD_TO_FC_002", "INVENTORY_REALLOCATION"],
            expected_infeasible_actions=["OVERLOAD_WH_001"],
            expected_constraint_violations=[],
            expected_verification_result="VERIFIED",
            expected_agreements=["REDIRECT_INBOUND_TO_WH_003"],
            expected_conflicts=["EXTRA_HANDLING_COST"],
        ),
        expected_constraints=["MAX_WAREHOUSE_UTILIZATION"],
    )


def _get_scenario_06() -> BenchmarkScenario:
    """Scenario 06: Compound Disruption"""
    return BenchmarkScenario(
        scenario_id="SCENARIO-06",
        name="Compound Disruption Benchmark",
        description="Simultaneous supplier outage (sup-001) and port closure (port-002) compounding supply risk.",
        seed=505,
        initial_conditions={"disruption_type": "COMPOUND_DISRUPTION", "target_node_ids": ["sup-001", "port-002"]},
        signals=[
            {
                "signal_id": "sig-006a",
                "source": "SUPPLIER_FEED",
                "severity": 0.85,
                "confidence": 0.90,
                "target_node_id": "sup-001",
                "message": "Apex Electronics shutdown.",
            },
            {
                "signal_id": "sig-006b",
                "source": "MARITIME_FEED",
                "severity": 0.90,
                "confidence": 0.95,
                "target_node_id": "port-002",
                "message": "Port of Shanghai closure.",
            },
        ],
        disruption={
            "node_ids": ["sup-001", "port-002"],
            "type": "COMPOUND_DISRUPTION",
            "severity": 0.92,
        },
        ground_truth=GroundTruth(
            scenario_id="SCENARIO-06",
            expected_affected_nodes=["sup-001", "port-002", "wh-001", "fc-001"],
            expected_risk_nodes=["sup-001", "port-002", "wh-001"],
            expected_risk_dimensions={"operational": 0.92, "sla": 0.85, "financial": 0.70},
            expected_disruption_type="COMPOUND_DISRUPTION",
            expected_vulnerabilities=["SINGLE_SOURCE_DEPENDENCY", "PORT_CONGESTION", "CASCADE_RISK"],
            expected_feasible_actions=["SUPPLIER_REALLOCATION", "MODE_SWITCH", "REROUTE_SHIPMENT"],
            expected_infeasible_actions=["SINGLE_CHANNEL_MITIGATION"],
            expected_constraint_violations=[],
            expected_verification_result="VERIFIED",
            expected_agreements=["ACTIVATE_BACKUP_SUPPLIER_AND_AIR_FREIGHT"],
            expected_conflicts=["HIGH_COST_VS_SLA_PRESERVATION"],
        ),
        expected_constraints=["SUPPLIER_CAPACITY", "PORT_CAPACITY", "EMISSIONS_CAP"],
    )


def _get_scenario_07() -> BenchmarkScenario:
    """Scenario 07: Multi-Node Failure"""
    return BenchmarkScenario(
        scenario_id="SCENARIO-07",
        name="Multi-Node Failure Benchmark",
        description="Multiple independent regional node failures across APAC and EU.",
        seed=606,
        initial_conditions={"disruption_type": "MULTI_NODE_FAILURE", "target_node_ids": ["sup-002", "port-001", "wh-002"]},
        signals=[
            {
                "signal_id": "sig-007a",
                "source": "SUPPLIER_FEED",
                "severity": 0.80,
                "confidence": 0.90,
                "target_node_id": "sup-002",
                "message": "Global Components outage.",
            },
            {
                "signal_id": "sig-007b",
                "source": "PORT_ALERT",
                "severity": 0.75,
                "confidence": 0.92,
                "target_node_id": "port-001",
                "message": "Port of Osaka delay.",
            },
            {
                "signal_id": "sig-007c",
                "source": "WMS_ALERT",
                "severity": 0.85,
                "confidence": 0.95,
                "target_node_id": "wh-002",
                "message": "EU DC fire alert.",
            },
        ],
        disruption={
            "node_ids": ["sup-002", "port-001", "wh-002"],
            "type": "MULTI_NODE_FAILURE",
            "severity": 0.88,
        },
        ground_truth=GroundTruth(
            scenario_id="SCENARIO-07",
            expected_affected_nodes=["sup-002", "port-001", "wh-002", "wh-001", "fc-003"],
            expected_risk_nodes=["sup-002", "port-001", "wh-002"],
            expected_risk_dimensions={"operational": 0.88, "sla": 0.82, "financial": 0.65},
            expected_disruption_type="MULTI_NODE_FAILURE",
            expected_vulnerabilities=["MULTI_REGION_FAILURE", "NETWORK_PARTITION"],
            expected_feasible_actions=["MULTI_ORIGIN_REROUTE", "BACKUP_SUPPLIER_ACTIVATION"],
            expected_infeasible_actions=["LOCALIZED_FIX_ONLY"],
            expected_constraint_violations=[],
            expected_verification_result="VERIFIED",
            expected_agreements=["GLOBAL_INVENTORY_REBALANCING"],
            expected_conflicts=["CROSS_REGION_TRANSPORT_COST"],
        ),
        expected_constraints=["GLOBAL_SAFETY_STOCK", "CROSS_DOCK_CAPACITY"],
    )


def _get_scenario_08() -> BenchmarkScenario:
    """Scenario 08: Adversarial Stress"""
    return BenchmarkScenario(
        scenario_id="SCENARIO-08",
        name="Adversarial Stress Benchmark",
        description="Comprehensive red-team attack suite evaluating system resilience against adversarial shocks.",
        seed=707,
        initial_conditions={"disruption_type": "ADVERSARIAL_ATTACK", "attack_type": "COMPOUND_CASCADE"},
        signals=[
            {
                "signal_id": "sig-008",
                "source": "ADVERSARY_RED_TEAM",
                "severity": 0.95,
                "confidence": 0.98,
                "target_node_id": "sup-001",
                "message": "Adversarial stress injection targeting core supply bottleneck.",
            }
        ],
        disruption={
            "attack_type": "COMPOUND_CASCADE",
            "severity": 0.95,
            "target_node_id": "sup-001",
        },
        ground_truth=GroundTruth(
            scenario_id="SCENARIO-08",
            expected_affected_nodes=["sup-001", "port-001", "wh-001", "fc-001"],
            expected_risk_nodes=["sup-001", "port-001", "wh-001"],
            expected_risk_dimensions={"operational": 0.95, "sla": 0.90, "financial": 0.80, "resilience": 0.95},
            expected_disruption_type="ADVERSARIAL_ATTACK",
            expected_vulnerabilities=["SINGLE_POINT_OF_FAILURE", "ASSUMPTION_FRAGILITY", "CASCADE_VULNERABILITY"],
            expected_feasible_actions=["HARDENED_RESILIENCE_PLAN", "MULTI_TIER_FAILOVER"],
            expected_infeasible_actions=["NAIVE_SINGLE_REROUTE"],
            expected_constraint_violations=[],
            expected_verification_result="VERIFIED",
            expected_agreements=["MULTI_LAYERED_DEFENSE_PLAN"],
            expected_conflicts=["MAXIMUM_REDUNDANCY_COST"],
        ),
        expected_constraints=["MAX_COST_BUDGET", "RESILIENCE_SCORE_MIN"],
    )


class ScenarioRegistry:
    """Registry containing all deterministic benchmark scenarios."""

    def __init__(self):
        self._scenarios: Dict[str, BenchmarkScenario] = {
            "SCENARIO-01": _get_scenario_01(),
            "SCENARIO-02": _get_scenario_02(),
            "SCENARIO-03": _get_scenario_03(),
            "SCENARIO-04": _get_scenario_04(),
            "SCENARIO-05": _get_scenario_05(),
            "SCENARIO-06": _get_scenario_06(),
            "SCENARIO-07": _get_scenario_07(),
            "SCENARIO-08": _get_scenario_08(),
        }

    def get_scenario(self, scenario_id: str) -> Optional[BenchmarkScenario]:
        return self._scenarios.get(scenario_id)

    def list_scenarios(self) -> List[BenchmarkScenario]:
        return list(self._scenarios.values())
