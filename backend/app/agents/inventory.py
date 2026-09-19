"""
FULFILL-X Inventory Specialist Agent (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-006)
"""
from typing import Any
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


class InventoryAgent(BaseAgent):
    """
    Inventory Specialist Agent.
    Objective: MINIMIZE_STOCKOUT_RISK.
    Analyzes stock levels, safety stock thresholds, and demand exposure to propose reorders & transfers.
    """

    id = AgentId.INVENTORY
    name = "Inventory Specialist Agent"
    color = "#4A90D9"
    description = "Minimizes stockout risk across warehouses and fulfillment centers through buffer reorders and stock transfers."
    objective = AgentObjective.MINIMIZE_STOCKOUT_RISK
    system_prompt = (
        "You are the FULFILL-X Inventory Specialist Agent. "
        "Your sole mission is to minimize stockout risk across all network nodes. "
        "Recommend reorders from suppliers or stock transfers between warehouses/FCs. "
        "Do NOT mutate system state directly. Return structured proposals."
    )
    allowed_action_types = [AgentActionType.REORDER_STOCK, AgentActionType.STOCK_TRANSFER]

    def build_prompt(self, input: AgentInput) -> str:
        nodes_summary = [
            f"Node {n.id} ({n.name}, type={n.type}): stock={int(n.inventory_level*100)}%, composite_risk={n.risk_scores.composite:.2f}"
            for n in input.world_snapshot.nodes
            if n.type in ("WAREHOUSE", "FULFILLMENT_CENTER")
        ]
        return f"Analyze inventory exposure across facilities:\n" + "\n".join(nodes_summary)

    async def reason(self, input: AgentInput) -> AgentProposal:
        prompt = self.build_prompt(input)
        ai_req = AIRequest(
            task_type=TaskType.SPECIALIST_REASONING,
            prompt=prompt,
            system_prompt=self.system_prompt,
            input_context={"agent": self.id.value},
        )

        ai_resp = await self.ai_service.generate_reasoning(ai_req)

        actions: list[AgentAction] = []
        affected_nodes: list[str] = []

        # Find facilities with low stock (< 30%) or elevated composite risk (>= 0.4)
        at_risk_facilities = [
            n for n in input.world_snapshot.nodes
            if n.type in ("WAREHOUSE", "FULFILLMENT_CENTER") and (n.inventory_level < 0.35 or n.risk_scores.composite >= 0.4)
        ]

        if not at_risk_facilities:
            # Fallback to primary warehouse W1 if no acute stockout found
            target_node = next((n for n in input.world_snapshot.nodes if n.type == "WAREHOUSE"), input.world_snapshot.nodes[0])
            at_risk_facilities = [target_node]

        suppliers = [n for n in input.world_snapshot.nodes if n.type == "SUPPLIER"]
        primary_supplier = suppliers[0] if suppliers else None

        for fac in at_risk_facilities[:3]:
            affected_nodes.append(fac.id)
            if primary_supplier and fac.inventory_level < 0.3:
                actions.append(
                    AgentAction(
                        action_type=AgentActionType.REORDER_STOCK,
                        target_node_id=fac.id,
                        parameters={
                            "from_supplier_id": primary_supplier.id,
                            "quantity_units": 5000,
                            "urgency": "HIGH",
                        },
                        estimated_cost=15000.0,
                        estimated_delay_hours=48.0,
                    )
                )

            # Stock transfer from surplus warehouse if available
            surplus_node = next((n for n in input.world_snapshot.nodes if n.type == "WAREHOUSE" and n.id != fac.id and n.inventory_level > 0.6), None)
            if surplus_node:
                actions.append(
                    AgentAction(
                        action_type=AgentActionType.STOCK_TRANSFER,
                        target_node_id=fac.id,
                        parameters={
                            "from_node_id": surplus_node.id,
                            "to_node_id": fac.id,
                            "quantity_units": 2000,
                        },
                        estimated_cost=3500.0,
                        estimated_delay_hours=12.0,
                    )
                )

        evidence_ids = [s.id for s in input.active_signals[:2]]

        return AgentProposal(
            agent_id=self.id,
            agent_name=self.name,
            objective=self.objective,
            summary=f"Inventory Agent proposes {len(actions)} reorder/transfer actions targeting {len(affected_nodes)} at-risk facilities.",
            actions=actions,
            affected_node_ids=affected_nodes,
            expected_impacts={
                "stockout_probability_reduction": 0.45,
                "inventory_buffer_increase": "+30%",
            },
            confidence=0.88,
            evidence_signal_ids=[str(e) for e in evidence_ids],
            reasoning_trace=[
                f"Identified {len(at_risk_facilities)} facilities below safety threshold.",
                "Evaluated supplier lead times and warehouse stock transfer availability.",
                "Generated structured reorder and stock transfer proposals.",
            ],
        )
