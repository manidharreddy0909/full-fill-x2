/**
 * FULFILL-X Multi-Objective Planner TypeScript Definitions (Phase 08)
 * Matching backend/app/schemas/planner.py
 */

import { CandidatePlan } from './coordinator';
import { AdversaryReport } from './adversary';

export type ObjectiveDirection = 'MINIMIZE' | 'MAXIMIZE';

export type PlannerObjective =
  | 'MINIMIZE_STOCKOUT_RISK'
  | 'REDUCE_SUPPLIER_DISRUPTION'
  | 'REDUCE_DELAY_AND_COST'
  | 'PROTECT_SERVICE_LEVEL'
  | 'REDUCE_EMISSIONS'
  | 'REDUCE_SYSTEMIC_FRAGILITY'
  | 'SERVICE_RESILIENCE'
  | 'SUPPLY_RESILIENCE'
  | 'TRANSPORT_RESILIENCE'
  | 'INVENTORY_RESILIENCE'
  | 'COST_RESILIENCE'
  | 'EMISSIONS_RESILIENCE'
  | 'RECOVERY_RESILIENCE'
  | 'NETWORK_RESILIENCE';

export type ConstraintType =
  | 'MAX_COST'
  | 'MAX_DELAY'
  | 'MAX_EMISSIONS'
  | 'MIN_SERVICE_LEVEL'
  | 'MAX_STOCKOUT_RISK'
  | 'MAX_RECOVERY_TIME'
  | 'MIN_RESILIENCE'
  | 'CAPACITY_LIMIT'
  | 'ROUTE_AVAILABILITY'
  | 'SUPPLIER_CAPACITY';

export type FeasibilityStatus = 'FEASIBLE' | 'INFEASIBLE' | 'CONDITIONAL';

export type ParetoDominanceStatus =
  | 'DOMINATES'
  | 'DOMINATED'
  | 'NON_DOMINATED'
  | 'INCOMPARABLE';

export interface ObjectiveWeight {
  objective: PlannerObjective;
  weight: number;
}

export interface ObjectiveValue {
  objective: PlannerObjective;
  direction: ObjectiveDirection;
  raw_value: number;
  normalized_value: number;
  unit: string;
  source: string;
  explanation: string;
}

export interface ObjectiveVector {
  candidate_id: string;
  values: ObjectiveValue[];
}

export interface Constraint {
  constraint_id: string;
  type: ConstraintType;
  threshold_value: number;
  unit: string;
  description: string;
}

export interface ConstraintViolation {
  constraint_id: string;
  type: ConstraintType;
  actual_value: number;
  threshold_value: number;
  delta: number;
  severity: string;
}

export interface FeasibilityResult {
  status: FeasibilityStatus;
  violations: ConstraintViolation[];
  conditional_reasons: string[];
  evidence: string[];
}

export interface ParetoPoint {
  candidate_id: string;
  candidate_name: string;
  objective_vector: ObjectiveVector;
  feasibility: FeasibilityResult;
  dominance_status: ParetoDominanceStatus;
  dominated_by_ids: string[];
}

export interface ParetoFrontier {
  frontier_id: string;
  name: string;
  non_dominated_candidate_ids: string[];
  dominated_candidate_ids: string[];
  points: ParetoPoint[];
}

export interface RobustnessProfile {
  candidate_id: string;
  baseline_resilience_score: number;
  stressed_resilience_score: number;
  degradation_pct: number;
  recovery_time_days: number;
  vulnerability_count: number;
  critical_vulnerability_count: number;
}

export interface PlanSensitivityItem {
  parameter_name: string;
  weight_delta: number;
  new_non_dominated_ids: string[];
  is_frontier_altered: boolean;
  impact_summary: string;
}

export interface PlanEvaluation {
  candidate_id: string;
  candidate_name: string;
  objective_vector: ObjectiveVector;
  feasibility: FeasibilityResult;
  dominance_status: ParetoDominanceStatus;
  robustness_profile: RobustnessProfile;
  robust_dominance_status: ParetoDominanceStatus;
  tradeoff_summary: {
    key_advantages?: string[];
    key_drawbacks?: string[];
    [key: string]: any;
  };
}

export interface PlannerStatus {
  engine_version: string;
  status: string;
  supported_objectives: PlannerObjective[];
  supported_constraints: ConstraintType[];
}

export interface PlannerReport {
  report_id: string;
  coordination_id: string;
  adversary_report_id: string;
  timestamp: string;
  plan_evaluations: PlanEvaluation[];
  baseline_frontier: ParetoFrontier;
  robust_frontier: ParetoFrontier;
  sensitivity_analysis: PlanSensitivityItem[];
  recommended_candidates: string[];
  summary_narrative: string;
  latency_ms: number;
}
