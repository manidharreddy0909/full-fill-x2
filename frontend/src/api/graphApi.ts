/**
 * FULFILL-X Graph Neural Networks & Causal Intelligence API Client (Phase 7)
 */
import { getApiBaseUrl } from './config';
import {
  GraphSnapshot,
  GraphPrediction,
  PropagationTrace,
  CausalHypothesis,
  CounterfactualRequest,
  CounterfactualRun,
} from '../types/graph';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('fulfillx_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchGraphSnapshot(): Promise<GraphSnapshot> {
  const res = await fetch(`${getApiBaseUrl()}/graph/snapshot`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch graph snapshot');
  return res.json();
}

export async function fetchGNNPrediction(targetNodeId: string, horizonHours: number = 24): Promise<GraphPrediction> {
  const res = await fetch(`${getApiBaseUrl()}/gnn/predict?target_node_id=${targetNodeId}&horizon_hours=${horizonHours}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to execute GNN risk prediction');
  return res.json();
}

export async function fetchPropagationTrace(originNodeId: string, maxDepth: number = 4): Promise<PropagationTrace> {
  const res = await fetch(`${getApiBaseUrl()}/graph/propagate?origin_node_id=${originNodeId}&max_depth=${maxDepth}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to analyze disruption propagation');
  return res.json();
}

export async function fetchCausalHypotheses(originNodeId: string = 'sup-001'): Promise<CausalHypothesis[]> {
  const res = await fetch(`${getApiBaseUrl()}/causal/hypotheses?origin_node_id=${originNodeId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch causal hypotheses');
  return res.json();
}

export async function runCounterfactual(req: CounterfactualRequest): Promise<CounterfactualRun> {
  const res = await fetch(`${getApiBaseUrl()}/causal/counterfactual`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to execute counterfactual simulation');
  return res.json();
}
