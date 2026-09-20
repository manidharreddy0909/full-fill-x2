import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchEventStream,
  fetchOperationalAlerts,
  acknowledgeOperationalAlert,
  fetchObservabilityStatus,
} from '../../api/observabilityApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import {
  Activity, Radio, Bell, BellOff, RefreshCw, CheckCircle2,
  AlertTriangle, Zap, Clock, Eye,
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
  return '#60a5fa';
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

  // Merge WebSocket live events with REST event history (WS events first, deduplicated)
  const wsEventIds = new Set(wsEvents.map((e) => e.event_id));
  const mergedEvents: EventEnvelope[] = [
    ...wsEvents,
    ...eventHistory.filter((e) => !wsEventIds.has(e.event_id)),
  ].slice(0, 100);

  const pendingAlerts = alerts.filter((a: OperationalAlert) => a.status === 'ACTIVE');
  const ackedAlerts = alerts.filter((a: OperationalAlert) => a.status !== 'ACTIVE');

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Observability — Real-Time Event Stream & Alerts</h1>
            <p className="text-xs text-slate-400">
              {mergedEvents.length} events · {pendingAlerts.length} pending alerts · WebSocket: {wsEvents.length} live
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* WebSocket Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs">
            <span className={`w-2 h-2 rounded-full animate-pulse ${wsEvents.length > 0 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-slate-400">WS LIVE: {wsEvents.length}</span>
          </div>

          <button
            onClick={() => { refetchEvents(); refetchAlerts(); }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status KPI Bar */}
      {obsStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Events (1h)', value: (obsStatus as any).events_last_hour ?? mergedEvents.length, color: '#60a5fa' },
            { label: 'Active Alerts', value: pendingAlerts.length, color: pendingAlerts.length > 0 ? '#f87171' : '#34d399' },
            { label: 'WS Events', value: wsEvents.length, color: '#c084fc' },
            { label: 'Acknowledged', value: ackedAlerts.length, color: '#34d399' },
          ].map((kpi) => (
            <div key={kpi.label} className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-400 font-mono uppercase">{kpi.label}</div>
              <div className="text-xl font-black mt-1 font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Event Stream */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Event Stream ({mergedEvents.length})</span>
            {isEventsLoading && <Activity className="w-3 h-3 animate-spin text-slate-400" />}
          </h2>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1 font-mono text-xs">
            {mergedEvents.map((evt) => {
              const color = eventTypeColor(evt.event_type);
              const isLive = wsEventIds.has(evt.event_id);
              return (
                <div
                  key={evt.event_id}
                  className="p-2.5 rounded-lg border flex gap-2.5 transition-all hover:brightness-110"
                  style={{
                    background: `${color}08`,
                    borderColor: `${color}25`,
                  }}
                >
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold truncate" style={{ color }}>{evt.event_type}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] truncate mt-0.5 font-sans">
                      {evt.payload?.summary || evt.payload?.title || evt.payload?.message || JSON.stringify(evt.payload).slice(0, 80)}
                    </div>
                    {evt.source && (
                      <div className="text-[9px] text-slate-600 mt-0.5">Source: {evt.source}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {mergedEvents.length === 0 && !isEventsLoading && (
              <div className="text-center text-slate-500 font-mono text-xs py-12 flex flex-col items-center gap-2">
                <Eye className="w-8 h-8 text-slate-700" />
                <span>No events received. Trigger agent runs or inject signals to generate events.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Operational Alerts */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Operational Alerts ({alerts.length})</span>
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {/* Pending */}
            {pendingAlerts.length > 0 && (
              <div className="text-[10px] font-mono text-red-400 uppercase font-bold px-1 pt-1">
                ⚠ Pending ({pendingAlerts.length})
              </div>
            )}
            {pendingAlerts.map((alert: OperationalAlert) => {
              const color = alertSeverityColor(alert.severity);
              return (
                <div
                  key={alert.alert_id}
                  className="p-3 rounded-lg border font-mono text-xs flex flex-col gap-2"
                  style={{ background: `${color}0d`, borderColor: `${color}33` }}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold" style={{ color }}>{alert.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color, background: `${color}20` }}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] font-sans mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => ackMutation.mutate(alert.alert_id)}
                    disabled={ackMutation.isPending}
                    className="w-full flex items-center justify-center gap-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ACKNOWLEDGE</span>
                  </button>
                </div>
              );
            })}

            {/* Acknowledged */}
            {ackedAlerts.length > 0 && (
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold px-1 pt-2">
                ✓ Acknowledged ({ackedAlerts.length})
              </div>
            )}
            {ackedAlerts.map((alert: OperationalAlert) => (
              <div
                key={alert.alert_id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 font-mono text-[10px] text-slate-500 flex items-center gap-2"
              >
                <BellOff className="w-3 h-3 text-slate-600 shrink-0" />
                <div className="flex-1 truncate">
                  <span className="text-slate-400">{alert.title}</span>
                  <span className="ml-2 text-slate-600">{alert.severity}</span>
                </div>
              </div>
            ))}

            {alerts.length === 0 && !isAlertsLoading && (
              <div className="text-center text-slate-500 font-mono text-xs py-8 flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-slate-700" />
                <span>No operational alerts active.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
