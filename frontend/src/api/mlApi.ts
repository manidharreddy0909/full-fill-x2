/**
 * FULFILL-X Predictive ML Platform API Client (Phase 6)
 */
import { getApiBaseUrl } from './config';
import {
  MLTaskType, ModelMetadata, Prediction, PredictionHorizon, DriftReport,
  ModelCard, TrainingJobConfig, TrainingJobSummary, MLStatusSummary
} from '../types/ml';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('fulfillx_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchMLStatus(): Promise<MLStatusSummary> {
  const res = await fetch(`${getApiBaseUrl()}/ml/status`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch ML status');
  const body = await res.json();
  return body.data;
}

export async function fetchMLModels(taskType?: MLTaskType): Promise<ModelMetadata[]> {
  const query = taskType ? `?task_type=${taskType}` : '';
  const res = await fetch(`${getApiBaseUrl()}/ml/models${query}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch ML models');
  const body = await res.json();
  return body.data;
}

export async function activateMLModel(modelId: string): Promise<boolean> {
  const res = await fetch(`${getApiBaseUrl()}/ml/models/${modelId}/activate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.ok;
}

export async function rollbackMLModel(taskType: MLTaskType): Promise<boolean> {
  const res = await fetch(`${getApiBaseUrl()}/ml/models/rollback?task_type=${taskType}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.ok;
}

export async function launchTrainingJob(config: TrainingJobConfig): Promise<TrainingJobSummary> {
  const res = await fetch(`${getApiBaseUrl()}/ml/train`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to launch training job');
  const body = await res.json();
  return body.data;
}

export async function requestPrediction(
  entityId: string,
  taskType: MLTaskType,
  horizon: PredictionHorizon = '24h'
): Promise<Prediction> {
  const res = await fetch(
    `${getApiBaseUrl()}/ml/predict?entity_id=${encodeURIComponent(entityId)}&task_type=${taskType}&horizon=${horizon}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error('Failed to generate prediction');
  const body = await res.json();
  return body.data;
}

export async function fetchDriftReport(modelId: string): Promise<DriftReport> {
  const res = await fetch(`${getApiBaseUrl()}/ml/drift/${modelId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch drift report');
  const body = await res.json();
  return body.data;
}

export async function fetchModelCard(modelId: string): Promise<ModelCard> {
  const res = await fetch(`${getApiBaseUrl()}/ml/cards/${modelId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch model card');
  const body = await res.json();
  return body.data;
}
