import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchGraphSnapshot,
  fetchGraphFeatures,
  predictGnnNodeRisk,
  analyzeGraphPropagation,
  GraphPrediction,
  PropagationTrace,
} from '../../api/graphIntelligenceApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { Activity, Network, Zap, Cpu, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

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
      <div className="flex h-[calc(100vh-60px)] items-center justify-center text-slate-400 font-mono text-xs">
        <Activity className="w-4 h-4 animate-spin mr-2 text-cyan-400" />
        <span>Loading GNN Latent Space & Graph Centrality Features...</span>
      </div>
    );
  }

  const nodes = snapshot?.nodes || [];
  const prediction = predictMutation.data;
  const propagation = propagateMutation.data;

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Top Header Controls */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">GNN Graph Intelligence & Predictive Risk Engine</h1>
            <p className="text-xs text-slate-400">Phase 7 Graph Neural Networks node risk prediction with 95% confidence bounds</p>
          </div>
        </div>

        {/* Target Node Selector */}
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400">Target Node:</span>
          <select
            value={selectedTargetNode}
            onChange={(e) => setSelectedTargetNode(e.target.value)}
            className="bg-slate-900 text-cyan-300 font-bold px-2.5 py-1 rounded border border-slate-700 outline-none"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} — {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: GNN Risk Prediction & 95% Confidence Bounds */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-col gap-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>GNN Prediction Output ({selectedTargetNode})</span>
            </span>
            {predictMutation.isPending && (
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Running Inference...</span>
              </span>
            )}
          </div>

          {prediction ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Predicted Risk Score</div>
                <div className="text-3xl font-bold text-cyan-400 mt-1">
                  {(prediction.predicted_risk_score * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">24-Hour Horizon</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Confidence Interval (95%)</div>
                <div className="text-sm font-bold text-slate-200 mt-2">
                  [{(prediction.confidence_lower_95 * 100).toFixed(1)}%, {(prediction.confidence_upper_95 * 100).toFixed(1)}%]
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Bounded Variational Range</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Top Risk Contributors</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {prediction.top_risk_contributors.map((contrib) => (
                    <span key={contrib} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                      {contrib}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">No prediction data available.</div>
          )}

          {/* Disruption Propagation Trajectory Table */}
          <div className="pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Network className="w-4 h-4 text-purple-400" />
                <span>Multi-Hop Disruption Propagation Trajectory</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Max Depth: {propagation?.max_depth ?? 4} | Affected Nodes: {propagation?.total_affected_nodes ?? 0}
              </span>
            </div>

            {propagation && propagation.trajectory.length > 0 ? (
              <div className="overflow-y-auto max-h-52 mt-3">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2">Hop Step</th>
                      <th className="py-2">Node ID</th>
                      <th className="py-2">Node Name</th>
                      <th className="py-2">Cumulative Impact</th>
                      <th className="py-2 text-right">Offset (Hours)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {propagation.trajectory.map((step) => (
                      <tr key={`${step.step}-${step.node_id}`} className="hover:bg-slate-800/40">
                        <td className="py-2 text-purple-400 font-bold">Step {step.step}</td>
                        <td className="py-2 text-slate-200 font-bold">{step.node_id}</td>
                        <td className="py-2 text-slate-300">{step.node_name}</td>
                        <td className="py-2 text-red-400">{(step.cumulative_impact * 100).toFixed(1)}%</td>
                        <td className="py-2 text-right text-slate-400">+{step.time_offset_hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 font-mono text-xs">No propagation trajectory trace found.</div>
            )}
          </div>
        </div>

        {/* Right Column: Node Centrality & Graph Features */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-col gap-4 shadow-xl">
          <h3 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Graph Centrality & Topology Features</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Degree Centrality:</span>
              <span className="font-bold text-cyan-400">
                {(features?.degree_centrality?.[selectedTargetNode] ?? 0.0).toFixed(3)}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Betweenness Centrality:</span>
              <span className="font-bold text-purple-400">
                {(features?.betweenness_centrality?.[selectedTargetNode] ?? 0.0).toFixed(3)}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Eigenvector Centrality:</span>
              <span className="font-bold text-emerald-400">
                {(features?.eigenvector_centrality?.[selectedTargetNode] ?? 0.0).toFixed(3)}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Clustering Coefficient:</span>
              <span className="font-bold text-amber-400">
                {(features?.clustering_coefficients?.[selectedTargetNode] ?? 0.0).toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
