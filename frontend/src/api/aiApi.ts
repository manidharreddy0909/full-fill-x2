import { ApiResponse } from '../types/world';
import {
  AIProvidersSummaryResponse,
  AIHealthResponse,
  AIRequest,
  AIResponse,
} from '../types/ai';

import { getApiBaseUrl } from './config';

const getAiApi = () => `${getApiBaseUrl()}/ai`;

export async function fetchAIProviders(): Promise<AIProvidersSummaryResponse> {
  const response = await fetch(`${getAiApi()}/providers`);
  if (!response.ok) {
    throw new Error(`Failed to fetch AI providers: ${response.statusText}`);
  }
  const json: ApiResponse<AIProvidersSummaryResponse> = await response.json();
  return json.data;
}

export async function fetchAIHealth(): Promise<AIHealthResponse> {
  const response = await fetch(`${getAiApi()}/health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch AI health: ${response.statusText}`);
  }
  const json: ApiResponse<AIHealthResponse> = await response.json();
  return json.data;
}

export async function generateAIReasoning(
  request: AIRequest,
  providerOverride?: string
): Promise<AIResponse> {
  const url = `${getAiApi()}/generate${providerOverride ? `?provider=${providerOverride}` : ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate AI reasoning: ${response.statusText}`);
  }
  const json: ApiResponse<AIResponse> = await response.json();
  return json.data;
}
