import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { triggerDeliberation } from '../../api/learningApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAgentStore } from '../../store/agentStore';
import {
  Activity, Shield, Users, Zap, CheckCircle2, XCircle,
  AlertTriangle, Clock, Play, MessageSquare, Brain,
} from 'lucide-react';
import { DeliberationSession, ConsensusStatus } from '../../types/learning';

const consensusColor: Record<ConsensusStatus, string> = {
  UNANIMOUS: '#34d399',
  SUPERMAJORITY: '#60a5fa',
  DISAGREEMENT: '#fbbf24',
  REJECTED_BY_VERIFICATION: '#f87171',
};

const consensusIcon = (status: ConsensusStatus) => {
  switch (status) {
    case 'UNANIMOUS': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'SUPERMAJORITY': return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
    case 'DISAGREEMENT': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'REJECTED_BY_VERIFICATION': return <XCircle className="w-4 h-4 text-red-400" />;
  }
};

export const WarRoomWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { agentStates } = useAgentStore();

  useEffect(() => {
    setEnvironmentMode('RESPONSE');
  }, [setEnvironmentMode]);

  const deliberationMutation = useMutation<DeliberationSession, Error, string[]>({
    mutationFn: (nodeIds) => triggerDeliberation(nodeIds),
  });

  const session = deliberationMutation.data;

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Specialist War Room — Multi-Agent Deliberation</h1>
            <p className="text-xs text-slate-400">Trigger autonomous agent deliberation to surface conflicts, agreements, and candidate plans</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => deliberationMutation.mutate(['sup-001', 'port-001'])}
            disabled={deliberationMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-red-600/30"
          >
            {deliberationMutation.isPending
              ? <Activity className="w-3.5 h-3.5 animate-spin" />
              : <Play className="w-3.5 h-3.5" />
            }
            <span>TRIGGER DELIBERATION</span>
          </button>

          <button
            onClick={() => deliberationMutation.mutate(['sup-002', 'wh-001', 'dc-001'])}
            disabled={deliberationMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-amber-900 text-white text-xs font-mono font-semibold transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>FULL NETWORK SCAN</span>
          </button>
        </div>
      </div>

      {/* Agent State Overview */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
          <Users className="w-4 h-4 text-purple-400" />
          <span>Active Specialist Agents ({Object.keys(agentStates).length})</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(agentStates).map(([id, state]) => (
            <div
              key={id}
              className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5 hover:border-slate-600 transition-all"
            >
              <div className="font-mono text-[10px] text-purple-300 uppercase font-bold truncate">{id}</div>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded self-start"
                style={{
                  background: state.visualState === 'IDLE' ? 'rgba(148,163,184,0.1)' : 'rgba(139,92,246,0.2)',
                  color: state.visualState === 'IDLE' ? '#94a3b8' : '#c084fc',
                  border: `1px solid ${state.visualState === 'IDLE' ? 'rgba(148,163,184,0.3)' : 'rgba(139,92,246,0.4)'}`,
                }}
              >
                {state.visualState}
              </span>
              <div className="text-[9px] text-slate-500 font-mono">{state.lastActive}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {deliberationMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 font-mono text-sm">
          <Activity className="w-8 h-8 animate-spin text-red-400" />
          <span>Agents deliberating... resolving conflicts and building consensus...</span>
        </div>
      )}

      {deliberationMutation.isError && (
        <div className="p-5 rounded-xl bg-red-950/30 border border-red-800 text-red-300 font-mono text-sm">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Deliberation failed: {deliberationMutation.error?.message}
        </div>
      )}

      {/* Session Results */}
      {session && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Header + Evidence Bundle */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Session Summary */}
            <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {consensusIcon(session.consensus_status)}
                  <span className="text-sm font-bold text-white font-mono">{session.deliberation_id?.slice(-12) || 'SESSION'}</span>
                </div>
                <span
                  className="font-mono text-xs font-bold px-3 py-1 rounded-lg"
                  style={{
                    background: `${consensusColor[session.consensus_status]}22`,
                    color: consensusColor[session.consensus_status],
                    border: `1px solid ${consensusColor[session.consensus_status]}55`,
                  }}
                >
                  {session.consensus_status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Target Nodes</div>
                  <div className="text-slate-200 font-bold mt-1">{session.target_node_ids?.join(', ') || '—'}</div>
                </div>
                <div className="p-3 rounded bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Debate Rounds</div>
                  <div className="text-purple-400 font-bold mt-1 text-lg">{session.rounds?.length || 0}</div>
                </div>
                <div className="p-3 rounded bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Final Decision</div>
                  <div className="text-cyan-400 font-bold mt-1 text-[11px]">{session.final_decision || 'Pending'}</div>
                </div>
              </div>
            </div>

            {/* Evidence Bundle */}
            {session.evidence_bundle && (
              <div className="p-5 rounded-xl bg-blue-950/20 border border-blue-900/60 backdrop-blur-md shadow-xl flex flex-col gap-3">
                <h3 className="font-semibold text-sm border-b border-blue-900/60 pb-2 text-blue-200 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span>Decision Evidence Bundle</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded bg-slate-950/80 border border-blue-900/40">
                    <div className="text-[10px] text-slate-400">World Snapshot</div>
                    <div className="text-blue-300 font-bold mt-1 truncate">{session.evidence_bundle.world_model_snapshot_id?.slice(-8) || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded bg-slate-950/80 border border-blue-900/40">
                    <div className="text-[10px] text-slate-400">Resilience Score</div>
                    <div className="text-emerald-400 font-bold mt-1">{(session.evidence_bundle.monte_carlo_resilience_score * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-3 rounded bg-slate-950/80 border border-blue-900/40">
                    <div className="text-[10px] text-slate-400">Verification</div>
                    <div className={`font-bold mt-1 ${session.evidence_bundle.verification_passed ? 'text-emerald-400' : 'text-red-400'}`}>
                      {session.evidence_bundle.verification_passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-slate-950/80 border border-blue-900/40">
                    <div className="text-[10px] text-slate-400">Hypothesis</div>
                    <div className="text-blue-300 font-bold mt-1 text-[10px] leading-tight">{session.evidence_bundle.primary_hypothesis?.slice(0, 40) || '—'}</div>
                  </div>
                </div>

                {session.evidence_bundle.adversary_counter_findings?.length > 0 && (
                  <div className="mt-1">
                    <div className="text-[10px] text-orange-400 font-mono font-bold uppercase mb-1.5">Adversary Counter-Findings</div>
                    {session.evidence_bundle.adversary_counter_findings.map((f: string, i: number) => (
                      <div key={i} className="text-[11px] text-slate-300 flex gap-1.5 mb-1">
                        <span className="text-orange-400 shrink-0">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Deliberation Rounds */}
          <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-col gap-4 shadow-xl">
            <h3 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Debate Rounds ({session.rounds?.length || 0})</span>
            </h3>

            <div className="space-y-4 overflow-y-auto max-h-[600px]">
              {session.rounds?.map((round) => (
                <div key={round.round_number} className="flex flex-col gap-2">
                  <div className="text-[10px] font-mono font-bold text-purple-300 uppercase flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-[9px]">
                      {round.round_number}
                    </span>
                    <span>Round {round.round_number} — {round.round_consensus ? '✓ Consensus Reached' : 'No Consensus'}</span>
                  </div>

                  {round.messages.map((msg, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-purple-300 font-bold text-[10px]">{msg.agent_id}</span>
                        <span className="text-[9px] text-slate-500">{(msg.confidence * 100).toFixed(0)}% conf.</span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{msg.argument}</p>
                      {msg.counter_argument && (
                        <p className="text-amber-400/80 text-[10px] font-sans mt-1.5 italic border-t border-slate-800 pt-1.5">
                          Counter: {msg.counter_argument}
                        </p>
                      )}
                      {msg.proposed_action && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-emerald-400 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="font-sans">{msg.proposed_action}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {(!session.rounds || session.rounds.length === 0) && (
                <div className="text-center text-slate-500 font-mono text-xs py-8 flex flex-col items-center gap-2">
                  <Clock className="w-8 h-8 text-slate-700" />
                  <span>No debate rounds recorded for this session.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!session && !deliberationMutation.isPending && !deliberationMutation.isError && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500 font-mono text-sm">
          <Shield className="w-12 h-12 text-slate-700" />
          <div className="text-center">
            <div className="text-base font-semibold text-slate-300 mb-1">War Room Standby</div>
            <div className="text-xs text-slate-500">Trigger a deliberation session to activate the multi-agent conflict resolution engine.</div>
          </div>
        </div>
      )}
    </div>
  );
};
