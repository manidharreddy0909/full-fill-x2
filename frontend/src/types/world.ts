export type NodeType = 'SUPPLIER' | 'WAREHOUSE' | 'FULFILLMENT_CENTER' | 'CUSTOMER_ZONE' | 'PORT';
export type EdgeType = 'ROUTE' | 'DEPENDENCY' | 'RISK_PROPAGATION';
export type TransportMode = 'SEA' | 'AIR' | 'ROAD' | 'RAIL';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface NodeRiskScores {
  composite: number;
  financial: number;
  sla: number;
  operational: number;
  sustainability: number;
}

export interface WorldNode {
  id: str;
  type: NodeType;
  name: string;
  position: Position3D;
  risk_scores: NodeRiskScores;
  inventory_level: number;
  capacity: number;
  is_disrupted: boolean;
  disruption_source_ids: string[];
  tags: string[];
  metadata: Record<string, any>;
  tier?: number;
  region?: string;
  lead_time_days?: number;
  qualification_score?: number;
  is_alternative_available?: boolean;
  capacity_units?: number;
  utilization?: number;
  safety_stock_threshold?: number;
  capacity_orders_per_day?: number;
  current_backlog?: number;
  sla_at_risk_count?: number;
  demand_units_per_day?: number;
  sla_commitment_hours?: number;
  sla_current_risk?: number;
  throughput_vessels_per_day?: number;
  connected_route_ids?: string[];
}

// Fixed type alias for id string
type str = string;

export interface WorldEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: EdgeType;
  transport_mode?: TransportMode;
  load: number;
  capacity: number;
  delay_hours: number;
  standard_time_hours?: number;
  cost_per_unit: number;
  emissions_per_unit: number;
  is_disrupted: boolean;
  dependency_type?: string;
  criticality?: number;
  alternative_route_ids?: string[];
}

export interface WorldStateSnapshot {
  snapshot_id: string;
  timestamp: string;
  nodes: WorldNode[];
  edges: WorldEdge[];
  network_health_score: number;
  total_risk_score: number;
}

export interface WorldSummary {
  total_nodes: number;
  suppliers_count: number;
  warehouses_count: number;
  fulfillment_centers_count: number;
  customer_zones_count: number;
  ports_count: number;
  total_edges: number;
  total_routes_count: number;
  total_dependencies_count: number;
  total_inventory_units: number;
  average_capacity_utilization: number;
  disrupted_nodes_count: number;
  disrupted_edges_count: number;
  network_health_score: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    request_id: string;
  };
  error: { code: string; message: string; details?: any } | null;
}
