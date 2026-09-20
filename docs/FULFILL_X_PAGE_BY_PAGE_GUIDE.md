# FULFILL-X — PAGE-BY-PAGE PRODUCT GUIDE

> **Release Baseline**: `6869cae8f31788ee68b06e7a4615ef4a5b504cfd`  

---

## Workspace Tour

### 1. `/command` — Autonomous Command Center
- **Purpose**: Operational overview of the entire fulfillment network (23 nodes, 32 edges).
- **Key Displays**: Network Health Score gauge (94.0%), top critical nodes list, live WebSocket status bar.
- **Interactive Controls**: `"Inject Signal"`, `"Recalculate Risk"`, Preset selector dropdown, Seed input box.
- **Backend API**: `GET /api/v1/graph/topology`, `POST /api/v1/risk/inject-signal`.
- **WebSocket Events**: `RISK_SIGNAL_INJECTED`, `GRAPH_RECALCULATED`.
- **Next Workspace**: `/world` (Spatial Digital Twin).

---

### 2. `/world` — World Model & 3D Spatial Topology
- **Purpose**: 3D spatial WebGL visual representation of supply chain nodes (suppliers, ports, warehouses, fulfillment centers).
- **Key Displays**: R3F 3D spatial node graph, node inspector side-drawer (`/world/node/:id`), risk propagation glow lines.
- **Interactive Controls**: OrbitControls (drag/rotate 3D canvas), node selection click, layer filter toggle (All / Suppliers / Warehouses / Ports).
- **Backend API**: `GET /api/v1/twin/state`, `GET /api/v1/graph/nodes/{id}`.
- **WebSocket Events**: `NODE_STATUS_CHANGED`.
- **Next Workspace**: `/intelligence` (Agent Constellation).

---

### 3. `/intelligence` — Agent Constellation & Swarm Deliberation
- **Purpose**: Multi-agent orchestration workspace displaying 7 specialist agents and their deliberation proposals.
- **Key Displays**: 7 Specialist Agent status cards (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience, Coordinator), proposal trade-off radar chart.
- **Interactive Controls**: Agent card expansion click, `"Trigger Deliberation"` button.
- **Backend API**: `GET /api/v1/agents/deliberation`, `POST /api/v1/agents/deliberate`.
- **WebSocket Events**: `DELIBERATION_STARTED`, `AGENT_PROPOSAL_GENERATED`.
- **Next Workspace**: `/response/adversary` (Adversarial Stress Testing).

---

### 4. `/response/adversary` — Adversary & Red Team Stress Testing
- **Purpose**: Adversarial testing environment that Subjects candidate plans to synthetic disruption attacks.
- **Key Displays**: Red team attack vector card, candidate plan failure condition summary, resilience rating score.
- **Interactive Controls**: `"Inject Attack Vector"` button, attack severity slider.
- **Backend API**: `POST /api/v1/adversary/attack`.
- **WebSocket Events**: `ADVERSARY_ATTACK_COMPLETED`.
- **Next Workspace**: `/decision/cockpit` (Decision Cockpit).

---

### 5. `/decision/cockpit` — Decision Cockpit & Pipeline Orchestration
- **Purpose**: Multi-objective Pareto trade-off reconciliation cockpit for plan selection.
- **Key Displays**: Standby launcher cards, active session stage progress rail, Pareto plan comparison table.
- **Interactive Controls**: `"INITIALIZE BASELINE PIPELINE"`, `"INITIALIZE CRISIS PIPELINE"`, `"Approve Plan"`.
- **Backend API**: `GET /api/v1/cockpit/sessions`, `POST /api/v1/cockpit/sessions`.
- **WebSocket Events**: `SESSION_CREATED`, `PLAN_APPROVED`.
- **Next Workspace**: `/decision/verification` (Formal Safety Plane).

---

### 6. `/decision/verification` — Safety & Formal Verification Plane
- **Purpose**: Invariant safety boundary engine enforcing pre-execution constraints.
- **Key Displays**: Safety plane boundary status (**ENFORCED**), constraint assertion table, state difference diff view.
- **Interactive Controls**: `"Verify Plan Invariants"` button.
- **Backend API**: `POST /api/v1/verification/verify`.
- **WebSocket Events**: `VERIFICATION_COMPLETED`.
- **Next Workspace**: `/simulation/twin` (Digital Twin Simulation).

---

### 7. `/simulation/twin` — Digital Twin & Monte Carlo Simulation
- **Purpose**: Discrete event simulation engine running 1,000-trial Monte Carlo robustness tests.
- **Key Displays**: Simulation distribution histogram, SLA protection score (99.2%), CVaR95 cost metric.
- **Interactive Controls**: `"Run Monte Carlo Simulation"` button, trial count input.
- **Backend API**: `POST /api/v1/simulation/monte-carlo`.
- **WebSocket Events**: `MONTE_CARLO_COMPLETED`.
- **Next Workspace**: `/observability/events` (Realtime Telemetry).

---

### 8. `/observability/events` — Real-Time Observability & Telemetry
- **Purpose**: Live event stream log exposing all operational transitions and WebSocket messages.
- **Key Displays**: Log feed table with timestamp, event type, component source, and payload JSON.
- **Interactive Controls**: Log filter dropdown, search query box, clear logs button.
- **Backend API**: `WS /ws`, `GET /api/v1/observability/events`.
- **WebSocket Events**: All system event broadcasts.
- **Next Workspace**: `/learning/deliberate` (Deliberate Learning).

---

### 9. `/learning/deliberate` — Deliberate Learning & Memory Bank
- **Purpose**: Challenger model memory store preserving validated operational outcomes for continuous refinement.
- **Key Displays**: Challenger memory bank list, model accuracy history, promotion status.
- **Interactive Controls**: `"Validate Memory Bank"` button.
- **Backend API**: `GET /api/v1/learning/memory`.
- **WebSocket Events**: `MEMORY_UPDATED`.
- **Next Workspace**: `/governance/resilience` (Resilience OS).

---

### 10. `/governance/resilience` — Resilience OS & Policy Engine
- **Purpose**: Enterprise control plane enforcing policy rules and operational modes.
- **Key Displays**: Policy evaluation rules list, operational mode selector (FULL, DEGRADED_AI, DEGRADED_DATA, SAFE_MODE).
- **Interactive Controls**: Operational mode toggle buttons.
- **Backend API**: `GET /api/v1/resilience/policy`, `POST /api/v1/resilience/mode`.
- **WebSocket Events**: `MODE_CHANGED`.
- **Next Workspace**: `/evaluation` (Evaluation Harness).

---

### 11. `/evaluation` — Model Evaluation & Benchmark Suite
- **Purpose**: Quantitative benchmark harness scoring system performance across 8 supply chain disruption scenarios.
- **Key Displays**: 8 benchmark scenario cards, overall resilience score gauge (94.2%), run history table.
- **Interactive Controls**: `"Run Scenario Benchmark"` button, scenario selector dropdown.
- **Backend API**: `GET /api/v1/evaluation/results`, `POST /api/v1/evaluation/run`.
- **WebSocket Events**: `EVALUATION_COMPLETED`.
