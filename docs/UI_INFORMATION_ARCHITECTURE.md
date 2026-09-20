# FULFILL-X — UI INFORMATION ARCHITECTURE

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. OVERVIEW & SITE TAXONOMY

`FULFILL-X` uses a spatial 3D navigation paradigm anchored by a global top spatial navigation bar, persistent 3D background canvas viewport, situational command palette (`Cmd+K`), contextual breadcrumbs, and floating spatial HUD panels.

---

## 2. DYNAMIC WORKSPACE TAXONOMY & SITE MAP

The site is organized into **11 Primary Visual Environments** containing **38 Dedicated Routes & Sub-Workspaces**:

```
1. HOME ENVIRONMENT ("/")
   └── Atmospheric Spatial Supply Network Overview

2. COMMAND ENVIRONMENT ("/command")
   └── Live Autonomous Operations Command Center

3. WORLD ENVIRONMENT ("/world")
   ├── Interactive Supply-Chain Topology (/world)
   └── World Entity Inspector (/world/node/:id)

4. INTELLIGENCE ENVIRONMENT ("/intelligence")
   ├── AI / Agent Constellation & Predictive Platform (/intelligence)
   ├── Threat & Signal Monitor (/intelligence/signals)
   ├── Risk & Heatmap Explorer (/intelligence/risk)
   ├── Graph Neural Network Topology (/intelligence/gnn)
   └── Causal Hypothesis & Counterfactual Explorer (/intelligence/causal)

5. RESPONSE ENVIRONMENT ("/response")
   ├── Swarm Specialist War Room (/response/war-room)
   ├── Adversarial Chaos Engine (/response/adversary)
   └── Scenario Generator & Injector (/response/scenarios)

6. DECISION ENVIRONMENT ("/decision")
   ├── Multi-Objective Optimization Cockpit (/decision/cockpit)
   ├── Agent Swarm Coordination Panel (/decision/coordination)
   ├── Pareto Candidate Plans Explorer (/decision/plans)
   ├── Verification & Constraint Sandbox (/decision/verification)
   └── Human-in-the-Loop Executive Approval (/decision/approval)

7. SIMULATION ENVIRONMENT ("/simulation")
   ├── Digital Twin Executable Snapshot Workspace (/simulation/twin)
   ├── Monte Carlo Resilience Engine (/simulation/monte-carlo)
   └── Robust Strategy Analyzer & Horizon Comparison (/simulation/strategies)

8. LEARNING ENVIRONMENT ("/learning")
   ├── Continuous Deliberation & Challenger Training (/learning/deliberate)
   ├── Agent Memory & Experience Replay Store (/learning/memory)
   ├── Model Governance & Registry (/learning/models)
   └── Outcome & Feedback Attribution (/learning/outcomes)

9. OBSERVABILITY ENVIRONMENT ("/observability")
   ├── Realtime Event Bus Stream (/observability/events)
   ├── Distributed Traces & Span Inspector (/observability/traces)
   ├── System Telemetry & Performance Metrics (/observability/metrics)
   ├── Resilience Alerts & Signal Log (/observability/alerts)
   └── System Degradation & Health Matrix (/observability/health)

10. GOVERNANCE ENVIRONMENT ("/governance")
    ├── Identity & Authentication Gateway (/governance/identity)
    ├── Multi-Tenant & Workspace Manager (/governance/tenants)
    ├── Policy Engine & Hard Boundary Configurator (/governance/policies)
    ├── Data Platform & Retention Governance (/governance/data)
    ├── Model Safety & Prompt Defense Console (/governance/models)
    ├── Execution Safety Plane & Dry-Run Inspector (/governance/execution)
    └── Immutable Audit Log (/governance/audit)

11. DEMO & EVALUATION ("/demo", "/evaluation")
    ├── Deterministic Demo Scenario Runner (/demo)
    └── Benchmark & Resilience Eval Dashboard (/evaluation)
```

---

## 3. NAVIGATION PARADIGM & SPATIAL OVERLAYS

### Top Spatial Navigation Bar
- **Logo & Environment Selector:** Primary spatial environment dropdown (Command, World, Intelligence, Response, Decision, Simulation, Learning, Observability, Governance).
- **Spatial Mode Switcher:** Toggle between 3D Spatial Canvas View, 2D Topology Graph, and Split Screen HUD.
- **Preset & Seed Controller:** Seed selector (`Seed #42`), Preset configuration (`Healthy`, `Supplier Outage`, `Port Closure`, `Compound Disruption`).
- **Live Network Health Badge:** Realtime composite health score (`94.2%`) with animated glow pulse.
- **Tenant Context Selector:** Displays current Organization (`Org Alpha`) and Workspace (`Production Alpha`) with switcher dropdown.
- **AI Provider Badge:** Displays active AI provider (`Mock Provider`, `Ollama`, `Gemini`, `Bedrock`) with latency indicator.
- **Command Palette Trigger:** Quick search keybind trigger (`Ctrl+K` / `Cmd+K`).
- **User Identity & Auth Gateway:** User avatar with active System Role (`OWNER`, `OPERATOR`, `ANALYST`) and lock status.

### Situational Command Palette (`Cmd+K`)
- Allows instant fuzzy search and quick jump across:
  - Any node or edge in the supply network (`sup-001`, `hub-002`, `port-001`).
  - Any specialist agent (`InventoryAgent`, `LogisticsAgent`, `CoordinatorAgent`, `AdversaryAgent`).
  - Any route or workspace (`/simulation/monte-carlo`, `/decision/approval`, `/observability/events`).
  - Quick action injection (Inject disruption, run Monte Carlo simulation, execute dry-run plan).

### Spatial HUD Overlay System
- Floating, backdrop-blurred panels (`bg-slate-950/75 backdrop-blur-md border border-slate-800/60`).
- Panels can be expanded, minimized, docked, or converted into full-screen workspace views.
- Keyboard shortcuts (`1`-`9`) toggle spatial HUD views.
