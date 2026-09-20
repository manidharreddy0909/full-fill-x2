import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { evaluationApi } from '../../api/evaluation';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import {
  Activity, BarChart3, Play, RefreshCw, CheckCircle2,
  XCircle, AlertTriangle, Clock, TrendingUp, Target,
} from 'lucide-react';
import { EvaluationRun, BenchmarkScenario, EvaluationSummary } from '../../types/evaluation';

const metricStatusColor = (status: string) => {
  switch (status) {
    case 'PASS': return '#34d399';
    case 'WARN': return '#fbbf24';
    case 'FAIL': return '#f87171';
    default: return '#94a3b8';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'PASS': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case 'WARN': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    case 'FAIL': return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
    default: return <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
};

export const EvaluationWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  const { data: evalStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['evalStatus'],
    queryFn: () => evaluationApi.getStatus(),
  });

  const { data: scenarios = [], isLoading: isScenariosLoading } = useQuery<BenchmarkScenario[]>({
    queryKey: ['evalScenarios'],
    queryFn: () => evaluationApi.getScenarios(),
  });

  const { data: runs = [], isLoading: isRunsLoading, refetch: refetchRuns } = useQuery<EvaluationRun[]>({
    queryKey: ['evalRuns'],
    queryFn: () => evaluationApi.getRuns(20),
    refetchInterval: 30000,
  });

  const { data: report } = useQuery({
    queryKey: ['evalReport'],
    queryFn: () => evaluationApi.getReport(),
    retry: false,
  });

  const runScenarioMutation = useMutation({
    mutationFn: (scenarioId: string) => evaluationApi.runScenario(scenarioId, 42),
    onSuccess: (run) => {
      setActiveRunId(run.run_id);
      refetchRuns();
      refetchStatus();
    },
  });

  const runAllMutation = useMutation({
    mutationFn: () => evaluationApi.runAll('BENCHMARK-V1'),
    onSuccess: () => { refetchRuns(); refetchStatus(); },
  });

  const summary = (report as any)?.summary as EvaluationSummary | undefined;
  const latestRun = runs[0];

  // Set default scenario
  React.useEffect(() => {
    if (scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].scenario_id);
    }
  }, [scenarios]);

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Evaluation Harness — Benchmark & Performance Assessment</h1>
            <p className="text-xs text-slate-400">
              {evalStatus?.total_scenarios_registered ?? scenarios.length} scenarios ·{' '}
              {evalStatus?.total_runs_executed ?? runs.length} runs executed ·{' '}
              {evalStatus?.latest_overall_score != null ? `Latest score: ${(evalStatus.latest_overall_score * 100).toFixed(1)}%` : 'No scores yet'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {scenarios.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs">
              <span className="text-slate-400">Scenario:</span>
              <select
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="bg-transparent text-amber-300 font-bold outline-none"
              >
                {scenarios.map((s) => (
                  <option key={s.scenario_id} value={s.scenario_id}>{s.scenario_id} — {s.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => selectedScenarioId && runScenarioMutation.mutate(selectedScenarioId)}
            disabled={runScenarioMutation.isPending || runAllMutation.isPending || !selectedScenarioId}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-amber-900 text-white text-xs font-mono font-semibold transition-all"
          >
            {runScenarioMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>RUN SCENARIO</span>
          </button>

          <button
            onClick={() => runAllMutation.mutate()}
            disabled={runScenarioMutation.isPending || runAllMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-purple-600/30"
          >
            {runAllMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
            <span>RUN ALL BENCHMARKS</span>
          </button>

          <button
            onClick={() => refetchRuns()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Overall Score', value: summary.overall_score, color: '#c084fc' },
            { label: 'Risk Detection', value: summary.risk_detection, color: '#60a5fa' },
            { label: 'Agent Validity', value: summary.agent_validity, color: '#34d399' },
            { label: 'Plan Feasibility', value: summary.plan_feasibility, color: '#fbbf24' },
            { label: 'Verification Acc.', value: summary.verification_accuracy, color: '#fb923c' },
          ].map((kpi) => {
            const pct = kpi.value * 100;
            return (
              <div key={kpi.label} className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
                <div className="text-[10px] text-slate-400 font-mono uppercase">{kpi.label}</div>
                <div className="text-xl font-black mt-1 font-mono" style={{ color: kpi.color }}>{pct.toFixed(1)}%</div>
                <div className="h-1 rounded-full bg-slate-800 mt-2">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: kpi.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading indicator */}
      {(runScenarioMutation.isPending || runAllMutation.isPending) && (
        <div className="flex items-center justify-center py-10 gap-3 text-slate-400 font-mono text-sm">
          <Activity className="w-6 h-6 animate-spin text-amber-400" />
          <span>
            {runAllMutation.isPending
              ? 'Running complete benchmark suite across all scenarios...'
              : `Running scenario: ${selectedScenarioId}...`}
          </span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Registry */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Benchmark Scenarios ({scenarios.length})</span>
          </h2>

          {isScenariosLoading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-amber-400" />
              <span>Loading scenarios...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.scenario_id}
                  onClick={() => setSelectedScenarioId(scenario.scenario_id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all font-mono text-xs ${
                    selectedScenarioId === scenario.scenario_id
                      ? 'bg-amber-950/30 border-amber-800/60'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-300 text-[10px]">{scenario.scenario_id}</span>
                    <span className="text-[9px] text-slate-500">seed: {scenario.seed}</span>
                  </div>
                  <div className="text-slate-200 font-bold text-[11px]">{scenario.name}</div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-2">{scenario.description}</p>
                </div>
              ))}

              {scenarios.length === 0 && (
                <div className="text-center text-slate-500 font-mono text-xs py-6">No benchmark scenarios registered.</div>
              )}
            </div>
          )}
        </div>

        {/* Run History */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Evaluation Run History ({runs.length})</span>
          </h2>

          {isRunsLoading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-purple-400" />
              <span>Loading runs...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2">Run ID</th>
                    <th className="py-2">Scenario</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Overall Score</th>
                    <th className="py-2">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {runs.map((run) => {
                    const overall = run.metrics?.['overall_score']?.value;
                    const isActive = run.run_id === activeRunId;
                    return (
                      <tr
                        key={run.run_id}
                        className={`hover:bg-slate-800/40 transition-all ${isActive ? 'bg-amber-950/20' : ''}`}
                      >
                        <td className="py-2 font-bold text-slate-200 text-[11px]">{run.run_id.slice(-12)}</td>
                        <td className="py-2 text-amber-300">{run.scenario_id}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-1.5">
                            {run.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              : run.status === 'FAILED' ? <XCircle className="w-3.5 h-3.5 text-red-400" />
                              : run.status === 'RUNNING' ? <Activity className="w-3.5 h-3.5 animate-spin text-blue-400" />
                              : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                            <span className={
                              run.status === 'COMPLETED' ? 'text-emerald-400' :
                              run.status === 'FAILED' ? 'text-red-400' :
                              run.status === 'RUNNING' ? 'text-blue-400' :
                              'text-slate-400'
                            }>{run.status}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          {overall != null ? (
                            <span className="font-bold" style={{ color: overall >= 0.8 ? '#34d399' : overall >= 0.6 ? '#fbbf24' : '#f87171' }}>
                              {(overall * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-2 text-slate-400 text-[10px]">
                          {run.started_at ? new Date(run.started_at).toLocaleTimeString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {runs.length === 0 && !isRunsLoading && (
                <div className="text-center text-slate-500 font-mono text-xs py-8">
                  No evaluation runs yet. Select a scenario and click "Run Scenario".
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {report && (report as any).recommendations && (report as any).recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/60 mt-2">
              <div className="text-[10px] text-purple-300 uppercase font-mono font-bold mb-2">Recommendations</div>
              <ul className="space-y-1">
                {(report as any).recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-[11px] text-slate-300 font-sans flex items-start gap-1.5">
                    <span className="text-purple-400 shrink-0">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
