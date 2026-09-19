import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Radio,
  Cpu,
  RefreshCw,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Server,
  Database,
  Globe,
  Check,
} from 'lucide-react';
import { SystemObservabilityStatus, OperationalAlert, DeepHealthStatus } from '../../types/observability';
import { EventEnvelope } from '../../types/events';
import {
  fetchObservabilityStatus,
  fetchEventStream,
  fetchOperationalAlerts,
  acknowledgeOperationalAlert,
  fetchDeepHealth,
} from '../../api/observabilityApi';
import { useRealtimeStore } from '../../store/realtimeStore';

export const ObservabilityCenter: React.FC = () => {
  const [subTab, setSubTab] = useState<'PULSE' | 'EVENT_FLOW' | 'STREAM' | 'TRACES' | 'ALERTS' | 'HEALTH'>('PULSE');
  const [obsStatus, setObsStatus] = useState<SystemObservabilityStatus | null>(null);
  const [events, setEvents] = useState<EventEnvelope[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [deepHealth, setDeepHealth] = useState<DeepHealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCorrelationId, setSelectedCorrelationId] = useState<string | null>(null);
  const [searchCorrelation, setSearchCorrelation] = useState<string>('');

  const { events: rtEvents } = useRealtimeStore();

  const loadObservabilityState = async () => {
    try {
      setLoading(true);
      const [statusRes, evtsRes, alertsRes, healthRes] = await Promise.all([
        fetchObservabilityStatus().catch(() => null),
        fetchEventStream(50).catch(() => []),
        fetchOperationalAlerts().catch(() => []),
        fetchDeepHealth().catch(() => null),
      ]);

      if (statusRes) setObsStatus(statusRes);
      if (evtsRes) setEvents(evtsRes);
      if (alertsRes) setAlerts(alertsRes);
      if (healthRes) setDeepHealth(healthRes);
    } catch (err) {
      console.warn('Observability load issue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObservabilityState();
    const timer = setInterval(() => {
      loadObservabilityState();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeOperationalAlert(alertId);
      await loadObservabilityState();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  // Combine REST events and live WS store events
  const combinedEvents = [...events];
  for (const rtEvt of rtEvents) {
    if (!combinedEvents.some((e) => e.event_id === rtEvt.event_id)) {
      combinedEvents.unshift(rtEvt as unknown as EventEnvelope);
    }
  }

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 p-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-indigo-500/30 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/40 bg-indigo-950/60 shadow-md">
            <Activity className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-white">
                DISTRIBUTED REALTIME & OBSERVABILITY CENTER
              </h1>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-400 border border-indigo-500/30">
                DISTRIBUTED TELEMETRY ACTIVE
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Structured JSON Logging, Prometheus Metrics, Tracing Correlation & Operational Alert Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={loadObservabilityState}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white shadow-md hover:bg-indigo-500"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            REFRESH TELEMETRY
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-slate-800 font-mono text-xs overflow-x-auto">
        {(['PULSE', 'EVENT_FLOW', 'STREAM', 'TRACES', 'ALERTS', 'HEALTH'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2.5 font-semibold border-b-2 transition-all whitespace-nowrap ${
              subTab === tab
                ? 'border-indigo-400 text-indigo-400 bg-indigo-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'PULSE' && 'SYSTEM PULSE'}
            {tab === 'EVENT_FLOW' && 'EVENT PIPELINE FLOW'}
            {tab === 'STREAM' && `LIVE EVENT STREAM (${combinedEvents.length})`}
            {tab === 'TRACES' && 'TRACE & CORRELATION EXPLORER'}
            {tab === 'ALERTS' && `ALERT CENTER (${activeAlertsCount})`}
            {tab === 'HEALTH' && 'DEEP SYSTEM HEALTH'}
          </button>
        ))}
      </div>

      {/* Tab 1: System Pulse */}
      {subTab === 'PULSE' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>EVENT TRANSPORT</span>
                <Server className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-xl font-bold text-white uppercase">
                {obsStatus?.transport.transport_type || 'MEMORY'}
              </div>
              <div className="mt-1 text-[11px] text-emerald-400">
                Published: {obsStatus?.transport.total_published || 0} events
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>WEBSOCKET CONNECTIONS</span>
                <Radio className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-xl font-bold text-cyan-400">
                {obsStatus?.websockets.active_connections || 0} ACTIVE
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Queue Depth: {obsStatus?.websockets.total_queue_depth || 0}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>OPERATIONAL ALERTS</span>
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 text-xl font-bold text-amber-400">
                {activeAlertsCount} ACTIVE
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Total Tracked: {alerts.length}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>PROMETHEUS METRICS</span>
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-xl font-bold text-emerald-400">
                {Object.keys(obsStatus?.metrics_summary.counters || {}).length} METRICS
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Exposition Endpoint: /metrics
              </div>
            </div>
          </div>

          {/* Core Metrics Cards */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-4 border-b border-slate-800 pb-2">
              PROMETHEUS TELEMETRY COUNTERS & GAUGES
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 font-mono text-xs">
              {Object.entries(obsStatus?.metrics_summary.counters || {}).map(([mName, mVal]) => (
                <div key={mName} className="flex justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-400 truncate">{mName}</span>
                  <span className="font-bold text-indigo-400">{mVal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Event Pipeline Flow */}
      {subTab === 'EVENT_FLOW' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">DISTRIBUTED EVENT-DRIVEN PIPELINE ARCHITECTURE</h3>
            <p className="text-xs text-slate-400">Trace real-time observational flow across decoupled services.</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            {[
              { title: 'DATA ADAPTERS', desc: 'Open-Meteo, USGS, OSM', icon: <Globe className="h-5 w-5 text-cyan-400" /> },
              { title: 'INGESTION SERVICE', desc: 'Deduplication & Quality', icon: <Database className="h-5 w-5 text-indigo-400" /> },
              { title: 'EVENT BUS', desc: 'Transport (Memory / Redis)', icon: <Zap className="h-5 w-5 text-amber-400 animate-pulse" /> },
              { title: 'RISK ENGINE', desc: 'Propagation & Fusion', icon: <Activity className="h-5 w-5 text-red-400" /> },
              { title: 'AGENTS & PLANNER', desc: 'Specialist Agents & Verification', icon: <Cpu className="h-5 w-5 text-purple-400" /> },
              { title: 'REALTIME GATEWAY', desc: 'WebSockets & Cockpit UI', icon: <Radio className="h-5 w-5 text-emerald-400" /> },
            ].map((step, idx) => (
              <React.Fragment key={step.title}>
                <div className="flex flex-1 flex-col items-center rounded-xl border border-slate-800 bg-slate-950 p-4 text-center min-w-[140px]">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                    {step.icon}
                  </div>
                  <div className="font-bold text-white text-xs">{step.title}</div>
                  <div className="mt-1 text-[10px] text-slate-400">{step.desc}</div>
                </div>
                {idx < 5 && <span className="text-slate-600 font-bold text-lg">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Live Event Stream */}
      {subTab === 'STREAM' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">REALTIME EVENT ENVELOPE STREAM</h3>
            <span className="font-mono text-[10px] text-indigo-400">{combinedEvents.length} RECORDED EVENTS</span>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-[600px] overflow-y-auto">
            {combinedEvents.map((evt) => (
              <div
                key={evt.event_id}
                onClick={() => setSelectedCorrelationId(evt.correlation_id || null)}
                className={`flex flex-col gap-2 rounded-lg border p-3 cursor-pointer transition-all ${
                  selectedCorrelationId === evt.correlation_id
                    ? 'border-indigo-500 bg-indigo-950/40'
                    : 'border-slate-800 bg-slate-950/80 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                      {evt.event_type}
                    </span>
                    <span className="text-slate-400 text-[11px]">seq: #{evt.sequence}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-slate-500">ID: {evt.event_id}</span>
                    <span className="text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between text-[11px] text-slate-400">
                  <span>Source: <span className="text-slate-200">{evt.source}</span></span>
                  <span>Correlation ID: <span className="text-cyan-400 font-bold">{evt.correlation_id || 'None'}</span></span>
                  <span>Org: <span className="text-slate-300">{evt.organization_id}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Trace & Correlation Explorer */}
      {subTab === 'TRACES' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">END-TO-END WORKFLOW CORRELATION EXPLORER</h3>
            <p className="text-xs text-slate-400">Trace requests from initial ingestion through risk, agents, and cockpit decisions.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchCorrelation}
                onChange={(e) => setSearchCorrelation(e.target.value)}
                placeholder="Enter Correlation ID (e.g. corr-12345, req-9876)..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <button
              onClick={() => setSelectedCorrelationId(searchCorrelation)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 font-mono"
            >
              TRACE WORKFLOW
            </button>
          </div>

          {selectedCorrelationId ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-slate-300">
                Tracing Workflow Correlation ID: <span className="text-indigo-400 font-bold">{selectedCorrelationId}</span>
              </div>
              <div className="space-y-2 border-l-2 border-indigo-500/50 pl-4">
                {combinedEvents
                  .filter((e) => e.correlation_id === selectedCorrelationId || !selectedCorrelationId)
                  .map((e) => (
                    <div key={e.event_id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">{e.event_type}</span>
                        <span className="text-[10px] text-slate-400">{new Date(e.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Producer: {e.producer || 'fulfillx-backend'} · Source: {e.source}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              Select an event from the Live Stream or enter a Correlation ID to trace end-to-end execution.
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Alert Center */}
      {subTab === 'ALERTS' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">OPERATIONAL ALERT CENTER</h3>
            <span className="text-xs text-amber-400 font-bold">{activeAlertsCount} ACTIVE ALERTS</span>
          </div>

          <div className="space-y-3">
            {alerts.map((alt) => (
              <div key={alt.alert_id} className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      alt.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}>
                      {alt.severity}
                    </span>
                    <span className="font-bold text-sm text-white">{alt.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">{alt.message}</p>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Component: {alt.source_component} · Created: {new Date(alt.created_at).toLocaleTimeString()}
                  </div>
                </div>

                <div>
                  {alt.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleAcknowledge(alt.alert_id)}
                      className="flex items-center gap-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                    >
                      <Check className="h-3.5 w-3.5" />
                      ACKNOWLEDGE
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      ACKNOWLEDGED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Deep System Health */}
      {subTab === 'HEALTH' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">DEEP COMPONENT HEALTH VERIFICATION</h3>
            <p className="text-xs text-slate-400">Live readiness probes for database, transports, adapters, and WS gateway.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="font-bold text-white text-sm">ENVIRONMENT & PERSISTENCE</div>
              <div className="flex justify-between text-slate-400">
                <span>Version:</span>
                <span className="text-indigo-400">{deepHealth?.version}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Environment:</span>
                <span className="text-emerald-400">{deepHealth?.environment}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Persistence Mode:</span>
                <span className="text-cyan-400">{deepHealth?.persistence_mode}</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="font-bold text-white text-sm">EVENT TRANSPORT</div>
              <div className="flex justify-between text-slate-400">
                <span>Transport Mode:</span>
                <span className="text-indigo-400">{deepHealth?.event_transport?.transport_type}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400">{deepHealth?.event_transport?.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
