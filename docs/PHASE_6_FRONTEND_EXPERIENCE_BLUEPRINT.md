# FULFILL-X — Phase 6A: Frontend Forensic UX Audit & Unified Product Experience Blueprint

> **Document Status:** Authoritative Forensic UX Audit & Architecture Blueprint  
> **Phase:** 6A (Read-Only Analysis & Design on Paper)  
> **Role:** Principal Product Architect & UX Systems Designer  
> **Governance Authority:** AGENTS.md / Master Plan  
> **Date:** September 28, 2026  
> **Rule Compliance:** ZERO CODE WAS MODIFIED. Purely read-only inspection, diagnostic audit, and paper architecture.  

---

## 1. Executive Summary

FULFILL-X has successfully completed six foundational engineering phases:
1. **Phase 1:** Productization & UI Shell
2. **Phase 2A:** Hindsight Core Experiential Memory (Retain, Recall, Reflect)
3. **Phase 3:** Resilience Skills, Boundaries & Version Evolution
4. **Phase 4:** Active Learning Challenge Engine & Counterfactual Probing
5. **Phase 5:** Hindsight Learning Evaluation & Measurable A/B Improvement
6. **Phase 5.5 (Passes 1 & 2):** Legacy Feature Preservation & Route Reconciliation

The repository is now technically complete at the engine, model, and service level: **29 FastAPI routers, 191 endpoints, 20 backend services, 10 specialist and decision agents, and 26 functional frontend workspace views across 313 passing tests**.

### The Core Problem
The product's current bottleneck is **not missing intelligence**, but **fragmentation of the user experience**.
- The system presents 26 distinct workspaces, each functioning as an isolated "silo".
- When an incident occurs in Live Resilience (`CommandWorkspace`), the user must navigate away to the `WarRoomWorkspace` to see specialist agents, manually re-select the origin node in `CausalWorkspace`, re-select the base plan in `AdversaryWorkspace`, re-select the skill in `ChallengeEngineWorkspace`, and navigate to `EvaluationWorkspace` to see whether the system learned.
- Furthermore, five workspaces (`ExperienceMemoryWorkspace`, `ResilienceGenomeWorkspace`, `TransferIntelligenceWorkspace`, `StrategyArenaWorkspace`, `SecurityConsole`) rely on static demo fixtures instead of querying the rich Hindsight REST APIs already implemented in the backend.

### The Objective of Phase 6
To transform FULFILL-X from an assembly of 26 disconnected dashboards into a unified **Resilience Intelligence Operating System** that communicates the continuous operational lifecycle:
$$\text{World} \longrightarrow \text{Observe} \longrightarrow \text{Risk} \longrightarrow \text{Predict} \longrightarrow \text{Deliberate} \longrightarrow \text{Challenge} \longrightarrow \text{Verify} \longrightarrow \text{Execute} \longrightarrow \text{Learn via Hindsight}$$

---

## 2. Current Frontend Architecture

```
frontend/src/
├── api/               # 26 typed REST and WebSocket clients
├── components/        # 72 modular React components
│   ├── auth/          # IdentityGateway modal
│   ├── command/       # CommandCenter components
│   ├── data/          # DataFabric & DataFoundation (Real data platform)
│   ├── demo/          # DemoMode 14-state machine console
│   ├── intelligence/  # BadgesAndGates, Conditions, IntelligenceCards
│   ├── layouts/       # ResilienceIntelligenceLayout (Active shell) & SpatialAppLayout
│   ├── ml/            # PredictiveIntelligence (Forecasting, Anomaly, Drift)
│   ├── security/      # SecurityConsole (RBAC, Multi-tenancy)
│   └── workspaces/    # 25 dedicated workspace surfaces
├── store/             # 6 Zustand stores (agent, appShell, auth, evaluation, realtime, visual)
├── types/             # 24 TypeScript interface definition modules
└── visual/            # 23 design tokens, telemetry cards, and canvas primitives
```

### Build & Dependency Baseline
- **Framework:** React 18.3 + TypeScript 5.5 + Vite 5.4
- **Styling:** Vanilla CSS design system (`index.css`) + Tailwind utilities + Glassmorphism tokens
- **Rendering:** Three.js / `@react-three/fiber` for 3D Spatial Network Twin
- **Data Fetching:** TanStack React Query v5 (`useQuery`, `useMutation`)
- **Real-Time Layer:** Native browser WebSocket client connecting to `/ws`
- **Animation:** `framer-motion` v11

---

## 3. Complete Workspace Inventory (All 26 Exposed Surfaces)

