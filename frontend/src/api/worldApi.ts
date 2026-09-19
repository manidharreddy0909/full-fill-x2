import { ApiResponse, WorldStateSnapshot, WorldSummary, WorldNode, WorldEdge } from '../types/world';
import { getApiBaseUrl } from './config';

const getEndpoint = () => `${getApiBaseUrl()}/world`;

export async function fetchWorldSnapshot(): Promise<WorldStateSnapshot> {
  const response = await fetch(`${getEndpoint()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch world snapshot: ${response.statusText}`);
  }
  const json: ApiResponse<WorldStateSnapshot> = await response.json();
  return json.data;
}

export async function fetchWorldSummary(): Promise<WorldSummary> {
  const response = await fetch(`${getEndpoint()}/summary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch world summary: ${response.statusText}`);
  }
  const json: ApiResponse<WorldSummary> = await response.json();
  return json.data;
}

export async function fetchNodeById(nodeId: string): Promise<WorldNode> {
  const response = await fetch(`${getEndpoint()}/nodes/${nodeId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch node '${nodeId}': ${response.statusText}`);
  }
  const json: ApiResponse<WorldNode> = await response.json();
  return json.data;
}

export async function fetchEdgeById(edgeId: string): Promise<WorldEdge> {
  const response = await fetch(`${getEndpoint()}/edges/${edgeId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch edge '${edgeId}': ${response.statusText}`);
  }
  const json: ApiResponse<WorldEdge> = await response.json();
  return json.data;
}

export async function seedWorld(preset: string = 'healthy', seed: number = 42): Promise<WorldStateSnapshot> {
  const response = await fetch(`${getEndpoint()}/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset, seed }),
  });
  if (!response.ok) {
    throw new Error(`Failed to seed world: ${response.statusText}`);
  }
  const json: ApiResponse<WorldStateSnapshot> = await response.json();
  return json.data;
}

export async function resetWorld(): Promise<WorldStateSnapshot> {
  const response = await fetch(`${getEndpoint()}/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to reset world: ${response.statusText}`);
  }
  const json: ApiResponse<WorldStateSnapshot> = await response.json();
  return json.data;
}
