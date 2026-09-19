import { ApiResponse } from '../types/world';
import { CandidatePlan } from '../types/coordinator';
import {
  AdversaryStatus,
  AdversaryReport,
  AdversaryAttack,
  PlanStressResult,
} from '../types/adversary';

const ADVERSARY_API = 'http://localhost:8000/api/adversary';

export async function fetchAdversaryStatus(): Promise<AdversaryStatus> {
  const response = await fetch(`${ADVERSARY_API}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch adversary status: ${response.statusText}`);
  }
  const json: ApiResponse<AdversaryStatus> = await response.json();
  return json.data;
}

export async function runAdversary(
  candidatePlans?: CandidatePlan[],
  coordinationId: string = '',
  seed: number = 42
): Promise<AdversaryReport> {
  const response = await fetch(`${ADVERSARY_API}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_plans: candidatePlans || null,
      coordination_id: coordinationId,
      seed: seed,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to run adversary: ${response.statusText}`);
  }
  const json: ApiResponse<AdversaryReport> = await response.json();
  return json.data;
}

export async function generateAttackSuite(
  candidatePlans?: CandidatePlan[],
  seed: number = 42
): Promise<AdversaryAttack[]> {
  const response = await fetch(`${ADVERSARY_API}/attack-suite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_plans: candidatePlans || null,
      seed: seed,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate attack suite: ${response.statusText}`);
  }
  const json: ApiResponse<AdversaryAttack[]> = await response.json();
  return json.data;
}

export async function fetchLatestFindings(): Promise<AdversaryReport | null> {
  const response = await fetch(`${ADVERSARY_API}/findings`);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest findings: ${response.statusText}`);
  }
  const json: ApiResponse<AdversaryReport | null> = await response.json();
  return json.data;
}
