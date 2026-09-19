export type SimulationHorizon = '6h' | '12h' | '24h' | '48h' | '72h' | '7d' | '14d' | '30d';

export type DisruptionType =
  | 'SUPPLIER_OUTAGE'
  | 'PORT_CONGESTION'
  | 'PORT_CLOSURE'
  | 'WAREHOUSE_OUTAGE'
  | 'FC_CAPACITY_REDUCTION'
  | 'TRANSPORT_DELAY'
  | 'ROUTE_FAILURE'
  | 'DEMAND_SURGE'
  | 'INVENTORY_SHRINKAGE'
  | 'WEATHER_DISRUPTION'
  | 'EARTHQUAKE'
  | 'COMPOUND';

export interface DisruptionEvent {
  event_id: string;
  target: string;
  start_time: number;
  duration: number;
  severity: number;
  capacity_multiplier: number;
  probability: number;
  source: string;
  type: DisruptionType;
}

export interface ScenarioConfig {
  scenario_id: string;
  name: string;
  description?: string;
  events: DisruptionEvent[];
  demand_shock_pct: number;
  recovery_delay_multiplier: number;
  seed: number;
}

export interface Percentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface ResilienceMetrics {
  service_level_dist: Percentiles;
  cost_dist: Percentiles;
  recovery_time_dist: Percentiles;
  backlog_dist: Percentiles;
  affected_nodes_dist: Percentiles;
  service_resilience: number;
  recovery_resilience: number;
  cost_resilience: number;
  network_resilience: number;
  customer_resilience: number;
  inventory_resilience: number;
  transportation_resilience: number;
  compound_resilience: number;
  resilience_score: number;
  stockout_probability: number;
  cvar_cost_95: number;
  var_cost_95: number;
  ttr_p90: number;
  ttf_median?: number | null;
  weights_used: Record<string, number>;
}

export interface ResilienceCurvePoint {
  step_hour: number;
  service_level: number;
  inventory_level: number;
  backlog: number;
  risk_score: number;
  disrupted_count: number;
}

export interface ResilienceCurve {
  points: ResilienceCurvePoint[];
}

export interface MonteCarloConfig {
  scenario_id: string;
  n_simulations: number;
  seed: number;
  horizon: SimulationHorizon;
  max_workers: number;
}

export interface SimulationStepOutcome {
  step: number;
  fulfilled_demand: number;
  total_demand: number;
  service_level: number;
  backlog: number;
  active_disruptions_count: number;
  capacity_utilization: number;
  total_cost: number;
  node_disruptions: Record<string, number>;
}

export interface SimulationRunResult {
  run_id: string;
  twin_id: string;
  scenario_id: string;
  seed: number;
  horizon_hours: number;
  step_outcomes: SimulationStepOutcome[];
  overall_service_level: number;
  total_backlog: number;
  total_cost: number;
  recovery_time_hours: number;
  time_to_failure_hours?: number | null;
  max_disrupted_nodes: number;
  stockout_occurred: boolean;
}

export interface MonteCarloResult {
  mc_id: string;
  twin_id: string;
  scenario_id: string;
  n_simulations: number;
  seed: number;
  horizon_hours: number;
  execution_time_sec: number;
  metrics: ResilienceMetrics;
  resilience_curve: ResilienceCurve;
  runs: SimulationRunResult[];
}

export interface CriticalityResult {
  node_id: string;
  node_name: string;
  node_type: string;
  failure_probability: number;
  expected_downstream_impact: number;
  service_impact: number;
  cost_impact: number;
  propagation_depth: number;
  downstream_customers: number;
  criticality_rank: number;
  criticality_score: number;
}

export interface StrategyMetricSummary {
  strategy_id: string;
  name: string;
  service_p10: number;
  service_p50: number;
  service_p90: number;
  cost_p90: number;
  ttr_p90: number;
  cvar_95: number;
  stockout_prob: number;
  threshold_breach_prob: number;
  robustness_score: number;
}

export interface StrategyComparisonResult {
  comparison_id: string;
  baseline: StrategyMetricSummary;
  candidates: StrategyMetricSummary[];
  recommended_strategy_id: string;
  trade_offs: Record<string, string>;
  created_at: string;
}

export interface TwinStatus {
  status: string;
  active_twins: number;
  engine_version: string;
  mode: string;
}
