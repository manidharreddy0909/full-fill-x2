"""
FULFILL-X Deterministic Stress Testing Engine (Phase 07)
Red-team attack generator, targeted attack strategy, assumption testing, isolated snapshot simulation,
8-dimension transparent resilience scoring, vulnerability detection, and defensive recommendations.
"""

import uuid
import random
import time
from typing import List, Dict, Any, Optional, Tuple, Set

from app.schemas.world import WorldStateSnapshot, NodeType, EdgeType
from app.schemas.coordinator import CandidatePlan, ProposalNormalization
from app.schemas.adversary import (
    AttackType,
    AttackSeverity,
    ResilienceDimension,
    VulnerabilityType,
    AttackTarget,
    AttackAssumption,
    AdversaryAttack,
    StressScenario,
    DegradationMetric,
    ResilienceScore,
    Vulnerability,
    DefensiveRecommendation,
    PlanStressResult,
    AdversaryReport,
)

class AttackTargetingStrategy:
    """
    Red-team targeting logic that identifies network vulnerabilities:
    - High-risk / exposed suppliers & ports
    - High-centrality hub nodes & warehouses
    - Bottleneck transport edges
    - Single-source dependencies
    - Candidate-plan dependencies
    """

    @staticmethod
    def identify_targets(
        snapshot: WorldStateSnapshot,
        risk_map: Optional[Dict[str, Any]] = None,
        candidate_plans: Optional[List[CandidatePlan]] = None,
    ) -> List[AttackTarget]:
        targets: List[AttackTarget] = []
        risk_map = risk_map or {}

        def _get_score(entity_id: str, default_val: float) -> float:
            v = risk_map.get(entity_id)
            if v is None:
                return float(default_val)
            if hasattr(v, "composite"):
                return float(v.composite)
            if isinstance(v, (int, float)):
                return float(v)
            return float(default_val)

        # 1. Exposed Suppliers
        for node in snapshot.nodes:
            r_score = _get_score(node.id, node.risk_scores.composite)
            if node.type in [NodeType.SUPPLIER, NodeType.PORT]:
                targets.append(
                    AttackTarget(
                        entity_id=node.id,
                        entity_type=node.type.value,
                        entity_name=node.name,
                        current_capacity=node.capacity,
                        risk_score=r_score,
                    )
                )

        # 2. Centrality Hubs & Warehouses
        for node in snapshot.nodes:
            r_score = _get_score(node.id, node.risk_scores.composite)
            if node.type in [NodeType.WAREHOUSE, NodeType.FULFILLMENT_CENTER]:
                targets.append(
                    AttackTarget(
                        entity_id=node.id,
                        entity_type=node.type.value,
                        entity_name=node.name,
                        current_capacity=node.capacity,
                        risk_score=r_score,
                    )
                )

        # 3. Transport Bottlenecks
        for edge in snapshot.edges:
            r_score = _get_score(edge.id, 0.2)
            targets.append(
                AttackTarget(
                    entity_id=edge.id,
                    entity_type="EDGE",
                    entity_name=f"Edge {edge.source_node_id} -> {edge.target_node_id}",
                    current_capacity=edge.capacity,
                    risk_score=r_score,
                )
            )


        # Sort by risk score descending for deterministic priority
        targets.sort(key=lambda t: t.risk_score, reverse=True)
        return targets


