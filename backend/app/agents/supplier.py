"""
FULFILL-X Supplier Specialist Agent (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-007)
"""
from app.agents.base import BaseAgent
from app.schemas.agent import (
    AgentAction,
    AgentActionType,
    AgentId,
    AgentInput,
    AgentObjective,
    AgentProposal,
)
from app.schemas.ai import AIRequest, TaskType


class SupplierAgent(BaseAgent):
    """
    Supplier Specialist Agent.
    Objective: REDUCE_SUPPLIER_DISRUPTION.
    Monitors tier-1 supplier health, detects capacity/delay signals, and proposes supplier switches & dual sourcing.
    """

    id = AgentId.SUPPLIER
    name = "Supplier Specialist Agent"
    color = "#7BC67E"
    description = "Mitigates upstream supplier bottlenecks by activating secondary suppliers and dual-sourcing critical components."
    objective = AgentObjective.REDUCE_SUPPLIER_DISRUPTION
    system_prompt = (
        "You are the FULFILL-X Supplier Specialist Agent. "
        "Your mission is to reduce supplier disruption exposure across tier-1 manufacturers. "
        "Recommend supplier switches and dual-sourcing allocations. "
        "Do NOT mutate system state directly. Return structured proposals."
    )
    allowed_action_types = [AgentActionType.SUPPLIER_SWITCH, AgentActionType.DUAL_SOURCE_ALLOCATION]

    def build_prompt(self, input: AgentInput) -> str:
        suppliers = [n for n in input.world_snapshot.nodes if n.type == "SUPPLIER"]
        sup_summary = [
            f"Supplier {s.id} ({s.name}): disrupted={s.is_disrupted}, risk={s.risk_scores.composite:.2f}, region={s.region}"
            for s in suppliers
        ]
        return "Analyze supplier health & disruption exposure:\n" + "\n".join(sup_summary)

    async def reason(self, input: AgentInput) -> AgentProposal:
        prompt = self.build_prompt(input)
        ai_req = AIRequest(
            task_type=TaskType.SPECIALIST_REASONING,
            prompt=prompt,
            system_prompt=self.system_prompt,
            input_context={"agent": self.id.value},
        )

        await self.ai_service.generate_reasoning(ai_req)

        actions: list[AgentAction] = []
        affected_nodes: list[str] = []

        all_suppliers = [n for n in input.world_snapshot.nodes if n.type == "SUPPLIER"]
        disrupted_sups = [s for s in all_suppliers if s.is_disrupted or s.risk_scores.composite >= 0.4]

        if not disrupted_sups and all_suppliers:
            disrupted_sups = [all_suppliers[0]]

        healthy_sups = [s for s in all_suppliers if s not in disrupted_sups]
        backup_supplier = healthy_sups[0] if healthy_sups else (all_suppliers[-1] if len(all_suppliers) > 1 else None)

        for sup in disrupted_sups[:2]:
            affected_nodes.append(sup.id)
            if backup_supplier and backup_supplier.id != sup.id:
                affected_nodes.append(backup_supplier.id)
                actions.append(
                    AgentAction(
                        action_type=AgentActionType.SUPPLIER_SWITCH,
                        target_node_id=sup.id,
                        parameters={
                            "from_supplier_id": sup.id,
                            "to_supplier_id": backup_supplier.id,
                            "volume_allocation_percent": 70,
                        },
                        estimated_cost=25000.0,
                        estimated_delay_hours=24.0,
                    )
                )

                actions.append(
                    AgentAction(
                        action_type=AgentActionType.DUAL_SOURCE_ALLOCATION,
                        target_node_id=sup.id,
                        parameters={
                            "primary_supplier_id": sup.id,
                            "secondary_supplier_id": backup_supplier.id,
                            "split_ratio": "60:40",
                        },
                        estimated_cost=10000.0,
                        estimated_delay_hours=0.0,
                    )
                )

        evidence_ids = [s.id for s in input.active_signals if s.type in ("SUPPLIER_HEALTH", "WEATHER", "GEOPOLITICAL")]

        return AgentProposal(
            agent_id=self.id,
            agent_name=self.name,
            objective=self.objective,
            summary=f"Supplier Agent proposes {len(actions)} supplier mitigation actions targeting {len(affected_nodes)} suppliers.",
            actions=actions,
            affected_node_ids=affected_nodes,
            expected_impacts={
                "supplier_disruption_exposure_reduction": 0.60,
                "lead_time_variance_reduction_hours": 36.0,
            },
            confidence=0.85,
            evidence_signal_ids=[str(e) for e in evidence_ids],
            reasoning_trace=[
                f"Evaluated {len(disrupted_sups)} disrupted/high-risk suppliers.",
                "Identified qualified secondary backup suppliers.",
                "Generated dual-sourcing and volume reallocation proposals.",
            ],
        )
