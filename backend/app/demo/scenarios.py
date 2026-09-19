"""
FULFILL-X Demo Scenario Registry (Phase 16)
Registers deterministic demo scenarios, including the primary showcase scenario DEMO-05.
"""
from typing import Dict, List, Optional
from app.schemas.demo import DemoScenario, DemoScenarioId


class DemoScenarioRegistry:
    """
    Registry of registered deterministic competition scenarios.
    """

    _scenarios: Dict[DemoScenarioId, DemoScenario] = {
        DemoScenarioId.DEMO_01: DemoScenario(
            scenario_id=DemoScenarioId.DEMO_01,
            title="Supplier Shock",
            subtitle="Tier-1 Chip Manufacturer Semiconductor Disruption",
            description="Simulates sudden financial & operational disruption at a key Tier-1 supplier (Apex Electronics in Taiwan). Demonstrates supplier switching and stock reordering.",
            seed=42,
            preset="healthy",
            disruption_type="SUPPLIER_DISRUPTION",
            affected_entities=["sup-001", "sup-002", "wh-001"],
            expected_duration_seconds=90,
            systems_exercised=["RiskEngine", "SupplierAgent", "InventoryAgent", "VerificationEngine"],
            storyboard_steps=[
                "Healthy Network Baseline",
                "Weak Financial Signal Detected",
                "Supplier Disruption Escalated",
                "Specialist Response & Allocation",
                "Plan Verification & Approval",
            ],
        ),
        DemoScenarioId.DEMO_02: DemoScenario(
            scenario_id=DemoScenarioId.DEMO_02,
            title="Port Closure & Marine Bottleneck",
            subtitle="Typhoon Hana Osaka Maritime Port Shutdown",
            description="Simulates extreme weather forcing complete closure of Port of Osaka, trapping sea cargo and delaying inbound freight by 72 hours. Demonstrates multimodal rerouting.",
            seed=42,
            preset="healthy",
            disruption_type="PORT_CLOSURE",
            affected_entities=["port-001", "rt-001", "rt-002", "wh-001"],
            expected_duration_seconds=120,
            systems_exercised=["RiskEngine", "TransportationAgent", "CoordinatorAgent", "VerificationEngine"],
            storyboard_steps=[
                "Weather Warning Signal Ingested",
                "Port Capacity Drops to 0%",
                "Freight Flow Bottleneck Detected",
                "Air/Rail Rerouting Candidate Generated",
                "Human Sign-off & Mitigation",
            ],
        ),
        DemoScenarioId.DEMO_03: DemoScenario(
            scenario_id=DemoScenarioId.DEMO_03,
            title="Demand Surge",
            subtitle="Regional Demand Spike Across APAC Consumer Nodes",
            description="Simulates a 300% unexpected demand surge across APAC customer zones. Demonstrates stock transfer, priority fulfillment, and capacity allocation.",
            seed=42,
            preset="healthy",
            disruption_type="DEMAND_SPIKE",
            affected_entities=["cz-001", "cz-002", "fc-001"],
            expected_duration_seconds=90,
            systems_exercised=["RiskEngine", "FulfillmentAgent", "InventoryAgent", "PlannerEngine"],
            storyboard_steps=[
                "Consumer Order Spike Ingested",
                "Stockout Risk Score Escalated",
                "Fulfillment Priority Allocation",
                "Multi-Objective Tradeoff Computed",
                "Resilience Plan Approved",
            ],
        ),
        DemoScenarioId.DEMO_04: DemoScenario(
            scenario_id=DemoScenarioId.DEMO_04,
            title="Compound Fulfillment Crisis",
            subtitle="Concurrent Supplier Insolvency & Port Bottleneck",
            description="Simulates multi-vector simultaneous disruptions across Tier-1 suppliers and primary transit corridors. Demonstrates Coordinator conflict reconciliation.",
            seed=42,
            preset="double_punch",
            disruption_type="COMPOUND_DISRUPTION",
            affected_entities=["sup-001", "port-001", "wh-001", "rt-001"],
            expected_duration_seconds=150,
            systems_exercised=["RiskEngine", "AllSpecialistAgents", "CoordinatorEngine", "AdversaryEngine"],
            storyboard_steps=[
                "Multi-Vector Disruption Ingested",
                "Systemic Fragility Escalated",
                "6 Specialists Dispatch Parallel Proposals",
                "Coordinator Resolves Objective Conflicts",
                "Red-Team Adversary Challenges Assumptions",
            ],
        ),
        DemoScenarioId.DEMO_05: DemoScenario(
            scenario_id=DemoScenarioId.DEMO_05,
            title="Full Resilience Challenge (Primary Showcase)",
            subtitle="End-to-End Operational Disruption & Autonomous Resilience Loop",
            description="The primary competition showcase scenario. Ingests weak signals, simulates compound disruptions, deploys 6 specialists, resolves conflicts into Candidate Plans A/B/C, stress-tests against Adversary Red-Team attacks, computes Pareto trade-offs, verifies constraints in sandbox, and requests Human Executive Sign-off.",
            seed=42,
            preset="double_punch",
            disruption_type="FULL_PIPELINE_CHALLENGE",
            affected_entities=["sup-001", "port-001", "wh-001", "fc-001", "cz-001"],
            expected_duration_seconds=210,
            systems_exercised=[
                "SignalIngestor",
                "WorldModel",
                "RiskEngine",
                "CompoundScenarioEngine",
                "6SpecialistAgents",
                "CoordinatorEngine",
                "AdversaryRedTeam",
                "MultiObjectivePlanner",
                "VerificationEngine",
                "DecisionCockpit",
                "EventBus",
                "EvaluationHarness",
            ],
            storyboard_steps=[
                "1. Baseline Network Observation",
                "2. Weak Signal Intelligence Ingest",
                "3. Multi-Dimensional Risk Propagation",
                "4. Compound Scenario Composition",
                "5. 6 Specialist Agents Dispatch",
                "6. Coordinator Conflict Reconciliation",
                "7. Candidate Plans A / B / C Synthesized",
                "8. Adversary Red-Team Stress Test",
                "9. Multi-Objective Pareto Optimization",
                "10. Sandbox Plan Verification",
                "11. Human Executive Decision Gate",
                "12. Final Resilience Scorecard & Report",
            ],
        ),
    }

    @classmethod
    def list_scenarios(cls) -> List[DemoScenario]:
        return list(cls._scenarios.values())

    @classmethod
    def get_scenario(cls, scenario_id: DemoScenarioId) -> Optional[DemoScenario]:
        return cls._scenarios.get(scenario_id)
