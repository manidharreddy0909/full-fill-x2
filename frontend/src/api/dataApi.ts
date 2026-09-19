import { API_BASE_URL } from './config';
import { DataPlatformStatus, DataProvenanceRecord, DataQualityReport } from '../types/data';

export async function fetchDataStatus(): Promise<DataPlatformStatus> {
  const res = await fetch(`${API_BASE_URL}/data/status`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchDataProvenance(limit: number = 50): Promise<DataProvenanceRecord[]> {
  const res = await fetch(`${API_BASE_URL}/data/provenance?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.provenance_records || [];
}

export async function fetchDataQuality(): Promise<DataQualityReport> {
  const res = await fetch(`${API_BASE_URL}/data/quality`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function seedDataPlatform(seed: number = 42, preset: string = 'healthy'): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/data/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, preset }),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function purgeDataPlatform(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/data/purge`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function exportDataPlatform(format: 'json' | 'jsonl' | 'csv' = 'json'): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/data/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format }),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.blob();
}
