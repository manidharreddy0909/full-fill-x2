import { ApiResponse } from '../types/world';
import { getApiBaseUrl } from './config';
import {
  AgentId,
  AgentObjective,
  AgentActionType,
  AgentAction,
  AgentProposal,
  AgentResult,
  AgentMetadata,
  AllSpecialistProposalsResponse,
} from '../types/agent';

export type {
  AgentId,
  AgentObjective,
  AgentActionType,
  AgentAction,
  AgentProposal,
  AgentResult,
  AgentMetadata,
  AllSpecialistProposalsResponse,
};

export interface CoordinatorStatus {
  status: string;
  engine: string;
  version: string;
  supported_objectives: string[];
  safety_boundary: string;
}

export interface Agreement {
  agreement_id: string;
  type: string;
  proposal_ids: string[];
  agent_ids: string[];
  affected_entities: string[];
  shared_intent: string;
  reason: string;
}

export interface Conflict {
  conflict_id: string;
  proposal_id_a: string;
  proposal_id_b: string;
  agent_id_a: string;
  agent_id_b: string;
  conflict_type: string;
  affected_entities: string[];
  objective_a: string;
  objective_b: string;
  reason: string;
}

export interface ProposalNormalization {
  normalized_id: string;
  action_type: string;
  target_node_ids: string[];
  target_edge_ids: string[];
  parameters: Record<string, any>;
  source_proposal_ids: string[];
  supporting_agent_ids: string[];
  supporting_objectives: string[];
  estimated_cost: number;
  estimated_delay_hours: number;
  estimated_emissions_co2_kg: number;
}

export interface CandidatePlan {
  candidate_id: string;
  name: string;
  description: string;
  actions: ProposalNormalization[];
  supporting_agents: string[];
  objectives_addressed: string[];
  agreements: Agreement[];
  conflicts_involved: Conflict[];
  estimated_total_cost: number;
  estimated_max_delay_hours: number;
  estimated_total_emissions_co2_kg: number;
  status: string;
  violations: string[];
}

export interface CoordinatorResult {
  coordination_id: string;
  snapshot_id: string;
  timestamp: string;
  status: string;
  input_proposal_count: number;
  missing_agent_ids: string[];
  agreements: Agreement[];
  conflicts: Conflict[];
  candidate_plans: CandidatePlan[];
  summary: string;
  latency_ms: number;
  provider_used: string;
}

const getAgentsEndpoint = () => `${getApiBaseUrl()}/agents`;
const getCoordinatorEndpoint = () => `${getApiBaseUrl()}/coordinator`;

export async function fetchAgents(): Promise<AgentMetadata[]> {
  const response = await fetch(getAgentsEndpoint());
  if (!response.ok) {
    throw new Error(`Failed to fetch agents list: ${response.statusText}`);
  }
  const json: ApiResponse<AgentMetadata[]> = await response.json();
  return json.data;
}

export async function fetchAgentById(agentId: string): Promise<AgentMetadata> {
  const response = await fetch(`${getAgentsEndpoint()}/${agentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent metadata '${agentId}': ${response.statusText}`);
  }
  const json: ApiResponse<AgentMetadata> = await response.json();
  return json.data;
}

export async function runSingleAgent(agentId: string, targetNodeIds: string[] = []): Promise<AgentResult> {
  const response = await fetch(`${getAgentsEndpoint()}/${agentId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_node_ids: targetNodeIds }),
  });
  if (!response.ok) {
    throw new Error(`Failed to run agent '${agentId}': ${response.statusText}`);
  }
  const json: ApiResponse<AgentResult> = await response.json();
  return json.data;
}

export async function runAllSpecialists(targetNodeIds: string[] = []): Promise<AllSpecialistProposalsResponse> {
  const response = await fetch(`${getAgentsEndpoint()}/run-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_node_ids: targetNodeIds }),
  });
  if (!response.ok) {
    throw new Error(`Failed to run all specialist agents: ${response.statusText}`);
  }
  const json: ApiResponse<AllSpecialistProposalsResponse> = await response.json();
  return json.data;
}

export async function fetchCoordinatorStatus(): Promise<CoordinatorStatus> {
  const response = await fetch(`${getCoordinatorEndpoint()}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch coordinator status: ${response.statusText}`);
  }
  const json: ApiResponse<CoordinatorStatus> = await response.json();
  return json.data;
}

export async function runCoordinator(targetNodeIds: string[] = []): Promise<CoordinatorResult> {
  const response = await fetch(`${getCoordinatorEndpoint()}/run-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_node_ids: targetNodeIds }),
  });
  if (!response.ok) {
    throw new Error(`Failed to run coordinator reconciliation: ${response.statusText}`);
  }
  const json: ApiResponse<CoordinatorResult> = await response.json();
  return json.data;
}

export const runAgent = runSingleAgent;
export const runAllAgents = runAllSpecialists;
