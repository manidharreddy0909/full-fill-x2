/**
 * IncidentContextStore — Cross-Workspace Resilience Context (Phase 6C)
 *
 * Maintains a persistent active incident thread across all 26 workspaces.
 * Enables situational continuity between:
 * Command -> Risk -> GNN -> Causal -> War Room -> Cockpit -> Hindsight Memory -> Evaluation.
 *
 * Rule (AGENTS.md & Part 10):
 * - Does NOT duplicate authoritative backend state.
 * - Stores lightweight references and UI selection context.
 * - Safely clears dependent selections when active incident changes.
 */
import { create } from 'zustand';
import { TruthMode } from '../visual/tokens';

export interface ActiveIncident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedNodes: string[];
  symptoms: string[];
  detectedAt: string;
  status: 'ACTIVE' | 'RESOLVING' | 'MITIGATED' | 'NOMINAL';
  presetKey?: string;
}

export interface CandidateStrategy {
  id: string;
  name: string;
  type: string;
  targetNodeId?: string;
  substituteNodeId?: string;
  expectedCost?: number;
  expectedRecoveryHours?: number;
}

export interface BoundaryAlert {
  breached: boolean;
  boundary: string;
  safeThreshold?: string;
  observedValue?: string;
  discoveredByMemoryId?: string;
}

export interface LearningFeedback {
  predictionVsActual: {
    predictedRecovery: string;
    actualRecovery: string;
    predictedCost: string;
    actualCost: string;
  };
  retainedMemoryId: string;
  boundaryUpdate: string;
}

export interface IncidentContextState {
  // Primary context
  activeIncident: ActiveIncident | null;
  selectedNodeId: string | null;
  activeScenarioId: string | null;
  activeRiskId: string | null;

  // Decision & Strategy
  selectedStrategy: CandidateStrategy | null;
  selectedSkillId: string | null;

  // Hindsight experiential memory references
  recalledExperienceIds: string[];
  selectedGenomeId: string | null;
  boundaryAlert: BoundaryAlert | null;

  // Safety & clearance gates
  activeChallengeId: string | null;
  adversaryStatus: 'IDLE' | 'TESTING' | 'PASSED' | 'FAILED' | null;
  verificationStatus: 'IDLE' | 'VERIFYING' | 'PASSED' | 'FAILED' | null;
  governanceDecision: 'AUTO' | 'APPROVAL_REQUIRED' | 'BLOCKED' | null;

  // Truth & Learning
  truthMode: TruthMode;
  lastOutcomeLearning: LearningFeedback | null;
  lastUpdated: string;

  // Actions
  setActiveIncident: (incident: ActiveIncident | null) => void;
  clearActiveIncident: () => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedStrategy: (strategy: CandidateStrategy | null) => void;
  setSelectedSkillId: (skillId: string | null) => void;
  setRecalledExperienceIds: (ids: string[]) => void;
  setSelectedGenomeId: (genomeId: string | null) => void;
  setBoundaryAlert: (alert: BoundaryAlert | null) => void;
  setAdversaryStatus: (status: 'IDLE' | 'TESTING' | 'PASSED' | 'FAILED' | null) => void;
  setVerificationStatus: (status: 'IDLE' | 'VERIFYING' | 'PASSED' | 'FAILED' | null) => void;
  setGovernanceDecision: (decision: 'AUTO' | 'APPROVAL_REQUIRED' | 'BLOCKED' | null) => void;
  setTruthMode: (mode: TruthMode) => void;
  setLastOutcomeLearning: (feedback: LearningFeedback | null) => void;
  resetAllContext: () => void;
}

// Canonical default baseline incident when a disruption is active in the world
const DEFAULT_DISRUPTED_INCIDENT: ActiveIncident = {
  id: 'INC-2026-SUP002',
  title: 'Supplier B (sup-002) Production Disruption',
  severity: 'HIGH',
  affectedNodes: ['sup-002', 'wh-001', 'port-001'],
  symptoms: [
    'Throughput drop > 60%',
    'Inbound shipment delays at Warehouse A',
    'Tier-1 supply bottleneck',
  ],
  detectedAt: new Date().toISOString(),
  status: 'ACTIVE',
  presetKey: 'double_punch',
};

