# FULFILL-X — 3D World Model Specification

## 1. Purpose

Define the complete 3D visualization system for FULFILL-X — what is
rendered, how it maps to data, how users interact with it, and how it
animates.

## 2. User Problem

Supply network complexity is impossible to understand in a table.
Spatial relationships — distances, clustering, choke points, route
dependencies — are only visible in 3D. Risk propagation looks like
a wave; a table cannot show a wave.

## 3. Technology Stack

| Technology | Version | Role |
|-----------|---------|------|
| Three.js | 0.165.x | WebGL rendering |
| React Three Fiber | 8.x | Declarative React bindings |
| @react-three/drei | 9.x | Cameras, controls, loaders, helpers |
| GSAP | 3.x | Camera animation timeline |
| Framer Motion | 11.x | Panel overlays |

## 4. Scene Composition

```
Scene
├── Environment
│   ├── Background (dark space gradient)
│   ├── Ambient light (low intensity)
│   ├── Directional light (primary)
│   └── Point lights (node glow)
├── World
│   ├── GlobeBase (wireframe sphere, optional)
│   ├── NodeLayer
│   │   ├── SupplierNodes (sphere geometry)
│   │   ├── WarehouseNodes (box geometry)
│   │   ├── FulfillmentCenterNodes (octahedron geometry)
│   │   └── CustomerNodes (small sphere)
│   ├── EdgeLayer
│   │   ├── RouteLines (tube geometry)
│   │   └── DependencyArrows (custom arrow geometry)
│   ├── OverlayLayer
│   │   ├── RiskHeatMap (shader-based overlay)
│   │   ├── DisruptionWaves (expanding ring geometry)
│   │   ├── AgentActivity (animated particle emitter)
│   │   └── PlanEffects (color + opacity animation)
│   └── ParticleSystem
│       └── RouteFlow (flowing dots on edges)
├── Controls
│   └── OrbitControls (pan, zoom, rotate)
└── PostProcessing
    ├── Bloom (node glow + disruption glow)
    ├── DepthOfField (focus on selected node)
    └── FXAA (anti-aliasing)
```

## 5. Node Types & Visual Encoding

| Node Type | Geometry | Color (Healthy) | Color (Risk) | Size |
|-----------|---------|----------------|-------------|------|
| Supplier | Sphere | `#4A90D9` (cool blue) | `#E85D4A` (warm red) | 1.0 |
| Warehouse | Box | `#7BC67E` (muted green) | `#E8A24A` (amber) | 1.2 |
| Fulfillment Center | Octahedron | `#9B7FE8` (purple) | `#E85D4A` (red) | 1.4 |
| Customer Zone | Small Sphere | `#A8B5C5` (neutral) | `#E8A24A` (amber) | 0.6 |

Risk color is applied as a lerp between healthy and risk colors,
proportional to the composite risk score (0.0 – 1.0).

## 6. Edge Types & Visual Encoding

| Edge Type | Geometry | Style | Animation |
|-----------|---------|-------|-----------|
| Route (healthy) | Tube | Thin, `#334455` | Particle flow (slow, dim) |
| Route (active) | Tube | Medium, `#4A90D9` | Particle flow (fast, bright) |
| Route (disrupted) | Tube | Thick, `#E85D4A` | Flashing particles (red) |
| Dependency | Arrow | Dashed, `#556677` | None |
| Risk propagation | Glow tube | Animated, orange | Wave propagation |

## 7. Data-to-Visual Mapping

| Data Field | Visual Property |
|-----------|----------------|
| `node.riskScore` | Color lerp (healthy → risk) |
| `node.inventory` | Node scale (larger = more inventory) |
| `node.isDisrupted` | Disruption wave + red glow |
| `edge.load` | Route line width |
| `edge.delay` | Route particle speed (slower = more delay) |
| `edge.isDisrupted` | Red flashing route |
| `scenario.affectedNodes` | Disruption wave origin |
| `agent.activeOn` | Animated agent icon floating above node |
| `plan.reroutes` | New route lines animate in |
| `plan.inventoryShifts` | Node scale changes animate |

## 8. Interaction Model

| Interaction | Behavior |
|------------|---------|
| Click node | Camera ease to node; inspector panel opens |
| Click edge | Route detail panel opens |
| Double-click node | Fly into node for closeup |
| Right-click | Context menu (highlight neighbors, hide, pin) |
| Scroll | Zoom in/out |
| Drag | Orbit |
| Shift+drag | Pan |
| `F` key | Focus on selected node |
| `R` key | Reset camera to default |
| `H` key | Toggle heat map |
| `P` key | Toggle particle flow |
| Escape | Deselect, close panels |

## 9. Animation Specifications

### 9.1 Disruption Wave

When `node.isDisrupted = true`:
1. Expanding ring geometry grows outward from node center
2. Ring color: orange → red, opacity 1.0 → 0.0 over 2s
3. Repeat until `isDisrupted = false`
4. Neighboring nodes at risk pulse with lower amplitude

### 9.2 Camera Transitions

All camera movements use GSAP timeline:
- Duration: 800ms
- Easing: `power2.inOut`
- Target: node world position + 3 unit offset

### 9.3 Risk Score Update

When `node.riskScore` changes:
- Color lerp animates over 400ms (Framer Motion spring)
- Node emissive intensity changes proportionally

### 9.4 Agent Activity

When an agent is active on a node:
- Small pulsing icon (custom geometry) orbits the node
- Color matches agent identity color
- Disappears when agent completes

### 9.5 Plan Effect Visualization

When a plan is accepted:
- New routes animate in (tube geometry grows from source to destination)
- Inventory shifts show node scale morph
- Color transitions to healthier state

## 10. Performance Requirements

| Metric | Target |
|--------|--------|
| Frame rate | 60 fps (medium hardware) |
| Max nodes | 500 |
| Max edges | 2000 |
| Scene load time | < 2s |
| Memory budget | < 256MB GPU |

Optimization techniques:
- Instanced mesh for identical node types
- LOD (Level of Detail) for distant nodes
- Frustum culling (Three.js default)
- Particle system uses GPU instancing

## 11. 3D ↔ 2D Panel Sync

The 3D scene and 2D panels are synchronized via Zustand:

```typescript
// When user clicks node in 3D:
useWorldStore.getState().setSelectedNode(nodeId)

// When user selects a node in 2D table:
// Camera animates to that node in 3D via useEffect
```

## 12. Failure Modes

| Failure | Detection | Fallback |
|---------|-----------|---------|
| WebGL unavailable | `THREE.WebGLRenderer` init error | Render 2D network graph (React Flow) |
| Performance too low | `renderer.info.render.frame` drop < 30fps | Reduce particle count; disable post-processing |
| Scene load timeout | 10s timeout | Show error + retry button |

## 13. Tests

- Unit: Three.js scene graph construction
- Integration: Node click → Zustand update → panel render
- Visual regression: Playwright screenshot of 3D scene (fixed camera, seeded data)
- Performance: frame rate benchmark with 500 nodes

## 14. Future Extensions

- Geographic projection (lat/lng to 3D globe coordinates)
- AR/VR mode (WebXR)
- Time-lapse playback of historical states
- Multi-scenario overlay comparison
