"""
FULFILL-X Deterministic Risk Engine & BFS Propagation
Scoring, Compound Composition, Graph Propagation, Dimensional Decomposition, and Evidence (P03-006 - P03-009)
"""
import math
from datetime import datetime, timezone
from typing import Sequence

from app.engine.fusion import SignalFusionEngine
from app.models.world import SupplyNetworkGraph
from app.schemas.risk import (
    RiskLevel,
    SignalContribution,
    RiskExplanation,
    NodeRiskDetail,
    RiskScoreMap,
)
from app.schemas.signal import Signal, FusedSignal, SignalSeverity, SignalType
from app.schemas.world import NodeRiskScores, EdgeType, NodeType


SEVERITY_TO_SCORE = {
    SignalSeverity.LOW: 0.25,
    SignalSeverity.MEDIUM: 0.50,
    SignalSeverity.HIGH: 0.75,
    SignalSeverity.CRITICAL: 0.95,
}

AFFINITY_MATRIX = {
    SignalType.WEATHER: {"financial": 0.2, "sla": 0.4, "operational": 0.3, "sustainability": 0.1},
    SignalType.GEOPOLITICAL: {"financial": 0.4, "sla": 0.2, "operational": 0.3, "sustainability": 0.1},
    SignalType.SUPPLIER_HEALTH: {"financial": 0.3, "sla": 0.3, "operational": 0.3, "sustainability": 0.1},
    SignalType.DEMAND_SHIFT: {"financial": 0.2, "sla": 0.4, "operational": 0.2, "sustainability": 0.2},
    SignalType.LOGISTICS: {"financial": 0.2, "sla": 0.3, "operational": 0.4, "sustainability": 0.1},
    SignalType.REGULATORY: {"financial": 0.5, "sla": 0.1, "operational": 0.3, "sustainability": 0.1},
    SignalType.CYBER: {"financial": 0.2, "sla": 0.3, "operational": 0.5, "sustainability": 0.0},
}


def get_risk_level(composite_score: float) -> RiskLevel:
    """Map numeric risk score to deterministic RiskLevel band."""
    if composite_score >= 0.85:
        return RiskLevel.CRITICAL
    if composite_score >= 0.60:
        return RiskLevel.HIGH
    if composite_score >= 0.25:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def compose_compound(scores: Sequence[float]) -> float:
    """
    Compound risk score formula: 1 - ∏(1 - score_i)
    Prevents scores from exceeding 1.0.
    """
    if not scores:
        return 0.0
    prod = math.prod(1.0 - max(0.0, min(1.0, s)) for s in scores)
    return max(0.0, min(1.0, round(1.0 - prod, 4)))


class DirectImpactScorer:
    """Calculate direct risk impact from fused signals on target nodes."""

    @staticmethod
    def score_node(fused_signals: list[FusedSignal], node_id: str) -> tuple[float, list[SignalContribution]]:
        matching_signals = [fs for fs in fused_signals if fs.target_node_id == node_id]
        if not matching_signals:
            return 0.0, []

        contributions: list[SignalContribution] = []
        scores: list[float] = []

        for fs in matching_signals:
            base_score = SEVERITY_TO_SCORE.get(fs.severity, 0.50)
            direct_contrib = base_score * fs.confidence
            scores.append(direct_contrib)
            contributions.append(
                SignalContribution(
                    signal_id=fs.fused_id,
                    signal_type=fs.type.value,
                    signal_severity=fs.severity.value,
                    contribution=round(direct_contrib, 4),
                    is_direct=True,
                )
            )

        composite_direct = compose_compound(scores)
        return composite_direct, contributions


