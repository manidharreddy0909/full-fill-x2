# FULFILL-X — 3D Experience Bible

## 1. Purpose

Define the 3D world as a functional data visualization layer.
Every visual element maps to a backend state field.
No decoration exists without a reason.

---

## 2. Design Philosophy

The 3D world is NOT:
- A spinning globe for cosmetic effect
- A spatial map of geography
- A game engine

The 3D world IS:
- A **data-driven supply network graph** in 3D space
- Every node's position is **fixed** (not geographic — logical topology)
- Every node's **color, size, and glow** encodes live data
- Every edge's **particles, thickness, and color** encodes route state
- Every animation encodes a **state change event**

---

## 3. Scene Composition

### Canvas Setup

```tsx
<Canvas
  camera={{ position: [0, 10, 20], fov: 50 }}
  gl={{ antialias: true, alpha: true }}
  dpr={[1, 2]}
  shadows
>
  <Environment preset="warehouse" />
  <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
  <ambientLight intensity={0.3} />
  <WorldScene />
  <EffectComposer>
    <Bloom threshold={0.7} strength={0.5} radius={0.4} />
    <FXAA />
  </EffectComposer>
</Canvas>
```

### Scene Graph

```
WorldScene
├── NodeLayer (instanced mesh + individual override meshes)
│   ├── SupplierNodes (sphere)
│   ├── WarehouseNodes (box)
│   ├── FulfillmentCenterNodes (octahedron)
│   ├── CustomerZoneNodes (small sphere)
│   └── PortNodes (diamond / custom)
├── EdgeLayer
│   ├── RouteTubes (TubeGeometry along path)
│   └── DependencyEdges (dashed line, low opacity, hover-revealed)
├── EffectsLayer
│   ├── DisruptionWaves[] (per disrupted node)
│   ├── ParticleFlows[] (route particles)
│   └── AgentOverlays[] (orbit icons per active agent)
├── OverlayLayer (HTML floating panels via @react-three/drei Html)
│   ├── NodeTooltip
│   ├── NodeLabels (at distance > 12 units)
│   └── AgentBadges
└── CameraController
    ├── OrbitControls (damping, limits)
    └── GSAPAnimator (programmatic transitions)
```

---

## 4. World Objects

### 4.1 SupplierNode

| Property | Source | Visual Effect |
|----------|--------|--------------|
| `risk_scores.composite` | Risk Engine | Color: green (0) → red (1) |
| `is_disrupted` | World Model | Emissive glow + DisruptionWave |
| `inventory_level` | World Model | Scale: 0.8 (low) → 1.2 (high) |
| `tier` | World Model | Size: tier-1 = 1.0, tier-2 = 0.8 |

**Geometry**: Sphere (radius 0.5–1.0 by capacity)
**Material**: `MeshStandardMaterial`, metalness 0.4, roughness 0.5
**Emissive**: proportional to `risk_scores.composite` × 0.6
**Selection ring**: Torus (thin, 1.3× node radius, accent color, rotates in Y)

---

### 4.2 WarehouseNode

| Property | Source | Visual Effect |
|----------|--------|--------------|
| `risk_scores.composite` | Risk Engine | Color: green → red |
| `inventory_level` | World Model | Box Y-scale: inventory fill visual |
| `is_disrupted` | World Model | Emissive glow |
| `utilization` | World Model | Subtle inner glow proportional to utilization |

**Geometry**: Box (1.0 × inventory_fill × 1.0)
**Scale Y**: `0.3 + inventory_level * 0.7` (warehouse "fill" visual)

---

### 4.3 FulfillmentCenterNode

| Property | Source | Visual Effect |
|----------|--------|--------------|
| `risk_scores.sla` | Risk Engine | SLA-specific color aura |
| `utilization` | World Model | Animation speed of internal pulse |
| `sla_at_risk_count` | World Model | Warning badge on HTML overlay |

**Geometry**: Octahedron (radius 1.2)
**Animation (idle)**: Slow rotation on Y axis (0.2 rad/s)
**Animation (SLA risk)**: Faster rotation + amber glow

---

### 4.4 CustomerZoneNode

**Geometry**: Icosahedron (radius 0.4) — small, de-emphasized
**Color**: White → amber proportional to `sla_current_risk`
**Opacity**: 0.6 at idle, 1.0 when selected

---

### 4.5 PortNode

