/**
 * FULFILL-X Predictive AI / ML Platform Frontend Types (Phase 6)
 */

export type MLTaskType = 'DEMAND_FORECASTING' | 'DISRUPTION_PROBABILITY' | 'ANOMALY_DETECTION';
export type ModelLifecycleStatus = 'TRAINED' | 'VALIDATED' | 'CANDIDATE' | 'ACTIVE' | 'RETIRED' | 'REJECTED';
export type DatasetGenerationMode = 'SYNTHETIC' | 'REPLAY' | 'LIVE';
export type DriftStatus = 'HEALTHY' | 'WARNING' | 'DRIFTED';
export type PredictionHorizon = '6h' | '12h' | '24h' | '48h' | '7d';

export interface UncertaintyEstimate {
  confidence: number;
  prediction_interval_lower?: number;
  prediction_interval_upper?: number;
  std_dev?: number;
  is_calibrated: boolean;
}

export interface FeatureExplanation {
  feature_name: string;
  importance: number;
  contribution_value: number;
  direction: 'INCREASE' | 'DECREASE';
}

export interface ModelMetadata {
  model_id: string;
  model_name: string;
  model_version: string;
  task_type: MLTaskType;
  algorithm: string;
  feature_schema_version: string;
  training_dataset_id: string;
  metrics: Record<string, number>;
  baseline_metrics: Record<string, number>;
  is_baseline_preferred: boolean;
  status: ModelLifecycleStatus;
  created_at: string;
  artifact_location: string;
  checksum: string;
  organization_id: string;
}

export interface Prediction {
  prediction_id: string;
  organization_id: string;
  model_id: string;
  model_version: string;
  task_type: MLTaskType;
  entity_id: string;
  generated_at: string;
  horizon: PredictionHorizon;
  predicted_value?: number;
  disruption_probability?: number;
  anomaly_score?: number;
  is_anomaly?: boolean;
  uncertainty: UncertaintyEstimate;
  explanations: FeatureExplanation[];
  human_explanation: string;
  feature_schema_version: string;
  provenance_id?: string;
}

export interface DriftReport {
  report_id: string;
  organization_id: string;
  model_id: string;
  model_version: string;
  feature_drift_scores: Record<string, number>;
  prediction_drift_score: number;
  overall_status: DriftStatus;
  evaluated_at: string;
}

export interface ModelCard {
  model_id: string;
  model_name: string;
  version: string;
  purpose: string;
  training_data_summary: string;
  features_used: string[];
  evaluation_metrics: Record<string, number>;
  limitations: string[];
  known_failure_modes: string[];
  prohibited_uses: string[];
  created_at: string;
  owner: string;
}

export interface TrainingJobConfig {
  organization_id?: string;
  task_type: MLTaskType;
  algorithm?: string;
  dataset_id?: string;
  random_seed?: number;
  hyperparameters?: Record<string, any>;
}

export interface TrainingJobSummary {
  job_id: string;
  organization_id: string;
  task_type: MLTaskType;
  status: string;
  started_at: string;
  completed_at?: string;
  trained_model_id?: string;
  metrics: Record<string, number>;
  error_message?: string;
}

export interface MLStatusSummary {
  status: string;
  organization_id: string;
  total_models: number;
  active_models: number;
  tasks_covered: string[];
}
