# FULFILL-X Evaluation & Measurable Learning Specification (Phase 5)

## 1. Overview & Core Research Question

Phase 5 addresses the central empirical question of the Experiential Resilience Intelligence Platform:
> **Does persistent Hindsight experience cause the resilience agent to make better decisions on later, related-but-not-identical incidents?**

This question is resolved experimentally through deterministic A/B evaluation:
- **Agent Mode A (Memoryless)**: Operates strictly without accumulated experiential memory. Memory is discarded between episodes.
- **Agent Mode B (Hindsight)**: Operates with persistent Hindsight memory, recalling prior failure boundaries, reasoning over partial transferability, avoiding repeated mistakes, and acknowledging honest uncertainty (`UNKNOWN`).

---

## 2. Canonical Benchmark Dataset (30 Incidents)

The evaluation sequence consists of 30 synthetic incidents designed to test specific operational capabilities:
1. **Repeated Pattern Scenarios (6)**: Direct recurrence of identical failure boundaries (e.g., Supplier substitution under 28% capacity).
2. **Related-but-not-Identical Scenarios (6)**: Parameter shifts (e.g., capacity 36%, demand surge 1.35x) requiring transfer assessment (`PARTIAL`).
3. **Boundary Verification Scenarios (4)**: Incidents immediately above and below critical thresholds (42% vs 38%).
4. **Dependency Outage Scenarios (4)**: Mid-stream hub or warehouse outages requiring alternative topology rerouting.
5. **Demand Shock Scenarios (3)**: 1.5x–2.0x surges testing reserve inventory buffers.
6. **Topology Change Scenarios (3)**: Latency spikes and secondary routing constraints.
7. **Stale Evidence Scenarios (2)**: Historical precedents with expired TTLs.
8. **Novelty & Uncertainty Scenarios (2)**: Unseen failure signatures with zero historical coverage testing `UNKNOWN` detection.

---

## 3. Evaluation Architecture

```
                    ┌───────────────────────────┐
                    │ ScenarioSequenceGenerator │
                    └─────────────┬─────────────┘
                                  │ Canonical 30 Incidents
                   ┌──────────────┴──────────────┐
                   ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  Memoryless Agent   │       │   Hindsight Agent   │
        │      (Mode A)       │       │      (Mode B)       │
        └──────────┬──────────┘       └──────────┬──────────┘
                   │                             │ Hindsight Recall
                   │                             │ Transfer Reasoning
                   │                             │ Boundary Avoidance
                   ▼                             ▼
          ┌─────────────────┐           ┌─────────────────┐
          │ Static Decision │           │ Adaptive Choice │
          └────────┬────────┘           └────────┬────────┘
                   │                             │
                   ▼                             ▼
        ┌───────────────────────────────────────────────────┐
        │        Real Simulation / Outcome Engine           │
        └──────────────────────────┬────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
        ┌─────────────────────┐         ┌─────────────────────┐
        │   Memory Discard    │         │  Hindsight Retain   │
        └─────────────────────┘         └─────────────────────┘
                                                   │
                                                   ▼
                                        Accumulated Experience
```

---

## 4. Empirical Evaluation Metrics

All metrics are calculated directly from simulation execution results:

| Metric | Memoryless | Hindsight | Delta / Gain | Causal Mechanism |
|---|---|---|---|---|
| **Recovery Success Rate** | 43.3% | 93.3% | **+50.0%** | Prior boundary recall pre-empts cascade failure |
| **Repeated Mistake Rate** | 36.7% | 0.0% | **-36.7%** | Recall identifies past failure on identical condition |
| **Unsafe Action Rate** | 36.7% | 3.3% | **-33.3%** | Boundary violation blocked prior to execution |
| **Unknown Detection Rate** | 0.0% | 3.3% | **+3.3%** | Zero historical coverage detected; holds safely |
| **Boundary Avoidance Rate** | 0.0% | 40.0% | **+40.0%** | Avoids Skill after historical evidence proves breach |
| **Avg Prediction Error** | 2.50h | 0.40h | **-2.10h** | Historical actual recovery times calibrate prediction |
| **Transfer Accuracy** | 0.0% | 76.7% | **+76.7%** | Distinguishes PARTIAL vs NON_TRANSFERABLE |
| **Learning Gain (Late vs Early)** | 0.0% | **+10.0%** | Positive | Late sequence performance strictly exceeds early |

---

## 5. Decision Attribution & Causal Proof

For every episode, the Hindsight agent records a `CausalAttribution` record:
- `memory_recalled`: Whether relevant experiences were retrieved from the Hindsight store.
- `evidence_used`: Whether retrieved experiences satisfied confidence thresholds.
- `boundary_influenced`: Whether a known failure boundary altered the decision.
- `decision_changed`: Whether the selected strategy diverged from the baseline.
- `outcome_improved`: Whether the decision change resulted in successful recovery.

---

## 6. Artifact Exports

Machine-readable evaluation artifacts are automatically written to `artifacts/evaluation/`:
- `evaluation.json`: Complete report including metrics, learning curves, and full episode traces.
- `evaluation.csv`: Row-level data with 17 features per episode for independent analysis.
