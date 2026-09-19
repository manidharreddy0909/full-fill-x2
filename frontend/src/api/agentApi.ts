import { ApiResponse } from '../types/world';
import {
  AgentMetadata,
  AgentResult,
  AllSpecialistProposalsResponse,
} from '../types/agent';
import { getApiBaseUrl } from './config';

const getAgentsApi = () => `${getApiBaseUrl()}/agents`;

export async function fetchAgents(): Promise<AgentMetadata[]> {
  const response = await fetch(getAgentsApi());
  if (!response.ok) {
    throw new Error(`Failed to fetch agents: ${response.statusText}`);
  }
  const json: ApiResponse<AgentMetadata[]> = await response.json();
  return json.data;
}

export async function fetchAgentById(agentId: string): Promise<AgentMetadata> {
  const response = await fetch(`${getAgentsApi()}/${agentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent '${agentId}': ${response.statusText}`);
  }
  const json: ApiResponse<AgentMetadata> = await response.json();
  return json.data;
}

export async function runAgent(agentId: string, targetNodeIds: string[] = []): Promise<AgentResult> {
  const response = await fetch(`${getAgentsApi()}/${agentId}/run`, {
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

export async function runAllAgents(targetNodeIds: string[] = []): Promise<AllSpecialistProposalsResponse> {
  const response = await fetch(`${getAgentsApi()}/run-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_node_ids: targetNodeIds }),
  });
  if (!response.ok) {
    throw new Error(`Failed to run all agents: ${response.statusText}`);
  }
  const json: ApiResponse<AllSpecialistProposalsResponse> = await response.json();
  return json.data;
}
