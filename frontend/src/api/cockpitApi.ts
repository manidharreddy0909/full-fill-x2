import {
  DecisionSession,
  CockpitStatusResponse,
  DecisionStage,
} from '../types/cockpit';

import { getApiBaseUrl } from './config';

const getCockpitApi = () => `${getApiBaseUrl()}/cockpit`;

export async function fetchCockpitStatus(): Promise<CockpitStatusResponse> {
  const res = await fetch(`${getCockpitApi()}/status`);
  if (!res.ok) throw new Error(`Cockpit status failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function createCockpitSession(
  preset: string = 'healthy',
  seed: number = 42
): Promise<DecisionSession> {
  const res = await fetch(`${getCockpitApi()}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset, seed }),
  });
  if (!res.ok) throw new Error(`Create session failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function fetchCockpitSession(sessionId: string): Promise<DecisionSession> {
  const res = await fetch(`${getCockpitApi()}/session/${sessionId}`);
  if (!res.ok) throw new Error(`Fetch session failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function runCockpitLoop(sessionId: string): Promise<DecisionSession> {
  const res = await fetch(`${getCockpitApi()}/session/${sessionId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Run cockpit loop failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function runCockpitStage(
  sessionId: string,
  targetStage: DecisionStage
): Promise<DecisionSession> {
  const res = await fetch(`${getCockpitApi()}/session/${sessionId}/stage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_stage: targetStage }),
  });
  if (!res.ok) throw new Error(`Run cockpit stage failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function approveCockpitPlan(
  sessionId: string,
  planId: string,
  approver: string = 'Chief Supply Chain Officer',
  rationale: string = 'Plan verified and safe for execution.'
): Promise<DecisionSession> {
  const res = await fetch(`${getCockpitApi()}/session/${sessionId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_id: planId, approver, rationale }),
  });
  if (!res.ok) throw new Error(`Approve plan failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function rejectCockpitPlan(
  sessionId: string,
  planId: string,
  approver: string = 'Chief Risk Officer',
  rationale: string = 'Plan rejected due to unmitigated operational risk.'
): Promise<DecisionSession> {
  const res = await fetch(`${getCockpitApi()}/session/${sessionId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_id: planId, approver, rationale }),
  });
  if (!res.ok) throw new Error(`Reject plan failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function resetCockpitSession(sessionId: string): Promise<DecisionSession> {
  const res = await fetch(`${getCockpitApi()}/session/${sessionId}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Reset session failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}
