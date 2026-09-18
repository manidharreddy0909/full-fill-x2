# FULFILL-X — Risk Engine Specification

## 1. Purpose

Define every aspect of the Risk Engine: how signals become scores, how
scores propagate through the supply graph, how compound interactions are
modeled, and how scores are explained.

The Risk Engine is **entirely deterministic**. No AI is involved.

---

## 2. Pipeline

```
Raw Signals
   │
   ▼
[SignalFusionEngine]
   │ Fused signal set (deduplicated, confidence-weighted)
   ▼
[DirectImpactScorer]
   │ per-signal, per-node direct risk contributions
   ▼
[CompoundComposer]
   │ compound_risk = 1 - ∏(1 - risk_i)
   ▼
[GraphPropagator]
   │ BFS through dependency edges, decay per hop
   ▼
[DimensionalComposer]
   │ financial, SLA, operational, sustainability per node
   ▼
[ExplanationBuilder]
   │ which signals → which scores
   ▼
RiskScoreMap + RiskExplanations
```

---

## 3. Signal Fusion

**New subsystem (not in Phase 00 BACKEND_SPEC).**

The Signal Fusion Engine aggregates multiple signals before scoring:

### 3.1 Deduplication

Signals of the same type affecting the same node within a 6-hour window
are merged:

```python
def fuse_signals(signals: list[Signal], window_hours: float = 6.0) -> list[FusedSignal]:
    """
    Merge co-located, same-type signals within the time window.
    Fused signal confidence = 1 - product(1 - s.confidence for s in group)
    Fused signal severity = max(s.severity for s in group)
    """
```

### 3.2 Fusion Formula

For n signals of the same type affecting overlapping nodes:

```
fused_confidence = 1 - ∏(1 - confidence_i)
fused_severity = max(severity_i)
```

This is the same compound probability formula used in risk composition.

**DECISION REQUIRED (ADR-009)**: Is the 6-hour window configurable?

---

## 4. Direct Impact Scoring

Each signal contributes a direct risk score to all nodes in its
`affected_node_ids`:

```python
SEVERITY_TO_SCORE = {
    SignalSeverity.LOW: 0.25,
    SignalSeverity.MEDIUM: 0.50,
    SignalSeverity.HIGH: 0.75,
    SignalSeverity.CRITICAL: 0.95,
}

def score_direct(signal: FusedSignal, node: WorldNode) -> float:
    base_score = SEVERITY_TO_SCORE[signal.severity]
    confidence_weighted = base_score * signal.confidence
    return confidence_weighted
```

**DECISION REQUIRED (ADR-010)**: Are these severity→score mappings final?

---

## 5. Compound Composition

When multiple signals affect the same node, scores are composed using
the compound probability formula (avoids exceeding 1.0):

```python
def compose_compound(direct_scores: list[float]) -> float:
    """
    compound = 1 - ∏(1 - score_i)
    Example: [0.6, 0.5] → 1 - (0.4 × 0.5) = 1 - 0.2 = 0.8
    """
    return 1.0 - math.prod(1.0 - s for s in direct_scores)
```

---

## 6. Graph Propagation

Risk propagates through **dependency edges** only (not route edges).

Algorithm: BFS from directly impacted nodes.

```python
MAX_HOPS = 3
DECAY_FACTOR = 0.6  # DECISION REQUIRED ADR-010

def propagate(
    direct_scores: dict[str, float],
    graph: NetworkGraph,
) -> dict[str, float]:
    propagated = dict(direct_scores)
    queue = [(node_id, 0, score) for node_id, score in direct_scores.items()]

    while queue:
        node_id, hop, score = queue.pop(0)
        if hop >= MAX_HOPS:
            continue
        for neighbor_id in graph.downstream_neighbors(node_id):
            propagated_score = score * (DECAY_FACTOR ** (hop + 1))
            if propagated_score < 0.05:  # below significance threshold
                continue
            existing = propagated.get(neighbor_id, 0.0)
            new_score = compose_compound([existing, propagated_score])
            if new_score > existing:
                propagated[neighbor_id] = new_score
                queue.append((neighbor_id, hop + 1, propagated_score))

    return propagated
```

---

## 7. Dimensional Decomposition

The composite risk score is decomposed into 4 dimensions:

```python
class DimensionalRiskComposer:
    def compose(
        self,
        composite: float,
        signal_types: list[SignalType],
        node_type: NodeType,
    ) -> NodeRiskScores:
        """
        Distribute composite score across dimensions based on
        signal type affinity and node type affinity.
        """
```

**Signal type → dimension affinity table**:

