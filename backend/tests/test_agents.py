"""
Unit & Integration tests for Specialist Agent System & Safety Boundary (P05-001 - P05-017, P05-036)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.agents.base import BaseAgent
from app.agents.inventory import InventoryAgent
from app.agents.supplier import SupplierAgent
from app.agents.transportation import TransportationAgent
from app.agents.fulfillment import FulfillmentAgent
from app.agents.sustainability import SustainabilityAgent
from app.agents.resilience import ResilienceAgent
from app.agents.registry import AgentRegistry, get_agent_registry
from app.services.agents import AgentService
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.schemas.agent import (
    AgentId,
    AgentInput,
    AgentProposal,
    AgentAction,
    AgentActionType,
    AgentResultStatus,
)
from app.generator.synthetic import generate_world

client = TestClient(app)


@pytest.mark.asyncio
async def test_base_agent_safe_execute_and_immutability():
    """
    MANDATORY SAFETY BOUNDARY TEST:
    Verify that executing an agent NEVER mutates WorldRepository or RiskRepository.
    """
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    snap_before = world_repo.get_snapshot()
    risk_before = risk_repo.get_risk_map()

    agent = InventoryAgent()
    agent_input = AgentInput(
        agent_id=AgentId.INVENTORY,
        world_snapshot=snap_before,
        risk_map=risk_before,
    )

    result = await agent.safe_execute(agent_input)

    assert result.status == AgentResultStatus.PROPOSED
    assert result.proposal is not None

    snap_after = world_repo.get_snapshot()
    risk_after = risk_repo.get_risk_map()

    # Immutability assertion
    assert snap_before.snapshot_id == snap_after.snapshot_id
    assert snap_before.nodes == snap_after.nodes
    assert risk_before.node_risks == risk_after.node_risks


@pytest.mark.asyncio
async def test_entity_validation_rejects_hallucinated_nodes():
    world_repo = WorldRepository.get_instance()
    snap = world_repo.get_snapshot()

    agent = InventoryAgent()
    invalid_proposal = AgentProposal(
        agent_id=AgentId.INVENTORY,
        agent_name="Inventory Agent",
        objective=agent.objective,
        summary="Test invalid proposal",
        affected_node_ids=["non_existent_node_999"],
        actions=[
            AgentAction(
                action_type=AgentActionType.REORDER_STOCK,
                target_node_id="non_existent_node_999",
                parameters={},
            )
        ],
        confidence=0.8,
    )

    is_valid, violations = agent.validate_proposal_entities(invalid_proposal, snap)
    assert is_valid is False
    assert len(violations) > 0
    assert any("non_existent_node_999" in v for v in violations)


@pytest.mark.asyncio
async def test_all_six_individual_specialist_agents():
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    snap = world_repo.get_snapshot()
    risk_map = risk_repo.get_risk_map()
    signals = risk_repo.list_signals()

    agents: list[BaseAgent] = [
        InventoryAgent(),
        SupplierAgent(),
        TransportationAgent(),
        FulfillmentAgent(),
        SustainabilityAgent(),
        ResilienceAgent(),
    ]

    for agent in agents:
        agent_input = AgentInput(
            agent_id=agent.id,
            world_snapshot=snap,
            risk_map=risk_map,
            active_signals=signals,
        )
        result = await agent.safe_execute(agent_input)

        assert result.status == AgentResultStatus.PROPOSED
        assert result.proposal is not None
        assert result.proposal.agent_id == agent.id
        assert result.proposal.objective == agent.objective
        assert len(result.proposal.summary) > 0
        assert result.proposal.confidence > 0.0


@pytest.mark.asyncio
async def test_agent_registry():
    registry = get_agent_registry()
    agents_list = registry.list_agents()

    assert len(agents_list) == 6
    agent_ids = {a.id for a in agents_list}
    assert AgentId.INVENTORY in agent_ids
    assert AgentId.SUPPLIER in agent_ids
    assert AgentId.TRANSPORTATION in agent_ids
    assert AgentId.FULFILLMENT in agent_ids
    assert AgentId.SUSTAINABILITY in agent_ids
    assert AgentId.RESILIENCE in agent_ids

    inv = registry.get_agent("inventory")
    assert inv is not None
    assert inv.id == AgentId.INVENTORY


@pytest.mark.asyncio
async def test_agent_service_run_all_specialists():
    service = AgentService()
    all_res = await service.run_all_specialists()

    assert all_res.total_agents == 6
    assert all_res.successful_count == 6
    assert "inventory" in all_res.results
    assert "supplier" in all_res.results
    assert "transportation" in all_res.results
    assert "fulfillment" in all_res.results
    assert "sustainability" in all_res.results
    assert "resilience" in all_res.results

    # Verify proposals coexist without deciding a winner
    for k, res in all_res.results.items():
        assert res.status == AgentResultStatus.PROPOSED
        assert res.proposal is not None


def test_agent_api_endpoints():
    # GET /api/agents
    resp = client.get("/api/agents")
    assert resp.status_code == 200
    json_data = resp.json()
    assert json_data["error"] is None
    assert len(json_data["data"]) == 6

    # GET /api/agents/inventory
    resp_inv = client.get("/api/agents/inventory")
    assert resp_inv.status_code == 200
    assert resp_inv.json()["data"]["id"] == "inventory"

    # POST /api/agents/inventory/run
    resp_run = client.post("/api/agents/inventory/run", json={"target_node_ids": ["sup-001"]})
    assert resp_run.status_code == 200
    run_data = resp_run.json()["data"]
    assert run_data["status"] == "PROPOSED"
    assert run_data["proposal"]["agent_id"] == "inventory"

    # POST /api/agents/run-all
    resp_all = client.post("/api/agents/run-all", json={})
    assert resp_all.status_code == 200
    all_data = resp_all.json()["data"]
    assert all_data["total_agents"] == 6
    assert all_data["successful_count"] == 6
