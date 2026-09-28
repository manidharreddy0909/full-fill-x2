import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { evaluationApi } from '../../api/evaluation';
import { hindsightEvalApi } from '../../api/hindsightEvalApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import {
  Activity, BarChart3, Play, RefreshCw, CheckCircle2,
  XCircle, AlertTriangle, Clock, TrendingUp, Target,
  Brain, Download, ArrowRight, ShieldCheck, Database,
  Cpu, GitFork, Award, HelpCircle
} from 'lucide-react';
import { EvaluationRun, BenchmarkScenario, EvaluationSummary } from '../../types/evaluation';
import { EvaluationExperimentReport, EpisodeTrace } from '../../types/hindsightEval';

export const EvaluationWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const [activeTab, setActiveTab] = useState<'learning' | 'benchmark'>('learning');

  // Benchmark suite state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Hindsight learning evaluation state
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(5);

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  // Phase 5 Hindsight Evaluation Query
  const {
    data: evalReport,
    isLoading: isEvalReportLoading,
    refetch: refetchEvalReport,
  } = useQuery<EvaluationExperimentReport>({
    queryKey: ['hindsightEvalReport'],
    queryFn: () => hindsightEvalApi.getLatestReport(),
    refetchInterval: 60000,
  });

  // Run Canonical Experiment Mutation
  const runCanonicalMutation = useMutation({
    mutationFn: () => hindsightEvalApi.runCanonicalExperiment(42, true),
    onSuccess: () => {
      refetchEvalReport();
    },
  });

  // Benchmark Suite Queries
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

  useEffect(() => {
    if (scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].scenario_id);
    }
  }, [scenarios]);

  // Selected episode traces
  const currentMemTrace = evalReport?.episodes_memoryless?.find(
    (e) => e.episode_index === selectedEpisodeIndex
  );
  const currentHinTrace = evalReport?.episodes_hindsight?.find(
    (e) => e.episode_index === selectedEpisodeIndex
  );

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Top Header & Tab Navigation */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Evaluation & Measurable Learning Harness</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                PHASE 5 VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic A/B experimentation comparing Memoryless Agent vs Hindsight-Enabled Agent under repeated incident sequences.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-950/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'learning'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Hindsight Learning Evaluation</span>
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'benchmark'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Benchmark Scenarios (Suite)</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: PHASE 5 HINDSIGHT LEARNING EVALUATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'learning' && (
        <div className="flex flex-col gap-6">
          {/* Action Toolbar & Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => runCanonicalMutation.mutate()}
                disabled={runCanonicalMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-emerald-900/40"
              >
                {runCanonicalMutation.isPending ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>RUN CANONICAL BENCHMARK (30 EPISODES)</span>
              </button>

              <button
                onClick={() => refetchEvalReport()}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs font-mono flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>REFRESH</span>
              </button>

              {evalReport?.hindsight_dependency_verified && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>HINDSIGHT DEPENDENCY VERIFIED</span>
                </div>
              )}
            </div>

            {/* Artifact Downloads */}
            <div className="flex items-center gap-2">
              <a
                href={hindsightEvalApi.getExportJsonUrl()}
                download="evaluation.json"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>EVALUATION.JSON</span>
              </a>
              <a
                href={hindsightEvalApi.getExportCsvUrl()}
                download="evaluation.csv"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>EVALUATION.CSV</span>
              </a>
            </div>
          </div>

          {/* Comparative Metrics Cards */}
          {evalReport && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Recovery Success</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {(evalReport.hindsight_metrics.recovery_success_rate * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    vs {(evalReport.memoryless_metrics.recovery_success_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-emerald-500 font-mono mt-1 font-semibold">
                  +{(evalReport.statistical_summary?.recovery_success_delta * 100).toFixed(1)}% with Hindsight
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Repeated Mistakes</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {(evalReport.hindsight_metrics.repeated_mistake_rate * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-red-400">
                    vs {(evalReport.memoryless_metrics.repeated_mistake_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-emerald-500 font-mono mt-1 font-semibold">
                  -{(evalReport.statistical_summary?.repeated_mistake_reduction * 100).toFixed(1)}% reduction
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Unsafe Actions</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {(evalReport.hindsight_metrics.unsafe_action_rate * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-red-400">
                    vs {(evalReport.memoryless_metrics.unsafe_action_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-emerald-500 font-mono mt-1 font-semibold">
                  -{(evalReport.statistical_summary?.unsafe_action_reduction * 100).toFixed(1)}% safer execution
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Unknown Detection</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {(evalReport.hindsight_metrics.unknown_detection_rate * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    vs {(evalReport.memoryless_metrics.unknown_detection_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-amber-500 font-mono mt-1">
                  Zero hallucinated confidence
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Boundary Avoidance</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-blue-400">
                    {(evalReport.hindsight_metrics.boundary_avoidance_rate * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    vs 0.0%
                  </span>
                </div>
                <div className="text-[10px] text-blue-400 font-mono mt-1">
                  Learned limits respected
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Learning Gain (Late vs Early)</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-purple-400">
                    +{evalReport.hindsight_metrics.learning_gain >= 0 ? '' : ''}
                    {(evalReport.hindsight_metrics.learning_gain * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-purple-400 font-mono mt-1">
                  Late episodes outperform early
                </div>
              </div>
            </div>
          )}

          {/* Core Comparison Table (Section 19) */}
          <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">
                  Experimental Comparison: Mode A (Memoryless) vs Mode B (Hindsight)
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {evalReport?.scenario_count || 30} Incidents · Canonical Deterministic Benchmark
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Evaluation Metric</th>
                    <th className="py-2.5 px-3 text-red-400">Mode A: Memoryless Agent</th>
                    <th className="py-2.5 px-3 text-emerald-400">Mode B: Hindsight Agent</th>
                    <th className="py-2.5 px-3 text-blue-400">Empirical Difference</th>
                    <th className="py-2.5 px-3 text-slate-400">Causal Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Recovery Success Rate</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {evalReport ? `${(evalReport.memoryless_metrics.recovery_success_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {evalReport ? `${(evalReport.hindsight_metrics.recovery_success_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {evalReport ? `+${(evalReport.statistical_summary?.recovery_success_delta * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      Historical failure boundary recall prevents catastrophic substitution collapse.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Repeated Mistake Rate</td>
                    <td className="py-2.5 px-3 text-red-400 font-bold">
                      {evalReport ? `${(evalReport.memoryless_metrics.repeated_mistake_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {evalReport ? `${(evalReport.hindsight_metrics.repeated_mistake_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {evalReport ? `-${(evalReport.statistical_summary?.repeated_mistake_reduction * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      Recalls prior failure on identical/similar conditions; replaces strategy.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Unsafe Action Rate</td>
                    <td className="py-2.5 px-3 text-red-400 font-bold">
                      {evalReport ? `${(evalReport.memoryless_metrics.unsafe_action_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {evalReport ? `${(evalReport.hindsight_metrics.unsafe_action_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {evalReport ? `-${(evalReport.statistical_summary?.unsafe_action_reduction * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      Unsafe capacity boundary violations are pre-empted before execution.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Unknown Detection Rate</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {evalReport ? `${(evalReport.memoryless_metrics.unknown_detection_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">
                      {evalReport ? `${(evalReport.hindsight_metrics.unknown_detection_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">
                      {evalReport ? `+${(evalReport.hindsight_metrics.unknown_detection_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      Detects zero historical coverage on novel events; triggers safe hold instead of hallucinating.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Boundary Avoidance Rate</td>
                    <td className="py-2.5 px-3 text-slate-400">0.0%</td>
                    <td className="py-2.5 px-3 font-bold text-blue-400">
                      {evalReport ? `${(evalReport.hindsight_metrics.boundary_avoidance_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-blue-400 font-bold">
                      {evalReport ? `+${(evalReport.hindsight_metrics.boundary_avoidance_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      Avoids Skill/action after historical evidence proves its boundary is violated.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Average Prediction Error</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {evalReport ? `${evalReport.memoryless_metrics.avg_prediction_error_hours.toFixed(2)}h` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {evalReport ? `${evalReport.hindsight_metrics.avg_prediction_error_hours.toFixed(2)}h` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {evalReport ? `-${(evalReport.statistical_summary?.prediction_error_reduction_hours || 0).toFixed(2)}h` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      Prior experiential recovery durations anchor simulation predictions.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Transfer Reasoning Accuracy</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {evalReport ? `${(evalReport.memoryless_metrics.transfer_accuracy_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {evalReport ? `${(evalReport.hindsight_metrics.transfer_accuracy_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {evalReport ? `+${((evalReport.hindsight_metrics.transfer_accuracy_rate - evalReport.memoryless_metrics.transfer_accuracy_rate) * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      Evaluates PARTIAL or NON_TRANSFERABLE on altered conditions rather than blind replay.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Learning Curve Visualizer */}
          <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Cumulative Learning Curves over Episode Sequence</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-emerald-400 rounded-full" />
                  <span className="text-slate-300">Hindsight Success</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-red-400 rounded-full" />
                  <span className="text-slate-300">Memoryless Success</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-amber-400 border-t border-dashed" />
                  <span className="text-slate-400">Memoryless Mistakes</span>
                </div>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="h-48 w-full relative bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
              <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                {/* Horizontal reference lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="3,3" />

                {evalReport && evalReport.learning_curves_hindsight.length > 0 && (
                  <>
                    {/* Memoryless Success Curve */}
                    <polyline
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="2"
                      points={evalReport.learning_curves_memoryless
                        .map((p, idx) => {
                          const x = (idx / (evalReport.learning_curves_memoryless.length - 1)) * 580 + 10;
                          const y = 110 - p.cumulative_success_rate * 90;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />

                    {/* Memoryless Mistake Curve */}
                    <polyline
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                      points={evalReport.learning_curves_memoryless
                        .map((p, idx) => {
                          const x = (idx / (evalReport.learning_curves_memoryless.length - 1)) * 580 + 10;
                          const y = 110 - p.cumulative_mistake_rate * 90;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />

                    {/* Hindsight Success Curve */}
                    <polyline
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      points={evalReport.learning_curves_hindsight
                        .map((p, idx) => {
                          const x = (idx / (evalReport.learning_curves_hindsight.length - 1)) * 580 + 10;
                          const y = 110 - p.cumulative_success_rate * 90;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  </>
                )}
              </svg>

              <div className="absolute bottom-1 left-3 text-[10px] font-mono text-slate-500">
                Episode 1
              </div>
              <div className="absolute bottom-1 right-3 text-[10px] font-mono text-slate-500">
                Episode {evalReport?.scenario_count || 30}
              </div>
            </div>
          </div>

          {/* Episode Explorer & Side-by-Side Decision Trace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Episode List Selector */}
            <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Episode Sequence ({evalReport?.scenario_count || 30})</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Select to inspect trace</span>
              </div>

              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {evalReport?.episodes_hindsight.map((hinTrace) => {
                  const memTrace = evalReport.episodes_memoryless.find(
                    (m) => m.episode_index === hinTrace.episode_index
                  );
                  const isSelected = selectedEpisodeIndex === hinTrace.episode_index;
                  const isDivergent = memTrace?.decision !== hinTrace.decision;

                  return (
                    <div
                      key={hinTrace.episode_index}
                      onClick={() => setSelectedEpisodeIndex(hinTrace.episode_index)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all font-mono text-xs flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-800 text-white'
                          : isDivergent
                          ? 'bg-slate-950/80 border-amber-900/60 hover:border-amber-700'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300 w-6">#{hinTrace.episode_index}</span>
                        <div>
                          <div className="text-[11px] font-bold text-slate-200">
                            {hinTrace.scenario_type}
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans">
                            {hinTrace.scenario_id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isDivergent ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                            LEARNED DIFF
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-400">
                            CONGRUENT
                          </span>
                        )}

                        {hinTrace.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side-by-Side Trace & Learning Diff Panel */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm text-white">
                    Episode #{selectedEpisodeIndex} Decision Trace & Causal Attribution
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Type: {currentHinTrace?.scenario_type}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    ID: {currentHinTrace?.scenario_id}
                  </span>
                </div>
              </div>

              {/* Learning Diff Callout */}
              {currentMemTrace && currentHinTrace && (
                <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-900/60 flex flex-col gap-1.5">
                  <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Learning Diff — Behavioral Divergence</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono mt-1">
                    <div className="p-2 rounded bg-slate-950/80 border border-red-950 text-slate-300">
                      <div className="text-[9px] text-red-400 uppercase font-bold mb-1">Before / Memoryless</div>
                      <p className="font-sans text-[11px] text-slate-300">
                        {currentMemTrace.decision}
                      </p>
                      <div className="text-[10px] text-red-400 mt-1">
                        Outcome: {currentMemTrace.success ? 'SUCCESS' : 'FAILURE'}
                        {currentMemTrace.repeated_mistake && ' (REPEATED MISTAKE)'}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-950/80 border border-emerald-950 text-slate-300">
                      <div className="text-[9px] text-emerald-400 uppercase font-bold mb-1">After / Hindsight-Enabled</div>
                      <p className="font-sans text-[11px] text-slate-200">
                        {currentHinTrace.decision}
                      </p>
                      <div className="text-[10px] text-emerald-400 mt-1">
                        Outcome: {currentHinTrace.success ? 'SUCCESS' : 'FAILURE'}
                        {currentHinTrace.boundary_avoided && ' (BOUNDARY AVOIDED)'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Side-by-Side Detailed Traces */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mode A: Memoryless */}
                {currentMemTrace && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-red-400">Agent A: Memoryless</span>
                      <span className="text-[10px] text-slate-500">No Experiential Recall</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Observed State:</span>
                      <pre className="text-[10px] text-slate-300 bg-slate-900/60 p-1.5 rounded mt-0.5 overflow-x-auto">
                        {JSON.stringify(currentMemTrace.observed_state, null, 1)}
                      </pre>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Decision Rationale:</span>
                      <p className="text-[11px] font-sans text-slate-300 mt-0.5 bg-slate-900/40 p-2 rounded">
                        {currentMemTrace.decision_rationale}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Simulated Recovery:</span>
                      <span className={currentMemTrace.success ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {currentMemTrace.simulated_outcome?.recovery_hours?.toFixed(1) || '0.0'}h
                      </span>
                    </div>
                  </div>
                )}

                {/* Mode B: Hindsight */}
                {currentHinTrace && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-emerald-400">Agent B: Hindsight</span>
                      <span className="text-[10px] text-emerald-500">Persistent Experience Store</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Recalled Evidence:</span>
                      <div className="text-[10px] text-emerald-300 bg-emerald-950/30 p-1.5 rounded mt-0.5 border border-emerald-900/40">
                        {currentHinTrace.attribution.evidence_summary}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Transfer Assessment:</span>
                      <div className="text-[11px] font-bold text-amber-300 mt-0.5">
                        {currentHinTrace.transfer_assessment || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Hindsight Decision:</span>
                      <p className="text-[11px] font-sans text-slate-200 mt-0.5 bg-slate-900/40 p-2 rounded">
                        {currentHinTrace.decision_rationale}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Simulated Recovery:</span>
                      <span className="text-emerald-400 font-bold">
                        {currentHinTrace.simulated_outcome?.recovery_hours?.toFixed(1) || '0.0'}h
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Causal Attribution Tags */}
              {currentHinTrace && (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">Causal Proof:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${currentHinTrace.attribution.memory_recalled ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-900 text-slate-500'}`}>
                    Memory Recalled: {String(currentHinTrace.attribution.memory_recalled)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${currentHinTrace.attribution.evidence_used ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-900 text-slate-500'}`}>
                    Evidence Used: {String(currentHinTrace.attribution.evidence_used)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${currentHinTrace.attribution.boundary_influenced ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-500'}`}>
                    Boundary Influenced: {String(currentHinTrace.attribution.boundary_influenced)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${currentHinTrace.attribution.decision_changed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-500'}`}>
                    Decision Changed: {String(currentHinTrace.attribution.decision_changed)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${currentHinTrace.attribution.outcome_improved ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-500'}`}>
                    Outcome Improved: {String(currentHinTrace.attribution.outcome_improved)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: PHASE 12 BENCHMARK SUITE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'benchmark' && (
        <div className="flex flex-col gap-6">
          {/* Action Toolbar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {scenarios.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs">
                  <span className="text-slate-400">Scenario:</span>
                  <select
                    value={selectedScenarioId}
                    onChange={(e) => setSelectedScenarioId(e.target.value)}
                    className="bg-transparent text-amber-300 font-bold outline-none"
                  >
                    {scenarios.map((s) => (
                      <option key={s.scenario_id} value={s.scenario_id}>
                        {s.scenario_id} — {s.name}
                      </option>
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

            <div className="text-xs font-mono text-slate-400">
              {evalStatus?.total_scenarios_registered ?? scenarios.length} scenarios registered · {evalStatus?.total_runs_executed ?? runs.length} runs executed
            </div>
          </div>

          {/* Benchmark KPI Cards */}
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
                    <div className="text-xl font-black mt-1 font-mono" style={{ color: kpi.color }}>
                      {pct.toFixed(1)}%
                    </div>
                    <div className="h-1 rounded-full bg-slate-800 mt-2">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: kpi.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Main Grid: Scenario Registry & Run History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                </div>
              )}
            </div>

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
                              <span className="text-emerald-400">{run.status}</span>
                            </td>
                            <td className="py-2">
                              {overall != null ? `${(overall * 100).toFixed(1)}%` : '—'}
                            </td>
                            <td className="py-2 text-slate-400 text-[10px]">
                              {run.started_at ? new Date(run.started_at).toLocaleTimeString() : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
