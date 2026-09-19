export enum DemoScenarioId {
  DEMO_01 = 'DEMO-01',
  DEMO_02 = 'DEMO-02',
  DEMO_03 = 'DEMO-03',
  DEMO_04 = 'DEMO-04',
  DEMO_05 = 'DEMO-05',
}

export enum DemoStatus {
  IDLE = 'IDLE',
  INITIALIZING = 'INITIALIZING',
  OBSERVING = 'OBSERVING',
  RISK_DETECTED = 'RISK_DETECTED',
  SCENARIO_GENERATED = 'SCENARIO_GENERATED',
  SPECIALISTS_RUNNING = 'SPECIALISTS_RUNNING',
  COORDINATING = 'COORDINATING',
  ADVERSARY_RUNNING = 'ADVERSARY_RUNNING',
  OPTIMIZING = 'OPTIMIZING',
  VERIFYING = 'VERIFYING',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  RESET = 'RESET',
}

export enum DemoModeType {
  STEP = 'STEP',
  FAST = 'FAST',
}

export interface DemoStepRecord {
  step_index: number;
  stage: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  duration_ms: number;
  summary: string;
  key_metrics: Record<string, any>;
  evidence_ids: string[];
  timestamp: string;
}

export interface DemoScenario {
  scenario_id: DemoScenarioId;
  title: string;
  subtitle: string;
  description: string;
  seed: number;
  preset: string;
  disruption_type: string;
  affected_entities: string[];
  expected_duration_seconds: number;
  systems_exercised: string[];
  storyboard_steps: string[];
}

export interface DemoSession {
  session_id: string;
  scenario_id: DemoScenarioId;
  mode: DemoModeType;
  status: DemoStatus;
  seed: number;
  current_step_index: number;
  timeline: DemoStepRecord[];
  cockpit_session_id?: string;
  evaluation_run_id?: string;
  executive_summary?: any;
  evaluation_summary?: any;
  created_at: string;
  updated_at: string;
}

export interface DemoStartRequest {
  scenario_id?: DemoScenarioId;
  mode?: DemoModeType;
  seed?: number;
}

export interface DemoStepRequest {
  session_id: string;
  target_step_index?: number;
}

export interface DemoApprovalRequest {
  session_id: string;
  approver_name?: string;
  decision_rationale?: string;
  selected_plan_id?: string;
}

export interface DemoStatusResponse {
  active_session: DemoSession | null;
  available_scenarios: DemoScenario[];
  system_healthy: boolean;
  ai_provider: string;
}

export interface DemoReport {
  session_id: string;
  scenario_id: DemoScenarioId;
  seed: number;
  mode: DemoModeType;
  status: DemoStatus;
  total_duration_ms: number;
  workflow_completed: boolean;
  candidate_plan_selected?: string;
  approval_decision?: Record<string, any>;
  final_executive_summary?: any;
  evaluation_summary?: any;
  timeline_steps: DemoStepRecord[];
  generated_at: string;
}
