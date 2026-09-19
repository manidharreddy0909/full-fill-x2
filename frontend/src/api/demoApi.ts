import { getApiBaseUrl } from './config';
import {
  DemoScenario,
  DemoSession,
  DemoStartRequest,
  DemoStepRequest,
  DemoApprovalRequest,
  DemoStatusResponse,
  DemoReport,
} from '../types/demo';

const BASE_URL = getApiBaseUrl();

export const getDemoStatus = async (): Promise<DemoStatusResponse> => {
  const response = await fetch(`${BASE_URL}/demo/status`);
  if (!response.ok) throw new Error(`Failed to fetch demo status: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const listDemoScenarios = async (): Promise<DemoScenario[]> => {
  const response = await fetch(`${BASE_URL}/demo/scenarios`);
  if (!response.ok) throw new Error(`Failed to fetch demo scenarios: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const startDemo = async (request: DemoStartRequest): Promise<DemoSession> => {
  const response = await fetch(`${BASE_URL}/demo/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`Failed to start demo: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const stepDemo = async (request: DemoStepRequest): Promise<DemoSession> => {
  const response = await fetch(`${BASE_URL}/demo/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`Failed to step demo: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const pauseDemo = async (sessionId: string): Promise<DemoSession> => {
  const response = await fetch(`${BASE_URL}/demo/pause?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(`Failed to pause demo: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const resumeDemo = async (sessionId: string): Promise<DemoSession> => {
  const response = await fetch(`${BASE_URL}/demo/resume?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(`Failed to resume demo: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const resetDemo = async (): Promise<void> => {
  const response = await fetch(`${BASE_URL}/demo/reset`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to reset demo: ${response.statusText}`);
};

export const approveDemoPlan = async (request: DemoApprovalRequest): Promise<DemoSession> => {
  const response = await fetch(`${BASE_URL}/demo/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`Failed to approve plan: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const rejectDemoPlan = async (sessionId: string, approverName?: string, rationale?: string): Promise<DemoSession> => {
  const query = new URLSearchParams({
    session_id: sessionId,
    ...(approverName && { approver_name: approverName }),
    ...(rationale && { decision_rationale: rationale }),
  }).toString();

  const response = await fetch(`${BASE_URL}/demo/reject?${query}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to reject plan: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const getDemoSession = async (sessionId: string): Promise<DemoSession> => {
  const response = await fetch(`${BASE_URL}/demo/session/${encodeURIComponent(sessionId)}`);
  if (!response.ok) throw new Error(`Failed to fetch demo session: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};

export const getDemoReport = async (sessionId: string): Promise<DemoReport> => {
  const response = await fetch(`${BASE_URL}/demo/report/${encodeURIComponent(sessionId)}`);
  if (!response.ok) throw new Error(`Failed to fetch demo report: ${response.statusText}`);
  const json = await response.json();
  return json.data;
};
