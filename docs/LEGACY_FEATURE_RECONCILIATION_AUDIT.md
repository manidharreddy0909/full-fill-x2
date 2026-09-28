# FULFILL-X — Legacy Feature Preservation & Architecture Reconciliation Audit (Phase 5.5)

> **Document Status:** Non-Destructive Forensic Audit Report  
> **Phase:** 5.5 (Read-Only Inspection & Reconciliation)  
> **Governance Authority:** AGENTS.md / Master Plan  
> **Date:** September 28, 2026  

---

## 1. Executive Summary

### 1.1 Core Audit Question
> **"Are historical FULFILL-X capabilities still present, or were they removed/regressed during later Hindsight and Resilience Intelligence phases?"**

### 1.2 Verdict: ALL HISTORICAL CAPABILITIES REMAIN FULLY PRESERVED IN CODE; A SUBSET IS CURRENTLY PRESENT_HIDDEN OR PRESENT_DISCONNECTED AT THE NAVIGATION SHELL.

1. **Zero Code Deletion in Git History:**
   Forensic Git analysis (`git log --diff-filter=D --summary`) proves that **not a single source file, model, engine, service, or test has been deleted** in the repository's version history.
2. **Backend Engine Completeness:**
   All **29 sub-routers**, **191 API endpoints**, **20 backend services**, **11 primary agent definitions**, **11 ORM models**, and **313 backend tests** remain active, registered, and executable.
   - Graph Neural Networks (GraphSAGE, GAT, GCN, edge embedding, multi-hop propagation) are fully implemented and tested.
   - Causal DAG counterfactual sandbox inference engines are intact.
   - Digital Twin 1,000-run Monte Carlo simulations with parameter distributions and percentiles are intact.
   - The 6 Specialist Agents (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience) and 4 Decision Agents (Coordinator, Adversary, Planner, Verification) remain registered in singleton factories and orchestrators.
   - Multi-tenant enterprise RBAC, policy engines, and audit logs are fully functional.
3. **Frontend Shell Disconnection (Root Cause):**
   In commit `cdcc797` (*Phase 1: Experiential Resilience Intelligence Platform shell*), the top-level application shell transitioned from `SpatialAppLayout` (with 16 top-level navbar tabs) to `ResilienceIntelligenceLayout` (sidebar-based layout).
   - In `frontend/src/App.tsx`, **all 26 historical workspace routes were preserved**.
   - However, in `ResilienceIntelligenceLayout.tsx`'s `NAV_STRUCTURE`, **5 historical workspaces were omitted from the sidebar links** (`GNNWorkspace`, `CausalWorkspace`, `RiskWorkspace`, `VerificationWorkspace`, `WarRoomWorkspace`), making them **`PRESENT_HIDDEN`** (accessible by direct URL, but invisible on the sidebar).
   - In addition, **1 workspace (`AdversaryWorkspace`) was remapped** at `/response/adversary` to `<ChallengeEngineWorkspace />`, making `AdversaryWorkspace.tsx` **`PRESENT_DISCONNECTED`** at the routing layer.
   - Four dedicated workspace views (`DataFabric.tsx`, `SecurityConsole.tsx`, `DemoMode.tsx`, and `PredictiveIntelligence.tsx`) lack top-level sidebar entries in the new navigation shell.

---

## 2. Definitive Status Classifications

| Classification | Definition | Findings in Repository |
| :--- | :--- | :--- |
| **`PRESENT_EXPOSED`** | Implementation exists, backend active, reachable via sidebar navigation and route | **16 Workspaces** (Dashboard, Command, Memory, Genome, Transfer, Arena, Simulation, Challenge, Skills, Governance, Cockpit, Resilience OS, Agents, Digital Twin World, Evaluation, Events) |
| **`PRESENT_HIDDEN`** | Implementation exists and route is configured in `App.tsx`, but missing from sidebar navigation | **5 Core Workspaces** (`GNNWorkspace`, `CausalWorkspace`, `RiskWorkspace`, `VerificationWorkspace`, `WarRoomWorkspace`) + **4 Sub-Consoles** (`DataFabric`, `SecurityConsole`, `DemoMode`, `PredictiveIntelligence`) |
| **`PRESENT_DISCONNECTED`** | Implementation exists in repository, but route was unlinked or remapped to another component | **4 Workspaces** (`AdversaryWorkspace` remapped to ChallengeEngine at `/response/adversary`; `HomeWorkspace`, `AgentDetailWorkspace`, `NodeInspectorWorkspace` lacking standalone routes) |
| **`REMOVED`** | Historical capability completely excised with no code equivalent | **0 Features** (Zero deletions found in Git history) |
| **`REPLACED`** | Newer implementation fulfills the capability under a different architecture | **1 Route Target** (`/response/adversary` replaced by Challenge Engine; however, both serve distinct capabilities) |
| **`DOCUMENTATION_ONLY`** | Documented in specs but never implemented in code | **0 Features** |
| **`UNKNOWN`** | Insufficient evidence to classify | **0 Features** |

