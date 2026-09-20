import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchTwinStatus,
  createDigitalTwin,
  runMonteCarlo,
  analyzeResilienceCriticality,
} from '../../api/simulationApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import {
  Activity, FlaskConical, Play, BarChart3, TrendingUp,
  AlertTriangle, RefreshCw, Layers, Target,
} from 'lucide-react';
import { MonteCarloResult, CriticalityResult, ScenarioConfig } from '../../types/simulation';

const DEFAULT_SCENARIO: ScenarioConfig = {
  scenario_id: 'DEMO-SCENARIO',
  name: 'Double Punch Scenario',
  description: 'Supplier failure + port congestion',
  events: [],
  demand_shock_pct: 0.25,
  recovery_delay_multiplier: 1.5,
  seed: 42,
};

const DEFAULT_MC_CONFIG = {
  scenario_id: 'DEMO-SCENARIO',
  n_simulations: 500,
  seed: 42,
  horizon: '72h' as const,
  max_workers: 4,
};

export const DigitalTwinWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const [twinId, setTwinId] = useState<string | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [critResults, setCritResults] = useState<CriticalityResult[]>([]);

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  const { data: twinStatus } = useQuery({
    queryKey: ['twinStatus'],
    queryFn: fetchTwinStatus,
  });

  const createTwinMutation = useMutation({
    mutationFn: () => createDigitalTwin('DT-MAIN', 42),
    onSuccess: (data: any) => {
      setTwinId(data?.data?.twin_id || 'DT-MAIN');
    },
  });

  const mcMutation = useMutation({
    mutationFn: (id: string) => runMonteCarlo(id, DEFAULT_SCENARIO, DEFAULT_MC_CONFIG),
    onSuccess: (data) => setMcResult(data),
  });

  const critMutation = useMutation({
    mutationFn: (id: string) => analyzeResilienceCriticality(id, DEFAULT_SCENARIO),
    onSuccess: (data) => setCritResults(data),
  });

  const handleRunAll = async () => {
    const id = twinId || 'DT-MAIN';
    if (!twinId) {
      createTwinMutation.mutate();
    }
    mcMutation.mutate(id);
    critMutation.mutate(id);
  };

  const isRunning = createTwinMutation.isPending || mcMutation.isPending || critMutation.isPending;

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Digital Twin — Monte Carlo Resilience Engine</h1>
            <p className="text-xs text-slate-400">
              {twinStatus?.engine_version || '—'} · {twinStatus?.active_twins ?? 0} active twins · Mode: {twinStatus?.mode || 'READY'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRunAll}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-cyan-600/30"
          >
            {isRunning ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>RUN MONTE CARLO (n=500)</span>
          </button>

          {twinId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 font-mono text-xs text-cyan-300">
              <Layers className="w-3.5 h-3.5" />
              <span>Twin: {twinId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scenario Config Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex flex-wrap gap-6 font-mono text-xs">
          <span className="text-slate-400">Scenario: <strong className="text-cyan-300">{DEFAULT_SCENARIO.name}</strong></span>
          <span className="text-slate-400">Demand Shock: <strong className="text-red-400">+{(DEFAULT_SCENARIO.demand_shock_pct * 100).toFixed(0)}%</strong></span>
          <span className="text-slate-400">Recovery Delay: <strong className="text-amber-400">×{DEFAULT_SCENARIO.recovery_delay_multiplier}</strong></span>
          <span className="text-slate-400">Horizon: <strong className="text-slate-200">{DEFAULT_MC_CONFIG.horizon}</strong></span>
          <span className="text-slate-400">Simulations: <strong className="text-slate-200">{DEFAULT_MC_CONFIG.n_simulations}</strong></span>
          <span className="text-slate-400">Seed: <strong className="text-slate-200">{DEFAULT_MC_CONFIG.seed}</strong></span>
        </div>
      </div>

      {isRunning && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 font-mono text-sm">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <span>Running {DEFAULT_MC_CONFIG.n_simulations} Monte Carlo trajectories...</span>
        </div>
      )}

      {/* Monte Carlo Results */}
      {mcResult && (
        <div className="flex flex-col gap-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Resilience Score', value: `${(mcResult.metrics.resilience_score * 100).toFixed(1)}%`, color: '#34d399' },
              { label: 'Service Level P50', value: `${(mcResult.metrics.service_level_dist.p50 * 100).toFixed(1)}%`, color: '#60a5fa' },
              { label: 'Service Level P10', value: `${(mcResult.metrics.service_level_dist.p10 * 100).toFixed(1)}%`, color: '#f87171' },
              { label: 'Stockout Prob.', value: `${(mcResult.metrics.stockout_probability * 100).toFixed(1)}%`, color: '#fb923c' },
              { label: 'CVaR 95% Cost', value: `$${(mcResult.metrics.cvar_cost_95 / 1000).toFixed(0)}K`, color: '#c084fc' },
              { label: 'TTR P90', value: `${mcResult.metrics.ttr_p90.toFixed(1)}h`, color: '#fbbf24' },
            ].map((kpi) => (
              <div key={kpi.label} className="p-4 rounded-xl bg-slate-900/85 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono uppercase">{kpi.label}</div>
                <div className="text-lg font-black mt-1 font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Resilience Dimensions */}
          <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl">
            <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Resilience Dimensions</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Service', value: mcResult.metrics.service_resilience },
                { label: 'Recovery', value: mcResult.metrics.recovery_resilience },
                { label: 'Cost', value: mcResult.metrics.cost_resilience },
                { label: 'Network', value: mcResult.metrics.network_resilience },
                { label: 'Customer', value: mcResult.metrics.customer_resilience },
                { label: 'Inventory', value: mcResult.metrics.inventory_resilience },
                { label: 'Transport', value: mcResult.metrics.transportation_resilience },
                { label: 'Compound', value: mcResult.metrics.compound_resilience },
              ].map((dim) => {
                const pct = dim.value * 100;
                const color = pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171';
                return (
                  <div key={dim.label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-400">{dim.label}</span>
                      <span className="font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, pct)}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Info */}
          <div className="flex flex-wrap gap-4 font-mono text-xs text-slate-400 px-1">
            <span>MC ID: <strong className="text-slate-200">{mcResult.mc_id}</strong></span>
            <span>Simulations: <strong className="text-slate-200">{mcResult.n_simulations}</strong></span>
            <span>Horizon: <strong className="text-slate-200">{mcResult.horizon_hours}h</strong></span>
            <span>Execution: <strong className="text-cyan-400">{mcResult.execution_time_sec.toFixed(2)}s</strong></span>
          </div>
        </div>
      )}

      {/* Criticality Rankings */}
      {critResults.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-red-400" />
            <span>Node Criticality Rankings ({critResults.length})</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Node</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Criticality</th>
                  <th className="py-2">Failure Prob.</th>
                  <th className="py-2">Service Impact</th>
                  <th className="py-2">Downstream</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {critResults.slice(0, 10).map((node) => (
                  <tr key={node.node_id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-2 font-bold text-red-400">#{node.criticality_rank}</td>
                    <td className="py-2 font-bold text-slate-200">{node.node_id}</td>
                    <td className="py-2 text-slate-400">{node.node_type}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, node.criticality_score * 100)}%`,
                              background: node.criticality_score > 0.7 ? '#f87171' : node.criticality_score > 0.4 ? '#fbbf24' : '#34d399',
                            }}
                          />
                        </div>
                        <span className="font-bold text-slate-200">{(node.criticality_score * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-amber-400">{(node.failure_probability * 100).toFixed(1)}%</td>
                    <td className="py-2 text-red-400">{(node.service_impact * 100).toFixed(1)}%</td>
                    <td className="py-2 text-slate-300">{node.downstream_customers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!mcResult && !critResults.length && !isRunning && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500 font-mono text-sm">
          <FlaskConical className="w-12 h-12 text-slate-700" />
          <div className="text-center">
            <div className="text-base font-semibold text-slate-300 mb-1">Digital Twin Ready</div>
            <div className="text-xs text-slate-500">Click "Run Monte Carlo" to execute 500 stochastic trajectories and assess supply chain resilience.</div>
          </div>
        </div>
      )}
    </div>
  );
};
