import {
  DataSourceConfig,
  ExternalObservation,
  ExternalSignal,
  DataQualityReport,
  IngestionRunSummary,
  EntityResolutionCandidate,
  IngestionMode,
} from '../types/ingestion';
import { getApiBaseUrl } from './config';

const getDataApiUrl = () => `${getApiBaseUrl()}/data`;

export async function fetchIngestionSources(): Promise<{ mode: IngestionMode; data: DataSourceConfig[] }> {
  const res = await fetch(`${getDataApiUrl()}/sources`);
  if (!res.ok) throw new Error(`Fetch sources failed: ${res.statusText}`);
  const body = await res.json();
  return { mode: body.mode || 'OFFLINE', data: body.data || [] };
}

export async function setIngestionMode(mode: IngestionMode): Promise<boolean> {
  const res = await fetch(`${getDataApiUrl()}/sources/mode?mode=${mode}`, {
    method: 'POST',
  });
  return res.ok;
}

export async function triggerIngestionRun(sourceId?: string): Promise<IngestionRunSummary | IngestionRunSummary[]> {
  const url = sourceId ? `${getDataApiUrl()}/ingest/run?source_id=${sourceId}` : `${getDataApiUrl()}/ingest/run`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`Ingestion run failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function fetchExternalObservations(): Promise<ExternalObservation[]> {
  const res = await fetch(`${getDataApiUrl()}/observations`);
  if (!res.ok) throw new Error(`Fetch observations failed: ${res.statusText}`);
  const body = await res.json();
  return body.data || [];
}

export async function fetchExternalSignals(): Promise<ExternalSignal[]> {
  const res = await fetch(`${getDataApiUrl()}/signals`);
  if (!res.ok) throw new Error(`Fetch signals failed: ${res.statusText}`);
  const body = await res.json();
  return body.data || [];
}

export async function fetchQualityReports(): Promise<DataQualityReport[]> {
  const res = await fetch(`${getDataApiUrl()}/quality`);
  if (!res.ok) throw new Error(`Fetch quality reports failed: ${res.statusText}`);
  const body = await res.json();
  return body.data || [];
}

export async function resolveEntity(name: string, latitude?: number, longitude?: number): Promise<EntityResolutionCandidate> {
  const res = await fetch(`${getDataApiUrl()}/entity-resolution/resolve?entity_name=${encodeURIComponent(name)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Entity resolution failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function runDataReplay(seed: number = 42): Promise<any> {
  const res = await fetch(`${getDataApiUrl()}/replay/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, speed_multiplier: 1.0 }),
  });
  if (!res.ok) throw new Error(`Data replay failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}
