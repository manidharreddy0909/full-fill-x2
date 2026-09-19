/**
 * FULFILL-X Risk & Signal TypeScript Interfaces (Phase 03)
 * Matching backend/app/schemas/signal.py & risk.py
 */

export type SignalType =
  | 'WEATHER'
  | 'GEOPOLITICAL'
  | 'SUPPLIER_HEALTH'
  | 'DEMAND_SHIFT'
  | 'LOGISTICS'
  | 'REGULATORY'
  | 'CYBER';

export type SignalSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SignalStatus = 'ACTIVE' | 'DISMISSED' | 'PROMOTED' | 'RESOLVED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Signal {
  id: string;
  type: SignalType;
  severity: SignalSeverity;
  title: string;
  description: string;
  confidence: number;
  region: string;
  source: string;
  affected_node_ids: string[];
  affected_edge_ids: string[];
  geographic_scope?: Record<string, any>;
  created_at: string;
  expires_at?: string | null;
  status: SignalStatus;
  raw_data?: Record<string, any>;
}

export interface SignalCreateRequest {
  type: SignalType;
  severity?: SignalSeverity;
  title: string;
  description?: string;
  confidence?: number;
  region?: string;
  source?: string;
  affected_node_ids?: string[];
  affected_edge_ids?: string[];
  expires_in_hours?: number | null;
}

export interface FusedSignal {
  fused_id: string;
  type: SignalType;
  target_node_id: string;
  severity: SignalSeverity;
  confidence: number;
  contributing_signal_ids: string[];
  earliest_timestamp: string;
  latest_timestamp: string;
  titles: string[];
}

export interface SignalContribution {
  signal_id: string;
  type: SignalType;
  severity: SignalSeverity;
  weight: number;
  direct: boolean;
  hop_distance: number;
}

export interface RiskExplanation {
  node_id: string;
  composite: number;
  risk_level: RiskLevel;
  dimensional_scores: Record<string, number>;
  primary_driver: string;
  contributing_signals: SignalContribution[];
  affected_upstream_nodes: string[];
  affected_downstream_nodes: string[];
  explanation_text: string;
}

export interface NodeRiskDetail {
  node_id: string;
  node_name: string;
  node_type: string;
  risk_scores: {
    composite: number;
    financial: number;
    sla: number;
    operational: number;
    sustainability: number;
  };
  risk_level: RiskLevel;
  explanation: RiskExplanation;
  fused_signals: FusedSignal[];
  active_signal_count: number;
}

export interface RiskScoreMap {
  snapshot_id: string;
  timestamp: string;
  node_risks: Record<string, {
    composite: number;
    financial: number;
    sla: number;
    operational: number;
    sustainability: number;
  }>;
  edge_risks: Record<string, number>;
  explanations: Record<string, RiskExplanation>;
  fused_signals: Record<string, FusedSignal[]>;
  network_health: number;
  baseline_health: number;
}
