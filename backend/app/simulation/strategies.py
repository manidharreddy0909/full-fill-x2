"""
FULFILL-X Mitigation Strategy Simulator (Phase 8)
Applies intervention actions (inventory increase, alternate supplier, safety stock, rerouting)
to isolated digital twin instances for scenario strategy evaluation.
"""
from typing import List
from app.simulation.schemas import StrategyAction, StrategyConfig
from app.simulation.twin import DigitalTwin


class StrategySimulator:
    """
    Simulator for modifying digital twin initial states based on strategy actions.
    """

    @staticmethod
    def apply_strategy(twin: DigitalTwin, strategy: StrategyConfig) -> DigitalTwin:
        """
        Creates a copy of the twin with strategy action modifications applied to its initial state.
        Guarantees isolated copy execution.
        """
        # Create fresh modified twin instance
        twin_copy = DigitalTwin(
            snapshot=twin.snapshot,
            twin_id=f"{twin.twin_id}-{strategy.strategy_id}",
            seed=twin.seed,
            scenario_id=twin.scenario_id,
        )

        initial_state = twin_copy.initial_state

        for act in strategy.actions:
            target = act.target
            a_type = act.type.upper()
            params = act.parameters

            if a_type == "INVENTORY_INCREASE" or a_type == "SAFETY_STOCK":
                multiplier = float(params.get("multiplier", 1.5))
                for n_id, node in initial_state.nodes.items():
                    if target in (n_id, "ALL", node.node_type):
                        node.inventory *= multiplier
                        node.max_capacity *= multiplier

            elif a_type == "ALTERNATE_SUPPLIER":
                # Restore or protect supplier capacity
                for n_id, node in initial_state.nodes.items():
                    if target in (n_id, node.node_type):
                        node.is_disrupted = False
                        node.disruption_multiplier = 1.0
                        node.current_capacity = node.max_capacity

            elif a_type == "REROUTE" or a_type == "SPLIT_DEMAND":
                # Reduce delay hours or expand capacity on target edges
                for e_id, edge in initial_state.edges.items():
                    if target in (e_id, edge.source_id, edge.target_id):
                        edge.delay_hours = max(0.0, edge.delay_hours * 0.5)
                        edge.max_capacity *= 1.5

        return twin_copy
