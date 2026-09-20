import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCockpitStatus,
  createCockpitSession,
  runCockpitLoop,
  approveCockpitPlan,
  rejectCockpitPlan,
  resetCockpitSession,
} from '../../api/cockpitApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import {
  Activity, Cpu, Play, CheckCircle2, XCircle, ChevronRight,
  RefreshCw, BarChart3, Clock, ShieldCheck, AlertTriangle, Gavel,
} from 'lucide-react';
import { DecisionSession, DecisionStage, DecisionStageRecord } from '../../types/cockpit';

const STAGE_ORDER: DecisionStage[] = [
  'OBSERVING',
  'ANALYZING_RISK',
  'RUNNING_SPECIALISTS',
  'COORDINATING',
  'ADVERSARIAL_TESTING',
  'OPTIMIZING',
  'VERIFYING',
  'READY_FOR_APPROVAL',
];

const stageLabel: Record<string, string> = {
  OBSERVING: 'Observe',
  ANALYZING_RISK: 'Risk Analysis',
  RUNNING_SPECIALISTS: 'Specialists',
  COORDINATING: 'Coordinate',
  ADVERSARIAL_TESTING: 'Stress Test',
  OPTIMIZING: 'Optimize',
  VERIFYING: 'Verify',
  READY_FOR_APPROVAL: 'Approve',
};

const stageStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return '#34d399';
    case 'RUNNING': return '#60a5fa';
    case 'FAILED': return '#f87171';
    case 'PARTIAL': return '#fbbf24';
    default: return '#475569';
  }
};

