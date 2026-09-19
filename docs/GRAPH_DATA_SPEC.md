# FULFILL-X Graph Data Specification (Phase 7)

## Schema Version
`graph_feature_schema_version = "1.0.0"`

## Node Vector (22 Dimensions)
1. **Operational (6D)**: `[capacity/1000, utilization, throughput/2000, backlog/500, inventory/10000, lead_time/100]`
2. **Risk (4D)**: `[composite_risk, operational_risk, disruption_risk, signal_count/10]`
3. **Network Centrality (8D)**: `[in_degree/10, out_degree/10, degree_centrality, betweenness, closeness, pagerank*5, upstream_cnt/10, downstream_cnt/10]`
4. **External Signals (4D)**: `[weather_score, seismic_score, news_score, transit_score]`

## Edge Vector (4 Dimensions)
`[transit_time_hours/100, route_capacity/1000, current_utilization, current_risk]`