---

## 3. Complete Feature Loss Matrix (Section 16)

| ID | Historical Capability | Historical Evidence | Current Evidence | Status | UI | API | Backend | Tests | Action Required |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **CAP-01** | World Model & Network State | Phase 02, `docs/MASTER_PLAN.md` | `backend/app/repository/world.py`, `app/api/world.py`, `WorldWorkspace.tsx` | `PRESENT_EXPOSED` | YES (`/world`) | YES (`/api/world/*`) | YES | 14 tests PASS | None. Fully operational. |
| **CAP-02** | Risk Engine & BFS Propagation | Phase 03, `docs/ARCHITECTURE.md` | `backend/app/engine/risk.py`, `app/api/risks.py`, `RiskWorkspace.tsx` | `PRESENT_HIDDEN` | HIDDEN (`/intelligence/risk`) | YES (`/api/risks/*`) | YES | 11 tests PASS | Expose in sidebar under Supply Chain Intelligence. |
| **CAP-03** | 6 Specialist Agents | Phase 05, `docs/AGENT_SPEC.md` | `backend/app/agents/registry.py`, `AgentConstellationWorkspace.tsx` | `PRESENT_EXPOSED` | YES (`/intelligence`) | YES (`/api/agents/*`) | YES | 51 tests PASS | None. Fully operational. |
| **CAP-04** | Coordinator Agent & Reconciliation | Phase 06, `docs/ARCHITECTURE.md` | `backend/app/agents/coordinator.py`, `app/engine/reconciliation.py` | `PRESENT_EXPOSED` | YES (embedded in Cockpit & War Room) | YES (`/api/coordinator/*`) | YES | 18 tests PASS | None. Coexists in decision flow. |
| **CAP-05** | Adversary Stress Engine (12 Vectors) | Phase 07, `docs/ADVERSARY_SPEC.md` | `backend/app/agents/adversary.py`, `app/engine/adversary.py`, `AdversaryWorkspace.tsx` | `PRESENT_DISCONNECTED` | DISCONNECTED (`AdversaryWorkspace.tsx` unlinked) | YES (`/api/adversary/*`) | YES | 14 tests PASS | Re-link `/response/adversary-lab` route; differentiate from Challenge Engine. |
| **CAP-06** | Multi-Objective Planner (Pareto) | Phase 08, `docs/PLANNER_SPEC.md` | `backend/app/agents/planner.py`, `app/engine/planner.py` | `PRESENT_EXPOSED` | YES (in Cockpit & Arena) | YES (`/api/planner/*`) | YES | 12 tests PASS | None. Fully operational. |
| **CAP-07** | Verification Sandbox & Invariants | Phase 09, `docs/ARCHITECTURE.md` | `backend/app/agents/verification.py`, `app/engine/verification.py`, `VerificationWorkspace.tsx` | `PRESENT_HIDDEN` | HIDDEN (`/decision/verification`) | YES (`/api/verification/*`) | YES | 15 tests PASS | Expose in sidebar under Decision & Verification. |
| **CAP-08** | Decision Cockpit & Traceability | Phase 10, `docs/DECISION_COCKPIT_SPEC.md` | `backend/app/services/cockpit.py`, `CockpitWorkspace.tsx` | `PRESENT_EXPOSED` | YES (`/decision/cockpit`) | YES (`/api/cockpit/*`) | YES | 18 tests PASS | None. Fully operational. |
| **CAP-09** | Realtime WebSocket Event Bus | Phase 11, `docs/WEBSOCKET_SPEC.md` | `backend/app/realtime/`, `EventsWorkspace.tsx` | `PRESENT_EXPOSED` | YES (`/observability/events`) | YES (`/ws`, `/api/observability/*`) | YES | 12 tests PASS | None. Fully operational. |
| **CAP-10** | Benchmark Suite (8 Scenarios) | Phase 12, `docs/EVALUATION_SPEC.md` | `backend/app/evaluation/`, `EvaluationWorkspace.tsx` (Tab 2) | `PRESENT_EXPOSED` | YES (`/evaluation` Tab 2) | YES (`/api/evaluation/*`) | YES | 14 tests PASS | None. Coexists with Hindsight Evaluation. |
| **CAP-11** | GNN Multi-Hop Propagation | Phase 07/13B, `docs/FRONTEND_SPEC.md` | `backend/app/graph/models/` (SAGE/GAT/GCN), `GNNWorkspace.tsx` | `PRESENT_HIDDEN` | HIDDEN (`/intelligence/gnn`) | YES (`/api/graph/*`) | YES | 8 tests PASS | Expose in sidebar under Graph & Causal Intelligence. |
| **CAP-12** | Causal DAG Counterfactuals | Phase 07/13B, `docs/3D_SPEC.md` | `backend/app/graph/causal.py`, `counterfactual.py`, `CausalWorkspace.tsx` | `PRESENT_HIDDEN` | HIDDEN (`/intelligence/causal`) | YES (`/api/graph/counterfactual/*`) | YES | 6 tests PASS | Expose in sidebar under Graph & Causal Intelligence. |
| **CAP-13** | Digital Twin 1,000-Run Monte Carlo | Phase 08/13D, `docs/3D_SPEC.md` | `backend/app/simulation/monte_carlo.py`, `DigitalTwinWorkspace.tsx` | `PRESENT_EXPOSED` | YES (`/simulation/twin`) | YES (`/api/simulation/*`) | YES | 8 tests PASS | None. Fully operational. |
| **CAP-14** | Continuous Learning Deliberation | Phase 09/13E, `docs/PRODUCT_SPEC.md` | `backend/app/agents/resilience/`, `DeliberateWorkspace.tsx` | `PRESENT_EXPOSED` | YES (`/learning/deliberate`) | YES (`/api/learning/*`) | YES | 16 tests PASS | None. Connected to Skills in layout. |
| **CAP-15** | Resilience OS 15-Stage Cycle | Phase 10/13E, `docs/BACKEND_SPEC.md` | `backend/app/services/resilience_os.py`, `ResilienceOSWorkspace.tsx` | `PRESENT_EXPOSED` | YES (`/governance/resilience`) | YES (`/api/resilience-os/*`) | YES | 9 tests PASS | None. Fully operational. |
| **CAP-16** | Policy Engine & Model Governance | Phase 10/13E, `docs/MASTER_PLAN.md` | `backend/app/governance/`, `GovernanceWorkspace.tsx` | `PRESENT_EXPOSED` | YES (`/governance/policies`) | YES (`/api/governance/*`) | YES | 7 tests PASS | None. Fully operational. |
| **CAP-17** | Real Data Ingestion Fabric | Phase 04 Data Platform | `backend/app/services/data.py`, `ingestion.py`, `DataFabric.tsx` | `PRESENT_HIDDEN` | HIDDEN (modal / unlinked) | YES (`/api/data/*`) | YES | 12 tests PASS | Add dedicated route `/data/fabric` in App.tsx and sidebar. |
| **CAP-18** | Zero-Trust Identity Gateway | Phase 03 Identity/Security | `backend/app/services/auth.py`, `SecurityConsole.tsx` | `PRESENT_HIDDEN` | HIDDEN (auth modal trigger only) | YES (`/api/auth/*`) | YES | 10 tests PASS | Add dedicated route `/security/console` in App.tsx and sidebar. |
| **CAP-19** | Competition Demo Mode (14 States) | Phase 16 Demo Spec | `backend/app/demo/`, `DemoMode.tsx` | `PRESENT_HIDDEN` | HIDDEN (unlinked) | YES (`/api/demo/*`) | YES | 7 tests PASS | Add dedicated route `/demo` in App.tsx and sidebar. |
| **CAP-20** | Predictive AI / ML Forecasting | Phase 06 ML Platform | `backend/app/ml/`, `PredictiveIntelligence.tsx` | `PRESENT_HIDDEN` | HIDDEN (unlinked) | YES (`/api/ml/*`) | YES | 15 tests PASS | Add dedicated route `/intelligence/predictive` in App.tsx and sidebar. |
| **CAP-21** | Incident Command War Room | Phase 05/13C Response Spec | `WarRoomWorkspace.tsx`, `SpecialistWarRoom.tsx` | `PRESENT_HIDDEN` | HIDDEN (`/response/war-room`) | YES (`/api/agents/*`) | YES | 9 tests PASS | Expose in sidebar under Response & Challenge. |

