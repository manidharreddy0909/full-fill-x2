/**
 * AgentConstellationWorkspace — Spatial Multi-Agent Intelligence Hub
 * Phase 13A: Visual Transformation
 *
 * Design: High-tech obsidian flight deck, 3D/2D toggle HUD, Framer Motion entrance,
 * tabbed flight dock bottom overlay, glassmorphism HUD.
 */

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchAgents, runAllSpecialists, runCoordinator, AgentMetadata } from '../../api/agentApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAgentStore } from '../../store/agentStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { AgentConstellationViewport } from '../canvas/AgentConstellationViewport';
import { AgentEntityPrimitive } from '../canvas/primitives/AgentEntityPrimitive';
import { AgentDetailWorkspace } from './AgentDetailWorkspace';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import {
  Activity, Play, Zap, Shield, Compass, ArrowRight, CheckCircle2, Clock,
  Cpu, Sparkles
} from 'lucide-react';

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

  const [activeBottomTab, setActiveBottomTab] = useState<'EVENTS' | 'PLANS' | 'NONE'>('PLANS');

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  useEffect(() => {
    if (routeAgentId && routeAgentId !== selectedAgentId) {
      setSelectedAgentId(routeAgentId);
    }
  }, [routeAgentId, selectedAgentId, setSelectedAgentId]);

  useEffect(() => {
    if (coordinatorResult && activeBottomTab === 'NONE' && !selectedAgentId) {
      setActiveBottomTab('PLANS');
    }
  }, [coordinatorResult, selectedAgentId]);

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
      <div className="flex h-[calc(100vh-60px)] items-center justify-center bg-[#030712] text-cyan-400 font-mono text-xs">
        <Activity className="w-5 h-5 animate-spin mr-3 text-cyan-400" />
        <span>INITIALIZING MULTI-AGENT INTELLIGENCE CONSTELLATION...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] w-full overflow-hidden bg-[#030712] text-slate-100 font-sans p-4 relative">
      {/* Top Controls HUD Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-20 flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 mb-3 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                Multi-Agent Intelligence Constellation
              </h1>
              <StatusPill color="#38bdf8" label="SWARM LIVE" pulse />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              6 Autonomous Specialists · 1 Master Coordinator · Autonomous Deliberation Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium hover:bg-cyan-900/60 transition-all shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{viewMode === '3D' ? '2D Matrix View' : '3D Spatial Constellation'}</span>
          </button>

          <button
            onClick={() => runAllMutation.mutate()}
            disabled={runAllMutation.isPending}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-purple-900/30"
          >
            {runAllMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>RUN SPECIALISTS</span>
          </button>

          <button
            onClick={() => runCoordinatorMutation.mutate()}
            disabled={runCoordinatorMutation.isPending}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-900/30"
          >
            {runCoordinatorMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>RECONCILE COORDINATOR</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content Area: 2D Table vs 3D Spatial Canvas */}
      <div className="relative flex-1 w-full overflow-hidden rounded-xl">
        {viewMode === '2D' ? (
          <div className="relative z-10 p-4 max-w-6xl mx-auto overflow-y-auto max-h-full space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl"
            >
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Specialist Intelligence Registry & Status</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-cyan-950 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Agent Identifier</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Primary Strategic Objective</th>
                      <th className="py-2.5 px-3">Visual State</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {/* Master Coordinator Row */}
                    <tr className="hover:bg-purple-950/30 transition-all bg-purple-950/15">
                      <td className="py-3 px-3 font-bold text-purple-300 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>coordinator</span>
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-semibold">Coordinator Engine</td>
                      <td className="py-3 px-3 text-slate-400">RECONCILE_AND_RANK_PROPOSALS</td>
                      <td className="py-3 px-3">
                        <StatusPill
                          color={agentStates['coordinator']?.visualState === 'DELIBERATING' ? '#fbbf24' : '#a855f7'}
                          label={agentStates['coordinator']?.visualState || 'IDLE'}
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleSelectAgent('coordinator')}
                          className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors"
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
                        <tr key={ag.id} className="hover:bg-slate-800/30 transition-all">
                          <td className="py-3 px-3 font-bold text-slate-200">{ag.id}</td>
                          <td className="py-3 px-3 text-slate-300 font-medium">{ag.name}</td>
                          <td className="py-3 px-3 text-slate-400 text-[11px] font-sans">{ag.objective}</td>
                          <td className="py-3 px-3">
                            <span
                              className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border shadow-sm"
                              style={{
                                backgroundColor: `${ag.color}15`,
                                color: ag.color,
                                borderColor: `${ag.color}40`,
                              }}
                            >
                              {st}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleSelectAgent(ag.id)}
                              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors"
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
            </motion.div>
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

        {/* Sleek Non-Colliding Bottom Flight Dock */}
        {!selectedAgentId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 z-20 max-w-[440px] flex flex-col gap-2"
          >
            {/* Tab Switcher Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#080d16]/90 border border-slate-700/60 backdrop-blur-md w-fit shadow-lg">
              <button
                onClick={() => setActiveBottomTab(activeBottomTab === 'EVENTS' ? 'NONE' : 'EVENTS')}
                className={`px-3 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                  activeBottomTab === 'EVENTS'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Agent Events ({events.length})</span>
              </button>

              {coordinatorResult && (
                <button
                  onClick={() => setActiveBottomTab(activeBottomTab === 'PLANS' ? 'NONE' : 'PLANS')}
                  className={`px-3 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                    activeBottomTab === 'PLANS'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Reconciled Plans ({coordinatorResult.candidate_plans.length})</span>
                </button>
              )}
            </div>

            {/* Active Panel Content */}
            {activeBottomTab === 'EVENTS' && (
              <div className="p-3.5 rounded-xl bg-[#080d16]/95 border border-cyan-500/35 backdrop-blur-2xl shadow-2xl flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30">
                <div className="space-y-1.5 font-mono text-[11px]">
                  {events.length === 0 ? (
                    <div className="text-[10px] text-slate-500 text-center py-2 flex items-center justify-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-500/50" />
                      <span>Listening for WebSocket agent events...</span>
                    </div>
                  ) : (
                    events.slice(0, 4).map((evt) => (
                      <div key={evt.event_id} className="p-2 rounded bg-[#030712]/90 border border-slate-800 flex flex-col gap-0.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span className="text-cyan-400">{evt.event_type}</span>
                          <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-slate-200 text-[10px] truncate">{evt.payload.summary || evt.payload.title || JSON.stringify(evt.payload)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeBottomTab === 'PLANS' && coordinatorResult && (
              <div className="p-3.5 rounded-xl bg-[#090b18]/95 border border-purple-500/40 backdrop-blur-2xl shadow-2xl flex flex-col gap-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30">
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{coordinatorResult.summary}</p>

                <div className="space-y-1.5">
                  {coordinatorResult.candidate_plans.map((plan) => (
                    <div key={plan.candidate_id} className="p-2 rounded-lg bg-[#030712]/90 border border-purple-900/40 font-mono text-[11px] flex flex-col gap-0.5">
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
          </motion.div>
        )}

        {/* Agent Detail Inspector Drawer */}
        {selectedAgentId && (
          <AgentDetailWorkspace
            agentId={selectedAgentId}
            onClose={() => handleSelectAgent(null)}
          />
        )}
      </div>
    </div>
  );
};
