/**
 * CockpitWorkspace — Autonomous Pipeline Orchestrator
 * Phase 13A: Visual Transformation
 *
 * Design: Command flight deck aesthetic, stage timeline rail with glowing status rings,
 * real-time stage execution timeline, Candidate Plan approval card stack, Framer Motion entrance.
 */

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchCockpitStatus,
  createCockpitSession,
  runCockpitLoop,
  approveCockpitPlan,
  rejectCockpitPlan,
  resetCockpitSession,
} from '../../api/cockpitApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import {
  Activity, Cpu, Play, CheckCircle2, XCircle, ChevronRight,
  RefreshCw, BarChart3, Clock, ShieldCheck, AlertTriangle, Gavel,
  Sparkles, Layers, ArrowRight
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
    case 'RUNNING': return '#38bdf8';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#030712] font-sans"
    >
      {/* Header HUD Bar */}
      <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-mono uppercase">
                Decision Cockpit — Pipeline Orchestrator
              </h1>
              <StatusPill color="#38bdf8" label={`v${cockpitStatus?.version || '0.2.0'}`} />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Sessions: {cockpitStatus?.active_sessions_count ?? 0} Active · Safety Plane:{' '}
              <span className="text-emerald-400 font-semibold">
                {cockpitStatus?.state_mutation_safety ? 'ENFORCED' : 'OFF'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!activeSession ? (
            <>
              <button
                onClick={() => createMutation.mutate({ preset: 'healthy', seed: 42 })}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-900/30"
              >
                {createMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>NEW SESSION (HEALTHY)</span>
              </button>
              <button
                onClick={() => createMutation.mutate({ preset: 'double_punch', seed: 42 })}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-amber-900/30"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>NEW SESSION (CRISIS)</span>
              </button>
            </>
          ) : (
            <>
              {(activeSession.current_stage === 'READY_FOR_APPROVAL' || activeSession.workflow_status === 'IN_PROGRESS') && (
                <button
                  onClick={() => runLoopMutation.mutate(activeSession.session_id)}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-900/30"
                >
                  {runLoopMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>ADVANCE PIPELINE</span>
                </button>
              )}

              <button
                onClick={() => resetMutation.mutate(activeSession.session_id)}
                disabled={isRunning}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all border border-slate-700"
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {STAGE_ORDER.map((stage, i) => {
              const record = stageRecords[stage];
              const isActive = activeSession.current_stage === stage;
              const isCompleted = record?.status === 'COMPLETED';
              const isFailed = record?.status === 'FAILED';
              const color = stageStatusColor(record?.status || 'NOT_STARTED');

              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center gap-1.5 min-w-[85px]">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 transition-all shadow-sm"
                      style={{
                        borderColor: isActive ? '#38bdf8' : color,
                        background: isCompleted ? `${color}20` : isActive ? 'rgba(56,189,248,0.15)' : 'rgba(15,23,42,0.9)',
                        boxShadow: isActive ? '0 0 15px rgba(56,189,248,0.5)' : 'none',
                        color,
                      }}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" style={{ color }} />
                        : isFailed ? <XCircle className="w-4 h-4 text-red-400" />
                        : isActive && isRunning ? <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                        : <span>{i + 1}</span>}
                    </div>
                    <span
                      className="text-[10px] font-mono text-center font-semibold tracking-tight"
                      style={{ color: isActive ? '#ffffff' : '#64748b' }}
                    >
                      {stageLabel[stage]}
                    </span>
                    {record?.duration_ms > 0 && (
                      <span className="text-[8px] font-mono text-slate-500">{record.duration_ms}ms</span>
                    )}
                  </div>
                  {i < STAGE_ORDER.length - 1 && (
                    <div
                      className="flex-1 h-0.5 min-w-[20px] rounded"
                      style={{
                        background: i < currentStageIndex
                          ? 'rgba(52,211,153,0.7)'
                          : 'rgba(51,65,85,0.5)',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Session Metadata Strip */}
          <div className="flex flex-wrap gap-5 pt-3 border-t border-slate-800 mt-3 font-mono text-xs">
            <span className="text-slate-400">Session ID: <strong className="text-cyan-300">{activeSession.session_id.slice(-8)}</strong></span>
            <span className="text-slate-400">Current Stage: <strong className="text-blue-400">{activeSession.current_stage}</strong></span>
            <span className="text-slate-400">Status: <strong className="text-slate-200">{activeSession.workflow_status}</strong></span>
            {activeSession.summary && (
              <>
                <span className="text-slate-400">Health Index: <strong className="text-emerald-400">{(activeSession.summary.network_health_score * 100).toFixed(1)}%</strong></span>
                <span className="text-slate-400">Critical Risks: <strong className="text-red-400">{activeSession.summary.critical_risk_count}</strong></span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Execution View */}
      {activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Stage Execution Timeline */}
          <div className="lg:col-span-2 flex flex-col gap-3.5">
            {activeSession.timeline.stages.map((stageRec) => (
              <motion.div
                key={stageRec.stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[#090d16]/90 border backdrop-blur-xl shadow-lg transition-all hover:border-cyan-500/30"
                style={{ borderColor: `${stageStatusColor(stageRec.status)}33` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-200 tracking-wide uppercase">
                    {stageRec.stage.replace(/_/g, ' ')}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border shadow-sm"
                    style={{
                      color: stageStatusColor(stageRec.status),
                      background: `${stageStatusColor(stageRec.status)}15`,
                      borderColor: `${stageStatusColor(stageRec.status)}40`,
                    }}
                  >
                    {stageRec.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{stageRec.summary}</p>
                {stageRec.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {stageRec.errors.map((err, i) => (
                      <div key={i} className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {activeSession.timeline.stages.length === 0 && (
              <div className="text-center text-slate-500 font-mono text-xs py-12 bg-[#090d16]/50 rounded-xl border border-slate-800">
                Advance the pipeline to see real-time stage execution records.
              </div>
            )}
          </div>

          {/* Right Column: Reconciled Plans & Approvals */}
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5 text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Candidate Plans ({candidatePlans.length})</span>
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {candidatePlans.map((plan: any) => (
                  <div key={plan.candidate_id} className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-2 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono text-cyan-400">{plan.candidate_id}</div>
                        <div className="text-sm font-bold text-white font-sans">{plan.name}</div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 border ${
                        plan.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        plan.status === 'REJECTED' ? 'bg-red-950 text-red-400 border-red-800' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>{plan.status}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{plan.description}</p>

                    <div className="flex gap-3 text-[10px] font-mono pt-1">
                      <span className="text-slate-400">Cost: <strong className="text-emerald-400">${plan.estimated_total_cost?.toLocaleString()}</strong></span>
                      <span className="text-slate-400">Delay: <strong className="text-amber-400">+{plan.estimated_max_delay_hours}h</strong></span>
                    </div>

                    {activeSession.current_stage === 'READY_FOR_APPROVAL' &&
                     plan.status !== 'APPROVED' && plan.status !== 'REJECTED' && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => approveMutation.mutate({ sessionId: activeSession.session_id, planId: plan.candidate_id })}
                          disabled={isRunning}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-mono font-bold transition-all shadow-md shadow-emerald-900/30"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>APPROVE</span>
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate({ sessionId: activeSession.session_id, planId: plan.candidate_id })}
                          disabled={isRunning}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-[11px] font-mono font-bold transition-all shadow-md shadow-red-900/30"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>REJECT</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {candidatePlans.length === 0 && (
                  <div className="text-center text-slate-500 font-mono text-xs py-8">
                    Advance pipeline to generate candidate plans.
                  </div>
                )}
              </div>
            </div>

            {/* Approval Decision Card */}
            {activeSession.approval_decision && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${
                  activeSession.approval_decision.status === 'APPROVED'
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-red-950/30 border-red-500/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gavel className={`w-4 h-4 ${activeSession.approval_decision.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`} />
                  <span className={`font-mono font-bold text-sm uppercase ${activeSession.approval_decision.status === 'APPROVED' ? 'text-emerald-300' : 'text-red-300'}`}>
                    {activeSession.approval_decision.status}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Plan: <strong className="text-white">{activeSession.approval_decision.plan_name}</strong></div>
                  <div>Approver: <strong className="text-cyan-300">{activeSession.approval_decision.approver}</strong></div>
                  <div className="text-slate-400 font-sans mt-1">{activeSession.approval_decision.rationale}</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Standby State */}
      {!activeSession && !isRunning && (
        <div className="flex flex-col items-center justify-center py-28 gap-4 text-slate-500 font-mono text-sm">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
            <Cpu className="w-8 h-8" />
          </div>
          <div className="text-center max-w-md">
            <div className="text-base font-bold text-white mb-1">Decision Cockpit Ready</div>
            <div className="text-xs text-slate-400 font-sans">
              Initiate a new pipeline session above to launch full multi-agent observation, risk analysis, adversarial stress testing, and plan reconciliation.
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
