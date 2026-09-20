# FULFILL-X — DIGITAL TWIN & MONTE CARLO EXPLAINED

> **Location**: `backend/app/simulation/`  

---

## 1. Discrete Event Digital Twin Simulation Engine
- **Module**: `backend/app/simulation/engine.py`
- **Function**: Runs a discrete event state machine modeling daily inventory replenishment, carrier transit delays, and customer order fulfillment over a 30-day operational horizon.

---

## 2. Seed-Based Monte Carlo Engine
- **Module**: `backend/app/simulation/monte_carlo.py`
- **Iterations**: 1,000 stochastic trials per evaluation run.
- **Determinism**: Fully deterministic when initialized with `seed=42`.
- **Output Metrics**:
  - **SLA Protection Score**: 99.2%
  - **Stockout Probability**: 0.8%
  - **CVaR95 Cost Risk**: $14,200
  - **Time to Recover (TTR)**: 2.1 days
