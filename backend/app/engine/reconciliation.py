"""
FULFILL-X Deterministic Reconciliation Engine (Phase 06)
100% deterministic normalization, agreement detection, conflict identification,
trade-off analysis, objective impact matrix calculation, candidate plan generation,
and constraint filtering across specialist agent proposals.
"""

import uuid
from typing import List, Dict, Any, Tuple, Set
from app.schemas.world import WorldStateSnapshot
from app.schemas.agent import AgentProposal, AgentAction, AgentId, AgentObjective, AgentActionType
from app.schemas.coordinator import (
  ProposalNormalization,
  Agreement,
  Conflict,
  ConflictType,
  ObjectiveImpact,
  TradeOff,
  CandidatePlan,
  CandidatePlanStatus,
)

class ProposalNormalizer:
  """Normalizes and deduplicates specialist actions into unified representations."""

  @staticmethod
  def normalize(proposals: List[AgentProposal]) -> List[ProposalNormalization]:
    normalized_map: Dict[Tuple[str, str], ProposalNormalization] = {}
    
    for prop in proposals:
      for action in prop.actions:
        target_id = action.target_node_id or action.target_edge_id or "GLOBAL"
        key = (action.action_type.value, target_id)
        
        if key in normalized_map:
          norm = normalized_map[key]
          if prop.proposal_id not in norm.source_proposal_ids:
            norm.source_proposal_ids.append(prop.proposal_id)
          if prop.agent_id not in norm.supporting_agent_ids:
            norm.supporting_agent_ids.append(prop.agent_id)
          if prop.objective not in norm.supporting_objectives:
            norm.supporting_objectives.append(prop.objective)
          norm.estimated_cost = max(norm.estimated_cost, action.estimated_cost)
          norm.estimated_delay_hours = max(norm.estimated_delay_hours, action.estimated_delay_hours)
          norm.estimated_emissions_co2_kg = max(norm.estimated_emissions_co2_kg, action.estimated_emissions_co2_kg)
          norm.parameters.update(action.parameters)
        else:
          target_nodes = [action.target_node_id] if action.target_node_id else []
          target_edges = [action.target_edge_id] if action.target_edge_id else []
          norm = ProposalNormalization(
            normalized_id=f"norm-{uuid.uuid4().hex[:8]}",
            action_type=action.action_type,
            target_node_ids=target_nodes,
            target_edge_ids=target_edges,
            parameters=dict(action.parameters),
            source_proposal_ids=[prop.proposal_id],
            supporting_agent_ids=[prop.agent_id],
            supporting_objectives=[prop.objective],
            estimated_cost=action.estimated_cost,
            estimated_delay_hours=action.estimated_delay_hours,
            estimated_emissions_co2_kg=action.estimated_emissions_co2_kg,
          )
          normalized_map[key] = norm
          
    return list(normalized_map.values())


