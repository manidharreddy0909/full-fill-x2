import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNodeRiskDetail } from '../../api/riskApi';
import { WorldNode, WorldEdge } from '../../types/world';
import { useAppShellStore } from '../../store/appShellStore';
import { X, AlertTriangle, Play, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface NodeInspectorWorkspaceProps {
  nodeId: string;
  nodes: WorldNode[];
  edges: WorldEdge[];
  onClose: () => void;
}

export const NodeInspectorWorkspace: React.FC<NodeInspectorWorkspaceProps> = ({
  nodeId,
  nodes,
  edges,
  onClose,
}) => {
  const { openInjector, setWarRoomOpen } = useAppShellStore();

  const node = nodes.find((n) => n.id === nodeId);

  const { data: riskDetail, isLoading: isRiskLoading } = useQuery({
    queryKey: ['nodeRiskDetail', nodeId],
    queryFn: () => fetchNodeRiskDetail(nodeId),
    enabled: !!nodeId,
  });

  const upstreamEdges = edges.filter((e) => e.target_node_id === nodeId);
  const downstreamEdges = edges.filter((e) => e.source_node_id === nodeId);

  if (!node) return null;

  const composite = riskDetail?.risk_scores?.composite ?? node.risk_scores.composite;
  const financial = riskDetail?.risk_scores?.financial ?? node.risk_scores.financial;
  const sla = riskDetail?.risk_scores?.sla ?? node.risk_scores.sla;

  return (
    <div className="absolute top-4 right-4 z-30 w-96 max-h-[calc(100vh-100px)] overflow-y-auto p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-slate-100 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-blue-400">{node.id}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
              {node.type}
            </span>
          </div>
          <h2 className="text-base font-semibold text-white mt-0.5">{node.name}</h2>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 text-[10px]">INVENTORY LEVEL</div>
          <div className="text-slate-200 font-bold mt-0.5">{node.inventory_level.toFixed(1)}</div>
        </div>

        <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 text-[10px]">LEAD TIME (DAYS)</div>
          <div className="text-slate-200 font-bold mt-0.5">{node.lead_time_days ?? 'N/A'}</div>
        </div>
      </div>

      {/* Risk Scores Section */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Risk Breakdown</span>
          {isRiskLoading && <span className="text-[10px] text-blue-400 font-mono">Updating...</span>}
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Composite Risk:</span>
            <span className="font-bold text-red-400">{(composite * 100).toFixed(1)}%</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Financial Exposure:</span>
            <span>{(financial * 100).toFixed(0)}%</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>SLA Risk:</span>
            <span>{(sla * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Dependencies Summary */}
      <div className="text-xs space-y-2">
        <div className="flex items-center gap-1 font-semibold text-slate-300">
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
          <span>Upstream Suppliers ({upstreamEdges.length})</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {upstreamEdges.map((e) => (
            <span key={e.id} className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {e.source_node_id}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 font-semibold text-slate-300 pt-2">
          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
          <span>Downstream Targets ({downstreamEdges.length})</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {downstreamEdges.map((e) => (
            <span key={e.id} className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {e.target_node_id}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => openInjector(node.id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-950/70 border border-red-800 text-red-200 text-xs font-mono font-semibold hover:bg-red-900/80 transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>INJECT THREAT SIGNAL ON NODE</span>
        </button>

        <button
          onClick={() => setWarRoomOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-950/70 border border-purple-800 text-purple-200 text-xs font-mono font-semibold hover:bg-purple-900/80 transition-all"
        >
          <Play className="w-3.5 h-3.5 text-purple-400" />
          <span>LAUNCH WAR ROOM DELIBERATION</span>
        </button>
      </div>
    </div>
  );
};
