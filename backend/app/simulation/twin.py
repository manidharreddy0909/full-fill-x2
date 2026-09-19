"""
FULFILL-X Digital Twin Executable Snapshot (Phase 8)
Creates isolated, versioned digital twin snapshots from production World Model state.
Guarantees snapshot isolation - production World Model is NEVER mutated.
"""
import copy
from datetime import datetime, timezone
from typing import Dict, Optional
from uuid import uuid4

from app.schemas.world import WorldStateSnapshot
from app.simulation.schemas import (
    DigitalTwinState,
    EdgeSimState,
    NodeSimState,
)


class DigitalTwin:
    """
    Executable Digital Twin simulation snapshot representation.
    """

    def __init__(
        self,
        snapshot: WorldStateSnapshot,
        twin_id: Optional[str] = None,
        twin_version: str = "1.0.0",
        seed: int = 42,
        scenario_id: str = "baseline",
    ):
        self.snapshot = snapshot
        self.world_snapshot_id = str(snapshot.snapshot_id)
        self.graph_snapshot_id = f"GS-{snapshot.snapshot_id.hex[:6]}"
        self.twin_id = twin_id or f"DT-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid4().hex[:6]}"
        self.twin_version = twin_version
        self.seed = seed
        self.scenario_id = scenario_id

        # Deep copy nodes and edges to enforce complete isolation
        nodes_dict: Dict[str, NodeSimState] = {}
        for n in snapshot.nodes:
            cap = n.capacity if n.capacity > 0 else 1000.0
            inv = n.inventory_level * cap
            lead_time = n.lead_time_days * 24.0 if n.lead_time_days else 24.0
            nodes_dict[n.id] = NodeSimState(
                node_id=n.id,
                node_type=n.type.value,
                inventory=inv,
                max_capacity=cap,
                current_capacity=cap * (0.0 if n.is_disrupted else 1.0),
                backlog=0.0,
                lead_time_hours=lead_time,
                is_disrupted=n.is_disrupted,
                disruption_multiplier=0.0 if n.is_disrupted else 1.0,
                risk_score=n.risk_scores.composite,
            )

        edges_dict: Dict[str, EdgeSimState] = {}
        for e in snapshot.edges:
            edges_dict[e.id] = EdgeSimState(
                edge_id=e.id,
                source_id=e.source_node_id,
                target_id=e.target_node_id,
                transit_load=0.0,
                max_capacity=e.capacity if e.capacity else 1000.0,
                is_disrupted=e.is_disrupted,
                delay_hours=e.standard_time_hours if e.standard_time_hours else 0.0,
            )

        self.initial_state = DigitalTwinState(
            twin_id=self.twin_id,
            world_snapshot_id=self.world_snapshot_id,
            graph_snapshot_id=self.graph_snapshot_id,
            twin_version=self.twin_version,
            seed=self.seed,
            scenario_id=self.scenario_id,
            step=0,
            max_steps=72,
            nodes=nodes_dict,
            edges=edges_dict,
            total_demand=0.0,
            fulfilled_demand=0.0,
            backlog=0.0,
            total_cost=0.0,
            disrupted_nodes_count=sum(1 for n in nodes_dict.values() if n.is_disrupted),
            active_disruptions=[],
            production_mutation=False,
            mode="SIMULATION",
        )

    def create_isolated_state(self, max_steps: int = 72) -> DigitalTwinState:
        """Return a fresh, isolated deep-copied simulation state."""
        state_copy = self.initial_state.model_copy(deep=True)
        state_copy.max_steps = max_steps
        return state_copy
