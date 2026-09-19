import { SystemObservabilityStatus, OperationalAlert, DeepHealthStatus } from '../types/observability';
import { EventEnvelope } from '../types/events';
import { getApiBaseUrl } from './config';

const getObsApiUrl = () => `${getApiBaseUrl()}/observability`;

export async function fetchObservabilityStatus(): Promise<SystemObservabilityStatus> {
  const res = await fetch(`${getObsApiUrl()}/status`);
  if (!res.ok) throw new Error(`Fetch observability status failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchEventStream(limit: number = 50): Promise<EventEnvelope[]> {
  const res = await fetch(`${getObsApiUrl()}/events?limit=${limit}`);
  if (!res.ok) throw new Error(`Fetch event stream failed: ${res.statusText}`);
  const body = await res.json();
  return body.events || [];
}

export async function fetchOperationalAlerts(): Promise<OperationalAlert[]> {
  const res = await fetch(`${getObsApiUrl()}/alerts`);
  if (!res.ok) throw new Error(`Fetch alerts failed: ${res.statusText}`);
  const body = await res.json();
  return body.alerts || [];
}

export async function acknowledgeOperationalAlert(alertId: string): Promise<boolean> {
  const res = await fetch(`${getObsApiUrl()}/alerts/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_id: alertId }),
  });
  return res.ok;
}

export async function fetchDeepHealth(): Promise<DeepHealthStatus> {
  const res = await fetch(`${getApiBaseUrl().replace(/\/api$/, '')}/health/deep`);
  if (!res.ok) throw new Error(`Fetch deep health failed: ${res.statusText}`);
  return await res.json();
}