| # | Workspace Component | File Path | Route | LOC | Primary Data Source | API Client | Stores Consumed | Primary User Persona | Core User Question |
|:---:|:---|:---|:---|:---:|:---|:---|:---|:---|:---|
| **1** | `ResilienceDashboard` | `workspaces/ResilienceDashboard.tsx` | `/` | 833 | Mixed (Live World + Static Demo Memory) | `worldApi`, `riskApi` | `useRealtimeStore` | Executive / Judge | "What is the global resilience health of the network?" |
| **2** | `CommandWorkspace` | `workspaces/CommandWorkspace.tsx` | `/command` | 704 | Live Reactive | `worldApi`, `riskApi` | `useRealtimeStore`, `useVisualEnvironmentStore`, `useAppShellStore` | Operations Commander | "What disruptions are active right now across my nodes?" |
| **3** | `WorldWorkspace` | `workspaces/WorldWorkspace.tsx` | `/world` | 335 | Live Reactive (Three.js) | `worldApi` | `useRealtimeStore`, `useVisualEnvironmentStore`, `useAppShellStore` | Network Operations Analyst | "Where are bottlenecks physically located in 3D space?" |
| **4** | `WarRoomWorkspace` | `workspaces/WarRoomWorkspace.tsx` | `/response/war-room` | 155 | Live REST | `learningApi`, `agentApi` | `useAgentStore`, `useVisualEnvironmentStore`, `useRealtimeStore` | Incident Response Lead | "How are the 6 specialist agents coordinating to resolve this incident?" |
| **5** | `AgentConstellationWorkspace` | `workspaces/AgentConstellationWorkspace.tsx` | `/intelligence` | 404 | Live REST | `agentApi` | `useAgentStore`, `useVisualEnvironmentStore`, `useRealtimeStore` | AI Systems Engineer | "What is the status, health, and proposal history of each specialist agent?" |
| **6** | `RiskWorkspace` | `workspaces/RiskWorkspace.tsx` | `/intelligence/risk` | 250 | Live REST | `riskApi`, `worldApi` | `useVisualEnvironmentStore`, `useAppShellStore` | Risk Analyst | "Which downstream facilities will fail if this supplier breaks?" |
| **7** | `GNNWorkspace` | `workspaces/GNNWorkspace.tsx` | `/intelligence/gnn` | 258 | Live REST | `graphIntelligenceApi` | `useVisualEnvironmentStore` | Graph ML Engineer | "What do GraphSAGE multi-hop embeddings reveal about systemic vulnerability?" |
| **8** | `CausalWorkspace` | `workspaces/CausalWorkspace.tsx` | `/intelligence/causal` | 170 | Live REST | `graphIntelligenceApi` | `useVisualEnvironmentStore` | Causal Inference Scientist | "If we override capacity at node X, what is the counterfactual risk delta?" |
| **9** | `PredictiveIntelligence` | `ml/PredictiveIntelligence.tsx` | `/intelligence/predictive` | 556 | Async Fetch | `mlApi` | None | ML Platform Engineer | "What is the predicted demand curve and feature drift across horizons?" |
| **10** | `ExperienceMemoryWorkspace` | `workspaces/ExperienceMemoryWorkspace.tsx` | `/memory` | 354 | Static Local Fixtures | None (Fixture) | None | Resilience Analyst | "What historical recovery decisions were attempted for similar incidents?" |
| **11** | `ResilienceGenomeWorkspace` | `workspaces/ResilienceGenomeWorkspace.tsx` | `/genome` | 281 | Static Local Fixtures | None (Fixture) | None | AI Strategy Architect | "What conditions guarantee success versus catastrophic failure boundaries?" |
| **12** | `TransferIntelligenceWorkspace` | `workspaces/TransferIntelligenceWorkspace.tsx` | `/transfer` | 339 | Static Local Fixtures | None (Fixture) | None | Operations Lead | "Can a strategy learned in the Pacific transfer safely to the Atlantic?" |
| **13** | `DeliberateWorkspace` | `workspaces/DeliberateWorkspace.tsx` | `/learning/deliberate` | 273 | Live REST | `learningApi` | `useVisualEnvironmentStore` | Skills Governance Lead | "What executable resilience skills have evolved and are ready for deployment?" |
| **14** | `ResilienceOSWorkspace` | `workspaces/ResilienceOSWorkspace.tsx` | `/governance/resilience` | 273 | Live REST | `enterpriseApi` | `useVisualEnvironmentStore` | Chief Operating Officer | "Are all 15 stages of the Resilience OS operating cycle healthy?" |
| **15** | `AdversaryWorkspace` | `workspaces/AdversaryWorkspace.tsx` | `/response/adversary-lab` | 182 | Live REST | `adversaryApi` | `useVisualEnvironmentStore` | Red-Team Chaos Engineer | "What happens when our candidate plans are hit by 12 chaos attack vectors?" |
| **16** | `ChallengeEngineWorkspace` | `workspaces/ChallengeEngineWorkspace.tsx` | `/challenge` | 626 | Live Async Fetch | `challengeApi` | None | Active Learning Scientist | "Under what gradient parameter conditions will this learned skill fail?" |
| **17** | `StrategyArenaWorkspace` | `workspaces/StrategyArenaWorkspace.tsx` | `/arena` | 334 | Static Local Fixtures | None (Fixture) | None | Strategy Planner | "Which candidate plan dominates on the Pareto frontier?" |
| **18** | `CockpitWorkspace` | `workspaces/CockpitWorkspace.tsx` | `/decision/cockpit` | 353 | Live REST | `cockpitApi` | `useVisualEnvironmentStore` | Human Incident Commander | "Do I approve this reconciled recovery plan for autonomous execution?" |
| **19** | `VerificationWorkspace` | `workspaces/VerificationWorkspace.tsx` | `/decision/verification` | 216 | Live REST | `verificationApi` | `useAgentStore`, `useVisualEnvironmentStore` | Safety & Compliance Auditor | "Does the proposed plan satisfy all capacity, route, and stockout invariants?" |
| **20** | `DigitalTwinWorkspace` | `workspaces/DigitalTwinWorkspace.tsx` | `/simulation/twin` | 203 | Live REST | `simulationApi`, `worldApi` | `useVisualEnvironmentStore` | Simulation Engineer | "What is the P90/P99 latency across 1,000 Monte Carlo stochastic runs?" |
| **21** | `GovernanceWorkspace` | `workspaces/GovernanceWorkspace.tsx` | `/governance/policies` | 273 | Live REST | `enterpriseApi` | `useVisualEnvironmentStore` | Enterprise Governance Officer | "Are automated actions constrained by policy boundaries and authorization gates?" |
| **22** | `SecurityConsole` | `security/SecurityConsole.tsx` | `/security/console` | 233 | Static Local Model Data | None (Local Store) | `useAuthStore` | Chief Information Security Officer | "Are tenant data boundaries and RBAC permissions strictly enforced?" |
| **23** | `DataFabric` | `data/DataFabric.tsx` | `/data/fabric` | 460 | Async Fetch | `dataIngestionApi` | None | Data Platform Engineer | "What is the data quality score and entity resolution match across ingestion sources?" |
| **24** | `EventsWorkspace` | `workspaces/EventsWorkspace.tsx` | `/observability/events` | 284 | Live Reactive | `observabilityApi` | `useVisualEnvironmentStore`, `useRealtimeStore` | Site Reliability Engineer | "What raw events are flowing through the WebSocket telemetry bus?" |
| **25** | `EvaluationWorkspace` | `workspaces/EvaluationWorkspace.tsx` | `/evaluation` | 921 | Live REST | `evaluation`, `hindsightEvalApi` | `useVisualEnvironmentStore` | AI Evaluator / Judge | "Does the Hindsight agent provably outperform the Memoryless agent?" |
| **26** | `DemoMode` | `demo/DemoMode.tsx` | `/demo` | 257 | Async Fetch | `demoApi` | None | Hackathon Judge / Presenter | "How does the platform handle the 5 canonical competition scenarios end-to-end?" |

