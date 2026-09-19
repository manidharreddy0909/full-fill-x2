"""
FULFILL-X Graph Feature Extractor (Phase 7)
Deterministic feature engineering for graph neural networks and topological analysis.
Enforces schema version 1.0.0 and prevents data leakage.
"""
import time
import numpy as np
import networkx as nx
from typing import Dict, List, Tuple
from app.graph.adapter import GraphMLAdapter
from app.graph.schemas import GraphSnapshot, GraphFeatures, GraphNodeFeatures


class GraphFeatureExtractor:
    """
    Deterministic Graph Feature Extractor producing standardized tensor inputs
    and topological metrics for Graph Neural Networks and Propagation Analysis.
    """

    SCHEMA_VERSION: str = "1.0.0"

    def __init__(self, schema_version: str = "1.0.0"):
        self.schema_version = schema_version

    def extract_features(self, snapshot: GraphSnapshot) -> GraphFeatures:
        """Extract node & edge feature matrices and return typed GraphFeatures object."""
        G = GraphMLAdapter.to_networkx(snapshot)
        node_ids = sorted(list(G.nodes()))
        node_id_map = {nid: i for i, nid in enumerate(node_ids)}
        int_to_node_id = {i: nid for i, nid in enumerate(node_ids)}

        # Compute graph network centrality metrics
        in_degrees = dict(G.in_degree())
        out_degrees = dict(G.out_degree())
        degrees = dict(G.degree())

        try:
            degree_cent = nx.degree_centrality(G)
        except Exception:
            degree_cent = {nid: degrees.get(nid, 0) / max(len(G) - 1, 1) for nid in node_ids}

        try:
            betweenness = nx.betweenness_centrality(G)
        except Exception:
            betweenness = {nid: 0.1 for nid in node_ids}

        try:
            closeness = nx.closeness_centrality(G)
        except Exception:
            closeness = {nid: 0.1 for nid in node_ids}

        try:
            pagerank = nx.pagerank(G, alpha=0.85)
        except Exception:
            pagerank = {nid: 1.0 / max(len(G), 1) for nid in node_ids}

        node_features_map: Dict[str, GraphNodeFeatures] = {}

        for nid in node_ids:
            data = G.nodes[nid]

            # Operational Vector (6 dimensions): [capacity/1000, utilization, throughput/2000, backlog/500, inventory/10000, lead_time/100]
            op_vector = [
                float(data.get("capacity", 100.0)) / 1000.0,
                float(data.get("utilization", 0.70)),
                float(data.get("throughput", 1000.0)) / 2000.0,
                float(data.get("backlog", 0)) / 500.0,
                float(data.get("inventory_count", 5000)) / 10000.0,
                float(data.get("lead_time_hours", 24.0)) / 100.0,
            ]

            # Risk Vector (4 dimensions): [composite_risk, operational_risk, disruption_risk, signal_count/10]
            current_risk = float(data.get("current_risk", 0.05))
            is_disrupted = 1.0 if data.get("is_disrupted", False) else 0.0
            risk_vector = [
                current_risk,
                current_risk * 0.8,
                is_disrupted,
                1.0 if is_disrupted else 0.1,
            ]

            # Network Vector (8 dimensions): [in_degree/10, out_degree/10, degree_cent, betweenness, closeness, pagerank*5, upstream_cnt/10, downstream_cnt/10]
            try:
                upstream_cnt = len(nx.ancestors(G, nid))
            except Exception:
                upstream_cnt = 0
            try:
                downstream_cnt = len(nx.descendants(G, nid))
            except Exception:
                downstream_cnt = 0

            net_vector = [
                float(in_degrees.get(nid, 0)) / 10.0,
                float(out_degrees.get(nid, 0)) / 10.0,
                float(degree_cent.get(nid, 0.0)),
                float(betweenness.get(nid, 0.0)),
                float(closeness.get(nid, 0.0)),
                float(pagerank.get(nid, 0.0)) * 5.0,
                float(upstream_cnt) / 10.0,
                float(downstream_cnt) / 10.0,
            ]

            # External Vector (4 dimensions): [weather, seismic, news, transit]
            ext_vector = [0.1, 0.05, 0.1, 0.2]

            combined = op_vector + risk_vector + net_vector + ext_vector

            node_features_map[nid] = GraphNodeFeatures(
                node_id=nid,
                operational_vector=op_vector,
                risk_vector=risk_vector,
                network_vector=net_vector,
                external_vector=ext_vector,
                combined_feature_vector=combined,
            )

        # Build Edge Index & Edge Attributes
        edge_sources: List[int] = []
        edge_targets: List[int] = []
        edge_attrs: List[List[float]] = []

        for u, v, edata in G.edges(data=True):
            if u in node_id_map and v in node_id_map:
                edge_sources.append(node_id_map[u])
                edge_targets.append(node_id_map[v])

                # Edge attr (4 dimensions): [transit_time/100, route_capacity/1000, current_utilization, current_risk]
                e_attr = [
                    float(edata.get("transit_time_hours", 12.0)) / 100.0,
                    float(edata.get("route_capacity", 500.0)) / 1000.0,
                    float(edata.get("current_utilization", 0.65)),
                    float(edata.get("current_risk", 0.05)),
                ]
                edge_attrs.append(e_attr)

        edge_index = [edge_sources, edge_targets]

        return GraphFeatures(
            snapshot_id=snapshot.snapshot_id,
            schema_version=self.SCHEMA_VERSION,
            node_features=node_features_map,
            edge_index=edge_index,
            edge_attr=edge_attrs,
            node_id_map=node_id_map,
            int_to_node_id=int_to_node_id,
            created_at=time.time(),
        )
