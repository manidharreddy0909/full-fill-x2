import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRiskMap, recalculateRisk, resetRisk } from '../../api/riskApi';
import { fetchWorldSnapshot } from '../../api/worldApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';
import { SpatialCanvasViewport } from '../canvas/SpatialCanvasViewport';
import { SpatialNodePrimitive } from '../canvas/primitives/SpatialNodePrimitive';
import { RiskPulsePrimitive } from '../canvas/primitives/RiskPulsePrimitive';
import { Activity, ShieldAlert, RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RiskWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setEnvironmentMode, viewMode } = useVisualEnvironmentStore();
  const { setSelectedNodeId } = useAppShellStore();
  const [activeFilter, setActiveFilter] = React.useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  useEffect(() => {
    setEnvironmentMode('RISK');
  }, [setEnvironmentMode]);

  const { data: riskMap, isLoading: isRiskLoading } = useQuery({
    queryKey: ['riskMap'],
    queryFn: fetchRiskMap,
  });

  const { data: snapshot } = useQuery({
    queryKey: ['worldSnapshot'],
    queryFn: fetchWorldSnapshot,
  });

  const recalculateMutation = useMutation({
    mutationFn: () => recalculateRisk(),
    onSuccess: (data) => {
      queryClient.setQueryData(['riskMap'], data);
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetRisk,
    onSuccess: (data) => {
      queryClient.setQueryData(['riskMap'], data);
    },
  });

  const nodes = snapshot?.nodes || [];
  const nodeRisks = riskMap?.node_risks || {};

  const filteredNodes = nodes.filter((n) => {
    const score = nodeRisks[n.id]?.composite ?? n.risk_scores.composite;
    if (activeFilter === 'CRITICAL') return score >= 0.75;
    if (activeFilter === 'HIGH') return score >= 0.5 && score < 0.75;
    if (activeFilter === 'MEDIUM') return score >= 0.25 && score < 0.5;
    if (activeFilter === 'LOW') return score < 0.25;
    return true;
  });

  if (isRiskLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center text-slate-400 font-mono text-xs">
        <Activity className="w-4 h-4 animate-spin mr-2 text-red-400" />
        <span>Loading 3D Risk Heatmap Volume Field...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6">
      {/* 3D Heatmap Canvas Background */}
      {viewMode === '3D' && (
        <div className="absolute inset-0 z-0 opacity-80">
          <SpatialCanvasViewport>
            {nodes.map((n) => {
              const pos: [number, number, number] = n.position
                ? [n.position.x, n.position.y, n.position.z]
                : [0, 0, 0];
              const score = nodeRisks[n.id]?.composite ?? n.risk_scores.composite;

              return (
                <React.Fragment key={n.id}>
                  <SpatialNodePrimitive
                    id={n.id}
                    label={n.name}
                    nodeType={n.type}
                    position={pos}
                    riskScore={score}
                    isDisrupted={n.is_disrupted || score >= 0.5}
                    isSelected={false}
                    onSelect={(id) => {
                      setSelectedNodeId(id);
                      navigate(`/world/node/${id}`);
                    }}
                  />
                  <RiskPulsePrimitive position={pos} riskScore={score} />
                </React.Fragment>
              );
            })}
          </SpatialCanvasViewport>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="relative z-10 p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-950/70 border border-red-800/80 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Risk Engine & Heatmap Explorer</h1>
            <p className="text-xs text-slate-400">Deterministic composite risk score propagation & decay factor calibration</p>
          </div>
        </div>

        {/* Recalculate & Reset Controls */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <button
            onClick={() => recalculateMutation.mutate()}
            disabled={recalculateMutation.isPending}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Recalculate Risk Map</span>
          </button>

          <button
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Risk</span>
          </button>
        </div>
      </div>

      {/* Main Filter & Risk Matrix */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Risk Level Band Filters & Criticality Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-semibold text-sm text-slate-200">Criticality Ranking Table</span>

            {/* Band Filters */}
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[440px] pr-1">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2">Node ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Composite Risk</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredNodes.map((node) => {
                  const score = nodeRisks[node.id]?.composite ?? node.risk_scores.composite;
                  const isCritical = score >= 0.75;
                  const isHigh = score >= 0.5 && score < 0.75;

                  return (
                    <tr key={node.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-2.5 font-bold text-slate-200">{node.id}</td>
                      <td className="py-2.5 text-slate-300">{node.name}</td>
                      <td className="py-2.5 text-slate-400 text-[10px] uppercase">{node.type}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : isHigh
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {(score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedNodeId(node.id);
                            navigate(`/world/node/${node.id}`);
                          }}
                          className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Risk Summary Stats */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-col gap-4">
          <h3 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200">
            Risk Distribution Summary
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Network Health:</span>
              <span className="font-bold text-emerald-400">
                {((riskMap?.network_health ?? 0.94) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Fused Signals Count:</span>
              <span className="font-bold text-blue-400">
                {riskMap?.fused_signals ? Object.keys(riskMap.fused_signals).length : 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Critical Nodes (≥75%):</span>
              <span className="font-bold text-red-400">
                {nodes.filter((n) => (nodeRisks[n.id]?.composite ?? n.risk_scores.composite) >= 0.75).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
