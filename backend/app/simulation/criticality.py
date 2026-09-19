"""
FULFILL-X Critical Node Simulation Analyzer (Phase 8)
Evaluates and ranks network nodes based on simulation-derived metrics:
failure probability, expected service loss, cost impact, propagation depth, and downstream customers.
"""
from typing import List
import numpy as np

from app.schemas.world import WorldStateSnapshot
from app.simulation.schemas import CriticalityResult, MonteCarloResult


class CriticalityAnalyzer:
    """
    Ranks node criticality based on Monte Carlo outcome data and graph structure.
    """

    def __init__(self, snapshot: WorldStateSnapshot, mc_result: MonteCarloResult):
        self.snapshot = snapshot
        self.mc_result = mc_result

    def analyze(self) -> List[CriticalityResult]:
        """
        Produce ordered criticality rankings for nodes in the network snapshot.
        """
        results: List[CriticalityResult] = []

        # Map node downstream customer count and graph depth from graph topology
        cust_nodes = [n.id for n in self.snapshot.nodes if n.type.value in ("CUSTOMER_ZONE", "FULFILLMENT_CENTER")]

        for n in self.snapshot.nodes:
            # Simulation failure probability for node
            disr_count = 0
            total_runs = len(self.mc_result.runs)
            service_losses = []
            cost_deltas = []

            for run in self.mc_result.runs:
                # Check if node was disrupted or caused backlog
                node_disr = False
                for step in run.step_outcomes:
                    if n.id in step.node_disruptions and step.node_disruptions[n.id] < 1.0:
                        node_disr = True
                        break
                if node_disr or n.is_disrupted:
                    disr_count += 1
                
                loss = max(0.0, 1.0 - run.overall_service_level)
                service_losses.append(loss)
                cost_deltas.append(run.total_cost)

            fail_prob = disr_count / total_runs if total_runs > 0 else 0.0
            if n.is_disrupted:
                fail_prob = max(fail_prob, 0.8)

            avg_svc_loss = float(np.mean(service_losses)) if service_losses else 0.0
            avg_cost_loss = float(np.mean(cost_deltas)) if cost_deltas else 0.0

            # Graph topology metrics
            is_sup_or_wh = n.type.value in ("SUPPLIER", "WAREHOUSE", "PORT")
            propagation_depth = 3 if is_sup_or_wh else 1
            downstream_cust = len(cust_nodes) if is_sup_or_wh else 1
            downstream_impact = 0.4 if is_sup_or_wh else 0.1

            # Composite criticality score = fail_prob * (svc_loss + downstream_impact)
            crit_score = (fail_prob * 0.4) + (avg_svc_loss * 0.3) + (downstream_impact * 0.3)
            crit_score = min(1.0, max(0.0, crit_score))

            results.append(
                CriticalityResult(
                    node_id=n.id,
                    node_name=n.name,
                    node_type=n.type.value,
                    failure_probability=round(fail_prob, 4),
                    expected_downstream_impact=round(downstream_impact, 4),
                    service_impact=round(avg_svc_loss, 4),
                    cost_impact=round(avg_cost_loss, 2),
                    propagation_depth=propagation_depth,
                    downstream_customers=downstream_cust,
                    criticality_rank=0,
                    criticality_score=round(crit_score * 100.0, 2),
                )
            )

        # Sort by criticality score descending and assign ranks
        results.sort(key=lambda r: r.criticality_score, reverse=True)
        for idx, res in enumerate(results):
            res.criticality_rank = idx + 1

        return results