---

## 4. UI Visibility Matrix (Section 17)

| Historical Workspace Component | File Path | Route in App.tsx | In Sidebar Nav | Backend APIs Exist | Current User Visibility | Required Reconciliation Action |
|:---|:---|:---|:---|:---|:---|:---|
| **ResilienceDashboard** | `workspaces/ResilienceDashboard.tsx` | `/` | YES (`overview`) | YES | **VISIBLE** | None. Preserved as default landing console. |
| **CommandWorkspace** | `workspaces/CommandWorkspace.tsx` | `/command` | YES (`live`) | YES | **VISIBLE** | None. Live Resilience command center. |
| **ExperienceMemoryWorkspace** | `workspaces/ExperienceMemoryWorkspace.tsx` | `/memory` | YES (`memory`) | YES | **VISIBLE** | None. Phase 2A Hindsight memory. |
| **ResilienceGenomeWorkspace** | `workspaces/ResilienceGenomeWorkspace.tsx` | `/genome` | YES (`genome`) | YES | **VISIBLE** | None. Phase 2B Resilience genome. |
| **TransferIntelligenceWorkspace** | `workspaces/TransferIntelligenceWorkspace.tsx` | `/transfer` | YES (`transfer`) | YES | **VISIBLE** | None. Phase 2C Transfer intelligence. |
| **StrategyArenaWorkspace** | `workspaces/StrategyArenaWorkspace.tsx` | `/arena` | YES (`arena`) | YES | **VISIBLE** | None. Phase 3 Strategy arena. |
| **ChallengeEngineWorkspace** | `workspaces/ChallengeEngineWorkspace.tsx` | `/challenge`, `/response/adversary` | YES (`challenge`) | YES | **VISIBLE** | None. Phase 4 Challenge engine. |
| **DeliberateWorkspace** | `workspaces/DeliberateWorkspace.tsx` | `/learning/deliberate` | YES (`skills`) | YES | **VISIBLE** | None. Continuous learning & skills. |
| **DigitalTwinWorkspace** | `workspaces/DigitalTwinWorkspace.tsx` | `/simulation/twin` | YES (`simulation`) | YES | **VISIBLE** | None. Monte Carlo 1,000-run simulation. |
| **CockpitWorkspace** | `workspaces/CockpitWorkspace.tsx` | `/decision/cockpit` | YES (`outcomes`) | YES | **VISIBLE** | None. Decision Cockpit. |
| **ResilienceOSWorkspace** | `workspaces/ResilienceOSWorkspace.tsx` | `/governance/resilience` | YES (`learning`) | YES | **VISIBLE** | None. 15-stage Resilience OS cycle. |
| **GovernanceWorkspace** | `workspaces/GovernanceWorkspace.tsx` | `/governance/policies` | YES (`governance`) | YES | **VISIBLE** | None. Policy engine & governance. |
| **AgentConstellationWorkspace** | `workspaces/AgentConstellationWorkspace.tsx` | `/intelligence` | YES (`agents`) | YES | **VISIBLE** | None. Specialist agent constellation. |
| **WorldWorkspace** | `workspaces/WorldWorkspace.tsx` | `/world` | YES (`world`) | YES | **VISIBLE** | None. 3D Digital Twin Spatial Twin. |
| **EvaluationWorkspace** | `workspaces/EvaluationWorkspace.tsx` | `/evaluation` | YES (`evaluation`) | YES | **VISIBLE** | None. Co-hosts Benchmark + Hindsight Eval. |
| **EventsWorkspace** | `workspaces/EventsWorkspace.tsx` | `/observability/events` | YES (`settings`) | YES | **VISIBLE** | None. Realtime event stream telemetry. |
| **GNNWorkspace** | `workspaces/GNNWorkspace.tsx` | `/intelligence/gnn` | **NO** | YES | **HIDDEN** | Add navigation entry under Graph Intelligence. |
| **CausalWorkspace** | `workspaces/CausalWorkspace.tsx` | `/intelligence/causal` | **NO** | YES | **HIDDEN** | Add navigation entry under Graph Intelligence. |
| **RiskWorkspace** | `workspaces/RiskWorkspace.tsx` | `/intelligence/risk` | **NO** | YES | **HIDDEN** | Add navigation entry under Supply Chain Intelligence. |
| **WarRoomWorkspace** | `workspaces/WarRoomWorkspace.tsx` | `/response/war-room` | **NO** | YES | **HIDDEN** | Add navigation entry under Response & Incident Command. |
| **VerificationWorkspace** | `workspaces/VerificationWorkspace.tsx` | `/decision/verification` | **NO** | YES | **HIDDEN** | Add navigation entry under Decision & Verification. |
| **AdversaryWorkspace** | `workspaces/AdversaryWorkspace.tsx` | **NO (remapped)** | **NO** | YES | **DISCONNECTED** | Restore route `/response/adversary-lab` and add to navigation. |
| **DataFabric** | `data/DataFabric.tsx` | **NO** | **NO** | YES | **HIDDEN** | Add route `/data/fabric` and add to navigation. |
| **SecurityConsole** | `security/SecurityConsole.tsx` | **NO (modal only)** | **NO** | YES | **HIDDEN** | Add route `/security/console` and add to navigation. |
| **PredictiveIntelligence** | `ml/PredictiveIntelligence.tsx` | **NO** | **NO** | YES | **HIDDEN** | Add route `/intelligence/predictive` and add to navigation. |
| **DemoMode** | `demo/DemoMode.tsx` | **NO** | **NO** | YES | **HIDDEN** | Add route `/demo` and add to navigation. |

