import React, { useEffect, useState } from 'react';
import { useEvaluationStore } from '../../store/evaluationStore';
import { BenchmarkScenario, EvaluationRun } from '../../types/evaluation';

export const EvaluationDashboard: React.FC = () => {
  const {
    scenarios,
    activeRun,
    runs,
    report,
    loading,
    error,
    fetchScenarios,
    runScenario,
    runAll,
    fetchReport,
  } = useEvaluationStore();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SCENARIO-01');
  const [customSeed, setCustomSeed] = useState<number>(42);
  const [selectedRun, setSelectedRun] = useState<EvaluationRun | null>(null);

  useEffect(() => {
    fetchScenarios();
    fetchReport();
  }, []);

  useEffect(() => {
    if (activeRun) {
      setSelectedRun(activeRun);
    }
  }, [activeRun]);

  const handleRunScenario = async () => {
    const run = await runScenario(selectedScenarioId, customSeed);
    if (run) {
      setSelectedRun(run);
    }
  };

  const handleRunAll = async () => {
    await runAll();
  };

  const summary = report?.summary;

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              📊
            </span>
            System Evaluation & Benchmark Harness
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic, quantitative, reproducible benchmark pipeline for risk detection, agent coordination, plan feasibility, and sandbox verification.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={handleRunAll}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? 'Running Suite...' : '🚀 Run Full Benchmark Suite'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-200 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Benchmark Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 p-4 rounded-xl">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Scenario
          </label>
          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {scenarios.map((s) => (
              <option key={s.scenario_id} value={s.scenario_id}>
                {s.scenario_id} — {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 p-4 rounded-xl">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Deterministic Seed
          </label>
          <input
            type="number"
            value={customSeed}
            onChange={(e) => setCustomSeed(parseInt(e.target.value) || 42)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex items-end">
          <button
            onClick={handleRunScenario}
            disabled={loading}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
          >
            {loading ? 'Executing...' : '▶ Run Selected Scenario'}
          </button>
        </div>

        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Latest Suite Overall Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {summary ? (summary.overall_score * 100).toFixed(1) + '%' : '—'}
            </span>
            <span className="text-xs text-slate-400">
              {report ? `${report.scenarios_evaluated} Scenarios Evaluated` : 'No report'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Risk Detection', key: 'risk_detection', value: summary?.risk_detection, target: 0.65 },
          { label: 'Risk Localization', key: 'risk_localization', value: summary?.risk_localization, target: 0.60 },
          { label: 'Scenario Validity', key: 'scenario_validity', value: summary?.scenario_validity, target: 1.0 },
          { label: 'Agent Validity', key: 'agent_validity', value: summary?.agent_validity, target: 0.80 },
          { label: 'Coordination Quality', key: 'coordination_quality', value: summary?.coordination_quality, target: 0.60 },
          { label: 'Adversarial Coverage', key: 'adversarial_coverage', value: summary?.adversarial_coverage, target: 0.50 },
          { label: 'Plan Feasibility', key: 'plan_feasibility', value: summary?.plan_feasibility, target: 0.66 },
          { label: 'Plan Robustness', key: 'plan_robustness', value: summary?.plan_robustness, target: 0.70 },
          { label: 'Verification Accuracy', key: 'verification_accuracy', value: summary?.verification_accuracy, target: 0.80 },
          { label: 'Transparency', key: 'transparency_completeness', value: summary?.transparency_completeness, target: 0.80 },
        ].map((m) => {
          const val = m.value !== undefined ? m.value : 0;
          const pct = Math.round(val * 100);
          const passed = val >= m.target;

          return (
            <div
              key={m.key}
              className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-400">{m.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {passed ? 'PASS' : 'WARN'}
                </span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold text-white">{pct}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    passed ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios Table */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Benchmark Scenarios & Runs History
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Scenario</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Detection</th>
                  <th className="py-2.5 px-3">Feasibility</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report?.runs && report.runs.length > 0 ? (
                  report.runs.map((r) => {
                    const det = r.metrics['risk_detection']?.value ?? 0;
                    const feas = r.metrics['plan_feasibility']?.value ?? 0;
                    const verif = r.metrics['verification_accuracy']?.value ?? 0;

                    return (
                      <tr
                        key={r.run_id}
                        onClick={() => setSelectedRun(r)}
                        className={`hover:bg-slate-800/80 cursor-pointer transition ${
                          selectedRun?.run_id === r.run_id ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          {r.scenario_id}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {(det * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {(feas * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {(verif * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRun(r);
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No suite run output recorded yet. Click "Run Full Benchmark Suite" to evaluate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Run View */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🔍</span> Detailed Run Inspector
            </h2>

            {selectedRun ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-indigo-400">{selectedRun.scenario_id}</span>
                    <span className="text-slate-500 font-mono">{selectedRun.run_id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>Seed: <span className="font-mono text-white">{selectedRun.seed}</span></div>
                    <div>Status: <span className="font-bold text-emerald-400">{selectedRun.status}</span></div>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div>
                  <h3 className="font-semibold text-slate-300 mb-2 uppercase tracking-wider text-[10px]">
                    Metric Breakdown
                  </h3>
                  <div className="space-y-1.5">
                    {Object.entries(selectedRun.metrics).map(([k, m]) => (
                      <div
                        key={k}
                        className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800"
                      >
                        <span className="text-slate-400 font-medium">{m.metric_name}</span>
                        <span className="font-mono font-bold text-white">
                          {(m.value * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Artifacts */}
                {selectedRun.artifacts && (
                  <div>
                    <h3 className="font-semibold text-slate-300 mb-2 uppercase tracking-wider text-[10px]">
                      Execution Artifacts
                    </h3>
                    <pre className="p-3 bg-slate-950 rounded-lg text-slate-400 text-[10px] font-mono overflow-x-auto border border-slate-800">
                      {JSON.stringify(selectedRun.artifacts, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Select a scenario run from the table to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
