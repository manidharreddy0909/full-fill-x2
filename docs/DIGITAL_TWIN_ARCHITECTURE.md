# DIGITAL TWIN ARCHITECTURE SPECIFICATION

## Overview
Phase 8 introduces the **Digital Twin & Monte Carlo Resilience Engine** into FULFILL-X.
The Digital Twin creates an isolated, executable snapshot of the supply network (`DigitalTwinState`) and simulates stochastic discrete-time transitions ($1\text{h}$ step resolution) over configurable horizons ($6\text{h}$ to $30\text{d}$).

```
PRODUCTION WORLD MODEL (Phase 2)
              │
              ▼
   DigitalTwin Snapshot
 (Isolated Deep-Copied State)
              │
              ▼
      ScenarioGenerator
 (Single, Sequential & Compound)
              │
              ▼
     DigitalTwinDynamics
 (Discrete Inventory, Capacity, Demand)
              │
              ▼
      MonteCarloEngine
 (100 to 5,000 Seeded Runs)
              │
    ┌─────────┴─────────┐
    ▼                   ▼
ResilienceMetrics   StrategySimulator
(P10-P90, CVaR95)  (Baseline vs Candidates)
    │                   │
    └─────────┬─────────┘
              ▼
   RobustStrategyAnalyzer
```

## Isolation Guarantee
- Every simulation operates on deep-copied snapshots (`mode = SIMULATION`, `production_mutation = False`).
- The production database is **never** mutated by simulation execution.