**Geometry**: Custom diamond (cone + inverted cone)
**Color**: Risk-driven
**Special**: When disrupted, pulsing red ring emanates (marks chokepoint)

---

### 4.6 RouteTube

| Property | Source | Visual Effect |
|----------|--------|--------------|
| `load` | World Model | Tube radius: 0.04 (idle) → 0.10 (overloaded) |
| `is_disrupted` | World Model | Color: grey/red + dash animation |
| `delay_hours` | World Model | Particle speed slows with delay |
| `transport_mode` | World Model | Particle color: SEA=blue, AIR=white, ROAD=amber |

**Geometry**: `TubeGeometry(CatmullRomCurve3)` along node positions
**Particles**: GPU instanced `SphereGeometry(0.03)` along tube path
**Particle count**: Proportional to `capacity`

---

### 4.7 DisruptionWave

Triggered when `is_disrupted: true` OR `risk.propagated` event fires.

```tsx
// Expanding torus ring, animated via shader
<DisruptionWave
  position={node.position}
  color={disruption_color}  // red = critical, amber = high
  onAnimationComplete={() => {}}
/>
```

- Starts at scale 0.5, expands to 3.0 over 2s
- Opacity fades from 0.8 to 0.0
- Loops 3 times then stops (unless node remains disrupted)

---

### 4.8 ParticleFlow (Route)

Particles travel from source to destination along route tube path.

| State | Speed | Density | Color |
|-------|-------|---------|-------|
| Idle | 0.3 | Low | dim mode color |
| Active | 0.8 | Medium | transport mode color |
| Overloaded | 1.2 | High | amber |
| Disrupted | 0.0 | 0 | — (particles stop) |

Rerouted particles: fade out on old route, fade in on new route (600ms transition).

---

### 4.9 AgentOverlay (during agent run)

When `agent.started` fires for an agent:

```tsx
<Html position={[node.x, node.y + 1.5, node.z]}>
  <AgentBadge agentId="inventory" status="RUNNING" />
</Html>
```

