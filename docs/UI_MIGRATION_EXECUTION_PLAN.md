# FULFILL-X — UI MIGRATION EXECUTION PLAN

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. 6-PHASE MIGRATION ROADMAP

The UI transformation of `FULFILL-X` will be executed incrementally across 6 structured phases:

```
Phase 1: Architecture & Package Infrastructure Setup
  ├── Install routing, query, and animation packages (@tanstack/react-query, framer-motion, zustand)
  ├── Establish CSS custom properties & spatial glassmorphic theme tokens
  └── Configure client-side router & App layout shell

Phase 2: Core Layout Shell & Shared 3D Spatial Canvas Primitives
  ├── Build SpatialAppLayout & SpatialCanvasViewport (shared R3F canvas)
  ├── Implement 18 reusable spatial 3D primitives (SpatialNode, SpatialEdge, RiskPulse, etc.)
  └── Implement camera fly-through controller and 11 spatial environment lighting setups

Phase 3: Operational Workspaces Migration (Command, World, Risk, Signals, Intelligence)
  ├── Build Command Workspace (/command) & World Topology Workspace (/world)
  ├── Migrate Node Inspector & Risk Explorer to dedicated routes (/world/node/:id, /intelligence/risk)
  └── Implement GNN & Causal Intelligence Workspaces (/intelligence/gnn, /intelligence/causal)

Phase 4: Autonomous Resilience Workspaces Migration (Agents, Response, Decision, Verification)
  ├── Migrate Specialist War Room to Response Workspace (/response/war-room)
  ├── Build Adversary Chaos Engine & Scenario Injector Workspaces (/response/adversary, /response/scenarios)
  └── Build Decision Cockpit, Verification Sandbox & Executive Approval Workspaces (/decision/*)

Phase 5: Analytical & Governance Workspaces Migration (Simulation, Learning, Observability, Governance)
  ├── Build Digital Twin, Monte Carlo & Strategy Comparison Workspaces (/simulation/*)
  ├── Build Deliberate Learning, Agent Memory & Model Governance Workspaces (/learning/*)
  ├── Build Realtime Events Stream, Traces & Telemetry Workspaces (/observability/*)
  └── Build Identity Gateway, Tenants, Policies & Execution Safety Workspaces (/governance/*)

Phase 6: End-to-End Verification, Performance Profiling & Production Build
  ├── Run 60 FPS performance profiling & polygon budget validation
  ├── Execute TypeScript type check (`npm run build`)
  ├── Execute full backend pytest regression suite (249/249 passed)
  └── Stage files and commit clean git state
```

---

## 2. EXISTING COMPONENT TO TARGET ROUTE MIGRATION MATRIX

This matrix maps every existing frontend component file in `frontend/src/components/` to its target route, replacement components, 3D visual environment, data sources, and migration status:

| Current Component File | Target Route | Target Components / Replacement | Target 3D Visual Environment | Data Sources & APIs | Migration Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `components/command/CommandCenter.tsx` | `/command` | `CommandWorkspace.tsx` | `COMMAND` (Tactical Grid) | `GET /api/world/summary`, `GET /api/risk/map` | Planned (Phase 3) |
| `components/world/World2DView.tsx` | `/world` | `WorldWorkspace.tsx` (2D Mode) | `WORLD` (SVG 2D Layout) | `GET /api/world/snapshot` | Planned (Phase 3) |
| `components/world/World3DView.tsx` | `/world` | `WorldWorkspace.tsx` (3D Mode) | `WORLD` (3D Network Graph) | `GET /api/world/snapshot` | Planned (Phase 3) |
| `components/world/NodeInspector.tsx` | `/world/node/:id` | `NodeInspectorWorkspace.tsx` | `WORLD` (Isometric Node Focus) | `GET /api/world/nodes/{id}` | Planned (Phase 3) |
| `components/risk/RiskExplorer.tsx` | `/intelligence/risk` | `RiskExplorerWorkspace.tsx` | `RISK` (3D Risk Heatmap Volume) | `GET /api/risk/map`, `GET /api/risk/detail` | Planned (Phase 3) |
| `components/risk/SignalInjectorModal.tsx` | `/response/scenarios` | `ScenariosWorkspace.tsx` | `RESPONSE` (Threat Trajectory) | `POST /api/risk/signals/inject` | Planned (Phase 3) |
| `components/intelligence/IntelligencePanel.tsx` | `/intelligence` | `IntelligenceWorkspace.tsx` | `INTELLIGENCE` (Constellation) | `GET /api/ai/providers` | Planned (Phase 3) |
| `components/graph/GraphIntelligence.tsx` | `/intelligence/gnn` | `GNNWorkspace.tsx` | `INTELLIGENCE` (Latent Space) | `POST /api/graph/predict-risk` | Planned (Phase 3) |
| `components/ml/PredictiveIntelligence.tsx` | `/intelligence/causal` | `CausalWorkspace.tsx` | `INTELLIGENCE` (Causal DAG) | `POST /api/graph/causal/hypotheses` | Planned (Phase 3) |
| `components/agents/SpecialistWarRoom.tsx` | `/response/war-room` | `WarRoomWorkspace.tsx` | `RESPONSE` (Agent Arena) | `POST /api/coordinator/deliberate` | Planned (Phase 4) |
| `components/cockpit/DecisionCockpit.tsx` | `/decision/cockpit` | `CockpitWorkspace.tsx` | `DECISION` (3D Pareto Surface) | `GET /api/cockpit/proposals` | Planned (Phase 4) |
| `components/simulation/DigitalTwinWorkspace.tsx` | `/simulation/twin` | `DigitalTwinWorkspace.tsx` | `SIMULATION` (Holographic Twin) | `POST /api/simulation/twin/create` | Planned (Phase 5) |
| `components/learning/ResilienceAgentsWorkspace.tsx` | `/learning/deliberate` | `DeliberateWorkspace.tsx` | `LEARNING` (Neural Orbit Ring) | `POST /api/learning/deliberate` | Planned (Phase 5) |
| `components/observability/ObservabilityCenter.tsx` | `/observability/events` | `EventsWorkspace.tsx` | `OBSERVABILITY` (Kinetic Stream)| `GET /api/observability/events/history` | Planned (Phase 5) |
| `components/governance/GovernanceCenter.tsx` | `/governance/policies` | `PoliciesWorkspace.tsx` | `GOVERNANCE` (Security Gate) | `GET /api/governance/policies` | Planned (Phase 5) |
| `components/auth/IdentityGateway.tsx` | `/governance/identity` | `IdentityWorkspace.tsx` | `GOVERNANCE` (Identity Gateway)| `POST /api/auth/login` | Planned (Phase 5) |
| `components/data/DataFabric.tsx` | `/governance/data` | `DataGovernanceWorkspace.tsx` | `GOVERNANCE` (Data Matrix) | `GET /api/data/status` | Planned (Phase 5) |
| `components/demo/DemoMode.tsx` | `/demo` | `DemoWorkspace.tsx` | `COMMAND` (Tactical Grid) | `POST /api/demo/scenarios/run` | Planned (Phase 5) |
| `components/evaluation/EvaluationDashboard.tsx` | `/evaluation` | `EvaluationWorkspace.tsx` | `SIMULATION` (Eval Cloud) | `GET /api/evaluation/history` | Planned (Phase 5) |

