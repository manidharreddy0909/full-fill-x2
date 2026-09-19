import React, { useState, useEffect } from 'react';
import {
  Database,
  Globe,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Search,
  Sliders,
  ShieldAlert,
  Play,
  FileText,
  Lock,
} from 'lucide-react';
import {
  DataSourceConfig,
  ExternalObservation,
  ExternalSignal,
  DataQualityReport,
  EntityResolutionCandidate,
  IngestionMode,
} from '../../types/ingestion';
import {
  fetchIngestionSources,
  setIngestionMode,
  triggerIngestionRun,
  fetchExternalObservations,
  fetchExternalSignals,
  fetchQualityReports,
  resolveEntity,
  runDataReplay,
} from '../../api/dataIngestionApi';
import { DataFoundation } from './DataFoundation';

export const DataFabric: React.FC = () => {
  const [subTab, setSubTab] = useState<'OBSERVATORY' | 'STREAM' | 'QUALITY' | 'ENTITY_RESOLUTION' | 'PROVENANCE' | 'STORAGE'>('OBSERVATORY');
  const [mode, setMode] = useState<IngestionMode>('OFFLINE');
  const [sources, setSources] = useState<DataSourceConfig[]>([]);
  const [observations, setObservations] = useState<ExternalObservation[]>([]);
  const [signals, setSignals] = useState<ExternalSignal[]>([]);
  const [qualityReports, setQualityReports] = useState<DataQualityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ingesting, setIngesting] = useState<boolean>(false);

  // Entity resolution search state
  const [searchEntity, setSearchEntity] = useState<string>('Port of Rotterdam');
  const [entityResult, setEntityResult] = useState<EntityResolutionCandidate | null>(null);

  const loadDataFabricState = async () => {
    try {
      setLoading(true);
      const [srcRes, obsData, sigData, qReports] = await Promise.all([
        fetchIngestionSources().catch(() => ({ mode: 'OFFLINE' as IngestionMode, data: [] })),
        fetchExternalObservations().catch(() => []),
        fetchExternalSignals().catch(() => []),
        fetchQualityReports().catch(() => []),
      ]);

      setMode(srcRes.mode);
      setSources(srcRes.data);
      setObservations(obsData);
      setSignals(sigData);
      setQualityReports(qReports);
    } catch (err) {
      console.warn('Data Fabric load issue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataFabricState();
  }, []);

  const handleModeChange = async (newMode: IngestionMode) => {
    setMode(newMode);
    await setIngestionMode(newMode).catch(() => {});
  };

  const handleTriggerIngestion = async (sourceId?: string) => {
    setIngesting(true);
    try {
      await triggerIngestionRun(sourceId);
      await loadDataFabricState();
    } catch (err) {
      console.error('Ingestion failed:', err);
    } finally {
      setIngesting(false);
    }
  };

  const handleEntitySearch = async () => {
    if (!searchEntity) return;
    try {
      const res = await resolveEntity(searchEntity, 51.9, 4.4);
      setEntityResult(res);
    } catch (err) {
      console.error('Entity resolution failed:', err);
    }
  };

  const handleRunReplay = async () => {
    setIngesting(true);
    try {
      await runDataReplay(42);
      await loadDataFabricState();
    } catch (err) {
      console.error('Replay failed:', err);
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-950/60 shadow-md">
            <Globe className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-white">
                DATA FABRIC & REAL-WORLD INGESTION
              </h1>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/30">
                TIER A FREE / OPEN DATA ACTIVE
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Vendor-Neutral Data Adapters (Open-Meteo, USGS, OpenStreetMap, RSS), Quality Scoring & Entity Resolution
            </p>
          </div>
        </div>

        {/* Mode Switcher & Replay */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 font-mono text-xs">
            {(['OFFLINE', 'HYBRID', 'LIVE'] as IngestionMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`rounded px-2.5 py-1 transition-all ${
                  mode === m
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleTriggerIngestion()}
            disabled={ingesting}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${ingesting ? 'animate-spin' : ''}`} />
            INGEST ALL
          </button>

          <button
            onClick={handleRunReplay}
            disabled={ingesting}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/60 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-900/60 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            REPLAY HISTORICAL
          </button>
        </div>
      </div>

      {/* Workspace Sub-Tabs */}
      <div className="flex border-b border-slate-800 font-mono text-xs">
        <button
          onClick={() => setSubTab('OBSERVATORY')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all ${
            subTab === 'OBSERVATORY'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          SOURCE OBSERVATORY ({sources.length})
        </button>
        <button
          onClick={() => setSubTab('STREAM')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all ${
            subTab === 'STREAM'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          LIVE INGESTION STREAM ({observations.length})
        </button>
        <button
          onClick={() => setSubTab('QUALITY')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all ${
            subTab === 'QUALITY'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          DATA QUALITY INSPECTOR ({qualityReports.length})
        </button>
        <button
          onClick={() => setSubTab('ENTITY_RESOLUTION')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all ${
            subTab === 'ENTITY_RESOLUTION'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ENTITY RESOLUTION
        </button>
        <button
          onClick={() => setSubTab('PROVENANCE')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all ${
            subTab === 'PROVENANCE'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          PROVENANCE EXPLORER ({signals.length})
        </button>
        <button
          onClick={() => setSubTab('STORAGE')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all ${
            subTab === 'STORAGE'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          PERSISTENT STORAGE
        </button>
      </div>

      {/* Sub-Tab Content Rendering */}
      {subTab === 'OBSERVATORY' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((src) => (
            <div key={src.source_id} className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-cyan-950 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                    {src.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3 w-3" />
                    {src.health_status}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-white">{src.name}</h3>
                <p className="mt-1 text-xs text-slate-400 font-mono truncate">{src.endpoint_url}</p>
                
                <div className="mt-3 space-y-1.5 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost Tier:</span>
                    <span className="text-emerald-400">{src.cost_tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">License:</span>
                    <span className="text-slate-300">{src.license_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Polling Interval:</span>
                    <span className="text-cyan-400">{src.refresh_interval_seconds}s</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-500">ID: {src.source_id}</span>
                <button
                  onClick={() => handleTriggerIngestion(src.source_id)}
                  className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-200 hover:bg-slate-700"
                >
                  INGEST
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'STREAM' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">LIVE INGESTION PIPELINE (SOURCE → RAW → NORMALIZED → SIGNAL)</h3>
            <span className="font-mono text-[10px] text-cyan-400">{observations.length} OBSERVATIONS INGESTED</span>
          </div>

          <div className="space-y-3">
            {observations.slice(0, 10).map((obs) => (
              <div key={obs.observation_id} className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">{obs.location_name || 'Global Grid Observation'}</div>
                    <div className="font-mono text-[10px] text-slate-400">type: {obs.observation_type} · source: {obs.source_id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs">
                  <div className="text-slate-400">
                    Confidence: <span className="text-emerald-400 font-bold">{(obs.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-slate-400">
                    Quality: <span className="text-cyan-400 font-bold">{(obs.quality_score * 100).toFixed(0)}%</span>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    {new Date(obs.observed_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'QUALITY' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">DATA QUALITY ENGINE METRIC REPORTS</h3>
            <span className="font-mono text-[10px] text-emerald-400">DETERMINISTIC EVALUATION ACTIVE</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {qualityReports.map((q) => (
              <div key={q.report_id} className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs font-bold text-white">{q.source_id}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold ${
                    q.status === 'VALID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}>
                    {q.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Completeness:</span>
                      <span className="text-emerald-400">{(q.completeness_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-slate-800">
                      <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${q.completeness_score * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Validity:</span>
                      <span className="text-cyan-400">{(q.validity_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-slate-800">
                      <div className="h-1 rounded-full bg-cyan-500" style={{ width: `${q.validity_score * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Overall Quality:</span>
                      <span className="text-amber-400 font-bold">{(q.overall_quality_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'ENTITY_RESOLUTION' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">DETERMINISTIC ENTITY RESOLUTION SERVICE</h3>
            <p className="text-xs text-slate-400">Map external text/locations to canonical supply chain graph nodes.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchEntity}
                onChange={(e) => setSearchEntity(e.target.value)}
                placeholder="Enter external entity name (e.g., Port of Rotterdam, Kobe, Chicago)..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleEntitySearch}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
            >
              RESOLVE ENTITY
            </button>
          </div>

          {entityResult && (
            <div className="rounded-lg border border-cyan-500/30 bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-white">{entityResult.external_entity_name}</span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold ${
                  entityResult.match_status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400'
                }`}>
                  {entityResult.match_status}
                </span>
              </div>
              <div className="font-mono text-xs space-y-1 text-slate-300">
                <div>Matched Canonical Node: <span className="text-cyan-400 font-bold">{entityResult.matched_node_id || 'None'}</span></div>
                <div>Match Score: <span className="text-emerald-400">{(entityResult.match_score * 100).toFixed(0)}%</span></div>
                <div className="text-slate-400">Reason: {entityResult.match_reason}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'PROVENANCE' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">EXTERNAL SIGNAL PROVENANCE EXPLORER</h3>
            <span className="font-mono text-[10px] text-cyan-400">{signals.length} VALIDATED SIGNALS</span>
          </div>

          <div className="space-y-3">
            {signals.map((sig) => (
              <div key={sig.signal_id} className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    <span className="font-semibold text-xs text-white">{sig.signal_type}</span>
                  </div>
                  <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                    SEVERITY: {sig.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{sig.evidence?.summary || 'Validated external disruption signal'}</p>
                <div className="mt-2 font-mono text-[10px] text-slate-500">
                  provenance_id: {sig.provenance_id} · source: {sig.source_id} · target_node: {sig.affected_entity_ids.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'STORAGE' && (
        <DataFoundation />
      )}
    </div>
  );
};
