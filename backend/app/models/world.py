"""
FULFILL-X World Domain Graph Model
In-memory graph topology, adjacency operations, and state container (P02-002)
"""
from collections import defaultdict
from datetime import datetime, timezone
from typing import Self
from uuid import UUID, uuid4

from app.schemas.world import (
    WorldNode,
    WorldEdge,
    NodeType,
    EdgeType,
    Product,
    InventoryRecord,
    Order,
    Shipment,
    Commitment,
    WorldStateSnapshot,
    NodeRiskScores,
)


class SupplyNetworkGraph:
    """
    Authoritative Graph representation of the FULFILL-X Supply Network.
    Encapsulates nodes, edges, adjacency indices, catalog entities, and snapshot serialization.
    """

    def __init__(self, snapshot_id: UUID | None = None):
        self.snapshot_id: UUID = snapshot_id or uuid4()
        self.created_at: datetime = datetime.now(timezone.utc)
        self.updated_at: datetime = datetime.now(timezone.utc)

        # Entity Storage Maps
        self.nodes: dict[str, WorldNode] = {}
        self.edges: dict[str, WorldEdge] = {}
        self.products: dict[str, Product] = {}
        self.inventory: dict[str, InventoryRecord] = {}
        self.orders: dict[str, Order] = {}
        self.shipments: dict[str, Shipment] = {}
        self.commitments: dict[str, Commitment] = {}

        # Adjacency Indexes for fast lookup
        self._outgoing_edges: dict[str, list[str]] = defaultdict(list)
        self._incoming_edges: dict[str, list[str]] = defaultdict(list)
        self._nodes_by_type: dict[NodeType, list[str]] = defaultdict(list)

    def add_node(self, node: WorldNode) -> None:
        """Add or update a node in the graph."""
        if node.id in self.nodes:
            old_type = self.nodes[node.id].type
            if old_type in self._nodes_by_type and node.id in self._nodes_by_type[old_type]:
                self._nodes_by_type[old_type].remove(node.id)

        self.nodes[node.id] = node
        self._nodes_by_type[node.type].append(node.id)
        self.updated_at = datetime.now(timezone.utc)

    def add_edge(self, edge: WorldEdge) -> None:
        """Add an edge connecting source and target nodes."""
        if edge.source_node_id not in self.nodes:
            raise ValueError(f"Source node '{edge.source_node_id}' does not exist in graph")
        if edge.target_node_id not in self.nodes:
            raise ValueError(f"Target node '{edge.target_node_id}' does not exist in graph")

        self.edges[edge.id] = edge
        if edge.id not in self._outgoing_edges[edge.source_node_id]:
            self._outgoing_edges[edge.source_node_id].append(edge.id)
        if edge.id not in self._incoming_edges[edge.target_node_id]:
            self._incoming_edges[edge.target_node_id].append(edge.id)

        self.updated_at = datetime.now(timezone.utc)

    def add_product(self, product: Product) -> None:
        self.products[product.id] = product

    def add_inventory_record(self, record: InventoryRecord) -> None:
        self.inventory[record.id] = record

    def add_order(self, order: Order) -> None:
        self.orders[order.id] = order

    def add_shipment(self, shipment: Shipment) -> None:
        self.shipments[shipment.id] = shipment

    def add_commitment(self, commitment: Commitment) -> None:
        self.commitments[commitment.id] = commitment

    def get_node(self, node_id: str) -> WorldNode | None:
        return self.nodes.get(node_id)

    def get_edge(self, edge_id: str) -> WorldEdge | None:
        return self.edges.get(edge_id)

    def get_nodes_by_type(self, node_type: NodeType) -> list[WorldNode]:
        node_ids = self._nodes_by_type.get(node_type, [])
        return [self.nodes[nid] for nid in node_ids if nid in self.nodes]

    def get_outgoing_edges(self, node_id: str) -> list[WorldEdge]:
        edge_ids = self._outgoing_edges.get(node_id, [])
        return [self.edges[eid] for eid in edge_ids if eid in self.edges]

    def get_incoming_edges(self, node_id: str) -> list[WorldEdge]:
        edge_ids = self._incoming_edges.get(node_id, [])
        return [self.edges[eid] for eid in edge_ids if eid in self.edges]

    def get_neighbor_nodes(self, node_id: str) -> list[WorldNode]:
        outgoing = [self.nodes[e.target_node_id] for e in self.get_outgoing_edges(node_id) if e.target_node_id in self.nodes]
        incoming = [self.nodes[e.source_node_id] for e in self.get_incoming_edges(node_id) if e.source_node_id in self.nodes]
        return list({n.id: n for n in outgoing + incoming}.values())

    def calculate_network_health(self) -> float:
        """
        Calculate overall network health index in [0,1].
        1.0 = All nodes non-disrupted with 0 risk.
        0.0 = Severe systemic failure.
        """
        if not self.nodes:
            return 1.0
        
        disrupted_count = sum(1 for n in self.nodes.values() if n.is_disrupted)
        avg_risk = sum(n.risk_scores.composite for n in self.nodes.values()) / len(self.nodes)
        
        health = (1.0 - avg_risk) * (1.0 - (disrupted_count / len(self.nodes)))
        return max(0.0, min(1.0, round(health, 4)))

    def calculate_total_risk_score(self) -> float:
        """Calculate weighted composite risk score across network."""
        if not self.nodes:
            return 0.0
        avg_risk = sum(n.risk_scores.composite for n in self.nodes.values()) / len(self.nodes)
        return round(avg_risk, 4)

    def to_snapshot(self) -> WorldStateSnapshot:
        """Serialize current in-memory graph to immutable Pydantic WorldStateSnapshot."""
        return WorldStateSnapshot(
            snapshot_id=self.snapshot_id,
            timestamp=self.updated_at,
            nodes=list(self.nodes.values()),
            edges=list(self.edges.values()),
            products=list(self.products.values()),
            inventory=list(self.inventory.values()),
            orders=list(self.orders.values()),
            shipments=list(self.shipments.values()),
            commitments=list(self.commitments.values()),
            network_health_score=self.calculate_network_health(),
            total_risk_score=self.calculate_total_risk_score(),
        )

    def to_snapshot_model(self) -> WorldStateSnapshot:
        return self.to_snapshot()

    @classmethod
    def from_snapshot(cls, snapshot: WorldStateSnapshot) -> Self:
        """Reconstruct SupplyNetworkGraph from WorldStateSnapshot."""
        graph = cls(snapshot_id=snapshot.snapshot_id)
        for node in snapshot.nodes:
            graph.add_node(node)
        for edge in snapshot.edges:
            graph.add_edge(edge)
        for product in snapshot.products:
            graph.add_product(product)
        for inv in snapshot.inventory:
            graph.add_inventory_record(inv)
        for order in snapshot.orders:
            graph.add_order(order)
        for ship in snapshot.shipments:
            graph.add_shipment(ship)
        for comm in snapshot.commitments:
            graph.add_commitment(comm)
        graph.updated_at = snapshot.timestamp
        return graph
