"""
FULFILL-X Agent Orchestration Service (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-013)
"""
import asyncio
import logging
from typing import Any
from app.agents.registry import AgentRegistry
from app.repository.risk import RiskRepository
from app.repository.world import WorldRepository
from app.schemas.agent import (
    AgentId,
    AgentInput,
    AgentMetadata,
    AgentResult,
    AgentResultStatus,
    AllSpecialistProposalsResponse,
)

logger = logging.getLogger("fulfillx.agent_service")


from app.schemas.signal import SignalStatus


class AgentService:
    """
    Business Service orchestrating specialist agent executions.
    Reads authoritative state snapshot and risk maps safely.
    Guarantees no state mutation occurs during agent execution.
    """

    def __init__(
        self,
        registry: AgentRegistry | None = None,
        world_repo: WorldRepository | None = None,
        risk_repo: RiskRepository | None = None,
    ):
        self.registry = registry or AgentRegistry.get_instance()
        self.world_repo = world_repo or WorldRepository.get_instance()
        self.risk_repo = risk_repo or RiskRepository.get_instance()

    def list_agents(self) -> list[AgentMetadata]:
        return self.registry.list_agents()

    def get_agent_metadata(self, agent_id: str) -> AgentMetadata | None:
        agent = self.registry.get_agent(agent_id)
        return agent.get_metadata() if agent else None

    async def run_agent(self, agent_id: str, target_node_ids: list[str] | None = None) -> AgentResult:
        """
        Execute a single specialist agent safely against current world snapshot & risk state.
        """
        agent = self.registry.get_agent(agent_id)
        if not agent:
            return AgentResult(
                status=AgentResultStatus.AI_ERROR,
                agent_id=AgentId.INVENTORY,  # Fallback ID for error schema
                violations=[f"Agent '{agent_id}' is not registered"],
            )

        world_snap = self.world_repo.get_snapshot()
        risk_map = self.risk_repo.get_risk_map()
        signals = self.risk_repo.list_signals(status=SignalStatus.ACTIVE)

        agent_input = AgentInput(
            agent_id=agent.id,
            world_snapshot=world_snap,
            risk_map=risk_map,
            active_signals=signals,
            target_node_ids=target_node_ids or [],
        )

        return await agent.safe_execute(agent_input)

    async def run_all_specialists(self, target_node_ids: list[str] | None = None) -> AllSpecialistProposalsResponse:
        """
        Execute all 6 specialist agents concurrently using asyncio.gather().
        All specialists observe the same immutable world snapshot.
        """
        world_snap = self.world_repo.get_snapshot()
        risk_map = self.risk_repo.get_risk_map()
        signals = self.risk_repo.list_signals(status=SignalStatus.ACTIVE)

        specialists = self.registry.list_agents()

        async def _run_single(meta: AgentMetadata) -> tuple[str, AgentResult]:
            agent = self.registry.get_agent(meta.id)
            if not agent:
                res = AgentResult(status=AgentResultStatus.AI_ERROR, agent_id=meta.id, violations=["Agent missing"])
                return (meta.id.value, res)

            agent_input = AgentInput(
                agent_id=agent.id,
                world_snapshot=world_snap,
                risk_map=risk_map,
                active_signals=signals,
                target_node_ids=target_node_ids or [],
            )

            result = await agent.safe_execute(agent_input)
            return (meta.id.value, result)

        tasks = [_run_single(meta) for meta in specialists]
        outcomes = await asyncio.gather(*tasks, return_exceptions=True)

        results: dict[str, AgentResult] = {}
        successful_count = 0

        for idx, outcome in enumerate(outcomes):
            agent_key = specialists[idx].id.value
            if isinstance(outcome, Exception):
                logger.error(f"Specialist '{agent_key}' execution exception: {outcome}")
                results[agent_key] = AgentResult(
                    status=AgentResultStatus.AI_ERROR,
                    agent_id=specialists[idx].id,
                    violations=[f"Unhandled exception: {str(outcome)}"],
                )
            else:
                key, res = outcome
                results[key] = res
                if res.status == AgentResultStatus.PROPOSED:
                    successful_count += 1

        return AllSpecialistProposalsResponse(
            snapshot_id=str(world_snap.snapshot_id),
            results=results,
            total_agents=len(specialists),
            successful_count=successful_count,
        )
