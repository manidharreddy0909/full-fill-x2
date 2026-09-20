import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAgentMemories,
  fetchAgentPerformance,
  fetchChallengerModels,
  trainChallengerModel,
  activateChallengerModel,
} from '../../api/learningApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import {
  Activity, GraduationCap, Brain, Play, CheckCircle2,
  TrendingUp, Zap, Database, RefreshCw,
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

  const { data: performance = [], isLoading: isPerfLoading } = useQuery<any[]>({
    // AgentPerformanceRecord shape from backend
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
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-950/80 border border-violet-800/80 flex items-center justify-center text-violet-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Deliberate Learning — Agent Memory & Model Governance</h1>
            <p className="text-xs text-slate-400">
              {memories.length} memory entries · {performance.length} agents profiled · {challengers.length} challenger models
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => trainMutation.mutate()}
            disabled={trainMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-violet-600/30"
          >
            {trainMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
            <span>TRAIN CHALLENGER MODEL</span>
          </button>

          <button
            onClick={() => { refetchMemories(); refetchChallengers(); }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Memory Log */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            <span>Agent Memory Log ({memories.length})</span>
          </h2>

          {isMemoryLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-violet-400" />
              <span>Loading memories...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {memories.map((mem: AgentMemory) => (
                <div
                  key={mem.memory_id}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5 font-mono text-xs hover:border-violet-800/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-violet-300 font-bold">{mem.agent_id}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{
                        background: mem.memory_type === 'LESSON' || mem.memory_type === 'PATTERN'
                          ? 'rgba(139,92,246,0.2)' : 'rgba(148,163,184,0.1)',
                        color: mem.memory_type === 'LESSON' || mem.memory_type === 'PATTERN'
                          ? '#c084fc' : '#94a3b8',
                        border: `1px solid ${mem.memory_type === 'LESSON' || mem.memory_type === 'PATTERN'
                          ? 'rgba(139,92,246,0.4)' : 'rgba(148,163,184,0.3)'}`,
                      }}
                    >
                      {mem.memory_type}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{mem.lesson}</p>
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: `${Math.min(100, mem.confidence * 100)}px`,
                          background: mem.confidence > 0.7 ? '#34d399' : mem.confidence > 0.4 ? '#fbbf24' : '#f87171',
                        }}
                      />
                      <span className="text-[9px] text-slate-500">{(mem.confidence * 100).toFixed(0)}% conf.</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{mem.status === 'VALIDATED' ? '✓ validated' : mem.status?.toLowerCase()}</span>
                  </div>
                </div>
              ))}

              {memories.length === 0 && (
                <div className="text-center text-slate-500 font-mono text-xs py-8">
                  No agent memories recorded yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Agent Performance */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Agent Performance Records ({performance.length})</span>
          </h2>

          {isPerfLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading performance...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {performance.map((rec: AgentPerformanceRecord) => (
                <div
                  key={`${rec.agent_id}`}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-bold">{rec.agent_id}</span>
                    <span className="text-slate-400 text-[10px]">{rec.last_updated ? new Date(rec.last_updated).toLocaleDateString() : '—'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-500">Proposals</div>
                      <div className="text-slate-200 font-bold">{rec.proposals_count ?? '—'}</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-500">Survival Rate</div>
                      <div className="text-emerald-400 font-bold">{rec.survival_rate != null ? `${(rec.survival_rate * 100).toFixed(0)}%` : '—'}</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-500">Avg Confidence</div>
                      <div className="text-cyan-400 font-bold">{rec.avg_confidence != null ? `${(rec.avg_confidence * 100).toFixed(0)}%` : '—'}</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-500">Calibration MAE</div>
                      <div className="text-violet-400 font-bold">{rec.calibration_mae != null ? rec.calibration_mae.toFixed(4) : '—'}</div>
                    </div>
                  </div>
                </div>
              ))}

              {performance.length === 0 && (
                <div className="text-center text-slate-500 font-mono text-xs py-8">
                  No performance records available. Run specialists to generate data.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Challenger Models */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <span>Challenger Model Registry ({challengers.length})</span>
          </h2>

          {trainMutation.isPending && (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-violet-400" />
              <span>Training challenger model...</span>
            </div>
          )}

          {trainMutation.data && !trainMutation.isPending && (
            <div className="p-3 rounded-lg bg-violet-950/30 border border-violet-800/60 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-violet-300 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Training Complete
              </div>
              <div className="text-slate-400">
                Challenger: <strong className="text-slate-200">{trainMutation.data.challenger.model_name}</strong>
              </div>
              <div className="text-slate-400">
                Val MAE: <strong className="text-emerald-400">{trainMutation.data.run_result.val_mae?.toFixed(4) || '—'}</strong>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {challengers.map((ch: ChallengerModelRecord) => (
              <div
                key={ch.challenger_id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 font-mono text-xs hover:border-violet-800/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-violet-300 font-bold">{ch.challenger_id.slice(-8)}</div>
                    <div className="text-sm font-bold text-white mt-0.5">{ch.model_name}</div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                    ch.status === 'PROMOTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    ch.status === 'CANDIDATE' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    ch.status === 'REJECTED' ? 'bg-red-950 text-red-400 border border-red-800' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>{ch.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-slate-500">Challenger Metric</div>
                    <div className="text-cyan-400 font-bold">{ch.challenger_metric?.toFixed(4) ?? '—'}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-slate-500">Model ID</div>
                    <div className="text-slate-200 truncate text-[10px]">{ch.active_model_id?.slice(-10) || '—'}</div>
                  </div>
                </div>

                {ch.status === 'CANDIDATE' && (
                  <button
                    onClick={() => activateMutation.mutate(ch.challenger_id)}
                    disabled={activateMutation.isPending}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 text-white text-[11px] font-semibold transition-all"
                  >
                    {activateMutation.isPending
                      ? <Activity className="w-3 h-3 animate-spin" />
                      : <Zap className="w-3 h-3" />}
                    <span>ACTIVATE AS CHAMPION</span>
                  </button>
                )}

                <div className="text-[9px] text-slate-500">Trained: {ch.created_at ? new Date(ch.created_at).toLocaleString() : '—'}</div>
              </div>
            ))}

            {challengers.length === 0 && !isChallengersLoading && !trainMutation.isPending && (
              <div className="text-center text-slate-500 font-mono text-xs py-8">
                No challenger models. Click "Train Challenger Model" to start.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
