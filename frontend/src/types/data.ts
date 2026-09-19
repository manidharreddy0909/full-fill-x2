export interface DataPlatformStatus {
  mode: string;
  database_connected: boolean;
  database_status: string;
  schema_version: string;
  active_seed: number;
  active_preset: string;
  record_counts: {
    world_snapshots: number;
    signals: number;
    risk_snapshots: number;
    evaluation_runs: number;
    audit_events: number;
    event_history: number;
    data_provenance: number;
  };
  retention_policy: {
    events_days: number;
    signals_days: number;
    risks_days: number;
  };
}

export interface DataProvenanceRecord {
  id: string;
  entity_id: string;
  entity_type: string;
  source_type: string;
  source_url?: string;
  collector: string;
  ingested_at: string;
  observed_at: string;
  license: string;
  content_hash: string;
}

export interface DataQualityReport {
  status: string;
  quality_score: number;
  checks_executed: number;
  checks_passed: number;
  findings: {
    orphaned_edges_count: number;
    signal_orphans_count: number;
    valid_node_references: number;
    valid_edge_references: number;
  };
}
