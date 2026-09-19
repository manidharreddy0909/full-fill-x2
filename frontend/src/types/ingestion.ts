/**
 * FULFILL-X Real-World Data Ingestion & Data Fabric Types (Phase 4)
 */

export type DataSourceCategory =
  | 'WEATHER'
  | 'NATURAL_DISASTER'
  | 'TRANSPORTATION'
  | 'ECONOMIC'
  | 'GEOSPATIAL'
  | 'NEWS_WEAK_SIGNAL'
  | 'CUSTOM';

export type DataSourceType =
  | 'open_meteo'
  | 'usgs_earthquake'
  | 'open_street_map'
  | 'rss_feed'
  | 'custom_api'
  | 'fixture';

export type SourceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'STALE' | 'FAILING' | 'DISABLED';

export type IngestionMode = 'LIVE' | 'HYBRID' | 'OFFLINE';

export type QualityStatus = 'VALID' | 'DEGRADED' | 'REJECTED';

export type EntityMatchStatus = 'RESOLVED' | 'NEEDS_REVIEW' | 'UNRESOLVED';

export interface DataSourceConfig {
  source_id: string;
  name: string;
  category: DataSourceCategory;
  source_type: DataSourceType;
  endpoint_url: string;
  requires_auth: boolean;
  cost_tier: string;
  license_type: string;
  refresh_interval_seconds: number;
  enabled: boolean;
  health_status: SourceHealthStatus;
  last_successful_fetch?: string;
  last_attempt?: string;
  failure_count: number;
  metadata?: Record<string, any>;
}

export interface ExternalObservation {
  observation_id: string;
  organization_id: string;
  source_id: string;
  source_record_id: string;
  observed_at: string;
  ingested_at: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  observation_type: string;
  payload: Record<string, any>;
  confidence: number;
  quality_score: number;
  provenance_id: string;
}

export interface ExternalSignal {
  signal_id: string;
  organization_id: string;
  source_id: string;
  signal_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  affected_entity_ids: string[];
  evidence: Record<string, any>;
  provenance_id: string;
}

export interface EntityResolutionCandidate {
  candidate_id: string;
  organization_id: string;
  external_entity_name: string;
  external_latitude?: number;
  external_longitude?: number;
  matched_node_id?: string;
  match_score: number;
  match_status: EntityMatchStatus;
  match_reason?: string;
  created_at: string;
}

export interface DataQualityReport {
  report_id: string;
  organization_id: string;
  source_id: string;
  run_id: string;
  timestamp: string;
  completeness_score: number;
  validity_score: number;
  freshness_score: number;
  overall_quality_score: number;
  status: QualityStatus;
  records_evaluated: number;
  records_accepted: number;
  records_rejected: number;
  issues: string[];
  warnings: string[];
}

export interface IngestionRunSummary {
  run_id: string;
  organization_id: string;
  source_id: string;
  mode: IngestionMode;
  started_at: string;
  completed_at?: string;
  records_fetched: number;
  records_processed: number;
  records_accepted: number;
  records_rejected: number;
  signals_generated: number;
  latency_ms: number;
  status: string;
  error_message?: string;
}
