/**
 * EventsWorkspace — Real-Time Event Stream & Observability Alerts
 * Phase 13A: Visual Transformation
 *
 * Design: Live event ticker feed, alert triage drawer, WebSocket connection pill,
 * Framer Motion entrance, obsidian backdrop glass panels, StatusPill indicators.
 */

import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  fetchEventStream,
  fetchOperationalAlerts,
  acknowledgeOperationalAlert,
  fetchObservabilityStatus,
} from '../../api/observabilityApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import {
  Activity, Radio, Bell, RefreshCw, CheckCircle2,
  AlertTriangle, Clock, Zap, ShieldAlert
} from 'lucide-react';
import { EventEnvelope } from '../../types/events';
import { OperationalAlert } from '../../types/observability';

const alertSeverityColor = (severity: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return '#f87171';
    case 'HIGH': return '#fb923c';
    case 'WARNING':
    case 'MEDIUM': return '#fbbf24';
    default: return '#34d399';
  }
};

const eventTypeColor = (type: string) => {
  if (type.includes('RISK') || type.includes('CRITICAL') || type.includes('FAIL')) return '#f87171';
  if (type.includes('WARN') || type.includes('DISRUPTION')) return '#fbbf24';
  if (type.includes('AGENT') || type.includes('PROPOSAL')) return '#c084fc';
  if (type.includes('SIGNAL')) return '#fb923c';
  return '#38bdf8';
};

export const EventsWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { events: wsEvents } = useRealtimeStore();

  useEffect(() => {
    setEnvironmentMode('OBSERVABILITY');
  }, [setEnvironmentMode]);

  const { data: obsStatus } = useQuery({
    queryKey: ['observabilityStatus'],
    queryFn: fetchObservabilityStatus,
    refetchInterval: 10000,
  });

  const { data: eventHistory = [], isLoading: isEventsLoading, refetch: refetchEvents } = useQuery<EventEnvelope[]>({
    queryKey: ['eventStream'],
    queryFn: () => fetchEventStream(100),
    refetchInterval: 15000,
  });

  const { data: alerts = [], isLoading: isAlertsLoading, refetch: refetchAlerts } = useQuery<OperationalAlert[]>({
    queryKey: ['operationalAlerts'],
    queryFn: fetchOperationalAlerts,
    refetchInterval: 10000,
  });

  const ackMutation = useMutation({
    mutationFn: (alertId: string) => acknowledgeOperationalAlert(alertId),
    onSuccess: () => refetchAlerts(),
  });

  // Merge WebSocket live events with REST event history
  const wsEventIds = new Set(wsEvents.map((e) => e.event_id));
  const mergedEvents: EventEnvelope[] = [
    ...wsEvents,
    ...eventHistory.filter((e) => !wsEventIds.has(e.event_id)),
  ].slice(0, 100);

  const pendingAlerts = alerts.filter((a: OperationalAlert) => a.status === 'ACTIVE');
  const ackedAlerts = alerts.filter((a: OperationalAlert) => a.status !== 'ACTIVE');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#030712] font-sans"
    >
      {/* Top Header HUD Bar */}
      <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-mono uppercase">
                Observability & Real-Time Event Stream
              </h1>
              <StatusPill color="#34d399" label="STREAM LIVE" pulse />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {mergedEvents.length} Events Logged · {pendingAlerts.length} Active Operational Alerts · WebSocket: {wsEvents.length} Live
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#030712] border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">WS EVENTS: <strong className="text-cyan-400">{wsEvents.length}</strong></span>
          </div>

          <button
            onClick={() => { refetchEvents(); refetchAlerts(); }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Real-Time Event Stream */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h2 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Telemetry & WebSocket Event Feed ({mergedEvents.length})</span>
            </h2>
            <StatusPill color="#38bdf8" label="BUFFER: 100" />
          </div>

          {isEventsLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Connecting to operational event telemetry...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {mergedEvents.map((evt) => {
                const color = eventTypeColor(evt.event_type);

                return (
                  <div
                    key={evt.event_id}
                    className="p-3 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded font-bold border"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            borderColor: `${color}40`,
                          }}
                        >
                          {evt.event_type}
                        </span>
                        <span className="text-slate-400">Node: <strong className="text-slate-200">{evt.payload.target_node_id || evt.payload.node_id || 'GLOBAL'}</strong></span>
                      </div>
                      <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <p className="text-xs text-slate-200 font-sans leading-relaxed pl-1">
                      {evt.payload.summary || evt.payload.title || evt.payload.argument || JSON.stringify(evt.payload)}
                    </p>

                    {evt.payload.confidence !== undefined && (
                      <div className="text-[10px] font-mono text-slate-400 pl-1">
                        Confidence: <strong className="text-emerald-400">{(evt.payload.confidence * 100).toFixed(0)}%</strong>
                      </div>
                    )}
                  </div>
                );
              })}

              {mergedEvents.length === 0 && (
                <div className="text-center text-slate-500 font-mono text-xs py-12">
                  No telemetry events received. Inject a signal or run specialists to generate events.
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Right Column: Operational Alerts Triage */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h2 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Active Alerts ({pendingAlerts.length})</span>
            </h2>
            {pendingAlerts.length > 0 && (
              <StatusPill color="#f87171" label={`${pendingAlerts.length} CRITICAL`} pulse />
            )}
          </div>

          {isAlertsLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-amber-400" />
              <span>Fetching operational alerts...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {pendingAlerts.map((alert) => {
                const color = alertSeverityColor(alert.severity);

                return (
                  <div
                    key={alert.alert_id}
                    className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-2 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                          borderColor: `${color}40`,
                        }}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{new Date(alert.created_at).toLocaleTimeString()}</span>
                    </div>

                    <h3 className="text-xs font-bold text-white font-sans">{alert.title || alert.message}</h3>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{alert.message}</p>

                    <button
                      onClick={() => ackMutation.mutate(alert.alert_id)}
                      disabled={ackMutation.isPending}
                      className="mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[11px] font-mono font-bold transition-all shadow-md shadow-blue-900/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACKNOWLEDGE ALERT</span>
                    </button>
                  </div>
                );
              })}

              {pendingAlerts.length === 0 && (
                <div className="text-center text-slate-500 font-mono text-xs py-12">
                  ✓ All operational alerts acknowledged.
                </div>
              )}

              {/* Acknowledged Alerts List */}
              {ackedAlerts.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Acknowledged Alerts ({ackedAlerts.length})</div>
                  {ackedAlerts.map((alert) => (
                    <div key={alert.alert_id} className="p-2.5 rounded bg-[#030712]/50 border border-slate-900 opacity-60 text-[11px] flex items-center justify-between">
                      <span className="text-slate-300 font-sans truncate">{alert.title || alert.message}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">ACKED</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