---

## 4. Navigation & Hierarchy Analysis

### Strengths of Current Navigation
- Pass 2 successfully categorized all 26 workspaces into 7 clear sections (`Operations`, `Deep Intelligence`, `Experiential Intelligence`, `Response & Stress Testing`, `Decision & Safety`, `Simulation`, `Governance & Platform`).
- Clean, scrollable sidebar layout prevents visual clutter.
- Zero route collisions; 100% of links resolve.

### Fundamental UX Defects
1. **Flat "26 Destination" Cognitive Overload:**
   While the navigation is grouped, users must decide which of 26 screens to look at. A user experiencing an alert cannot easily tell whether they should go to `CommandWorkspace`, `WarRoomWorkspace`, `RiskWorkspace`, or `CockpitWorkspace`.
2. **Lack of Lifecycle Flow:**
   The navigation presents workspaces as static reference pages rather than a linear or cyclical response workflow (`Incident` $\to$ `Analysis` $\to$ `Decision` $\to$ `Execution` $\to$ `Learning`).
3. **No Progressive Disclosure:**
   Deep specialist tools (like `GNNWorkspace`, `CausalWorkspace`, `VerificationWorkspace`) receive equal top-level visual weight alongside executive control centers like `CommandWorkspace`.

---

## 5. Major UX Problems Identified

### Problem 1: "The Context Reset Dilemma"
Every time a user clicks a new navigation link, the application forgets what the user was inspecting:
- If a user clicks node `sup-001` in `CommandWorkspace`, navigating to `CausalWorkspace` resets the target node to default `sup-001`.
- Navigating to `RiskWorkspace` requires manual re-selection.
- Navigating to `AdversaryWorkspace` does not pre-load the candidate plan generated by the active incident.
- **Root Cause:** State is stored in local component `useState` hooks rather than a shared `ResilienceContextStore`.

### Problem 2: "The Mock Data Disconnect in Hindsight Screens"
- `ExperienceMemoryWorkspace`, `ResilienceGenomeWorkspace`, and `TransferIntelligenceWorkspace` render hardcoded array literals (`exp-001`, `exp-002`, `exp-003`).
- Meanwhile, the backend already exposes real endpoints:
  - `GET /api/hindsight/status`
  - `POST /api/hindsight/recall`
  - `GET /api/evaluation/learning/traces`
