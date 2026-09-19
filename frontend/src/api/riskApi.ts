import { ApiResponse } from '../types/world';
import {
  Signal,
  SignalCreateRequest,
  RiskScoreMap,
  NodeRiskDetail,
} from '../types/risk';

const SIGNALS_API = 'http://localhost:8000/api/signals';
const RISKS_API = 'http://localhost:8000/api/risks';

export async function fetchSignals(status?: string, node_id?: string): Promise<Signal[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (node_id) params.append('node_id', node_id);
  const url = `${SIGNALS_API}${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch signals: ${response.statusText}`);
  }
  const json: ApiResponse<Signal[]> = await response.json();
  return json.data;
}

export async function injectSignal(signalData: SignalCreateRequest): Promise<Signal> {
  const response = await fetch(SIGNALS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signalData),
  });
  if (!response.ok) {
    throw new Error(`Failed to inject signal: ${response.statusText}`);
  }
  const json: ApiResponse<Signal> = await response.json();
  return json.data;
}

export async function resolveSignal(signalId: string): Promise<Signal> {
  const response = await fetch(`${SIGNALS_API}/${signalId}/resolve`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error(`Failed to resolve signal '${signalId}': ${response.statusText}`);
  }
  const json: ApiResponse<Signal> = await response.json();
  return json.data;
}

export async function fetchRiskMap(): Promise<RiskScoreMap> {
  const response = await fetch(RISKS_API);
  if (!response.ok) {
    throw new Error(`Failed to fetch risk map: ${response.statusText}`);
  }
  const json: ApiResponse<RiskScoreMap> = await response.json();
  return json.data;
}

export async function fetchNodeRiskDetail(nodeId: string): Promise<NodeRiskDetail> {
  const response = await fetch(`${RISKS_API}/nodes/${nodeId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch risk detail for node '${nodeId}': ${response.statusText}`);
  }
  const json: ApiResponse<NodeRiskDetail> = await response.json();
  return json.data;
}

export async function recalculateRisk(): Promise<RiskScoreMap> {
  const response = await fetch(`${RISKS_API}/recalculate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to recalculate risk: ${response.statusText}`);
  }
  const json: ApiResponse<RiskScoreMap> = await response.json();
  return json.data;
}

export async function resetRisk(): Promise<RiskScoreMap> {
  const response = await fetch(`${RISKS_API}/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to reset risk: ${response.statusText}`);
  }
  const json: ApiResponse<RiskScoreMap> = await response.json();
  return json.data;
}
