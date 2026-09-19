import React from 'react';
import { WorldSummary, WorldNode } from '../../types/world';
import { RiskScoreMap, NodeRiskDetail } from '../../types/risk';
import { useRealtimeStore } from '../../store/realtimeStore';
import { Activity, ShieldAlert, Cpu, Bot, Zap, ArrowUpRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface CommandCenterProps {
  summary: WorldSummary | null;
  nodes: WorldNode[];
  riskMap: RiskScoreMap | null;
  onOpenInjector: () => void;
  onOpenWarRoom: () => void;
  onOpenCockpit: () => void;
  onOpenEvaluation: () => void;
  onOpenDemo: () => void;
  onSelectNode: (nodeId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  summary,
  nodes,
  riskMap,
  onOpenInjector,
  onOpenWarRoom,
  onOpenCockpit,
  onOpenEvaluation,
  onOpenDemo,
  onSelectNode,
}) => {
  const { events } = useRealtimeStore();

  const healthScore = riskMap?.network_health ?? summary?.network_health_score ?? 0.94;
  const healthPercent = (healthScore * 100).toFixed(1);

  // Compute elevated risk nodes
  const highRiskNodes = nodes
    .filter((n) => (n.risk_scores?.composite ?? 0) >= 0.4)
    .sort((a, b) => (b.risk_scores?.composite ?? 0) - (a.risk_scores?.composite ?? 0))
    .slice(0, 6);

  const disruptedCount = nodes.filter((n) => n.is_disrupted || (n.risk_scores?.composite ?? 0) >= 0.5).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Operational Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Executive Command Console</span>
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-medium">
                Operational Twin Live
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              FULFILL-X Fulfillment Resilience Intelligence
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time supply network monitoring, multi-agent AI risk mitigation, adversary stress testing, and verified decision authorization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-amber-950/50 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Judge Demo Console</span>
            </button>
            <button
              onClick={onOpenCockpit}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-950/50 cursor-pointer transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Cockpit</span>
            </button>
            <button
              onClick={onOpenWarRoom}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-2 cursor-pointer transition-all"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>War Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Network Health Score</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{healthPercent}%</span>
            <span className="text-xs text-emerald-400 font-semibold">Nominal Target &gt; 85%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Disruptions</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-400">{disruptedCount}</span>
            <span className="text-xs text-slate-400 font-medium">Nodes Elevated Risk</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {summary ? `${summary.total_nodes} Total Nodes • ${summary.total_edges} Routes` : 'Loading network model...'}
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Specialist AI Agents</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-purple-400">6</span>
            <span className="text-xs text-purple-300 font-medium">Domain Specialists Ready</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Inventory, Supplier, Transport, Fulfillment, Sustainability, Resilience
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Safety Architecture</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-indigo-400">100%</span>
            <span className="text-xs text-indigo-300 font-medium">Deterministic Validated</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            LLMs propose • Sandbox verifies • Human authorizes
          </p>
        </div>
      </div>

      {/* Main Grid: High Risk Entities + Real-Time Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Risk Entities Column (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Elevated Risk Entities</span>
              </h3>
              <p className="text-xs text-slate-400">Top supply chain nodes requiring mitigation review</p>
            </div>
            <button
              onClick={onOpenInjector}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inject Signal</span>
            </button>
          </div>

          {highRiskNodes.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
              No high-risk nodes detected. Network operating within nominal parameters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highRiskNodes.map((node) => {
                const composite = node.risk_scores?.composite ?? 0;
                let scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                if (composite >= 0.7) scoreColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode(node.id)}
                    className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold uppercase">
                          {node.type}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {node.name}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                      <span className="text-slate-400 font-mono text-[11px]">{node.id}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${scoreColor}`}>
                        Risk: {(composite * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time Event Stream Column (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Stream</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
            {events.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Listening for live EventBus notifications...
              </div>
            ) : (
              events.slice(0, 8).map((evt, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-indigo-400 font-bold uppercase">{evt.event_type}</span>
                    <span className="text-slate-500">#{evt.sequence}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2">{evt.source}: {JSON.stringify(evt.payload)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
