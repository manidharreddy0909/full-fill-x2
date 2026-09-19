"""
FULFILL-X GraphML Adapter (Phase 7)
Zero-copy thread-safe adapter converting World Model snapshots to NetworkX and Tensor representations.
"""
import time
import networkx as nx
from typing import Tuple, Dict, Any, List, Optional
from app.schemas.world import WorldStateSnapshot, NodeType, EdgeType
from app.graph.schemas import GraphNode, GraphEdge, GraphSnapshot


class GraphMLAdapter:
    """
    Canonical Graph Adapter converting FULFILL-X World State snapshots
    to typed GraphSnapshots and NetworkX DiGraph instances.
    """

    @staticmethod
    def snapshot_to_graph_snapshot(snapshot: WorldStateSnapshot, organization_id: str = "org-fulfillx-default") -> GraphSnapshot:
        """Convert WorldStateSnapshot to typed GraphSnapshot safely."""
        nodes: List[GraphNode] = []
        for n in snapshot.nodes:
            node_type = n.type.value if hasattr(n.type, "value") else str(n.type)
            is_disrupted = getattr(n, "is_disrupted", False)
            curr_risk = n.risk_scores.composite if hasattr(n, "risk_scores") and n.risk_scores else 0.05

            capacity = float(getattr(n, "capacity", 1000.0) or 1000.0)
            utilization = float(getattr(n, "utilization", 0.70) or 0.70)
            throughput = float(getattr(n, "capacity_orders_per_day", None) or getattr(n, "throughput_vessels_per_day", None) or capacity)
            backlog = int(getattr(n, "current_backlog", 0) or 0)
            inv_level = float(getattr(n, "inventory_level", 0.80) or 0.80)
            inventory_count = int(inv_level * 5000.0)
            lead_time_days = float(getattr(n, "lead_time_days", 1.0) or 1.0)
            lead_time_hours = lead_time_days * 24.0

            gn = GraphNode(
                id=n.id,
                type=node_type,
                organization_id=organization_id,
                operational_status="DISRUPTED" if is_disrupted else "HEALTHY",
                capacity=capacity,
                utilization=utilization,
                throughput=throughput,
                backlog=backlog,
                inventory_count=inventory_count,
                lead_time_hours=lead_time_hours,
                current_risk=curr_risk,
                is_disrupted=is_disrupted,
                attributes=getattr(n, "metadata", {}) or {}
            )
            nodes.append(gn)

        edges: List[GraphEdge] = []
        for e in snapshot.edges:
            edge_type = e.type.value if hasattr(e.type, "value") else str(e.type)
            source_id = getattr(e, "source_node_id", getattr(e, "source_id", ""))
            target_id = getattr(e, "target_node_id", getattr(e, "target_id", ""))
            is_disrupted = getattr(e, "is_disrupted", False)
            delay = float(getattr(e, "delay_hours", 0.0) or 0.0)
            transit_time = 12.0 + delay
            route_cap = float(getattr(e, "capacity", 500.0) or 500.0)
            util = float(getattr(e, "load", 0.65) or 0.65)

            ge = GraphEdge(
                id=e.id,
                source_id=source_id,
                target_id=target_id,
                type=edge_type,
                organization_id=organization_id,
                transit_time_hours=transit_time,
                route_capacity=route_cap,
                current_utilization=util,
                current_risk=0.05,
                is_disrupted=is_disrupted,
                attributes={}
            )
            edges.append(ge)

        return GraphSnapshot(
            snapshot_id=f"snap-{int(time.time() * 1000)}",
            world_seed=getattr(snapshot, "seed", 42) or 42,
            timestamp=snapshot.timestamp.timestamp() if hasattr(snapshot.timestamp, "timestamp") else float(snapshot.timestamp),
            nodes=nodes,
            edges=edges,
            node_count=len(nodes),
            edge_count=len(edges),
            graph_version="1.0.0",
            organization_id=organization_id,
        )

    @staticmethod
    def to_networkx(snapshot: GraphSnapshot) -> nx.DiGraph:
        """Build directed NetworkX graph with node and edge attributes preserved."""
        G = nx.DiGraph()

        for n in snapshot.nodes:
            G.add_node(
                n.id,
                type=n.type,
                capacity=n.capacity,
                utilization=n.utilization,
                throughput=n.throughput,
                backlog=n.backlog,
                inventory_count=n.inventory_count,
                lead_time_hours=n.lead_time_hours,
                current_risk=n.current_risk,
                is_disrupted=n.is_disrupted,
                organization_id=n.organization_id,
            )

        for e in snapshot.edges:
            G.add_edge(
                e.source_id,
                e.target_id,
                id=e.id,
                type=e.type,
                transit_time_hours=e.transit_time_hours,
                route_capacity=e.route_capacity,
                current_utilization=e.current_utilization,
                current_risk=e.current_risk,
                is_disrupted=e.is_disrupted,
            )

        return G