- This disconnect creates the impression that Hindsight is a UI mockup, even though the backend implementation is 100% operational and verified by 64 passing tests.

### Problem 3: "Fragmented Decision Journey"
Making a decision currently requires jumping across 4 separate tabs:
1. `WarRoomWorkspace` (view agent proposals)
2. `AdversaryWorkspace` (stress-test plans against attack vectors)
3. `VerificationWorkspace` (inspect capacity and stockout invariant checks)
4. `CockpitWorkspace` (click "Approve Plan")
No unified console stitches these verification gates together into a single decision progression.

### Problem 4: "Hidden Demonstration Proof"
The most powerful mathematical differentiator in FULFILL-X is the **Phase 5 A/B benchmark** proving that Hindsight reduces repeated mistakes from 36.7% to 0.0% and increases recovery from 43.3% to 93.3%. This is currently buried on the second tab of `/evaluation` and is completely invisible on the primary landing dashboard.

---

## 6. Information Architecture: Proposed 3-Tier Model

Rather than 26 flat sidebar items, the future frontend must implement **Progressive Disclosure across 3 Tiers**:

```
TIER 1: EXECUTIVE & ACTIVE WORKFLOW (Primary Sidebar)
├── Command Center (Live World, Active Incidents, Unified Threat Matrix)
├── Decision Cockpit (Reconciled Plans, Adversarial Challenge, Safety Gates, Approval)
├── Experiential Intelligence (Hindsight Memory, Genome, Learned Skills, Transferability)
└── System Evaluation (A/B Learning Benchmark, Proved Metrics, Competition Demo)

TIER 2: DEEP INTELLIGENCE STUDIOS (Accessible via Context Links / Workspace Sub-tabs)
├── Graph & Causal Studio (GNN Multi-hop Diffusion + Causal DAG Sandbox)
├── Multi-Agent War Room (Specialist Constellation + Deliberation Pipeline)
├── Stress & Simulation Lab (Adversary Chaos Suite + 1,000-Run Monte Carlo Twin)
└── Predictive ML Studio (Demand Forecasting, Disruption Probability & Drift)

TIER 3: ENTERPRISE PLATFORM & GOVERNANCE (Drawer / Footer Platform Console)
├── Resilience OS Control Plane (15-Stage Cycle Monitoring)
├── Policy & RBAC Console (Zero-Trust Security & Policy Boundaries)
├── Data Ingestion Fabric (Canonical Sources, Entity Resolution, Quality)
└── Telemetry Stream (Live WebSocket Event Bus & Log Replay)
```

---

## 7. Audit of the Hindsight Experience (Experiential Learning Loop)

### Current Chain Analysis:
```text
Incident ──[DISCONNECTED]──> Experience ──[FIXTURE ONLY]──> Memory ──[STATIC]──> Genome
  │                                                                                │
[NO LINK]                                                                      [NO LINK]
  ▼                                                                                ▼
Skill ◄──[LIVE REST]── Challenge Engine ──[STANDALONE]──> Evaluation ──[ISOLATED TAB]
```

### Forensic Findings:
1. **Recall Visualizer is Missing:** When an agent acts in `CockpitWorkspace` or `CommandWorkspace`, the UI does not display *which* historical memory ID was recalled to inform the decision.
2. **Boundary Warning Pill is Disconnected:** When a skill is threatened by a capacity boundary violation (e.g. `capacity < 40%`), the UI does not visually cite the Genome boundary that triggered the warning.
3. **Evolution Provenance is Buried:** When a skill evolves from Version 1.0 to Version 2.0 (in `DeliberateWorkspace`), the counterfactual challenge evidence that triggered the evolution is not linked.

### Required Future UI Connection:
Every decision card must render a **Hindsight Evidence Drawer** showing:
`Recalled Experience ID` $\to$ `Genome Precondition` $\to$ `Failure Boundary` $\to$ `Skill Confidence Delta`.

---

## 8. Audit of the Historical Intelligence Experience

| Historical Subsystem | Current UX State | Missing Visual Context | Target Coexistence Model |
|:---|:---|:---|:---|
| **GNN Multi-Hop Propagation** | Interactive GraphSAGE node graph with hop radius slider | Disconnected from active world node selection | When clicking an affected warehouse on the 3D map, GNN multi-hop diffusion should render directly as an overlay panel. |
| **Causal DAG Sandbox** | Cause $\to$ Mechanism $\to$ Effect DAG with counterfactual overrides | Uses static origin node `sup-001` | Should auto-populate with the root-cause node of the active incident. |
| **Predictive ML Platform** | 5-tab interface (Forecasting, Disruption, Anomaly, Drift, Registry) | Operates in isolation from incident response | Disruption probability curves should feed directly into the Risk Explorer and Decision Cockpit. |
| **Specialist Agents** | 6 hexagon cards with reasoning chains | Output is not visually juxtaposed against the Coordinator's reconciled Plan A/B/C | Agents' divergent objectives should be compared side-by-side in a multi-objective radar chart. |
| **Adversary Attack Lab** | 12 attack vector cards with severity and impact deltas | Disconnected from the new Challenge Engine | Red-team chaos attacks (plan-level) and Challenge probes (skill-level) should be framed as complementary stress testing. |
| **Monte Carlo Twin** | Probability distribution chart with P50/P90/P99 markers | Isolated simulation run | Monte Carlo percentiles should appear directly inside the Decision Cockpit before plan approval. |

