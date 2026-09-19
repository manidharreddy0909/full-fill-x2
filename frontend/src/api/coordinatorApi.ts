import { ApiResponse } from '../types/world';
import { AgentProposal } from '../types/agent';
import { CoordinatorResult } from '../types/coordinator';

const COORDINATOR_API = 'http://localhost:8000/api/coordinator';

export async function fetchCoordinatorStatus(): Promise<Record<string, any>> {
  const response = await fetch(`${COORDINATOR_API}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch coordinator status: ${response.statusText}`);
  }
  const json: ApiResponse<Record<string, any>> = await response.json();
  return json.data;
}

export async function runCoordinator(
  proposals?: AgentProposal[],
  targetNodeIds: string[] = []
): Promise<CoordinatorResult> {
  const response = await fetch(`${COORDINATOR_API}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_node_ids: targetNodeIds,
      proposals: proposals || null,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to run coordinator: ${response.statusText}`);
  }
  const json: ApiResponse<CoordinatorResult> = await response.json();
  return json.data;
}

export async function runAllWithCoordinator(
  targetNodeIds: string[] = []
): Promise<CoordinatorResult> {
  const response = await fetch(`${COORDINATOR_API}/run-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_node_ids: targetNodeIds }),
  });
  if (!response.ok) {
    throw new Error(`Failed to execute end-to-end coordinator: ${response.statusText}`);
  }
  const json: ApiResponse<CoordinatorResult> = await response.json();
  return json.data;
}
