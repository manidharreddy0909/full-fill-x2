/**
 * ScenarioConfigurator — Interactive Scenario Controls for Digital Twin
 * Phase 13D-1: Digital Twin & Simulation Visualization
 *
 * Exposes real scenario parameters: demand_shock_pct, recovery_delay_multiplier, seed, horizon, n_simulations.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Zap, RotateCcw, Activity, Play, ShieldAlert, Cpu } from 'lucide-react';
import { ScenarioConfig, SimulationHorizon } from '../../types/simulation';
import { StatusPill } from '../telemetry/StatusPill';

export interface ScenarioConfiguratorProps {
  scenario: ScenarioConfig;
  nSimulations: number;
  horizon: SimulationHorizon;
  onUpdateScenario: (updated: Partial<ScenarioConfig>) => void;
  onUpdateSimConfig: (sims: number, horiz: SimulationHorizon) => void;
  onRunSimulation: () => void;
  isPending: boolean;
}

export const ScenarioConfigurator: React.FC<ScenarioConfiguratorProps> = ({
  scenario,
  nSimulations,
  horizon,
  onUpdateScenario,
  onUpdateSimConfig,
  onRunSimulation,
  isPending,
}) => {
  return (
    <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Stochastic Scenario Configurator</span>
        </div>
        <StatusPill color="#38bdf8" label={`SEED ${scenario.seed}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {/* Demand Shock Parameter */}
        <div className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Demand Shock:</span>
            <strong className="text-red-400">+{(scenario.demand_shock_pct * 100).toFixed(0)}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={scenario.demand_shock_pct}
            onChange={(e) => onUpdateScenario({ demand_shock_pct: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 bg-slate-900 cursor-pointer"
          />
        </div>

        {/* Recovery Delay Multiplier */}
        <div className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400 font-mono">Recovery Delay:</span>
            <strong className="text-amber-400">×{scenario.recovery_delay_multiplier.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={scenario.recovery_delay_multiplier}
            onChange={(e) => onUpdateScenario({ recovery_delay_multiplier: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 bg-slate-900 cursor-pointer"
          />
        </div>

        {/* Trajectory Iterations */}
        <div className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-400">Simulations (n):</label>
          <select
            value={nSimulations}
            onChange={(e) => onUpdateSimConfig(parseInt(e.target.value, 10), horizon)}
            className="bg-[#090d16] text-cyan-300 font-bold px-2.5 py-1 rounded border border-slate-700 outline-none cursor-pointer"
          >
            <option value={100}>100 Trajectories</option>
            <option value={500}>500 Trajectories</option>
            <option value={1000}>1,000 Trajectories</option>
          </select>
        </div>

        {/* Time Horizon */}
        <div className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-400">Time Horizon:</label>
          <select
            value={horizon}
            onChange={(e) => onUpdateSimConfig(nSimulations, e.target.value as SimulationHorizon)}
            className="bg-[#090d16] text-cyan-300 font-bold px-2.5 py-1 rounded border border-slate-700 outline-none cursor-pointer"
          >
            <option value="24h">24 Hours</option>
            <option value="48h">48 Hours</option>
            <option value="72h">72 Hours</option>
            <option value="7d">7 Days</option>
            <option value="14d">14 Days</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onRunSimulation}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-900/30"
      >
        {isPending ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        <span>RUN MONTE CARLO SIMULATION (n={nSimulations})</span>
      </button>
    </div>
  );
};
