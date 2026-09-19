/**
 * FULFILL-X Evaluation API Client (Phase 12)
 * Connects frontend components to backend /api/evaluation REST endpoints.
 */

import {
  BenchmarkComparison,
  BenchmarkScenario,
  EvaluationReport,
  EvaluationRun,
  EvaluationStatusResponse,
} from '../types/evaluation';

import { getApiBaseUrl } from './config';

const getApiUrl = () => `${getApiBaseUrl()}/evaluation`;

export const evaluationApi = {
  /**
   * Fetch evaluation harness status.
   */
  async getStatus(): Promise<EvaluationStatusResponse> {
    const res = await fetch(`${getApiUrl()}/status`);
    if (!res.ok) {
      throw new Error(`Failed to fetch evaluation status: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch registered benchmark scenarios.
   */
  async getScenarios(): Promise<BenchmarkScenario[]> {
    const res = await fetch(`${getApiUrl()}/scenarios`);
    if (!res.ok) {
      throw new Error(`Failed to fetch benchmark scenarios: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Run a single benchmark scenario.
   */
  async runScenario(scenario_id: string, seed?: number): Promise<EvaluationRun> {
    const res = await fetch(`${getApiUrl()}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id, seed }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to run scenario');
    }
    return res.json();
  },

  /**
   * Run complete benchmark suite across all scenarios.
   */
  async runAll(benchmark_id: string = 'BENCHMARK-V1'): Promise<EvaluationReport> {
    const res = await fetch(`${getApiUrl()}/run-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ benchmark_id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to run benchmark suite');
    }
    return res.json();
  },

  /**
   * List history of executed evaluation runs.
   */
  async getRuns(limit: number = 50): Promise<EvaluationRun[]> {
    const res = await fetch(`${getApiUrl()}/runs?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch evaluation runs: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch details for a specific evaluation run.
   */
  async getRun(run_id: string): Promise<EvaluationRun> {
    const res = await fetch(`${getApiUrl()}/runs/${encodeURIComponent(run_id)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch run '${run_id}': ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch latest evaluation report.
   */
  async getReport(): Promise<EvaluationReport> {
    const res = await fetch(`${getApiUrl()}/report`);
    if (!res.ok) {
      throw new Error(`Failed to fetch evaluation report: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Compare two evaluation runs.
   */
  async compareRuns(baseline_run_id: string, target_run_id: string): Promise<BenchmarkComparison> {
    const res = await fetch(`${getApiUrl()}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseline_run_id, target_run_id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to compare evaluation runs');
    }
    return res.json();
  },
};
