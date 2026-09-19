# FULFILL-X — MULTI-OBJECTIVE PLANNER & OPTIMIZATION SPECIFICATION

**Version:** 1.0.0 (Phase 08)  
**Status:** IMPLEMENTED  
**Safety Protocol:** Non-Authoritative Optimization Engine (Zero State Mutation, Human-in-the-Loop)

---

## 1. Executive Summary

The **Multi-Objective Planner & Optimization Engine** serves as the decision-reasoning engine of FULFILL-X. Following the architectural imperative:
`Specialists propose → Coordinator reconciles → Adversary attacks → Planner optimizes → Verification validates → Human approves`

The Planner evaluates Candidate Plans A, B, and C against specialist operational metrics and Adversary stress test findings. Rather than collapsing multi-dimensional trade-offs into a single arbitrary scalar score (e.g. "Score = 8.73"), the Planner calculates formal **Pareto Dominance**, constructs both **Baseline** and **Robust Pareto Frontiers**, conducts **Hard/Soft Constraint Feasibility Checks**, executes **Sensitivity Sweeps**, and outputs transparent, objective-vector trade-off profiles for human decision-makers.

---

## 2. Core Architecture & Workflow

```text
       ┌────────────────────────┐         ┌────────────────────────┐
       │ Candidate Plans A/B/C  │         │ Adversary Stress Report│
       └───────────┬────────────┘         └───────────┬────────────┘
                   │                                  │
                   └────────────────┬─────────────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │  Objective Normalizer  │ (Range [0.0, 1.0])
                       └───────────┬────────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │  Constraint Evaluator  │ (FEASIBLE / INFEASIBLE / CONDITIONAL)
                       └───────────┬────────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │     Pareto Engine      │ (Baseline & Robust Frontiers)
                       └───────────┬────────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │  Sensitivity Analyzer  │ (±50% Parameter Sweeps)
                       └───────────┬────────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │    Planner Service     │ (Zero State Mutation)
                       └───────────┬────────────┘
                                    │
                                    ▼
                     PLANNER REPORT / FRONTEND BOARD
```

---

## 3. Objective Vector Taxonomy (14 Dimensions)

The Planner tracks 14 objective dimensions split between specialist operational metrics and adversary stress resilience:

### Specialist Objectives
1. `service_level`: Service delivery fulfillment rate (MAXIMIZE, Weight: 1.0)
2. `cost_impact`: Estimated operational cost (MINIMIZE, Weight: 0.9)
3. `emissions_impact`: Estimated carbon emissions (MINIMIZE, Weight: 0.7)
4. `inventory_health`: Average inventory availability (MAXIMIZE, Weight: 0.8)
5. `supplier_risk`: Aggregate supplier risk level (MINIMIZE, Weight: 0.8)
6. `transport_efficiency`: Transit time efficiency (MAXIMIZE, Weight: 0.7)

### Adversary Stress Objectives
7. `service_resilience`: Service level under disruption (MAXIMIZE, Weight: 1.0)
8. `supply_resilience`: Supplier network continuity under stress (MAXIMIZE, Weight: 0.8)
9. `transport_resilience`: Logistics corridor resilience (MAXIMIZE, Weight: 0.8)
10. `inventory_resilience`: Inventory buffer retention under shock (MAXIMIZE, Weight: 0.8)
11. `cost_resilience`: Financial containment under emergency rerouting (MAXIMIZE, Weight: 0.7)
12. `emissions_resilience`: Environmental impact retention under stress (MAXIMIZE, Weight: 0.6)
13. `recovery_resilience`: Recovery speed (MTTR) under stress (MAXIMIZE, Weight: 0.9)
14. `network_resilience`: Structural topology graph connectivity (MAXIMIZE, Weight: 0.9)

---

## 4. Formal Pareto Dominance & Frontiers

Plan $A$ **dominates** Plan $B$ ($A \succ B$) if and only if:
1. Plan $A$ is strictly better than Plan $B$ in at least one objective dimension ($u_i(A) > u_i(B)$).
2. Plan $A$ is no worse than Plan $B$ across all other objective dimensions ($u_j(A) \ge u_j(B) \, \forall j$).

### Frontier Types
- **Baseline Pareto Frontier**: Calculated using non-disrupted specialist metrics. Identifies optimal operational plans under normal conditions.
- **Robust Pareto Frontier**: Calculated using post-stress degradation metrics from Adversary evaluations. Identifies optimal plans under severe disruption.

---

## 5. Feasibility Constraint Verification

The Planner enforces business and operational limits before presenting options:

| Constraint | Type | Metric | Threshold | Consequence |
|---|---|---|---|---|
| Minimum Service Level | HARD | `service_level` | $\ge 85.0\%$ | Violations marked `INFEASIBLE` |
| Maximum Budget Cap | HARD | `cost_impact` | $\le \$2,000,000$ | Violations marked `INFEASIBLE` |
| Minimum Resilience Score | SOFT | `service_resilience` | $\ge 60.0\%$ | Violations marked `CONDITIONAL` |
| Max MTTR Threshold | SOFT | `recovery_resilience` | $\ge 50.0\%$ | Violations marked `CONDITIONAL` |

---

## 6. Sensitivity Sweeps

Sensitivity analysis evaluates plan stability by perturbing key environment parameters across $\pm 50\%$ increments:
- **Cost Scaling Factor**: Simulates freight rate inflation and surge pricing.
- **Disruption Severity Factor**: Simulates escalating adversary attack intensity.
- **Demand Surge Factor**: Simulates peak season demand fluctuations.

---

## 7. Safety & Immutability Guarantee

The Planner Engine operates exclusively on immutable snapshot copies (`WorldStateSnapshot.model_copy(deep=True)`). No database or repository mutations occur during optimization, calculation, or API execution.
