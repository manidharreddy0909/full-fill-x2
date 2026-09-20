import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAgents, runAllSpecialists, runCoordinator, AgentMetadata } from '../../api/agentApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAgentStore } from '../../store/agentStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { AgentConstellationViewport } from '../canvas/AgentConstellationViewport';
import { AgentEntityPrimitive } from '../canvas/primitives/AgentEntityPrimitive';
import { AgentDetailWorkspace } from './AgentDetailWorkspace';
import { Activity, Play, Zap, Shield, Compass, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const AgentConstellationWorkspace: React.FC = () => {
  const { agentId: routeAgentId } = useParams<{ agentId?: string }>();
  const navigate = useNavigate();
  const { setEnvironmentMode, viewMode, setViewMode, setCameraTarget } = useVisualEnvironmentStore();
  const {
    selectedAgentId,
    setSelectedAgentId,
    agentStates,
    setAgentVisualState,
    setLatestProposals,
    coordinatorResult,
    setCoordinatorResult,
  } = useAgentStore();
  const { events } = useRealtimeStore();

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  useEffect(() => {
    if (routeAgentId && routeAgentId !== selectedAgentId) {
      setSelectedAgentId(routeAgentId);
    }
  }, [routeAgentId, selectedAgentId, setSelectedAgentId]);

  // Fetch registered agent metadata
  const { data: agents = [], isLoading } = useQuery<AgentMetadata[]>({
    queryKey: ['agentsList'],
    queryFn: fetchAgents,
  });

  // Run all specialist agents concurrently
  const runAllMutation = useMutation({
    mutationFn: () => runAllSpecialists(),
    onMutate: () => {
      agents.forEach((a) => setAgentVisualState(a.id, 'ANALYZING'));
    },
    onSuccess: (data) => {
      const proposals: Record<string, any> = {};
      Object.entries(data.results).forEach(([id, res]) => {
        if (res.proposal) {
          proposals[id] = res.proposal;
          setAgentVisualState(id, 'PROPOSING', { proposal: res.proposal, confidence: res.proposal.confidence });
        } else {
          setAgentVisualState(id, 'COMPLETED');
        }
      });
      setLatestProposals(proposals);
    },
    onError: (err: any) => {
      agents.forEach((a) => setAgentVisualState(a.id, 'FAILED', { error: err.message }));
    },
  });

  // Run coordinator reconciliation
  const runCoordinatorMutation = useMutation({
    mutationFn: () => runCoordinator(),
    onMutate: () => {
      setAgentVisualState('coordinator', 'DELIBERATING');
    },
    onSuccess: (data) => {
      setCoordinatorResult(data);
    },
    onError: (err: any) => {
      setAgentVisualState('coordinator', 'FAILED', { error: err.message });
    },
  });

  // Position Specialist Agents in a 3D circle of Radius R = 12 around Coordinator [0,0,0]
  const getAgentPosition = (index: number, total: number): [number, number, number] => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 12;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  };

  const handleSelectAgent = (agentId: string | null) => {
    setSelectedAgentId(agentId);
    if (agentId) {
      navigate(`/intelligence/agents/${agentId}`);
      // Find index for camera target focus
      const idx = agents.findIndex((a) => a.id === agentId);
      if (idx >= 0) {
        const [x, y, z] = getAgentPosition(idx, agents.length);
        setCameraTarget([x, y + 4, z + 8], [x, y, z]);
      } else if (agentId === 'coordinator') {
        setCameraTarget([0, 5, 10], [0, 0, 0]);
      }
    } else {
      navigate('/intelligence/agents');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center text-slate-400 font-mono text-xs">
        <Activity className="w-4 h-4 animate-spin mr-2 text-purple-400" />
        <span>Loading Autonomous Agent Constellation Space...</span>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-60px)] w-full overflow-hidden bg-[#040813] text-slate-100">
      {/* Top Navigation & Action Controls HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3 bg-slate-900/85 p-3 rounded-xl border border-slate-800 backdrop-blur-md shadow-xl">
        <button
          onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-mono font-medium hover:bg-purple-600/50 transition-all"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{viewMode === '3D' ? 'Switch to 2D List' : 'Switch to 3D Constellation'}</span>
        </button>

        <button
          onClick={() => runAllMutation.mutate()}
          disabled={runAllMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white text-xs font-mono font-semibold transition-all shadow-md shadow-purple-600/30"
        >
          {runAllMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>RUN ALL SPECIALISTS</span>
        </button>

        <button
          onClick={() => runCoordinatorMutation.mutate()}
          disabled={runCoordinatorMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white text-xs font-mono font-semibold transition-all shadow-md shadow-blue-600/30"
        >
          {runCoordinatorMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          <span>RECONCILE COORDINATOR</span>
        </button>
      </div>

      {/* Main Visualizer: 2D Accessible Table or 3D WebGL Constellation Canvas */}
      {viewMode === '2D' ? (
        <div className="relative z-10 p-6 pt-20 max-w-5xl mx-auto overflow-y-auto max-h-[calc(100vh-80px)] space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Multi-Agent Specialist Intelligence Registry</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2">Agent ID</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Primary Objective</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* Coordinator Row */}
                  <tr className="hover:bg-slate-800/40 transition-all bg-purple-950/20">
                    <td className="py-3 font-bold text-purple-300">coordinator</td>
                    <td className="py-3 text-slate-200">Coordinator Engine</td>
                    <td className="py-3 text-slate-400">RECONCILE_AND_RANK</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {agentStates['coordinator']?.visualState || 'IDLE'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleSelectAgent('coordinator')}
                        className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>

                  {/* Specialist Agent Rows */}
                  {agents.map((ag) => {
                    const st = agentStates[ag.id]?.visualState || 'IDLE';

                    return (
                      <tr key={ag.id} className="hover:bg-slate-800/40 transition-all">
                        <td className="py-3 font-bold text-slate-200">{ag.id}</td>
                        <td className="py-3 text-slate-300">{ag.name}</td>
                        <td className="py-3 text-slate-400 text-[10px]">{ag.objective}</td>
                        <td className="py-3">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: `${ag.color}22`, color: ag.color, border: `1px solid ${ag.color}55` }}
                          >
                            {st}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleSelectAgent(ag.id)}
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
        </div>
      ) : (
        <AgentConstellationViewport>
          {/* Central Coordinator Node */}
          <AgentEntityPrimitive
            id="coordinator"
            name="Coordinator Engine"
            color="#c084fc"
            position={[0, 0, 0]}
            visualState={agentStates['coordinator']?.visualState || 'IDLE'}
            isCoordinator
            isSelected={selectedAgentId === 'coordinator'}
            onSelect={handleSelectAgent}
          />

          {/* 6 Orbiting Specialist Agent Nodes */}
          {agents.map((ag, idx) => {
            const pos = getAgentPosition(idx, agents.length);
            const st = agentStates[ag.id]?.visualState || 'IDLE';

            return (
              <AgentEntityPrimitive
                key={ag.id}
                id={ag.id}
                name={ag.name}
                color={ag.color || '#60a5fa'}
                position={pos}
                visualState={st}
                isSelected={selectedAgentId === ag.id}
                onSelect={handleSelectAgent}
              />
            );
          })}
        </AgentConstellationViewport>
      )}

      {/* Realtime Event Stream & Proposal Flow Sidebar */}
      <div className="absolute bottom-4 left-4 z-20 w-80 max-h-56 overflow-y-auto p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col gap-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agent Event Stream</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">{events.length} Events</span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          {events.length === 0 ? (
            <div className="text-[10px] text-slate-500 text-center py-2">No agent events received yet.</div>
          ) : (
            events.slice(0, 5).map((evt) => (
              <div key={evt.event_id} className="p-2 rounded bg-slate-950/80 border border-slate-800/80 flex flex-col gap-0.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{evt.event_type}</span>
                  <span className="text-cyan-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-200 text-[10px] truncate">{evt.payload.summary || evt.payload.title || JSON.stringify(evt.payload)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Coordinator Candidate Plan Results Overlay if Available */}
      {coordinatorResult && (
        <div className="absolute bottom-4 right-4 z-20 w-96 max-h-64 overflow-y-auto p-4 rounded-xl bg-purple-950/40 border border-purple-800/80 backdrop-blur-md shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-purple-800/60 text-xs font-semibold text-purple-200">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Reconciled Candidate Plans ({coordinatorResult.candidate_plans.length})</span>
            </span>
            <span className="font-mono text-[10px] text-purple-300 font-bold">{coordinatorResult.status}</span>
          </div>

          <p className="text-xs text-slate-300">{coordinatorResult.summary}</p>

          <div className="space-y-1.5 pt-1">
            {coordinatorResult.candidate_plans.map((plan) => (
              <div key={plan.candidate_id} className="p-2 rounded bg-slate-950/80 border border-slate-800 font-mono text-[11px] flex flex-col gap-1">
                <div className="flex justify-between font-bold text-purple-300">
                  <span>{plan.name}</span>
                  <span className="text-emerald-400">${plan.estimated_total_cost.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">{plan.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Detail Inspector Drawer when an agent is selected */}
      {selectedAgentId && (
        <AgentDetailWorkspace
          agentId={selectedAgentId}
          onClose={() => handleSelectAgent(null)}
        />
      )}
    </div>
  );
};