---

## 9. Audit of Decision & Safety (Approval Gates)

### Current Gap Analysis:
- `CockpitWorkspace` provides a clean 8-stage progress bar and approval button.
- However, the **safety verification checks** (capacity constraints, transport routes, inventory stockout prevention) live in a completely separate workspace (`VerificationWorkspace`).
- The **policy checks** (cost ceiling, SLA floor, authorization authority) live in another workspace (`GovernanceWorkspace`).
- **Result:** An executive in the Cockpit is asked to click "Approve" without seeing the verification diff and policy clearance on the same screen!

### Unified Decision Cockpit Blueprint:
The Decision Cockpit must integrate a **Three-Pillar Clearance Gate**:
1. **Invariant Safety:** Capacity & route checks (from `VerificationEngine`)
2. **Enterprise Policy:** Cost & SLA constraints (from `PolicyEngine`)
3. **Hindsight Clearance:** Memory recall confirming no failure boundary violation (from `HindsightEngine`)

---

## 10. Audit of Digital Twin 3D Spatial Network

### Current State:
- `WorldWorkspace` renders Three.js nodes (suppliers, ports, warehouses, retail centers) in 3D coordinates.
- Nodes pulse with risk colors (`#34c77b` healthy, `#f5a623` warning, `#e8503a` critical).
- Camera controls allow rotation, zoom, and node selection.

### Forensic Findings:
- The 3D view is currently treated as an isolated screen (`/world`).
- When an incident occurs in `CommandWorkspace`, the 3D world is invisible unless the user navigates away.
- **Recommendation:** Do NOT remove or simplify Three.js. Instead, introduce a **Split-View / Ambient Spatial Mode** where the 3D world can be viewed as an interactive contextual canvas behind or alongside the Command Center.

---

## 11. UI Consistency Audit

| Design Element | Current Inconsistencies | Recommended Standard |
|:---|:---|:---|
| **Status Badges** | 6 different implementations across `StatusPill.tsx`, `BadgesAndGates.tsx`, and inline tags | Standardize on `ResilienceBadge` with strict semantic levels: `HEALTHY`, `INFO`, `WARNING`, `CRITICAL`, `LEARNING` |
| **Cards & Panels** | Mixed inline CSS border styling vs `glass-panel` class | Standardize on `GlassCard` primitive with consistent `rgba(255,255,255,0.06)` border and backdrop blur |
| **Headers** | Varied page headers; some use `AtmosphereLayer`, others use plain flex headers | Unified `WorkspaceHeader` with title, subtitle, live status indicator, and breadcrumb |
| **Evidence Display** | Raw JSON snippets vs custom tables vs bulleted lists | Unified `EvidenceInspector` component supporting collapsible provenance trees |
| **Truth Status** | Simulated data and observed data often look visually identical | Enforce `TruthTag`: `[OBSERVED]` (cyan) vs `[SIMULATED]` (purple) vs `[PREDICTED]` (amber) |

---

## 12. Data Visualization Audit

### Current Visualization Inventory:
1. **Recharts Line & Bar Charts:** Demand forecasting, loss curves, A/B learning gains.
2. **Custom SVG Risk Heatmaps:** Node risk matrix, correlation grid.
3. **SVG DAG Primitives:** `CausalDAGPrimitive.tsx`, `GNNGraphPrimitive.tsx`.
4. **Three.js Particle & Node Canvases:** Global 3D particle canvas, spatial world.
5. **Timeline Steppers:** 15-stage Resilience OS cycle, 8-stage Cockpit stepper, Demo timeline.

### Critical Rule for Visualization:
The UI must **never conflate Observed and Simulated data**:
- **Observed / Ground Truth:** Solid borders, cyan glow, `#38bdf8`.
- **Simulated / Synthetic:** Dashed borders, purple glow, `#a855f7`.
- **Predicted / ML:** Dotted borders, amber glow, `#f59e0b`.

---

## 13. State Management Audit

### Current State Landscape:
- 6 Zustand stores (`agentStore`, `appShellStore`, `authStore`, `evaluationStore`, `realtimeStore`, `visualEnvironmentStore`).
- TanStack Query caches REST queries with keys like `['worldSnapshot']`, `['riskMap']`, `['adversaryStatus']`.
- Individual workspaces store selection state locally via `useState`.

