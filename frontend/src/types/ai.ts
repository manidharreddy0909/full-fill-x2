/**
 * FULFILL-X AI Provider TypeScript Interfaces (Phase 04)
 * Matching backend/app/schemas/ai.py
 */

export type TaskType =
  | 'SCENARIO_GEN'
  | 'SPECIALIST_REASONING'
  | 'COORDINATOR_REASONING'
  | 'ADVERSARIAL_ANALYSIS'
  | 'PLAN_EXPLANATION'
  | 'DECISION_SUMMARY'
  | 'GENERAL';

export type AIProviderType = 'mock' | 'gemini' | 'ollama' | 'bedrock';

export interface ProviderInfo {
  name: AIProviderType;
  configured: bool;
  available: bool;
  models: string[];
  latency_ms?: number | null;
  status_details: string;
}

// Fix for boolean type alias if needed
type bool = boolean;

export interface AIProvidersSummaryResponse {
  active_provider: AIProviderType;
  providers: ProviderInfo[];
}

export interface AIHealthResponse {
  status: string;
  active_provider: AIProviderType;
  available_count: number;
  details: Record<string, any>;
}

export interface AIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
}

export interface AIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface AIRequest {
  request_id?: string;
  task_type?: TaskType;
  prompt: string;
  system_prompt?: string | null;
  system_context?: Record<string, any>;
  input_context?: Record<string, any>;
  expected_schema?: Record<string, any> | null;
  temperature?: number;
  max_tokens?: number;
  timeout_seconds?: number;
}

export interface AIResponse {
  request_id: string;
  provider: AIProviderType;
  model_name: string;
  content: string;
  structured_output?: Record<string, any> | null;
  usage: AIUsage;
  latency_ms: number;
  status: string;
  error?: AIError | null;
}
