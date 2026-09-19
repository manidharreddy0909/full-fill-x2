"""
FULFILL-X Resilience Metrics Calculator (Phase 8)
Computes percentile distributions (P10, P25, P50, P75, P90), Value-at-Risk (VaR95),
Conditional Value-at-Risk (CVaR95), Time-to-Recovery (TTR), Stockout Probability,
and explicit, weighted Resilience Scores across Monte Carlo runs.
"""
import numpy as np
from typing import Dict, List, Optional
from app.simulation.schemas import (
    Percentiles,
    ResilienceMetrics,
    SimulationRunResult,
)


class ResilienceMetricsCalculator:
    """
    Statistical calculator for resilience distributions and risk measures.
    """

    DEFAULT_WEIGHTS: Dict[str, float] = {
        "service": 0.30,
        "recovery": 0.20,
        "cost": 0.15,
        "network": 0.10,
        "customer": 0.10,
        "inventory": 0.05,
        "transportation": 0.05,
        "compound": 0.05,
    }

    def __init__(
        self,
        runs: List[SimulationRunResult],
        custom_weights: Optional[Dict[str, float]] = None,
    ):
        self.runs = runs
        self.weights = custom_weights or dict(self.DEFAULT_WEIGHTS)

    @staticmethod
    def calc_percentiles(values: List[float]) -> Percentiles:
        if not values:
            return Percentiles(p10=0.0, p25=0.0, p50=0.0, p75=0.0, p90=0.0)
        arr = np.array(values)
        return Percentiles(
            p10=float(np.percentile(arr, 10)),
            p25=float(np.percentile(arr, 25)),
            p50=float(np.percentile(arr, 50)),
            p75=float(np.percentile(arr, 75)),
            p90=float(np.percentile(arr, 90)),
        )

    def calculate_metrics(self) -> ResilienceMetrics:
        if not self.runs:
            raise ValueError("Cannot calculate metrics on empty simulation runs list.")

        service_levels = [r.overall_service_level for r in self.runs]
        costs = [r.total_cost for r in self.runs]
        recovery_times = [r.recovery_time_hours for r in self.runs]
        backlogs = [r.total_backlog for r in self.runs]
        affected_nodes = [float(r.max_disrupted_nodes) for r in self.runs]
        ttfs = [r.time_to_failure_hours for r in self.runs if r.time_to_failure_hours is not None]

        service_dist = self.calc_percentiles(service_levels)
        cost_dist = self.calc_percentiles(costs)
        ttr_dist = self.calc_percentiles(recovery_times)
        backlog_dist = self.calc_percentiles(backlogs)
        affected_dist = self.calc_percentiles(affected_nodes)

        # Operational Value-at-Risk (VaR95) and Conditional Value-at-Risk (CVaR95) for cost
        costs_arr = np.array(costs)
        var_cost_95 = float(np.percentile(costs_arr, 95))
        worst_5_pct_costs = costs_arr[costs_arr >= var_cost_95]
        cvar_cost_95 = float(np.mean(worst_5_pct_costs)) if len(worst_5_pct_costs) > 0 else var_cost_95

        # Probabilities
        stockout_count = sum(1 for r in self.runs if r.stockout_occurred)
        stockout_prob = stockout_count / len(self.runs)

        # Domain Resilience Dimensions [0.0, 1.0]
        service_res = service_dist.p50
        recovery_res = max(0.0, min(1.0, 1.0 - (ttr_dist.p90 / max(self.runs[0].horizon_hours, 1.0))))
        cost_res = max(0.0, min(1.0, 1.0 - (cvar_cost_95 / max(cost_dist.p90 * 1.5, 1.0))))
        network_res = max(0.0, min(1.0, 1.0 - (affected_dist.p50 / 10.0)))
        customer_res = service_dist.p10
        inventory_res = 1.0 - stockout_prob
        transport_res = max(0.0, min(1.0, service_dist.p25))
        compound_res = (service_res + recovery_res + inventory_res) / 3.0

        # Weighted aggregate Resilience Score [0.0, 100.0]
        w = self.weights
        resilience_score = 100.0 * (
            w.get("service", 0.30) * service_res
            + w.get("recovery", 0.20) * recovery_res
            + w.get("cost", 0.15) * cost_res
            + w.get("network", 0.10) * network_res
            + w.get("customer", 0.10) * customer_res
            + w.get("inventory", 0.05) * inventory_res
            + w.get("transportation", 0.05) * transport_res
            + w.get("compound", 0.05) * compound_res
        )
        resilience_score = max(0.0, min(100.0, resilience_score))

        ttf_med = float(np.median(ttfs)) if ttfs else None

        return ResilienceMetrics(
            service_level_dist=service_dist,
            cost_dist=cost_dist,
            recovery_time_dist=ttr_dist,
            backlog_dist=backlog_dist,
            affected_nodes_dist=affected_dist,
            service_resilience=round(service_res, 4),
            recovery_resilience=round(recovery_res, 4),
            cost_resilience=round(cost_res, 4),
            network_resilience=round(network_res, 4),
            customer_resilience=round(customer_res, 4),
            inventory_resilience=round(inventory_res, 4),
            transportation_resilience=round(transport_res, 4),
            compound_resilience=round(compound_res, 4),
            resilience_score=round(resilience_score, 2),
            stockout_probability=round(stockout_prob, 4),
            cvar_cost_95=round(cvar_cost_95, 2),
            var_cost_95=round(var_cost_95, 2),
            ttr_p90=round(ttr_dist.p90, 2),
            ttf_median=round(ttf_med, 2) if ttf_med is not None else None,
            weights_used=self.weights,
        )