### Major Architectural Gap:
There is no store that tracks the **Active Investigation Session**:
```typescript
interface ActiveInvestigationContext {
  incidentId: string | null;
  affectedNodeId: string | null;
  rootCause: string | null;
  activePlanId: string | null;
  activeSkillId: string | null;
  recalledExperienceIds: string[];
  simulationRunId: string | null;
}
```
Creating this context store will allow a user to click a disruption in the Command Center, navigate to GNN, Causal, Adversary, Cockpit, or Memory, and find the same incident pre-loaded everywhere.

---

## 14. API & Data Reality Audit

```
┌─────────────────────────────────────────────────────────────┐
│ DATA REALITY SPECTRUM IN FULFILL-X                          │
├──────────────────────────┬──────────────────────────────────┤
│ LIVE REACTIVE (WS + API) │ Command, World, WarRoom, Events  │
├──────────────────────────┼──────────────────────────────────┤
│ LIVE REST VERIFIED       │ GNN, Causal, Cockpit, Adversary, │
│                          │ Verification, Twin, Evaluation   │
├──────────────────────────┼──────────────────────────────────┤
│ ASYNC BACKEND CONNECTED  │ DataFabric, ChallengeEngine,     │
│                          │ PredictiveIntelligence, DemoMode │
├──────────────────────────┼──────────────────────────────────┤
│ STATIC FIXTURES (GAP)    │ ExperienceMemory, Genome,        │
│                          │ Transfer, StrategyArena          │
└──────────────────────────┴──────────────────────────────────┘
```
**Action Item for Phase 6:** Replace static arrays in `ExperienceMemoryWorkspace`, `ResilienceGenomeWorkspace`, and `TransferIntelligenceWorkspace` with live queries to `hindsightApi` (`/api/hindsight/*`).

---

## 15. Demo Experience Audit (The Hackathon Presentation Journey)

The existing `DemoMode` runs a 14-state machine across 5 scenarios. However, the judge presentation journey can be dramatically improved by supporting a **Guided 3-Minute Storyboard Mode**:

```text
[MINUTE 1: DISRUPTION & INABILITY TO ADAPT]
1. Inject Disruption: Port Congestion / Supplier Failure
2. Memoryless Agent attempts static policy -> REPEATS MISTAKE -> High Risk persists.

[MINUTE 2: THE HINDSIGHT BREAKTHROUGH]
3. Hindsight activates: Recalls identical failure episode exp-002.
4. Identifies Failure Boundary: "Capacity < 40% causes bottleneck collapse".
5. Evolves Skill: Re-routes through dynamic multi-modal alternative.

[MINUTE 3: PROVEN RECOVERY & ADAPTIVE AUTONOMY]
6. Verification & Policy Pass with zero violations.
7. Executive Approval in Cockpit -> Outcome measured -> Retained into memory.
8. Evaluation Benchmark displays: 93.3% recovery, 0.0% repeated mistake rate.
```

---

## 16. "First 60 Seconds" Audit (Judge Perspective)

- **0–10 Seconds:** Judge lands on `/`. Currently sees glassmorphic metric cards and a live status dot. Thinks: *"Looks like an impressive supply chain telemetry dashboard."*
- **10–30 Seconds:** Judge scrolls down. Sees "Experience Memory" and "Resilience Genome". Thinks: *"Interesting terminology, but is this just static text?"*
- **30–60 Seconds:** Judge clicks a sidebar link. Enters `CommandWorkspace` or `GNNWorkspace`. Thinks: *"There's a lot of deep technology here, but how does the AI actually learn from its mistakes?"*
- **Verdict:** The landing page currently conceals its most compelling superpower: **the proof of experiential learning**.
- **Fix:** The top hero card of the landing page must immediately feature the **Hindsight Learning Gain Banner**:
  > *"Systemic Resilience Intelligence: Proven 93.3% recovery success vs 43.3% memoryless baseline across 30 canonical disruption episodes."*

---

## 17. Hero Experience Recommendation

The primary hero experience should NOT be a passive dashboard. It should be the **Interactive Resilience Command Center & Decision Flow**:
1. **Primary Hero:** Unified `CommandCenter` featuring live disruption telemetry on the left, agent deliberation and counterfactual causal graph in the center, and the Hindsight Memory & Failure Boundary Shield on the right.
2. **Secondary Hero:** The `EvaluationWorkspace` A/B benchmark proof panel showing memoryless failure vs hindsight success with interactive causal traces.

---

## 18. Future Frontend Architecture (On Paper)

```
APPLICATION SHELL (ResilienceIntelligenceLayout)
│
├── TopBar: System Status | Active Incident Banner | Global Preset/Seed | Quick Actions
│
├── Workspace Router (Active View)
│
└── Shared Drawers & Context Modals:
    ├── Global Incident Context Bar (persistent active disruption)
    ├── Hindsight Evidence Drawer (recalled memories, genome boundaries)
    ├── Decision Clearance Modal (verification + policy clearance)
    └── 3D Spatial Twin Picture-in-Picture (floating Three.js canvas)
```