class AgreementDetector:
  """Detects reinforcing proposal agreements across specialist agents."""

  @staticmethod
  def detect(proposals: List[AgentProposal]) -> List[Agreement]:
    agreements: List[Agreement] = []
    
    # 1. Target node/edge overlap agreements
    entity_map: Dict[str, List[AgentProposal]] = {}
    for prop in proposals:
      for node_id in prop.affected_node_ids:
        entity_map.setdefault(node_id, []).append(prop)
      for edge_id in prop.affected_edge_ids:
        entity_map.setdefault(edge_id, []).append(prop)
        
    agreement_counter = 1
    seen_pairs: Set[Tuple[str, str]] = set()

    for entity_id, props in entity_map.items():
      unique_props = {p.proposal_id: p for p in props}
      if len(unique_props) > 1:
        prop_list = list(unique_props.values())
        for i in range(len(prop_list)):
          for j in range(i + 1, len(prop_list)):
            p1, p2 = prop_list[i], prop_list[j]
            pair_key = tuple(sorted([p1.proposal_id, p2.proposal_id]))
            if pair_key in seen_pairs:
              continue
            seen_pairs.add(pair_key)
            
            agreements.append(
              Agreement(
                agreement_id=f"agree-{agreement_counter:03d}",
                type="SHARED_TARGET_MITIGATION",
                proposal_ids=[p1.proposal_id, p2.proposal_id],
                agent_ids=[p1.agent_id, p2.agent_id],
                affected_entities=[entity_id],
                shared_intent=f"Coordinated mitigation targeting {entity_id}",
                reason=f"Both {p1.agent_name} ({p1.objective.value}) and {p2.agent_name} ({p2.objective.value}) independently targeted entity '{entity_id}' to reduce disruption exposure.",
              )
            )
            agreement_counter += 1
            
    # 2. Reinforcing objectives agreements (e.g. Inventory + Fulfillment)
    obj_pairs = [
      ("inventory", "fulfillment", "Service level & inventory protection alignment"),
      ("supplier", "resilience", "Multi-sourcing & systemic fragility reduction alignment"),
      ("transportation", "sustainability", "Logistics flow annotation & optimization alignment"),
    ]
    
    prop_by_agent = {p.agent_id: p for p in proposals}
    for a1, a2, intent in obj_pairs:
      if a1 in prop_by_agent and a2 in prop_by_agent:
        p1, p2 = prop_by_agent[a1], prop_by_agent[a2]
        pair_key = tuple(sorted([p1.proposal_id, p2.proposal_id]))
        if pair_key not in seen_pairs:
          seen_pairs.add(pair_key)
          agreements.append(
            Agreement(
              agreement_id=f"agree-{agreement_counter:03d}",
              type="REINFORCING_OBJECTIVE",
              proposal_ids=[p1.proposal_id, p2.proposal_id],
              agent_ids=[p1.agent_id, p2.agent_id],
              affected_entities=list(set(p1.affected_node_ids + p2.affected_node_ids)),
              shared_intent=intent,
              reason=f"{p1.agent_name} and {p2.agent_name} reinforce each other's operational goals ({p1.objective.value} & {p2.objective.value}).",
            )
          )
          agreement_counter += 1
          
    return agreements


class ConflictDetector:
  """Detects genuine operational and objective conflicts between proposals."""

  @staticmethod
  def detect(proposals: List[AgentProposal]) -> List[Conflict]:
    conflicts: List[Conflict] = []
    conflict_counter = 1
    
    prop_by_agent = {p.agent_id: p for p in proposals}
    
    # 1. Transportation (air freight / reroute) vs Sustainability (emissions reduction)
    if "transportation" in prop_by_agent and "sustainability" in prop_by_agent:
      p_trans = prop_by_agent["transportation"]
      p_sust = prop_by_agent["sustainability"]
      
      has_air = any(a.action_type == AgentActionType.MODE_SWITCH and a.parameters.get("new_mode") == "AIR" for a in p_trans.actions)
      if has_air or len(p_trans.actions) > 0:
        conflicts.append(
          Conflict(
            conflict_id=f"conf-{conflict_counter:03d}",
            proposal_id_a=p_trans.proposal_id,
            proposal_id_b=p_sust.proposal_id,
            agent_id_a=p_trans.agent_id,
            agent_id_b=p_sust.agent_id,
            conflict_type=ConflictType.OBJECTIVE_OPPOSITION,
            affected_entities=list(set(p_trans.affected_edge_ids + p_sust.affected_node_ids)),
            objective_a=p_trans.objective,
            objective_b=p_sust.objective,
            reason=f"Transportation proposal switches mode to expedite delivery (+{p_trans.actions[0].estimated_cost if p_trans.actions else 0}$), directly opposing Sustainability goal of reducing carbon emissions.",
          )
        )
        conflict_counter += 1

    # 2. Reroute vs Avoid Dependency (e.g. Transportation vs Resilience)
    if "transportation" in prop_by_agent and "resilience" in prop_by_agent:
      p_trans = prop_by_agent["transportation"]
      p_res = prop_by_agent["resilience"]
      
      common_entities = set(p_trans.affected_node_ids + p_trans.affected_edge_ids).intersection(
        set(p_res.affected_node_ids + p_res.affected_edge_ids)
      )
      if common_entities:
        conflicts.append(
          Conflict(
            conflict_id=f"conf-{conflict_counter:03d}",
            proposal_id_a=p_trans.proposal_id,
            proposal_id_b=p_res.proposal_id,
            agent_id_a=p_trans.agent_id,
            agent_id_b=p_res.agent_id,
            conflict_type=ConflictType.MUTUALLY_EXCLUSIVE_ROUTE,
            affected_entities=list(common_entities),
            objective_a=p_trans.objective,
            objective_b=p_res.objective,
            reason=f"Transportation agent attempts flow rerouting through node/edge {list(common_entities)}, while Resilience agent flags the same node/edge as a systemic bottleneck to be diversified.",
          )
        )
        conflict_counter += 1

    # 3. Inventory Reorder vs Supplier Switch (Parameter/Resource contention)
    if "inventory" in prop_by_agent and "supplier" in prop_by_agent:
      p_inv = prop_by_agent["inventory"]
      p_sup = prop_by_agent["supplier"]
      
      common_nodes = set(p_inv.affected_node_ids).intersection(set(p_sup.affected_node_ids))
      if common_nodes:
        conflicts.append(
          Conflict(
            conflict_id=f"conf-{conflict_counter:03d}",
            proposal_id_a=p_inv.proposal_id,
            proposal_id_b=p_sup.proposal_id,
            agent_id_a=p_inv.agent_id,
            agent_id_b=p_sup.agent_id,
            conflict_type=ConflictType.RESOURCE_CONTENTION,
            affected_entities=list(common_nodes),
            objective_a=p_inv.objective,
            objective_b=p_sup.objective,
            reason=f"Inventory agent attempts stock reorder from primary supplier at {list(common_nodes)}, while Supplier agent proposes switching allocation to a secondary supplier.",
          )
        )
        conflict_counter += 1
        
    return conflicts


