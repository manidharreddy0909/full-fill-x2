"""
FULFILL-X Base Agent & Safe Execution Pipeline (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-001)
"""
import asyncio
import logging
import time
from abc import ABC, abstractmethod
from typing import Any
from app.repository.risk import RiskRepository
from app.repository.world import WorldRepository
from app.schemas.agent import (
    AgentActionType,
    AgentId,
    AgentInput,
    AgentMetadata,
    AgentObjective,
    AgentProposal,
    AgentResult,
    AgentResultStatus,
)
from app.schemas.world import WorldStateSnapshot

logger = logging.getLogger("fulfillx.agents")


class BaseAgent(ABC):
    """
    Abstract Base Class for all FULFILL-X Specialist Agents.
    Implements the 'safe_execute()' pipeline isolating agent reasoning from authoritative state.
    """

    id: AgentId
    name: str
    color: str
    description: str
    objective: AgentObjective
    system_prompt: str
    allowed_action_types: list[AgentActionType]
    timeout_seconds: float = 30.0

    def __init__(self, ai_service: Any | None = None):
        if ai_service is None:
            from app.services.ai import AIService
            self.ai_service = AIService()
        else:
            self.ai_service = ai_service

    @abstractmethod
    def build_prompt(self, input: AgentInput) -> str:
        """Construct prompt context for AI Provider reasoning."""
        pass

    @abstractmethod
    async def reason(self, input: AgentInput) -> AgentProposal:
        """Execute agent reasoning logic using AIService to produce AgentProposal."""
        pass

    def validate_context(self, input: AgentInput) -> bool:
        """Verify input contains valid snapshot and risk data."""
        if not input.world_snapshot or not input.world_snapshot.nodes:
            return False
        return True

    def validate_proposal_entities(
        self, proposal: AgentProposal, world_snapshot: WorldStateSnapshot
    ) -> tuple[bool, list[str]]:
        """
        Validate all node/edge IDs referenced by proposal exist in authoritative World State.
        Prevents hallucinated node/edge creation.
        """
        violations: list[str] = []
        valid_node_ids = {n.id for n in world_snapshot.nodes}
        valid_edge_ids = {e.id for e in world_snapshot.edges}

        for nid in proposal.affected_node_ids:
            if nid not in valid_node_ids:
                violations.append(f"Referenced non-existent node ID '{nid}' in proposal affected nodes")

        for eid in proposal.affected_edge_ids:
            if eid not in valid_edge_ids:
                violations.append(f"Referenced non-existent edge ID '{eid}' in proposal affected edges")

        for act in proposal.actions:
            if act.action_type not in self.allowed_action_types:
                violations.append(f"Action type '{act.action_type}' is not allowed for agent '{self.id}'")

            if act.target_node_id and act.target_node_id not in valid_node_ids:
                violations.append(f"Action '{act.action_id}' references non-existent node '{act.target_node_id}'")

            if act.target_edge_id and act.target_edge_id not in valid_edge_ids:
                violations.append(f"Action '{act.action_id}' references non-existent edge '{act.target_edge_id}'")

        return (len(violations) == 0, violations)

    async def safe_execute(self, input: AgentInput) -> AgentResult:
        """
        Template method executing full safe pipeline:
        validate_context → reason → validate_entities → verify_immutability → return result
        """
        start_time = time.perf_counter()

        if not self.validate_context(input):
            return AgentResult(
                status=AgentResultStatus.AI_ERROR,
                agent_id=self.id,
                violations=["Invalid or empty AgentInput context"],
                latency_ms=0.0,
            )

        # Capture pre-execution state for immutability check
        world_repo = WorldRepository.get_instance()
        risk_repo = RiskRepository.get_instance()
        snap_id_before = world_repo.get_snapshot().snapshot_id
        risk_snap_before = risk_repo.get_risk_map().snapshot_id

        try:
            async with asyncio.timeout(self.timeout_seconds):
                proposal = await self.reason(input)

            latency_ms = (time.perf_counter() - start_time) * 1000.0

            # Entity and Action Whitelist Validation
            is_valid, violations = self.validate_proposal_entities(proposal, input.world_snapshot)
            if not is_valid:
                logger.warning(f"Agent '{self.id}' proposal failed entity validation: {violations}")
                return AgentResult(
                    status=AgentResultStatus.INFEASIBLE,
                    agent_id=self.id,
                    proposal=proposal,
                    violations=violations,
                    latency_ms=round(latency_ms, 2),
                )

            # IMMUTABILITY VERIFICATION: Ensure world repository & risk repository remain 100% unchanged
            snap_id_after = world_repo.get_snapshot().snapshot_id
            risk_snap_after = risk_repo.get_risk_map().snapshot_id

            if snap_id_before != snap_id_after or risk_snap_before != risk_snap_after:
                logger.critical(f"CRITICAL SAFETY VIOLATION: Agent '{self.id}' attempted to mutate repository state!")
                return AgentResult(
                    status=AgentResultStatus.AI_ERROR,
                    agent_id=self.id,
                    violations=["CRITICAL: Agent reasoning mutated authoritative repository state"],
                    latency_ms=round(latency_ms, 2),
                )

            return AgentResult(
                status=AgentResultStatus.PROPOSED,
                agent_id=self.id,
                proposal=proposal,
                latency_ms=round(latency_ms, 2),
            )

        except asyncio.TimeoutError:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return AgentResult(
                status=AgentResultStatus.TIMEOUT,
                agent_id=self.id,
                violations=[f"Agent execution timed out after {self.timeout_seconds}s"],
                latency_ms=round(latency_ms, 2),
            )
        except Exception as ex:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            logger.error(f"Agent '{self.id}' execution failed: {ex}", exc_info=True)
            return AgentResult(
                status=AgentResultStatus.AI_ERROR,
                agent_id=self.id,
                violations=[f"Agent reasoning exception: {str(ex)}"],
                latency_ms=round(latency_ms, 2),
            )

    def get_metadata(self) -> AgentMetadata:
        return AgentMetadata(
            id=self.id,
            name=self.name,
            color=self.color,
            objective=self.objective,
            description=self.description,
            allowed_action_types=self.allowed_action_types,
        )