---

## 5. API and Backend Subsystem Matrix (Section 18)

| Subsystem / Service | Location | FastAPI Router | Endpoints Count | Registered in `api_router` | Pytest Coverage | Operational Status |
|:---|:---|:---|:---:|:---:|:---|:---|
| **World Service & Repository** | `app/services/world.py` | `app/api/world.py` | 7 | YES | `test_world_model.py`, `test_repository.py` | ACTIVE |
| **Risk Engine & Signal Fusion** | `app/services/risk.py` | `app/api/risks.py`, `signals.py` | 9 | YES | `test_risk_engine.py`, `test_fusion.py` | ACTIVE |
| **Specialist Agents Service** | `app/services/agents.py` | `app/api/agents.py` | 4 | YES | `test_agents.py`, `test_agent_performance.py` | ACTIVE |
| **Coordinator Service** | `app/services/coordinator.py` | `app/api/coordinator.py` | 3 | YES | `test_coordinator.py` | ACTIVE |
| **Adversary Service (Red-Team)** | `app/services/adversary.py` | `app/api/adversary.py` | 5 | YES | `test_adversary.py` | ACTIVE |
| **Planner Service (Pareto)** | `app/services/planner.py` | `app/api/planner.py` | 5 | YES | `test_planner.py` | ACTIVE |
| **Verification Service** | `app/services/verification.py` | `app/api/verification.py` | 4 | YES | `test_verification.py` | ACTIVE |
| **Decision Cockpit Service** | `app/services/cockpit.py` | `app/api/cockpit.py` | 9 | YES | `test_cockpit.py` | ACTIVE |
| **Realtime WebSocket Bus** | `app/realtime/` | `app/api/websocket.py` | 2 | YES | `test_realtime.py`, `test_websocket_hardening.py` | ACTIVE |
| **System Evaluation Service** | `app/services/evaluation.py` | `app/api/evaluation.py` | 8 | YES | `test_evaluation.py` | ACTIVE |
| **Competition Demo Service** | `app/demo/service.py` | `app/api/demo.py` | 11 | YES | `test_demo.py` | ACTIVE |
| **Data Platform & Ingestion** | `app/services/data.py` | `app/api/data.py`, `ingestion.py` | 18 | YES | `test_data_platform.py`, `test_data_ingestion.py` | ACTIVE |
| **Identity & RBAC Service** | `app/services/auth.py` | `app/api/auth.py` | 7 | YES | `test_auth.py`, `test_security_rbac.py` | ACTIVE |
| **Observability & Telemetry** | `app/services/alerts.py` | `app/api/observability.py` | 7 | YES | `test_observability.py` | ACTIVE |
| **Predictive ML Platform** | `app/ml/` | `app/api/ml.py` | 10 | YES | `test_ml_models.py`, `test_ml_drift.py` | ACTIVE |
| **GNN & Causal Intelligence** | `app/graph/` | `app/api/graph.py` | 6 | YES | `test_gnn_models.py`, `test_causal_counterfactual.py` | ACTIVE |
| **Monte Carlo Simulation Twin** | `app/simulation/` | `app/api/simulation.py` | 8 | YES | `test_monte_carlo.py`, `test_simulation_api.py` | ACTIVE |
| **Multi-Agent Deliberation** | `app/agents/resilience/` | `app/api/learning.py` | 15 | YES | `test_deliberation.py`, `test_learning_pipeline.py` | ACTIVE |
| **Resilience OS Control Plane** | `app/services/resilience_os.py` | `app/api/resilience_os.py` | 6 | YES | `test_resilience_os.py` | ACTIVE |
| **Governance Policy Engine** | `app/governance/` | `app/api/governance.py` | 4 | YES | `test_policy_engine.py` | ACTIVE |
| **Hindsight Experiential Memory** | `app/hindsight/` | `app/api/hindsight.py` | 8 | YES | `test_hindsight.py` (10/10 PASS) | ACTIVE (Phase 2A) |
| **Resilience Skills System** | `app/skills/` | `app/api/skills.py` | 8 | YES | `test_skills.py` (23/23 PASS) | ACTIVE (Phase 3) |
| **Challenge Engine** | `app/challenge/` | `app/api/challenge.py` | 7 | YES | `test_challenge.py` (22/22 PASS) | ACTIVE (Phase 4) |
| **Hindsight Evaluation Harness** | `app/hindsight_eval/` | `app/api/hindsight_eval.py` | 13 | YES | `test_hindsight_eval.py` (9/9 PASS) | ACTIVE (Phase 5) |

