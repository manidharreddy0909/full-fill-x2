import { WorldStateSnapshot } from './world';
import { Signal, RiskScoreMap } from './risk';
import { AgentResult } from './agent';
import { CoordinatorResult, CandidatePlan } from './coordinator';
import { AdversaryReport } from './adversary';
import { PlannerReport } from './planner';
import { VerificationReport, VerificationStatus } from './verification';

export type DecisionStage =
  | 'OBSERVING'
  | 'ANALYZING_RISK'
  | 'RUNNING_SPECIALISTS'
  | 'COORDINATING'
  | 'ADVERSARIAL_TESTING'
  | 'OPTIMIZING'
  | 'VERIFYING'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'FAILED';

export type DecisionStageStatus =
  | 'NOT_STARTED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'PARTIAL'
  | 'FAILED';

export type DecisionWorkflowStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED'
  | 'PARTIAL';

export interface DecisionStageRecord {
  stage: DecisionStage;
  status: DecisionStageStatus;
  start_time?: string;
  end_time?: string;
  duration_ms: number;
  summary: string;
  key_metrics: Record<string, any>;
  errors: string[];
  warnings: string[];
}

export interface DecisionTimeline {
  stages: DecisionStageRecord[];
}

export interface EvidenceLink {
  evidence_id: string;
  source_stage: DecisionStage;
  entity_type: string;
  entity_id: string;
  title: string;
  description: string;
  provenance_chain: string[];
  metadata: Record<string, any>;
}

export interface ExecutiveSummary {
  network_health_score: number;
  critical_risk_count: number;
  affected_node_count: number;
  active_disruption_count: number;
  specialist_proposal_count: number;
  candidate_plan_count: number;
  adversarial_vulnerability_count: number;
  pareto_candidate_count: number;
  verification_status: VerificationStatus;
  verification_pass_rate: number;
}

export interface ApprovalDecision {
  decision_id: string;
  plan_id: string;
  plan_name: string;
  status: 'APPROVED' | 'REJECTED';
  approver: string;
  timestamp: string;
  rationale: string;
  applied_actions_summary: string[];
}

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  actor: string;
  stage: DecisionStage;
  action: string;
  details: Record<string, any>;
}

export interface CockpitError {
  error_id: string;
  stage: DecisionStage;
  code: string;
  message: string;
  timestamp: string;
}

export interface DecisionSession {
  session_id: string;
  created_at: string;
  updated_at: string;
  current_stage: DecisionStage;
  workflow_status: DecisionWorkflowStatus;
  world_snapshot: WorldStateSnapshot;
  active_signals: Signal[];
  active_risks?: RiskScoreMap | null;
  specialist_proposals: Record<string, AgentResult>;
  coordination_result?: CoordinatorResult | null;
  adversary_report?: AdversaryReport | null;
  planner_report?: PlannerReport | null;
  verification_report?: VerificationReport | null;
  approval_decision?: ApprovalDecision | null;
  timeline: DecisionTimeline;
  summary?: ExecutiveSummary | null;
  evidence_chain: EvidenceLink[];
  audit_trail: AuditEvent[];
  errors: CockpitError[];
}

export interface CockpitStatusResponse {
  status: string;
  active_sessions_count: number;
  state_mutation_safety: boolean;
  version: string;
}
