/**
 * FULFILL-X Coordinator Engine TypeScript Interfaces (Phase 06)
 * Matching backend/app/schemas/coordinator.py
 */

import { AgentId, AgentObjective, AgentActionType } from './agent';

export type ConflictType =
  | 'MUTUALLY_EXCLUSIVE_ROUTE'
  | 'RESOURCE_CONTENTION'
  | 'OBJECTIVE_OPPOSITION'
  | 'PARAMETER_MISMATCH'
  | 'POLICY_INCOMPATIBILITY';

export type CandidatePlanStatus =
  | 'VALID'
  | 'INVALID'
  | 'PARTIAL'
  | 'REQUIRES_SIMULATION';

export type CoordinatorResultStatus =
  | 'SUCCESS'
  | 'PARTIAL_PROPOSALS'
  | 'NO_PROPOSALS'
  | 'NO_VALID_CANDIDATES'
  | 'COORDINATION_ERROR';

export interface ProposalNormalization {
  normalized_id: string;
  action_type: AgentActionType;
  target_node_ids: string[];
  target_edge_ids: string[];
  parameters: Record<string, any>;
  source_proposal_ids: string[];
  supporting_agent_ids: AgentId[];
  supporting_objectives: AgentObjective[];
  estimated_cost: number;
  estimated_delay_hours: number;
  estimated_emissions_co2_kg: number;
}

export interface Agreement {
  agreement_id: string;
  type: string;
  proposal_ids: string[];
  agent_ids: AgentId[];
  affected_entities: string[];
  shared_intent: string;
  reason: string;
}

export interface Conflict {
  conflict_id: string;
  proposal_id_a: string;
  proposal_id_b: string;
  agent_id_a: AgentId;
  agent_id_b: AgentId;
  conflict_type: ConflictType;
  affected_entities: string[];
  objective_a: AgentObjective;
  objective_b: AgentObjective;
  reason: string;
}

export interface ObjectiveImpact {
  objective: AgentObjective;
  impact_score: number; // -1.0 to +1.0
  confidence: number;
  evidence_summary: string;
}

export interface TradeOff {
  candidate_id: string;
  positive_objectives: AgentObjective[];
  negative_objectives: AgentObjective[];
  neutral_objectives: AgentObjective[];
  explanation: string;
}

export interface CandidatePlan {
  candidate_id: string;
  name: string;
  description: string;
  actions: ProposalNormalization[];
  supporting_agents: AgentId[];
  objectives_addressed: AgentObjective[];
  agreements: Agreement[];
  conflicts_involved: Conflict[];
  objective_impact_matrix: ObjectiveImpact[];
  tradeoff: TradeOff;
  estimated_total_cost: number;
  estimated_max_delay_hours: number;
  estimated_total_emissions_co2_kg: number;
  status: CandidatePlanStatus;
  violations: string[];
}

export interface CoordinatorResult {
  coordination_id: string;
  snapshot_id: string;
  timestamp: string;
  status: CoordinatorResultStatus;
  input_proposal_count: number;
  missing_agent_ids: AgentId[];
  agreements: Agreement[];
  conflicts: Conflict[];
  candidate_plans: CandidatePlan[];
  summary: string;
  latency_ms: number;
  provider_used: string;
}
