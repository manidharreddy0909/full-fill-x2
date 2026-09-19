/**
 * FULFILL-X Verification API Client (Phase 09)
 * Connects frontend to backend /api/verification REST endpoints.
 */

import { CandidatePlan } from '../types/coordinator';
import {
  VerificationReport,
  VerificationStatusResponse,
} from '../types/verification';

const API_BASE_URL = '/api/verification';

export const verificationApi = {
  /**
   * Fetch status of Verification Engine and supported rules catalog.
   */
  async getStatus(): Promise<VerificationStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/status`);
    if (!res.ok) {
      throw new Error(`Failed to fetch verification status: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Run full plan verification & sandbox simulation on a CandidatePlan.
   */
  async runVerification(
    candidatePlan: CandidatePlan,
    coordinationId?: string
  ): Promise<VerificationReport> {
    const res = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_plan: candidatePlan,
        coordination_id: coordinationId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to run plan verification');
    }
    return res.json();
  },

  /**
   * Fetch latest generated verification report.
   */
  async getLatestReport(candidateId?: string): Promise<VerificationReport> {
    const url = candidateId
      ? `${API_BASE_URL}/report?candidate_id=${encodeURIComponent(candidateId)}`
      : `${API_BASE_URL}/report`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch verification report: ${res.statusText}`);
    }
    return res.json();
  },
};
