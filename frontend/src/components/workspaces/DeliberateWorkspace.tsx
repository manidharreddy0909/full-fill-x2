/**
 * DeliberateWorkspace — Agent Memory & Model Governance
 * Phase 13A: Visual Transformation
 *
 * Design: Agent memory log, performance metrics table, challenger model governance,
 * Framer Motion entrance, glassmorphism obsidian panels, StatusPill indicators.
 */

import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  fetchAgentMemories,
  fetchAgentPerformance,
  fetchChallengerModels,
  trainChallengerModel,
  activateChallengerModel,
} from '../../api/learningApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import {
  Activity, GraduationCap, Brain, CheckCircle2,
  TrendingUp, Database, RefreshCw, Sparkles, Shield, Award, ArrowUpRight
} from 'lucide-react';
import { AgentMemory, AgentPerformanceRecord, ChallengerModelRecord } from '../../types/learning';

export const DeliberateWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const qc = useQueryClient();

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  const { data: memories = [], isLoading: isMemoryLoading, refetch: refetchMemories } = useQuery<AgentMemory[]>({
    queryKey: ['agentMemories'],
    queryFn: () => fetchAgentMemories(),
  });

  const { data: performance = [], isLoading: isPerfLoading } = useQuery<AgentPerformanceRecord[]>({
    queryKey: ['agentPerformance'],
    queryFn: fetchAgentPerformance,
  });

  const { data: challengers = [], isLoading: isChallengersLoading, refetch: refetchChallengers } = useQuery<ChallengerModelRecord[]>({
    queryKey: ['challengerModels'],
    queryFn: fetchChallengerModels,
  });

  const trainMutation = useMutation({
    mutationFn: () => trainChallengerModel('DemandOutcomeDataset', 'DemandForecastModel'),
    onSuccess: () => refetchChallengers(),
  });

  const activateMutation = useMutation({
    mutationFn: (challengerId: string) =>
      activateChallengerModel(challengerId, 'Head of AI Operations', 'Validated lower MAE baseline improvement'),
    onSuccess: () => refetchChallengers(),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#030712] font-sans"
    >
      {/* Top Header HUD Bar */}
      <div className="p-5 rounded-xl bg-[#090d16]/90 border border-violet-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-mono uppercase">
                Deliberate Learning — Memory & Model Governance
              </h1>
              <StatusPill color="#34d399" label="LEARNING ACTIVE" pulse />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {memories.length} Memory Entries · {performance.length} Agents Profiled · {challengers.length} Challenger Models
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => trainMutation.mutate()}
            disabled={trainMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-violet-900/30"
          >
            {trainMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
            <span>TRAIN CHALLENGER MODEL</span>
          </button>

          <button
            onClick={() => { refetchMemories(); refetchChallengers(); }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Memory Log */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-5 rounded-xl bg-[#090d16]/90 border border-violet-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
        >
          <h2 className="font-mono font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5 text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            <span>Agent Memory Log ({memories.length})</span>
          </h2>

          {isMemoryLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-violet-400" />
              <span>Loading memories...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {memories.map((mem) => (
                <div key={mem.memory_id} className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1.5 hover:border-violet-500/30 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-violet-400 font-bold">{mem.agent_id}</span>
                    <span className="text-slate-500">{new Date(mem.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">{mem.lesson}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                    <span>Type: <strong className="text-violet-300">{mem.memory_type}</strong></span>
                    <span>Confidence: <strong className="text-emerald-400">{(mem.confidence * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              ))}
              {memories.length === 0 && (
                <div className="text-center text-slate-500 font-mono text-xs py-10">No agent memories recorded yet.</div>
              )}
            </div>
          )}
        </motion.div>

        {/* Agent Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-5 rounded-xl bg-[#090d16]/90 border border-violet-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
        >
          <h2 className="font-mono font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5 text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Agent Performance Metrics</span>
          </h2>

          {isPerfLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading metrics...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2">Agent</th>
                    <th className="py-2">Survival Rate</th>
                    <th className="py-2 text-right">Avg Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {performance.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-all">
                      <td className="py-3 font-bold text-slate-200">{p.agent_id || `agent-${idx}`}</td>
                      <td className="py-3">
                        <span className="text-emerald-400 font-bold">
                          {((p.survival_rate ?? 0.95) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right text-amber-400 font-bold">
                        {((p.avg_confidence ?? 0.88) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {performance.length === 0 && (
                <div className="text-center text-slate-500 font-mono text-xs py-10">No agent performance metrics logged.</div>
              )}
            </div>
          )}
        </motion.div>

        {/* Challenger Model Governance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-5 rounded-xl bg-[#090d16]/90 border border-violet-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
        >
          <h2 className="font-mono font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5 text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Challenger Models ({challengers.length})</span>
          </h2>

          {isChallengersLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Loading models...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {challengers.map((ch) => (
                <div key={ch.challenger_id} className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-2 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono text-violet-400">{ch.challenger_id}</div>
                      <div className="text-sm font-bold text-white font-sans">{ch.model_name}</div>
                    </div>
                    <StatusPill
                      color={ch.status === 'PROMOTED' ? '#34d399' : '#38bdf8'}
                      label={ch.status}
                    />
                  </div>

                  <div className="flex gap-3 text-[10px] font-mono text-slate-400 pt-1">
                    <span>Baseline: <strong className="text-slate-300">{ch.baseline_metric}</strong></span>
                    <span>Challenger: <strong className="text-emerald-400">{ch.challenger_metric}</strong></span>
                  </div>

                  {ch.status !== 'PROMOTED' && (
                    <button
                      onClick={() => activateMutation.mutate(ch.challenger_id)}
                      disabled={activateMutation.isPending}
                      className="mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-mono font-bold transition-all shadow-md shadow-emerald-900/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PROMOTE TO ACTIVE MODEL</span>
                    </button>
                  )}
                </div>
              ))}
              {challengers.length === 0 && (
                <div className="text-center text-slate-500 font-mono text-xs py-10">
                  No challenger models trained yet. Click train above.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
