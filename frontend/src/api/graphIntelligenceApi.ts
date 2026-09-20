/**
 * FULFILL-X Graph Neural Networks & Causal Intelligence API Forwarder
 * Re-exports verified backend API clients and types to eliminate contract mismatches.
 */
export * from '../types/graph';
export {
  fetchGraphSnapshot,
  fetchGNNPrediction as predictGnnNodeRisk,
  fetchPropagationTrace as analyzeGraphPropagation,
  fetchCausalHypotheses,
  runCounterfactual as runCounterfactualSimulation,
} from './graphApi';

import { getApiBaseUrl } from './config';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('fulfillx_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchGraphFeatures(): Promise<any> {
  const res = await fetch(`${getApiBaseUrl()}/graph/features`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch graph features');
  return res.json();
}
