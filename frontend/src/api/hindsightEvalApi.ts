/**
 * FULFILL-X Hindsight Learning Evaluation API Client (Phase 5)
 * Connects frontend components to Phase 5 REST endpoints:
 * - Canonical 30-episode A/B experiment
 * - Comparison metrics and learning curves
 * - Episode decision traces and causal attribution
 * - Artifact export (evaluation.json & evaluation.csv)
 */

import { EvaluationExperimentReport, EpisodeTrace } from '../types/hindsightEval';
import { getApiBaseUrl } from './config';

const getApiUrl = () => `${getApiBaseUrl()}/evaluation`;

export const hindsightEvalApi = {
  /**
   * Fetch the latest Phase 5 evaluation report (runs canonical experiment if none exists).
   */
  async getLatestReport(): Promise<EvaluationExperimentReport> {
    const res = await fetch(`${getApiUrl()}/learning/report`);
    if (!res.ok) {
      throw new Error(`Failed to fetch learning evaluation report: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Run the canonical 30-episode A/B experiment (Memoryless vs Hindsight).
   */
  async runCanonicalExperiment(seed: number = 42, force: boolean = true): Promise<EvaluationExperimentReport> {
    const res = await fetch(`${getApiUrl()}/learning/canonical-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed, force }),
    });
    if (!res.ok) {
      throw new Error(`Failed to execute canonical evaluation experiment: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch detailed episode trace comparison for a specific episode index.
   */
  async getEpisodeTrace(episodeIndex: number): Promise<{
    episode_index: number;
    scenario_type: string;
    memoryless: EpisodeTrace;
    hindsight: EpisodeTrace;
    behavioral_divergence: boolean;
    memory_recalled: boolean;
  }> {
    const res = await fetch(`${getApiUrl()}/learning/traces?episode_index=${episodeIndex}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch episode trace: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Get direct download URLs for evaluation artifacts.
   */
  getExportJsonUrl(): string {
    return `${getApiUrl()}/learning/export/json`;
  },

  getExportCsvUrl(): string {
    return `${getApiUrl()}/learning/export/csv`;
  },
};