export const CockpitWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const qc = useQueryClient();
  const [activeSession, setActiveSession] = useState<DecisionSession | null>(null);

  useEffect(() => {
    setEnvironmentMode('DECISION');
  }, [setEnvironmentMode]);

  const { data: cockpitStatus } = useQuery({
    queryKey: ['cockpitStatus'],
    queryFn: fetchCockpitStatus,
  });

  const createMutation = useMutation({
    mutationFn: ({ preset, seed }: { preset: string; seed: number }) =>
      createCockpitSession(preset, seed),
    onSuccess: (session) => setActiveSession(session),
  });

  const runLoopMutation = useMutation({
    mutationFn: (sessionId: string) => runCockpitLoop(sessionId),
    onSuccess: (session) => setActiveSession(session),
  });

  const approveMutation = useMutation({
    mutationFn: ({ sessionId, planId }: { sessionId: string; planId: string }) =>
      approveCockpitPlan(sessionId, planId),
    onSuccess: (session) => setActiveSession(session),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ sessionId, planId }: { sessionId: string; planId: string }) =>
      rejectCockpitPlan(sessionId, planId),
    onSuccess: (session) => setActiveSession(session),
  });

  const resetMutation = useMutation({
    mutationFn: (sessionId: string) => resetCockpitSession(sessionId),
    onSuccess: (session) => setActiveSession(session),
  });

  const isRunning =
    createMutation.isPending ||
    runLoopMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;

  const currentStageIndex = activeSession
    ? STAGE_ORDER.indexOf(activeSession.current_stage)
    : -1;

  const stageRecords: Record<string, DecisionStageRecord> =
    activeSession?.timeline.stages.reduce((acc, s) => {
      acc[s.stage] = s;
      return acc;
    }, {} as Record<string, DecisionStageRecord>) || {};

  const candidatePlans = activeSession?.coordination_result?.candidate_plans || [];

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Decision Cockpit — Autonomous Pipeline Orchestrator</h1>
            <p className="text-xs text-slate-400">
              v{cockpitStatus?.version || '—'} · Sessions: {cockpitStatus?.active_sessions_count ?? 0} active ·{' '}
              State mutation safety: {cockpitStatus?.state_mutation_safety ? '✓ ENFORCED' : '✗ DISABLED'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {!activeSession ? (
            <>
              <button
                onClick={() => createMutation.mutate({ preset: 'healthy', seed: 42 })}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-blue-600/30"
              >
                {createMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>NEW SESSION (HEALTHY)</span>
              </button>
              <button
                onClick={() => createMutation.mutate({ preset: 'double_punch', seed: 42 })}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900 text-white text-xs font-mono font-semibold transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>NEW SESSION (CRISIS)</span>
              </button>
            </>
          ) : (
            <>
              {activeSession.current_stage === 'READY_FOR_APPROVAL' || activeSession.workflow_status === 'IN_PROGRESS' ? (
                <button
                  onClick={() => runLoopMutation.mutate(activeSession.session_id)}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white text-xs font-mono font-semibold transition-all"
                >
                  {runLoopMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>ADVANCE PIPELINE</span>
                </button>
              ) : null}

              <button
                onClick={() => resetMutation.mutate(activeSession.session_id)}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-mono font-semibold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pipeline Stage Progress Rail */}
      {activeSession && (
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {STAGE_ORDER.map((stage, i) => {
              const record = stageRecords[stage];
              const isActive = activeSession.current_stage === stage;
              const isCompleted = record?.status === 'COMPLETED';
              const isFailed = record?.status === 'FAILED';
              const color = stageStatusColor(record?.status || 'NOT_STARTED');

              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                      style={{
                        borderColor: isActive ? '#60a5fa' : color,
                        background: isCompleted ? `${color}20` : isActive ? 'rgba(96,165,250,0.15)' : 'rgba(30,41,59,0.8)',
                        boxShadow: isActive ? '0 0 12px rgba(96,165,250,0.4)' : 'none',
                        color,
                      }}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" style={{ color }} />
                        : isFailed ? <XCircle className="w-4 h-4 text-red-400" />
                        : isActive && isRunning ? <Activity className="w-4 h-4 animate-spin" style={{ color: '#60a5fa' }} />
                        : <span>{i + 1}</span>}
                    </div>
                    <span
                      className="text-[10px] font-mono text-center font-medium"
                      style={{ color: isActive ? '#fff' : '#64748b' }}
                    >
                      {stageLabel[stage]}
                    </span>
                    {record?.duration_ms > 0 && (
                      <span className="text-[8px] font-mono text-slate-500">{record.duration_ms}ms</span>
                    )}
                  </div>
                  {i < STAGE_ORDER.length - 1 && (
                    <div
                      className="flex-1 h-0.5 min-w-[20px]"
                      style={{
                        background: i < currentStageIndex
                          ? 'rgba(52,211,153,0.6)'
                          : 'rgba(71,85,105,0.4)',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Session Metadata */}
          <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800 mt-3 font-mono text-xs">
            <span className="text-slate-400">Session: <strong className="text-slate-200">{activeSession.session_id.slice(-8)}</strong></span>
            <span className="text-slate-400">Stage: <strong className="text-blue-300">{activeSession.current_stage}</strong></span>
            <span className="text-slate-400">Status: <strong className="text-slate-200">{activeSession.workflow_status}</strong></span>
            {activeSession.summary && (
              <>
                <span className="text-slate-400">Health: <strong className="text-emerald-400">{(activeSession.summary.network_health_score * 100).toFixed(1)}%</strong></span>
                <span className="text-slate-400">Critical Risks: <strong className="text-red-400">{activeSession.summary.critical_risk_count}</strong></span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      {activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stage Timeline */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {activeSession.timeline.stages.map((stageRec) => (
              <div
                key={stageRec.stage}
                className="p-4 rounded-xl bg-slate-900/80 border backdrop-blur-md"
                style={{ borderColor: `${stageStatusColor(stageRec.status)}33` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-200">{stageRec.stage.replace(/_/g, ' ')}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                    style={{
                      color: stageStatusColor(stageRec.status),
                      background: `${stageStatusColor(stageRec.status)}20`,
                      border: `1px solid ${stageStatusColor(stageRec.status)}40`,
                    }}
                  >
                    {stageRec.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{stageRec.summary}</p>
                {stageRec.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {stageRec.errors.map((err, i) => (
                      <div key={i} className="text-[10px] font-mono text-red-400">⚠ {err}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {activeSession.timeline.stages.length === 0 && (
              <div className="text-center text-slate-500 font-mono text-xs py-8">
                Advance the pipeline to see stage records.
              </div>
            )}
          </div>

          {/* Right: Candidate Plans + Approval */}
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
              <h3 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Candidate Plans ({candidatePlans.length})</span>
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {candidatePlans.map((plan: any) => (
                  <div key={plan.candidate_id} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono text-blue-300">{plan.candidate_id}</div>
                        <div className="text-sm font-bold text-white">{plan.name}</div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                        plan.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        plan.status === 'REJECTED' ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>{plan.status}</span>
                    </div>

                    <p className="text-[10px] text-slate-400">{plan.description}</p>

                    <div className="flex gap-2 text-[10px] font-mono">
                      <span className="text-slate-400">Cost: <strong className="text-emerald-400">${plan.estimated_total_cost?.toLocaleString()}</strong></span>
                      <span className="text-slate-400">Delay: <strong className="text-amber-400">+{plan.estimated_max_delay_hours}h</strong></span>
                    </div>

                    {activeSession.current_stage === 'READY_FOR_APPROVAL' &&
                     plan.status !== 'APPROVED' && plan.status !== 'REJECTED' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => approveMutation.mutate({ sessionId: activeSession.session_id, planId: plan.candidate_id })}
                          disabled={isRunning}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white text-[11px] font-mono font-semibold transition-all"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>APPROVE</span>
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate({ sessionId: activeSession.session_id, planId: plan.candidate_id })}
                          disabled={isRunning}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white text-[11px] font-mono font-semibold transition-all"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>REJECT</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {candidatePlans.length === 0 && (
                  <div className="text-center text-slate-500 font-mono text-xs py-6">
                    Advance pipeline to generate candidate plans.
                  </div>
                )}
              </div>
            </div>

            {/* Approval Decision */}
            {activeSession.approval_decision && (
              <div className={`p-4 rounded-xl border backdrop-blur-md ${
                activeSession.approval_decision.status === 'APPROVED'
                  ? 'bg-emerald-950/30 border-emerald-800'
                  : 'bg-red-950/30 border-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Gavel className={`w-4 h-4 ${activeSession.approval_decision.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`} />
                  <span className={`font-bold text-sm ${activeSession.approval_decision.status === 'APPROVED' ? 'text-emerald-300' : 'text-red-300'}`}>
                    {activeSession.approval_decision.status}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Plan: <strong>{activeSession.approval_decision.plan_name}</strong></div>
                  <div>Approver: <strong>{activeSession.approval_decision.approver}</strong></div>
                  <div className="text-slate-400">{activeSession.approval_decision.rationale}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!activeSession && !isRunning && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500 font-mono text-sm">
          <Cpu className="w-12 h-12 text-slate-700" />
          <div className="text-center">
            <div className="text-base font-semibold text-slate-300 mb-1">Decision Cockpit Standby</div>
            <div className="text-xs text-slate-500">Create a new session to initiate the autonomous decision pipeline.</div>
          </div>
        </div>
      )}
    </div>
  );
};
