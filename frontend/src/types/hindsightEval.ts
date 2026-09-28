/**
 * FULFILL-X Phase 5: Hindsight Learning Evaluation TypeScript Types
 * Memoryless Agent vs Hindsight-Enabled Agent A/B Evaluation
 */

export type AgentMode = 'MEMORYLESS' | 'HINDSIGHT';

export type EvaluationScenarioType =
  | 'BASELINE'
  | 'RELATED'
  | 'TRANSFER'
  | 'BOUNDARY'
  | 'NOVEL'
  | 'CONTRADICTORY'
  | 'STALE'
  | 'DEGRADATION'
  | 'DEMAND_SURGE'
  | 'DEPENDENCY_FAILURE'
  | 'TOPOLOGY_CHANGE';

export interface CausalAttribution {
  memory_recalled: boolean;
  evidence_used: boolean;
  boundary_influenced: boolean;
  skill_influenced: boolean;
  decision_changed: boolean;
  outcome_improved: boolean;
  recalled_experience_ids: string[];
  evidence_summary: string;
}

export interface EpisodeTrace {
  episode_index: number;
  scenario_id: string;
  scenario_type: EvaluationScenarioType;
  agent_mode: AgentMode;
  observed_state: Record<string, any>;
  recalled_experiences: string[];
  relevant_evidence: Array<Record<string, any>>;
  genome_status?: string | null;
  selected_skill?: string | null;
  transfer_assessment?: string | null; // TRANSFERABLE | PARTIAL | NON_TRANSFERABLE | UNKNOWN
  decision: string;
  decision_rationale: string;
  predicted_outcome: Record<string, any>;
  simulated_outcome: Record<string, any>;
  prediction_error_hours: number;
  prediction_error_pct: number;
  success: boolean;
  unsafe_action: boolean;
  repeated_mistake: boolean;
  unknown_detected: boolean;
  boundary_avoided: boolean;
  attribution: CausalAttribution;
  executed_at: string;
}

export interface LearningCurvePoint {
  episode: number;
  cumulative_success_rate: number;
  cumulative_mistake_rate: number;
  cumulative_unsafe_rate: number;
  avg_prediction_error: number;
}

export interface ExperimentMetrics {
  agent_mode: AgentMode;
  total_episodes: number;
  success_count: number;
  recovery_success_rate: number;
  repeated_mistake_count: number;
  repeated_mistake_rate: number;
  unsafe_action_count: number;
  unsafe_action_rate: number;
  evidence_reuse_count: number;
  evidence_reuse_rate: number;
  unknown_detection_count: number;
  unknown_detection_rate: number;
  boundary_avoidance_count: number;
  boundary_avoidance_rate: number;
  transfer_accuracy_rate: number;
  avg_prediction_error_hours: number;
  early_episode_success_rate: number;
  late_episode_success_rate: number;
  learning_gain: number;
}

export interface EvaluationExperimentReport {
  experiment_id: string;
  title: string;
  created_at: string;
  scenario_count: number;
  seed: number;
  memoryless_metrics: ExperimentMetrics;
  hindsight_metrics: ExperimentMetrics;
  learning_curves_memoryless: LearningCurvePoint[];
  learning_curves_hindsight: LearningCurvePoint[];
  episodes_memoryless: EpisodeTrace[];
  episodes_hindsight: EpisodeTrace[];
  statistical_summary: Record<string, any>;
  hindsight_dependency_verified: boolean;
  hindsight_advantage_summary: string;
}