| Signal Type | Financial | SLA | Operational | Sustainability |
|------------|-----------|-----|-------------|----------------|
| WEATHER | 0.2 | 0.4 | 0.3 | 0.1 |
| GEOPOLITICAL | 0.4 | 0.2 | 0.3 | 0.1 |
| SUPPLIER_HEALTH | 0.3 | 0.3 | 0.3 | 0.1 |
| DEMAND_SHIFT | 0.2 | 0.4 | 0.2 | 0.2 |
| LOGISTICS | 0.2 | 0.3 | 0.4 | 0.1 |
| REGULATORY | 0.5 | 0.1 | 0.3 | 0.1 |
| CYBER | 0.2 | 0.3 | 0.5 | 0.0 |

**DECISION REQUIRED (ADR-010)**: Validate this affinity table against domain expertise.

The composite score is a weighted average of dimensions:
```python
composite = (0.3 * financial + 0.3 * sla + 0.25 * operational + 0.15 * sustainability)
```

**DECISION REQUIRED (ADR-010)**: Validate composite weights.

---

## 8. Network Health Score

```python
def compute_network_health(risk_map: RiskScoreMap) -> float:
    """
    network_health = 1.0 - weighted_mean(composite_scores)
    Weights nodes by their type (FC and Supplier weighted higher).
    """
    NODE_WEIGHTS = {
        NodeType.SUPPLIER: 1.5,
        NodeType.WAREHOUSE: 1.0,
        NodeType.FULFILLMENT_CENTER: 1.5,
        NodeType.CUSTOMER_ZONE: 0.8,
        NodeType.PORT: 1.2,
    }
```

---

## 9. Risk Explanation

Each node's risk score includes an explanation:

```python
class RiskExplanation(BaseModel):
    node_id: str
    composite: float
    contributing_signals: list[SignalContribution]
    propagated_from: list[str]  # node IDs that propagated risk to this node
    dominant_dimension: str  # "financial" | "sla" | "operational" | "sustainability"

class SignalContribution(BaseModel):
    signal_id: str
    signal_type: str
    signal_severity: str
    contribution: float  # how much this signal contributed to composite
    is_direct: bool  # vs. propagated
```

Explanations are served with `GET /api/risks/nodes/{id}` and displayed
in the Risk Explorer detail panel and Decision Cockpit evidence chain.

---

## 10. Determinism Guarantee

The Risk Engine is deterministic given:
1. The same `WorldStateSnapshot`
2. The same `List[Signal]`
3. The same fusion window settings
4. The same scoring constants

No random operations. No LLM calls. No external API calls.

---

## 11. API

```
GET /api/risks
  → RiskScoreMap (all nodes)

GET /api/risks/nodes/{node_id}
  → NodeRiskDetail (scores + explanation)

GET /api/risks/network
  → network_health_score + highest_risk_nodes
```

---

## 12. WebSocket Events

| Event | Trigger |
|-------|---------|
| `risk.update` | After any signal ingestion or scenario simulation |
| `risk.propagated` | After propagation step completes (for 3D wave animation) |

---

## 13. Frontend Representation

- **Risk Explorer**: Sortable table + heat map + node detail
- **Command Center**: Top-3 risk nodes, network health KPI
- **3D Scene**: Node color lerp from green→red by composite risk

---

## 14. 3D Representation

When `risk.propagated` event fires:
1. Origin nodes get disruption wave animation (expanding ring, 2s)
2. Each hop's nodes animate 0.5s after the previous hop
3. Color transitions animate 400ms per node (lerp in `useFrame`)

---

## 15. Failure Mode

| Failure | Response |
|---------|---------|
| No active signals | All composite scores = baseline (≈ 0.05) |
| Node not in risk map | Risk = 0.0, not in `highest_risk_nodes` |
| Division by zero in composite | Protected by min denominator |
| Database unreachable | Serve last cached `RiskScoreMap` from Redis |

---

## 16. Tests

```python
# test_risk_engine.py

def test_composite_risk_range():
    """All composite risk scores are in [0.0, 1.0]."""

def test_critical_signal_produces_high_direct_risk():
    """CRITICAL severity signal → direct risk ≥ 0.85 on affected node."""

def test_compound_formula_never_exceeds_1():
    """Compound composition of [0.9, 0.9] < 1.0."""

def test_propagation_decays_with_hops():
    """Risk at hop 2 < risk at hop 1 < risk at hop 0."""

def test_propagation_stops_at_max_hops():
    """Risk does not appear beyond MAX_HOPS=3."""

def test_risk_engine_is_deterministic():
    """Same inputs → identical RiskScoreMap output."""

def test_network_health_decreases_with_risk():
    """Network health is lower when composite scores are higher."""

def test_risk_explanation_traces_to_signal():
    """Each RiskExplanation contains contributing signal IDs."""
```