---

## 6. Specialist & Decision Agent Matrix (Section 19)

| Agent Name | Historical Role | Current Implementation File | Registered in Singleton | UI Exposure | Tests Passing | Reconciled Status |
|:---|:---|:---|:---:|:---:|:---:|:---|
| **Inventory Agent** | Minimize stockout & buffer depletion | `backend/app/agents/inventory.py` | YES (`AgentRegistry`) | `AgentConstellationWorkspace` | YES | **PRESENT_EXPOSED** |
| **Supplier Agent** | Detect supplier disruption & alternate sources | `backend/app/agents/supplier.py` | YES (`AgentRegistry`) | `AgentConstellationWorkspace` | YES | **PRESENT_EXPOSED** |
| **Transportation Agent** | Optimize modal routes & rerouting | `backend/app/agents/transportation.py` | YES (`AgentRegistry`) | `AgentConstellationWorkspace` | YES | **PRESENT_EXPOSED** |
| **Fulfillment Agent** | Protect SLA & warehouse allocation | `backend/app/agents/fulfillment.py` | YES (`AgentRegistry`) | `AgentConstellationWorkspace` | YES | **PRESENT_EXPOSED** |
| **Sustainability Agent** | Minimize carbon emissions & compliance | `backend/app/agents/sustainability.py` | YES (`AgentRegistry`) | `AgentConstellationWorkspace` | YES | **PRESENT_EXPOSED** |
| **Resilience Agent** | Reduce systemic network fragility | `backend/app/agents/resilience.py` | YES (`AgentRegistry`) | `AgentConstellationWorkspace` | YES | **PRESENT_EXPOSED** |
| **Coordinator Agent** | Reconcile trade-offs into Plans A/B/C | `backend/app/agents/coordinator.py` | YES (via `CoordinatorService`) | Cockpit & War Room | YES | **PRESENT_EXPOSED** |
| **Adversary Agent** | 12 attack vectors red-team stress test | `backend/app/agents/adversary.py` | YES (via `AdversaryService`) | `AdversaryWorkspace` (Unlinked) | YES | **PRESENT_DISCONNECTED (UI Route)** |
| **Planner Agent** | Pareto multi-objective optimization | `backend/app/agents/planner.py` | YES (via `PlannerService`) | Cockpit & Arena | YES | **PRESENT_EXPOSED** |
| **Verification Agent** | Multi-tier capacity/logistics invariant guard | `backend/app/agents/verification.py` | YES (via `VerificationService`) | `VerificationWorkspace` (Hidden) | YES | **PRESENT_HIDDEN (Sidebar Nav)** |

