# FULFILL-X — Demo Operator Runbook

## 1. Demo Execution Overview

This runbook guides operators and presenters through the 13-Act E2E Judge Journey for FULFILL-X.

- **Total Duration**: ~5–7 minutes
- **Environment**: Local standard full-stack environment (`http://localhost:5173`)
- **Canonical Seed**: `42`
- **Preset**: `healthy` $\rightarrow$ `double_punch`

---

## 2. Step-by-Step Operator Runbook

### ACT 1 — OBSERVE: Global Operational Baseline
- **Target Route**: `/` $\rightarrow$ `/command`
- **Operator Action**: Start at `/`. Highlight live network metrics pill (23 nodes, 32 edges, 94.0% health). Click "ENTER OPERATIONS".
- **Narration Point**: *"FULFILL-X begins by observing the entire fulfillment network as a living spatial system rather than waiting for a failure notification."*
- **Approx. Duration**: 30s

### ACT 2 — DETECT WEAK SIGNAL: Network Inspection
- **Target Route**: `/world` $\rightarrow$ `/world/node/sup-001`
- **Operator Action**: Navigate to `/world`. Select node `sup-001` from 3D topology canvas to trigger the Node Inspector.
- **Narration Point**: *"The system identifies weak signal anomalies—minor dwell time increases and supplier buffer drops—and evaluates how they will propagate."*
- **Approx. Duration**: 30s

### ACT 3 — UNDERSTAND COMPOUND RISK: Graph & Causal Reasoning
- **Target Route**: `/intelligence` $\rightarrow$ `/intelligence/gnn` $\rightarrow$ `/intelligence/causal`
- **Operator Action**: Click through Graph GNN and Causal tabs. Highlight predicted risk vectors and counterfactual DAGs.
- **Narration Point**: *"Using Graph Neural Networks and Causal DAGs, FULFILL-X models how localized disruptions snowball into compound supply shocks."*
- **Approx. Duration": 35s

### ACT 4 — SPECIALIST AGENT RESPONSE: Swarm Deliberation
- **Target Route**: `/intelligence/agents`
- **Operator Action**: View agent constellation. Highlight Coordinator reconciling proposals from Inventory, Transport, and Sustainability specialists.
- **Narration Point**: *"7 specialized AI agents deliberate in parallel, proposing trade-offs between cost, speed, resilience, and carbon footprint."*
- **Approx. Duration**: 35s

### ACT 5 — ADVERSARIAL CHALLENGE: Red-Team Stress Test
- **Target Route**: `/response/war-room` $\rightarrow$ `/response/adversary`
- **Operator Action**: Navigate to Adversary workspace. Trigger "RUN ADVERSARIAL TEST" on Candidate Plan A to expose fuel surcharge vulnerability.
- **Narration Point**: *"Before accepting a recommendation, FULFILL-X attacks its own strategy with an Adversary Red-Team model to expose hidden failure modes."*
- **Approx. Duration**: 40s

### ACT 6 — MULTI-OBJECTIVE DECISION COCKPIT: Pareto Trade-Offs
- **Target Route**: `/decision/cockpit`
- **Operator Action**: Review Candidate Plans A, B, and C. Highlight Pareto frontier trade-offs. Select Candidate Plan C.
- **Narration Point**: *"The Decision Cockpit presents explicit multi-objective trade-offs rather than obscuring choices behind a black-box AI score."*
- **Approx. Duration**: 30s

### ACT 7 — VERIFICATION SAFETY GATE: Execution Boundary
- **Target Route**: `/decision/verification`
- **Operator Action**: Inspect constraint verification table and state diff certificate. Click "AUTHORIZE EXECUTION (DRY RUN)".
- **Narration Point**: *"AI cannot directly mutate operational state. Every plan must pass formal verification and human authorization safety gates."*
- **Approx. Duration**: 30s

### ACT 8 — DIGITAL TWIN STRESS TEST: Stochastic Simulation
- **Target Route**: `/simulation/twin`
- **Operator Action**: Configure scenario parameters (`demand_shock_pct`: +25%, `recovery_delay`: x1.5, `seed`: 42). Click "RUN MONTE CARLO SIMULATION". View P10/P50/P90 percentile bands.
- **Narration Point**: *"Before execution, the Digital Twin evaluates 500 simulated futures to calculate exact stockout probabilities and Tail Risk (CVaR 95%)."*
- **Approx. Duration**: 45s

### ACT 9 — OBSERVABILITY: Live Telemetry
- **Target Route**: `/observability/events`
- **Operator Action**: Show live WebSocket event stream and active alerts. Click "ACKNOWLEDGE ALERT".
- **Narration Point**: *"The system monitors its own operational execution lifecycle via real-time WebSocket event feeds."*
- **Approx. Duration**: 25s

### ACT 10 — LEARNING: Institutional Memory
- **Target Route**: `/learning/deliberate`
- **Operator Action**: Inspect Agent Memory Log and Challenger Models table. Click "VALIDATE MEMORY".
- **Narration Point**: *"Operational outcomes become institutional memory, continually refining agent lessons and challenger models for future disruptions."*
- **Approx. Duration**: 30s

### ACT 11 — GOVERNANCE: Control Plane & Chaos Testing
- **Target Route**: `/governance/resilience` $\rightarrow$ `/governance/policies`
- **Operator Action**: Toggle System Operational Mode (`FULL` $\rightarrow$ `DEGRADED_AI`). Inject `LATENCY_SPIKE` fault, then click "CLEAR ALL FAULTS".
- **Narration Point**: *"The enterprise control plane ensures high-trust governance, policy enforcement, and self-healing degradation modes under chaos conditions."*
- **Approx. Duration**: 35s

### ACT 12 — EVALUATION: Benchmark Assessment
- **Target Route**: `/evaluation`
- **Operator Action**: Select `SCENARIO-05` and click "RUN SCENARIO". Review Overall Score and Agent Validity metrics.
- **Narration Point**: *"Finally, the evaluation harness benchmark measures strategy survival and resilience performance against standardized scenario suites."*
- **Approx. Duration**: 30s

---

## 3. Demo Reset & Failure Recovery

- **Reset Action**: Click the "Reset World" button in top HUD bar (`RefreshCw` icon) or call `POST /api/world/reset` + `POST /api/demo/reset`.
- **Backend Recovery**: If connection drops, reload `http://localhost:5173`. The spatial app layout auto-reconnects to WebSocket stream.
