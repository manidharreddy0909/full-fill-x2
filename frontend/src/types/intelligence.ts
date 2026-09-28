/**
 * Intelligence Data Contracts — Phase 1 Productization Layer
 *
 * UI-facing data contracts and types for future backend intelligence services:
 * - Experience Memory (Retain / Recall / Reflect)
 * - Resilience Genome
 * - Transfer Intelligence
 * - Resilience Skills
 * - Strategy Arena & Challenges
 * - Decision Governance & Autonomy
 *
 * NOTE: These are UI-facing contracts only.
 * Core intelligence algorithms and backend persistence will be implemented in later phases.
 */

// ─── Autonomy & Governance ───────────────────────────────────────────────────

export type AutonomyLevel = 'AUTO' | 'MONITOR' | 'APPROVAL' | 'BLOCKED';

export type PolicyStatus = 'COMPLIANT' | 'WARNING' | 'VIOLATION' | 'OVERRIDDEN';

export interface GovernanceGateInfo {
  level: AutonomyLevel;
  requiredApprovals: number;
  currentApprovals: number;
  policiesChecked: number;
  policiesPassed: number;
  blockers: string[];
}

// ─── Provenance & Truth Status ───────────────────────────────────────────────

export type ProvenanceType =
  | 'observed'     // Direct real-world execution observation
  | 'simulated'    // High-fidelity digital twin simulation
  | 'derived'      // Statistically aggregated from multiple episodes
  | 'inferred'     // ML/reasoning inference with uncertainty
  | 'hypothesis'   // Unverified agent proposal
  | 'stale';       // Previously validated, but TTL expired

export type OutcomeStatus = 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'PENDING';

export type TruthStatus = 'KNOWN' | 'PROBABLE' | 'UNCERTAIN' | 'UNKNOWN';

// ─── Experience Memory Contract ─────────────────────────────────────────────

export interface ExperienceCondition {
  parameter: string;
  expectedValue: string | number;
  actualValue: string | number;
  satisfied: boolean;
}

export interface Experience {
  id: string;
  timestamp: string;
  event: string;
  incidentType: string;
  worldState: {
    disruptedNodes: string[];
    networkHealth: number;
    activeDemand: number;
    bottleneck: string;
  };
  decision: string;
  action: {
    type: string;
    targetNodeId?: string;
    substituteNodeId?: string;
    parameters: Record<string, unknown>;
  };
  predictedOutcome: {
    recoveryPercentage: number;
    recoveryTimeHours: number;
    cost: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  actualOutcome: {
    status: OutcomeStatus;
    recoveryPercentage: number;
    recoveryTimeHours: number;
    cost: number;
    deltaNotes: string;
  };
  evidence: {
    telemetryPointsCount: number;
    corroboratingNodes: string[];
    logsAvailable: boolean;
    provenance: ProvenanceType;
  };
  provenance: ProvenanceType;
  confidence: number;
  context: string;
  failureBoundaryDescription?: string;
  conditions: string[];
  freshness: string;
}

// ─── Resilience Genome Contract ─────────────────────────────────────────────

export type GenomeStatus = 'VALIDATED' | 'PROVISIONAL' | 'DEPRECATED' | 'CONTRADICTED';

export interface SuccessCondition {
  text: string;
  verified: boolean;
  parameter?: string;
  threshold?: string;
  evidenceWeight?: number;
}

export interface FailureBoundary {
  text: string;
  verified: boolean;
  parameter?: string;
  threshold?: string;
  severity?: 'CRITICAL' | 'WARNING';
}

export interface ResilienceGenome {
  id: string;
  strategy: string;
  purpose: string;
  successConditions: SuccessCondition[];
  failureBoundaries: FailureBoundary[];
  evidence: number; // Count of supporting experiences
  contradictions: number; // Count of contradicting observations
  confidence: number; // 0.0 - 1.0
  lastValidated: string;
  status: GenomeStatus;
  applicabilityDomain: string;
  recoveryBand: {
    min: number;
    max: number;
    typical: number;
  };
}

// ─── Transfer Intelligence Contract ──────────────────────────────────────────

export type TransferabilityState = 'TRANSFERABLE' | 'PARTIAL' | 'NON-TRANSFERABLE' | 'UNKNOWN';

export interface ConditionEvaluation {
  name: string;
  value: string;
  threshold: string;
  status: 'PASS' | 'FAIL' | 'UNKNOWN';
}

export interface TransferAssessment {
  status: TransferabilityState;
  similarity: number; // 0.0 - 1.0
  pastExperienceId: string;
  pastExperienceTitle: string;
  transferableConditions: string[];
  violatedConditions: string[];
  conditionEvaluations: ConditionEvaluation[];
  evidence: number;
  confidence: number;
  reason: string;
  recommendation: string;
}

// ─── Resilience Skill Contract ──────────────────────────────────────────────

export type SkillLifecycleStatus = 'ACTIVE' | 'EXPERIMENTAL' | 'REFINING' | 'RETIRED';

export interface SkillStep {
  stepNumber: number;
  action: string;
  nodeTarget?: string;
  timeoutSeconds: number;
  abortCondition?: string;
}

export interface ResilienceSkill {
  id: string;
  purpose: string;
  preconditions: string[];
  steps: SkillStep[];
  expectedEffects: string[];
  risks: string[];
  evidence: number;
  boundaries: string[];
  confidence: number;
  lifecycleStatus: SkillLifecycleStatus;
  executionCount: number;
  successRate: number;
}

// ─── Strategy Arena & Candidate Contract ────────────────────────────────────

export type ChallengeStatus = 'ROBUST' | 'FRAGILE' | 'VULNERABLE' | 'UNKNOWN';

export interface StrategyCandidate {
  id: string;
  name: string;
  description: string;
  recovery: number; // Percentage 0 - 100
  recoveryTime: string;
  cost: number;
  costLabel: string;
  costLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number; // 0.0 - 1.0
  evidence: number;
  transferability: TransferabilityState;
  challengeStatus: ChallengeStatus;
  challengeDimensions: string[];
  autonomyLevel: AutonomyLevel;
  recommended: boolean;
  rationale: string;
}

// ─── Learning Delta Contract ────────────────────────────────────────────────

export interface LearningDeltaMetric {
  id: string;
  metric: string;
  before: number;
  after: number;
  delta: number;
  unit: string;
  experienceCount: number;
}
