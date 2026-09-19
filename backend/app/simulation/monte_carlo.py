"""
FULFILL-X Parallelized Monte Carlo Engine (Phase 8)
Executes N (100 to 5,000) seeded simulation iterations using CPU worker parallelism.
Produces deterministic, reproducible MonteCarloResult data with statistical distributions.
"""
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
import os
import time
from typing import List, Optional
from uuid import uuid4

from app.simulation.metrics import ResilienceMetricsCalculator
from app.simulation.runner import SimulationRunner
from app.simulation.schemas import (
    MonteCarloConfig,
    MonteCarloResult,
    ResilienceCurve,
    ResilienceCurvePoint,
    ScenarioConfig,
    SimulationRunResult,
)
from app.simulation.twin import DigitalTwin


def _execute_single_sim_run(args: tuple) -> SimulationRunResult:
    """Top-level worker function for parallel process execution."""
    twin, scenario, seed, horizon_hours = args
    runner = SimulationRunner(twin=twin, scenario=scenario, seed=seed)
    return runner.run(horizon_hours=horizon_hours)


class MonteCarloEngine:
    """
    CPU-bound Monte Carlo simulation engine.
    """

    def __init__(self, twin: DigitalTwin, config: Optional[MonteCarloConfig] = None):
        self.twin = twin
        self.config = config or MonteCarloConfig()

    def run(self, scenario: ScenarioConfig) -> MonteCarloResult:
        """
        Execute N Monte Carlo simulations deterministically.
        """
        start_time = time.time()
        n_sims = max(10, min(5000, self.config.n_simulations))
        master_seed = self.config.seed
        horizon_hours = self.config.horizon.to_hours()
        max_workers = max(1, min(os.cpu_count() or 4, self.config.max_workers))

        # Generate deterministic seeds for each run: run_seed = master_seed + i * 10007
        run_args = [
            (self.twin, scenario, (master_seed + i * 10007) & 0x7FFFFFFF, horizon_hours)
            for i in range(n_sims)
        ]

        runs: List[SimulationRunResult] = []

        # Execute using ThreadPoolExecutor for fast in-process CPU execution without pickling overhead
        if max_workers > 1 and n_sims >= 50:
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = [executor.submit(_execute_single_sim_run, arg) for arg in run_args]
                for future in as_completed(futures):
                    runs.append(future.result())
        else:
            for arg in run_args:
                runs.append(_execute_single_sim_run(arg))

        # Sort runs by seed for deterministic ordering
        runs.sort(key=lambda r: r.seed)

        exec_time = time.time() - start_time

        # Calculate resilience metrics distribution
        calc = ResilienceMetricsCalculator(runs=runs)
        res_metrics = calc.calculate_metrics()

        # Build aggregated resilience curve timeline across step outcomes
        curve_points: List[ResilienceCurvePoint] = []
        if runs and runs[0].step_outcomes:
            num_steps = len(runs[0].step_outcomes)
            for h in range(num_steps):
                step_svcs = [r.step_outcomes[h].service_level for r in runs if h < len(r.step_outcomes)]
                step_bklgs = [r.step_outcomes[h].backlog for r in runs if h < len(r.step_outcomes)]
                step_disrs = [r.step_outcomes[h].active_disruptions_count for r in runs if h < len(r.step_outcomes)]

                avg_svc = sum(step_svcs) / len(step_svcs) if step_svcs else 1.0
                avg_bklg = sum(step_bklgs) / len(step_bklgs) if step_bklgs else 0.0
                avg_disr = int(sum(step_disrs) / len(step_disrs)) if step_disrs else 0

                curve_points.append(
                    ResilienceCurvePoint(
                        step_hour=h,
                        service_level=avg_svc,
                        inventory_level=max(0.0, avg_svc - 0.05),
                        backlog=avg_bklg,
                        risk_score=min(1.0, (1.0 - avg_svc) + avg_disr * 0.1),
                        disrupted_count=avg_disr,
                    )
                )

        res_curve = ResilienceCurve(points=curve_points)

        return MonteCarloResult(
            mc_id=f"mc-{uuid4().hex[:8]}",
            twin_id=self.twin.twin_id,
            scenario_id=scenario.scenario_id,
            n_simulations=n_sims,
            seed=master_seed,
            horizon_hours=horizon_hours,
            execution_time_sec=round(exec_time, 4),
            metrics=res_metrics,
            resilience_curve=res_curve,
            runs=runs,
        )
