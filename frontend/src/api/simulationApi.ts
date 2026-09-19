/**
 * FULFILL-X Digital Twin & Monte Carlo Resilience API Client (Phase 8)
 */
import { getApiBaseUrl } from './config';
import {
  CriticalityResult,
  MonteCarloConfig,
  MonteCarloResult,
  ScenarioConfig,
  SimulationRunResult,
  StrategyComparisonResult,
  TwinStatus,
} from '../types/simulation';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('fulfillx_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchTwinStatus(): Promise<TwinStatus> {
  const res = await fetch(`${getApiBaseUrl()}/twin/status`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch Digital Twin status');
  return res.json();
}

export async function createDigitalTwin(twinId: string = 'DT-DEFAULT', seed: number = 42): Promise<any> {
  const res = await fetch(`${getApiBaseUrl()}/twin/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ twin_id: twinId, seed }),
  });
  if (!res.ok) throw new Error('Failed to create Digital Twin');
  return res.json();
}

export async function runSingleSimulation(
  twinId: string,
  scenario: ScenarioConfig,
  horizonHours: number = 72
): Promise<SimulationRunResult> {
  const res = await fetch(`${getApiBaseUrl()}/simulation/run`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ twin_id: twinId, scenario, horizon_hours: horizonHours }),
  });
  if (!res.ok) throw new Error('Failed to execute simulation run');
  return res.json();
}

export async function runMonteCarlo(
  twinId: string,
  scenario: ScenarioConfig,
  config?: MonteCarloConfig
): Promise<MonteCarloResult> {
  const res = await fetch(`${getApiBaseUrl()}/simulation/monte-carlo`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ twin_id: twinId, scenario, config }),
  });
  if (!res.ok) throw new Error('Failed to execute Monte Carlo simulation');
  return res.json();
}

export async function analyzeResilienceCriticality(
  twinId: string,
  scenario: ScenarioConfig,
  config?: MonteCarloConfig
): Promise<CriticalityResult[]> {
  const res = await fetch(`${getApiBaseUrl()}/resilience/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ twin_id: twinId, scenario, config }),
  });
  if (!res.ok) throw new Error('Failed to analyze network criticality');
  return res.json();
}

export async function compareStrategies(
  scenario: ScenarioConfig,
  candidateStrategies: any[],
  config?: MonteCarloConfig
): Promise<StrategyComparisonResult> {
  const res = await fetch(`${getApiBaseUrl()}/resilience/compare-strategies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      scenario_config: scenario,
      candidate_strategies: candidateStrategies,
      mc_config: config,
    }),
  });
  if (!res.ok) throw new Error('Failed to compare mitigation strategies');
  return res.json();
}
