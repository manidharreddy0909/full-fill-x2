/**
 * AgentReasoningPipeline — Structured operational reasoning pipeline
 * Phase 13B: Intelligence Visualization
 *
 * Pipeline stages: SIGNAL → ANALYSIS → HYPOTHESIS → PROPOSAL → VALIDATION
 * Uses ONLY structured data returned by backend APIs. No fake chain-of-thought.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Search, BrainCircuit, FileSpreadsheet, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusPill } from '../telemetry/StatusPill';

export interface ReasoningStageItem {
  stage: 'SIGNAL' | 'ANALYSIS' | 'HYPOTHESIS' | 'PROPOSAL' | 'VALIDATION';
  label: string;
  detail: string;
  status: 'IDLE' | 'ACTIVE' | 'COMPLETED' | 'WARNING' | 'FAILED';
  metrics?: Record<string, string | number>;
}

export interface AgentReasoningPipelineProps {
  stages: ReasoningStageItem[];
  currentVisualState?: string;
  confidence?: number;
}

const getStageIcon = (stage: ReasoningStageItem['stage']) => {
  switch (stage) {
    case 'SIGNAL': return <Radio className="w-4 h-4 text-cyan-400" />;
    case 'ANALYSIS': return <Search className="w-4 h-4 text-blue-400" />;
    case 'HYPOTHESIS': return <BrainCircuit className="w-4 h-4 text-purple-400" />;
    case 'PROPOSAL': return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
    case 'VALIDATION': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
  }
};

const getStageColor = (status: ReasoningStageItem['status']) => {
  switch (status) {
    case 'COMPLETED': return '#34d399';
    case 'ACTIVE': return '#38bdf8';
    case 'WARNING': return '#fbbf24';
    case 'FAILED': return '#f87171';
    default: return '#475569';
  }
};

export const AgentReasoningPipeline: React.FC<AgentReasoningPipelineProps> = ({
  stages,
  currentVisualState,
  confidence,
}) => {
  return (
    <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-[#090d16]/90 border border-purple-500/20 backdrop-blur-xl shadow-2xl font-sans">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Operational Reasoning Pipeline
          </span>
        </div>
        {confidence !== undefined && (
          <StatusPill color="#34d399" label={`CONFIDENCE: ${(confidence * 100).toFixed(0)}%`} />
        )}
      </div>

      <div className="space-y-3">
        {stages.map((stg, idx) => {
          const color = getStageColor(stg.status);
          const isCurrent = currentVisualState === stg.stage || stg.status === 'ACTIVE';

          return (
            <motion.div
              key={stg.stage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="relative p-3 rounded-lg bg-[#030712]/90 border flex flex-col gap-1.5 transition-all"
              style={{
                borderColor: isCurrent ? '#a855f7' : `${color}30`,
                boxShadow: isCurrent ? '0 0 12px rgba(168,85,247,0.2)' : 'none',
              }}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 font-bold">
                  {getStageIcon(stg.stage)}
                  <span className="text-slate-200 tracking-wide">{stg.label}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    borderColor: `${color}40`,
                  }}
                >
                  {stg.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{stg.detail}</p>

              {stg.metrics && (
                <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                  {Object.entries(stg.metrics).map(([k, v]) => (
                    <span key={k}>
                      {k}: <strong className="text-cyan-300">{v}</strong>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
