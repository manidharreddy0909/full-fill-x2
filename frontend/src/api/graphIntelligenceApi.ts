import { getApiBaseUrl } from './config';

export interface GraphSnapshotNode {
  id: string;
  name: string;
  type: string;
  risk_score: number;
}

export interface GraphSnapshotEdge {
  id: string;
  source: string;
  target: string;
}

export interface GraphSnapshot {
  snapshot_id: string;
  timestamp: string;
  node_count: number;
  edge_count: number;
  nodes: GraphSnapshotNode[];
  edges: GraphSnapshotEdge[];
}

export interface GraphFeatures {
  timestamp: string;
  degree_centrality: Record<string, number>;
  betweenness_centrality: Record<string, number>;
  eigenvector_centrality: Record<string, number>;
  clustering_coefficients: Record<string, number>;
}

export interface GraphPrediction {
  target_node_id: string;
  horizon_hours: number;
  predicted_risk_score: number;
  confidence_lower_95: number;
  confidence_upper_95: number;
  top_risk_contributors: string[];
  embedding_vector_sample: number[];
}

export interface PropagationStep {
  step: number;
  node_id: string;
  node_name: string;
  cumulative_impact: number;
  time_offset_hours: number;
}

export interface PropagationTrace {
  origin_node_id: string;
  max_depth: number;
  total_affected_nodes: number;
  trajectory: PropagationStep[];
}

export interface CausalHypothesis {
  hypothesis_id: string;
  root_cause_node_id: string;
  target_effect_node_id: string;
  causal_impact_score: number;
  confidence: number;
  evidence_status: 'OBSERVED_ASSOCIATION' | 'HIGH_CONFIDENCE_HYPOTHESIS' | 'SANDBOX_COUNTERFACTUAL';
  description: string;
  assumptions: string[];
}

export interface CounterfactualRequest {
  target_node_id: string;
  do_action: string;
  parameters?: Record<string, any>;
}

export interface CounterfactualRun {
  run_id: string;
  target_node_id: string;
  do_action: string;
  original_risk_score: number;
  counterfactual_risk_score: number;
  delta_risk: number;
  retained_network_health: number;
}

export async function fetchGraphSnapshot(): Promise<GraphSnapshot> {
  const response = await fetch(`${getApiBaseUrl()}/graph/snapshot`);
  if (!response.ok) {
    throw new Error(`Failed to fetch graph snapshot: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchGraphFeatures(): Promise<GraphFeatures> {
  const response = await fetch(`${getApiBaseUrl()}/graph/features`);
  if (!response.ok) {
    throw new Error(`Failed to fetch graph features: ${response.statusText}`);
  }
  return await response.json();
}

export async function predictGnnNodeRisk(targetNodeId: string, horizonHours: number = 24): Promise<GraphPrediction> {
  const params = new URLSearchParams({
    target_node_id: targetNodeId,
    horizon_hours: horizonHours.toString(),
  });
  const response = await fetch(`${getApiBaseUrl()}/gnn/predict?${params.toString()}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to execute GNN prediction for node '${targetNodeId}': ${response.statusText}`);
  }
  return await response.json();
}

export async function analyzeGraphPropagation(originNodeId: string, maxDepth: number = 4): Promise<PropagationTrace> {
  const params = new URLSearchParams({
    origin_node_id: originNodeId,
    max_depth: maxDepth.toString(),
  });
  const response = await fetch(`${getApiBaseUrl()}/graph/propagate?${params.toString()}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to analyze graph propagation for node '${originNodeId}': ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchCausalHypotheses(originNodeId: string = 'sup-001'): Promise<CausalHypothesis[]> {
  const params = new URLSearchParams({ origin_node_id: originNodeId });
  const response = await fetch(`${getApiBaseUrl()}/causal/hypotheses?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch causal hypotheses: ${response.statusText}`);
  }
  return await response.json();
}

export async function runCounterfactualSimulation(req: CounterfactualRequest): Promise<CounterfactualRun> {
  const response = await fetch(`${getApiBaseUrl()}/causal/counterfactual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    throw new Error(`Failed to run counterfactual simulation: ${response.statusText}`);
  }
  return await response.json();
}