export const useIncidentContextStore = create<IncidentContextState>((set) => ({
  activeIncident: DEFAULT_DISRUPTED_INCIDENT,
  selectedNodeId: 'sup-002',
  activeScenarioId: 'double_punch',
  activeRiskId: 'RISK-SUP-002',

  selectedStrategy: {
    id: 'strat-sub-004',
    name: 'Dynamic Supplier Substitution',
    type: 'SUPPLIER_SUBSTITUTION',
    targetNodeId: 'sup-002',
    substituteNodeId: 'sup-004',
    expectedCost: 11800,
    expectedRecoveryHours: 3.2,
  },
  selectedSkillId: 'skill-supplier-sub-v2',

  recalledExperienceIds: ['exp-canonical-001', 'exp-canonical-002'],
  selectedGenomeId: 'gen-001',
  boundaryAlert: {
    breached: false,
    boundary: 'Substitute capacity must exceed 40% (Current: 52%)',
    safeThreshold: '> 40%',
    observedValue: '52%',
    discoveredByMemoryId: 'exp-canonical-002',
  },

  activeChallengeId: 'chal-counterfactual-001',
  adversaryStatus: 'PASSED',
  verificationStatus: 'PASSED',
  governanceDecision: 'APPROVAL_REQUIRED',

  truthMode: 'OBSERVED',
  lastOutcomeLearning: {
    predictionVsActual: {
      predictedRecovery: '3.0 hr',
      actualRecovery: '2.8 hr',
      predictedCost: '$12,000',
      actualCost: '$11,800',
    },
    retainedMemoryId: 'exp-canonical-001',
    boundaryUpdate: 'Reinforced: Capacity < 40% is non-transferable boundary',
  },
  lastUpdated: new Date().toISOString(),

  setActiveIncident: (incident) =>
    set((state) => {
      // If incident changed to a different one or cleared, clear dependent strategy / boundary selections
      const isDifferent = state.activeIncident?.id !== incident?.id;
      return {
        activeIncident: incident,
        selectedNodeId: incident ? incident.affectedNodes[0] ?? null : null,
        selectedStrategy: isDifferent ? null : state.selectedStrategy,
        selectedSkillId: isDifferent ? null : state.selectedSkillId,
        recalledExperienceIds: isDifferent ? [] : state.recalledExperienceIds,
        boundaryAlert: isDifferent ? null : state.boundaryAlert,
        adversaryStatus: isDifferent ? null : state.adversaryStatus,
        verificationStatus: isDifferent ? null : state.verificationStatus,
        governanceDecision: isDifferent ? null : state.governanceDecision,
        lastUpdated: new Date().toISOString(),
      };
    }),

  clearActiveIncident: () =>
    set({
      activeIncident: null,
      selectedNodeId: null,
      selectedStrategy: null,
      selectedSkillId: null,
      recalledExperienceIds: [],
      boundaryAlert: null,
      adversaryStatus: null,
      verificationStatus: null,
      governanceDecision: null,
      lastUpdated: new Date().toISOString(),
    }),

  setSelectedNodeId: (nodeId) =>
    set({ selectedNodeId: nodeId, lastUpdated: new Date().toISOString() }),

  setSelectedStrategy: (strategy) =>
    set({ selectedStrategy: strategy, lastUpdated: new Date().toISOString() }),

  setSelectedSkillId: (skillId) =>
    set({ selectedSkillId: skillId, lastUpdated: new Date().toISOString() }),

  setRecalledExperienceIds: (ids) =>
    set({ recalledExperienceIds: ids, lastUpdated: new Date().toISOString() }),

  setSelectedGenomeId: (genomeId) =>
    set({ selectedGenomeId: genomeId, lastUpdated: new Date().toISOString() }),

  setBoundaryAlert: (alert) =>
    set({ boundaryAlert: alert, lastUpdated: new Date().toISOString() }),

  setAdversaryStatus: (status) =>
    set({ adversaryStatus: status, lastUpdated: new Date().toISOString() }),

  setVerificationStatus: (status) =>
    set({ verificationStatus: status, lastUpdated: new Date().toISOString() }),

  setGovernanceDecision: (decision) =>
    set({ governanceDecision: decision, lastUpdated: new Date().toISOString() }),

  setTruthMode: (mode) =>
    set({ truthMode: mode, lastUpdated: new Date().toISOString() }),

  setLastOutcomeLearning: (feedback) =>
    set({ lastOutcomeLearning: feedback, lastUpdated: new Date().toISOString() }),

  resetAllContext: () =>
    set({
      activeIncident: null,
      selectedNodeId: null,
      activeScenarioId: null,
      activeRiskId: null,
      selectedStrategy: null,
      selectedSkillId: null,
      recalledExperienceIds: [],
      selectedGenomeId: null,
      boundaryAlert: null,
      activeChallengeId: null,
      adversaryStatus: null,
      verificationStatus: null,
      governanceDecision: null,
      truthMode: 'OBSERVED',
      lastOutcomeLearning: null,
      lastUpdated: new Date().toISOString(),
    }),
}));
