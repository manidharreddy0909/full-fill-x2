"""
FULFILL-X Robust Strategy Analyzer (Phase 8)
Executes Monte Carlo simulations across Baseline and Candidate Strategies.
Compares risk distributions and recommends the most robust strategy under uncertainty.
"""
from typing import List, Tuple
from uuid import uuid4

from app.simulation.monte_carlo import MonteCarloEngine
from app.simulation.schemas import (
    MonteCarloConfig,
    ScenarioConfig,
    StrategyComparisonResult,
    StrategyConfig,
    StrategyMetricSummary,
)
from app.simulation.strategies import StrategySimulator
from app.simulation.twin import DigitalTwin


class RobustStrategyAnalyzer:
    """
    Evaluates and compares candidate strategies across Monte Carlo simulation distributions.
    """

    def __init__(self, twin: DigitalTwin, scenario: ScenarioConfig, mc_config: MonteCarloConfig):
        self.twin = twin
        self.scenario = scenario
        self.mc_config = mc_config

    def compare_strategies(self, candidate_strategies: List[StrategyConfig]) -> StrategyComparisonResult:
        """
        Run Monte Carlo for Baseline + each candidate strategy, build metric summaries,
        and select the robust strategy.
        """
        # 1. Baseline Run
        base_mc = MonteCarloEngine(twin=self.twin, config=self.mc_config).run(self.scenario)
        base_m = base_mc.metrics

        baseline_summary = StrategyMetricSummary(
            strategy_id="baseline",
            name="Baseline (No Action)",
            service_p10=round(base_m.service_level_dist.p10, 4),
            service_p50=round(base_m.service_level_dist.p50, 4),
            service_p90=round(base_m.service_level_dist.p90, 4),
            cost_p90=round(base_m.cost_dist.p90, 2),
            ttr_p90=round(base_m.ttr_p90, 2),
            cvar_95=round(base_m.cvar_cost_95, 2),
            stockout_prob=round(base_m.stockout_probability, 4),
            threshold_breach_prob=round(1.0 - base_m.service_resilience, 4),
            robustness_score=round(base_m.resilience_score, 2),
        )

        candidate_summaries: List[StrategyMetricSummary] = []
        trade_offs = {}

        best_strategy_id = "baseline"
        best_robustness = baseline_summary.robustness_score

        # 2. Candidate Runs
        for strat in candidate_strategies:
            strat_twin = StrategySimulator.apply_strategy(self.twin, strat)
            strat_mc = MonteCarloEngine(twin=strat_twin, config=self.mc_config).run(self.scenario)
            sm = strat_mc.metrics

            summary = StrategyMetricSummary(
                strategy_id=strat.strategy_id,
                name=strat.name,
                service_p10=round(sm.service_level_dist.p10, 4),
                service_p50=round(sm.service_level_dist.p50, 4),
                service_p90=round(sm.service_level_dist.p90, 4),
                cost_p90=round(sm.cost_dist.p90, 2),
                ttr_p90=round(sm.ttr_p90, 2),
                cvar_95=round(sm.cvar_cost_95, 2),
                stockout_prob=round(sm.stockout_probability, 4),
                threshold_breach_prob=round(1.0 - sm.service_resilience, 4),
                robustness_score=round(sm.resilience_score, 2),
            )
            candidate_summaries.append(summary)

            # Record trade-off statement
            svc_delta = (summary.service_p50 - baseline_summary.service_p50) * 100
            cost_delta = summary.cost_p90 - baseline_summary.cost_p90
            ttr_delta = summary.ttr_p90 - baseline_summary.ttr_p90

            trade_offs[strat.strategy_id] = (
                f"Service P50 {svc_delta:+.1f}%, P90 Cost ${cost_delta:+,.0f}, "
                f"TTR {ttr_delta:+.1f}h vs Baseline."
            )

            if summary.robustness_score > best_robustness:
                best_robustness = summary.robustness_score
                best_strategy_id = strat.strategy_id

        return StrategyComparisonResult(
            comparison_id=f"cmp-{uuid4().hex[:8]}",
            baseline=baseline_summary,
            candidates=candidate_summaries,
            recommended_strategy_id=best_strategy_id,
            trade_offs=trade_offs,
        )
