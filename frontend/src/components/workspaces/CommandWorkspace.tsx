import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchWorldSummary, fetchWorldSnapshot } from '../../api/worldApi';
import { fetchRiskMap } from '../../api/riskApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { Shield, Zap, AlertTriangle, Activity, ArrowRight, Play, Eye } from 'lucide-react';

export const CommandWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { setSelectedNodeId, openInjector, setWarRoomOpen, setCockpitOpen } = useAppShellStore();
  const { nodeRisks, activeSessionId } = useRealtimeStore();

  useEffect(() => {
    setEnvironmentMode('COMMAND');
  }, [setEnvironmentMode]);

  // TanStack Query for authentic backend state
  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useQuery({
    queryKey: ['worldSummary'],
    queryFn: fetchWorldSummary,
  });

  const { data: snapshot, isLoading: isSnapshotLoading } = useQuery({
    queryKey: ['worldSnapshot'],
    queryFn: fetchWorldSnapshot,
  });

  const { data: riskMap } = useQuery({
    queryKey: ['riskMap'],
    queryFn: fetchRiskMap,
  });

  const nodes = snapshot?.nodes || [];
  const healthScore = riskMap?.network_health ?? summary?.network_health_score ?? snapshot?.network_health_score ?? 0.94;

  if (isSummaryLoading || isSnapshotLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center text-slate-400 font-mono text-xs">
        <Activity className="w-4 h-4 animate-spin mr-2 text-blue-400" />
        <span>Loading Autonomous Operations Command Center...</span>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="flex h-[calc(100vh-60px)] flex-col items-center justify-center text-red-400 font-mono text-xs p-6 text-center">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <span className="font-bold text-sm">Failed to connect to backend command endpoints</span>
        <span className="text-slate-500 mt-1">Verify backend is running on http://127.0.0.1:8000</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6">
      {/* Top Command Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Composite Health</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              {(healthScore * 100).toFixed(1)}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Total Topology Nodes</div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-0.5">
              {nodes.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Disrupted Nodes</div>
            <div className="text-2xl font-bold font-mono text-red-400 mt-0.5">
              {nodes.filter((n) => n.is_disrupted || (nodeRisks[n.id]?.composite ?? 0) >= 0.5).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">WebSocket Stream</div>
            <div className="text-xs font-mono font-semibold text-cyan-400 mt-1 truncate max-w-[140px]">
              {activeSessionId ? `Session ${activeSessionId.substring(0, 8)}...` : 'ACTIVE'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 4-Quadrant Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Live Node Topology Matrix */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Network Node Status Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {nodes.length} Nodes
              </span>
            </div>

            <button
              onClick={() => navigate('/world')}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              <span>View Full Spatial Topology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[420px] pr-1">
            {nodes.map((node) => {
              const rtRisk = nodeRisks[node.id]?.composite;
              const composite = rtRisk ?? riskMap?.node_risks[node.id]?.composite ?? node.risk_scores.composite;
              const isDisrupted = node.is_disrupted || composite >= 0.5;

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    navigate(`/world/node/${node.id}`);
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:border-blue-500/80 ${
                    isDisrupted
                      ? 'bg-red-950/30 border-red-800/80'
                      : composite >= 0.25
                      ? 'bg-amber-950/30 border-amber-800/60'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-200">{node.id}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isDisrupted
                          ? 'bg-red-900/80 text-red-200'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      }`}
                    >
                      {isDisrupted ? 'DISRUPTED' : 'HEALTHY'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 truncate mb-2">{node.name}</div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Risk: {(composite * 100).toFixed(0)}%</span>
                    <span>Inv: {node.inventory_level.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Execution & War Room Controls */}
        <div className="flex flex-col gap-4">
          {/* Quick Action Panel */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col gap-3">
            <h3 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200">
              Autonomous Operations Controls
            </h3>

            <button
              onClick={() => openInjector()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-950/60 border border-red-800/80 hover:bg-red-900/60 text-red-200 text-xs font-mono font-semibold transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>INJECT THREAT SIGNAL</span>
            </button>

            <button
              onClick={() => setWarRoomOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-purple-950/60 border border-purple-800/80 hover:bg-purple-900/60 text-purple-200 text-xs font-mono font-semibold transition-all"
            >
              <Play className="w-4 h-4 text-purple-400" />
              <span>LAUNCH SPECIALIST WAR ROOM</span>
            </button>

            <button
              onClick={() => setCockpitOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-950/60 border border-blue-800/80 hover:bg-blue-900/60 text-blue-200 text-xs font-mono font-semibold transition-all"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>OPEN DECISION COCKPIT</span>
            </button>
          </div>

          {/* Quick Navigation to Risk & Intelligence */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col gap-2">
            <h3 className="font-semibold text-sm text-slate-200 mb-1">Intelligence Links</h3>
            <button
              onClick={() => navigate('/intelligence/risk')}
              className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-blue-400 transition-all"
            >
              <span>3D Risk Heatmap Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