---

## 19. Cross-Workspace Context Model (Detailed Schema)

```typescript
// Proposed store/incidentContextStore.ts
export interface IncidentContextState {
  // Current active operational disruption
  activeIncident: {
    id: string;
    title: string;
    affectedNodeId: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: string;
  } | null;

  // Causal & GNN focus
  selectedNodeId: string | null;
  hopRadius: number;

  // Decision & Strategy focus
  selectedCandidatePlan: 'A' | 'B' | 'C' | null;
  activeSkillId: string | null;

  // Hindsight trace
  recalledExperiences: string[];
  activeBoundaries: string[];
  learningDelta: number | null;

  // Actions
  setActiveIncident: (incident: any) => void;
  setSelectedNode: (nodeId: string) => void;
  clearContext: () => void;
}
```

---

## 20. Command Center Blueprint

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: RESILIENCE OS v2.0 | ACTIVE INCIDENT: Port of Shanghai Disruption (CRITICAL)   │
├─────────────────────────┬───────────────────────────────┬──────────────────────────────┤
│ 1. LIVE WORLD & RISK    │ 2. REASONING & SIMULATION     │ 3. HINDSIGHT & LEARNING SHIELD│
│                         │                               │                              │
│ • Spatial Network Graph │ • Causal Root Cause DAG       │ • 3 Recalled Past Experiences│
│ • 4 Disrupted Nodes     │ • GNN Multi-hop Diffusion     │ • Active Failure Boundary:   │
│ • Direct Risk: 0.82     │ • 3 Specialist Proposals      │   "Capacity < 40% BLOCKS"    │
│ • BFS Propagation: 3 hops│ • Monte Carlo P90: 4.2h       │ • Proposed Skill: v2.1       │
│                         │ • Adversary Red-Team: PASS    │ • Confidence: 91% (+14%)     │
├─────────────────────────┴───────────────────────────────┴──────────────────────────────┤
│ ACTION BAR: [Inspect Causal DAG] [Probing Sandbox] [Clear Invariants] [APPROVE PLAN]  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 21. Hindsight Experience Blueprint

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ THE HINDSIGHT EXPERIENTIAL INTELLIGENCE PIPELINE                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [1. INCIDENT]  ───►  [2. RECALL]   ───►  [3. REFLECT]  ───►  [4. SKILL EVOLUTION]     │
│  Supplier B           Recalled            Genome identifies    Skill v1.0 evolves to   │
│  Capacity 38%         exp-002 (Failure)   Failure Boundary:    v2.0 with dynamic       │
│                       under similar load  "Cap < 40% fails"    precondition check      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [5. ACTIVE CHALLENGE] ───► [6. DECISION CLEARANCE] ───► [7. OUTCOME & RETAIN]         │
│  Challenge Engine tests      Safety Invariants: PASS      Plan executes in 3.2h        │
│  gradient boundary at 39%    Policy Rules: PASS           Success confirmed.           │
│  Result: Validated           Cockpit Approved             Retained as exp-031.         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 22. Shared Component System Requirements

1. **`StatusPill` / `ResilienceBadge`:** Semantic status tagging.
2. **`GlassCard`:** Universal container with standardized padding, border, and glow.
3. **`TruthBadge`:** `[OBSERVED]` vs `[SIMULATED]` vs `[PREDICTED]`.
4. **`EvidenceDrawer`:** Expandable side drawer revealing memory traces and boundary proofs.
5. **`RadarComparison`:** Multi-objective radar chart comparing candidate plan trade-offs.
6. **`ConfidenceGauge`:** Circular SVG gauge displaying AI reasoning confidence.
7. **`BoundaryWarningBanner`:** High-visibility banner when an action approaches a failure boundary.

---

## 23. Performance Recommendations

1. **Route-Level Code Splitting:** Use `React.lazy()` for heavyweight views (`WorldWorkspace` with Three.js, `EvaluationWorkspace`, `PredictiveIntelligence`).
2. **Three.js Asset Management:** Cache particle geometries and materials across workspace changes.
3. **WebSocket Message Throttling:** Ensure high-frequency WebSocket telemetry events are batched at 100ms intervals to prevent unnecessary React re-renders.

---

## 24. Accessibility Recommendations

1. **ARIA Roles on Interactive Elements:** Add `role="tab"`, `aria-selected`, and `aria-expanded` across workspace navigation and drawers.
2. **Keyboard Navigation:** Ensure modals (`SignalInjectorModal`, `IdentityGateway`) trap focus properly and close on `Escape`.
3. **Color Contrast:** Verify that text over glassmorphic panels satisfies WCAG AA contrast ratio ($\ge 4.5:1$).

---

## 25. Responsive Design Recommendations