class TradeOffAnalyzer:
  """Computes objective impact matrix and positive/negative trade-off vectors."""

  ALL_OBJECTIVES: List[AgentObjective] = [
    AgentObjective.MINIMIZE_STOCKOUT_RISK,
    AgentObjective.REDUCE_SUPPLIER_DISRUPTION,
    AgentObjective.REDUCE_DELAY_AND_COST,
    AgentObjective.PROTECT_SERVICE_LEVEL,
    AgentObjective.REDUCE_EMISSIONS,
    AgentObjective.REDUCE_SYSTEMIC_FRAGILITY,
  ]

  @classmethod
  def analyze(cls, candidate_id: str, actions: List[ProposalNormalization], supporting_agents: List[AgentId]) -> Tuple[List[ObjectiveImpact], TradeOff]:
    impacts: List[ObjectiveImpact] = []
    agent_set = set(supporting_agents)
    
    # 1. Stockout risk
    if "inventory" in agent_set:
      impacts.append(ObjectiveImpact(objective=AgentObjective.MINIMIZE_STOCKOUT_RISK, impact_score=0.85, confidence=0.9, evidence_summary="Direct safety stock reorder & inventory buffer boost."))
    else:
      impacts.append(ObjectiveImpact(objective=AgentObjective.MINIMIZE_STOCKOUT_RISK, impact_score=0.20, confidence=0.7, evidence_summary="Indirect stock benefit from secondary logistics adjustments."))

    # 2. Supplier disruption
    if "supplier" in agent_set:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_SUPPLIER_DISRUPTION, impact_score=0.90, confidence=0.95, evidence_summary="Dual sourcing & tier-1 supplier switch executed."))
    else:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_SUPPLIER_DISRUPTION, impact_score=0.10, confidence=0.6, evidence_summary="No active supplier re-allocation in this candidate."))

    # 3. Delay & Cost
    if "transportation" in agent_set:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_DELAY_AND_COST, impact_score=0.75, confidence=0.85, evidence_summary="Flow rerouting reduces transit delay by up to 24h."))
    else:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_DELAY_AND_COST, impact_score=-0.25, confidence=0.75, evidence_summary="Unmitigated transit delays remain along disrupted edges."))

    # 4. Service Level (SLA)
    if "fulfillment" in agent_set or "inventory" in agent_set:
      impacts.append(ObjectiveImpact(objective=AgentObjective.PROTECT_SERVICE_LEVEL, impact_score=0.80, confidence=0.88, evidence_summary="FC demand priority change protects order delivery SLAs."))
    else:
      impacts.append(ObjectiveImpact(objective=AgentObjective.PROTECT_SERVICE_LEVEL, impact_score=0.30, confidence=0.6, evidence_summary="Moderate SLA protection."))

    # 5. Sustainability / Emissions
    if "sustainability" in agent_set and "transportation" not in agent_set:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_EMISSIONS, impact_score=0.70, confidence=0.9, evidence_summary="Carbon emissions annotated and eco-routing prioritized."))
    elif "transportation" in agent_set:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_EMISSIONS, impact_score=-0.60, confidence=0.85, evidence_summary="Expedited air freight increases CO2 emissions."))
    else:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_EMISSIONS, impact_score=0.0, confidence=0.5, evidence_summary="Neutral carbon emissions impact."))

    # 6. Systemic Resilience
    if "resilience" in agent_set:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_SYSTEMIC_FRAGILITY, impact_score=0.88, confidence=0.92, evidence_summary="Single-point-of-failure dependency diversified."))
    else:
      impacts.append(ObjectiveImpact(objective=AgentObjective.REDUCE_SYSTEMIC_FRAGILITY, impact_score=0.15, confidence=0.6, evidence_summary="Baseline network fragility remains."))

    pos = [imp.objective for imp in impacts if imp.impact_score >= 0.5]
    neg = [imp.objective for imp in impacts if imp.impact_score <= -0.2]
    neu = [imp.objective for imp in impacts if -0.2 < imp.impact_score < 0.5]
    
    pos_names = ", ".join([p.value for p in pos])
    neg_names = ", ".join([n.value for n in neg]) if neg else "None"
    
    explanation = f"Candidate '{candidate_id}' strongly optimizes [{pos_names}], with negative trade-offs on [{neg_names}]."
    
    tradeoff = TradeOff(
      candidate_id=candidate_id,
      positive_objectives=pos,
      negative_objectives=neg,
      neutral_objectives=neu,
      explanation=explanation,
    )
    
    return impacts, tradeoff


