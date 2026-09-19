"""
FULFILL-X Scenario Generator & Distributions Unit Tests (Phase 8)
Validates scenario generation and bounded distribution random variable generation.
"""
import pytest
from app.simulation.distributions import BoundedDistribution
from app.simulation.scenario import ScenarioGenerator
from app.simulation.schemas import DistributionType, SimulationDistribution


def test_bounded_distributions():
    """Verify generated random samples are strictly bounded within min_value and max_value."""
    cfg = SimulationDistribution(
        distribution_type=DistributionType.NORMAL,
        parameters={"mean": 50.0, "std": 10.0},
        min_value=10.0,
        max_value=90.0,
        seed=42,
    )
    dist = BoundedDistribution(cfg)
    samples = dist.sample(size=100)

    assert len(samples) == 100
    assert min(samples) >= 10.0
    assert max(samples) <= 90.0


def test_scenario_generator():
    """Verify deterministic scenario generation from seed."""
    gen = ScenarioGenerator(master_seed=42)
    single_scn = gen.create_single_disruption(target_id="sup-001", seed=42)
    assert len(single_scn.events) == 1
    assert single_scn.events[0].target == "sup-001"

    cmp_scn = gen.create_compound_disruption(demand_shock_pct=0.5, seed=42)
    assert len(cmp_scn.events) == 3
    assert cmp_scn.demand_shock_pct == 0.5
