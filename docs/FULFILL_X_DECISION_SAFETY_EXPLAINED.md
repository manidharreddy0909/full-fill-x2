# FULFILL-X — DECISION & SAFETY PLANE EXPLAINED

> **Locations**: `backend/app/cockpit/` & `backend/app/verification/`  

---

## 1. Multi-Objective Decision Cockpit
- Reconciles Pareto trade-offs across 4 competing operational dimensions: **Financial Cost ($)**, **Order Delay (Days)**, **Resilience Score (%)**, and **Carbon Emissions (kg CO2e)**.
- Ranks candidate plans and selects `PLAN-RESILIENCE-01` as optimal.

---

## 2. Formal Safety Verification Plane
- Enforces hard invariant safety constraints before execution authorization:
  - *Invariant 1*: Budget reallocation must not exceed $50,000 threshold.
  - *Invariant 2*: Minimum safety stock levels must remain above 15% across all customer zones.
  - *Invariant 3*: Supplier allocation must respect contracted capacity ceilings.
- Safety plane status displays **`ENFORCED`**.