class GraphPropagator:
    """
    BFS Graph Propagation Engine over DEPENDENCY edges.
    Propagates risk downstream with exponential hop decay factor.
    """

    def __init__(self, max_hops: int = 3, decay_factor: float = 0.6, threshold: float = 0.05):
        self.max_hops: int = max_hops
        self.decay_factor: float = decay_factor
        self.threshold: float = threshold

    def propagate(
        self,
        direct_scores: dict[str, float],
        graph: SupplyNetworkGraph,
    ) -> tuple[dict[str, float], dict[str, list[str]], dict[str, list[str]]]:
        """
        BFS risk propagation over DEPENDENCY edges.
        Returns:
          - propagated_scores: dict[node_id, composite_score]
          - propagated_from: dict[target_id, list[source_ids]]
          - affected_downstream: dict[source_id, list[target_ids]]
        """
        propagated_scores: dict[str, float] = dict(direct_scores)
        propagated_from: dict[str, list[str]] = {nid: [] for nid in graph.nodes}
        affected_downstream: dict[str, list[str]] = {nid: [] for nid in graph.nodes}

        # Queue items: (node_id, hop_level, current_score)
        queue: list[tuple[str, int, float]] = [
            (nid, 0, score) for nid, score in direct_scores.items() if score > 0.0
        ]

        visited: set[tuple[str, int]] = set()

        while queue:
            node_id, hop, score = queue.pop(0)

            state_key = (node_id, hop)
            if state_key in visited or hop >= self.max_hops:
                continue
            visited.add(state_key)

            # Find downstream neighbors connected by DEPENDENCY edges
            outgoing_deps = [
                e for e in graph.get_outgoing_edges(node_id)
                if e.type == EdgeType.DEPENDENCY or e.id.startswith("dep-")
            ]

            for edge in outgoing_deps:
                target_id = edge.target_node_id
                if target_id not in graph.nodes:
                    continue

                decayed_score = score * self.decay_factor
                if edge.criticality is not None:
                    decayed_score *= edge.criticality

                decayed_score = round(decayed_score, 4)

                if decayed_score < self.threshold:
                    continue

                existing_score = propagated_scores.get(target_id, 0.0)
                new_score = compose_compound([existing_score, decayed_score])

                if new_score > existing_score:
                    propagated_scores[target_id] = new_score
                    if node_id not in propagated_from[target_id]:
                        propagated_from[target_id].append(node_id)
                    if target_id not in affected_downstream[node_id]:
                        affected_downstream[node_id].append(target_id)

                    queue.append((target_id, hop + 1, decayed_score))

        return propagated_scores, propagated_from, affected_downstream


class DimensionalRiskComposer:
    """Decompose composite risk score into 4 dimensional risk scores."""

    @staticmethod
    def compose(
        composite_score: float,
        node_signals: list[FusedSignal],
    ) -> NodeRiskScores:
        if composite_score <= 0.0:
            return NodeRiskScores(composite=0.0, financial=0.0, sla=0.0, operational=0.0, sustainability=0.0)

        # Baseline dimension distribution
        weights = {"financial": 0.25, "sla": 0.25, "operational": 0.35, "sustainability": 0.15}

        if node_signals:
            # Accumulate signal affinity weights
            total_fin = sum(AFFINITY_MATRIX.get(s.type, {}).get("financial", 0.25) for s in node_signals)
            total_sla = sum(AFFINITY_MATRIX.get(s.type, {}).get("sla", 0.25) for s in node_signals)
            total_op = sum(AFFINITY_MATRIX.get(s.type, {}).get("operational", 0.25) for s in node_signals)
            total_sus = sum(AFFINITY_MATRIX.get(s.type, {}).get("sustainability", 0.10) for s in node_signals)
            total_sum = total_fin + total_sla + total_op + total_sus

            if total_sum > 0:
                weights["financial"] = total_fin / total_sum
                weights["sla"] = total_sla / total_sum
                weights["operational"] = total_op / total_sum
                weights["sustainability"] = total_sus / total_sum

        fin_score = round(min(1.0, composite_score * (weights["financial"] / 0.25)), 4)
        sla_score = round(min(1.0, composite_score * (weights["sla"] / 0.25)), 4)
        op_score = round(min(1.0, composite_score * (weights["operational"] / 0.25)), 4)
        sus_score = round(min(1.0, composite_score * (weights["sustainability"] / 0.25)), 4)

        return NodeRiskScores(
            composite=round(composite_score, 4),
            financial=max(0.0, min(1.0, fin_score)),
            sla=max(0.0, min(1.0, sla_score)),
            operational=max(0.0, min(1.0, op_score)),
            sustainability=max(0.0, min(1.0, sus_score)),
        )


class ExplanationBuilder:
    """Build structured deterministic operational explanation text and evidence."""

    @staticmethod
    def build(
        node_id: str,
        node_name: str,
        composite: float,
        scores: NodeRiskScores,
        contributions: list[SignalContribution],
        propagated_from: list[str],
        affected_downstream: list[str],
    ) -> RiskExplanation:
        level = get_risk_level(composite)

        # Determine dominant dimension
        dims = {
            "financial": scores.financial,
            "sla": scores.sla,
            "operational": scores.operational,
            "sustainability": scores.sustainability,
        }
        dominant_dim = max(dims, key=dims.get)

        # Build narrative text
        parts: list[str] = [f"Node '{node_name}' ({node_id}) is at {level.value} risk ({int(composite * 100)}%)."]
        if contributions:
            direct_titles = [c.signal_type for c in contributions if c.is_direct]
            if direct_titles:
                parts.append(f"Direct signal exposure from {', '.join(set(direct_titles))}.")
        if propagated_from:
            parts.append(f"Risk propagated downstream from upstream nodes: {', '.join(propagated_from)}.")
        if affected_downstream:
            parts.append(f"Downstream exposure propagates to: {', '.join(affected_downstream)}.")

        parts.append(f"Primary risk driver is {dominant_dim.upper()} exposure.")

        explanation_text = " ".join(parts)

        return RiskExplanation(
            node_id=node_id,
            node_name=node_name,
            composite=composite,
            risk_level=level,
            contributing_signals=contributions,
            propagated_from=propagated_from,
            affected_downstream_nodes=affected_downstream,
            dominant_dimension=dominant_dim,
            explanation_text=explanation_text,
        )


