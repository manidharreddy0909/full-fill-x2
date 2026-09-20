/**
 * GNNWorkspace — Graph Intelligence Laboratory
 * Phase 13B: Intelligence Visualization
 *
 * Design: Mathematical graph neural network view, 95% confidence risk prediction bounds,
 * graph propagation path tracer, node centrality feature matrix, GNNGraphPrimitive.
 */

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  fetchGraphSnapshot,
  fetchGraphFeatures,
  predictGnnNodeRisk,
  analyzeGraphPropagation,
  GraphPrediction,
  PropagationTrace,
} from '../../api/graphIntelligenceApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import { GNNGraphPrimitive } from '../../visual/intelligence/GNNGraphPrimitive';
import {
  Activity, Network, Zap, Cpu, ArrowRight, ShieldCheck, AlertTriangle,
  BarChart2, Share2, Layers
} from 'lucide-react';

export const GNNWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const [selectedTargetNode, setSelectedTargetNode] = useState<string>('sup-001');

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  const { data: snapshot, isLoading: isSnapshotLoading } = useQuery({
    queryKey: ['graphSnapshot'],
    queryFn: fetchGraphSnapshot,
  });

  const { data: features } = useQuery({
    queryKey: ['graphFeatures'],
    queryFn: fetchGraphFeatures,
  });

  const predictMutation = useMutation<GraphPrediction, Error, string>({
    mutationFn: (nodeId) => predictGnnNodeRisk(nodeId, 24),
  });

  const propagateMutation = useMutation<PropagationTrace, Error, string>({
    mutationFn: (nodeId) => analyzeGraphPropagation(nodeId, 4),
  });

  useEffect(() => {
    if (selectedTargetNode) {
      predictMutation.mutate(selectedTargetNode);
      propagateMutation.mutate(selectedTargetNode);
    }
  }, [selectedTargetNode]);

  if (isSnapshotLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center bg-[#030712] text-cyan-400 font-mono text-xs">
        <Activity className="w-5 h-5 animate-spin mr-3 text-cyan-400" />
        <span>INITIALIZING GRAPH NEURAL NETWORK LATENT MATRIX...</span>
      </div>
    );
  }

  const nodes = snapshot?.nodes || [];
  const prediction = predictMutation.data;
  const propagation = propagateMutation.data;
  const trajectoryNodes = propagation?.trajectory?.map((t) => t.node_id) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#030712] font-sans"
    >
      {/* Header Controls HUD Bar */}
      <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-mono uppercase">
                Graph Intelligence Laboratory (GNN)
              </h1>
              <StatusPill color="#38bdf8" label="GNN LATENT MATRIX" pulse />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Node Risk Prediction · 95% Confidence Interval Bounds · Multihop Propagation Analysis
            </p>
          </div>
        </div>

        {/* Target Node Selector */}
        <div className="flex items-center gap-2 font-mono text-xs bg-[#030712] p-2 rounded-lg border border-cyan-500/30">
          <span className="text-slate-400 font-bold">TARGET NODE:</span>
          <select
            value={selectedTargetNode}
            onChange={(e) => setSelectedTargetNode(e.target.value)}
            className="bg-[#090d16] text-cyan-300 font-bold px-3 py-1.5 rounded border border-cyan-500/40 outline-none cursor-pointer hover:border-cyan-400 transition-all"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} — {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column (2 Cols): Mathematical Graph & Risk Prediction */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Mathematical GNN Graph Visual Primitive */}
          <GNNGraphPrimitive
            nodes={nodes}
            selectedNodeId={selectedTargetNode}
            onSelectNode={(id) => setSelectedTargetNode(id)}
            propagationPath={trajectoryNodes}
          />

          {/* GNN Risk Prediction output with 95% Confidence bounds */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>GNN Predictive Risk Output ({selectedTargetNode})</span>
              </span>
              {predictMutation.isPending && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>COMPUTING LATENT INFERENCE...</span>
                </div>
              )}
            </div>

            {prediction ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">PREDICTED RISK SCORE</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {(prediction.predicted_risk_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">24h Horizon</div>
                </div>

                <div className="p-4 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">95% CONFIDENCE LOWER</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {(prediction.confidence_lower_95 * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">Lower Bound</div>
                </div>

                <div className="p-4 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">95% CONFIDENCE UPPER</div>
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {(prediction.confidence_upper_95 * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">Upper Bound</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 font-mono text-xs py-8">
                Select a target node above to run GNN predictive risk bounds.
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Propagation Trace & Centrality Matrix */}
        <div className="flex flex-col gap-6">
          {/* Graph Propagation Path Trace */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Multihop Propagation Trace</span>
              </h2>
              {propagation && (
                <StatusPill color="#fbbf24" label={`${propagation.total_affected_nodes} IMPACTED`} />
              )}
            </div>

            {propagation ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">PROPAGATION TRAJECTORY</span>
                  <div className="text-amber-300 font-bold text-xs leading-relaxed">
                    {trajectoryNodes.join(' → ')}
                  </div>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {propagation.trajectory.map((step) => (
                    <div key={step.step} className="p-2 rounded bg-[#030712]/60 border border-slate-900 flex justify-between text-[10px]">
                      <span className="text-slate-300">Step {step.step}: <strong>{step.node_name}</strong></span>
                      <span className="text-amber-400">+{step.time_offset_hours}h (+{(step.cumulative_impact * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 font-mono text-xs py-8">
                Select a target node to compute multihop propagation.
              </div>
            )}
          </motion.div>

          {/* Graph Centrality Features Matrix */}
          {features && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
            >
              <h2 className="font-mono font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5 text-slate-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>Graph Centrality Matrix</span>
              </h2>

              <div className="space-y-2 font-mono text-xs max-h-56 overflow-y-auto pr-1">
                {Object.keys(features.degree_centrality || {}).map((id) => (
                  <div key={id} className="p-2.5 rounded bg-[#030712]/90 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200">{id}</span>
                    <div className="flex gap-3 text-[10px]">
                      <span>Degree: <strong className="text-cyan-400">{(features.degree_centrality[id] || 0).toFixed(2)}</strong></span>
                      <span>Betweenness: <strong className="text-emerald-400">{(features.betweenness_centrality?.[id] || 0).toFixed(2)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
