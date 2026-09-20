# FULFILL-X — Canonical Demo Scenario Specification

## 1. Scenario Overview

- **Scenario Identifier**: `DEMO-05`
- **Scenario Title**: Full Resilience Challenge (Primary Showcase)
- **Deterministic Seed**: `42`
- **Network Topology Preset**: `healthy` $\rightarrow$ `double_punch`
- **Target Subsystem / Disruption**: Multi-Tier Port Congestion & Tier-1 Supplier Breakdown

---

## 2. Network Topology & Initial Conditions

- **Nodes**: 23 active physical entities across 5 functional layers:
  - 3 Tier-1 Suppliers (`sup-001` East Asia Electronics, `sup-002`, `sup-003`)
  - 2 Maritime Transit Hubs (`port-001` Port of LA/LB, `port-002`)
  - 4 Regional Warehouses (`wh-001` - `wh-004`)
  - 6 Fulfillment Centers (`fc-001` - `fc-006`)
  - 8 Customer Demand Zones (`cz-001` - `cz-008`)
- **Baseline Network Health**: 94.0%
- **Baseline Risk Score**: Low ($< 0.20$)

---

## 3. Disruption Propagation Flow

1. **Weak Signal Ingest**: Minor maritime weather delay & supplier inventory buffer alert detected at `port-001`.
2. **Compound Risk Escalation**:
   - Primary Disruption: 50% capacity reduction at `sup-001` combined with +48h vessel dwell time at `port-001`.
   - Downstream Vector: Inbound replenishment stock to `wh-001` drops by 45%, threatening stockouts at `fc-001` and `fc-002` within 72 hours.
3. **Multi-Agent Swarm Deliberation**:
   - **Inventory Specialist**: Proposes safety stock allocation buffer increase.
   - **Supplier Specialist**: Recommends expediting orders from secondary supplier `sup-002`.
   - **Transportation Specialist**: Recommends air freight rerouting for critical SKUs.
   - **Fulfillment Specialist**: Proposes cross-docking from `wh-002`.
   - **Sustainability Specialist**: Flags air freight carbon intensity penalty (+35% CO2).
   - **Resilience Specialist**: Recommends dual-sourcing with dynamic buffer reallocation.
   - **Coordinator Agent**: Synthesizes Candidate Plans A, B, and C based on multi-objective trade-offs.

---

## 4. Multi-Objective Candidate Plans

| Plan Identifier | Priority / Focus | Est. Total Cost | Est. Max Delay | Projected Service Level | CO2 Delta | Adversarial Vulnerability |
|---|---|---|---|---|---|---|
| **Candidate A** | Speed / Air Freight | $85,000 | 12 hrs | 96.5% | +35% | High fuel surcharge risk |
| **Candidate B** | Cost Minimization | $22,000 | 48 hrs | 88.0% | +0% | Stockout risk at `fc-001` |
| **Candidate C** | Balanced Resilience | $45,000 | 24 hrs | 94.5% | +8% | Low (Verified) |

---

## 5. Verification & Monte Carlo Stress-Testing

- **Verification Safety Gate**: Evaluates Candidate C against operational constraint matrices (Budget $\le \$60,000$, Max Delay $\le 36\text{h}$, Service Level $\ge 90\%$).
- **Monte Carlo Digital Twin**: 500 stochastic simulation trajectories ($n=500$, horizon $= 72\text{h}$, seed $= 42$).
  - **Service Level P50**: 94.8%
  - **Service Level P10**: 91.2%
  - **Stockout Probability**: 3.2%
  - **CVaR 95% Cost**: $52,400
  - **TTR P90**: 28.5 hours