---

## 3. RISKS & DEPENDENCY MANAGEMENT

1. **WebGL Context Loss Risk:** Managed via shared canvas singleton and explicit resource disposal (`dispose()`).
2. **Bundle Size Expansion Risk:** Managed via dynamic code splitting (`React.lazy` per workspace route).
3. **Performance Budget Overshoot Risk:** Managed via `InstancedMesh` draw call batching and dynamic Level-of-Detail (LOD).
4. **Backend Contract Breakage Risk:** Strict zero backend code mutation policy enforced; frontend queries conform strictly to existing Pydantic schemas.

---

## 4. PHASE 12.1 IMPLEMENTATION STATUS (COMPLETED)

**Phase 12.1 — Dynamic Spatial UI Foundation + First Vertical Slice** is fully implemented, verified, and committed:

1. **Package & Routing Infrastructure:** `@tanstack/react-query`, `zustand`, `framer-motion`, `three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react` validated & compiled cleanly.
2. **Core Spatial Shell:** `SpatialAppLayout`, `SpatialCanvasViewport` with WebGL context error boundary & 2D fallback, `CameraController` with smooth lerp & reduced motion support, `Navbar` with workspace tab navigation and seed selector.
3. **Home Workspace (`/`):** Procedural particle constellation canvas (`ProceduralHomeParticles`), identity header, ENTER OS interaction, live environment HUD status footer.
4. **Command Vertical Slice (`/command`):** Consumes authentic backend API endpoints (`GET /api/world/summary`, `GET /api/world`, `GET /api/risks`), rendering composite health (95%), total node counts (23), disrupted nodes, live node matrix, and threat/war room/cockpit triggers.
5. **Real Node Interaction (`/world/node/:id`):** Deep node selection, dynamic URL routing, camera target focusing, `NodeInspectorWorkspace` drawer displaying inventory levels, lead times, risk score breakdown, upstream suppliers, downstream targets, and action triggers.
6. **Real Risk Visualization (`/intelligence/risk`):** Consumes `/api/risks`, supports `recalculateRisk` and `resetRisk` backend mutations, Criticality Ranking Table with band filters (`ALL`, `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), 3D risk heatmap pulse primitives (`RiskPulsePrimitive`).
7. **Realtime WebSocket Integration:** `RealtimeWebSocketClient` connected to `/api/events/ws/{session_id}` with sequence ordering, duplicate protection, auto-reconnect, and real-time store updates (`realtimeStore`).
8. **Accessibility & Degraded States:** 2D SVG layout toggle (`World2DView`), screen-reader readable tables, keyboard navigation, WebGL error boundary fallback, reduced motion preference detection.
9. **Verification & Tests:** `npm run build` compiled 2159 modules cleanly without errors; full backend pytest regression suite passed 249/249 tests.

---

## 5. EXACT NEXT IMPLEMENTATION TASK

**Next Task (Phase 12 Phase 2 / Phase 3 Scaling):**
Scale the migration to remaining Phase 3 operational workspaces (`/intelligence/gnn`, `/intelligence/causal`) and Phase 4 autonomous resilience workspaces (`/response/war-room`, `/response/adversary`, `/response/scenarios`, `/decision/*`).

