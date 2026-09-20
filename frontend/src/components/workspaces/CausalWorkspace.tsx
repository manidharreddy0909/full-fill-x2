import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchCausalHypotheses,
  runCounterfactualSimulation,
  CausalHypothesis,
  CounterfactualRun,
} from '../../api/graphIntelligenceApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { Activity, GitMerge, Zap, ShieldAlert, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

export const CausalWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const [selectedOriginNode, setSelectedOriginNode] = useState<string>('sup-001');

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  const { data: hypotheses = [], isLoading } = useQuery<CausalHypothesis[]>({
    queryKey: ['causalHypotheses', selectedOriginNode],
    queryFn: () => fetchCausalHypotheses(selectedOriginNode),
  });

  const counterfactualMutation = useMutation<CounterfactualRun, Error, CausalHypothesis>({
    mutationFn: (hyp) =>
      runCounterfactualSimulation({
        target_node_id: hyp.target_effect_node_id,
        do_action: 'SUPPLIER_SWITCH',
        parameters: { root_cause: hyp.root_cause_node_id },
      }),
  });

  const getStatusBadge = (status: CausalHypothesis['evidence_status']) => {
    switch (status) {
      case 'SANDBOX_COUNTERFACTUAL':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            ✓ SANDBOX COUNTERFACTUAL (VERIFIED)
          </span>
        );
      case 'HIGH_CONFIDENCE_HYPOTHESIS':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
            ★ HIGH CONFIDENCE HYPOTHESIS
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
            ⚠ OBSERVED ASSOCIATION (UNPROVEN CAUSALITY)
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center text-slate-400 font-mono text-xs">
        <Activity className="w-4 h-4 animate-spin mr-2 text-purple-400" />
        <span>Generating Structured Causal Hypotheses & Counterfactual DAGs...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Top Header Controls */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Causal Intelligence & Counterfactual DAG Sandbox</h1>
            <p className="text-xs text-slate-400">Structured causal root-cause hypotheses with evidence level demarcation</p>
          </div>
        </div>

        {/* Origin Node Selection */}
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400">Origin Node:</span>
          <select
            value={selectedOriginNode}
            onChange={(e) => setSelectedOriginNode(e.target.value)}
            className="bg-slate-900 text-purple-300 font-bold px-2.5 py-1 rounded border border-slate-700 outline-none"
          >
            <option value="sup-001">sup-001 — Apex Electronics</option>
            <option value="sup-002">sup-002 — Global Components</option>
            <option value="port-001">port-001 — Port of Osaka</option>
            <option value="wh-001">wh-001 — APAC Regional Hub</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Causal Hypothesis Cards */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Causal Hypotheses ({hypotheses.length})</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Evidence Status Demarcation Active</span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {hypotheses.map((hyp) => (
              <div
                key={hyp.hypothesis_id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3 transition-all hover:border-purple-600/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-purple-300">{hyp.hypothesis_id}</span>
                  {getStatusBadge(hyp.evidence_status)}
                </div>

                <div className="flex items-center gap-3 font-mono text-xs p-2.5 rounded bg-slate-900/80 border border-slate-800/80">
                  <span className="text-red-400 font-bold">Root Cause: {hyp.root_cause_node_id}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="text-purple-300 font-bold">Effect Target: {hyp.target_effect_node_id}</span>
                </div>

                <p className="text-xs text-slate-300 font-light">{hyp.description}</p>

                {/* Impact & Confidence Stats */}
                <div className="flex items-center justify-between font-mono text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex gap-4">
                    <span className="text-slate-400">
                      Impact Score: <strong className="text-red-400">{(hyp.causal_impact_score * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="text-slate-400">
                      Confidence: <strong className="text-purple-300">{(hyp.confidence * 100).toFixed(0)}%</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => counterfactualMutation.mutate(hyp)}
                    disabled={counterfactualMutation.isPending}
                    className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-mono font-semibold transition-all flex items-center gap-1 shadow-md shadow-purple-600/30"
                  >
                    <GitMerge className="w-3 h-3" />
                    <span>Run Counterfactual Do-Action</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Counterfactual Simulation Output */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-col gap-4 shadow-xl">
          <h3 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Counterfactual Do-Intervention Sandbox</span>
          </h3>

          {counterfactualMutation.data ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Intervention Run ID:</span>
                <span className="font-bold text-purple-300">{counterfactualMutation.data.run_id}</span>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Do-Action Applied:</span>
                <span className="font-bold text-cyan-400">{counterfactualMutation.data.do_action}</span>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Original Risk Score:</span>
                <span className="font-bold text-red-400">
                  {(counterfactualMutation.data.original_risk_score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Counterfactual Risk Score:</span>
                <span className="font-bold text-emerald-400">
                  {(counterfactualMutation.data.counterfactual_risk_score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Risk Reduction Delta:</span>
                <span className="font-bold text-emerald-400">
                  -{(counterfactualMutation.data.delta_risk * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
              <HelpCircle className="w-8 h-8 text-slate-600" />
              <span>Select a causal hypothesis and run a counterfactual do-intervention to observe simulated risk delta.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
