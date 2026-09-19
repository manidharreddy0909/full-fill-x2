# FULFILL-X Evaluation Harness & Benchmark Suite Specification

## 1. Overview & Architecture

Phase 12 delivers a deterministic, reproducible, quantitative evaluation harness for FULFILL-X.
The system answers:

> *"How well does FULFILL-X detect risk, generate valid scenarios, coordinate agents, survive adversarial attacks, produce feasible plans, and verify those plans?"*

```text
Benchmark Registry
        ↓
Ground Truth (Deterministic)
        ↓
Evaluation Runner
        ↓
FULFILL-X Pipeline (Isolated Graph Snapshot)
        ↓
Observed Outputs
        ↓
Metric Engine (10 Quantitative Formulas)
        ↓
Evaluation Report & Regression Baseline
        ↓
Dashboard & Cockpit Integration
```

---

## 2. Evaluation Pipeline & State Isolation

All benchmark evaluations execute against **isolated graph snapshots** (`SupplyNetworkGraph.to_snapshot()`).
Production repositories (`WorldRepository` and `RiskRepository`) remain **100% unmutated** throughout execution.

A run is uniquely reproducible from:
```text
(benchmark_id, seed, scenario_id, configuration)
```

---

## 3. Quantitative Metric Formulas

1. **Risk Detection ($F_1$ Score)**:
   $$Precision = \frac{TP}{TP + FP}, \quad Recall = \frac{TP}{TP + FN}, \quad F_1 = \frac{2 \cdot P \cdot R}{P + R}$$
2. **Risk Localization (Jaccard IoU)**:
   $$IoU = \frac{|\text{Predicted Affected Nodes} \cap \text{Ground Truth Affected Nodes}|}{|\text{Predicted Affected Nodes} \cup \text{Ground Truth Affected Nodes}|}$$
3. **Scenario Validity**:
   $$Validity = \frac{\text{Valid Scenarios}}{\text{Total Scenarios}}$$
4. **Agent Proposal Validity**:
   $$Validity = \frac{\text{Valid Proposals (Valid Entity Targets \& Actions)}}{\text{Total Agent Proposals}}$$
5. **Coordination Quality ($F_1$ Score)**:
   $$F_1 = \text{Conflict \& Agreement Detection Accuracy against Ground Truth}$$
6. **Adversarial Coverage**:
   $$Coverage = \frac{\text{Vulnerabilities Detected}}{\text{Known Ground Truth Vulnerabilities}}$$
7. **Plan Feasibility**:
   $$Feasibility = \frac{\text{Feasible Plans (Hard Constraint Violations = 0)}}{\text{Total Candidate Plans}}$$
8. **Plan Robustness**:
   $$Recovery = 1.0 - \max(0, \text{Baseline Score} - \text{Stressed Score})$$
9. **Verification Accuracy**:
   $$Accuracy = \frac{\text{Correctly Verified Statuses}}{\text{Total Verification Runs}}$$
10. **Transparency Completeness**:
    $$Completeness = \frac{\text{Present Auditability Fields}}{\text{Required Auditability Fields (Evidence, Constraints, Reasoning, Tradeoffs, Impact, Verification)}}$$

---

## 4. Benchmark Scenario Catalog

- `SCENARIO-01`: Supplier Disruption
- `SCENARIO-02`: Port Closure
- `SCENARIO-03`: Demand Spike
- `SCENARIO-04`: Transportation Delay
- `SCENARIO-05`: Warehouse Capacity Reduction
- `SCENARIO-06`: Compound Disruption
- `SCENARIO-07`: Multi-Node Failure
- `SCENARIO-08`: Adversarial Stress
