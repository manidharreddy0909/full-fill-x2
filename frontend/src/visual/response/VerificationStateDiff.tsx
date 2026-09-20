/**
 * VerificationStateDiff — Decision Safety State Diff
 * Phase 13C: Response & Decision Visualization
 *
 * Flow: PROPOSED STATE → CONSTRAINT CHECK → FEASIBILITY → STATE DIFF → VERIFIED / REJECTED
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { StatusPill } from '../telemetry/StatusPill';

export interface StateDiffItem {
  entityId: string;
  property: string;
  before: string | number;
  after: string | number;
  status: 'PASSED' | 'WARNING' | 'FAILED';
}

export interface VerificationStateDiffProps {
  reportStatus: 'VERIFIED' | 'CONDITIONAL' | 'FAILED';
  diffs: StateDiffItem[];
}

export const VerificationStateDiff: React.FC<VerificationStateDiffProps> = ({
  reportStatus,
  diffs,
}) => {
  const getStatusColor = () => {
    switch (reportStatus) {
      case 'VERIFIED': return '#34d399';
      case 'CONDITIONAL': return '#fbbf24';
      default: return '#f87171';
    }
  };

  const color = getStatusColor();

  return (
    <div className="p-5 rounded-xl bg-[#090d16]/90 border border-emerald-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Decision State Diff & Feasibility Proof</span>
        </div>
        <StatusPill color={color} label={`SAFETY ${reportStatus}`} />
      </div>

      {/* State Diff Matrix */}
      <div className="space-y-2.5 font-mono text-xs">
        {diffs.map((d, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">{d.entityId}</span>
              <span className="text-[10px] text-slate-500">({d.property})</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-bold">
                {d.before}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-bold">
                {d.after}
              </span>
            </div>
          </motion.div>
        ))}

        {diffs.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-8">
            Run safety verification to generate before/after state diffs.
          </div>
        )}
      </div>
    </div>
  );
};
