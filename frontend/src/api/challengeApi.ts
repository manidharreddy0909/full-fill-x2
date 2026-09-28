/**
 * FULFILL-X Phase 4 Challenge Engine API Client
 */
import { API_BASE_URL } from './config';
import type {
  ChallengeResult,
  GradientProbeResult,
  CounterfactualComparison,
  ChallengeMetrics,
  ChallengeScenarioType,
} from '../types/challenge';

export interface RunChallengePayload {
  skill_id: string;
  scenario_type?: ChallengeScenarioType;
  parameter?: string;
  test_value?: number;
  demand_surge_factor?: number;
  run_counterfactual?: boolean;
  alternative_strategy?: string;
}

export interface GradientProbePayload {
  skill_id: string;
  parameter?: string;
  values?: number[];
}

export interface CounterfactualPayload {
  skill_id: string;
  world_state?: Record<string, any>;
  alternative_strategy?: string;
}

export const challengeApi = {
  async getStatus(): Promise<{ status: string; phase: string; history_count: number; metrics: ChallengeMetrics }> {
    const res = await fetch(`${API_BASE_URL}/api/challenge/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch challenge engine status`);
    return res.json();
  },

  async getMetrics(): Promise<ChallengeMetrics> {
    const res = await fetch(`${API_BASE_URL}/api/challenge/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch challenge metrics`);
    return res.json();
  },

  async getHistory(limit: number = 50): Promise<ChallengeResult[]> {
    const res = await fetch(`${API_BASE_URL}/api/challenge/history?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch challenge history`);
    return res.json();
  },

  async runChallenge(payload: RunChallengePayload): Promise<ChallengeResult> {
    const res = await fetch(`${API_BASE_URL}/api/challenge/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to run challenge`);
    return res.json();
  },

  async runGradientProbe(payload: GradientProbePayload): Promise<GradientProbeResult> {
    const res = await fetch(`${API_BASE_URL}/api/challenge/gradient-probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to run gradient probe`);
    return res.json();
  },

  async evaluateCounterfactual(payload: CounterfactualPayload): Promise<CounterfactualComparison> {
    const res = await fetch(`${API_BASE_URL}/api/challenge/counterfactual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to evaluate counterfactual`);
    return res.json();
  },

  async runCanonicalDemo(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/challenge/canonical-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to run canonical demo`);
    return res.json();
  },
};