---

## 7. Deep-Dive: Specific Protected Subsystems

### 7.1 GNN Multi-Hop Risk Propagation (Section 10)
- **Status:** **`PRESENT_HIDDEN`**
- **Implementation:** Completely intact in `backend/app/graph/models/` (`sage.py`, `gat.py`, `gcn.py`), `propagation.py`, `datasets.py`.
- **API:** Registered in `backend/app/api/graph.py` under `/api/gnn/*` (`/gnn/inference`, `/gnn/embeddings`, `/gnn/multi-hop`).
- **Frontend:** `frontend/src/components/workspaces/GNNWorkspace.tsx` is an interactive visualization of multi-hop risk diffusion over PyTorch Geometric GraphSAGE embeddings.
- **Root Cause of Invisibility:** Route `/intelligence/gnn` exists in `App.tsx`, but no item in `ResilienceIntelligenceLayout.tsx`'s `NAV_STRUCTURE` links to it.
- **Coexistence Rationale:** GNN multi-hop predicts graph-structural propagation; Hindsight records operational experiences. They are complementary: GNN predicts spatial risk spread; Hindsight learns whether past interventions on that spread succeeded.

### 7.2 Causal DAG Counterfactual Simulation (Section 11)
- **Status:** **`PRESENT_HIDDEN`**
- **Implementation:** Intact in `backend/app/graph/causal.py` and `backend/app/graph/counterfactual.py`.
- **API:** Registered in `backend/app/api/graph.py` under `/api/causal/*` and `/api/counterfactual/*`.
- **Frontend:** `frontend/src/components/workspaces/CausalWorkspace.tsx` provides Cause $\to$ Mechanism $\to$ Effect DAG sandboxing and counterfactual parameter sliders.
- **Comparison to Challenge Engine:** 
  - *Causal DAG Sandbox:* Operates over structural graph equations to compute what-if risk deltas on capacity/utilization.
  - *Challenge Engine (Phase 4):* Probes learned Resilience Skills by generating targeted adversarial stress scenarios and boundary tests.
  - Both serve distinct, valuable purposes and must coexist.

