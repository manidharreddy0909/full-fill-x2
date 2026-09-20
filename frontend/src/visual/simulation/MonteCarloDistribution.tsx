/**
 * MonteCarloDistribution — Monte Carlo Stochastic Outcome Distribution
 * Phase 13D-1: Digital Twin & Simulation Visualization
 *
 * Displays percentiles (P10, P25, P50, P75, P90), CVaR 95%, stockout probability,
 * TTR P90, and 8-dimension resilience breakdown.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, ShieldAlert, DollarSign, Clock, Layers } from 'lucide-react';
import { MonteCarloResult } from '../../types/simulation';
import { StatusPill } from '../telemetry/StatusPill';

export interface MonteCarloDistributionProps {
  result: MonteCarloResult;
}

export const MonteCarloDistribution: React.FC<MonteCarloDistributionProps> = ({ result }) => {
  const m = result.metrics;

  const kpis = [
    { label: 'Resilience Score', value: `${(m.resilience_score * 100).toFixed(1)}%`, color: '#34d399' },
    { label: 'Service Level P50', value: `${(m.service_level_dist.p50 * 100).toFixed(1)}%`, color: '#38bdf8' },
    { label: 'Service Level P10', value: `${(m.service_level_dist.p10 * 100).toFixed(1)}%`, color: '#f87171' },
    { label: 'Stockout Prob.', value: `${(m.stockout_probability * 100).toFixed(1)}%`, color: '#fb923c' },
    { label: 'CVaR 95% Cost', value: `$${(m.cvar_cost_95 / 1000).toFixed(0)}K`, color: '#a855f7' },
    { label: 'TTR P90', value: `${m.ttr_p90.toFixed(1)}h`, color: '#fbbf24' },
  ];

  const dimensions = [
    { label: 'Service Resilience', value: m.service_resilience },
    { label: 'Recovery Resilience', value: m.recovery_resilience },
    { label: 'Cost Resilience', value: m.cost_resilience },
    { label: 'Network Resilience', value: m.network_resilience },
    { label: 'Customer Resilience', value: m.customer_resilience },
    { label: 'Inventory Resilience', value: m.inventory_resilience },
    { label: 'Transport Resilience', value: m.transportation_resilience },
    { label: 'Compound Resilience', value: m.compound_resilience },
  ];

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-xl bg-[#090d16]/90 border border-slate-800 backdrop-blur-xl flex flex-col gap-1 shadow-lg"
          >
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{kpi.label}</div>
            <div className="text-xl font-bold font-mono" style={{ color: kpi.color }}>
              {kpi.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 8-Dimension Resilience Breakdown */}
      <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
          <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>8-Dimension Supply Network Resilience Breakdown</span>
          </span>
          <StatusPill color="#38bdf8" label={`${result.n_simulations} RUNS`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-1">
          {dimensions.map((dim) => {
            const pct = dim.value * 100;
            const color = pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171';

            return (
              <div key={dim.label} className="flex flex-col gap-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{dim.label}</span>
                  <strong style={{ color }}>{pct.toFixed(1)}%</strong>
                </div>
                <div className="h-2 rounded-full bg-[#030712] overflow-hidden border border-slate-800">
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
    </div>
  );
};
