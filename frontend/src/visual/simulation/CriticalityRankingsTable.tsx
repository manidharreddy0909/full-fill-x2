/**
 * CriticalityRankingsTable — Node Criticality Rankings & Impact Matrix
 * Phase 13D-1: Digital Twin & Simulation Visualization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Target, ShieldAlert, ArrowRight } from 'lucide-react';
import { CriticalityResult } from '../../types/simulation';
import { StatusPill } from '../telemetry/StatusPill';

export interface CriticalityRankingsTableProps {
  criticalityResults: CriticalityResult[];
  selectedNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
}

export const CriticalityRankingsTable: React.FC<CriticalityRankingsTableProps> = ({
  criticalityResults,
  selectedNodeId,
  onSelectNode,
}) => {
  return (
    <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
        <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-red-400" />
          <span>Network Node Criticality Rankings ({criticalityResults.length})</span>
        </span>
        <StatusPill color="#f87171" label="CRITICALITY INDEX" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
              <th className="py-2 px-2">Rank</th>
              <th className="py-2 px-2">Node ID</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Criticality Score</th>
              <th className="py-2 px-2">Failure Prob.</th>
              <th className="py-2 px-2">Service Impact</th>
              <th className="py-2 px-2 text-right">Downstream</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {criticalityResults.slice(0, 10).map((node) => {
              const isSelected = node.node_id === selectedNodeId;
              const color = node.criticality_score > 0.7 ? '#f87171' : node.criticality_score > 0.4 ? '#fbbf24' : '#34d399';

              return (
                <tr
                  key={node.node_id}
                  onClick={() => onSelectNode?.(node.node_id)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-all ${
                    isSelected ? 'bg-cyan-950/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-2 font-bold text-red-400">#{node.criticality_rank}</td>
                  <td className="py-2.5 px-2 font-bold text-slate-200">{node.node_id}</td>
                  <td className="py-2.5 px-2 text-slate-400 text-[11px]">{node.node_type}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, node.criticality_score * 100)}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <span className="font-bold text-slate-200">{(node.criticality_score * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-amber-400 font-bold">{(node.failure_probability * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-2 text-red-400 font-bold">{(node.service_impact * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-2 text-right text-slate-300 font-bold">{node.downstream_customers}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
