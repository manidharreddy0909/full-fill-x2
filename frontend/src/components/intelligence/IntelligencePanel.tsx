import React, { useEffect, useState } from 'react';
import { Signal, RiskScoreMap } from '../../types/risk';
import { fetchSignals, fetchRiskMap } from '../../api/riskApi';
import { ShieldAlert, Zap, Layers, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

interface IntelligencePanelProps {
  onOpenInjector: () => void;
  onSelectNode: (nodeId: string) => void;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  onOpenInjector,
  onSelectNode,
}) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [riskMap, setRiskMap] = useState<RiskScoreMap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    try {
      setLoading(true);
      const [sigData, rMap] = await Promise.all([
        fetchSignals().catch(() => []),
        fetchRiskMap().catch(() => null),
      ]);
      setSignals(sigData);
      setRiskMap(rMap);
    } catch (e) {
      console.error('Failed to load intelligence data:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Intelligence Pipeline</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Signal Ingestion, Fusion & Risk Traceability
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Trace disruption signals from initial external detection through 6-hour deduplication fusion, BFS risk propagation, and evidence links.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadIntelligence}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenInjector}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-rose-950/50 cursor-pointer transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Inject Disruption Signal</span>
          </button>
        </div>
      </div>

      {/* Intelligence Pipeline Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Stage 1</span>
          <h4 className="text-xs font-bold text-white mt-1">Signal Ingestion</h4>
          <p className="text-[11px] text-slate-400 mt-1">Weather, geopolitical, supplier, and logistics signals.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Stage 2</span>
          <h4 className="text-xs font-bold text-white mt-1">Signal Fusion</h4>
          <p className="text-[11px] text-slate-400 mt-1">Deduplicates events within a 6-hour window.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Stage 3</span>
          <h4 className="text-xs font-bold text-white mt-1">BFS Propagation</h4>
          <p className="text-[11px] text-slate-400 mt-1">Propagates risk across graph with decay factor 0.6.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Stage 4</span>
          <h4 className="text-xs font-bold text-white mt-1">Compound Scenario</h4>
          <p className="text-[11px] text-slate-400 mt-1">Composes multi-vector disruption scenario object.</p>
        </div>
      </div>

      {/* Ingested Signals Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Ingested Disruption Signals ({signals.length})</span>
        </h3>

        {signals.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active signals ingested. Click "Inject Disruption Signal" above to simulate a disruption.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Target Nodes</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {signals.map((sig) => (
                  <tr key={sig.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-indigo-400 font-bold">{sig.type}</td>
                    <td className="p-3 font-semibold text-white">{sig.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                        {sig.severity}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {sig.affected_node_ids.length > 0 ? (
                        sig.affected_node_ids.map((nid) => (
                          <button
                            key={nid}
                            onClick={() => onSelectNode(nid)}
                            className="mr-1 underline hover:text-white cursor-pointer"
                          >
                            {nid}
                          </button>
                        ))
                      ) : (
                        'Global'
                      )}
                    </td>
                    <td className="p-3 font-mono">{(sig.confidence * 100).toFixed(0)}%</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {sig.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