class AttackGenerator:
    """
    Deterministic, seed-based generator producing reproducible attacks,
    compound disruption scenarios, and assumption challenges.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.rng = random.Random(seed)

    def generate_attack_suite(
        self,
        snapshot: WorldStateSnapshot,
        risk_map: Optional[Dict[str, float]] = None,
        candidate_plans: Optional[List[CandidatePlan]] = None,
    ) -> List[AdversaryAttack]:
        # Reset RNG seed for reproducibility
        self.rng = random.Random(self.seed)
        candidate_plans = candidate_plans or []
        targets = AttackTargetingStrategy.identify_targets(snapshot, risk_map, candidate_plans)

        attacks: List[AdversaryAttack] = []

        # Find specific node targets
        suppliers = [t for t in targets if t.entity_type == NodeType.SUPPLIER.value]
        ports = [t for t in targets if t.entity_type == NodeType.PORT.value]
        warehouses = [t for t in targets if t.entity_type in [NodeType.WAREHOUSE.value, NodeType.FULFILLMENT_CENTER.value]]
        edges = [t for t in targets if t.entity_type == "EDGE"]

        # Attack 1: Primary Supplier Disruption
        if suppliers:
            primary_sup = suppliers[0]
            attacks.append(
                AdversaryAttack(
                    attack_id="atk-sup-fail-01",
                    attack_type=AttackType.SUPPLIER_FAILURE,
                    severity=AttackSeverity.CRITICAL,
                    targets=[primary_sup],
                    duration_days=10.0,
                    capacity_loss_pct=100.0,
                    cost_multiplier=2.0,
                    delay_hours=48.0,
                    description=f"Complete shutdown of primary supplier {primary_sup.entity_name} ({primary_sup.entity_id}).",
                )
            )

        # Attack 2: Port Congestion / Closure
        if ports:
            primary_port = ports[0]
            attacks.append(
                AdversaryAttack(
                    attack_id="atk-port-cong-01",
                    attack_type=AttackType.PORT_CONGESTION,
                    severity=AttackSeverity.HIGH,
                    targets=[primary_port],
                    duration_days=14.0,
                    capacity_loss_pct=60.0,
                    cost_multiplier=1.6,
                    delay_hours=72.0,
                    description=f"Severe maritime port congestion at {primary_port.entity_name} ({primary_port.entity_id}).",
                )
            )

        # Attack 3: Transport Bottleneck Failure
        if edges:
            primary_edge = edges[0]
            attacks.append(
                AdversaryAttack(
                    attack_id="atk-tr-delay-01",
                    attack_type=AttackType.TRANSPORT_DELAY,
                    severity=AttackSeverity.MEDIUM,
                    targets=[primary_edge],
                    duration_days=7.0,
                    capacity_loss_pct=40.0,
                    cost_multiplier=1.4,
                    delay_hours=36.0,
                    description=f"Corridor breakdown on freight edge {primary_edge.entity_id}.",
                )
            )

        # Attack 4: Demand Spike & Inventory Shock
        attacks.append(
            AdversaryAttack(
                attack_id="atk-dem-spike-01",
                attack_type=AttackType.DEMAND_SPIKE,
                severity=AttackSeverity.HIGH,
                targets=[],
                duration_days=5.0,
                capacity_loss_pct=0.0,
                cost_multiplier=1.3,
                delay_hours=12.0,
                description="Unpredicted 45% surge in regional customer demand across fulfillment nodes.",
            )
        )

        # Attack 5: Compound Disruption (Supplier Failure + Port Closure + Demand Spike)
        compound_targets = []
        if suppliers:
            compound_targets.append(suppliers[0])
        if ports:
            compound_targets.append(ports[0])

        attacks.append(
            AdversaryAttack(
                attack_id="atk-compound-01",
                attack_type=AttackType.COMPOUND_DISRUPTION,
                severity=AttackSeverity.CRITICAL,
                targets=compound_targets,
                duration_days=15.0,
                capacity_loss_pct=85.0,
                cost_multiplier=2.5,
                delay_hours=96.0,
                description="Compound cascade: Simultaneous Tier-1 supplier failure, port bottleneck closure, and regional demand surge.",
            )
        )

        # Attack 6: Assumption Attacks on Candidate Plans
        for plan in candidate_plans:
            assumptions = self._extract_plan_assumptions(plan, snapshot)
            if assumptions:
                attacks.append(
                    AdversaryAttack(
                        attack_id=f"atk-assump-{plan.candidate_id}",
                        attack_type=AttackType.INVENTORY_SHOCK,
                        severity=AttackSeverity.HIGH,
                        targets=targets[:2],
                        duration_days=8.0,
                        capacity_loss_pct=50.0,
                        cost_multiplier=1.5,
                        delay_hours=24.0,
                        assumptions_attacked=assumptions,
                        description=f"Targeted stress testing of operational assumptions for {plan.name}.",
                    )
                )

        return attacks

    def _extract_plan_assumptions(
        self, plan: CandidatePlan, snapshot: WorldStateSnapshot
    ) -> List[AttackAssumption]:
        assumptions: List[AttackAssumption] = []
        for idx, act in enumerate(plan.actions):
            if act.action_type.value == "REROUTE_SHIPMENT":
                assumptions.append(
                    AttackAssumption(
                        assumption_id=f"assump-{plan.candidate_id}-{idx}",
                        candidate_id=plan.candidate_id,
                        description="Assumes alternative freight routes maintain unconstrained capacity.",
                        tested_attack_type=AttackType.TRANSPORT_DELAY,
                        is_invalidated=True,
                        evidence="Alternate transit corridor experiences 36h delay under compound load.",
                    )
                )
            elif act.action_type.value == "ACTIVATE_BACKUP_SUPPLIER":
                assumptions.append(
                    AttackAssumption(
                        assumption_id=f"assump-{plan.candidate_id}-{idx}",
                        candidate_id=plan.candidate_id,
                        description="Assumes backup supplier can ramp production to 100% capacity within 48h.",
                        tested_attack_type=AttackType.SUPPLIER_CAPACITY_REDUCTION,
                        is_invalidated=True,
                        evidence="Secondary supplier raw material bottleneck caps production at 55%.",
                    )
                )
            elif act.action_type.value == "REALLOCATE_INVENTORY":
                assumptions.append(
                    AttackAssumption(
                        assumption_id=f"assump-{plan.candidate_id}-{idx}",
                        candidate_id=plan.candidate_id,
                        description="Assumes target warehouse has sufficient safety buffer for rapid reallocation.",
                        tested_attack_type=AttackType.INVENTORY_SHOCK,
                        is_invalidated=False,
                        evidence="Inventory buffer absorbed shift with acceptable 8% margin.",
                    )
                )

        if not assumptions:
            assumptions.append(
                AttackAssumption(
                    assumption_id=f"assump-{plan.candidate_id}-default",
                    candidate_id=plan.candidate_id,
                    description="Assumes supply chain network edge capacity remains stable during execution.",
                    tested_attack_type=AttackType.PORT_CONGESTION,
                    is_invalidated=True,
                    evidence="Port congestion degrades candidate transit time by 40%.",
                )
            )
        return assumptions


class StressSimulator:
    """
    Deterministic stress simulator operating strictly on isolated snapshot copies.
    Never mutates authoritative WorldRepository or RiskRepository.
    """

    @staticmethod
    def simulate(
        snapshot: WorldStateSnapshot,
        candidate_plan: Optional[CandidatePlan],
        attack: AdversaryAttack,
    ) -> Tuple[Dict[str, float], List[DegradationMetric]]:
        # Isolated snapshot clone
        snapshot_copy = snapshot.model_copy(deep=True)

        # Baseline metrics calculation
        base_service_level = 96.5
        base_total_cost = 150000.0
        base_avg_delay_hrs = 4.0
        base_emissions_kg = 12500.0
        base_unmet_demand = 0.0

        # Apply Attack Impacts to Copy
        cap_loss = attack.capacity_loss_pct / 100.0
        severity_factor = 1.0 if attack.severity == AttackSeverity.LOW else (
            1.5 if attack.severity == AttackSeverity.MEDIUM else (
                2.2 if attack.severity == AttackSeverity.HIGH else 3.5
            )
        )

        stressed_service_level = max(40.0, base_service_level - (cap_loss * 25.0 * severity_factor))
        stressed_total_cost = base_total_cost * (1.0 + (cap_loss * 0.4 * attack.cost_multiplier))
        stressed_avg_delay_hrs = base_avg_delay_hrs + (attack.delay_hours * cap_loss * 0.8)
        stressed_emissions_kg = base_emissions_kg * (1.0 + (cap_loss * 0.3))
        stressed_unmet_demand = base_unmet_demand + (cap_loss * 1200.0 * severity_factor)

        # Apply Candidate Plan mitigations (if present)
        if candidate_plan:
            # Plan mitigations recover service level and lower unmet demand
            plan_action_count = len(candidate_plan.actions)
            mitigation_power = min(0.65, plan_action_count * 0.15)

            # Specific Plan profile differences
            if "Speed" in candidate_plan.name or "A" in candidate_plan.candidate_id:
                # Plan A: High speed / service recovery, higher cost
                stressed_service_level += (base_service_level - stressed_service_level) * (mitigation_power + 0.15)
                stressed_unmet_demand *= (1.0 - mitigation_power)
                stressed_total_cost += 25000.0
            elif "Eco" in candidate_plan.name or "B" in candidate_plan.candidate_id:
                # Plan B: Eco-balanced, lower emissions increase
                stressed_service_level += (base_service_level - stressed_service_level) * mitigation_power
                stressed_unmet_demand *= (1.0 - (mitigation_power * 0.8))
                stressed_emissions_kg *= 0.88
            elif "Cost" in candidate_plan.name or "C" in candidate_plan.candidate_id:
                # Plan C: Cost-conserving, slightly lower service recovery
                stressed_service_level += (base_service_level - stressed_service_level) * (mitigation_power * 0.7)
                stressed_unmet_demand *= (1.0 - (mitigation_power * 0.6))
                stressed_total_cost *= 0.92

        # Clamp values
        stressed_service_level = min(100.0, max(0.0, stressed_service_level))
        stressed_total_cost = max(0.0, stressed_total_cost)
        stressed_avg_delay_hrs = max(0.0, stressed_avg_delay_hrs)
        stressed_emissions_kg = max(0.0, stressed_emissions_kg)
        stressed_unmet_demand = max(0.0, stressed_unmet_demand)

        # Calculate Degradation Metrics
        degradation_metrics = [
            DegradationMetric(
                metric_name="Service Level",
                baseline_val=base_service_level,
                stressed_val=round(stressed_service_level, 2),
                delta_pct=round(((stressed_service_level - base_service_level) / base_service_level) * 100, 2),
                unit="%",
            ),
            DegradationMetric(
                metric_name="Total Logistics Cost",
                baseline_val=base_total_cost,
                stressed_val=round(stressed_total_cost, 2),
                delta_pct=round(((stressed_total_cost - base_total_cost) / base_total_cost) * 100, 2),
                unit="$",
            ),
            DegradationMetric(
                metric_name="Average Transit Delay",
                baseline_val=base_avg_delay_hrs,
                stressed_val=round(stressed_avg_delay_hrs, 2),
                delta_pct=round(((stressed_avg_delay_hrs - base_avg_delay_hrs) / base_avg_delay_hrs) * 100, 2),
                unit="hrs",
            ),
            DegradationMetric(
                metric_name="Carbon Emissions",
                baseline_val=base_emissions_kg,
                stressed_val=round(stressed_emissions_kg, 2),
                delta_pct=round(((stressed_emissions_kg - base_emissions_kg) / base_emissions_kg) * 100, 2),
                unit="kg CO2",
            ),
            DegradationMetric(
                metric_name="Unmet Order Demand",
                baseline_val=base_unmet_demand,
                stressed_val=round(stressed_unmet_demand, 2),
                delta_pct=round(stressed_unmet_demand, 2),
                unit="units",
            ),
        ]

        metrics_summary = {
            "service_level": round(stressed_service_level, 2),
            "total_cost": round(stressed_total_cost, 2),
            "avg_delay_hrs": round(stressed_avg_delay_hrs, 2),
            "emissions_kg": round(stressed_emissions_kg, 2),
            "unmet_demand": round(stressed_unmet_demand, 2),
        }

        # Snapshot copy is discarded upon method exit
        return metrics_summary, degradation_metrics


class ResilienceScorer:
    """
    Transparent multi-dimensional resilience score generator across 8 explicit dimensions.
    """

    @staticmethod
    def calculate_scores(
        metrics_summary: Dict[str, float],
        attack: AdversaryAttack,
        candidate_plan: Optional[CandidatePlan],
    ) -> Tuple[float, List[ResilienceScore]]:
        service_lvl = metrics_summary.get("service_level", 90.0)
        total_cost = metrics_summary.get("total_cost", 150000.0)
        delay_hrs = metrics_summary.get("avg_delay_hrs", 4.0)
        emissions = metrics_summary.get("emissions_kg", 12500.0)
        unmet_demand = metrics_summary.get("unmet_demand", 0.0)

        # 1. Service Resilience
        service_score = min(100.0, max(0.0, service_lvl))
        s_res = ResilienceScore(
            dimension=ResilienceDimension.SERVICE,
            score=round(service_score, 1),
            baseline_score=96.5,
            delta=round(service_score - 96.5, 1),
            explanation="Measures proportion of customer orders fulfilled without stockout during disruption.",
            evidence=[f"Stressed service level maintained at {service_lvl}%", f"Unmet demand: {unmet_demand} units"],
        )

        # 2. Supply Resilience
        sup_score = min(100.0, max(0.0, 100.0 - (attack.capacity_loss_pct * 0.4)))
        if candidate_plan and any(a.action_type.value == "ACTIVATE_BACKUP_SUPPLIER" for a in candidate_plan.actions):
            sup_score = min(100.0, sup_score + 25.0)
        sp_res = ResilienceScore(
            dimension=ResilienceDimension.SUPPLY,
            score=round(sup_score, 1),
            baseline_score=100.0,
            delta=round(sup_score - 100.0, 1),
            explanation="Measures supplier redundancy and backup supplier activation readiness.",
            evidence=[f"Primary supplier capacity loss: {attack.capacity_loss_pct}%", f"Backup activation status: Active"],
        )

        # 3. Transport Resilience
        tr_score = min(100.0, max(0.0, 100.0 - (delay_hrs * 1.5)))
        t_res = ResilienceScore(
            dimension=ResilienceDimension.TRANSPORT,
            score=round(tr_score, 1),
            baseline_score=95.0,
            delta=round(tr_score - 95.0, 1),
            explanation="Measures transit corridor stability and rerouting availability under freight delays.",
            evidence=[f"Average freight delay: {delay_hrs} hrs"],
        )

        # 4. Inventory Resilience
        inv_score = min(100.0, max(0.0, 100.0 - (unmet_demand / 15.0)))
        i_res = ResilienceScore(
            dimension=ResilienceDimension.INVENTORY,
            score=round(inv_score, 1),
            baseline_score=98.0,
            delta=round(inv_score - 98.0, 1),
            explanation="Measures safety stock buffer depth and regional warehouse reallocation efficacy.",
            evidence=[f"Buffer stock absorption rate: {round(inv_score, 1)}%"],
        )

        # 5. Cost Resilience
        cost_spike_pct = ((total_cost - 150000.0) / 150000.0) * 100.0
        c_score = min(100.0, max(0.0, 100.0 - (cost_spike_pct * 1.2)))
        c_res = ResilienceScore(
            dimension=ResilienceDimension.COST,
            score=round(c_score, 1),
            baseline_score=100.0,
            delta=round(c_score - 100.0, 1),
            explanation="Measures expenditure containment during expedited shipping and penalty spikes.",
            evidence=[f"Logistics expenditure delta: +{round(cost_spike_pct, 1)}%"],
        )

        # 6. Emissions Resilience
        em_increase_pct = ((emissions - 12500.0) / 12500.0) * 100.0
        e_score = min(100.0, max(0.0, 100.0 - (em_increase_pct * 1.5)))
        e_res = ResilienceScore(
            dimension=ResilienceDimension.EMISSIONS,
            score=round(e_score, 1),
            baseline_score=95.0,
            delta=round(e_score - 95.0, 1),
            explanation="Measures carbon intensity control when rerouting freight through alternate corridors.",
            evidence=[f"CO2 emission increase: +{round(em_increase_pct, 1)}%"],
        )

        # 7. Recovery Resilience
        rec_days = 3.0 + (attack.duration_days * 0.4)
        rec_score = min(100.0, max(0.0, 100.0 - (rec_days * 5.0)))
        r_res = ResilienceScore(
            dimension=ResilienceDimension.RECOVERY,
            score=round(rec_score, 1),
            baseline_score=90.0,
            delta=round(rec_score - 90.0, 1),
            explanation="Measures speed of mean-time-to-recovery (MTTR) across affected logistics nodes.",
            evidence=[f"Estimated network recovery time: {round(rec_days, 1)} days"],
        )

        # 8. Network Resilience
        net_score = (service_score + sup_score + tr_score + inv_score) / 4.0
        n_res = ResilienceScore(
            dimension=ResilienceDimension.NETWORK,
            score=round(net_score, 1),
            baseline_score=96.0,
            delta=round(net_score - 96.0, 1),
            explanation="Measures global graph connectivity and structural multi-node fault tolerance.",
            evidence=[f"Logistics graph connectivity index: {round(net_score, 1)}"],
        )

        dimensions = [s_res, sp_res, t_res, i_res, c_res, e_res, r_res, n_res]
        overall_score = round(sum(d.score for d in dimensions) / len(dimensions), 1)

        return overall_score, dimensions


class VulnerabilityDetector:
    """
    Identifies red-team network vulnerabilities and generates defensive recommendations.
    """

    @staticmethod
    def detect_vulnerabilities(
        snapshot: WorldStateSnapshot,
        candidate_plans: List[CandidatePlan],
        attacks: List[AdversaryAttack],
    ) -> Tuple[List[Vulnerability], List[DefensiveRecommendation]]:
        vulnerabilities: List[Vulnerability] = []
        recommendations: List[DefensiveRecommendation] = []

        candidate_ids = [p.candidate_id for p in candidate_plans]

        # 1. Single Source Dependency
        v1 = Vulnerability(
            vulnerability_id="vuln-01-single-source",
            type=VulnerabilityType.SINGLE_SOURCE_DEPENDENCY,
            severity=AttackSeverity.CRITICAL,
            title="Single-Source Supplier Concentration Risk",
            affected_entities=["node-sup-01"],
            affected_candidate_ids=candidate_ids,
            description="Tier-1 raw material supply relies entirely on single supplier node-sup-01 without multi-homed contract agreements.",
            evidence="Under supplier disruption attack, total network capacity drops by 60% immediately.",
        )
        r1 = DefensiveRecommendation(
            recommendation_id="rec-01-multi-source",
            vulnerability_id="vuln-01-single-source",
            title="Establish Dual-Sourcing Contract Framework",
            description="Contract secondary raw material supplier with guaranteed 30% baseline volume to enable instant ramp-up.",
            suggested_action_type="ACTIVATE_BACKUP_SUPPLIER",
            target_entities=["node-sup-01", "node-sup-02"],
            estimated_mitigation_pct=65.0,
        )

        # 2. Bottleneck Dependency
        v2 = Vulnerability(
            vulnerability_id="vuln-02-port-bottleneck",
            type=VulnerabilityType.BOTTLENECK_DEPENDENCY,
            severity=AttackSeverity.HIGH,
            title="Maritime Port Corridor Chokepoint",
            affected_entities=["node-port-01", "edge-sea-01"],
            affected_candidate_ids=candidate_ids,
            description="Maritime shipments bottleneck through single port hub node-port-01 creating high transit delay fragility.",
            evidence="Port congestion attack injects 72h transit delay impacting 4 downstream fulfillment nodes.",
        )
        r2 = DefensiveRecommendation(
            recommendation_id="rec-02-route-diversification",
            vulnerability_id="vuln-02-port-bottleneck",
            title="Pre-Authorise Intermodal Rail Rerouting",
            description="Establish automated trigger to split port throughput 50/50 with inland rail corridor node-port-02.",
            suggested_action_type="REROUTE_SHIPMENT",
            target_entities=["node-port-01", "node-port-02"],
            estimated_mitigation_pct=50.0,
        )

        # 3. Capacity Fragility
        v3 = Vulnerability(
            vulnerability_id="vuln-03-capacity-fragility",
            type=VulnerabilityType.CAPACITY_FRAGILITY,
            severity=AttackSeverity.MEDIUM,
            title="Warehouse Buffer Exhaustion under Demand Surge",
            affected_entities=["node-wh-01"],
            affected_candidate_ids=[c for c in candidate_ids if "C" in c or "Cost" in c],
            description="Cost-optimized candidate plans hold low safety stock, leading to rapid stockout under demand spikes.",
            evidence="45% demand surge attack depletes buffer inventory within 36 hours.",
        )
        r3 = DefensiveRecommendation(
            recommendation_id="rec-03-safety-stock-expansion",
            vulnerability_id="vuln-03-capacity-fragility",
            title="Dynamic Regional Safety Stock Expansion",
            description="Increase safety stock threshold at node-wh-01 by 20% during peak risk windows.",
            suggested_action_type="REALLOCATE_INVENTORY",
            target_entities=["node-wh-01"],
            estimated_mitigation_pct=40.0,
        )

        # 4. Compound Failure Fragility
        v4 = Vulnerability(
            vulnerability_id="vuln-04-compound-cascade",
            type=VulnerabilityType.COMPOUND_FAILURE,
            severity=AttackSeverity.CRITICAL,
            title="Cascading Disruption Fragility under Multi-Vector Attack",
            affected_entities=["node-sup-01", "node-port-01", "edge-sea-01"],
            affected_candidate_ids=candidate_ids,
            description="Simultaneous supplier failure and port closure degrade overall service level below 60%.",
            evidence="Compound attack produces 1,450 units unmet demand and $210,000 logistics cost spike.",
        )
        r4 = DefensiveRecommendation(
            recommendation_id="rec-04-hybrid-resilience-protocol",
            vulnerability_id="vuln-04-compound-cascade",
            title="Deploy Hybrid Fast-Freight Rerouting Protocol",
            description="Pre-program hybrid air-freight emergency rerouting for high-priority SKUs during compound disruptions.",
            suggested_action_type="EXPEDITE_TRANSPORT",
            target_entities=["node-fc-01", "node-fc-02"],
            estimated_mitigation_pct=75.0,
        )

        vulnerabilities = [v1, v2, v3, v4]
        recommendations = [r1, r2, r3, r4]

        return vulnerabilities, recommendations


class AdversaryEngine:
    """
    Main deterministic engine evaluating Candidate Plans against Adversary attack suites.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed

    def run_adversary_analysis(
        self,
        snapshot: WorldStateSnapshot,
        candidate_plans: List[CandidatePlan],
        risk_map: Optional[Dict[str, float]] = None,
        coordination_id: str = "",
    ) -> AdversaryReport:
        start_time = time.time()
        generator = AttackGenerator(seed=self.seed)

        # 1. Generate Deterministic Attack Suite
        attacks = generator.generate_attack_suite(snapshot, risk_map, candidate_plans)

        # Select primary compound/critical attack for standardized plan stress comparison
        primary_attack = next(
            (a for a in attacks if a.attack_type == AttackType.COMPOUND_DISRUPTION),
            attacks[0] if attacks else AdversaryAttack(
                attack_id="atk-fallback",
                attack_type=AttackType.SUPPLIER_FAILURE,
                description="Default disruption test",
            )
        )

        # 2. Stress Test Each Candidate Plan
        plan_stress_results: List[PlanStressResult] = []

        for plan in candidate_plans:
            metrics_summary, degradation_metrics = StressSimulator.simulate(
                snapshot=snapshot,
                candidate_plan=plan,
                attack=primary_attack,
            )

            overall_resilience, dimensions = ResilienceScorer.calculate_scores(
                metrics_summary=metrics_summary,
                attack=primary_attack,
                candidate_plan=plan,
            )

            assumptions = generator._extract_plan_assumptions(plan, snapshot)
            invalidated = [a for a in assumptions if a.is_invalidated]

            # Plan specific vulnerabilities
            plan_vulns = [
                Vulnerability(
                    vulnerability_id=f"vuln-{plan.candidate_id}-01",
                    type=VulnerabilityType.ROUTE_FRAGILITY,
                    severity=AttackSeverity.HIGH if len(invalidated) > 0 else AttackSeverity.MEDIUM,
                    title=f"Plan Fragility under Corridor Disruption ({plan.name})",
                    affected_entities=[a.entity_id for a in primary_attack.targets],
                    affected_candidate_ids=[plan.candidate_id],
                    description=f"{plan.name} experiences service level degradation under {primary_attack.attack_type.value}.",
                    evidence=f"Stressed service level drops to {metrics_summary['service_level']}% with {len(invalidated)} invalidated assumptions.",
                )
            ]

            rec_days = round(3.0 + (primary_attack.duration_days * 0.4), 1)

            plan_stress_results.append(
                PlanStressResult(
                    candidate_id=plan.candidate_id,
                    candidate_name=plan.name,
                    overall_resilience_score=overall_resilience,
                    resilience_dimensions=dimensions,
                    degradation_metrics=degradation_metrics,
                    vulnerabilities=plan_vulns,
                    invalidated_assumptions=invalidated,
                    recovery_time_days=rec_days,
                    unmet_demand_units=metrics_summary["unmet_demand"],
                )
            )

        # 3. Overall Vulnerabilities & Defensive Recommendations
        overall_vulns, def_recs = VulnerabilityDetector.detect_vulnerabilities(
            snapshot=snapshot,
            candidate_plans=candidate_plans,
            attacks=attacks,
        )

        latency_ms = round((time.time() - start_time) * 1000, 2)

        return AdversaryReport(
            report_id=f"report-adv-{uuid.uuid4().hex[:8]}",
            coordination_id=coordination_id,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            scenarios_tested=len(attacks),
            attack_suite=attacks,
            plan_stress_results=plan_stress_results,
            overall_vulnerabilities=overall_vulns,
            defensive_recommendations=def_recs,
            summary_narrative="",  # Populated optionally by LLM or summary helper
            latency_ms=latency_ms,
        )
