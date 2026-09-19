/**
 * FULFILL-X Evaluation & Benchmark Harness Types (Phase 12)
 */

export type EvaluationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface GroundTruth {
  scenario_id: string;
  expected_affected_nodes: string[];
  expected_risk_nodes: string[];
  expected_risk_dimensions: Record<string, number>;
  expected_disruption_type: string;
  expected_vulnerabilities: string[];
  expected_feasible_actions: string[];
  expected_infeasible_actions: string[];
  expected_constraint_violations: string[];
  expected_verification_result: string;
  expected_agreements: string[];
  expected_conflicts: string[];
}

export interface BenchmarkScenario {
  scenario_id: string;
  name: string;
  description: string;
  seed: number;
  initial_conditions: Record<string, any>;
  signals: Record<string, any>[];
  disruption: Record<string, any>;
  ground_truth: GroundTruth;
  expected_constraints: string[];
}

export interface MetricResult {
  metric_name: string;
  value: number;
  raw_counts: Record<string, any>;
  description: string;
  status: 'PASS' | 'WARN' | 'FAIL';
}

export interface EvaluationRun {
  run_id: string;
  benchmark_id: string;
  scenario_id: string;
  seed: number;
  started_at: string;
  completed_at?: string;
  status: EvaluationStatus;
  configuration: Record<string, any>;
  metrics: Record<string, MetricResult>;
  artifacts: Record<string, any>;
  error_message?: string;
}

export interface EvaluationSummary {
  overall_score: number;
  risk_detection: number;
  risk_localization: number;
  scenario_validity: number;
  agent_validity: number;
  coordination_quality: number;
  adversarial_coverage: number;
  plan_feasibility: number;
  plan_robustness: number;
  verification_accuracy: number;
  transparency_completeness: number;
  execution_time_seconds: number;
}

export interface EvaluationReport {
  report_id: string;
  benchmark_id: string;
  timestamp: string;
  configuration: Record<string, any>;
  scenarios_evaluated: number;
  summary: EvaluationSummary;
  runs: EvaluationRun[];
  metrics_detail: Record<string, MetricResult>;
  recommendations: string[];
}

export interface MetricDelta {
  metric: string;
  previous: number;
  current: number;
  delta: number;
  relative_change: number;
}

export interface BenchmarkComparison {
  baseline_run_id: string;
  target_run_id: string;
  compared_at: string;
  summary_deltas: Record<string, MetricDelta>;
  notes: string[];
}

export interface EvaluationStatusResponse {
  status: string;
  total_scenarios_registered: number;
  total_runs_executed: number;
  latest_report_id?: string;
  latest_overall_score?: number;
  recent_runs: EvaluationRun[];
}
