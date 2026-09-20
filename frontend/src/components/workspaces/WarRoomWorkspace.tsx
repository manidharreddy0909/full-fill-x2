/**
 * WarRoomWorkspace — Autonomous Incident Command
 * Phase 13C: Response & Decision Visualization
 *
 * Design: Active disruption incident command view (Top Incident Header | Left Incident Signals | Center 3D Network | Right Agent Swarm Response | Bottom Timeline)
 */

import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { triggerDeliberation } from '../../api/learningApi';
import { fetchWorldSummary, fetchWorldSnapshot } from '../../api/worldApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAgentStore } from '../../store/agentStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import { IncidentHeader } from '../../visual/response/IncidentHeader';
import { WorldWorkspace } from './WorldWorkspace';
import {
  Activity, Shield, Users, Zap, CheckCircle2, XCircle,
  AlertTriangle, Clock, Play, MessageSquare, Brain, Radio
} from 'lucide-react';
import { DeliberationSession, ConsensusStatus } from '../../types/learning';

export const WarRoomWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { agentStates } = useAgentStore();
  const { events } = useRealtimeStore();

  useEffect(() => {
    setEnvironmentMode('RESPONSE');
  }, [setEnvironmentMode]);

  const { data: worldSummary } = useQuery({
    queryKey: ['worldSummary'],
    queryFn: fetchWorldSummary,
  });

  const deliberationMutation = useMutation<DeliberationSession, Error, string[]>({
    mutationFn: (nodeIds) => triggerDeliberation(nodeIds),
  });

  const session = deliberationMutation.data;
  const healthScore = worldSummary?.network_health_score ?? 0.94;
  const disruptedCount = worldSummary?.disrupted_nodes_count ?? 0;

  const severity = disruptedCount > 2 ? 'CRITICAL' : disruptedCount > 0 ? 'HIGH' : healthScore < 0.9 ? 'WARNING' : 'NORMAL';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#030712] font-sans"
    >
      {/* Top Incident Header HUD */}
      <IncidentHeader
        incidentId="INC-4289"
        severity={severity}
        affectedNodesCount={disruptedCount}
        deliberationStatus={session ? session.consensus_status : deliberationMutation.isPending ? 'DELIBERATING' : 'STANDBY'}
        onTriggerDeliberation={() => deliberationMutation.mutate(['sup-001', 'port-001'])}
        isPending={deliberationMutation.isPending}
      />

      {/* Main Incident Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Active Specialist Swarm Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-[#090d16]/90 border border-red-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Specialist Response Swarm</span>
            </span>
            <StatusPill color="#a855f7" label={`${Object.keys(agentStates).length} ACTIVE`} />
          </div>

          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {Object.entries(agentStates).map(([id, state]) => (
              <div
                key={id}
                className="p-3 rounded-lg bg-[#030712]/90 border border-slate-800 flex items-center justify-between hover:border-purple-500/30 transition-all font-mono text-xs"
              >
                <div>
                  <div className="font-bold text-purple-300 uppercase">{id}</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">{state.visualState}</div>
                </div>
                <StatusPill
                  color={state.visualState === 'IDLE' ? '#64748b' : '#34d399'}
                  label={state.visualState}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Center / Right Column (2 Cols): Deliberation Session & Debate Trace */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-5 rounded-xl bg-[#090d16]/90 border border-red-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-red-400" />
              <span>Swarm Deliberation & Conflict Trace</span>
            </span>
            {session && (
              <StatusPill
                color={session.consensus_status === 'UNANIMOUS' ? '#34d399' : '#fbbf24'}
                label={session.consensus_status}
              />
            )}
          </div>

          {session ? (
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 uppercase">Target Disruption Nodes</span>
                <div className="text-purple-300 font-bold">{session.target_node_ids.join(', ')}</div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Specialist Debate Messages ({session.rounds?.[0]?.messages?.length || 0})</div>
                {session.rounds?.[0]?.messages?.map((msg, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1 hover:border-red-500/30 transition-all font-sans">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-purple-400 font-bold">{msg.agent_id}</span>
                      <span className="text-emerald-400">Confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{msg.argument}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500 font-mono text-xs">
              <Shield className="w-10 h-10 text-slate-700" />
              <div className="text-center">
                <div className="text-slate-300 font-bold text-sm mb-1">War Room Standby</div>
                <div>Trigger multi-agent deliberation above to resolve active incident conflicts.</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
