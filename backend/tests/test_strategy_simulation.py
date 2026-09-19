"""
FULFILL-X Mitigation Strategy Simulation Unit Tests (Phase 8)
Validates candidate strategy interventions, Baseline vs Candidate comparison matrix, and robust plan selection.
"""
import pytest
from app.services.world import WorldService
from app.simulation.comparison import RobustStrategyAnalyzer
from app.simulation.scenario import ScenarioGenerator
from app.simulation.schemas import (
    MonteCarloConfig,
    SimulationHorizon,
    StrategyAction,
    StrategyConfig,
)
from app.simulation.twin import DigitalTwin


def test_strategy_comparison():
    """Verify comparison matrix between Baseline and candidate mitigation strategies."""
    world_svc = WorldService()
    snapshot = world_svc.get_snapshot()
    twin = DigitalTwin(snapshot=snapshot, seed=42)

    scenario = ScenarioGenerator(master_seed=42).create_demo_scenario(seed=42)
    mc_cfg = MonteCarloConfig(n_simulations=50, seed=42, horizon=SimulationHorizon.H24, max_workers=2)

    strat_a = StrategyConfig(
        strategy_id="strat-inv-increase",
        name="Strategy A: Increase Safety Stock",
        actions=[
            StrategyAction(
                type="SAFETY_STOCK",
                target="ALL",
                parameters={"multiplier": 2.0},
            )
        ],
    )

    strat_b = StrategyConfig(
        strategy_id="strat-alternate-sup",
        name="Strategy B: Activate Alternate Supplier",
        actions=[
            StrategyAction(
                type="ALTERNATE_SUPPLIER",
                target="sup-001",
                parameters={},
            )
        ],
    )

    analyzer = RobustStrategyAnalyzer(twin=twin, scenario=scenario, mc_config=mc_cfg)
    result = analyzer.compare_strategies([strat_a, strat_b])

    assert result.baseline.strategy_id == "baseline"
    assert len(result.candidates) == 2
    assert result.recommended_strategy_id in ("baseline", "strat-inv-increase", "strat-alternate-sup")
    assert "strat-inv-increase" in result.trade_offs
