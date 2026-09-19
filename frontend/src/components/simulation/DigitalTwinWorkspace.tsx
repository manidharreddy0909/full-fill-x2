import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Play,
  RotateCcw,
  Sliders,
  Shield,
  Zap,
  TrendingDown,
  Layers,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  PieChart,
  Clock,
  DollarSign,
  Box,
} from 'lucide-react';
import {
  CriticalityResult,
  MonteCarloResult,
  ScenarioConfig,
  SimulationHorizon,
  StrategyComparisonResult,
} from '../../types/simulation';
import {
  fetchTwinStatus,
  createDigitalTwin,
  runMonteCarlo,
  analyzeResilienceCriticality,
  compareStrategies,
} from '../../api/simulationApi';

export const DigitalTwinWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OBSERVE' | 'SIMULATE' | 'COMPARE'>('SIMULATE');
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [twinStatus, setTwinStatus] = useState<any>(null);

  // Scenario Builder State
  const [targetNode, setTargetNode] = useState<string>('sup-001');
  const [disruptionType, setDisruptionType] = useState<string>('SUPPLIER_OUTAGE');
  const [severity, setSeverity] = useState<number>(0.8);
  const [durationHours, setDurationHours] = useState<number>(36);
  const [demandShockPct, setDemandShockPct] = useState<number>(0.3);
  const [iterations, setIterations] = useState<number>(1000);
  const [horizon, setHorizon] = useState<SimulationHorizon>('72h');
  const [seed, setSeed] = useState<number>(42);

  // Simulation Results
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [criticality, setCriticality] = useState<CriticalityResult[]>([]);
  const [comparison, setComparison] = useState<StrategyComparisonResult | null>(null);

  useEffect(() => {
    loadTwinStatus();
  }, []);

  const loadTwinStatus = async () => {
    try {
      const st = await fetchTwinStatus();
      setTwinStatus(st);
    } catch (err) {
      console.error(err);
    }
  };

  const getActiveScenarioConfig = (): ScenarioConfig => {
    return {
      scenario_id: `scn-custom-${seed}`,
      name: `Scenario (${targetNode} / ${disruptionType})`,
      description: `${disruptionType} on ${targetNode} starting at +6h for ${durationHours}h with +${Math.round(demandShockPct * 100)}% demand shock.`,
      events: [
        {
          event_id: 'evt-001',
          target: targetNode,
          start_time: 6,
          duration: durationHours,
          severity: severity,
          capacity_multiplier: Math.max(0.0, 1.0 - severity),
          probability: 1.0,
          source: 'SCENARIO_BUILDER',
          type: disruptionType as any,
        },
      ],
      demand_shock_pct: demandShockPct,
      recovery_delay_multiplier: 1.0,
      seed: seed,
    };
  };

  const handleRunMonteCarlo = async () => {
    setLoading(true);
    setProgress(15);
    try {
      await createDigitalTwin('DT-DEFAULT', seed);
      setProgress(40);
      const scn = getActiveScenarioConfig();
      const res = await runMonteCarlo('DT-DEFAULT', scn, {
        scenario_id: scn.scenario_id,
        n_simulations: iterations,
        seed: seed,
        horizon: horizon,
        max_workers: 4,
      });
      setProgress(80);
      setMcResult(res);

      const crit = await analyzeResilienceCriticality('DT-DEFAULT', scn, {
        scenario_id: scn.scenario_id,
        n_simulations: 100,
        seed: seed,
        horizon: horizon,
        max_workers: 2,
      });
      setCriticality(crit);
      setProgress(100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunComparison = async () => {
    setLoading(true);
    try {
      const scn = getActiveScenarioConfig();
      const candA = {
        strategy_id: 'strat-safety-stock',
        name: 'Strategy A: Double Safety Stock',
        actions: [
          {
            type: 'SAFETY_STOCK',
            target: 'ALL',
            parameters: { multiplier: 2.0 },
          },
        ],
      };
      const candB = {
        strategy_id: 'strat-alt-supplier',
        name: 'Strategy B: Activate Alternate Supplier',
        actions: [
          {
            type: 'ALTERNATE_SUPPLIER',
            target: targetNode,
            parameters: {},
          },
        ],
      };

      const cmp = await compareStrategies(scn, [candA, candB], {
        scenario_id: scn.scenario_id,
        n_simulations: 100,
        seed: seed,
        horizon: horizon,
        max_workers: 2,
      });
      setComparison(cmp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      {/* Header & Mode Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                DIGITAL TWIN & MONTE CARLO ENGINE
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  PHASE 8 ACTIVE
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Executable Isolated Simulation Snapshot • Seeded Stochastic Probabilistic Futures
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl space-x-1">
          <button
            onClick={() => setActiveTab('OBSERVE')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'OBSERVE'
                ? 'bg-slate-800 text-cyan-400 shadow-md border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            OBSERVE (LIVE)
          </button>
          <button
            onClick={() => setActiveTab('SIMULATE')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'SIMULATE'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 inline mr-2" />
            SIMULATE (TWIN)
          </button>
          <button
            onClick={() => setActiveTab('COMPARE')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'COMPARE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            ROBUSTNESS MATRIX
          </button>
        </div>
      </div>

      {/* Safety Isolation Guarantee Ribbon */}
      <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-cyan-300 text-sm">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span>
            <strong>Production State Isolation Guarantee:</strong> Digital Twin operates strictly on isolated deep-copied state (`mode = SIMULATION`, `production_mutation = false`). Production database is never mutated.
          </span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          STATUS: {twinStatus?.status || 'OPERATIONAL'} | SEED: {seed}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Scenario Builder & Monte Carlo Console */}
        <div className="lg:col-span-1 space-y-6">
          {/* Scenario Builder Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Scenario Builder
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                DETERMINISTIC
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Node / Region</label>
                <select
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="sup-001">Supplier-A (Electronics APAC)</option>
                  <option value="sup-002">Supplier-B (Components EMEA)</option>
                  <option value="port-001">Port-2 (Maritime Terminal)</option>
                  <option value="wh-001">Warehouse-1 (Hub Central)</option>
                  <option value="fc-001">Fulfillment Center FC-Alpha</option>
                  <option value="ALL">ALL (Network-wide Disruption)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Disruption Event Type</label>
                <select
                  value={disruptionType}
                  onChange={(e) => setDisruptionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="SUPPLIER_OUTAGE">SUPPLIER OUTAGE</option>
                  <option value="PORT_CONGESTION">PORT CONGESTION</option>
                  <option value="WAREHOUSE_OUTAGE">WAREHOUSE OUTAGE</option>
                  <option value="TRANSPORT_DELAY">TRANSPORT DELAY</option>
                  <option value="DEMAND_SURGE">DEMAND SURGE</option>
                  <option value="COMPOUND">COMPOUND SHOCK</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Disruption Severity</span>
                  <span className="font-mono text-cyan-400">{Math.round(severity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={severity}
                  onChange={(e) => setSeverity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Duration (Hours)</span>
                  <span className="font-mono text-cyan-400">{durationHours}h</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="168"
                  step="6"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Demand Shock (%)</span>
                  <span className="font-mono text-cyan-400">+{Math.round(demandShockPct * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={demandShockPct}
                  onChange={(e) => setDemandShockPct(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Monte Carlo Config & Execution Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                Monte Carlo Console
              </h3>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                CPU PARALLEL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-slate-400 mb-1">Iterations (N)</label>
                <select
                  value={iterations}
                  onChange={(e) => setIterations(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value={100}>100 runs</option>
                  <option value={500}>500 runs</option>
                  <option value={1000}>1,000 runs</option>
                  <option value={5000}>5,000 runs</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Horizon</label>
                <select
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value as SimulationHorizon)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="24h">24 Hours</option>
                  <option value="48h">48 Hours</option>
                  <option value="72h">72 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="14d">14 Days</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-cyan-400">
                  <span>Executing Stochastic Runs...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                onClick={handleRunMonteCarlo}
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>RUN MONTE CARLO SIMULATION</span>
              </button>

              <button
                onClick={handleRunComparison}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Layers className="w-5 h-5" />
                <span>COMPARE STRATEGIES</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Results Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {mcResult ? (
            <>
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">RESILIENCE SCORE</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {mcResult.metrics.resilience_score} / 100
                  </div>
                  <span className="text-xs text-slate-500">Weighted Multi-dimensional</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">SERVICE P50</span>
                  <div className="text-2xl font-bold text-cyan-400 font-mono">
                    {Math.round(mcResult.metrics.service_level_dist.p50 * 100)}%
                  </div>
                  <span className="text-xs text-slate-500">P10: {Math.round(mcResult.metrics.service_level_dist.p10 * 100)}% | P90: {Math.round(mcResult.metrics.service_level_dist.p90 * 100)}%</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">CVaR95 (WORST 5%)</span>
                  <div className="text-2xl font-bold text-rose-400 font-mono">
                    ${Math.round(mcResult.metrics.cvar_cost_95).toLocaleString()}
                  </div>
                  <span className="text-xs text-slate-500">Value at Risk: ${Math.round(mcResult.metrics.var_cost_95).toLocaleString()}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">TIME-TO-RECOVERY (TTR)</span>
                  <div className="text-2xl font-bold text-amber-400 font-mono">
                    {mcResult.metrics.ttr_p90}h
                  </div>
                  <span className="text-xs text-slate-500">Stockout Prob: {Math.round(mcResult.metrics.stockout_probability * 100)}%</span>
                </div>
              </div>

              {/* Percentile Distribution Explorer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <BarChart2 className="w-5 h-5 text-cyan-400" />
                  Stochastic Percentile Distribution Explorer ({mcResult.n_simulations} Runs)
                </h3>

                <div className="grid grid-cols-5 gap-3 text-center">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono">P10 (Worst Case)</span>
                    <p className="text-lg font-bold text-rose-400 font-mono">
                      {Math.round(mcResult.metrics.service_level_dist.p10 * 100)}%
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono">P25</span>
                    <p className="text-lg font-bold text-amber-400 font-mono">
                      {Math.round(mcResult.metrics.service_level_dist.p25 * 100)}%
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
                    <span className="text-xs text-cyan-400 font-mono">P50 (Median)</span>
                    <p className="text-lg font-bold text-cyan-300 font-mono">
                      {Math.round(mcResult.metrics.service_level_dist.p50 * 100)}%
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono">P75</span>
                    <p className="text-lg font-bold text-emerald-400 font-mono">
                      {Math.round(mcResult.metrics.service_level_dist.p75 * 100)}%
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono">P90 (Best Case)</span>
                    <p className="text-lg font-bold text-emerald-300 font-mono">
                      {Math.round(mcResult.metrics.service_level_dist.p90 * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Resilience Curve SVG Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                    Resilience Curve & Degradation Timeline
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Horizon: {mcResult.horizon_hours}h | Execution: {mcResult.execution_time_sec}s
                  </span>
                </h3>

                <div className="h-44 w-full bg-slate-950 rounded-xl p-4 relative flex items-end space-x-1 border border-slate-800 overflow-hidden">
                  {mcResult.resilience_curve.points.map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t transition-all group relative"
                      style={{ height: `${Math.max(10, pt.service_level * 100)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs p-2 rounded border border-slate-700 whitespace-nowrap z-20 font-mono shadow-xl">
                        +{pt.step_hour}h | Service: {Math.round(pt.service_level * 100)}% | Disrupted: {pt.disrupted_count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Node Explorer Table */}
              {criticality.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Simulation-Derived Critical Node Explorer
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="p-3">Rank</th>
                          <th className="p-3">Node</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Failure Prob</th>
                          <th className="p-3">Service Loss</th>
                          <th className="p-3">Downstream Customers</th>
                          <th className="p-3">Criticality Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {criticality.map((row) => (
                          <tr key={row.node_id} className="hover:bg-slate-800/50">
                            <td className="p-3 font-mono font-bold text-cyan-400">#{row.criticality_rank}</td>
                            <td className="p-3 font-medium text-white">{row.node_name}</td>
                            <td className="p-3 font-mono text-xs text-slate-400">{row.node_type}</td>
                            <td className="p-3 font-mono text-rose-400">{Math.round(row.failure_probability * 100)}%</td>
                            <td className="p-3 font-mono text-amber-400">-{Math.round(row.service_impact * 100)}%</td>
                            <td className="p-3 font-mono">{row.downstream_customers} zones</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">{row.criticality_score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 fill-current" />
              </div>
              <h3 className="text-xl font-bold text-white">Digital Twin Simulation Ready</h3>
              <p className="text-slate-400 max-w-md mx-auto text-sm">
                Configure your disruption scenario on the left console and launch Monte Carlo simulations to analyze thousand stochastic futures.
              </p>
            </div>
          )}

          {/* Robust Strategy Comparison Matrix */}
          {comparison && (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Robust Strategy Comparison Matrix
                </h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                  RECOMMENDED: {comparison.recommended_strategy_id.toUpperCase()}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-3">Strategy</th>
                      <th className="p-3">Service P50</th>
                      <th className="p-3">P90 Cost</th>
                      <th className="p-3">TTR (P90)</th>
                      <th className="p-3">CVaR95</th>
                      <th className="p-3">Robustness Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="bg-slate-950/40">
                      <td className="p-3 font-semibold text-slate-300">{comparison.baseline.name}</td>
                      <td className="p-3 font-mono">{Math.round(comparison.baseline.service_p50 * 100)}%</td>
                      <td className="p-3 font-mono text-slate-400">${Math.round(comparison.baseline.cost_p90).toLocaleString()}</td>
                      <td className="p-3 font-mono">{comparison.baseline.ttr_p90}h</td>
                      <td className="p-3 font-mono text-rose-400">${Math.round(comparison.baseline.cvar_95).toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">{comparison.baseline.robustness_score}</td>
                    </tr>
                    {comparison.candidates.map((cand) => (
                      <tr
                        key={cand.strategy_id}
                        className={cand.strategy_id === comparison.recommended_strategy_id ? 'bg-indigo-500/10 border-l-4 border-indigo-500' : ''}
                      >
                        <td className="p-3 font-semibold text-white">{cand.name}</td>
                        <td className="p-3 font-mono text-cyan-400">{Math.round(cand.service_p50 * 100)}%</td>
                        <td className="p-3 font-mono text-slate-300">${Math.round(cand.cost_p90).toLocaleString()}</td>
                        <td className="p-3 font-mono text-amber-400">{cand.ttr_p90}h</td>
                        <td className="p-3 font-mono text-rose-400">${Math.round(cand.cvar_95).toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{cand.robustness_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
