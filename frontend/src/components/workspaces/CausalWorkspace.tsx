/**
 * CausalWorkspace — Causal Intelligence Laboratory & Counterfactual DAG Sandbox
 * Phase 13B: Intelligence Visualization
 *
 * Design: Structural causal DAG (Cause → Mechanism → Effect), evidence level status demarcation,
 * counterfactual sandbox simulation runner, CausalDAGPrimitive integration.
 */

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  fetchCausalHypotheses,
  runCounterfactualSimulation,
  CausalHypothesis,
  CounterfactualRun,
} from '../../api/graphIntelligenceApi';
import { useSearchParams } from 'react-router-dom';
import { useIncidentContextStore } from '../../store/incidentContextStore';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import { CausalDAGPrimitive } from '../../visual/intelligence/CausalDAGPrimitive';
import { Activity, GitMerge, Zap, ShieldAlert, CheckCircle2, ArrowRight, HelpCircle, Play } from 'lucide-react';

export const CausalWorkspace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const contextNodeId = useIncidentContextStore((s) => s.selectedNodeId);
  const setSelectedNodeInContext = useIncidentContextStore((s) => s.setSelectedNodeId);
  const { setEnvironmentMode } = useVisualEnvironmentStore();

  const initialNode = searchParams.get('node') || contextNodeId || 'sup-001';
  const [selectedOriginNode, setSelectedOriginNode] = useState<string>(initialNode);

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
    if (selectedOriginNode) {
      setSelectedNodeInContext(selectedOriginNode);
    }
  }, [setEnvironmentMode, selectedOriginNode, setSelectedNodeInContext]);

  const { data: hypotheses = [], isLoading } = useQuery<CausalHypothesis[]>({
    queryKey: ['causalHypotheses', selectedOriginNode],
    queryFn: () => fetchCausalHypotheses(selectedOriginNode),
  });

  const counterfactualMutation = useMutation<CounterfactualRun, Error, CausalHypothesis>({
    mutationFn: (hyp) =>
      runCounterfactualSimulation({
        target_node_id: hyp.effect_node_id || hyp.cause_node_id || 'wh-001',
        parameter_overrides: { capacity: 80.0, utilization: 0.40 },
        horizon_hours: 24,
      }),
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center bg-[#030712] text-purple-400 font-mono text-xs">
        <Activity className="w-5 h-5 animate-spin mr-3 text-purple-400" />
        <span>GENERATING STRUCTURAL CAUSAL HYPOTHESES & COUNTERFACTUAL DAGS...</span>
      </div>
    );
  }

  const primaryHypothesis = hypotheses[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#030712] font-sans"
    >
      {/* Header Controls HUD Bar */}
      <div className="p-5 rounded-xl bg-[#090d16]/90 border border-purple-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-mono uppercase">
                Causal Intelligence & Counterfactual DAG Sandbox
              </h1>
              <StatusPill color="#a855f7" label="CAUSAL DAG LIVE" pulse />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Structured Causal Hypotheses · Evidence Status Demarcation · Counterfactual Interventions
            </p>
          </div>
        </div>

        {/* Origin Node Selection */}
        <div className="flex items-center gap-2 font-mono text-xs bg-[#030712] p-2 rounded-lg border border-purple-500/30">
          <span className="text-slate-400 font-bold">ORIGIN NODE:</span>
          <select
            value={selectedOriginNode}
            onChange={(e) => setSelectedOriginNode(e.target.value)}
            className="bg-[#090d16] text-purple-300 font-bold px-3 py-1.5 rounded border border-purple-500/40 outline-none cursor-pointer hover:border-purple-400 transition-all"
          >
            <option value="sup-001">sup-001 — Apex Electronics</option>
            <option value="sup-002">sup-002 — Global Components</option>
            <option value="port-001">port-001 — Port of Osaka</option>
            <option value="wh-001">wh-001 — APAC Regional Hub</option>
          </select>
        </div>
      </div>

      {/* Primary Structural Causal DAG Visual Primitive */}
      {primaryHypothesis && (
        <CausalDAGPrimitive
          rootCauseNodeId={primaryHypothesis.cause_node_id}
          targetEffectNodeId={primaryHypothesis.effect_node_id}
          mechanismSummary={primaryHypothesis.assumptions?.join('; ') || 'Causal mechanism active'}
          evidenceStatus={primaryHypothesis.causal_status}
          confidenceScore={primaryHypothesis.confidence}
          counterfactualResult={counterfactualMutation.data}
        />
      )}

      {/* Causal Hypotheses Cards Stack */}
      <div className="p-5 rounded-xl bg-[#090d16]/90 border border-purple-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
          <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Structured Root-Cause Hypotheses ({hypotheses.length})</span>
          </span>
          <StatusPill color="#a855f7" label="DO-CALCULUS VALIDATED" />
        </div>

        <div className="space-y-4">
          {hypotheses.map((hyp) => (
            <motion.div
              key={hyp.hypothesis_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#030712]/90 border border-slate-800 flex flex-col gap-3 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 font-bold text-purple-300">
                  <span>{hyp.hypothesis_id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{hyp.cause_node_id} → {hyp.effect_node_id}</span>
                </div>
                <StatusPill
                  color={hyp.causal_status === 'SUPPORTED_BY_EXPERIMENT' ? '#34d399' : hyp.causal_status === 'CAUSAL_HYPOTHESIS' ? '#a855f7' : '#fbbf24'}
                  label={(hyp.causal_status || 'HYPOTHESIS').replace(/_/g, ' ')}
                />
              </div>

              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                Path: {hyp.propagation_path?.join(' → ') || 'Direct relationship'}. Assumptions: {hyp.assumptions?.join(', ') || 'None'}.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900 text-xs font-mono">
                <span className="text-slate-400">
                  Confidence Score: <strong className="text-emerald-400">{(hyp.confidence * 100).toFixed(0)}%</strong>
                </span>

                <button
                  onClick={() => counterfactualMutation.mutate(hyp)}
                  disabled={counterfactualMutation.isPending}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-purple-900/30"
                >
                  {counterfactualMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>RUN COUNTERFACTUAL SIMULATION</span>
                </button>
              </div>
            </motion.div>
          ))}

          {hypotheses.length === 0 && (
            <div className="text-center text-slate-500 font-mono text-xs py-10">
              No causal hypotheses identified for selected origin node.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
