/**
 * ChallengeEngineWorkspace — Phase 4
 *
 * Active Learning, Counterfactual Simulation, Boundary Probing,
 * and Adaptive Autonomy Governance Console.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight,
  RefreshCw, Play, Sliders, Database, Layers, Flame, Gauge,
  Activity, HelpCircle, FileText, ChevronRight, Eye, ShieldCheck,
} from 'lucide-react';
import { challengeApi } from '../../api/challengeApi';
import type {
  ChallengeResult,
  ChallengeMetrics,
  GradientProbeResult,
  ChallengeScenarioType,
} from '../../types/challenge';

export const ChallengeEngineWorkspace: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [demoRunning, setDemoRunning] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<ChallengeMetrics | null>(null);
  const [history, setHistory] = useState<ChallengeResult[]>([]);
  const [latestResult, setLatestResult] = useState<ChallengeResult | null>(null);
  const [gradientResult, setGradientResult] = useState<GradientProbeResult | null>(null);
  const [canonicalDemoResult, setCanonicalDemoResult] = useState<any | null>(null);

  // Challenge config inputs
  const [scenarioType, setScenarioType] = useState<ChallengeScenarioType>('BOUNDARY_TEST');
  const [capacityValue, setCapacityValue] = useState<number>(0.38);
  const [demandSurgeFactor, setDemandSurgeFactor] = useState<number>(1.0);
  const [alternativeStrategy, setAlternativeStrategy] = useState<string>(
    'Emergency Inventory Draw (Warehouse C Reserves)'
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [metRes, histRes] = await Promise.all([
        challengeApi.getMetrics().catch(() => null),
        challengeApi.getHistory(20).catch(() => []),
      ]);
      if (metRes) setMetrics(metRes);
      if (histRes && histRes.length > 0) {
        setHistory(histRes);
        setLatestResult(histRes[histRes.length - 1]);
      }
    } catch (err) {
      console.warn('Could not load challenge history:', err);
    }
  };

  const handleRunChallenge = async () => {
    setLoading(true);
    try {
      const res = await challengeApi.runChallenge({
        skill_id: 'skill-canonical-supplier-sub',
        scenario_type: scenarioType,
        parameter: 'capacity',
        test_value: capacityValue,
        demand_surge_factor: demandSurgeFactor,
        run_counterfactual: true,
        alternative_strategy: alternativeStrategy,
      });
      setLatestResult(res);
      setHistory((prev) => [...prev, res]);
      const updatedMetrics = await challengeApi.getMetrics().catch(() => null);
      if (updatedMetrics) setMetrics(updatedMetrics);
    } catch (err: any) {
      alert(`Challenge execution error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunGradientProbe = async () => {
    setLoading(true);
    try {
      const res = await challengeApi.runGradientProbe({
        skill_id: 'skill-canonical-supplier-sub',
        parameter: 'capacity',
        values: [0.45, 0.42, 0.41, 0.40, 0.39, 0.37, 0.35],
      });
      setGradientResult(res);
      const histRes = await challengeApi.getHistory(20).catch(() => []);
      setHistory(histRes);
      if (histRes.length > 0) setLatestResult(histRes[histRes.length - 1]);
    } catch (err: any) {
      alert(`Gradient probe error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCanonicalDemo = async () => {
    setDemoRunning(true);
    try {
      const demoRes = await challengeApi.runCanonicalDemo();
      setCanonicalDemoResult(demoRes);
      const [metRes, histRes] = await Promise.all([
        challengeApi.getMetrics().catch(() => null),
        challengeApi.getHistory(20).catch(() => []),
      ]);
      if (metRes) setMetrics(metRes);
      if (histRes) {
        setHistory(histRes);
        if (histRes.length > 0) setLatestResult(histRes[histRes.length - 1]);
      }
    } catch (err: any) {
      alert(`Canonical demo error: ${err.message}`);
    } finally {
      setDemoRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 p-6 space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Swords size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">CHALLENGE ENGINE</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  ACTIVE LEARNING
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  PHASE 4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                "We have learned this recovery Skill. Under what conditions would it fail?"
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInitialData}
            className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleRunCanonicalDemo}
            disabled={demoRunning}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Play size={14} className={demoRunning ? 'animate-spin' : ''} />
            {demoRunning ? 'Running 4-Step Demo...' : 'Run Canonical Demo (Phase 4)'}
          </button>
        </div>
      </div>

      {/* ── Active Metrics Ribbon ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Challenges</div>
          <div className="text-xl font-bold text-white mt-1">{metrics?.challenge_count || history.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Empirical tests executed</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Survival Rate</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {metrics ? `${(metrics.challenge_success_rate * 100).toFixed(1)}%` : '75.0%'}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Passed recovery goals</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Boundaries Discovered</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{metrics?.boundary_discoveries ?? 1}</div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">New failure limits mapped</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Unknown Zones</div>
          <div className="text-xl font-bold text-purple-400 mt-1">{metrics?.unknown_scenarios ?? 1}</div>
          <div className="text-[10px] text-purple-500/80 mt-0.5">Zero prior empirical prior</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Avg Prediction Error</div>
          <div className="text-xl font-bold text-sky-400 mt-1">
            {metrics?.prediction_error_avg_hours ? `${metrics.prediction_error_avg_hours}h` : '0.6h'}
          </div>
          <div className="text-[10px] text-sky-500/80 mt-0.5">Calibrating skill model</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Evidence Reused</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{metrics?.evidence_reuse ?? history.length}</div>
          <div className="text-[10px] text-indigo-500/80 mt-0.5">Hindsight recalls & retains</div>
        </div>
      </div>

      {/* ── Main 2-Column Work Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Skill Under Test & Challenge Config (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Skill Under Test Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Skill Under Test</span>
                <h3 className="text-base font-bold text-white">Supplier Substitution (Secondary Sourcing)</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2 ACTIVE
              </span>
            </div>

            {/* Current Knowledge Base */}
            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Current Knowledge Envelope:</div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>Success Condition: Alternate capacity &gt;= 40%</span>
                </div>
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle size={13} />
                  <span>Known Failure Boundary: Capacity &lt; 40% triggers stockout cascades</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-900">
                  <span>Confidence: <strong className="text-white">88%</strong></span>
                  <span>Evidence Base: <strong className="text-white">7 episodes</strong></span>
                  <span>Governance: <strong className="text-emerald-400">AUTO</strong></span>
                </div>
              </div>
            </div>

            {/* Challenge Configuration Form */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Challenge Scenario Type:</span>
                <span className="text-[10px] text-slate-500">Hypothesis-driven</span>
              </div>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value as ChallengeScenarioType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
              >
                <option value="BOUNDARY_TEST">BOUNDARY_TEST (Probing 40% threshold)</option>
                <option value="CAPACITY_DEGRADATION">CAPACITY_DEGRADATION (Drop precondition margin)</option>
                <option value="DEMAND_SURGE">DEMAND_SURGE (Testing volume overload limits)</option>
                <option value="DEPENDENCY_FAILURE">DEPENDENCY_FAILURE (Upstream hub outage)</option>
                <option value="TOPOLOGY_CHANGE">TOPOLOGY_CHANGE (Transshipment via alternate warehouse)</option>
                <option value="STALE_EVIDENCE">STALE_EVIDENCE (Historical records &gt; 90 days)</option>
                <option value="CONFLICTING_EVIDENCE">CONFLICTING_EVIDENCE (Conflicting operational reports)</option>
                <option value="NOVEL_CONDITION">NOVEL_CONDITION (Unprecedented factor → UNKNOWN)</option>
              </select>

              {/* Capacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Supplier Capacity:</span>
                  <span className={`font-mono font-bold ${capacityValue < 0.40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(capacityValue * 100).toFixed(0)}% {capacityValue < 0.40 ? '(BELOW BOUNDARY)' : '(SAFE)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.80"
                  step="0.01"
                  value={capacityValue}
                  onChange={(e) => setCapacityValue(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Demand Surge Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Demand Surge Factor:</span>
                  <span className={`font-mono font-bold ${demandSurgeFactor > 1.4 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {demandSurgeFactor.toFixed(1)}x {demandSurgeFactor > 1.4 ? '(ACUTE)' : '(NOMINAL)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.1"
                  value={demandSurgeFactor}
                  onChange={(e) => setDemandSurgeFactor(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Alternative Strategy for Counterfactual */}
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Counterfactual Alternative Strategy:</span>
                <select
                  value={alternativeStrategy}
                  onChange={(e) => setAlternativeStrategy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Emergency Inventory Draw (Warehouse C Reserves)">
                    Emergency Inventory Draw (Warehouse C Reserves)
                  </option>
                  <option value="Production Rescheduling & Alternative Line Dispatch">
                    Production Rescheduling & Alternative Line Dispatch
                  </option>
                  <option value="Baseline (No Action)">Baseline (No Action / Backlog Absorption)</option>
                </select>
              </div>

              {/* Execution Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleRunChallenge}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-900/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Swords size={14} />
                  Execute Challenge
                </button>
                <button
                  onClick={handleRunGradientProbe}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Sliders size={14} />
                  Gradient Probe
                </button>
              </div>
            </div>
          </div>

          {/* Controlled Gradient Probing Results Drawer */}
          {gradientResult && (
            <div className="bg-slate-900/70 border border-amber-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Controlled Boundary Probe</h4>
                </div>
                {gradientResult.transition_point !== undefined && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    Transition: {(gradientResult.transition_point * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{gradientResult.recommendation}</p>

              {/* Gradient steps */}
              <div className="grid grid-cols-7 gap-1 pt-1">
                {gradientResult.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-center border ${
                      st.skill_survived
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold">{(st.value * 100).toFixed(0)}%</div>
                    <div className="text-[9px] mt-1 font-semibold">{st.skill_survived ? 'PASS' : 'FAIL'}</div>
                    <div className="text-[9px] text-slate-400">{st.recovery_hours}h</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Execution Outcome, Counterfactual Arena, Evidence & Governance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Latest Execution Card */}
          {latestResult ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      latestResult.skill_survived
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : latestResult.outcome_status === 'UNKNOWN'
                        ? 'bg-purple-400 shadow-sm shadow-purple-400/50'
                        : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                    }`}
                  />
                  <h3 className="text-base font-bold text-white">
                    Challenge Outcome: {latestResult.outcome_status}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {latestResult.scenario.scenario_type}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      latestResult.boundary_status === 'WITHIN_BOUNDARY'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : latestResult.boundary_status === 'NEW_BOUNDARY_REVEALED'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : latestResult.boundary_status === 'BOUNDARY_UNCERTAIN'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {latestResult.boundary_status}
                  </span>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <strong className="text-white">Analysis: </strong>
                {latestResult.recommendation}
              </div>

              {/* Prediction vs Actual Calibration */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Skill Prediction</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {latestResult.predicted_behavior.predicted_recovery_hours} hrs
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Target: {latestResult.predicted_behavior.applicable ? 'Applicable' : 'Inapplicable'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Simulated Actual</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {latestResult.actual_simulated_behavior.recovery_hours} hrs
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Service Level: {((latestResult.actual_simulated_behavior.service_level || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Prediction Error</div>
                  <div className={`text-sm font-bold mt-1 ${(latestResult.prediction_error_hours || 0) > 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {(latestResult.prediction_error_hours || 0) > 0 ? `+${latestResult.prediction_error_hours}h` : `${latestResult.prediction_error_hours}h`}
                  </div>
                  <div className="text-[10px] text-slate-500">Evidence retained in memory</div>
                </div>
              </div>

              {/* Counterfactual Arena (Skill Action vs Alternative Strategy) */}
              {latestResult.counterfactual && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Swords size={15} className="text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Counterfactual Comparison Arena
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Branch A: Skill */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-rose-400 uppercase">Primary Skill Action</span>
                        <span className={`text-[10px] font-bold ${latestResult.counterfactual.skill_outcome.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {latestResult.counterfactual.skill_outcome.success ? 'SUCCESS' : 'FAILED'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">{latestResult.counterfactual.skill_name}</div>
                      <div className="text-xs text-slate-400 flex justify-between">
                        <span>Recovery: <strong className="text-white">{latestResult.counterfactual.skill_outcome.recovery_hours}h</strong></span>
                        <span>Service: <strong className="text-white">{((latestResult.counterfactual.skill_outcome.service_level || 0) * 100).toFixed(1)}%</strong></span>
                      </div>
                    </div>

                    {/* Branch B: Alternative */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-amber-400 uppercase">Counterfactual Alternative</span>
                        <span className={`text-[10px] font-bold ${latestResult.counterfactual.alternative_outcome.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {latestResult.counterfactual.alternative_outcome.success ? 'SUCCESS' : 'FAILED'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">{latestResult.counterfactual.alternative_name}</div>
                      <div className="text-xs text-slate-400 flex justify-between">
                        <span>Recovery: <strong className="text-white">{latestResult.counterfactual.alternative_outcome.recovery_hours}h</strong></span>
                        <span>Service: <strong className="text-white">{((latestResult.counterfactual.alternative_outcome.service_level || 0) * 100).toFixed(1)}%</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Badges: Adaptive Autonomy & Evolution */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Adaptive Autonomy:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] border ${
                      latestResult.adaptive_governance === 'AUTO'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : latestResult.adaptive_governance === 'MONITOR'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : latestResult.adaptive_governance === 'APPROVAL'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {latestResult.adaptive_governance}
                  </span>
                </div>

                {latestResult.evolution_proposal_id ? (
                  <div className="flex items-center gap-2 text-amber-400">
                    <ShieldAlert size={14} />
                    <span>Evolution Proposal: <strong className="font-mono text-white">{latestResult.evolution_proposal_id}</strong> (v1 immutable)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck size={14} />
                    <span>Skill bounds verified (Confidence: {(latestResult.confidence_after * 100).toFixed(0)}%)</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-12 text-center text-slate-500 space-y-3">
              <Swords size={36} className="mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">No Challenge Executed Yet</div>
              <p className="text-xs max-w-sm mx-auto">
                Configure perturbations on the left or click "Run Canonical Demo (Phase 4)" to observe active learning and boundary testing.
              </p>
            </div>
          )}

          {/* Canonical Demo Storyboard Report */}
          {canonicalDemoResult && (
            <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Play size={16} className="text-rose-400" />
                  <h4 className="text-sm font-bold text-white">Canonical Phase 4 Demonstration Storyboard</h4>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  COMPLETED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-emerald-400">1. Challenge: Capacity = 45%</div>
                  <div className="text-slate-300 mt-1">Status: SURVIVED ({((canonicalDemoResult.challenge_1.service_level || 0.91) * 100).toFixed(0)}% recovery)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Retained in Hindsight memory</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-rose-400">2. Challenge: Capacity = 38%</div>
                  <div className="text-slate-300 mt-1">Status: FAILED (Boundary breach confirmed)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Discovered failure boundary &lt; 40%</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-purple-400">3. Challenge: Capacity = 40%</div>
                  <div className="text-slate-300 mt-1">Status: Recalled prior challenge</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Flagged as UNCERTAIN near boundary</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-amber-400">4. Compound Disruption & Counterfactual</div>
                  <div className="text-slate-300 mt-1">Alternative Strategy succeeded</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Autonomy degraded to APPROVAL (v1 immutable)</div>
                </div>
              </div>
            </div>
          )}

          {/* Historical Challenge Tests Feed */}
          {history.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Recent Challenge History ({history.length})
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500">Immutable Hindsight traces</span>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto pr-1">
                {history.slice(-6).reverse().map((hItem, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          hItem.skill_survived
                            ? 'bg-emerald-400'
                            : hItem.outcome_status === 'UNKNOWN'
                            ? 'bg-purple-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      <span className="font-medium text-white">{hItem.scenario.scenario_type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        cap={(hItem.scenario.perturbations.capacity || 0.7).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold ${hItem.skill_survived ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {hItem.outcome_status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {hItem.prediction_error_hours !== undefined ? `${hItem.prediction_error_hours}h err` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeEngineWorkspace;
