# FULFILL-X — UI COMPONENT ARCHITECTURE

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. COMPONENT HIERARCHY & ATOMIC DESIGN STRUCTURE

The frontend component tree is organized into 5 architectural tiers:

```
src/
├── components/
│   ├── layouts/            # Top-level route shells, Navbars, Spatial Canvas Viewports
│   ├── canvas/             # Shared Three.js / R3F Spatial 3D Scene Primitives
│   ├── workspaces/         # Dedicated 38+ Workspace View Components
│   ├── hud/                # Floating HUD Panels, Control Drawers, Command Palette
│   └── common/             # Micro UI Components, Badges, Modals, Toast Container
```

---

## 2. WORKSPACE COMPONENT TREE MAP

### Tier 1: Layout Shells & Canvas Rigs
- `SpatialAppLayout.tsx` — Main application shell hosting top navbar, persistent 3D canvas viewport, toast notifications, and modal manager.
- `SpatialCanvasViewport.tsx` — R3F WebGL Canvas manager hosting 11 visual environment lighting rigs, post-processing pass, and camera controller.
- `Navbar.tsx` — Spatial top navigation bar with environment selector, 2D/3D switcher, seed preset dropdown, network health badge, and auth gateway trigger.

### Tier 2: Spatial 3D Primitives (`src/components/canvas/`)
- `SpatialNodePrimitive.tsx` — 3D supply network node mesh (Supplier, Hub, Port, Plant, Demand).
- `SpatialEdgePrimitive.tsx` — Directional flow edge with animated transit load particles.
- `RiskPulsePrimitive.tsx` — Concentric risk wave pulse radiating from disrupted nodes.
- `AgentEntityPrimitive.tsx` — 3D Specialist Agent orb mesh with activity ring.
- `ParetoLandscapePrimitive.tsx` — 3D Pareto surface mesh with candidate plan coordinate markers.
- `DigitalTwinHologramPrimitive.tsx` — Holographic Digital Twin snapshot projection with particle aura.
- `EventStreamPrimitive.tsx` — 3D kinetic event stream pipeline.

### Tier 3: Dedicated Workspaces (`src/components/workspaces/`)
- `HomeWorkspace.tsx` (`/`)
- `CommandWorkspace.tsx` (`/command`)
- `WorldWorkspace.tsx` (`/world`)
- `NodeInspectorWorkspace.tsx` (`/world/node/:id`)
- `RiskExplorerWorkspace.tsx` (`/intelligence/risk`)
- `SignalsWorkspace.tsx` (`/intelligence/signals`)
- `GNNWorkspace.tsx` (`/intelligence/gnn`)
- `CausalWorkspace.tsx` (`/intelligence/causal`)
- `WarRoomWorkspace.tsx` (`/response/war-room`)
- `AdversaryWorkspace.tsx` (`/response/adversary`)
- `ScenariosWorkspace.tsx` (`/response/scenarios`)
- `CockpitWorkspace.tsx` (`/decision/cockpit`)
- `VerificationWorkspace.tsx` (`/decision/verification`)
- `ApprovalWorkspace.tsx` (`/decision/approval`)
- `DigitalTwinWorkspace.tsx` (`/simulation/twin`)
- `MonteCarloWorkspace.tsx` (`/simulation/monte-carlo`)
- `StrategiesWorkspace.tsx` (`/simulation/strategies`)
- `DeliberateWorkspace.tsx` (`/learning/deliberate`)
- `MemoryWorkspace.tsx` (`/learning/memory`)
- `EventsWorkspace.tsx` (`/observability/events`)
- `TracesWorkspace.tsx` (`/observability/traces`)
- `PoliciesWorkspace.tsx` (`/governance/policies`)
- `ExecutionSafetyWorkspace.tsx` (`/governance/execution`)

---

## 3. ERROR BOUNDARIES & COMPONENT ISOLATION

Every workspace component is wrapped in a dedicated React `ErrorBoundary` (`SpatialErrorBoundary.tsx`). If an unexpected runtime exception occurs inside a specific 3D canvas primitive or workspace component:
1. The error boundary catches the exception without crashing the surrounding application shell.
2. An elegant glassmorphic error fallback card is rendered ("Workspace Visualization Error — Click to Reset").
3. The remaining application workspaces, top navbar, and live WebSocket stream remain fully operational.
