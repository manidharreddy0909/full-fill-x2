"""
FULFILL-X Agent Registry (Phase 05)
Matching docs/AGENT_SYSTEM_SPEC.md (P05-012)
"""
import logging
from typing import Dict
from app.agents.base import BaseAgent
from app.agents.inventory import InventoryAgent
from app.agents.supplier import SupplierAgent
from app.agents.transportation import TransportationAgent
from app.agents.fulfillment import FulfillmentAgent
from app.agents.sustainability import SustainabilityAgent
from app.agents.resilience import ResilienceAgent
from app.schemas.agent import AgentId, AgentMetadata

logger = logging.getLogger("fulfillx.agent_registry")


class AgentRegistry:
    """
    Registry for managing specialist agents.
    Provides retrieval by agent ID and metadata listing.
    """

    _instance: "AgentRegistry | None" = None

    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {
            AgentId.INVENTORY.value: InventoryAgent(),
            AgentId.SUPPLIER.value: SupplierAgent(),
            AgentId.TRANSPORTATION.value: TransportationAgent(),
            AgentId.FULFILLMENT.value: FulfillmentAgent(),
            AgentId.SUSTAINABILITY.value: SustainabilityAgent(),
            AgentId.RESILIENCE.value: ResilienceAgent(),
        }

    @classmethod
    def get_instance(cls) -> "AgentRegistry":
        if cls._instance is None:
            cls._instance = AgentRegistry()
        return cls._instance

    def get_agent(self, agent_id: str | AgentId) -> BaseAgent | None:
        key = agent_id.value if isinstance(agent_id, AgentId) else str(agent_id).lower()
        return self._agents.get(key)

    def list_agents(self) -> list[AgentMetadata]:
        return [agent.get_metadata() for agent in self._agents.values()]


def get_agent_registry() -> AgentRegistry:
    return AgentRegistry.get_instance()
