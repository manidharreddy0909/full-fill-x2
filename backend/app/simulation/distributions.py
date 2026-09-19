"""
FULFILL-X Bounded Random Distribution Engine (Phase 8)
Generates seeded, reproducible, domain-bounded probability distributions for Monte Carlo simulation.
Supports Normal, Lognormal, Triangular, Uniform, and Categorical distributions.
"""
import math
import numpy as np
from typing import Any, Dict, List, Optional
from app.simulation.schemas import DistributionType, SimulationDistribution


class BoundedDistribution:
    """
    Deterministic random distribution generator bounded by domain constraints.
    """

    def __init__(self, config: SimulationDistribution):
        self.config = config
        self.rng = np.random.RandomState(config.seed)

    @classmethod
    def create_demand_distribution(cls, mean: float = 100.0, std: float = 15.0, seed: int = 42) -> "BoundedDistribution":
        cfg = SimulationDistribution(
            distribution_type=DistributionType.NORMAL,
            parameters={"mean": mean, "std": std},
            min_value=0.0,
            max_value=mean * 3.0,
            seed=seed,
        )
        return cls(cfg)

    @classmethod
    def create_recovery_distribution(cls, min_hours: float = 6.0, mode_hours: float = 24.0, max_hours: float = 72.0, seed: int = 42) -> "BoundedDistribution":
        cfg = SimulationDistribution(
            distribution_type=DistributionType.TRIANGULAR,
            parameters={"left": min_hours, "mode": mode_hours, "right": max_hours},
            min_value=min_hours,
            max_value=max_hours,
            seed=seed,
        )
        return cls(cfg)

    @classmethod
    def create_delay_distribution(cls, mean_delay: float = 4.0, std_delay: float = 2.0, seed: int = 42) -> "BoundedDistribution":
        cfg = SimulationDistribution(
            distribution_type=DistributionType.LOGNORMAL,
            parameters={"mean": mean_delay, "std": std_delay},
            min_value=0.0,
            max_value=48.0,
            seed=seed,
        )
        return cls(cfg)

    def sample(self, size: int = 1) -> np.ndarray:
        """Draw samples bounded strictly by min_value and max_value."""
        t = self.config.distribution_type
        params = self.config.parameters
        min_v = self.config.min_value
        max_v = self.config.max_value

        if t == DistributionType.NORMAL:
            mean = params.get("mean", 0.0)
            std = params.get("std", 1.0)
            raw = self.rng.normal(loc=mean, scale=std, size=size)
        elif t == DistributionType.LOGNORMAL:
            mean = params.get("mean", 1.0)
            std = params.get("std", 0.5)
            # convert lognormal mu and sigma
            sigma2 = math.log(1.0 + (std / max(mean, 1e-6)) ** 2)
            mu = math.log(max(mean, 1e-6)) - 0.5 * sigma2
            sigma = math.sqrt(max(sigma2, 1e-6))
            raw = self.rng.lognormal(mean=mu, sigma=sigma, size=size)
        elif t == DistributionType.TRIANGULAR:
            left = params.get("left", min_v)
            mode = params.get("mode", (min_v + max_v) / 2.0)
            right = params.get("right", max_v)
            raw = self.rng.triangular(left=left, mode=mode, right=right, size=size)
        elif t == DistributionType.UNIFORM:
            low = params.get("low", min_v)
            high = params.get("high", max_v)
            raw = self.rng.uniform(low=low, high=high, size=size)
        elif t == DistributionType.CATEGORICAL:
            probs = params.get("probabilities", [0.5, 0.5])
            vals = params.get("values", [min_v, max_v])
            raw = self.rng.choice(vals, p=probs, size=size)
        else:
            raw = self.rng.uniform(low=min_v, high=max_v, size=size)

        return np.clip(raw, min_v, max_v)

    def sample_one(self) -> float:
        return float(self.sample(size=1)[0])
