/**
 * FULFILL-X Specialist Agent TypeScript Interfaces (Phase 05)
 * Matching backend/app/schemas/agent.py
 */

export type AgentId =
  | 'inventory'
  | 'supplier'
  | 'transportation'
  | 'fulfillment'
  | 'sustainability'
  | 'resilience'
  | 'coordinator'
  | 'adversary';

export type AgentObjective =
  | 'MINIMIZE_STOCKOUT_RISK'
  | 'REDUCE_SUPPLIER_DISRUPTION'
  | 'REDUCE_DELAY_AND_COST'
  | 'PROTECT_SERVICE_LEVEL'
  | 'REDUCE_EMISSIONS'
  | 'REDUCE_SYSTEMIC_FRAGILITY';

export type AgentResultStatus =
  | 'PROPOSED'
  | 'INFEASIBLE'
  | 'SIMULATION_REJECTED'
  | 'TIMEOUT'
  | 'AI_ERROR'
  | 'PARTIAL';

export type AgentActionType =
  | 'REORDER_STOCK'
  | 'STOCK_TRANSFER'
  | 'SUPPLIER_SWITCH'
  | 'DUAL_SOURCE_ALLOCATION'
  | 'REROUTE_FLOW'
  | 'MODE_SWITCH'
  | 'ORDER_PRIORITY_CHANGE'
  | 'FC_REALLOCATION'
  | 'EMISSIONS_ANNOTATION'
  | 'DIVERSIFY_DEPENDENCY';

export interface AgentAction {
  action_id: string;
  action_type: AgentActionType;
  target_node_id?: string | null;
  target_edge_id?: string | null;
  parameters: Record<string, any>;
  estimated_cost: number;
  estimated_delay_hours: number;
  estimated_emissions_co2_kg: number;
}

export interface AgentProposal {
  proposal_id: string;
  agent_id: AgentId;
  agent_name: string;
  objective: AgentObjective;
  summary: string;
  actions: AgentAction[];
  affected_node_ids: string[];
  affected_edge_ids: string[];
  expected_impacts: Record<string, any>;
  confidence: number;
  evidence_signal_ids: string[];
  reasoning_trace: string[];
  created_at: string;
}

export interface AgentResult {
  status: AgentResultStatus;
  agent_id: AgentId;
  proposal?: AgentProposal | null;
  violations: string[];
  latency_ms: number;
  provider_used: string;
}

export interface AgentMetadata {
  id: AgentId;
  name: string;
  color: str;
  objective: AgentObjective;
  description: string;
  allowed_action_types: AgentActionType[];
}

type str = string;

export interface AllSpecialistProposalsResponse {
  snapshot_id: str;
  timestamp: string;
  results: Record<string, AgentResult>;
  total_agents: number;
  successful_count: number;
}
