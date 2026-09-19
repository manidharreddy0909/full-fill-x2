/**
 * FULFILL-X Multi-Agent Resilience & Continuous Learning Types (Phase 9)
 */

export type MemoryType = 'CASE' | 'DECISION' | 'OUTCOME' | 'FAILURE' | 'SUCCESS' | 'CONSTRAINT' | 'PATTERN' | 'LESSON';
export type MemoryStatus = 'PROPOSED' | 'VALIDATED' | 'REJECTED' | 'EXPIRED' | 'SUPERSEDED';
export type ConsensusStatus = 'UNANIMOUS' | 'SUPERMAJORITY' | 'DISAGREEMENT' | 'REJECTED_BY_VERIFICATION';
export type FeedbackType = 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT';
export type ChallengerStatus = 'CANDIDATE' | 'PROMOTED' | 'REJECTED' | 'ARCHIVED' | 'ROLLED_BACK';

export interface AgentMemory {
  memory_id: string;
  organization_id: string;
  agent_id: string;
  memory_type: MemoryType;
  lesson: string;
  event_reference?: string;
  confidence: number;
  decay_factor: number;
  provenance_links: string[];
  status: MemoryStatus;
  created_at: string;
}

export interface AgentPerformanceRecord {
  agent_id: string;
  proposals_count: number;
  survival_rate: number;
  avg_confidence: number;
  calibration_mae: number;
  last_updated: string;
}

export interface AgentDebateMessage {
  round_number: number;
  agent_id: string;
  argument: string;
  counter_argument?: string;
  evidence_citations: string[];
  proposed_action?: string;
  confidence: number;
  timestamp: string;
}

export interface DeliberationRound {
  round_number: number;
  messages: AgentDebateMessage[];
  round_consensus: boolean;
}

export interface DecisionEvidenceBundle {
  bundle_id: string;
  primary_hypothesis: string;
  world_model_snapshot_id: string;
  monte_carlo_resilience_score: number;
  adversary_counter_findings: string[];
  verification_passed: boolean;
  provenance_trace: string[];
}

export interface DeliberationSession {
  deliberation_id: string;
  organization_id: string;
  target_node_ids: string[];
  rounds: DeliberationRound[];
  consensus_status: ConsensusStatus;
  final_decision?: string;
  evidence_bundle: DecisionEvidenceBundle;
  created_at: string;
}

export interface OutcomeRecord {
  outcome_id: string;
  organization_id: string;
  decision_id: string;
  expected_service_level: number;
  actual_service_level: number;
  expected_cost: number;
  actual_cost: number;
  expected_recovery_hours: number;
  actual_recovery_hours: number;
  deviation_service_level: number;
  deviation_cost: number;
  deviation_recovery_hours: number;
  recorded_at: string;
}

export interface FeedbackRecord {
  feedback_id: string;
  organization_id: string;
  outcome_id: string;
  agent_id: string;
  feedback_type: FeedbackType;
  accuracy_score: number;
  comments: string;
  created_at: string;
}

export interface LearningExample {
  example_id: string;
  features: Record<string, any>;
  prediction: number;
  actual: number;
  error: number;
  data_origin: string;
}

export interface LearningDataset {
  dataset_id: string;
  organization_id: string;
  name: string;
  version: string;
  record_count: number;
  checksum: string;
  data_origin: string;
  created_at: string;
}

export interface LearningRunResult {
  run_id: string;
  dataset_id: string;
  model_name: string;
  train_mae: number;
  val_mae: number;
  train_rmse: number;
  val_rmse: number;
  baseline_mae: number;
  is_improvement: boolean;
  execution_time_sec: number;
}

export interface ChallengerModelRecord {
  challenger_id: string;
  organization_id: string;
  model_name: string;
  version: string;
  active_model_id: string;
  baseline_metric: number;
  challenger_metric: number;
  status: ChallengerStatus;
  checksum: string;
  artifact_path: string;
  activation_reason?: string;
  approved_by?: string;
  created_at: string;
}

export interface PolicyEvaluationRecord {
  evaluation_id: string;
  situation: Record<string, any>;
  candidate_actions: Record<string, any>[];
  simulated_service_level: number;
  observed_service_level: number;
  robustness_score: number;
  validated_at: string;
}
