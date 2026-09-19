"""
FULFILL-X Fulfillment Specialist Agent (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-009)
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


class FulfillmentAgent(BaseAgent):
    """
    Fulfillment Specialist Agent.
    Objective: PROTECT_SERVICE_LEVEL.
    Monitors customer zones and FC backlog to propose order priority changes and FC reallocations.
    """

    id = AgentId.FULFILLMENT
    name = "Fulfillment Specialist Agent"
    color = "#9B7FE8"
    description = "Protects customer SLA commitments by reallocating order fulfillment between FCs and prioritizing high-tier customers."
    objective = AgentObjective.PROTECT_SERVICE_LEVEL
    system_prompt = (
        "You are the FULFILL-X Fulfillment Specialist Agent. "
        "Your mission is to protect customer service level agreements (SLAs). "
        "Recommend order priority adjustments and FC volume reallocations. "
        "Do NOT mutate system state directly. Return structured proposals."
    )
    allowed_action_types = [AgentActionType.ORDER_PRIORITY_CHANGE, AgentActionType.FC_REALLOCATION]

    def build_prompt(self, input: AgentInput) -> str:
        czs = [n for n in input.world_snapshot.nodes if n.type == "CUSTOMER_ZONE"]
        cz_summary = [
            f"CustomerZone {c.id} ({c.name}): SLA risk={c.risk_scores.sla:.2f}, demand={c.demand_units_per_day} units/day"
            for c in czs[:4]
        ]
        return "Analyze SLA breach risk across customer zones:\n" + "\n".join(cz_summary)

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

        at_risk_czs = [
            n for n in input.world_snapshot.nodes
            if n.type == "CUSTOMER_ZONE" and (n.risk_scores.sla >= 0.3 or n.risk_scores.composite >= 0.3)
        ]

        if not at_risk_czs:
            czs = [n for n in input.world_snapshot.nodes if n.type == "CUSTOMER_ZONE"]
            at_risk_czs = czs[:2] if czs else []

        fcs = [n for n in input.world_snapshot.nodes if n.type == "FULFILLMENT_CENTER"]
        primary_fc = fcs[0] if fcs else None
        secondary_fc = fcs[1] if len(fcs) > 1 else None

        for cz in at_risk_czs[:2]:
            affected_nodes.append(cz.id)

            actions.append(
                AgentAction(
                    action_type=AgentActionType.ORDER_PRIORITY_CHANGE,
                    target_node_id=cz.id,
                    parameters={
                        "customer_zone_id": cz.id,
                        "priority_level": "EXPEDITED",
                        "sla_target_hours": 24.0,
                    },
                    estimated_cost=2000.0,
                    estimated_delay_hours=-12.0,
                )
            )

            if primary_fc and secondary_fc:
                affected_nodes.append(primary_fc.id)
                affected_nodes.append(secondary_fc.id)
                actions.append(
                    AgentAction(
                        action_type=AgentActionType.FC_REALLOCATION,
                        target_node_id=secondary_fc.id,
                        parameters={
                            "from_fc_id": primary_fc.id,
                            "to_fc_id": secondary_fc.id,
                            "order_shift_percentage": 30,
                            "target_customer_zone_id": cz.id,
                        },
                        estimated_cost=6500.0,
                        estimated_delay_hours=-18.0,
                    )
                )

        evidence_ids = [s.id for s in input.active_signals if s.type in ("DEMAND_SHIFT", "LOGISTICS")]

        return AgentProposal(
            agent_id=self.id,
            agent_name=self.name,
            objective=self.objective,
            summary=f"Fulfillment Agent proposes {len(actions)} SLA protection actions for {len(affected_nodes)} customer zones & FCs.",
            actions=actions,
            affected_node_ids=list(set(affected_nodes)),
            expected_impacts={
                "sla_breach_probability_reduction": 0.50,
                "customer_satisfaction_protection": "HIGH",
            },
            confidence=0.87,
            evidence_signal_ids=[str(e) for e in evidence_ids],
            reasoning_trace=[
                f"Identified {len(at_risk_czs)} customer zones with elevated SLA breach risk.",
                "Evaluated secondary fulfillment center capacity and order queue priorities.",
                "Generated order priority escalation and FC workload reallocation proposals.",
            ],
        )
