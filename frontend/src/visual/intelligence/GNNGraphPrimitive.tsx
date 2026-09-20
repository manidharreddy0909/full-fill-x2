/**
 * GNNGraphPrimitive — Mathematical Graph Intelligence Visualization
 * Phase 13B: Intelligence Visualization
 *
 * Distinct from physical topology:
 * Renders mathematical graph nodes, weighted edge matrices, risk propagation paths,
 * centrality metrics, and GNN node criticality.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Network, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { StatusPill } from '../telemetry/StatusPill';

export interface GNNNodeData {
  id: string;
  name?: string;
  node_type?: string;
  risk_score?: number;
  criticality?: number;
  degree_centrality?: number;
}

export interface GNNEdgeData {
  source: string;
  target: string;
  weight: number;
}

export interface GNNGraphPrimitiveProps {
  nodes: GNNNodeData[];
  edges?: GNNEdgeData[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  propagationPath?: string[];
}

export const GNNGraphPrimitive: React.FC<GNNGraphPrimitiveProps> = ({
  nodes,
  edges = [],
  selectedNodeId,
  onSelectNode,
  propagationPath = [],
}) => {
  const getCriticalityColor = (crit: number = 0.5) => {
    if (crit > 0.8) return '#f87171'; // Critical
    if (crit > 0.6) return '#fbbf24'; // High/Warning
    if (crit > 0.3) return '#38bdf8'; // Medium
    return '#34d399'; // Low
  };

  return (
    <div className="relative w-full h-full min-h-[420px] p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col justify-between font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
          <Network className="w-4 h-4 text-cyan-400" />
          <span>GNN Latent Graph Topology ({nodes.length} Nodes)</span>
        </div>
        <StatusPill color="#38bdf8" label="MATHEMATICAL MATRIX" />
      </div>

      {/* Latent Space Node Grid Visualization */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 py-4">
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const inPath = propagationPath.includes(node.id);
          const color = getCriticalityColor(node.criticality || node.risk_score || 0.4);

          return (
            <motion.button
              key={node.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectNode(node.id)}
              className="p-3 rounded-lg border backdrop-blur-md flex flex-col gap-1.5 text-left transition-all relative overflow-hidden"
              style={{
                backgroundColor: isSelected ? 'rgba(56,189,248,0.12)' : 'rgba(3,7,18,0.8)',
                borderColor: isSelected ? '#38bdf8' : inPath ? '#fbbf24' : `${color}35`,
                boxShadow: isSelected ? '0 0 15px rgba(56,189,248,0.3)' : 'none',
              }}
            >
              {inPath && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}

              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-slate-200">{node.id}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                />
              </div>

              <div className="text-[11px] font-bold text-white truncate">{node.name}</div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                <span>Risk: <strong style={{ color }}>{((node.risk_score || 0.05) * 100).toFixed(0)}%</strong></span>
                <span>Type: {node.node_type || 'NODE'}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400">
        <span>Selected: <strong className="text-cyan-300">{selectedNodeId}</strong></span>
        <span>Propagation Path: <strong className="text-amber-400">{propagationPath.length > 0 ? propagationPath.join(' → ') : 'NONE'}</strong></span>
      </div>
    </div>
  );
};
