/**
 * FULFILL-X Phase 7 — Graph Neural Networks & Causal Intelligence Frontend Types
 */

export interface GraphNode {
  id: string;
  type: string;
  organization_id: string;
  operational_status: string;
  capacity: number;
  utilization: number;
  throughput: number;
  backlog: number;
  inventory_count: number;
  lead_time_hours: number;
  current_risk: number;
  is_disrupted: boolean;
  attributes: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  organization_id: string;
  transit_time_hours: number;
  route_capacity: number;
  current_utilization: number;
  current_risk: number;
  is_disrupted: boolean;
  attributes: Record<string, any>;
}

export interface GraphSnapshot {
  snapshot_id: string;
  world_seed: number;
  timestamp: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  node_count: number;
  edge_count: number;
  graph_version: string;
  organization_id: string;
}

export interface GraphPrediction {
  prediction_id: string;
  task_type: string;
  target_id: string;
  predicted_risk: number;
  horizon_hours: number;
  lower_bound_95: number;
  upper_bound_95: number;
  model_id: string;
  model_version: string;
  baseline_metric: number;
  gnn_metric: number;
  is_gnn_preferred: boolean;
  evidence_narrative: string[];
  created_at: number;
}

export interface GraphPath {
  path_nodes: string[];
  path_edges: string[];
  path_probability: number;
  cumulative_risk: number;
  total_transit_time_hours: number;
}

export interface PropagationTrace {
  trace_id: string;
  origin_node_id: string;
  depth: number;
  propagation_probability: number;
  affected_nodes: string[];
  affected_edges: string[];
  primary_path: GraphPath;
  secondary_paths: GraphPath[];
  expected_impact: string;
  confidence: number;
  evidence_narratives: string[];
  created_at: number;
}

export interface CausalEvidence {
  observation_type: string;
  source_entity: string;
  target_entity: string;
  metric_name: string;
  observed_value: number;
  timestamp: number;
  support_score: number;
}

export interface CausalHypothesis {
  hypothesis_id: string;
  cause_node_id: string;
  effect_node_id: string;
  propagation_path: string[];
  evidence: CausalEvidence[];
  confidence: number;
  causal_status: string;
  assumptions: string[];
  counterfactual_delta: Record<string, number>;
  created_at: number;
  model_version: string;
}

export interface CounterfactualRequest {
  target_node_id: string;
  parameter_overrides: Record<string, number>;
  horizon_hours?: number;
}

export interface CounterfactualRun {
  run_id: string;
  target_node_id: string;
  parameter_overrides: Record<string, number>;
  baseline_network_risk: number;
  counterfactual_network_risk: number;
  risk_delta: number;
  baseline_service_level: number;
  counterfactual_service_level: number;
  service_delta: number;
  cost_delta: number;
  affected_nodes: string[];
  affected_paths: string[][];
  execution_time_ms: number;
  created_at: number;
}
