/**
 * CockpitWorkspace — Autonomous Pipeline Orchestrator & Decision Control
 * Phase 13C: Response & Decision Visualization
 *
 * Design: Command flight deck aesthetic, stage timeline rail with glowing status rings,
 * real-time stage execution timeline, PlanComparisonMatrix integration with REAL Approve/Reject actions.
 */

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
import { PlanComparisonMatrix } from '../../visual/response/PlanComparisonMatrix';
import {
  Activity, Cpu, Play, CheckCircle2, XCircle, ChevronRight,
  RefreshCw, BarChart3, Clock, ShieldCheck, AlertTriangle, Gavel
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

          {/* Session Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 mt-3 font-mono text-xs">
            <div className="px-3 py-1 rounded-md bg-[#030712] border border-cyan-500/30 text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-slate-400 text-[11px]">Session ID:</span>
              <strong className="text-cyan-300 font-bold">{activeSession.session_id.slice(-8)}</strong>
            </div>
            <div className="px-3 py-1 rounded-md bg-[#030712] border border-blue-500/30 text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-slate-400 text-[11px]">Current Stage:</span>
              <strong className="text-blue-400 font-bold">{activeSession.current_stage}</strong>
            </div>
            <div className="px-3 py-1 rounded-md bg-[#030712] border border-purple-500/30 text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <strong className="text-purple-300 font-bold">{activeSession.workflow_status}</strong>
            </div>
            {activeSession.summary && (
              <>
                <div className="px-3 py-1 rounded-md bg-[#030712] border border-emerald-500/30 text-slate-300 flex items-center gap-1.5 shadow-sm">
                  <span className="text-slate-400 text-[11px]">Health Index:</span>
                  <strong className="text-emerald-400 font-bold">{(activeSession.summary.network_health_score * 100).toFixed(1)}%</strong>
                </div>
                <div className="px-3 py-1 rounded-md bg-[#030712] border border-amber-500/30 text-slate-300 flex items-center gap-1.5 shadow-sm">
                  <span className="text-slate-400 text-[11px]">Critical Risks:</span>
                  <strong className="text-amber-400 font-bold">{activeSession.summary.active_disruption_count}</strong>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Execution & Plan Comparison View */}
      {activeSession && (
        <div className="flex flex-col gap-6">
          {/* Multi-Objective Candidate Plan Comparison Matrix */}
          <PlanComparisonMatrix
            plans={candidatePlans}
            onApprovePlan={(planId) => approveMutation.mutate({ sessionId: activeSession.session_id, planId })}
            onRejectPlan={(planId) => rejectMutation.mutate({ sessionId: activeSession.session_id, planId })}
            isPending={isRunning}
          />

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
      )}

      {/* Standby State */}
      {!activeSession && !isRunning && (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-slate-500 font-mono text-sm">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/50">
            <Cpu className="w-8 h-8" />
          </div>
          <div className="text-center max-w-md">
            <div className="text-base font-bold text-white mb-1">Decision Cockpit Ready</div>
            <div className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
              Initiate a new pipeline session below to launch full multi-agent observation, risk analysis, adversarial stress testing, and plan reconciliation.
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => createMutation.mutate({ preset: 'healthy', seed: 42 })}
                className="fx-btn-interactive px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-900/30 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>INITIALIZE BASELINE PIPELINE</span>
              </button>
              <button
                onClick={() => createMutation.mutate({ preset: 'double_punch', seed: 42 })}
                className="fx-btn-interactive px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-amber-900/30 flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>INITIALIZE CRISIS PIPELINE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
