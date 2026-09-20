/**
 * CausalDAGPrimitive — Structural Causal DAG & Counterfactual Sandbox
 * Phase 13B: Intelligence Visualization
 *
 * Flow: CAUSE → MECHANISM → EFFECT
 * Visualizes causal hypotheses, evidence confidence levels, and counterfactual intervention paths.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { GitMerge, ArrowRight, ShieldCheck, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { StatusPill } from '../telemetry/StatusPill';

export interface CausalNode {
  id: string;
  name: string;
  role: 'CAUSE' | 'MECHANISM' | 'EFFECT';
  confidence?: number;
}

export interface CausalDAGPrimitiveProps {
  rootCauseNodeId: string;
  targetEffectNodeId: string;
  mechanismSummary: string;
  evidenceStatus: string;
  confidenceScore: number;
  counterfactualResult?: any;
}

export const CausalDAGPrimitive: React.FC<CausalDAGPrimitiveProps> = ({
  rootCauseNodeId,
  targetEffectNodeId,
  mechanismSummary,
  evidenceStatus,
  confidenceScore,
  counterfactualResult,
}) => {
  const getStatusColor = () => {
    switch (evidenceStatus) {
      case 'SANDBOX_COUNTERFACTUAL': return '#34d399';
      case 'HIGH_CONFIDENCE_HYPOTHESIS': return '#a855f7';
      default: return '#fbbf24';
    }
  };

  const color = getStatusColor();

  return (
    <div className="p-5 rounded-xl bg-[#090d16]/90 border border-purple-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-purple-300 uppercase tracking-wider">
          <GitMerge className="w-4 h-4 text-purple-400" />
          <span>Structural Causal Graph (DAG)</span>
        </div>
        <StatusPill color={color} label={evidenceStatus.replace(/_/g, ' ')} />
      </div>

      {/* Cause -> Mechanism -> Effect Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-2">
        {/* Cause Node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-[#030712]/90 border border-red-500/40 flex flex-col gap-1 shadow-lg text-center"
        >
          <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">Root Cause</div>
          <div className="text-sm font-bold text-white font-mono">{rootCauseNodeId}</div>
          <div className="text-[10px] text-slate-400">Primary Disruption Source</div>
        </motion.div>

        {/* Mechanism Arrow & Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col gap-1 text-center shadow-md relative"
        >
          <div className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">Causal Mechanism</div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">{mechanismSummary}</p>
          <div className="text-[9px] font-mono text-slate-400 mt-1">Confidence: {(confidenceScore * 100).toFixed(0)}%</div>
        </motion.div>

        {/* Effect Node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-[#030712]/90 border border-amber-500/40 flex flex-col gap-1 shadow-lg text-center"
        >
          <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Downstream Effect</div>
          <div className="text-sm font-bold text-white font-mono">{targetEffectNodeId}</div>
          <div className="text-[10px] text-slate-400">Impacted Fulfillment Node</div>
        </motion.div>
      </div>

      {/* Counterfactual Simulation Path Result if Present */}
      {counterfactualResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 font-mono text-xs flex flex-col gap-2"
        >
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Counterfactual Intervention Run</span>
            </span>
            <span>{counterfactualResult.status || 'VERIFIED'}</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {counterfactualResult.summary || counterfactualResult.outcome_description || 'Intervention prevents downstream cascade.'}
          </p>
        </motion.div>
      )}
    </div>
  );
};
