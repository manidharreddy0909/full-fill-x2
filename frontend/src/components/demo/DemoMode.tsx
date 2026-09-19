import React, { useEffect, useState } from 'react';
import {
  DemoScenario,
  DemoScenarioId,
  DemoSession,
  DemoStatus,
  DemoModeType,
  DemoReport,
} from '../../types/demo';
import {
  getDemoStatus,
  listDemoScenarios,
  startDemo,
  stepDemo,
  pauseDemo,
  resumeDemo,
  resetDemo,
  approveDemoPlan,
  rejectDemoPlan,
  getDemoReport,
} from '../../api/demoApi';
import { DemoScenarioSelector } from './DemoScenarioSelector';
import { DemoTimeline } from './DemoTimeline';
import { DemoControlBar } from './DemoControlBar';
import { DemoResult } from './DemoResult';
import { Play, Sparkles, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';

export const DemoMode: React.FC = () => {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<DemoScenarioId>(DemoScenarioId.DEMO_05);
  const [mode, setMode] = useState<DemoModeType>(DemoModeType.STEP);
  const [activeSession, setActiveSession] = useState<DemoSession | null>(null);
  const [report, setReport] = useState<DemoReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatusAndScenarios();
  }, []);

  const loadStatusAndScenarios = async () => {
    try {
      setLoading(true);
      const scList = await listDemoScenarios();
      setScenarios(scList);
      const statusRes = await getDemoStatus();
      if (statusRes.active_session) {
        setActiveSession(statusRes.active_session);
        setSelectedScenarioId(statusRes.active_session.scenario_id);
        setMode(statusRes.active_session.mode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo engine');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      setError(null);
      setReport(null);
      const session = await startDemo({
        scenario_id: selectedScenarioId,
        mode: mode,
        seed: 42,
      });
      setActiveSession(session);
    } catch (err: any) {
      setError(err.message || 'Failed to start demo session');
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    if (!activeSession) return;
    try {
      setLoading(true);
      setError(null);
      const updated = await stepDemo({ session_id: activeSession.session_id });
      setActiveSession(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to step demo');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!activeSession) return;
    try {
      setLoading(true);
      const updated = await pauseDemo(activeSession.session_id);
      setActiveSession(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!activeSession) return;
    try {
      setLoading(true);
      const updated = await resumeDemo(activeSession.session_id);
      setActiveSession(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setError(null);
      setReport(null);
      await resetDemo();
      setActiveSession(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!activeSession) return;
    try {
      setLoading(true);
      setError(null);
      const updated = await approveDemoPlan({
        session_id: activeSession.session_id,
        approver_name: 'Chief Supply Chain Officer',
        decision_rationale: 'Approved Plan C — Total Network Resilience',
        selected_plan_id: 'Candidate C',
      });
      setActiveSession(updated);

      // Fetch competition report
      const rep = await getDemoReport(activeSession.session_id);
      setReport(rep);
    } catch (err: any) {
      setError(err.message || 'Failed to approve plan');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeSession) return;
    try {
      setLoading(true);
      setError(null);
      const updated = await rejectDemoPlan(
        activeSession.session_id,
        'Chief Supply Chain Officer',
        'Rejected due to risk constraints'
      );
      setActiveSession(updated);
      const rep = await getDemoReport(activeSession.session_id);
      setReport(rep);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const status = activeSession?.status || DemoStatus.IDLE;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Phase 16 — Competition Demo Mode</span>
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-medium">
                Offline AI Ready
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              FULFILL-X Guided Judge Demonstration Console
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              100% deterministic, step-by-step presentation harness orchestrating World Model, Risk Engine, Multi-Agent Specialists, Adversarial Testing, Verification, Human Decision Gate, and Benchmark Evaluation.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadStatusAndScenarios}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title="Refresh Demo Engine Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scenario Selector */}
      <DemoScenarioSelector
        scenarios={scenarios}
        selectedId={selectedScenarioId}
        onSelect={(id) => setSelectedScenarioId(id)}
        disabled={status !== DemoStatus.IDLE && status !== DemoStatus.RESET}
      />

      {/* Control Bar */}
      <DemoControlBar
        status={status}
        mode={mode}
        onStart={handleStart}
        onStep={handleStep}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        onApprove={handleApprove}
        onReject={handleReject}
        onModeToggle={(m) => setMode(m)}
        loading={loading}
      />

      {/* Storyboard Timeline */}
      {activeSession && (
        <DemoTimeline
          timeline={activeSession.timeline}
          currentStepIndex={activeSession.current_step_index}
        />
      )}

      {/* Presentation Report */}
      {report && <DemoResult report={report} />}
    </div>
  );
};