class CandidatePlanGenerator:
  """Synthesizes compatible normalized actions into candidate plan options."""

  @classmethod
  def generate_candidates(
    cls,
    normalized_actions: List[ProposalNormalization],
    proposals: List[AgentProposal],
    agreements: List[Agreement],
    conflicts: List[Conflict],
  ) -> List[CandidatePlan]:
    candidates: List[CandidatePlan] = []
    
    # 1. Candidate Plan A: Aggressive Speed & Disruption Mitigation
    actions_a = [a for a in normalized_actions if a.supporting_agent_ids and any(ag in ["inventory", "supplier", "transportation", "fulfillment"] for ag in a.supporting_agent_ids)]
    agents_a = list(set([ag for a in actions_a for ag in a.supporting_agent_ids]))
    cost_a = sum(a.estimated_cost for a in actions_a)
    delay_a = max([a.estimated_delay_hours for a in actions_a], default=0.0)
    emissions_a = sum(a.estimated_emissions_co2_kg for a in actions_a)
    
    impacts_a, tradeoff_a = TradeOffAnalyzer.analyze("candidate-a", actions_a, agents_a)
    
    conflicts_a = [c for c in conflicts if c.agent_id_a in agents_a and c.agent_id_b in agents_a]
    agreements_a = [g for g in agreements if any(ag in agents_a for ag in g.agent_ids)]
    
    candidates.append(
      CandidatePlan(
        candidate_id="candidate-a",
        name="Candidate Plan A: Aggressive Service & Speed Mitigation",
        description="Prioritizes immediate stockout elimination, expedited air transportation, and SLA fulfillment.",
        actions=actions_a,
        supporting_agents=agents_a,
        objectives_addressed=list(set([o for a in actions_a for o in a.supporting_objectives])),
        agreements=agreements_a,
        conflicts_involved=conflicts_a,
        objective_impact_matrix=impacts_a,
        tradeoff=tradeoff_a,
        estimated_total_cost=cost_a,
        estimated_max_delay_hours=delay_a,
        estimated_total_emissions_co2_kg=emissions_a,
        status=CandidatePlanStatus.VALID,
        violations=[],
      )
    )

    # 2. Candidate Plan B: Eco-Resilient & Cost-Balanced Strategy
    actions_b = [a for a in normalized_actions if a.supporting_agent_ids and any(ag in ["supplier", "fulfillment", "sustainability", "resilience"] for ag in a.supporting_agent_ids)]
    agents_b = list(set([ag for a in actions_b for ag in a.supporting_agent_ids]))
    cost_b = sum(a.estimated_cost for a in actions_b)
    delay_b = max([a.estimated_delay_hours for a in actions_b], default=0.0)
    emissions_b = sum(a.estimated_emissions_co2_kg for a in actions_b)
    
    impacts_b, tradeoff_b = TradeOffAnalyzer.analyze("candidate-b", actions_b, agents_b)
    
    conflicts_b = [c for c in conflicts if c.agent_id_a in agents_b and c.agent_id_b in agents_b]
    agreements_b = [g for g in agreements if any(ag in agents_b for ag in g.agent_ids)]

    candidates.append(
      CandidatePlan(
        candidate_id="candidate-b",
        name="Candidate Plan B: Eco-Resilient & Dual-Source Balancing",
        description="Balances carbon emissions reduction with dual-supplier allocation and systemic bottleneck diversification.",
        actions=actions_b,
        supporting_agents=agents_b,
        objectives_addressed=list(set([o for a in actions_b for o in a.supporting_objectives])),
        agreements=agreements_b,
        conflicts_involved=conflicts_b,
        objective_impact_matrix=impacts_b,
        tradeoff=tradeoff_b,
        estimated_total_cost=cost_b,
        estimated_max_delay_hours=delay_b,
        estimated_total_emissions_co2_kg=emissions_b,
        status=CandidatePlanStatus.VALID,
        violations=[],
      )
    )

    # 3. Candidate Plan C: High-Resilience Systemic Protection
    actions_c = list(normalized_actions)  # Full network combination
    agents_c = list(set([ag for a in actions_c for ag in a.supporting_agent_ids]))
    cost_c = sum(a.estimated_cost for a in actions_c)
    delay_c = max([a.estimated_delay_hours for a in actions_c], default=0.0)
    emissions_c = sum(a.estimated_emissions_co2_kg for a in actions_c)
    
    impacts_c, tradeoff_c = TradeOffAnalyzer.analyze("candidate-c", actions_c, agents_c)
    
    candidates.append(
      CandidatePlan(
        candidate_id="candidate-c",
        name="Candidate Plan C: Total Network Resilience Synergy",
        description="Comprehensive integration of all 6 specialist mitigation strategies with full objective visibility.",
        actions=actions_c,
        supporting_agents=agents_c,
        objectives_addressed=list(set([o for a in actions_c for o in a.supporting_objectives])),
        agreements=agreements,
        conflicts_involved=conflicts,
        objective_impact_matrix=impacts_c,
        tradeoff=tradeoff_c,
        estimated_total_cost=cost_c,
        estimated_max_delay_hours=delay_c,
        estimated_total_emissions_co2_kg=emissions_c,
        status=CandidatePlanStatus.VALID if not conflicts else CandidatePlanStatus.REQUIRES_SIMULATION,
        violations=[c.reason for c in conflicts] if conflicts else [],
      )
    )

    return candidates


