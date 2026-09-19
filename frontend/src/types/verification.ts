/**
 * FULFILL-X Verification & Validation Types (Phase 09)
 * Matching backend Pydantic verification schemas.
 */

export type VerificationStatus = 'VERIFIED' | 'CONDITIONAL' | 'REJECTED';
export type ValidationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type ValidationCategory =
  | 'ACTION'
  | 'CAPACITY'
  | 'ROUTE'
  | 'INVENTORY'
  | 'DEPENDENCY'
  | 'RISK'
  | 'CONSTRAINT'
  | 'SIMULATION';

export interface ValidationCheck {
  check_id: string;
  name: string;
  category: ValidationCategory;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  severity: ValidationSeverity;
  message: string;
  evidence: string;
  affected_entities: string[];
}

export interface CapacityCheck {
  entity_id: string;
  entity_name: string;
  capacity_type: string;
  requested_load: number;
  available_capacity: number;
  capacity_utilization_percent: number;
  is_exceeded: boolean;
  status: ValidationSeverity;
  message: string;
}

export interface RouteCheck {
  route_id: string;
  source_node_id: string;
  target_node_id: string;
  exists_in_graph: boolean;
  is_available: boolean;
  is_blocked: boolean;
  transport_mode: string;
  status: ValidationSeverity;
  message: string;
}

export interface InventoryCheck {
  facility_id: string;
  facility_name: string;
  current_stock: number;
  safety_stock_threshold: number;
  requested_transfer_quantity: number;
  projected_stock_after: number;
  has_negative_inventory: boolean;
  violates_safety_stock: boolean;
  status: ValidationSeverity;
  message: string;
}

export interface DependencyCheck {
  node_id: string;
  node_name: string;
  dependencies_before: number;
  dependencies_after: number;
  is_single_source_created: boolean;
  is_bottleneck_exacerbated: boolean;
  status: ValidationSeverity;
  message: string;
}

export interface RiskCheck {
  node_id: string;
  node_name: string;
  risk_score_before: number;
  risk_score_after: number;
  risk_delta: number;
  is_newly_created_risk: boolean;
  is_displaced_risk: boolean;
  status: ValidationSeverity;
  message: string;
}

export interface ConstraintCheck {
  constraint_id: string;
  name: string;
  constraint_type: 'HARD' | 'SOFT';
  metric_name: string;
  threshold: number;
  actual_simulated_value: number;
  is_satisfied: boolean;
  status: ValidationSeverity;
  message: string;
}

export interface StateDiff {
  service_level_before: number;
  service_level_after: number;
  service_level_delta: number;
  
  total_cost_before: number;
  total_cost_after: number;
  total_cost_delta: number;

  delay_hours_before: number;
  delay_hours_after: number;
  delay_hours_delta: number;

  emissions_co2_before: number;
  emissions_co2_after: number;
  emissions_co2_delta_percent: number;

  aggregate_risk_before: number;
  aggregate_risk_after: number;
  aggregate_risk_delta: number;

  critical_risk_nodes_before: number;
  critical_risk_nodes_after: number;
  critical_risk_nodes_delta: number;
}

export interface SimulationResult {
  simulation_id: string;
  execution_plan_id: string;
  is_successful: boolean;
  executed_actions_count: number;
  failed_actions_count: number;
  simulation_notes: string[];
  state_diff: StateDiff;
}

export interface VerificationFinding {
  finding_id: string;
  title: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  description: string;
  remediation_advice: string;
  affected_entities: string[];
}

export interface VerificationReport {
  verification_id: string;
  candidate_id: string;
  candidate_name: string;
  coordination_id?: string;
  timestamp: string;
  status: VerificationStatus;
  overall_score: number;
  summary_headline: string;
  narrative_explanation: string;
  
  total_checks_count: number;
  passed_checks_count: number;
  warning_checks_count: number;
  failed_checks_count: number;

  validation_checks: ValidationCheck[];
  capacity_checks: CapacityCheck[];
  route_checks: RouteCheck[];
  inventory_checks: InventoryCheck[];
  dependency_checks: DependencyCheck[];
  risk_checks: RiskCheck[];
  constraint_checks: ConstraintCheck[];

  simulation_result: SimulationResult;
  findings: VerificationFinding[];
}

export interface VerificationStatusResponse {
  status: string;
  engine_version: string;
  supported_rules_count: number;
  immutability_guarantee: string;
}
