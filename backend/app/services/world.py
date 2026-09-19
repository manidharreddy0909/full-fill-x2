"""
FULFILL-X World Service Layer
Business logic bridging API and WorldRepository (P02-005)
"""
from typing import Optional
from app.repository.world import WorldRepository
from app.schemas.world import (
    WorldStateSnapshot,
    WorldNode,
    WorldEdge,
    NodeType,
    WorldSummary,
)


class WorldService:
    """
    Service layer providing clean API interfaces to the World Model.
    Exposes domain queries, graph transformations, seeding, and summaries.
    """

    def __init__(self, repo: WorldRepository | None = None):
        self.repo: WorldRepository = repo or WorldRepository.get_instance()

    def get_snapshot(self) -> WorldStateSnapshot:
        """Fetch current world state snapshot."""
        return self.repo.get_snapshot()

    def get_node(self, node_id: str) -> Optional[WorldNode]:
        """Fetch single node by ID."""
        return self.repo.get_node(node_id)

    def get_edge(self, edge_id: str) -> Optional[WorldEdge]:
        """Fetch single edge by ID."""
        return self.repo.get_edge(edge_id)

    def get_nodes_by_type(self, node_type: NodeType) -> list[WorldNode]:
        """Fetch nodes by type."""
        return self.repo.get_nodes_by_type(node_type)

    def get_summary(self) -> WorldSummary:
        """Fetch network summary metrics."""
        return self.repo.get_summary()

    def seed_world(self, preset: str = "healthy", seed: int = 42) -> WorldStateSnapshot:
        """Seed world graph with synthetic data."""
        return self.repo.seed_world(preset=preset, seed=seed)

    def reset_world(self) -> WorldStateSnapshot:
        """Reset world graph back to baseline snapshot."""
        return self.repo.reset_world()

    def get_graph_layout(self) -> dict:
        """Expose lightweight graph representation for frontend visualizers."""
        snapshot = self.get_snapshot()
        return {
            "snapshot_id": str(snapshot.snapshot_id),
            "nodes": [
                {
                    "id": n.id,
                    "type": n.type.value,
                    "name": n.name,
                    "position": {"x": n.position.x, "y": n.position.y, "z": n.position.z},
                    "risk_composite": n.risk_scores.composite,
                    "is_disrupted": n.is_disrupted,
                }
                for n in snapshot.nodes
            ],
            "edges": [
                {
                    "id": e.id,
                    "source": e.source_node_id,
                    "target": e.target_node_id,
                    "type": e.type.value,
                    "load": e.load,
                    "is_disrupted": e.is_disrupted,
                }
                for e in snapshot.edges
            ],
        }
