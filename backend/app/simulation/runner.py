"""
FULFILL-X Single Simulation Path Runner (Phase 8)
Executes discrete step transitions on an isolated DigitalTwinState.
Calculates overall run metrics including TTR, TTF, service level, stockouts, and backlog.
"""
from typing import Optional
from uuid import uuid4

from app.simulation.dynamics import DigitalTwinDynamics
from app.simulation.schemas import (
    ScenarioConfig,
    SimulationRunResult,
    SimulationStepOutcome,
)
from app.simulation.twin import DigitalTwin


class SimulationRunner:
    """
    Runner for executing a single trajectory simulation.
    """

    def __init__(self, twin: DigitalTwin, scenario: ScenarioConfig, seed: Optional[int] = None):
        self.twin = twin
        self.scenario = scenario
        self.seed = seed if seed is not None else scenario.seed

    def run(self, horizon_hours: int = 72) -> SimulationRunResult:
        """
        Execute simulation over horizon_hours.
        Returns immutable SimulationRunResult.
        """
        state = self.twin.create_isolated_state(max_steps=horizon_hours)
        dynamics = DigitalTwinDynamics(seed=self.seed)

        step_outcomes: list[SimulationStepOutcome] = []
        first_failure_step: Optional[int] = None
        max_disrupted = 0
        stockout_occurred = False
        recovery_step: Optional[int] = None

        disruption_active_history = []

        for h in range(horizon_hours):
            # Gather active disruption events for step h
            active_events = [
                evt
                for evt in self.scenario.events
                if evt.start_time <= h < (evt.start_time + evt.duration)
            ]
            disruption_active_history.append(len(active_events) > 0)

            outcome = dynamics.step(
                state=state,
                active_events=active_events,
                demand_shock_pct=self.scenario.demand_shock_pct,
                recovery_multiplier=self.scenario.recovery_delay_multiplier,
            )
            step_outcomes.append(outcome)

            if outcome.service_level < 0.85 and first_failure_step is None:
                first_failure_step = h

            if state.disrupted_nodes_count > max_disrupted:
                max_disrupted = state.disrupted_nodes_count

            if outcome.backlog > 0:
                stockout_occurred = True

        # Calculate Time-to-Recovery (TTR)
        # TTR = step hour after last disruption where service level >= 90%
        last_disr_step = 0
        for idx, has_disr in enumerate(disruption_active_history):
            if has_disr:
                last_disr_step = idx

        recovery_time = 0.0
        if any(disruption_active_history):
            for h in range(last_disr_step, horizon_hours):
                if step_outcomes[h].service_level >= 0.90:
                    recovery_time = float(h - last_disr_step)
                    break
            else:
                recovery_time = float(horizon_hours - last_disr_step)

        total_dem = sum(o.total_demand for o in step_outcomes)
        total_ful = sum(o.fulfilled_demand for o in step_outcomes)
        overall_service = total_ful / total_dem if total_dem > 0 else 1.0
        overall_service = max(0.0, min(1.0, overall_service))

        return SimulationRunResult(
            run_id=f"sim-{uuid4().hex[:8]}",
            twin_id=self.twin.twin_id,
            scenario_id=self.scenario.scenario_id,
            seed=self.seed,
            horizon_hours=horizon_hours,
            step_outcomes=step_outcomes,
            overall_service_level=overall_service,
            total_backlog=state.backlog,
            total_cost=state.total_cost,
            recovery_time_hours=recovery_time,
            time_to_failure_hours=float(first_failure_step) if first_failure_step is not None else None,
            max_disrupted_nodes=max_disrupted,
            stockout_occurred=stockout_occurred,
        )
