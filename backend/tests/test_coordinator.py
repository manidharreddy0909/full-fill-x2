"""
FULFILL-X Coordinator Engine & Multi-Agent Reconciliation Test Suite (Phase 06)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.world import WorldStateSnapshot
from app.schemas.agent import AgentProposal, AgentAction, AgentActionType, AgentObjective, AgentInput, AgentResultStatus
from app.schemas.coordinator import (
  ProposalNormalization,
  Agreement,
  Conflict,
  ConflictType,
  ObjectiveImpact,
  TradeOff,
  CandidatePlan,
  CandidatePlanStatus,
  CoordinatorResult,
  CoordinatorResultStatus,
)
from app.engine.reconciliation import (
  ProposalNormalizer,
  AgreementDetector,
  ConflictDetector,
  TradeOffAnalyzer,
  CandidatePlanGenerator,
  ConstraintFilter,
  ReconciliationEngine,
)
from app.agents.coordinator import CoordinatorAgent
from app.services.coordinator import coordinator_service
from app.services.agents import AgentService

agent_service = AgentService()
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_state_before_test():
  WorldRepository.get_instance().seed_world(preset="healthy", seed=42)
  RiskRepository.get_instance()._initialize_baseline_signals()

@pytest.mark.asyncio
async def test_coordinator_schemas():
  """Verifies Pydantic schema validation and serialization for coordinator models."""
  norm = ProposalNormalization(
    normalized_id="norm-001",
    action_type=AgentActionType.REORDER_STOCK,
    target_node_ids=["wh-001"],
    parameters={"reorder_quantity": 500},
    source_proposal_ids=["prop-001"],
    supporting_agent_ids=["inventory"],
    supporting_objectives=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
    estimated_cost=15000.0,
  )
  assert norm.normalized_id == "norm-001"
  assert norm.estimated_cost == 15000.0

  agree = Agreement(
    agreement_id="agree-001",
    proposal_ids=["prop-001", "prop-002"],
    agent_ids=["inventory", "supplier"],
    affected_entities=["wh-001"],
    shared_intent="Stock protection",
    reason="Shared target mitigation",
  )
  assert agree.proposal_ids == ["prop-001", "prop-002"]

  conf = Conflict(
    conflict_id="conf-001",
    proposal_id_a="prop-001",
    proposal_id_b="prop-003",
    agent_id_a="transportation",
    agent_id_b="sustainability",
    conflict_type=ConflictType.OBJECTIVE_OPPOSITION,
    affected_entities=["edge-001"],
    objective_a=AgentObjective.REDUCE_DELAY_AND_COST,
    objective_b=AgentObjective.REDUCE_EMISSIONS,
    reason="Air freight increases emissions",
  )
  assert conf.conflict_type == ConflictType.OBJECTIVE_OPPOSITION


@pytest.mark.asyncio
async def test_proposal_normalization():
  """Verifies duplicate action merging and normalized parameter aggregation."""
  prop1 = AgentProposal(
    proposal_id="p1",
    agent_id="inventory",
    agent_name="Inventory Agent",
    objective=AgentObjective.MINIMIZE_STOCKOUT_RISK,
    summary="Reorder W1",
    actions=[
      AgentAction(
        action_id="a1",
        action_type=AgentActionType.REORDER_STOCK,
        target_node_id="wh-001",
        parameters={"qty": 1000},
        estimated_cost=10000.0,
      )
    ],
    affected_node_ids=["wh-001"],
    affected_edge_ids=[],
    expected_impacts={},
    confidence=0.9,
    evidence_signal_ids=[],
    reasoning_trace=[],
  )

  prop2 = AgentProposal(
    proposal_id="p2",
    agent_id="supplier",
    agent_name="Supplier Agent",
    objective=AgentObjective.REDUCE_SUPPLIER_DISRUPTION,
    summary="Buffer W1",
    actions=[
      AgentAction(
        action_id="a2",
        action_type=AgentActionType.REORDER_STOCK,
        target_node_id="wh-001",
        parameters={"buffer": True},
        estimated_cost=12000.0,
      )
    ],
    affected_node_ids=["wh-001"],
    affected_edge_ids=[],
    expected_impacts={},
    confidence=0.85,
    evidence_signal_ids=[],
    reasoning_trace=[],
  )

  norms = ProposalNormalizer.normalize([prop1, prop2])
  assert len(norms) == 1
  norm = norms[0]
  assert norm.action_type == AgentActionType.REORDER_STOCK
  assert "wh-001" in norm.target_node_ids
  assert set(norm.supporting_agent_ids) == {"inventory", "supplier"}
  assert set(norm.source_proposal_ids) == {"p1", "p2"}
  assert norm.estimated_cost == 12000.0


@pytest.mark.asyncio
async def test_agreement_and_conflict_detection():
  """Verifies agreement detection and genuine conflict identification."""
  all_props_res = await agent_service.run_all_specialists([])
  proposals = [r.proposal for r in all_props_res.results.values() if r.proposal]

  agreements = AgreementDetector.detect(proposals)
  conflicts = ConflictDetector.detect(proposals)

  assert len(agreements) > 0
  assert any(len(a.proposal_ids) >= 2 for a in agreements)

  # Check conflict between transportation (air freight/reroute) and sustainability (emissions)
  assert len(conflicts) > 0
  assert any(c.conflict_type in [ConflictType.OBJECTIVE_OPPOSITION, ConflictType.RESOURCE_CONTENTION, ConflictType.MUTUALLY_EXCLUSIVE_ROUTE] for c in conflicts)


@pytest.mark.asyncio
async def test_trade_off_analysis_and_candidate_generation():
  """Verifies 6-objective impact matrix scoring and Candidate Plan generation."""
  world_snap = WorldRepository.get_instance().get_snapshot()
  all_props_res = await agent_service.run_all_specialists([])
  proposals = [r.proposal for r in all_props_res.results.values() if r.proposal]

  norms, agrees, confs, candidates = ReconciliationEngine.reconcile(world_snap, proposals)

  assert len(candidates) >= 2
  cand_a = candidates[0]
  assert cand_a.candidate_id == "candidate-a"
  assert len(cand_a.objective_impact_matrix) == 6
  assert cand_a.tradeoff is not None
  assert len(cand_a.tradeoff.positive_objectives) > 0


@pytest.mark.asyncio
async def test_constraint_filtering_rejects_hallucinated_entities():
  """Verifies that candidate plans targeting non-existent nodes/edges are marked INVALID."""
  world_snap = WorldRepository.get_instance().get_snapshot()

  invalid_norm = ProposalNormalization(
    normalized_id="norm-inv",
    action_type=AgentActionType.REORDER_STOCK,
    target_node_ids=["non-existent-wh-999"],
    parameters={},
    source_proposal_ids=["p-fake"],
    supporting_agent_ids=["inventory"],
    supporting_objectives=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
  )

  impacts, tradeoff = TradeOffAnalyzer.analyze("candidate-inv", [invalid_norm], ["inventory"])

  bad_cand = CandidatePlan(
    candidate_id="candidate-inv",
    name="Bad Candidate Plan",
    description="Invalid target test",
    actions=[invalid_norm],
    supporting_agents=["inventory"],
    objectives_addressed=[AgentObjective.MINIMIZE_STOCKOUT_RISK],
    agreements=[],
    conflicts_involved=[],
    objective_impact_matrix=impacts,
    tradeoff=tradeoff,
    status=CandidatePlanStatus.VALID,
  )

  filtered = ConstraintFilter.filter_and_validate([bad_cand], world_snap)
  assert filtered[0].status == CandidatePlanStatus.INVALID
  assert len(filtered[0].violations) > 0
  assert "non-existent-wh-999" in filtered[0].violations[0]

@pytest.mark.asyncio
async def test_coordinator_agent_safe_execute_and_immutability():
  """Verifies CoordinatorAgent immutability check and zero state mutation."""
  world_snap_before = WorldRepository.get_instance().get_snapshot()
  risk_snap_before = RiskRepository.get_instance().get_risk_map()

  coord_agent = CoordinatorAgent()
  all_props_res = await agent_service.run_all_specialists([])
  proposals = [r.proposal for r in all_props_res.results.values() if r.proposal]

  agent_input = AgentInput(
    agent_id="coordinator",
    world_snapshot=world_snap_before,
    risk_map=risk_snap_before,
    target_node_ids=[],
    other_agent_proposals=[p.model_dump() for p in proposals],
  )

  res = await coord_agent.safe_execute(agent_input)
  assert res.status == AgentResultStatus.PROPOSED
  assert res.proposal is not None
  assert res.proposal.agent_id == "coordinator"

  world_snap_after = WorldRepository.get_instance().get_snapshot()
  risk_snap_after = RiskRepository.get_instance().get_risk_map()

  assert world_snap_before.snapshot_id == world_snap_after.snapshot_id
  assert risk_snap_before.snapshot_id == risk_snap_after.snapshot_id


@pytest.mark.asyncio
async def test_100_percent_determinism():
  """Verifies running coordination multiple times produces identical results."""
  res1 = await coordinator_service.run_coordination()
  res2 = await coordinator_service.run_coordination()

  assert res1.status == res2.status
  assert len(res1.agreements) == len(res2.agreements)
  assert len(res1.conflicts) == len(res2.conflicts)
  assert len(res1.candidate_plans) == len(res2.candidate_plans)

  for c1, c2 in zip(res1.candidate_plans, res2.candidate_plans):
    assert c1.name == c2.name
    assert c1.estimated_total_cost == c2.estimated_total_cost
    assert c1.estimated_max_delay_hours == c2.estimated_max_delay_hours


@pytest.mark.asyncio
async def test_partial_specialist_failure_handling():
  """Verifies graceful handling of partial specialist inputs."""
  all_props_res = await agent_service.run_all_specialists([])
  proposals = [r.proposal for r in all_props_res.results.values() if r.proposal]

  # Exclude transportation agent proposal
  partial_props = [p for p in proposals if p.agent_id != "transportation"]

  res = await coordinator_service.run_coordination(proposals=partial_props)
  assert res.status == CoordinatorResultStatus.PARTIAL_PROPOSALS
  assert "transportation" in res.missing_agent_ids
  assert len(res.candidate_plans) > 0


@pytest.mark.asyncio
async def test_coordinator_api_endpoints():
  """Integration test for FastAPI coordinator REST endpoints."""
  # 1. Status
  resp_status = client.get("/api/coordinator/status")
  assert resp_status.status_code == 200
  data_status = resp_status.json()["data"]
  assert data_status["status"] == "ONLINE"

  # 2. Run All with Coordinator
  resp_run = client.post("/api/coordinator/run-all", json={"target_node_ids": []})
  assert resp_run.status_code == 200
  data_run = resp_run.json()["data"]
  assert data_run["status"] in ["SUCCESS", "PARTIAL_PROPOSALS"]
  assert len(data_run["candidate_plans"]) >= 2
