/**
 * FULFILL-X Multi-Agent Resilience & Continuous Learning API Client (Phase 9)
 */
import {
  AgentMemory,
  AgentPerformanceRecord,
  ChallengerModelRecord,
  DeliberationSession,
  FeedbackRecord,
  LearningDataset,
  LearningRunResult,
  OutcomeRecord,
  PolicyEvaluationRecord,
} from '../types/learning';

const API_BASE = '/api';

export async function triggerDeliberation(targetNodeIds: string[] = ['sup-001', 'port-001']): Promise<DeliberationSession> {
  const resp = await fetch(`${API_BASE}/agents/resilience/deliberate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_node_ids: targetNodeIds }),
  });
  if (!resp.ok) throw new Error(`Deliberation API failed (${resp.status})`);
  return resp.json();
}

export async function fetchAgentMemories(agentId?: string): Promise<AgentMemory[]> {
  const url = agentId ? `${API_BASE}/agents/memory?agent_id=${encodeURIComponent(agentId)}` : `${API_BASE}/agents/memory`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Fetch memory API failed (${resp.status})`);
  return resp.json();
}

export async function addAgentMemory(data: {
  agent_id: string;
  lesson: string;
  confidence?: number;
  memory_type?: string;
}): Promise<AgentMemory> {
  const resp = await fetch(`${API_BASE}/agents/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Add memory API failed (${resp.status})`);
  return resp.json();
}

export async function validateAgentMemory(memoryId: string): Promise<any> {
  const resp = await fetch(`${API_BASE}/agents/memory/validate?memory_id=${encodeURIComponent(memoryId)}`, {
    method: 'POST',
  });
  if (!resp.ok) throw new Error(`Validate memory API failed (${resp.status})`);
  return resp.json();
}

export async function fetchAgentPerformance(): Promise<AgentPerformanceRecord[]> {
  const resp = await fetch(`${API_BASE}/agents/performance`);
  if (!resp.ok) throw new Error(`Fetch performance API failed (${resp.status})`);
  return resp.json();
}

export async function recordOutcome(data: {
  decision_id: string;
  expected_service_level: number;
  actual_service_level: number;
  expected_cost: number;
  actual_cost: number;
  expected_recovery_hours: number;
  actual_recovery_hours: number;
}): Promise<{ outcome: OutcomeRecord; feedback: FeedbackRecord[] }> {
  const resp = await fetch(`${API_BASE}/outcomes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Record outcome API failed (${resp.status})`);
  return resp.json();
}

export async function fetchOutcomes(): Promise<OutcomeRecord[]> {
  const resp = await fetch(`${API_BASE}/outcomes`);
  if (!resp.ok) throw new Error(`Fetch outcomes API failed (${resp.status})`);
  return resp.json();
}

export async function fetchFeedbackRecords(): Promise<FeedbackRecord[]> {
  const resp = await fetch(`${API_BASE}/feedback`);
  if (!resp.ok) throw new Error(`Fetch feedback API failed (${resp.status})`);
  return resp.json();
}

export async function fetchLearningDatasets(): Promise<LearningDataset[]> {
  const resp = await fetch(`${API_BASE}/learning/datasets`);
  if (!resp.ok) throw new Error(`Fetch learning datasets API failed (${resp.status})`);
  return resp.json();
}

export async function fetchChallengerModels(): Promise<ChallengerModelRecord[]> {
  const resp = await fetch(`${API_BASE}/learning/challengers`);
  if (!resp.ok) throw new Error(`Fetch challenger models API failed (${resp.status})`);
  return resp.json();
}

export async function trainChallengerModel(
  datasetName: string = 'DemandOutcomeDataset',
  modelName: string = 'DemandForecastModel'
): Promise<{ run_result: LearningRunResult; challenger: ChallengerModelRecord }> {
  const resp = await fetch(`${API_BASE}/learning/retrain-challenger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_name: datasetName, model_name: modelName }),
  });
  if (!resp.ok) throw new Error(`Train challenger API failed (${resp.status})`);
  return resp.json();
}

export async function activateChallengerModel(
  challengerId: string,
  approvedBy: string = 'Head of AI Operations',
  reason: string = 'Validated lower MAE baseline improvement'
): Promise<ChallengerModelRecord> {
  const resp = await fetch(`${API_BASE}/learning/activate-challenger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challenger_id: challengerId,
      approved_by: approvedBy,
      activation_reason: reason,
    }),
  });
  if (!resp.ok) throw new Error(`Activate challenger API failed (${resp.status})`);
  return resp.json();
}

export async function rollbackModel(
  modelName: string = 'DemandForecastModel',
  approvedBy: string = 'Head of Operations'
): Promise<{ status: string; active_version: string }> {
  const resp = await fetch(`${API_BASE}/learning/rollback-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_name: modelName, approved_by: approvedBy }),
  });
  if (!resp.ok) throw new Error(`Rollback model API failed (${resp.status})`);
  return resp.json();
}

export async function evaluatePolicy(
  situation: Record<string, any> = {},
  candidateActions: Record<string, any>[] = []
): Promise<PolicyEvaluationRecord> {
  const resp = await fetch(`${API_BASE}/learning/evaluate-policy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation, candidate_actions: candidateActions }),
  });
  if (!resp.ok) throw new Error(`Evaluate policy API failed (${resp.status})`);
  return resp.json();
}
