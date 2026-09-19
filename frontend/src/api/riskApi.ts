import { ApiResponse } from '../types/world';
import {
  Signal,
  SignalCreateRequest,
  RiskScoreMap,
  NodeRiskDetail,
} from '../types/risk';

import { getApiBaseUrl } from './config';

const getSignalsApi = () => `${getApiBaseUrl()}/signals`;
const getRisksApi = () => `${getApiBaseUrl()}/risks`;

export async function fetchSignals(status?: string, node_id?: string): Promise<Signal[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (node_id) params.append('node_id', node_id);
  const url = `${getSignalsApi()}${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch signals: ${response.statusText}`);
  }
  const json: ApiResponse<Signal[]> = await response.json();
  return json.data;
}

export async function injectSignal(signalData: SignalCreateRequest): Promise<Signal> {
  const response = await fetch(getSignalsApi(), {
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
  const response = await fetch(`${getSignalsApi()}/${signalId}/resolve`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error(`Failed to resolve signal '${signalId}': ${response.statusText}`);
  }
  const json: ApiResponse<Signal> = await response.json();
  return json.data;
}

export async function fetchRiskMap(): Promise<RiskScoreMap> {
  const response = await fetch(getRisksApi());
  if (!response.ok) {
    throw new Error(`Failed to fetch risk map: ${response.statusText}`);
  }
  const json: ApiResponse<RiskScoreMap> = await response.json();
  return json.data;
}

export async function fetchNodeRiskDetail(nodeId: string): Promise<NodeRiskDetail> {
  const response = await fetch(`${getRisksApi()}/nodes/${nodeId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch risk detail for node '${nodeId}': ${response.statusText}`);
  }
  const json: ApiResponse<NodeRiskDetail> = await response.json();
  return json.data;
}

export async function recalculateRisk(): Promise<RiskScoreMap> {
  const response = await fetch(`${getRisksApi()}/recalculate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to recalculate risk: ${response.statusText}`);
  }
  const json: ApiResponse<RiskScoreMap> = await response.json();
  return json.data;
}

export async function resetRisk(): Promise<RiskScoreMap> {
  const response = await fetch(`${getRisksApi()}/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to reset risk: ${response.statusText}`);
  }
  const json: ApiResponse<RiskScoreMap> = await response.json();
  return json.data;
}
