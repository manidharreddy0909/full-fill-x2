/**
 * AgentMemoryTimeline — Structured Institutional Knowledge timeline
 * Phase 13B: Intelligence Visualization
 *
 * Flow: PAST OUTCOME → OBSERVATION → LESSON → FUTURE GUIDANCE
 * Uses real AgentMemory entries.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Database, ShieldCheck, ArrowRight, Award } from 'lucide-react';
import { AgentMemory } from '../../types/learning';
import { StatusPill } from '../telemetry/StatusPill';

export interface AgentMemoryTimelineProps {
  memories: AgentMemory[];
}

export const AgentMemoryTimeline: React.FC<AgentMemoryTimelineProps> = ({ memories }) => {
  return (
    <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-[#090d16]/90 border border-violet-500/20 backdrop-blur-xl shadow-2xl font-sans">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-2 text-violet-300 font-bold uppercase tracking-wider">
          <Database className="w-4 h-4 text-violet-400" />
          <span>Institutional Memory Timeline</span>
        </div>
        <StatusPill color="#a855f7" label={`${memories.length} ENTRIES`} />
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 font-mono text-xs">
        {memories.map((mem, idx) => (
          <motion.div
            key={mem.memory_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06 }}
            className="p-3 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1.5 hover:border-violet-500/30 transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-violet-400 font-bold">{mem.memory_type}</span>
              <span>{new Date(mem.created_at).toLocaleDateString()}</span>
            </div>

            <p className="text-xs text-slate-200 font-sans leading-relaxed">{mem.lesson}</p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
              <span>Status: <strong className="text-emerald-400">{mem.status}</strong></span>
              <span>Confidence: <strong className="text-amber-400">{(mem.confidence * 100).toFixed(0)}%</strong></span>
            </div>
          </motion.div>
        ))}

        {memories.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-8">
            No institutional memory logs recorded for this agent.
          </div>
        )}
      </div>
    </div>
  );
};