1. **Desktop-First Priority (1440px+):** Command Center, Cockpit, and 3D Twin require multi-pane layouts.
2. **Laptop Optimization (1024px–1439px):** Sidebar auto-collapses to icons; 3-column layouts stack into 2 columns.
3. **Tablet Compatibility (768px–1023px):** Workspaces display primary metric cards and tables; 3D view switches to static 2D topology map.
4. **Mobile Screens (<768px):** Explicitly marked "Enterprise Desktop Experience" with high-level KPI cards and incident alerts only.

---

## 26. Phase 6 Implementation Order (Proposed Roadmap)

```text
PHASE 6A: Forensic UX Audit & Experience Blueprint (CURRENT — COMPLETE)
   ↓
PHASE 6B: Shared Design System & Token Standardization (tokens, GlassCard, StatusBadge, TruthTag)
   ↓
PHASE 6C: Global Context & Active Incident Store (IncidentContextStore, persistent threat thread)
   ↓
PHASE 6D: Unified Resilience Command Center (integrated 3-column observation, reasoning, Hindsight)
   ↓
PHASE 6E: Live Hindsight Experience Integration (wire ExperienceMemory & Genome to real APIs)
   ↓
PHASE 6F: Coordinated Decision & Clearance Cockpit (integrate Verification & Policy into Cockpit)
   ↓
PHASE 6G: Deep Intelligence Studios Progressive Disclosure (GNN, Causal DAG, Predictive ML studio)
   ↓
PHASE 6H: Guided Competition Demo Storyboard & Evaluation Hero Experience
   ↓
PHASE 6I: Production Performance, Accessibility & Responsive Hardening
```

---

## 27. Risk Register

| Risk ID | Description | Severity | Mitigation Strategy |
|:---:|:---|:---:|:---|
| **R-01** | Refactoring workspaces could break historical backend integrations | **HIGH** | Strict zero-modification rule for backend services; frontend components only consume existing APIs. |
| **R-02** | Three.js performance degradation on lower-end devices | **MEDIUM** | Provide toggle between 3D Spatial Twin and lightweight 2D SVG Network view. |
| **R-03** | Cognitive overload from too many interconnected telemetry panels | **HIGH** | Enforce Progressive Disclosure: Tier 1 summary view with click-to-expand Tier 2 detail drawers. |
| **R-04** | Accidental regression of Phase 5 Hindsight Evaluation benchmarks | **HIGH** | Run full `pytest` regression after every frontend change. |

---

## 28. Files Expected to Change During Phase 6 Implementation

- `frontend/src/store/incidentContextStore.ts` (New store)
- `frontend/src/visual/tokens.ts` (Standardized design tokens)
- `frontend/src/components/common/Navbar.tsx` (Context-aware header)
- `frontend/src/components/layouts/ResilienceIntelligenceLayout.tsx` (Tiered navigation)
- `frontend/src/components/workspaces/ResilienceDashboard.tsx` (Hero learning banner & real API links)
- `frontend/src/components/workspaces/CommandWorkspace.tsx` (Incident context broadcast)
- `frontend/src/components/workspaces/ExperienceMemoryWorkspace.tsx` (Live API integration)
- `frontend/src/components/workspaces/ResilienceGenomeWorkspace.tsx` (Live API integration)
- `frontend/src/components/workspaces/CockpitWorkspace.tsx` (Clearance gate integration)

---

## 29. Files That MUST NOT Change (Preservation Boundaries)

```text
CRITICAL BACKEND PRESERVATION (READ-ONLY):
├── backend/app/agents/          (All 10 specialist and decision agents)
├── backend/app/services/        (All 20 backend services)
├── backend/app/models/          (All ORM and domain models)
├── backend/app/api/             (All 29 FastAPI routers)
├── backend/app/graph/           (GNN models, SAGE, GAT, Causal DAG)
├── backend/app/simulation/      (Monte Carlo 1,000-run engine)
├── backend/app/ml/              (Predictive models, feature store, drift)
├── backend/app/hindsight/       (Retain, recall, reflect, genome)
├── backend/app/skills/          (Resilience skills registry, evolution)
├── backend/app/challenge/       (Active learning challenge engine)
├── backend/app/hindsight_eval/  (Canonical 30-episode A/B benchmark)
└── backend/tests/               (All 68 test files, 313 test cases)
```

---

## 30. Acceptance Criteria for Phase 6

- [ ] All 26 workspaces maintain 100% route reachability.
- [ ] Active incident context seamlessly persists when navigating across workspaces.
- [ ] Hindsight screens (`/memory`, `/genome`, `/transfer`) fetch from live backend APIs.
- [ ] Landing page immediately highlights the proven Phase 5 Hindsight learning gain (93.3% vs 43.3%).
- [ ] Decision Cockpit displays unified Invariant Safety, Enterprise Policy, and Hindsight Memory clearance gates.
- [ ] `tsc && vite build` succeeds with zero errors.
- [ ] Pytest suite maintains 100% pass rate.
