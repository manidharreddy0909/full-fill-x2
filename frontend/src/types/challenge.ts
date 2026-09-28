/**
 * FULFILL-X Phase 4 Challenge Engine Types
 */

export type ChallengeScenarioType =
  | 'NORMAL_VARIATION'
  | 'BOUNDARY_TEST'
  | 'DEPENDENCY_FAILURE'
  | 'CAPACITY_DEGRADATION'
  | 'TOPOLOGY_CHANGE'
  | 'DEMAND_SURGE'
  | 'STALE_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'NOVEL_CONDITION';

export type ChallengeStatus = 'PLANNED' | 'RUNNING' | 'COMPLETED' | 'ABORTED';

export type ChallengeOutcomeStatus =
  | 'SURVIVED'
  | 'FAILED'
  | 'BOUNDARY_DISCOVERED'
  | 'INCONCLUSIVE'
  | 'UNKNOWN';

export type BoundaryStatus =
  | 'WITHIN_BOUNDARY'
  | 'BOUNDARY_BREACH'
  | 'NEW_BOUNDARY_REVEALED'
  | 'BOUNDARY_UNCERTAIN';

export interface ChallengeScenario {
  id: string;
  skill_id: string;
  skill_version: string;
  target_assumption: string;
  scenario_type: ChallengeScenarioType;
  baseline_world_state: Record<string, any>;
  perturbations: Record<string, any>;
  expected_skill_behavior: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_from: string;
  provenance: {
    source_type: string;
    is_simulation: boolean;
    recorded_by?: string;
    audit_notes?: string;
  };
  status: ChallengeStatus;
  created_at: string;
}

export interface CounterfactualComparison {
  comparison_id: string;
  scenario_id: string;
  skill_id: string;
  skill_version: string;
  skill_name: string;
  skill_action: Record<string, any>;
  skill_outcome: {
    strategy: string;
    action_type: string;
    success: boolean;
    service_level: number;
    recovery_hours: number;
    cost: number;
    boundary_violated?: boolean;
    [key: string]: any;
  };
  alternative_strategy_id: string;
  alternative_name: string;
  alternative_action: Record<string, any>;
  alternative_outcome: {
    strategy: string;
    action_type: string;
    action_description?: string;
    success: boolean;
    service_level: number;
    recovery_hours: number;
    cost: number;
    [key: string]: any;
  };
  delta_service_level: number;
  delta_recovery_hours: number;
  delta_cost: number;
  recommendation: string;
  provenance: {
    source_type: string;
    is_simulation: boolean;
    recorded_by?: string;
    audit_notes?: string;
  };
}

export interface ChallengeResult {
  challenge_id: string;
  skill_id: string;
  skill_version: string;
  scenario: ChallengeScenario;
  predicted_behavior: {
    applicable?: boolean;
    predicted_recovery_hours?: number;
    predicted_service_level?: number;
    uncertainty_zone?: string;
    [key: string]: any;
  };
  actual_simulated_behavior: {
    service_level?: number;
    recovery_hours?: number;
    cost?: number;
    success?: boolean;
    boundary_violated?: boolean;
    [key: string]: any;
  };
  prediction_error_hours?: number;
  prediction_error_pct?: number;
  boundary_status: BoundaryStatus;
  skill_survived: boolean;
  failure_detected: boolean;
  new_boundary_detected?: string;
  confidence_before: number;
  confidence_after: number;
  evidence: Array<Record<string, any>>;
  recommendation: string;
  outcome_status: ChallengeOutcomeStatus;
  provenance: {
    source_type: string;
    is_simulation: boolean;
    recorded_by?: string;
    audit_notes?: string;
  };
  counterfactual?: CounterfactualComparison;
  adaptive_governance: 'AUTO' | 'MONITOR' | 'APPROVAL' | 'BLOCK';
  retained_experience_id?: string;
  evolution_proposal_id?: string;
  executed_at: string;
}

export interface GradientProbeStep {
  step_index: number;
  parameter: string;
  value: number;
  skill_applicable: boolean;
  skill_survived: boolean;
  service_level: number;
  recovery_hours: number;
  boundary_breached: boolean;
  uncertainty: string;
}

export interface GradientProbeResult {
  probe_id: string;
  skill_id: string;
  skill_version: string;
  parameter: string;
  steps: GradientProbeStep[];
  transition_point?: number;
  discovered_boundary?: string;
  recommendation: string;
  provenance: {
    source_type: string;
    is_simulation: boolean;
  };
}

export interface ChallengeMetrics {
  challenge_count: number;
  challenge_success_rate: number;
  challenge_failure_rate: number;
  boundary_discoveries: number;
  unknown_scenarios: number;
  prediction_error_avg_hours: number;
  skill_versions_created: number;
  repeated_failures: number;
  avoided_failures: number;
  evidence_reuse: number;
  challenge_reuse: number;
}
