"""
FULFILL-X Resilience & Criticality Unit Tests (Phase 8)
Validates Resilience Score calculations, VaR95, CVaR95, stockout probability, and node criticality ranking.
"""
import pytest
from app.services.world import WorldService
from app.simulation.criticality import CriticalityAnalyzer
from app.simulation.metrics import ResilienceMetricsCalculator
from app.simulation.monte_carlo import MonteCarloEngine
from app.simulation.scenario import ScenarioGenerator
from app.simulation.schemas import MonteCarloConfig, SimulationHorizon
from app.simulation.twin import DigitalTwin


def test_resilience_metrics_and_cvar():
    """Verify statistical metrics calculation including VaR95 and CVaR95."""
    world_svc = WorldService()
    snapshot = world_svc.get_snapshot()
    twin = DigitalTwin(snapshot=snapshot, seed=42)

    scenario = ScenarioGenerator(master_seed=42).create_demo_scenario(seed=42)
    mc_cfg = MonteCarloConfig(n_simulations=50, seed=42, horizon=SimulationHorizon.H24, max_workers=2)

    mc_res = MonteCarloEngine(twin=twin, config=mc_cfg).run(scenario=scenario)
    m = mc_res.metrics

    assert 0.0 <= m.resilience_score <= 100.0
    assert m.cvar_cost_95 >= m.var_cost_95
    assert 0.0 <= m.stockout_probability <= 1.0


def test_criticality_analyzer():
    """Verify criticality ranking of network nodes derived from simulation runs."""
    world_svc = WorldService()
    snapshot = world_svc.get_snapshot()
    twin = DigitalTwin(snapshot=snapshot, seed=42)

    scenario = ScenarioGenerator(master_seed=42).create_demo_scenario(seed=42)
    mc_cfg = MonteCarloConfig(n_simulations=50, seed=42, horizon=SimulationHorizon.H24, max_workers=2)
    mc_res = MonteCarloEngine(twin=twin, config=mc_cfg).run(scenario=scenario)

    analyzer = CriticalityAnalyzer(snapshot=snapshot, mc_result=mc_res)
    criticality = analyzer.analyze()

    assert len(criticality) == len(snapshot.nodes)
    assert criticality[0].criticality_rank == 1
    assert criticality[0].criticality_score >= criticality[-1].criticality_score
