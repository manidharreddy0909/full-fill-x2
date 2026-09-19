/**
 * FULFILL-X Adversary TypeScript Definitions (Phase 07)
 * Matching backend/app/schemas/adversary.py
 */

import { CandidatePlan } from './coordinator';

export type AttackType =
  | 'SUPPLIER_FAILURE'
  | 'SUPPLIER_CAPACITY_REDUCTION'
  | 'PORT_CLOSURE'
  | 'PORT_CONGESTION'
  | 'TRANSPORT_DELAY'
  | 'TRANSPORT_MODE_FAILURE'
  | 'WAREHOUSE_CAPACITY_REDUCTION'
  | 'FULFILLMENT_CENTER_FAILURE'
  | 'DEMAND_SPIKE'
  | 'INVENTORY_SHOCK'
  | 'MULTI_NODE_FAILURE'
  | 'COMPOUND_DISRUPTION';

export type AttackSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ResilienceDimension =
  | 'SERVICE_RESILIENCE'
  | 'SUPPLY_RESILIENCE'
  | 'TRANSPORT_RESILIENCE'
  | 'INVENTORY_RESILIENCE'
  | 'COST_RESILIENCE'
  | 'EMISSIONS_RESILIENCE'
  | 'RECOVERY_RESILIENCE'
  | 'NETWORK_RESILIENCE';

export type VulnerabilityType =
  | 'SINGLE_SOURCE_DEPENDENCY'
  | 'BOTTLENECK_DEPENDENCY'
  | 'CAPACITY_FRAGILITY'
  | 'ROUTE_FRAGILITY'
  | 'INVENTORY_FRAGILITY'
  | 'RECOVERY_FRAGILITY'
  | 'OBJECTIVE_FRAGILITY'
  | 'COMPOUND_FAILURE';

export interface AttackTarget {
  entity_id: string;
  entity_type: string;
  entity_name: string;
  current_capacity: number;
  risk_score: number;
}

export interface AttackAssumption {
  assumption_id: string;
  candidate_id: string;
  description: string;
  tested_attack_type: AttackType;
  is_invalidated: boolean;
  evidence: string;
}

export interface AdversaryAttack {
  attack_id: string;
  attack_type: AttackType;
  severity: AttackSeverity;
  targets: AttackTarget[];
  duration_days: number;
  capacity_loss_pct: number;
  cost_multiplier: number;
  delay_hours: number;
  assumptions_attacked: AttackAssumption[];
  description: string;
}

export interface DegradationMetric {
  metric_name: string;
  baseline_val: number;
  stressed_val: number;
  delta_pct: number;
  unit: string;
}

export interface ResilienceScore {
  dimension: ResilienceDimension;
  score: number;
  baseline_score: number;
  delta: number;
  explanation: string;
  evidence: string[];
}

export interface Vulnerability {
  vulnerability_id: string;
  type: VulnerabilityType;
  severity: AttackSeverity;
  title: string;
  affected_entities: string[];
  affected_candidate_ids: string[];
  description: string;
  evidence: string;
}

export interface DefensiveRecommendation {
  recommendation_id: string;
  vulnerability_id: string;
  title: string;
  description: string;
  suggested_action_type: string;
  target_entities: string[];
  estimated_mitigation_pct: number;
}

export interface PlanStressResult {
  candidate_id: string;
  candidate_name: string;
  overall_resilience_score: number;
  resilience_dimensions: ResilienceScore[];
  degradation_metrics: DegradationMetric[];
  vulnerabilities: Vulnerability[];
  invalidated_assumptions: AttackAssumption[];
  recovery_time_days: number;
  unmet_demand_units: number;
}

export interface AdversaryStatus {
  engine_version: string;
  status: string;
  supported_attack_types: AttackType[];
  supported_vulnerability_types: VulnerabilityType[];
}

export interface AdversaryReport {
  report_id: string;
  coordination_id: string;
  timestamp: string;
  scenarios_tested: number;
  attack_suite: AdversaryAttack[];
  plan_stress_results: PlanStressResult[];
  overall_vulnerabilities: Vulnerability[];
  defensive_recommendations: DefensiveRecommendation[];
  summary_narrative: string;
  latency_ms: number;
}
