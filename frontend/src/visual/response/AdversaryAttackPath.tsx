/**
 * AdversaryAttackPath — Visual Attack Vector & Resilience Breakdown
 * Phase 13C: Response & Decision Visualization
 *
 * Flow: BASE PLAN → ATTACK VECTOR → FAILURE CONDITION → IMPACT → RESILIENCE RESULT
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Swords, AlertTriangle, ShieldCheck, Zap, ArrowRight, Target } from 'lucide-react';
import { StatusPill } from '../telemetry/StatusPill';

export interface AdversaryAttackPathProps {
  attackId: string;
  attackType: string;
  targetNodeId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactDescription: string;
  resilienceScore?: number;
}

export const AdversaryAttackPath: React.FC<AdversaryAttackPathProps> = ({
  attackId,
  attackType,
  targetNodeId,
  severity,
  impactDescription,
  resilienceScore = 0.85,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'CRITICAL': return '#f87171';
      case 'HIGH': return '#fb923c';
      case 'MEDIUM': return '#fbbf24';
      default: return '#34d399';
    }
  };

  const color = getSeverityColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-[#090d16]/90 border border-amber-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3 font-sans"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold uppercase">
          <Target className="w-4 h-4 text-amber-400" />
          <span>{attackId} — {attackType}</span>
        </div>
        <StatusPill color={color} label={severity} />
      </div>

      {/* Attack Vector Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center text-center font-mono text-xs">
        <div className="p-2.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-500 uppercase">Attack Surface</span>
          <strong className="text-white">{targetNodeId}</strong>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 flex flex-col gap-0.5">
          <span className="text-[9px] text-amber-400 uppercase">Attack Vector</span>
          <strong className="text-amber-200">{attackType}</strong>
        </div>

        <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 flex flex-col gap-0.5">
          <span className="text-[9px] text-red-400 uppercase">Simulated Impact</span>
          <strong className="text-slate-200 text-[11px] font-sans truncate">{impactDescription}</strong>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-0.5">
          <span className="text-[9px] text-emerald-400 uppercase">Plan Resilience</span>
          <strong className="text-emerald-300">{(resilienceScore * 100).toFixed(0)}% PASSED</strong>
        </div>
      </div>
    </motion.div>
  );
};