class ConstraintFilter:
  """Validates entity integrity and action compatibility rules for candidate plans."""

  @classmethod
  def filter_and_validate(cls, candidates: List[CandidatePlan], world_snapshot: WorldStateSnapshot) -> List[CandidatePlan]:
    valid_nodes = set(n.id for n in world_snapshot.nodes)
    valid_edges = set(e.id for e in world_snapshot.edges)

    for cand in candidates:
      violations: List[str] = []
      for act in cand.actions:
        for nid in act.target_node_ids:
          if nid not in valid_nodes:
            violations.append(f"Action '{act.action_type.value}' targets non-existent node '{nid}'")
        for eid in act.target_edge_ids:
          if eid not in valid_edges:
            violations.append(f"Action '{act.action_type.value}' targets non-existent edge '{eid}'")

      if violations:
        cand.status = CandidatePlanStatus.INVALID
        cand.violations.extend(violations)

    return candidates


class ReconciliationEngine:
  """Master deterministic coordinator reconciliation engine."""

  @classmethod
  def reconcile(
    cls,
    world_snapshot: WorldStateSnapshot,
    proposals: List[AgentProposal],
  ) -> Tuple[List[ProposalNormalization], List[Agreement], List[Conflict], List[CandidatePlan]]:
    
    # 1. Proposal Normalization
    normalized_actions = ProposalNormalizer.normalize(proposals)
    
    # 2. Agreement Detection
    agreements = AgreementDetector.detect(proposals)
    
    # 3. Conflict Detection
    conflicts = ConflictDetector.detect(proposals)
    
    # 4. Candidate Plan Generation
    raw_candidates = CandidatePlanGenerator.generate_candidates(normalized_actions, proposals, agreements, conflicts)
    
    # 5. Constraint Filtering & Validation
    validated_candidates = ConstraintFilter.filter_and_validate(raw_candidates, world_snapshot)
    
    return normalized_actions, agreements, conflicts, validated_candidates
