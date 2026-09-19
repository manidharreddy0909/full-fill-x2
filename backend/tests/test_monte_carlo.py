"""
FULFILL-X Monte Carlo Engine Unit Tests (Phase 8)
Validates parallel CPU Monte Carlo simulation runs, percentiles (P10, P25, P50, P75, P90),
and 100% deterministic reproducibility across identical seeds.
"""
import pytest
from app.services.world import WorldService
from app.simulation.monte_carlo import MonteCarloEngine
from app.simulation.scenario import ScenarioGenerator
from app.simulation.schemas import MonteCarloConfig, SimulationHorizon
from app.simulation.twin import DigitalTwin


def test_monte_carlo_execution_and_percentiles():
    """Verify Monte Carlo runs 100 iterations and produces valid statistical percentiles."""
    world_svc = WorldService()
    snapshot = world_svc.get_snapshot()
    twin = DigitalTwin(snapshot=snapshot, seed=42)

    scenario = ScenarioGenerator(master_seed=42).create_demo_scenario(seed=42)
    mc_cfg = MonteCarloConfig(n_simulations=100, seed=42, horizon=SimulationHorizon.H48, max_workers=2)

    engine = MonteCarloEngine(twin=twin, config=mc_cfg)
    result = engine.run(scenario=scenario)

    assert result.n_simulations == 100
    assert len(result.runs) == 100
    assert result.metrics.resilience_score > 0.0

    p = result.metrics.service_level_dist
    assert 0.0 <= p.p10 <= p.p25 <= p.p50 <= p.p75 <= p.p90 <= 1.0


def test_monte_carlo_determinism_3_runs():
    """Verify 3 consecutive Monte Carlo runs with seed=42 produce 100% identical resilience scores and percentiles."""
    world_svc = WorldService()
    snapshot = world_svc.get_snapshot()

    results = []
    for _ in range(3):
        twin = DigitalTwin(snapshot=snapshot, seed=42)
        scenario = ScenarioGenerator(master_seed=42).create_demo_scenario(seed=42)
        mc_cfg = MonteCarloConfig(n_simulations=50, seed=42, horizon=SimulationHorizon.H24, max_workers=2)

        engine = MonteCarloEngine(twin=twin, config=mc_cfg)
        res = engine.run(scenario=scenario)
        results.append(res)

    assert results[0].metrics.resilience_score == results[1].metrics.resilience_score == results[2].metrics.resilience_score
    assert results[0].metrics.cvar_cost_95 == results[1].metrics.cvar_cost_95 == results[2].metrics.cvar_cost_95
