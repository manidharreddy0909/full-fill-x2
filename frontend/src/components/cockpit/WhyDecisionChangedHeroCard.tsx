/**
 * WhyDecisionChangedHeroCard — Hero UI Component (Phase 6F-6I, Section 83 & 84)
 *
 * Implements:
 * 1. "WHY DID THE DECISION CHANGE?" explanatory panel (Section 83)
 * 2. Contradiction Handling & 4-Zone Epistemic Model (Section 74 & 75)
 * 3. Calibrated Multi-Dimensional Confidences (Section 76)
 * 4. Observable Learning Delta (Section 84)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Brain,
  Dna,
  Workflow,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Scale,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { TruthTag } from '../common/TruthTag';

interface WhyDecisionChangedProps {
  previousStrategyName?: string;
  previousOutcome?: string;
  learnedCondition?: string;
  currentObservedValue?: string;
  transferVerdict?: 'TRANSFERABLE' | 'PARTIAL' | 'NON_TRANSFERABLE' | 'UNCERTAIN' | 'UNKNOWN' | string;
  activeDecisionVerdict?: string;
  alternativeStrategyName?: string;
  className?: string;
}

export const WhyDecisionChangedHeroCard: React.FC<WhyDecisionChangedProps> = ({
  previousStrategyName = 'Immediate Supplier Substitution (EXP-012)',
  previousOutcome = 'Succeeded in Incident #1 (Fast recovery under nominal demand)',
  learnedCondition = 'Supplier Spare Capacity >= 40.0% & Lead Time <= 72h',
  currentObservedValue = 'Supplier Spare Capacity = 38.0% (Capacity boundary breach detected)',
  transferVerdict = 'PARTIAL',
  activeDecisionVerdict = 'Previous substitution strategy REJECTED to avoid boundary failure',
  alternativeStrategyName = 'Dynamic Multi-Modal Buffer Buffer Rerouting + Expedited Air Freight',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'DECISION_CHANGE' | 'EPISTEMIC_ZONES' | 'CONFIDENCE_MATRIX' | 'LEARNING_DELTA'>('DECISION_CHANGE');

  return (
    <div className={`rounded-xl bg-[#090d16]/95 border-2 border-amber-500/40 backdrop-blur-xl shadow-2xl overflow-hidden font-mono ${className}`}>
      {/* ── Hero Header ── */}
      <div className="p-4 bg-gradient-to-r from-amber-950/50 via-slate-900/90 to-purple-950/40 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
            <Scale className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                CORE EXPERIENTIAL PROOF
              </span>
              <TruthTag mode="LEARNED" />
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                BOUNDARY ACTIVE
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              WHY DID THE DECISION CHANGE?
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveSubTab('DECISION_CHANGE')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                activeSubTab === 'DECISION_CHANGE' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Why It Changed
            </button>
            <button
              onClick={() => setActiveSubTab('EPISTEMIC_ZONES')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                activeSubTab === 'EPISTEMIC_ZONES' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4-Zone Model
            </button>
            <button
              onClick={() => setActiveSubTab('CONFIDENCE_MATRIX')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                activeSubTab === 'CONFIDENCE_MATRIX' ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calibrated Metrics
            </button>
            <button
              onClick={() => setActiveSubTab('LEARNING_DELTA')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                activeSubTab === 'LEARNING_DELTA' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Learning Delta
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Expanded Content ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 space-y-4"
          >
            {/* View 1: WHY DID THE DECISION CHANGE? (Section 83) */}
            {activeSubTab === 'DECISION_CHANGE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: Prior Baseline & Learned Boundary */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold uppercase tracking-wider text-slate-300">Previous Incident #1 Experience</span>
                      <TruthTag mode="OBSERVED" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                      <strong>{previousStrategyName}</strong>
                      <p className="text-[11px] text-emerald-400/80 mt-1">{previousOutcome}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Learned Invariant & Boundary:</span>
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 mt-1.5 flex items-start gap-2">
                      <Dna className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>GENOME-03 Boundary:</strong>
                        <p className="text-[11px] text-amber-200/90 mt-0.5">{learnedCondition}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Current Incident #2 & Resulting Shift */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold uppercase tracking-wider text-amber-300">Current Incident #2 Telemetry</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        TRANSFER: {transferVerdict}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 text-xs text-red-200">
                      <strong className="text-red-300">Observed Condition:</strong>
                      <p className="text-[11px] text-red-200 mt-1">{currentObservedValue}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] text-cyan-400 uppercase tracking-wider font-bold">Authoritative Action Shift:</span>
                    <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 mt-1.5 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-cyan-300">{activeDecisionVerdict}</strong>
                        <p className="text-[11px] text-slate-300 mt-1">
                          ↳ Selected: <span className="text-emerald-300 font-bold">{alternativeStrategyName}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: 4-Zone Epistemic Model (Section 75) */}
            {activeSubTab === 'EPISTEMIC_ZONES' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {/* KNOWN */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider">1. KNOWN</span>
                    <TruthTag mode="OBSERVED" />
                  </div>
                  <p className="text-[11px] text-slate-300">Observed repeatedly and verified under empirical operations.</p>
                  <div className="p-2 rounded bg-black/40 border border-emerald-500/20 text-[10px] text-emerald-300 font-mono">
                    Air expedite recovery window = 4.2h (+/- 0.3h)
                  </div>
                </div>

                {/* PROBABLE */}
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 uppercase tracking-wider">2. PROBABLE</span>
                    <TruthTag mode="SIMULATED" />
                  </div>
                  <p className="text-[11px] text-slate-300">Strong simulation evidence (1,000 Monte Carlo runs), awaiting real field completion.</p>
                  <div className="p-2 rounded bg-black/40 border border-blue-500/20 text-[10px] text-blue-300 font-mono">
                    P50 Service Level = 94.2% (P90 = 91.8%)
                  </div>
                </div>

                {/* UNCERTAIN */}
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 uppercase tracking-wider">3. UNCERTAIN</span>
                    <TruthTag mode="INFERRED" />
                  </div>
                  <p className="text-[11px] text-slate-300">Boundary-adjacent telemetry or conflicting multi-condition signals.</p>
                  <div className="p-2 rounded bg-black/40 border border-amber-500/20 text-[10px] text-amber-300 font-mono">
                    Spare capacity = 38% (Boundary = 40%)
                  </div>
                </div>

                {/* UNKNOWN */}
                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400 uppercase tracking-wider">4. UNKNOWN</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/40">SYSTEM HONESTY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Insufficient evidence. Never convert UNKNOWN into false confidence.</p>
                  <div className="p-2 rounded bg-black/40 border border-red-500/20 text-[10px] text-red-300 font-mono">
                    Demand elasticity under secondary port strike: UNKNOWN
                  </div>
                </div>
              </div>
            )}

            {/* View 3: Calibrated Confidence Matrix (Section 76) */}
            {activeSubTab === 'CONFIDENCE_MATRIX' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Memory Relevance</span>
                  <div className="text-lg font-bold text-cyan-400 mt-1">96.7%</div>
                  <p className="text-[10px] text-slate-500">Cosine embedding similarity to EXP-012</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Generalization Confidence</span>
                  <div className="text-lg font-bold text-purple-400 mt-1">91.2%</div>
                  <p className="text-[10px] text-slate-500">GENOME-03 induction support</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Transfer Confidence</span>
                  <div className="text-lg font-bold text-amber-400 mt-1">42.0% (BREACH)</div>
                  <p className="text-[10px] text-slate-500">Capacity 38% triggers boundary caution</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Simulation Confidence</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">94.2%</div>
                  <p className="text-[10px] text-slate-500">1,000 stochastic Monte Carlo runs</p>
                </div>
              </div>
            )}

            {/* View 4: Observable Learning Delta (Section 84) */}
            {activeSubTab === 'LEARNING_DELTA' && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Observable Hindsight Knowledge Evolution</span>
                  </span>
                  <TruthTag mode="LEARNED" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">BEFORE (Genome v1 / Skill v1)</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] mt-2 space-y-1">
                      <li>Boundary: Spare Capacity &gt;= 40.0%</li>
                      <li>Assumed demand sensitivity was negligible</li>
                      <li>Single supplier substitution procedure</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">AFTER OUTCOME RETENTION (Genome v2 / Skill v2)</span>
                    <ul className="list-disc list-inside text-emerald-200 text-[11px] mt-2 space-y-1">
                      <li>Boundary: Spare Capacity &gt;= 40.0% + Demand Surge threshold</li>
                      <li>Discovered: Multi-modal buffer prevents cascading stockout</li>
                      <li>Outcome Persisted: EXP-GEN-8422 committed to continuous memory</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
