/**
 * Hindsight Experiential Memory API Client (Phase 6B/6C/6D)
 *
 * Connects directly to backend FastAPI router mounted at /api:
 * - /api/experiences (list, recall, retain, reflect)
 * - /api/genomes (list, get)
 * - /api/transfer/evaluate
 * - /api/hindsight/status
 */

export interface ExperienceItem {
  experience_id: string;
  incident_id: string;
  timestamp: string;
  incident_signature: string;
  world_state: {
    disrupted_nodes?: string[];
    network_health?: number;
    target_node?: string;
    [key: string]: any;
  };
  topology_context?: Record<string, any>;
  observed_symptoms: string[];
  hypothesis?: string;
  decision: string;
  action: {
    type: string;
    source_node?: string;
    target_node?: string;
    allocated_capacity?: number;
    [key: string]: any;
  };
  alternative_actions?: any[];
  assumptions?: string[];
  predicted_outcome: {
    recovery_percentage?: number;
    recovery_hours?: number;
    cost?: number;
    [key: string]: any;
  };
  actual_outcome: {
    recovery_percentage?: number;
    recovery_hours?: number;
    cost?: number;
    status?: string;
    [key: string]: any;
  };
  outcome_status: 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'PENDING';
  failure_reason?: string | null;
  success_conditions: string[];
  failure_boundaries: string[];
  evidence?: any[];
  provenance: {
    source_type?: string;
    is_simulation?: boolean;
    confidence?: number;
    recorded_by?: string;
    [key: string]: any;
  };
  human_override?: boolean;
  policy_decision?: string;
  skill_version?: string | null;
  confidence: number;
  truth_status: 'OBSERVED' | 'SIMULATED' | 'PREDICTED' | 'INFERRED' | 'LEARNED';
}

export interface ResilienceGenomeItem {
  genome_id: string;
  strategy_name: string;
  description: string;
  domain: string;
  success_conditions: Array<{
    condition_id?: string;
    text: string;
    verified?: boolean;
    parameter?: string;
    threshold?: string;
    evidence_count?: number;
    confidence?: number;
  }>;
  failure_boundaries: Array<{
    boundary_id?: string;
    text: string;
    verified?: boolean;
    parameter?: string;
    threshold?: string;
    severity?: string;
    evidence_count?: number;
    confidence?: number;
  }>;
  supporting_evidence_ids: string[];
  contradicting_evidence_ids: string[];
  status: 'VALIDATED' | 'PROVISIONAL' | 'DEPRECATED' | 'CONTRADICTED';
  confidence: number;
  version: string;
  last_reflected_at: string;
}

export interface RecallResponse {
  query_signature: string;
  total_matches: number;
  experiences: ExperienceItem[];
  similarity_scores: Record<string, number>;
}

export interface HindsightStatus {
  status: string;
  mode: string;
  total_experiences: number;
  total_genomes: number;
}

const API_BASE = '/api';

export async function fetchHindsightStatus(): Promise<HindsightStatus> {
  const resp = await fetch(`${API_BASE}/hindsight/status`);
  if (!resp.ok) throw new Error(`Hindsight status failed (${resp.status})`);
  return resp.json();
}

export async function listExperiences(): Promise<ExperienceItem[]> {
  const resp = await fetch(`${API_BASE}/experiences`);
  if (!resp.ok) throw new Error(`List experiences failed (${resp.status})`);
  return resp.json();
}

export async function recallExperiences(query: {
  incident_signature?: string;
  query_text?: string;
  target_nodes?: string[];
  limit?: number;
  min_similarity?: number;
}): Promise<RecallResponse> {
  const resp = await fetch(`${API_BASE}/experiences/recall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!resp.ok) throw new Error(`Recall experiences failed (${resp.status})`);
  return resp.json();
}

export async function retainExperience(experience: Partial<ExperienceItem>): Promise<{ success: boolean; experience_id: string; message: string }> {
  const resp = await fetch(`${API_BASE}/experiences/retain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ experience }),
  });
  if (!resp.ok) throw new Error(`Retain experience failed (${resp.status})`);
  return resp.json();
}

export async function listGenomes(): Promise<ResilienceGenomeItem[]> {
  const resp = await fetch(`${API_BASE}/genomes`);
  if (!resp.ok) throw new Error(`List genomes failed (${resp.status})`);
  return resp.json();
}

export async function getGenome(genomeId: string): Promise<ResilienceGenomeItem> {
  const resp = await fetch(`${API_BASE}/genomes/${encodeURIComponent(genomeId)}`);
  if (!resp.ok) throw new Error(`Get genome failed (${resp.status})`);
  return resp.json();
}

export async function reflectExperiences(req: {
  experience_ids?: string[];
  strategy_name?: string;
}): Promise<ResilienceGenomeItem> {
  const resp = await fetch(`${API_BASE}/experiences/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!resp.ok) throw new Error(`Reflect experiences failed (${resp.status})`);
  return resp.json();
}
