"""
FULFILL-X Digital Twin Dynamics (Phase 8)
Implements discrete-time state transitions (1h step resolution).
Updates inventory flow, capacity, demand evolution, backlog, service level,
transport transit, and recovery dynamics across simulation hours.
"""
from typing import Dict, List, Tuple
from app.simulation.distributions import BoundedDistribution
from app.simulation.schemas import (
    DigitalTwinState,
    DisruptionEvent,
    SimulationStepOutcome,
)


class DigitalTwinDynamics:
    """
    Deterministic transition dynamics for discrete-time simulation.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.demand_dist = BoundedDistribution.create_demand_distribution(mean=100.0, std=15.0, seed=seed)
        self.recovery_dist = BoundedDistribution.create_recovery_distribution(seed=seed)

    def step(
        self,
        state: DigitalTwinState,
        active_events: List[DisruptionEvent],
        demand_shock_pct: float = 0.0,
        recovery_multiplier: float = 1.0,
    ) -> SimulationStepOutcome:
        """
        Advance simulation state by 1 discrete step (1 hour).
        Mutates the isolated DigitalTwinState instance in place.
        """
        step = state.step
        state.active_disruptions = active_events

        # 1. Apply active disruption events
        disrupted_node_ids = set()
        for evt in active_events:
            if evt.start_time <= step < (evt.start_time + evt.duration):
                target = evt.target
                # Target node or matching prefix/all
                for n_id, node in state.nodes.items():
                    if target == n_id or target == "ALL" or (target == node.node_type):
                        node.is_disrupted = True
                        node.disruption_multiplier = evt.capacity_multiplier
                        node.current_capacity = node.max_capacity * evt.capacity_multiplier
                        disrupted_node_ids.add(n_id)

                for e_id, edge in state.edges.items():
                    if target == e_id or target == edge.source_id or target == edge.target_id:
                        edge.is_disrupted = True

        # Check recovery for nodes no longer in active events
        for n_id, node in state.nodes.items():
            if n_id not in disrupted_node_ids and node.is_disrupted:
                # Node begins recovering
                recovery_speed = 0.1 / max(recovery_multiplier, 0.1)
                node.disruption_multiplier = min(1.0, node.disruption_multiplier + recovery_speed)
                node.current_capacity = node.max_capacity * node.disruption_multiplier
                if node.disruption_multiplier >= 0.99:
                    node.is_disrupted = False
                    node.disruption_multiplier = 1.0
                    node.current_capacity = node.max_capacity

        # 2. Demand evolution across fulfillment centers and customer zones
        step_demand = 0.0
        step_fulfilled = 0.0
        step_backlog = 0.0
        step_cost = 0.0

        for n_id, node in state.nodes.items():
            # Demand occurs primarily at FC / Customer Zones / Warehouses
            if node.node_type in ("CUSTOMER_ZONE", "FULFILLMENT_CENTER", "WAREHOUSE"):
                base_demand = self.demand_dist.sample_one() * (1.0 + demand_shock_pct)
                total_req = base_demand + node.backlog
                step_demand += base_demand

                # Inbound replenishment if inventory low and not disrupted
                if node.inventory < node.max_capacity * 0.3 and not node.is_disrupted:
                    replenish = min(node.max_capacity * 0.2, node.current_capacity)
                    node.inventory += replenish

                # Available supply for fulfillment
                fulfillable = min(total_req, node.inventory, node.current_capacity)
                node.inventory -= fulfillable
                unfulfilled = total_req - fulfillable

                node.backlog = unfulfilled
                step_fulfilled += fulfillable
                step_backlog += unfulfilled

                # Accrue cost: holding cost + backlog/stockout penalty + disruption penalty
                holding_cost = node.inventory * 0.5
                stockout_cost = unfulfilled * 15.0
                disruption_penalty = (1.0 - node.disruption_multiplier) * 500.0
                step_cost += holding_cost + stockout_cost + disruption_penalty

        # Service level for this step
        service_lvl = step_fulfilled / step_demand if step_demand > 0 else 1.0
        service_lvl = max(0.0, min(1.0, service_lvl))

        # Update cumulative state metrics
        state.step += 1
        state.total_demand += step_demand
        state.fulfilled_demand += step_fulfilled
        state.backlog = step_backlog
        state.total_cost += step_cost
        state.disrupted_nodes_count = sum(1 for n in state.nodes.values() if n.is_disrupted)

        node_disr_map = {n_id: n.disruption_multiplier for n_id, n in state.nodes.items()}
        avg_cap_util = sum(n.current_capacity / n.max_capacity for n in state.nodes.values()) / max(len(state.nodes), 1)

        return SimulationStepOutcome(
            step=step,
            fulfilled_demand=step_fulfilled,
            total_demand=step_demand,
            service_level=service_lvl,
            backlog=step_backlog,
            active_disruptions_count=len(active_events),
            capacity_utilization=avg_cap_util,
            total_cost=step_cost,
            node_disruptions=node_disr_map,
        )