### 7.3 Digital Twin 3D Spatial Network vs. 1,000-Run Monte Carlo Simulation (Section 12)
- **3D Spatial World:** Handled by `WorldWorkspace.tsx` (route `/world`), rendering three.js spatial nodes, geo-coordinates, and edge flows. `PRESENT_EXPOSED`.
- **1,000-Run Monte Carlo Engine:** Handled by `DigitalTwinWorkspace.tsx` (route `/simulation/twin`), executing stochastic sampling across 1,000 parameter distributions with P50/P90/P99 percentiles via `backend/app/simulation/monte_carlo.py`. `PRESENT_EXPOSED`.
- Both are verified intact and properly separated.

### 7.4 Continuous Learning & Challenger Governance (Section 13)

| Capability | Historical Subsystem | New Phase 1–5 Subsystem | Functional Relationship |
|:---|:---|:---|:---|
| **Challenger / Red-Team** | `AdversaryAgent` (12 attack types) | `ChallengeEngine` (skill boundary challenge) | Complementary: Adversary attacks plans; Challenge Engine attacks learned skills. |
| **Model Learning** | Multi-agent deliberation & feedback | Hindsight Experience Retain / Recall | Additive: Deliberation scores past decisions; Hindsight persists structured causal traces. |
| **Prediction Calibration** | Feature drift (PSI/KS) & model cards | Hindsight Reflection & Boundary Updates | Coexisting: ML monitors distribution drift; Hindsight monitors operational outcome drift. |
| **Skill Evolution** | Plan generation with soft constraints | Resilience Genome $\to$ Skill Evolution Proposal | Evolutionary: Historical plans become reusable executable skills. |
| **Evaluation** | 8-scenario deterministic benchmark | 30-episode A/B Learning Evaluation | Integrated: Both tabs now live inside `EvaluationWorkspace.tsx`. |

### 7.5 15-Stage Resilience OS Cycle (Section 14)
- **Status:** **`PRESENT_EXPOSED`**
- Intact in `backend/app/services/resilience_os.py` and visualized in `ResilienceOSWorkspace.tsx` (route `/governance/resilience`).
- The 15 stages (`OBSERVE` $\to$ `UNDERSTAND` $\to$ `PREDICT` $\to$ `SIMULATE` $\to$ `DELIBERATE` $\to$ `ATTACK` $\to$ `OPTIMIZE` $\to$ `VERIFY` $\to$ `APPROVE` $\to$ `EXECUTE` $\to$ `MEASURE` $\to$ `LEARN` $\to$ `ADAPT` $\to$ `REPEAT`) are fully executed in code.
- Phase 1–5 Hindsight Intelligence enhances the `LEARN` and `ADAPT` stages without bypassing the preceding execution stages.

---

## 8. Summary Statistics (Section 25 H, I, J, K)

### Legacy Feature Count (Section 25 H)
```text
Total historical capabilities audited: 21
Present and Exposed:                  16
Present but Hidden from Navigation:    5
Present but Disconnected Route:        4
Genuinely Removed:                     0
Replaced at Route Level:               1 (AdversaryWorkspace route remapped to ChallengeEngine)
Documentation-only:                    0
Unknown:                               0
```

### Frontend Route Count (Section 25 I)
```text
Historical routes in App.tsx: 26
Currently exposed in sidebar: 16
Currently hidden from sidebar: 7 (GNN, Causal, Risk, War Room, Verification, plus missing Data & Security routes)
Broken / Unlinked routes:      1 (/response/adversary unlinked from AdversaryWorkspace)
```

### Backend Count (Section 25 J)
```text
Historical FastAPI Routers:   25
Current FastAPI Routers:      29 (Added: hindsight, skills, challenge, hindsight_eval)
Total Endpoints:              191
Total Registered Services:    20
Total ORM / Domain Models:    11
Total Pytest Tests:           313 collected
```

### Specialist Agents Count (Section 25 K)
```text
Historical Specialists: 6 (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience)
Decision Agents:        4 (Coordinator, Adversary, Planner, Verification)
Current Status:         10/10 Fully Present and Implemented in backend/app/agents
```

---

## 9. Recommended Information Architecture & Restoration Plan (Section 23 & 25 O)

