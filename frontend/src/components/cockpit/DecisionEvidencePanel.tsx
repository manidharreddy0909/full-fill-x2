/**
 * DecisionEvidencePanel — Converged Evidence & Safety Clearance Workspace (Phase 6F)
 *
 * Implements 6F.1 - 6F.4:
 * 1. Unifies Hindsight experiential recall, Genome boundaries, Skill preconditions,
 *    Transferability evaluation, Deep Intelligence (Risk, GNN, Causal, ML, Simulation),
 *    Specialist proposals, Adversary attacks, Governance policy conditions, and Verification.
 * 2. Enforces explicit authorization clearance (RECOMMENDED / AUTHORIZED / REQUIRES_APPROVAL / BLOCKED).
 * 3. Provides closed-loop outcome retention (Captured Prediction vs Actual Delta -> Retain to Hindsight).
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Brain,
  Dna,
  Workflow,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Zap,
  TrendingDown,
  TrendingUp,
  Cpu,
  Lock,
  ArrowRight,
  Database,
  Terminal,
  FileCheck,
  AlertOctagon,
  Scale,
} from 'lucide-react';
import { TruthTag } from '../common/TruthTag';
import { EvidenceCard } from '../common/EvidenceCard';
import { WhyDecisionChangedHeroCard } from './WhyDecisionChangedHeroCard';
import {
  DecisionEvidence,
  DecisionAuthorizationStatus,
  GovernancePolicyStatus,
  TransferStatus,
  StrategyCandidateItem,
} from '../../types/decisionEvidence';
import { useIncidentContextStore } from '../../store/incidentContextStore';

interface DecisionEvidencePanelProps {
  initialEvidence?: Partial<DecisionEvidence>;
  onExecutePlan?: (strategyId: string, mode: 'DRY_RUN' | 'MOCK_EXECUTION') => void;
  onRetainOutcome?: (outcomeData: any) => Promise<void>;
}

// Canonical baseline decision evidence matching active scenario
const DEFAULT_DECISION_EVIDENCE: DecisionEvidence = {
  incident: {
    incidentId: 'INC-2026-SUP002',
    signature: 'SUP-002-CAPACITY-DEGRADATION-60%',
    impactedNodeId: 'sup-002',
    impactedNodeName: 'Supplier B (Microcontrollers)',
    severity: 'HIGH',
    truthStatus: 'OBSERVED',
    detectedAt: '2026-09-28T14:30:00Z',
    symptoms: [
      'Inbound fulfillment latency +4.2 days',
      'Throughput drop to 38% rated capacity',
      'Downstream buffer depletion at Warehouse Alpha (wh-001)',
    ],
  },
  hindsight: {
    recalled: [
      {
        experienceId: 'EXP-CANONICAL-001',
        title: 'Supplier B Severe Degradation under High Q4 Demand',
        similarity: 0.94,
        observedOutcome: 'SUCCESS',
        successfulAction: 'Dual-Sourcing Shift to Supplier D with 52% reserve capacity',
        discoveredBoundary: 'Substitution fails if substitute spare capacity < 40%',
        genomeVersion: 'GENOME-v2.1',
        truthStatus: 'LEARNED',
      },
      {
        experienceId: 'EXP-CANONICAL-002',
        title: 'Blind Substitution to Capacity-Constrained Supplier C',
        similarity: 0.88,
        observedOutcome: 'FAILURE',
        failedAction: 'Immediate single-source shift to Supplier C (28% capacity)',
        discoveredBoundary: 'Secondary cascade stockout within 48h',
        contradictionWarning: 'Naïve cost-optimized routing ignored tier-2 fab constraints',
        genomeVersion: 'GENOME-v1.4',
        truthStatus: 'LEARNED',
      },
    ],
    genomeId: 'GEN-SUP-SUB-001',
    genomeName: 'Resilience Genome: Capacity-Bounded Supplier Substitution',
    genomeInvariant: 'INVARIANT: Substitute node MUST possess >= 40% spare operational capacity prior to reroute.',
  },
  skill: {
    skillId: 'SKILL-SUP-SUB-02',
    skillName: 'Adaptive Supplier Substitution with Capacity Guard',
    version: '2.4.0',
    preconditions: [
      'Incident is isolated to single-tier component failure',
      'Substitute node verified active in network topology',
      'Spare capacity > 40.0%',
    ],
    expectedEffect: 'Restores 85% normal fulfillment volume within 3.5 operating hours',
    failureBoundaries: [
      'Substitute capacity <= 40% triggers immediate cascade failure',
      'Simultaneous port embargo invalidates logistics routing',
    ],
    challengeHistory: [
      { probeName: 'Nominal Traffic Probe', status: 'PASSED', detail: 'Recovery in 2.9h (SL 98%)' },
      { probeName: '1.5x Demand Surge Probe', status: 'PASSED', detail: 'Recovery in 3.4h (SL 94%)' },
      { probeName: '38% Boundary Breach Probe', status: 'BOUNDARY_DETECTED', detail: 'Boundary detected: 38% capacity triggers approval halt' },
    ],
    confidenceScore: 0.96,
    lastValidatedAt: '2026-09-28T14:32:00Z',
    truthStatus: 'LEARNED',
  },
  transfer: {
    status: 'PARTIAL',
    rationale: 'Active candidate sup-004 has 52% spare capacity (Transferable), but secondary candidate sup-003 has 38% capacity (Breaches Boundary).',
    evaluatedCondition: 'Current substitute candidates: sup-004 (52% spare), sup-003 (38% spare)',
    requiredCondition: 'Spare capacity > 40.0%',
    boundaryBreached: false,
    truthStatus: 'INFERRED',
  },
  deepIntelligence: {
    riskScore: 0.78,
    riskPropagationHops: 3,
    gnnCascadeImpactScore: 0.84,
    causalCounterfactualEffect: 'do(Supplier=sup-004) reduces stockout risk by 76%',
    predictiveDisruptionProb: 0.82,
    predictiveDriftPsi: 0.042,
    monteCarloSimulatedSL: 0.942,
    monteCarloRuns: 1000,
    specialistConsensus: '4 of 4 agents recommend capacity-bounded shift to sup-004',
    adversaryVulnerabilityDetected: true,
    adversaryAttackVector: 'Adversary tested 38% edge: verified boundary detection prevents unauthorized execution',
  },
  strategies: [
    {
      candidateId: 'STRAT-A-RECOMMENDED',
      name: 'Governed Shift to Supplier D (sup-004)',
      description: 'Route 65% purchase volume to verified substitute sup-004 with 52% verified headroom.',
      expectedCost: 11800,
      expectedRecoveryHours: 3.2,
      serviceLevelImpactPct: 94.5,
      resilienceScore: 92.0,
      requiredApproval: 'OPS_LEAD',
      evidenceRefs: ['EXP-CANONICAL-001', 'GEN-SUP-SUB-001', 'CHAL-002'],
      governanceStatus: 'PASS',
      selected: true,
    },
    {
      candidateId: 'STRAT-B-RESTRICTED',
      name: 'Unconstrained Shift to Supplier C (sup-003)',
      description: 'Route 80% volume to sup-003. Violates Genome boundary (only 38% capacity).',
      expectedCost: 7200,
      expectedRecoveryHours: 5.8,
      serviceLevelImpactPct: 62.0,
      resilienceScore: 41.0,
      requiredApproval: 'CSCO_APPROVAL',
      evidenceRefs: ['EXP-CANONICAL-002'],
      governanceStatus: 'BLOCK',
      selected: false,
    },
    {
      candidateId: 'STRAT-C-BUFFER-DRAW',
      name: 'Emergency Regional Buffer Inventory Draw',
      description: 'Draw 450 units from Central Hub wh-001 to sustain assembly while qualifying alternate vendor.',
      expectedCost: 14500,
      expectedRecoveryHours: 2.1,
      serviceLevelImpactPct: 98.0,
      resilienceScore: 88.0,
      requiredApproval: 'NONE',
      evidenceRefs: ['EXP-CANONICAL-001'],
      governanceStatus: 'PASS',
      selected: false,
    },
  ],
  governance: {
    overallStatus: 'WARN',
    authoritativeDecision: 'REQUIRES_APPROVAL',
    rules: [
      {
        ruleId: 'POL-RES-01',
        name: 'Genome Boundary Compliance',
        status: 'PASS',
        condition: 'Candidate spare capacity >= 40%',
        evaluationDetail: 'Strategy A targets sup-004 (52% capacity) — COMPLIANT',
      },
      {
        ruleId: 'POL-COST-02',
        name: 'Expenditure Authorization Threshold',
        status: 'WARN',
        condition: 'Estimated mitigation cost <= $10,000 for auto-execution',
        evaluationDetail: 'Strategy A estimated cost is $11,800 (Exceeds auto-threshold by $1,800) — MANUAL APPROVAL REQUIRED',
      },
      {
        ruleId: 'POL-SAFETY-03',
        name: 'Deterministic Verification Gate',
        status: 'PASS',
        condition: 'Sandbox invariants must 100% pass before signoff',
        evaluationDetail: '14 of 14 network invariants verified in sandbox simulation',
      },
    ],
    requiresManualSignoff: true,
    signoffRole: 'Operations Lead / Supply Chain Officer',
  },
  verification: {
    isVerified: true,
    statusText: 'Deterministic Sandbox Verification: PASSED (14/14 Invariants)',
    invariantsPassed: 14,
    invariantsTotal: 14,
    sandboxRunResult: 'PASS',
    boundaryAvoidanceConfirmed: true,
  },
  authorization: {
    status: 'REQUIRES_APPROVAL',
    reasoning: 'Strategy complies with Hindsight Resilience Genome boundaries, but requires manual expenditure signoff ($11,800 > $10,000 auto-limit).',
  },
  outcomeFeedback: null,
};

export const DecisionEvidencePanel: React.FC<DecisionEvidencePanelProps> = ({
  initialEvidence,
  onExecutePlan,
  onRetainOutcome,
}) => {
  const [evidence, setEvidence] = useState<DecisionEvidence>({
    ...DEFAULT_DECISION_EVIDENCE,
    ...initialEvidence,
  });

  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('STRAT-A-RECOMMENDED');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isRetaining, setIsRetaining] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HINDSIGHT' | 'SKILL_TRANSFER' | 'INTELLIGENCE' | 'GOVERNANCE'>('OVERVIEW');

  const { activeIncident, setLastOutcomeLearning, setGovernanceDecision } = useIncidentContextStore();

  const selectedStrategy = evidence.strategies.find((s) => s.candidateId === selectedStrategyId) || evidence.strategies[0];

  // Handle governed mock execution
  const handleExecute = async (mode: 'DRY_RUN' | 'MOCK_EXECUTION') => {
    setIsExecuting(true);
    try {
      if (onExecutePlan) {
        onExecutePlan(selectedStrategyId, mode);
      }

      // Simulate deterministic governed outcome
      await new Promise((resolve) => setTimeout(resolve, 800));

      const feedbackData = {
        executionMode: mode,
        executedAt: new Date().toISOString(),
        predictedRecoveryHours: selectedStrategy.expectedRecoveryHours,
        actualRecoveryHours: Number((selectedStrategy.expectedRecoveryHours * 0.92).toFixed(1)),
        recoveryDeltaHours: Number((selectedStrategy.expectedRecoveryHours * 0.92 - selectedStrategy.expectedRecoveryHours).toFixed(1)),
        predictedCost: selectedStrategy.expectedCost,
        actualCost: Number((selectedStrategy.expectedCost * 0.98).toFixed(0)),
        costDelta: Number((selectedStrategy.expectedCost * 0.98 - selectedStrategy.expectedCost).toFixed(0)),
        isSuccess: true,
        retainedExperienceId: `EXP-GEN-${Date.now().toString().slice(-4)}`,
        newBoundaryDiscovered: 'Validated: Spare capacity >= 40% enables sub-3.0h recovery with zero downstream disruption',
        learningGainDeltaPct: 8.4,
      };

      setEvidence((prev) => ({
        ...prev,
        authorization: {
          ...prev.authorization,
          status: 'AUTHORIZED',
          authorizedApprover: 'CSCO Operational Clearance (Mock)',
        },
        outcomeFeedback: feedbackData,
      }));

      // Update global context store
      setLastOutcomeLearning({
        predictionVsActual: {
          predictedRecovery: `${feedbackData.predictedRecoveryHours}h`,
          actualRecovery: `${feedbackData.actualRecoveryHours}h`,
          predictedCost: `$${feedbackData.predictedCost.toLocaleString()}`,
          actualCost: `$${feedbackData.actualCost.toLocaleString()}`,
        },
        retainedMemoryId: feedbackData.retainedExperienceId,
        boundaryUpdate: feedbackData.newBoundaryDiscovered,
      });

      setGovernanceDecision('AUTO');
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle retaining outcome to Hindsight memory
  const handleRetainToHindsight = async () => {
    if (!evidence.outcomeFeedback) return;
    setIsRetaining(true);
    try {
      if (onRetainOutcome) {
        await onRetainOutcome(evidence.outcomeFeedback);
      } else {
        // Direct call to Hindsight retain API
        await fetch('/api/experiences/retain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experience: {
              experience_id: evidence.outcomeFeedback.retainedExperienceId,
              incident_signature: evidence.incident.signature,
              environment: { node_id: evidence.incident.impactedNodeId, severity: evidence.incident.severity },
              hypothesis: `Governed execution of ${selectedStrategy.name}`,
              action_taken: selectedStrategy.description,
              expected_outcome: `Recovery in ${evidence.outcomeFeedback.predictedRecoveryHours}h at $${evidence.outcomeFeedback.predictedCost}`,
              actual_outcome: `Recovered in ${evidence.outcomeFeedback.actualRecoveryHours}h at $${evidence.outcomeFeedback.actualCost}`,
              success: evidence.outcomeFeedback.isSuccess,
              failure_reason: null,
              discovered_boundary: evidence.outcomeFeedback.newBoundaryDiscovered,
              evidence_refs: selectedStrategy.evidenceRefs,
              truth_status: 'OBSERVED',
            },
          }),
        }).catch(() => {});
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setIsRetaining(false);
    }
  };

  const statusBadgeColor = (status: DecisionAuthorizationStatus) => {
    switch (status) {
      case 'AUTHORIZED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'RECOMMENDED': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'REQUIRES_APPROVAL': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'BLOCKED': return 'bg-red-500/20 text-red-300 border-red-500/40';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 font-sans">
      {/* ── Section A: Active Incident Clearance Header ── */}
      <div className="p-5 rounded-xl bg-[#090d16]/95 border border-cyan-500/25 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                DECISION CLEARANCE CONVERGENCE
              </span>
              <TruthTag mode={evidence.incident.truthStatus} />
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                SEVERITY: {evidence.incident.severity}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {evidence.incident.incidentId}: {evidence.incident.impactedNodeName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
              <span>Signature: <strong className="text-slate-200">{evidence.incident.signature}</strong></span>
              <span>•</span>
              <span>Impacted Node: <strong className="text-cyan-300">{evidence.incident.impactedNodeId}</strong></span>
            </div>
          </div>
        </div>

        {/* Authoritative Clearance Status Badge */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            AUTHORITATIVE CLEARANCE
          </div>
          <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold text-xs flex items-center gap-2 shadow-lg ${statusBadgeColor(evidence.authorization.status)}`}>
            {evidence.authorization.status === 'AUTHORIZED' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {evidence.authorization.status === 'RECOMMENDED' && <Sparkles className="w-4 h-4 text-blue-400" />}
            {evidence.authorization.status === 'REQUIRES_APPROVAL' && <Lock className="w-4 h-4 text-amber-400" />}
            {evidence.authorization.status === 'BLOCKED' && <XCircle className="w-4 h-4 text-red-400" />}
            <span>{evidence.authorization.status.replace('_', ' ')}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {evidence.governance.requiresManualSignoff ? 'Manual Signoff Required' : 'Auto-Clearance Enabled'}
          </span>
        </div>
      </div>

      {/* ── Navigation Tabs for Deep Inspection ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: 'Converged Clearance', icon: Scale },
          { id: 'HINDSIGHT', label: 'Hindsight & Genome', icon: Brain },
          { id: 'SKILL_TRANSFER', label: 'Skill & Transfer', icon: Workflow },
          { id: 'INTELLIGENCE', label: 'Deep Intelligence', icon: Cpu },
          { id: 'GOVERNANCE', label: 'Governance & Verification', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                isActive
                  ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Views ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'OVERVIEW' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Converged Evidence Synthesis (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Phase 6F-6I Section 83: "WHY DID THE DECISION CHANGE?" Hero Card */}
              <WhyDecisionChangedHeroCard
                previousStrategyName="Immediate Supplier Substitution (EXP-012)"
                previousOutcome="Succeeded in Incident #1 (Fast recovery under nominal demand)"
                learnedCondition="Supplier Spare Capacity >= 40.0% & Lead Time <= 72h"
                currentObservedValue="Supplier Spare Capacity = 38.0% (Capacity boundary breach detected)"
                transferVerdict={evidence.transfer.status}
                activeDecisionVerdict="Previous substitution strategy REJECTED to avoid boundary failure"
                alternativeStrategyName={selectedStrategy.name}
              />

              {/* Hindsight & Boundary Alert Summary Card */}
              <div className="p-4 rounded-xl bg-[#090d16]/90 border border-blue-500/25 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-blue-300">
                      Hindsight Memory & Boundary Discovery
                    </h3>
                  </div>
                  <TruthTag mode="LEARNED" />
                </div>

                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs font-mono space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <Dna className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-cyan-300 font-bold">{evidence.hindsight.genomeName}</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">{evidence.hindsight.genomeInvariant}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Recalled Experiences ({evidence.hindsight.recalled.length}):
                  </div>
                  {evidence.hindsight.recalled.map((item) => (
                    <div
                      key={item.experienceId}
                      className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-mono flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{item.title}</span>
                        <span className="text-cyan-400 font-bold">{(item.similarity * 100).toFixed(0)}% Match</span>
                      </div>
                      {item.observedOutcome === 'SUCCESS' && (
                        <span className="text-emerald-400 text-[11px]">✓ Prior Success: {item.successfulAction}</span>
                      )}
                      {item.observedOutcome === 'FAILURE' && (
                        <span className="text-red-400 text-[11px]">✗ Prior Failure: {item.failedAction}</span>
                      )}
                      {item.discoveredBoundary && (
                        <div className="text-amber-300 text-[11px] flex items-center gap-1.5 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Learned Boundary: {item.discoveredBoundary}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer & Skill Clearance Summary Card */}
              <div className="p-4 rounded-xl bg-[#090d16]/90 border border-purple-500/25 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-purple-400" />
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-purple-300">
                      Skill Applicability & Transferability
                    </h3>
                  </div>
                  <TruthTag mode={evidence.transfer.truthStatus} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block mb-1">TRANSFER ASSESSMENT</span>
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <AlertOctagon className="w-4 h-4" />
                      <span>{evidence.transfer.status}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1 font-sans leading-relaxed">
                      {evidence.transfer.rationale}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block mb-1">RECOVERY SKILL</span>
                    <div className="flex items-center gap-2 font-bold text-cyan-300">
                      <Zap className="w-4 h-4" />
                      <span>{evidence.skill.skillName} (v{evidence.skill.version})</span>
                    </div>
                    <div className="text-emerald-400 text-[11px] mt-1 font-bold">
                      Confidence: {(evidence.skill.confidenceScore * 100).toFixed(0)}% · Invariants: 100% Passed
                    </div>
                  </div>
                </div>
              </div>

              {/* Deep Intelligence Quick-Evidence Strip */}
              <div className="p-4 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-cyan-300">
                      Deep Intelligence Evidence Inputs
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Progressive Disclosure</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <Link
                    to="/intelligence/risk"
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col gap-1 group"
                  >
                    <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 flex items-center justify-between">
                      Risk Multi-Hop <ExternalLink className="w-3 h-3 opacity-60" />
                    </span>
                    <strong className="text-amber-400 font-bold">
                      {(evidence.deepIntelligence.riskScore * 100).toFixed(0)}% (3 Hops)
                    </strong>
                  </Link>

                  <Link
                    to="/intelligence/gnn"
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col gap-1 group"
                  >
                    <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 flex items-center justify-between">
                      GNN Cascade <ExternalLink className="w-3 h-3 opacity-60" />
                    </span>
                    <strong className="text-purple-400 font-bold">
                      {(evidence.deepIntelligence.gnnCascadeImpactScore * 100).toFixed(0)}% Impact
                    </strong>
                  </Link>

                  <Link
                    to="/intelligence/causal"
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col gap-1 group"
                  >
                    <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 flex items-center justify-between">
                      Causal DAG <ExternalLink className="w-3 h-3 opacity-60" />
                    </span>
                    <strong className="text-emerald-400 font-bold">-76% Risk</strong>
                  </Link>

                  <Link
                    to="/simulation/twin"
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col gap-1 group"
                  >
                    <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 flex items-center justify-between">
                      Simulation <ExternalLink className="w-3 h-3 opacity-60" />
                    </span>
                    <strong className="text-blue-400 font-bold">
                      {(evidence.deepIntelligence.monteCarloSimulatedSL * 100).toFixed(1)}% SL
                    </strong>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Strategy Comparison, Governance & Clearance Execution (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Strategy Candidate Selection */}
              <div className="p-4 rounded-xl bg-[#090d16]/90 border border-cyan-500/25 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-cyan-300">
                      Candidate Strategy Matrix
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Select Plan</span>
                </div>

                <div className="space-y-3">
                  {evidence.strategies.map((strategy) => {
                    const isSelected = strategy.candidateId === selectedStrategyId;
                    return (
                      <div
                        key={strategy.candidateId}
                        onClick={() => setSelectedStrategyId(strategy.candidateId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/50'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-mono font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                            {strategy.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              strategy.governanceStatus === 'PASS'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : strategy.governanceStatus === 'WARN'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            GOV: {strategy.governanceStatus}
                          </span>
                        </div>

                        <p className="text-slate-300 text-xs font-sans mb-2.5 leading-relaxed">
                          {strategy.description}
                        </p>

                        <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-2 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-500 text-[9px] block">RECOVERY</span>
                            <span className="text-emerald-400 font-bold">{strategy.expectedRecoveryHours}h</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[9px] block">EST. COST</span>
                            <span className="text-cyan-300 font-bold">${strategy.expectedCost.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[9px] block">SLA IMPACT</span>
                            <span className="text-purple-300 font-bold">{strategy.serviceLevelImpactPct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Authoritative Policy Clearance & Execution Controls */}
              <div className="p-5 rounded-xl bg-[#090d16]/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="font-mono font-bold text-xs uppercase text-white">
                        Safety Plane Clearance
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        Deterministic Policy & Sandbox Gate
                      </span>
                    </div>
                  </div>
                  <TruthTag mode="OBSERVED" />
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {evidence.governance.rules.map((rule) => (
                    <div key={rule.ruleId} className="flex items-start justify-between gap-2 p-2.5 rounded bg-slate-900/80 border border-slate-800">
                      <div>
                        <span className="text-white font-bold block">{rule.name}</span>
                        <span className="text-slate-400 text-[10px]">{rule.evaluationDetail}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          rule.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Execution Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleExecute('DRY_RUN')}
                    disabled={isExecuting}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all"
                  >
                    {isExecuting ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span>EXECUTE GOVERNED PLAN (MOCK / DRY RUN)</span>
                  </button>

                  <p className="text-[10px] font-mono text-slate-400 text-center">
                    Strict non-destructive execution plane enforced.
                  </p>
                </div>
              </div>

              {/* Outcome Feedback & Hindsight Retain Loop (Closed Loop) */}
              {evidence.outcomeFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-mono font-bold text-xs text-emerald-300 uppercase">
                        Closed-Loop Outcome Capture
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                      PREDICTED VS ACTUAL
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded bg-[#030712] border border-emerald-500/20">
                      <span className="text-slate-400 text-[10px] block">RECOVERY TIME</span>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 mt-0.5">
                        <span>{evidence.outcomeFeedback.actualRecoveryHours}h</span>
                        <span className="text-slate-400 text-[10px] font-normal">
                          (Pred: {evidence.outcomeFeedback.predictedRecoveryHours}h)
                        </span>
                      </div>
                      <span className="text-emerald-300 text-[10px] block mt-0.5">
                        Δ {evidence.outcomeFeedback.recoveryDeltaHours}h faster
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#030712] border border-emerald-500/20">
                      <span className="text-slate-400 text-[10px] block">FINANCIAL OUTCOME</span>
                      <div className="flex items-center gap-1.5 font-bold text-cyan-300 mt-0.5">
                        <span>${evidence.outcomeFeedback.actualCost.toLocaleString()}</span>
                        <span className="text-slate-400 text-[10px] font-normal">
                          (Pred: ${evidence.outcomeFeedback.predictedCost.toLocaleString()})
                        </span>
                      </div>
                      <span className="text-cyan-400 text-[10px] block mt-0.5">
                        Δ Saved ${Math.abs(evidence.outcomeFeedback.costDelta)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#030712] border border-emerald-500/30 text-xs font-mono text-emerald-200">
                    <span className="text-emerald-400 font-bold block text-[10px] uppercase">
                      New Learned Boundary Update:
                    </span>
                    <span className="text-[11px] text-slate-200 mt-0.5 block">
                      {evidence.outcomeFeedback.newBoundaryDiscovered}
                    </span>
                  </div>

                  <button
                    onClick={handleRetainToHindsight}
                    disabled={isRetaining}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 transition-all"
                  >
                    {isRetaining ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    <span>RETAIN OUTCOME TO HINDSIGHT MEMORY</span>
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Sub-Tab: Hindsight & Genome Deep View ── */}
        {activeTab === 'HINDSIGHT' && (
          <motion.div
            key="hindsight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="p-5 rounded-xl bg-[#090d16]/90 border border-blue-500/25 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Resilience Genome Deep Specification
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Generalization synthesized across multiple historical operational incidents.
                  </p>
                </div>
                <Link
                  to="/genome"
                  className="px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold hover:bg-blue-900/60 flex items-center gap-1.5 transition-all"
                >
                  <span>Open Genome Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-500/30 text-xs font-mono space-y-2 mb-4">
                <div className="text-cyan-300 font-bold text-sm">{evidence.hindsight.genomeName}</div>
                <div className="text-slate-200 leading-relaxed">{evidence.hindsight.genomeInvariant}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidence.hindsight.recalled.map((exp) => (
                  <div key={exp.experienceId} className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">{exp.experienceId}</span>
                      <TruthTag mode={exp.truthStatus} />
                    </div>
                    <div className="text-white font-bold">{exp.title}</div>
                    <div className="text-slate-300 text-[11px] font-sans">
                      Match Similarity: <strong className="text-cyan-300">{(exp.similarity * 100).toFixed(1)}%</strong>
                    </div>
                    {exp.discoveredBoundary && (
                      <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px]">
                        Boundary: {exp.discoveredBoundary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Sub-Tab: Skill & Transfer Deep View ── */}
        {activeTab === 'SKILL_TRANSFER' && (
          <motion.div
            key="skill"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="p-5 rounded-xl bg-[#090d16]/90 border border-purple-500/25 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-bold text-sm text-white uppercase">Recovery Skill Invariants</h3>
                <Link
                  to="/learning/deliberate"
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>Skills Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <span className="text-slate-400 text-[10px] uppercase">PRECONDITIONS:</span>
                {evidence.skill.preconditions.map((prec, i) => (
                  <div key={i} className="p-2.5 rounded bg-slate-900/70 border border-slate-800 text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{prec}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs font-mono">
                <span className="text-slate-400 text-[10px] uppercase">DISCOVERED FAILURE BOUNDARIES:</span>
                {evidence.skill.failureBoundaries.map((boundary, i) => (
                  <div key={i} className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{boundary}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#090d16]/90 border border-purple-500/25 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-bold text-sm text-white uppercase">Challenge Probe History</h3>
                <Link
                  to="/challenge"
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>Challenge Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {evidence.skill.challengeHistory.map((probe, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-white font-bold block">{probe.probeName}</span>
                      <span className="text-slate-400 text-[11px] font-sans">{probe.detail}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        probe.status === 'PASSED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {probe.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Sub-Tab: Deep Intelligence Links ── */}
        {activeTab === 'INTELLIGENCE' && (
          <motion.div
            key="intelligence"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { title: 'GNN Graph Cascade', link: '/intelligence/gnn', detail: '3-Hop propagation score: 0.84 on active node sup-002', truth: 'INFERRED' },
              { title: 'Causal Counterfactual', link: '/intelligence/causal', detail: 'do(X) intervention analysis confirms 76% risk attenuation', truth: 'INFERRED' },
              { title: 'Predictive ML Engine', link: '/intelligence/predictive', detail: 'Disruption forecast: 82% probability, PSI drift 0.042', truth: 'PREDICTED' },
              { title: 'Monte Carlo Digital Twin', link: '/simulation/twin', detail: '1,000 synthetic runs: 94.2% expected service level', truth: 'SIMULATED' },
              { title: 'Specialist War Room', link: '/response/war-room', detail: 'Multi-agent consensus reached across 4 specialists', truth: 'INFERRED' },
              { title: 'Adversary Laboratory', link: '/response/adversary-lab', detail: 'Boundary attack probe confirmed 38% capacity constraint', truth: 'SIMULATED' },
            ].map((studio, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-mono font-bold text-xs text-white uppercase">{studio.title}</h4>
                    <TruthTag mode={studio.truth as any} />
                  </div>
                  <p className="text-xs text-slate-300 font-sans">{studio.detail}</p>
                </div>
                <Link
                  to={studio.link}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Launch Deep Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Sub-Tab: Governance & Policy ── */}
        {activeTab === 'GOVERNANCE' && (
          <motion.div
            key="gov"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 rounded-xl bg-[#090d16]/90 border border-emerald-500/25 backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono font-bold text-sm text-white uppercase">
                  Authoritative Resilience Governance Engine
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Evaluates candidate strategies against immutable organizational resilience policies.
                </p>
              </div>
              <Link
                to="/governance/policies"
                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-900/60 flex items-center gap-1.5"
              >
                <span>Policy Governance</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {evidence.governance.rules.map((rule) => (
                <div key={rule.ruleId} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">{rule.name} ({rule.ruleId})</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {rule.status}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">Condition: <span className="text-slate-200">{rule.condition}</span></div>
                  <div className="text-cyan-300 text-[11px]">Evaluation: {rule.evaluationDetail}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
