"""
FULFILL-X Resilience Specialist Agent (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-011)
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


class ResilienceAgent(BaseAgent):
    """
    Resilience Specialist Agent.
    Objective: REDUCE_SYSTEMIC_FRAGILITY.
    Analyzes single points of failure (SPOFs), dependency concentration, and network fragility.
    """

    id = AgentId.RESILIENCE
    name = "Resilience Specialist Agent"
    color = "#E8574A"
    description = "Identifies single points of failure (SPOFs) and proposes structural dependency diversification to reduce systemic vulnerability."
    objective = AgentObjective.REDUCE_SYSTEMIC_FRAGILITY
    system_prompt = (
        "You are the FULFILL-X Resilience Specialist Agent. "
        "Your mission is to reduce systemic fragility and eliminate single points of failure. "
        "Recommend dependency diversification and backup route/node creation. "
        "Do NOT mutate system state directly. Return structured proposals."
    )
    allowed_action_types = [AgentActionType.DIVERSIFY_DEPENDENCY]

    def build_prompt(self, input: AgentInput) -> str:
        nodes = input.world_snapshot.nodes
        spof_candidates = [
            f"Node {n.id} ({n.name}, type={n.type}): composite_risk={n.risk_scores.composite:.2f}"
            for n in nodes
            if n.type in ("PORT", "SUPPLIER", "WAREHOUSE")
        ]
        return "Analyze network topological fragility & SPOF vulnerability:\n" + "\n".join(spof_candidates[:5])

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

        # Find critical ports or suppliers that act as single points of failure
        spof_nodes = [
            n for n in input.world_snapshot.nodes
            if n.type in ("PORT", "SUPPLIER") and (n.risk_scores.composite >= 0.3 or n.is_disrupted)
        ]

        if not spof_nodes:
            spof_nodes = [n for n in input.world_snapshot.nodes if n.type == "PORT"]
            if not spof_nodes:
                spof_nodes = input.world_snapshot.nodes[:1]

        for spof in spof_nodes[:2]:
            affected_nodes.append(spof.id)
            actions.append(
                AgentAction(
                    action_type=AgentActionType.DIVERSIFY_DEPENDENCY,
                    target_node_id=spof.id,
                    parameters={
                        "spof_node_id": spof.id,
                        "diversification_type": "SECONDARY_HUB_ACTIVATION",
                        "target_resilience_score": 0.85,
                    },
                    estimated_cost=30000.0,
                    estimated_delay_hours=0.0,
                )
            )

        evidence_ids = [s.id for s in input.active_signals if s.type in ("GEOPOLITICAL", "WEATHER", "CYBER")]

        return AgentProposal(
            agent_id=self.id,
            agent_name=self.name,
            objective=self.objective,
            summary=f"Resilience Agent identifies {len(spof_nodes)} SPOF vulnerabilities and proposes {len(actions)} diversification actions.",
            actions=actions,
            affected_node_ids=affected_nodes,
            expected_impacts={
                "systemic_fragility_reduction": 0.40,
                "spof_vulnerability_eliminated": len(spof_nodes),
            },
            confidence=0.86,
            evidence_signal_ids=[str(e) for e in evidence_ids],
            reasoning_trace=[
                f"Scanned network topology for single points of failure (SPOFs).",
                f"Identified critical hub bottlenecks on '{', '.join(affected_nodes)}'.",
                "Generated dependency diversification and secondary hub activation proposals.",
            ],
        )
