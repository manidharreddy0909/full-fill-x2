/**
 * FULFILL-X Enterprise & Resilience OS API Client (Phase 10)
 */
import {
  ExecutionMode,
  ExecutionResult,
  ModelCard,
  PolicyEvaluationResult,
  ResilienceCycleStatus,
  ResilienceScorecard,
  SystemHealthStatus,
  SystemOperationalMode,
} from '../types/enterprise';

const API_BASE = '/api';

export async function executeResilienceCycle(
  targetNodeIds: string[] = ['sup-001', 'port-001'],
  authorizedBy: string = 'Head of Resilience Operations',
  executionMode: ExecutionMode = 'DRY_RUN'
): Promise<ResilienceCycleStatus> {
  const resp = await fetch(`${API_BASE}/resilience-os/cycle/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_node_ids: targetNodeIds,
      authorized_by: authorizedBy,
      execution_mode: executionMode,
    }),
  });
  if (!resp.ok) throw new Error(`Execute Resilience Cycle API failed (${resp.status})`);
  return resp.json();
}

export async function fetchResilienceScorecard(): Promise<ResilienceScorecard> {
  const resp = await fetch(`${API_BASE}/resilience-os/scorecard`);
  if (!resp.ok) throw new Error(`Fetch Scorecard API failed (${resp.status})`);
  return resp.json();
}

export async function fetchSystemHealthStatus(): Promise<SystemHealthStatus> {
  const resp = await fetch(`${API_BASE}/resilience-os/degradation/status`);
  if (!resp.ok) throw new Error(`Fetch System Health API failed (${resp.status})`);
  return resp.json();
}

export async function setSystemOperationalMode(mode: SystemOperationalMode): Promise<SystemHealthStatus> {
  const resp = await fetch(`${API_BASE}/resilience-os/degradation/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!resp.ok) throw new Error(`Set Operational Mode API failed (${resp.status})`);
  return resp.json();
}

export async function injectChaosFault(faultType: string, targetSubsystem: string = 'ai_service'): Promise<SystemHealthStatus> {
  const resp = await fetch(`${API_BASE}/resilience-os/degradation/fault`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fault_type: faultType, target_subsystem: targetSubsystem }),
  });
  if (!resp.ok) throw new Error(`Inject Chaos Fault API failed (${resp.status})`);
  return resp.json();
}

export async function clearChaosFaults(): Promise<SystemHealthStatus> {
  const resp = await fetch(`${API_BASE}/resilience-os/degradation/clear`, {
    method: 'POST',
  });
  if (!resp.ok) throw new Error(`Clear Faults API failed (${resp.status})`);
  return resp.json();
}

export async function evaluatePolicy(
  decisionId: string,
  candidatePlan: Record<string, any> = {},
  simulationSummary: Record<string, any> = {}
): Promise<PolicyEvaluationResult> {
  const resp = await fetch(`${API_BASE}/policies/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decision_id: decisionId,
      candidate_plan: candidatePlan,
      simulation_summary: simulationSummary,
    }),
  });
  if (!resp.ok) throw new Error(`Evaluate Policy API failed (${resp.status})`);
  return resp.json();
}

export async function authorizeExecution(
  decisionId: string,
  authorizedBy: string = 'Head of Operations',
  executionMode: ExecutionMode = 'DRY_RUN'
): Promise<ExecutionResult> {
  const resp = await fetch(`${API_BASE}/execution/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decision_id: decisionId,
      authorized_by: authorizedBy,
      execution_mode: executionMode,
      human_approved: true,
      policy_verified: true,
    }),
  });
  if (!resp.ok) throw new Error(`Authorize Execution API failed (${resp.status})`);
  return resp.json();
}

export async function fetchModelCard(modelName: string = 'DemandForecastModel'): Promise<ModelCard> {
  const resp = await fetch(`${API_BASE}/governance/model-card/${encodeURIComponent(modelName)}`);
  if (!resp.ok) throw new Error(`Fetch Model Card API failed (${resp.status})`);
  return resp.json();
}
