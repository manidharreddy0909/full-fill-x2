/**
 * DecisionEvidence — Authoritative Convergence Evidence Model (Phase 6F)
 *
 * Unifies evidence across:
 * - Incident Context
 * - Hindsight Experiential Memory (Recall, Retain)
 * - Resilience Genome & Discovered Boundaries
 * - Recovery Skill & Preconditions
 * - Transfer Intelligence Assessment
 * - Challenge & Counterfactual Probes
 * - Deep Intelligence (Risk, GNN, Causal, Predictive ML, Monte Carlo Simulation)
 * - Specialist Proposals & Adversary Attack Vectors
 * - Governance & Policy Rules (PASS / WARN / BLOCK)
 * - Deterministic Verification
 * - Final Decision Status & Closed-Loop Outcome Feedback
 */
import { TruthMode } from '../visual/tokens';

export type DecisionAuthorizationStatus =
  | 'RECOMMENDED'
  | 'AUTHORIZED'
  | 'REQUIRES_APPROVAL'
  | 'BLOCKED'
  | 'UNKNOWN';

export type TransferStatus =
  | 'TRANSFERABLE'
  | 'PARTIAL'
  | 'NON_TRANSFERABLE'
  | 'UNKNOWN';

export type GovernancePolicyStatus = 'PASS' | 'WARN' | 'BLOCK';

export interface IncidentEvidence {
  incidentId: string;
  signature: string;
  impactedNodeId: string;
  impactedNodeName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  truthStatus: TruthMode;
  detectedAt: string;
  symptoms: string[];
}

export interface HindsightEvidenceItem {
  experienceId: string;
  title: string;
  similarity: number;
  observedOutcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  failedAction?: string;
  successfulAction?: string;
  discoveredBoundary?: string;
  contradictionWarning?: string;
  genomeVersion: string;
  truthStatus: TruthMode;
}

export interface SkillEvidence {
  skillId: string;
  skillName: string;
  version: string;
  preconditions: string[];
  expectedEffect: string;
  failureBoundaries: string[];
  challengeHistory: {
    probeName: string;
    status: 'PASSED' | 'BOUNDARY_DETECTED' | 'FAILED';
    detail: string;
  }[];
  confidenceScore: number;
  lastValidatedAt: string;
  truthStatus: TruthMode;
}

export interface TransferEvidence {
  status: TransferStatus;
  rationale: string;
  evaluatedCondition: string;
  requiredCondition: string;
  boundaryBreached: boolean;
  truthStatus: TruthMode;
}

export interface DeepIntelligenceSummary {
  riskScore: number;
  riskPropagationHops: number;
  gnnCascadeImpactScore: number;
  causalCounterfactualEffect: string;
  predictiveDisruptionProb: number;
  predictiveDriftPsi: number;
  monteCarloSimulatedSL: number;
  monteCarloRuns: number;
  specialistConsensus: string;
  adversaryVulnerabilityDetected: boolean;
  adversaryAttackVector: string;
}

export interface StrategyCandidateItem {
  candidateId: string;
  name: string;
  description: string;
  expectedCost: number;
  expectedRecoveryHours: number;
  serviceLevelImpactPct: number;
  resilienceScore: number;
  requiredApproval: 'NONE' | 'CSCO_APPROVAL' | 'OPS_LEAD';
  evidenceRefs: string[];
  governanceStatus: GovernancePolicyStatus;
  selected: boolean;
}

export interface PolicyRuleEvaluation {
  ruleId: string;
  name: string;
  status: GovernancePolicyStatus;
  condition: string;
  evaluationDetail: string;
}

export interface GovernanceEvidence {
  overallStatus: GovernancePolicyStatus;
  authoritativeDecision: DecisionAuthorizationStatus;
  rules: PolicyRuleEvaluation[];
  requiresManualSignoff: boolean;
  signoffRole?: string;
}

export interface VerificationEvidence {
  isVerified: boolean;
  statusText: string;
  invariantsPassed: number;
  invariantsTotal: number;
  sandboxRunResult: 'PASS' | 'WARN' | 'FAIL';
  boundaryAvoidanceConfirmed: boolean;
}

export interface OutcomeFeedbackData {
  executionMode: 'MOCK_EXECUTION' | 'DRY_RUN' | 'AWS_SANDBOX';
  executedAt: string;
  predictedRecoveryHours: number;
  actualRecoveryHours: number;
  recoveryDeltaHours: number;
  predictedCost: number;
  actualCost: number;
  costDelta: number;
  isSuccess: boolean;
  retainedExperienceId?: string;
  newBoundaryDiscovered?: string;
  learningGainDeltaPct: number;
}

export interface DecisionEvidence {
  incident: IncidentEvidence;
  hindsight: {
    recalled: HindsightEvidenceItem[];
    genomeId: string;
    genomeName: string;
    genomeInvariant: string;
  };
  skill: SkillEvidence;
  transfer: TransferEvidence;
  deepIntelligence: DeepIntelligenceSummary;
  strategies: StrategyCandidateItem[];
  governance: GovernanceEvidence;
  verification: VerificationEvidence;
  authorization: {
    status: DecisionAuthorizationStatus;
    reasoning: string;
    authorizedApprover?: string;
  };
  outcomeFeedback?: OutcomeFeedbackData | null;
}