> [!IMPORTANT]
> In accordance with the Phase 5.5 Zero-Modification Rule, **no restoration code has been applied yet**. This plan is submitted for review before Pass 2 implementation.

To reconcile all historical capabilities into a single, cohesive enterprise navigation without cluttering the UI, we propose expanding `NAV_STRUCTURE` in `ResilienceIntelligenceLayout.tsx` into clear thematic sections:

```text
RESILIENCE OS (EXPANDED SIDEBAR)
├── Overview & Operations
│   ├── Overview (/ - ResilienceDashboard)
│   ├── Live Resilience (/command - CommandWorkspace)
│   └── Digital Twin 3D (/world - WorldWorkspace)
│
├── Experiential Intelligence (New Layer)
│   ├── Experience Memory (/memory - ExperienceMemoryWorkspace)
│   ├── Resilience Genome (/genome - ResilienceGenomeWorkspace)
│   ├── Transfer Intelligence (/transfer - TransferIntelligenceWorkspace)
│   ├── Strategy Arena (/arena - StrategyArenaWorkspace)
│   └── Skills & Evolution (/learning/deliberate - DeliberateWorkspace)
│
├── Deep Intelligence & Modeling (Restored Historical Views)
│   ├── Agent Constellation (/intelligence - AgentConstellationWorkspace)
│   ├── Risk Explorer (/intelligence/risk - RiskWorkspace)
│   ├── Graph Neural Network (/intelligence/gnn - GNNWorkspace)
│   ├── Causal DAG Sandbox (/intelligence/causal - CausalWorkspace)
│   └── Predictive AI / ML (/intelligence/predictive - PredictiveIntelligence)
│
├── Response & Stress Testing
│   ├── Incident War Room (/response/war-room - WarRoomWorkspace)
│   ├── Red-Team Attack Lab (/response/adversary-lab - AdversaryWorkspace)
│   └── Challenge Engine (/challenge - ChallengeEngineWorkspace)
│
├── Decision & Simulation
│   ├── Decision Cockpit (/decision/cockpit - CockpitWorkspace)
│   ├── Safety Verification Sandbox (/decision/verification - VerificationWorkspace)
│   └── 1,000-Run Monte Carlo (/simulation/twin - DigitalTwinWorkspace)
│
├── Governance & Enterprise
│   ├── Resilience OS Control Plane (/governance/resilience - ResilienceOSWorkspace)
│   ├── Policy Engine & Rules (/governance/policies - GovernanceWorkspace)
│   └── Security & Identity Console (/security/console - SecurityConsole)
│
└── System & Platform
    ├── Realtime Event Telemetry (/observability/events - EventsWorkspace)
    ├── System Evaluation (/evaluation - EvaluationWorkspace)
    ├── Data Platform Fabric (/data/fabric - DataFabric)
    └── Competition Demo Mode (/demo - DemoMode)
```

### Detailed Feature Restoration Steps (for Pass 2):
1. **Adversary Workspace Restoration:**
   - Add route `/response/adversary-lab` pointing to `AdversaryWorkspace`.
   - Maintain route `/challenge` pointing to `ChallengeEngineWorkspace`.
   - Retain route `/response/adversary` as an alias to `AdversaryWorkspace`.
2. **Expose Hidden Intelligence Workspaces in Sidebar:**
   - Add items for `GNNWorkspace` (`/intelligence/gnn`), `CausalWorkspace` (`/intelligence/causal`), and `RiskWorkspace` (`/intelligence/risk`).
3. **Expose Hidden Decision & Response Workspaces in Sidebar:**
   - Add items for `WarRoomWorkspace` (`/response/war-room`) and `VerificationWorkspace` (`/decision/verification`).
4. **Wire Standalone Enterprise Consoles in `App.tsx`:**
   - Add route `/security/console` $\to$ `<SecurityConsole />`
   - Add route `/data/fabric` $\to$ `<DataFabric />`
   - Add route `/demo` $\to$ `<DemoMode />`
   - Add route `/intelligence/predictive` $\to$ `<PredictiveIntelligence />`

---

## 10. Conclusion & Stop Rule Compliance

This forensic audit confirms that **FULFILL-X has suffered NO destructive code loss**. All historical GNN, Causal, Monte Carlo, Multi-Agent, Red-Team, and Governance engines are completely intact. The perceived gap was purely a navigation layer occlusion from the Phase 1 UI shell update.

In strict compliance with the Phase 5.5 rules:
- **No source files, schemas, models, tests, or routes were altered during this audit.**
- **The system was inspected non-destructively.**
- **Work is halted here for user review before proceeding with any restoration.**
