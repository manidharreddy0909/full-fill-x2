import { ApiResponse } from '../types/world';
import { CandidatePlan } from '../types/coordinator';
import { AdversaryReport } from '../types/adversary';
import {
  PlannerStatus,
  PlannerReport,
  ParetoFrontier,
  PlanSensitivityItem,
} from '../types/planner';

import { getApiBaseUrl } from './config';

const getPlannerApi = () => `${getApiBaseUrl()}/planner`;

export async function fetchPlannerStatus(): Promise<PlannerStatus> {
  const response = await fetch(`${getPlannerApi()}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch planner status: ${response.statusText}`);
  }
  const json: ApiResponse<PlannerStatus> = await response.json();
  return json.data;
}

export async function runPlanner(
  candidatePlans?: CandidatePlan[],
  adversaryReport?: AdversaryReport | null,
  coordinationId: string = ''
): Promise<PlannerReport> {
  const response = await fetch(`${getPlannerApi()}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_plans: candidatePlans || null,
      adversary_report: adversaryReport || null,
      coordination_id: coordinationId,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to run multi-objective planner: ${response.statusText}`);
  }
  const json: ApiResponse<PlannerReport> = await response.json();
  return json.data;
}

export async function computePareto(
  candidatePlans: CandidatePlan[],
  adversaryReport?: AdversaryReport | null
): Promise<ParetoFrontier> {
  const response = await fetch(`${getPlannerApi()}/pareto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_plans: candidatePlans,
      adversary_report: adversaryReport || null,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to compute Pareto frontier: ${response.statusText}`);
  }
  const json: ApiResponse<ParetoFrontier> = await response.json();
  return json.data;
}

export async function fetchLatestPlannerReport(): Promise<PlannerReport | null> {
  const response = await fetch(`${getPlannerApi()}/report`);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest planner report: ${response.statusText}`);
  }
  const json: ApiResponse<PlannerReport | null> = await response.json();
  return json.data;
}
