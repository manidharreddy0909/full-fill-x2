"""
FULFILL-X World State Repository
Authoritative thread-safe state store for SupplyNetworkGraph (P02-004)
"""
import threading
from typing import Optional
from app.generator.synthetic import SyntheticDataGenerator
from app.models.world import SupplyNetworkGraph
from app.schemas.world import (
    WorldNode,
    WorldEdge,
    NodeType,
    EdgeType,
    WorldStateSnapshot,
    WorldSummary,
)


class WorldRepository:
    """
    Authoritative state store managing active SupplyNetworkGraph instances.
    Supports atomic snapshotting, re-seeding, resetting, and graph queries.
    """

    _instance: Optional["WorldRepository"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self, seed: int = 42, preset: str = "healthy"):
        self.lock = threading.Lock()
        self.current_seed: int = seed
        self.current_preset: str = preset
        self.graph: SupplyNetworkGraph = SyntheticDataGenerator(seed=seed, preset=preset).generate()
        self.last_seeded_snapshot: WorldStateSnapshot = self.graph.to_snapshot()

    @classmethod
    def get_instance(cls, seed: int = 42, preset: str = "healthy") -> "WorldRepository":
        """Get or initialize singleton repository instance."""
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls(seed=seed, preset=preset)
            return cls._instance

    def seed_world(self, preset: str = "healthy", seed: int = 42) -> WorldStateSnapshot:
        """Seed world graph with synthetic data and update reference snapshot."""
        with self.lock:
            self.current_seed = seed
            self.current_preset = preset
            self.graph = SyntheticDataGenerator(seed=seed, preset=preset).generate()
            self.last_seeded_snapshot = self.graph.to_snapshot()
            return self.graph.to_snapshot()

    def reset_world(self) -> WorldStateSnapshot:
        """Reset world graph back to last seeded snapshot state."""
        with self.lock:
            self.graph = SupplyNetworkGraph.from_snapshot(self.last_seeded_snapshot)
            return self.graph.to_snapshot()

    def get_snapshot(self) -> WorldStateSnapshot:
        """Get immutable WorldStateSnapshot."""
        with self.lock:
            return self.graph.to_snapshot()

    def get_node(self, node_id: str) -> Optional[WorldNode]:
        """Get single node by ID."""
        with self.lock:
            return self.graph.get_node(node_id)

    def get_edge(self, edge_id: str) -> Optional[WorldEdge]:
        """Get single edge by ID."""
        with self.lock:
            return self.graph.get_edge(edge_id)

    def get_nodes_by_type(self, node_type: NodeType) -> list[WorldNode]:
        """Get list of nodes by NodeType."""
        with self.lock:
            return self.graph.get_nodes_by_type(node_type)

    def get_summary(self) -> WorldSummary:
        """Compute aggregated WorldSummary metrics."""
        with self.lock:
            nodes = list(self.graph.nodes.values())
            edges = list(self.graph.edges.values())

            suppliers = sum(1 for n in nodes if n.type == NodeType.SUPPLIER)
            warehouses = sum(1 for n in nodes if n.type == NodeType.WAREHOUSE)
            fcs = sum(1 for n in nodes if n.type == NodeType.FULFILLMENT_CENTER)
            czs = sum(1 for n in nodes if n.type == NodeType.CUSTOMER_ZONE)
            ports = sum(1 for n in nodes if n.type == NodeType.PORT)

            routes = sum(1 for e in edges if e.type == EdgeType.ROUTE)
            dependencies = sum(1 for e in edges if e.type == EdgeType.DEPENDENCY)

            total_inv = sum(inv.quantity for inv in self.graph.inventory.values())
            utilizations = [n.utilization for n in nodes if n.utilization is not None]
            avg_util = sum(utilizations) / len(utilizations) if utilizations else 0.70

            disrupted_nodes = sum(1 for n in nodes if n.is_disrupted)
            disrupted_edges = sum(1 for e in edges if e.is_disrupted)

            return WorldSummary(
                total_nodes=len(nodes),
                suppliers_count=suppliers,
                warehouses_count=warehouses,
                fulfillment_centers_count=fcs,
                customer_zones_count=czs,
                ports_count=ports,
                total_edges=len(edges),
                total_routes_count=routes,
                total_dependencies_count=dependencies,
                total_inventory_units=total_inv,
                average_capacity_utilization=round(avg_util, 4),
                disrupted_nodes_count=disrupted_nodes,
                disrupted_edges_count=disrupted_edges,
                network_health_score=self.graph.calculate_network_health(),
            )
