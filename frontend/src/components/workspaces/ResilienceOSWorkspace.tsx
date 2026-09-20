import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchResilienceScorecard,
  fetchSystemHealthStatus,
  setSystemOperationalMode,
  injectChaosFault,
  clearChaosFaults,
  executeResilienceCycle,
} from '../../api/enterpriseApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { SystemOperationalMode } from '../../types/enterprise';
import {
  Activity, Cpu, ShieldCheck, AlertTriangle, Zap, RefreshCw,
  Play, CheckCircle2, XCircle, Flame,
} from 'lucide-react';

const OPERATION_MODES: { mode: SystemOperationalMode; label: string; color: string }[] = [
  { mode: 'FULL', label: 'FULL', color: '#34d399' },
  { mode: 'DEGRADED_AI', label: 'DEGRADED AI', color: '#fbbf24' },
  { mode: 'DEGRADED_DATA', label: 'DEGRADED DATA', color: '#fb923c' },
  { mode: 'SAFE_MODE', label: 'SAFE MODE', color: '#f87171' },
];

export const ResilienceOSWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const [faultType, setFaultType] = useState<string>('LATENCY_SPIKE');
  const [faultSubsystem, setFaultSubsystem] = useState<string>('ai_service');

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  const { data: scorecard, isLoading: isScorecardLoading, refetch: refetchScorecard } = useQuery({
    queryKey: ['resilienceScorecard'],
    queryFn: fetchResilienceScorecard,
  });

  const { data: healthStatus, isLoading: isHealthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['systemHealthStatus'],
    queryFn: fetchSystemHealthStatus,
    refetchInterval: 15000,
  });

  const cycleMutation = useMutation({
    mutationFn: () => executeResilienceCycle(['sup-001', 'port-001'], 'Head of Resilience Operations', 'DRY_RUN'),
    onSuccess: () => { refetchScorecard(); refetchHealth(); },
  });

  const modeMutation = useMutation({
    mutationFn: (mode: SystemOperationalMode) => setSystemOperationalMode(mode),
    onSuccess: () => refetchHealth(),
  });

  const faultMutation = useMutation({
    mutationFn: () => injectChaosFault(faultType, faultSubsystem),
    onSuccess: () => refetchHealth(),
  });

  const clearFaultsMutation = useMutation({
    mutationFn: clearChaosFaults,
    onSuccess: () => refetchHealth(),
  });

  const currentMode: SystemOperationalMode = (healthStatus as any)?.mode || 'FULL';
  const isRunning = cycleMutation.isPending || modeMutation.isPending || faultMutation.isPending || clearFaultsMutation.isPending;

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Resilience OS — Enterprise Resilience Operations Platform</h1>
            <p className="text-xs text-slate-400">
              Operational Mode:{' '}
              <span className="font-bold font-mono" style={{
                  color: OPERATION_MODES.find(m => m.mode === currentMode)?.color || '#94a3b8'
                }}>
                {currentMode}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => cycleMutation.mutate()}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-emerald-600/30"
          >
            {cycleMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>EXECUTE RESILIENCE CYCLE (DRY RUN)</span>
          </button>

          <button
            onClick={() => { refetchScorecard(); refetchHealth(); }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scorecard */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Scorecard KPIs */}
          {scorecard && (
            <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl">
              <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Resilience Scorecard</span>
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(scorecard as Record<string, any>)
                  .filter(([key]) => typeof (scorecard as any)[key] === 'number')
                  .map(([key, value]) => {
                    const pct = typeof value === 'number' && value <= 1 ? value * 100 : value;
                    const isPct = typeof value === 'number' && value <= 1;
                    const color = isPct ? (pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171') : '#60a5fa';
                    return (
                      <div key={key} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
                        <div className="text-[10px] text-slate-400 uppercase">{key.replace(/_/g, ' ')}</div>
                        <div className="text-lg font-black mt-1" style={{ color }}>
                          {isPct ? `${pct.toFixed(1)}%` : typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </div>
                        {isPct && (
                          <div className="h-1 rounded-full bg-slate-800 mt-2 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Health Status */}
          {healthStatus && (
            <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl">
              <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>System Health Status</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                {Object.entries(healthStatus as Record<string, any>).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">{key.replace(/_/g, ' ')}</div>
                    <div className="font-bold text-slate-200 mt-1 truncate">
                      {typeof val === 'boolean'
                        ? (val ? <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /> : <XCircle className="w-4 h-4 text-red-400 inline" />)
                        : typeof val === 'number'
                        ? val.toFixed(3)
                        : String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cycleMutation.data && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                Resilience Cycle Complete
              </div>
              <pre className="text-slate-400 text-[10px] whitespace-pre-wrap overflow-auto max-h-40">
                {JSON.stringify(cycleMutation.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right: Operational Mode + Chaos Engineering */}
        <div className="flex flex-col gap-4">
          {/* Operational Mode Toggle */}
          <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <h3 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200">
              Operational Mode Control
            </h3>
          <div className="grid grid-cols-2 gap-2">
              {OPERATION_MODES.map(({ mode, label, color }) => (
                <button
                  key={mode}
                  onClick={() => modeMutation.mutate(mode)}
                  disabled={isRunning || currentMode === mode}
                  className="py-2.5 rounded-lg font-mono text-xs font-bold transition-all"
                  style={{
                    background: currentMode === mode ? `${color}20` : 'rgba(30,41,59,0.8)',
                    color,
                    border: `1px solid ${currentMode === mode ? color : 'rgba(71,85,105,0.4)'}`,
                    boxShadow: currentMode === mode ? `0 0 10px ${color}30` : 'none',
                    opacity: isRunning ? 0.5 : 1,
                  }}
                >
                  {currentMode === mode && <span className="mr-1">●</span>}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Chaos Engineering Panel */}
          <div className="p-5 rounded-xl bg-red-950/20 border border-red-900/60 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <h3 className="font-semibold text-sm border-b border-red-900/60 pb-2 text-red-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400" />
              <span>Chaos Fault Injection</span>
            </h3>

            <div className="space-y-2 font-mono text-xs">
              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Fault Type</label>
                <select
                  value={faultType}
                  onChange={(e) => setFaultType(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded px-2 py-1.5 outline-none text-xs"
                >
                  {['LATENCY_SPIKE', 'SERVICE_UNAVAILABLE', 'PARTIAL_FAILURE', 'MEMORY_PRESSURE', 'CPU_THROTTLE'].map((ft) => (
                    <option key={ft} value={ft}>{ft.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Target Subsystem</label>
                <select
                  value={faultSubsystem}
                  onChange={(e) => setFaultSubsystem(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded px-2 py-1.5 outline-none text-xs"
                >
                  {['ai_service', 'event_bus', 'database', 'coordinator', 'planner', 'adversary'].map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => faultMutation.mutate()}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white text-xs font-mono font-semibold transition-all"
            >
              {faultMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>INJECT FAULT</span>
            </button>

            <button
              onClick={() => clearFaultsMutation.mutate()}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-xs font-mono font-semibold transition-all"
            >
              {clearFaultsMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>CLEAR ALL FAULTS</span>
            </button>

            {faultMutation.data && (
              <div className="text-[10px] font-mono text-red-300 p-2 rounded bg-red-950/40 border border-red-900/40">
                Fault injected. System in: <strong>{(faultMutation.data as any)?.operational_mode}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
