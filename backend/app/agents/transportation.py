"""
FULFILL-X Transportation Specialist Agent (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-008)
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


class TransportationAgent(BaseAgent):
    """
    Transportation Specialist Agent.
    Objective: REDUCE_DELAY_AND_COST.
    Analyzes route congestion, port delays, and transport modes to propose flow rerouting and mode switches.
    """

    id = AgentId.TRANSPORTATION
    name = "Transportation Specialist Agent"
    color = "#E8A24A"
    description = "Optimizes transport flow, mitigates port bottleneck delays, and executes mode switches (e.g. SEA to AIR)."
    objective = AgentObjective.REDUCE_DELAY_AND_COST
    system_prompt = (
        "You are the FULFILL-X Transportation Specialist Agent. "
        "Your mission is to minimize fulfillment delay and transport cost across all network routes. "
        "Recommend rerouting flows and transport mode upgrades. "
        "Do NOT mutate system state directly. Return structured proposals."
    )
    allowed_action_types = [AgentActionType.REROUTE_FLOW, AgentActionType.MODE_SWITCH]

    def build_prompt(self, input: AgentInput) -> str:
        edges = input.world_snapshot.edges
        edge_summary = [
            f"Edge {e.id} ({e.source_node_id} -> {e.target_node_id}): mode={e.transport_mode}, delay={e.delay_hours}h, disrupted={e.is_disrupted}"
            for e in edges[:5]
        ]
        return "Analyze route delays & transport bottlenecks:\n" + "\n".join(edge_summary)

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
        affected_edges: list[str] = []

        disrupted_edges = [e for e in input.world_snapshot.edges if e.is_disrupted or e.delay_hours > 5.0]

        if not disrupted_edges and input.world_snapshot.edges:
            disrupted_edges = [input.world_snapshot.edges[0]]

        for e in disrupted_edges[:2]:
            affected_edges.append(e.id)
            if e.source_node_id not in affected_nodes:
                affected_nodes.append(e.source_node_id)
            if e.target_node_id not in affected_nodes:
                affected_nodes.append(e.target_node_id)

            # Alternate route check
            alt_edges = [
                other for other in input.world_snapshot.edges
                if other.source_node_id == e.source_node_id and other.id != e.id
            ]
            alt_edge = alt_edges[0] if alt_edges else None

            if alt_edge:
                actions.append(
                    AgentAction(
                        action_type=AgentActionType.REROUTE_FLOW,
                        target_edge_id=e.id,
                        target_node_id=e.source_node_id,
                        parameters={
                            "original_route_id": e.id,
                            "alternative_route_id": alt_edge.id,
                            "traffic_shift_percent": 80,
                        },
                        estimated_cost=8500.0,
                        estimated_delay_hours=-18.0,
                    )
                )

            # Air freight mode switch for high urgency
            if e.transport_mode in ("SEA", "ROAD"):
                actions.append(
                    AgentAction(
                        action_type=AgentActionType.MODE_SWITCH,
                        target_edge_id=e.id,
                        target_node_id=e.target_node_id,
                        parameters={
                            "route_id": e.id,
                            "from_mode": e.transport_mode or "SEA",
                            "to_mode": "AIR",
                            "priority_shipments_only": True,
                        },
                        estimated_cost=18000.0,
                        estimated_delay_hours=-48.0,
                        estimated_emissions_co2_kg=450.0,
                    )
                )

        evidence_ids = [s.id for s in input.active_signals if s.type in ("LOGISTICS", "WEATHER")]

        return AgentProposal(
            agent_id=self.id,
            agent_name=self.name,
            objective=self.objective,
            summary=f"Transportation Agent proposes {len(actions)} transport optimization actions for {len(affected_edges)} routes.",
            actions=actions,
            affected_node_ids=affected_nodes,
            affected_edge_ids=affected_edges,
            expected_impacts={
                "transit_delay_reduction_hours": 36.0,
                "route_reliability_increase": 0.55,
            },
            confidence=0.84,
            evidence_signal_ids=[str(e) for e in evidence_ids],
            reasoning_trace=[
                f"Identified {len(disrupted_edges)} delayed or disrupted transit routes.",
                "Evaluated secondary route availability and air-freight mode upgrades.",
                "Generated flow rerouting and mode switch proposals.",
            ],
        )