Agent badge: small colored circle (agent's color) + pulsing ring.
When `agent.proposal` fires: badge fills solid + shows agent icon (checkmark or X).

---

### 4.10 PlanChangeAnimation

When `plan.accepted` fires:
1. New route tubes grow from source to destination (TubeGeometry morph, 600ms)
2. Nodes on the plan's path color-lerp to healthier risk color (400ms each, staggered)
3. Particles begin flowing on new routes
4. Camera optionally zooms out to show full plan scope (GSAP, 1200ms)

---

## 5. Interactions

### Hover

| Element | Effect |
|---------|--------|
| Node | Scale +5%; tooltip appears (HTML overlay) |
| Route edge | Line highlights + tooltip (load, delay, mode) |
| Agent badge | Tooltip (agent name, status, actions count) |

### Select

| Element | Effect |
|---------|--------|
| Node | Selection ring appears (200ms); NodeInspector panel slides in |
| Route edge | Edge highlights; EdgeDetail panel slides in |
| Deselect (Esc) | Ring fades; panel slides out |

### Focus (F key or double-click)

Camera: `GSAP.to(camera.position, { target: node.position, duration: 0.8 })` with smooth lookAt.

### Context Menu (right-click node)

- "Highlight Neighbors" → non-neighbors fade to 10% opacity
- "View in Risk Explorer" → navigate to `/risks?node={id}`
- "Pin Node" → always visible in filter mode
- "Isolate" → all other nodes hide

### Camera Reset (R key)

`GSAP.to(camera.position, { x: 0, y: 10, z: 20, duration: 0.8 })` + reset lookAt.

---

## 6. Camera States

| State | Position | LookAt | Transition |
|-------|----------|--------|-----------|
| Default | [0, 10, 20] | [0, 0, 0] | On load / R key |
| Node focused | [nx+2, ny+4, nz+8] | node position | F key / double-click (GSAP 0.8s) |
| Plan view | [-2, 15, 25] | centroid of plan nodes | plan.accepted event (GSAP 1.2s) |
| Agent view | [0, 12, 22] | world center | agent.started event |
| Adversary view | Red light direction | highest-risk node | adversary.attack event |

---

## 7. Animation Catalog

| Event | Animation | Duration | Easing |
|-------|-----------|---------|--------|
| World load | All nodes fade in (opacity 0→1) | 600ms staggered | ease-out |
| `signal.detected` | White flash at affected nodes | 1s pulse | ease-out |
| `risk.update` | Node color lerp to new risk | 400ms per node | linear |
| `risk.propagated` | DisruptionWave at each hop's nodes | 2s per hop | ease-out |
| `scenario.propagation_step` | DisruptionWave, sequential hops | 500ms/hop | ease-out |
| `agent.started` | AgentBadge appears (scale 0→1) | 200ms | spring |
| `agent.proposal` | Badge solidifies (RUNNING→COMPLETE) | 300ms | ease-out |
| `adversary.attack` | Red flash at plan's weak nodes | 800ms | ease-in-out |
| `plan.accepted` | New tubes grow; node colors improve | 600ms tubes, 400ms nodes | ease-in-out |
| Node hover | Scale 1.0 → 1.05 | 150ms | ease-out |
| Node select | Ring appears, scale 1.0 | 200ms | spring |
| Camera focus | Smooth fly-in | 800ms | power2.inOut |
| Camera reset | Smooth fly-out | 800ms | power2.inOut |

---

## 8. Data Mapping (Backend State → Visual)

| Backend Field | Visual Property | Component |
|--------------|-----------------|-----------|
| `node.risk_scores.composite` | Node color (green→red) | `NodeLayer` |
| `node.is_disrupted` | Emissive glow + DisruptionWave | `NodeLayer` + `DisruptionWave` |
| `node.inventory_level` | Warehouse Y-scale | `WarehouseNode` |
| `edge.load` | Tube radius | `EdgeLayer` |
| `edge.is_disrupted` | Route grey/dash + no particles | `EdgeLayer` |
| `edge.delay_hours` | Particle speed reduction | `ParticleFlow` |
| `edge.transport_mode` | Particle color | `ParticleFlow` |
| `network_health_score` | Overall scene brightness | PostProcessing exposure |
| `agent.status == RUNNING` | AgentBadge pulsing | `AgentOverlay` |
| `plan.accepted` | New tubes + color lerp | `PlanChangeAnimation` |
| `adversary_finding.severity` | Severity of red flash | `DisruptionWave` |

---

## 9. Performance Strategy

| Concern | Solution |
|---------|---------|
| 30+ nodes | `InstancedMesh` for all same-type nodes |
| 100+ nodes | Enable LOD (far = sphere only, near = full geometry) |
| 50+ routes | `InstancedMesh` for particles; GPU instancing |
| 30fps drop | Disable bloom + FXAA; reduce particle count |
| WebGL unavailable | React Flow 2D fallback (same data) |
| Mobile | Reduce particle count by 80%; disable bloom |

Performance monitoring via `useFrame` + `renderer.info`.

---

## 10. 3D Data Flow

```
Backend state change (e.g., risk.update)
    ↓ WebSocket event
WebSocketProvider.handleMessage()
    ↓ Zustand: setRiskMap()
useWorldStore().riskMap changes
    ↓ React re-render triggers
NodeLayer.useFrame():
    for each node in instancedMesh:
        target_color = riskToColor(node.risk_scores.composite)
        current_color.lerp(target_color, 0.016 / 0.4)  // 400ms lerp
        instancedMesh.setColorAt(i, current_color)
    instancedMesh.instanceColor.needsUpdate = true
```

All color transitions happen in `useFrame` (GPU, 60fps) — not React re-renders.

---

## 11. WebGL Fallback (2D Mode)

Triggered when `WebGLRenderingContext` is unavailable or user selects 2D mode.

```tsx
const WebGLFallback: React.FC = () => {
  const snapshot = useWorldSnapshot()
  return (
    <ReactFlow
      nodes={snapshot.nodes.map(nodeToFlowNode)}
      edges={snapshot.edges.map(edgeToFlowEdge)}
      fitView
    />
  )
}
```

All interactions (select, filter, inspect) work identically in 2D mode.

---

## 12. Tests

```typescript
// 3D visual tests (Playwright visual regression)

test('risk heatmap: high-risk nodes are red', async ({ page }) => {
  // Seed world with high-risk node
  // Navigate to /world
  // Screenshot compare: node color should be red-family
})

test('disruption wave appears on signal inject', async ({ page }) => {
  // Inject CRITICAL signal
  // Wait 1s
  // Screenshot compare: disruption wave visible
})

test('particle flow stops on disrupted route', async ({ page }) => {
  // Mark route as disrupted
  // Screenshot: no moving particles on that route
})
```