class RiskEngine:
    """
    Main Risk Engine Orchestrator.
    Consumes raw signals and SupplyNetworkGraph, runs Signal Fusion, computes Direct Impact,
    propagates risk over Dependency Edges, computes Edge Risk, and updates World State.
    """

    def __init__(self, fusion_engine: SignalFusionEngine | None = None, max_hops: int = 3, decay_factor: float = 0.6):
        self.fusion_engine: SignalFusionEngine = fusion_engine or SignalFusionEngine(window_hours=6.0)
        self.propagator: GraphPropagator = GraphPropagator(max_hops=max_hops, decay_factor=decay_factor)

    def compute(self, graph: SupplyNetworkGraph, signals: list[Signal]) -> RiskScoreMap:
        """
        Run full deterministic risk pipeline:
        1. Fuse active signals
        2. Compute direct node impact
        3. Propagate risk via BFS
        4. Decompose risk into multi-dimensional scores
        5. Calculate edge risks
        6. Update authoritative SupplyNetworkGraph state
        """
        # 1. Fuse signals
        fused_signals = self.fusion_engine.fuse_signals(signals)

        # 2. Score direct impact
        direct_scores: dict[str, float] = {}
        direct_contributions: dict[str, list[SignalContribution]] = {}

        for node_id in graph.nodes:
            score, contribs = DirectImpactScorer.score_node(fused_signals, node_id)
            if score > 0.0:
                direct_scores[node_id] = score
                direct_contributions[node_id] = contribs

        # 3. Propagate risk
        propagated_scores, propagated_from, affected_downstream = self.propagator.propagate(direct_scores, graph)

        # 4. Dimensional decomposition & explanation construction
        node_risks: dict[str, NodeRiskScores] = {}
        explanations: dict[str, RiskExplanation] = {}

        for node_id, node in graph.nodes.items():
            comp_score = propagated_scores.get(node_id, 0.05)  # baseline risk 0.05
            
            # Preserve existing disruption score if node is explicitly disrupted
            if node.is_disrupted and comp_score < 0.85:
                comp_score = 0.88

            node_signals = [fs for fs in fused_signals if fs.target_node_id == node_id]
            dim_scores = DimensionalRiskComposer.compose(comp_score, node_signals)
            node_risks[node_id] = dim_scores

            # Mutate authoritative node risk scores in graph
            node.risk_scores = dim_scores

            contribs = direct_contributions.get(node_id, [])
            expl = ExplanationBuilder.build(
                node_id=node.id,
                node_name=node.name,
                composite=comp_score,
                scores=dim_scores,
                contributions=contribs,
                propagated_from=propagated_from.get(node_id, []),
                affected_downstream=affected_downstream.get(node_id, []),
            )
            explanations[node_id] = expl

        # 5. Compute Edge Risks
        edge_risks: dict[str, float] = {}
        for edge_id, edge in graph.edges.items():
            src_risk = node_risks.get(edge.source_node_id, NodeRiskScores()).composite
            tgt_risk = node_risks.get(edge.target_node_id, NodeRiskScores()).composite
            base_edge_risk = compose_compound([src_risk * 0.7, tgt_risk * 0.3, edge.load * 0.5])
            if edge.is_disrupted:
                base_edge_risk = max(0.90, base_edge_risk)
            edge_risks[edge_id] = round(base_edge_risk, 4)
            edge.delay_hours = round(edge.delay_hours if not edge.is_disrupted else max(24.0, edge.delay_hours), 1)

        # 6. Rank highest risk nodes
        ranked_nodes = sorted(
            graph.nodes.keys(),
            key=lambda nid: node_risks[nid].composite,
            reverse=True,
        )

        highest_risk_nodes = [nid for nid in ranked_nodes if node_risks[nid].composite >= 0.25][:5]

        network_health = graph.calculate_network_health()

        return RiskScoreMap(
            snapshot_id=graph.snapshot_id,
            computed_at=datetime.now(timezone.utc),
            node_risks=node_risks,
            edge_risks=edge_risks,
            explanations=explanations,
            network_health=network_health,
            highest_risk_nodes=highest_risk_nodes,
        )
