import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchAgentById, runSingleAgent, AgentMetadata } from '../../api/agentApi';
import { useAgentStore } from '../../store/agentStore';
import { X, Play, ShieldCheck, Zap, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface AgentDetailWorkspaceProps {
  agentId: string;
  onClose: () => void;
}

export const AgentDetailWorkspace: React.FC<AgentDetailWorkspaceProps> = ({ agentId, onClose }) => {
  const { agentStates, setAgentVisualState } = useAgentStore();
  const currentAgentState = agentStates[agentId];

  const { data: agentMeta, isLoading, error } = useQuery<AgentMetadata>({
    queryKey: ['agentDetail', agentId],
    queryFn: () => fetchAgentById(agentId),
    enabled: !!agentId,
  });

  const runMutation = useMutation({
    mutationFn: () => runSingleAgent(agentId),
    onMutate: () => {
      setAgentVisualState(agentId, 'ANALYZING');
    },
    onSuccess: (data) => {
      if (data.proposal) {
        setAgentVisualState(agentId, 'PROPOSING', { proposal: data.proposal, confidence: data.proposal.confidence });
      } else {
        setAgentVisualState(agentId, 'COMPLETED');
      }
    },
    onError: (err: any) => {
      setAgentVisualState(agentId, 'FAILED', { error: err.message });
    },
  });

  if (isLoading) {
    return (
      <div className="absolute top-4 right-4 z-30 w-96 p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl text-slate-400 font-mono text-xs flex items-center justify-center">
        <Activity className="w-4 h-4 animate-spin mr-2 text-purple-400" />
        <span>Loading Agent Capabilities...</span>
      </div>
    );
  }

  if (error || !agentMeta) {
    return (
      <div className="absolute top-4 right-4 z-30 w-96 p-5 rounded-2xl bg-slate-900/90 border border-red-800 backdrop-blur-xl text-red-400 font-mono text-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold">Agent Not Found</span>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400">Failed to load metadata for agent '{agentId}'.</p>
      </div>
    );
  }

  const proposal = currentAgentState?.proposal;

  return (
    <div className="absolute top-4 right-4 z-30 w-96 max-h-[calc(100vh-100px)] overflow-y-auto p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-slate-100 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-purple-400 uppercase">{agentMeta.id}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {currentAgentState?.visualState || 'IDLE'}
            </span>
          </div>
          <h2 className="text-base font-semibold text-white mt-0.5">{agentMeta.name}</h2>
        </div>

        <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Objective Description */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="text-[10px] font-mono text-slate-400 uppercase">OBJECTIVE & SCOPE</div>
        <p className="font-light">{agentMeta.description}</p>
        <div className="font-mono text-[10px] text-purple-300 pt-1">
          Key Objective: <strong>{agentMeta.objective}</strong>
        </div>
      </div>

      {/* Allowed Operational Action Types */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-1 font-semibold text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Allowed Action Types ({agentMeta.allowed_action_types.length})</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {agentMeta.allowed_action_types.map((actionType) => (
            <span key={actionType} className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {actionType}
            </span>
          ))}
        </div>
      </div>

      {/* Current Active Proposal Section if Available */}
      {proposal ? (
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-200">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Active Proposal ({proposal.proposal_id})</span>
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 font-bold">
              {(proposal.confidence * 100).toFixed(0)}% Conf.
            </span>
          </div>

          <p className="text-xs text-slate-300">{proposal.summary}</p>

          {/* Action List */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">PROPOSED ACTIONS</div>
            {proposal.actions.map((act) => (
              <div key={act.action_id} className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono flex flex-col gap-0.5">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>{act.action_type}</span>
                  <span className="text-emerald-400">${act.estimated_cost.toLocaleString()}</span>
                </div>
                {act.target_node_id && (
                  <div className="text-[10px] text-slate-400">Target Node: {act.target_node_id}</div>
                )}
              </div>
            ))}
          </div>

          {/* Reasoning Trace */}
          {proposal.reasoning_trace && proposal.reasoning_trace.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">REASONING TRACE</div>
              <div className="space-y-1 text-[10px] font-mono text-slate-300 max-h-28 overflow-y-auto pr-1">
                {proposal.reasoning_trace.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 font-mono text-center">
          No active proposal generated for this session.
        </div>
      )}

      {/* Execution Trigger */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-purple-600/30"
        >
          {runMutation.isPending ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-white" />
              <span>Executing Agent Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>EXECUTE {agentMeta.name.toUpperCase()}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
