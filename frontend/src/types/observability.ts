export interface SystemObservabilityStatus {
  status: string;
  organization_id: string;
  transport: {
    status: string;
    transport_type: string;
    total_published?: number;
    active_sessions?: number;
    subscriber_groups?: number;
    redis_connected?: boolean;
  };
  websockets: {
    active_connections: number;
    session_groups: number;
    total_broadcast: number;
    total_dropped: number;
    total_queue_depth: number;
  };
  active_alerts_count: number;
  metrics_summary: {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, { count: number; avg: number }>;
    timestamp: string;
  };
}

export interface OperationalAlert {
  alert_id: string;
  organization_id: string;
  fingerprint: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  message: string;
  source_component: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  evidence?: Record<string, any>;
}

export interface DeepHealthStatus {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
  persistence_mode: string;
  event_transport: Record<string, any>;
  websocket_gateway: Record<string, any>;
  data_adapters: {
    count: number;
    sources: Array<Record<string, any>>;
  };
}
