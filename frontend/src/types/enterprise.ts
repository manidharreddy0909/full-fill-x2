/**
 * FULFILL-X Enterprise & Resilience OS Types (Phase 10)
 */

export type WorkspaceType = 'PRODUCTION' | 'SIMULATION' | 'SANDBOX';
export type PolicyViolationAction = 'PASS' | 'WARN' | 'BLOCK';
export type ExecutionMode = 'DRY_RUN' | 'SIMULATED' | 'LIVE';
export type ExecutionStatus = 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type SystemOperationalMode = 'FULL' | 'DEGRADED_AI' | 'DEGRADED_DATA' | 'DEGRADED_REALTIME' | 'OFFLINE' | 'SAFE_MODE';

export type CycleStage =
  | 'IDLE'
  | 'OBSERVING'
  | 'INTELLIGENCE_READY'
  | 'RISK_ASSESSMENT'
  | 'SCENARIO_GENERATION'
  | 'SIMULATION'
  | 'AGENT_DELIBERATION'
  | 'ADVERSARIAL_TEST'
  | 'PLAN_OPTIMIZATION'
  | 'VERIFICATION'
  | 'HUMAN_APPROVAL'
  | 'EXECUTION_READY'
  | 'EXECUTING'
  | 'OUTCOME_CAPTURE'
  | 'LEARNING'
  | 'COMPLETE'
  | 'FAILED';

export interface ResilienceScorecard {
  overall_resilience: number;
  service_resilience: number;
  recovery_resilience: number;
  cost_resilience: number;
  supplier_resilience: number;
  transportation_resilience: number;
  inventory_resilience: number;
  infrastructure_resilience: number;
  adversarial_resilience: number;
  prediction_confidence: number;
  data_quality_score: number;
  calculated_at: string;
}

export interface ExecutiveDecisionRecord {
  record_id: string;
  organization_id: string;
  workspace_id: string;
  decision_id: string;
  summary: string;
  problem_statement: string;
  detected_signals_count: number;
  risk_level: string;
  affected_nodes: string[];
  simulation_resilience_score: number;
  consensus_status: string;
  adversary_findings: string[];
  verification_passed: boolean;
  policy_evaluation_status: string;
  authorized_by: string;
  execution_mode: string;
  expected_sla: number;
  created_at: string;
}

export interface ResilienceCycleStatus {
  cycle_id: string;
  organization_id: string;
  workspace_id: string;
  environment_id: string;
  stage: CycleStage;
  started_at: string;
  completed_at?: string;
  scorecard: ResilienceScorecard;
  executive_record?: ExecutiveDecisionRecord;
}

export interface PolicyEvaluationDetail {
  policy_name: string;
  policy_type: string;
  threshold_value: number;
  observed_value: number;
  status: PolicyViolationAction;
  explanation: string;
}

export interface PolicyEvaluationResult {
  decision_id: string;
  organization_id: string;
  workspace_id: string;
  overall_status: PolicyViolationAction;
  evaluations: PolicyEvaluationDetail[];
  evaluated_at: string;
}

export interface ExecutionResult {
  execution_id: string;
  decision_id: string;
  organization_id: string;
  workspace_id: string;
  execution_mode: ExecutionMode;
  status: ExecutionStatus;
  authorized_by: string;
  result_summary: string;
  started_at: string;
  completed_at: string;
}

export interface SystemHealthStatus {
  mode: SystemOperationalMode;
  is_ai_healthy: boolean;
  is_data_healthy: boolean;
  is_realtime_healthy: boolean;
  active_faults: string[];
  last_updated: string;
}

export interface ModelCard {
  model_id: string;
  model_name: string;
  version: string;
  status: string;
  dataset_version: string;
  checksum: string;
  author: string;
  training_origin: string;
  evaluation_metrics: Record<string, number>;
  intended_use: string;
  known_limitations: string[];
  approval_record: Record<string, any>;
  created_at: string;
}
