# FULFILL-X — UI 3D SCENE ARCHITECTURE

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. THREE.JS / REACT THREE FIBER (R3F) CANVAS ENGINE

`FULFILL-X` uses a single shared WebGL canvas instance powered by `@react-three/fiber` and `@react-three/drei` mounted high in the React component tree. This avoids context recreation overhead during route changes.

---

## 2. 11 DISTINCT VISUAL ENVIRONMENTS

The spatial 3D engine dynamically shifts camera angle, lighting rig, post-processing filters, and background mesh geometry depending on the active workspace:

1. **HOME:** Atmospheric spatial supply network with rotating global map projection and glowing particle stream background.
2. **COMMAND:** Tactical operational grid with real-time risk halos, node status rings, and active signal pulse vectors.
3. **WORLD:** Interactive 3D supply-chain topology graph displaying node geometries, directional flow edges, and node elevation offsets.
4. **INTELLIGENCE:** AI agent constellation and GNN neural network latent space point cloud.
5. **RISK:** 3D threat propagation volume field with color-graded risk heatmaps radiating across topology edges.
6. **RESPONSE:** Cybernetic war room and adversarial stress-test arena with red threat lightning strikes.
7. **DECISION:** 3D Pareto surface landscape displaying candidate plans in multidimensional objective space (Cost vs Speed vs Risk).
8. **SIMULATION:** Holographic Digital Twin snapshot projection with parallel Monte Carlo stochastic future cloud trajectories.
9. **LEARNING:** 3D Champion vs Challenger neural orbit ring and memory vector galaxy point cloud.
10. **OBSERVABILITY:** 3D kinetic event stream pipeline and distributed trace waterfall lattice.
11. **GOVERNANCE:** Minimal enterprise control environment featuring 3D security lock barriers and policy perimeter shields.

---

## 3. 18 REUSABLE SPATIAL PRIMITIVES (TYPESCRIPT CONTRACTS)

To ensure performance, modularity, and zero code duplication, 18 spatial 3D components are specified as reusable React Three Fiber primitives:

```typescript
// 1. SpatialNode Primitive
export interface SpatialNodeProps {
  id: string;
  position: [number, number, number];
  type: 'SUPPLIER' | 'HUB' | 'PORT' | 'PLANT' | 'DEMAND';
  riskScore: number;
  isDisrupted: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// 2. SpatialEdge Primitive
export interface SpatialEdgeProps {
  id: string;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  transitLoad: number;
  isDisrupted: boolean;
}

// 3. NetworkGraph Primitive
export interface NetworkGraphProps {
  nodes: SpatialNodeProps[];
  edges: SpatialEdgeProps[];
  selectedNodeId: string | null;
}

// 4. RiskPulse Primitive
export interface RiskPulseProps {
  origin: [number, number, number];
  severity: number;
  radius: number;
  color: string;
}

// 5. PropagationTrail Primitive
export interface PropagationTrailProps {
  path: [number, number, number][];
  speed: number;
  color: string;
}

// 6. AgentEntity Primitive
export interface AgentEntityProps {
  agentId: string;
  role: string;
  status: 'IDLE' | 'ANALYZING' | 'PROPOSING' | 'CONSENSUS';
  position: [number, number, number];
}

// 7. AgentConnection Primitive
export interface AgentConnectionProps {
  fromPos: [number, number, number];
  toPos: [number, number, number];
  activityLevel: number;
}

// 8. ThreatEntity Primitive
export interface ThreatEntityProps {
  targetPos: [number, number, number];
  severity: number;
  type: string;
}

// 9. ScenarioEntity Primitive
export interface ScenarioEntityProps {
  startHour: number;
  duration: number;
  severity: number;
}

// 10. DigitalTwinNode Primitive
export interface DigitalTwinNodeProps {
  nodeId: string;
  inventory: number;
  maxCapacity: number;
  simulatedState: any;
}

// 11. SimulationParticle Primitive
export interface SimulationParticleProps {
  count: number;
  bounds: [number, number, number];
  speed: number;
}

// 12. EventStream Primitive
export interface EventStreamProps {
  events: any[];
  rateTPS: number;
}

// 13. DecisionPoint Primitive
export interface DecisionPointProps {
  coordinates: [number, number, number]; // [Cost, Time, Risk]
  planId: string;
  isParetoOptimal: boolean;
}

// 14. ParetoLandscape Primitive
export interface ParetoLandscapeProps {
  points: DecisionPointProps[];
  selectedPlanId: string | null;
}

// 15. TelemetryStream Primitive
export interface TelemetryStreamProps {
  channelCount: number;
  throughput: number;
}

// 16. EnvironmentLighting Primitive
export interface EnvironmentLightingProps {
  preset: 'COMMAND' | 'WORLD' | 'RISK' | 'DECISION' | 'GOVERNANCE';
  intensity: number;
}

// 17. CameraController Primitive
export interface CameraControllerProps {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  fov: number;
  enableControls: boolean;
}

// 18. SelectionController Primitive
export interface SelectionControllerProps {
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}
```

---

## 4. POST-PROCESSING & RENDERING PIPELINE

- **Bloom Pass:** Subtle selective bloom (`intensity: 0.4`, `luminanceThreshold: 0.6`) applied to glowing status rings, risk pulse waves, and active event particles.
- **FXAA Anti-Aliasing:** Fast Approximate Anti-Aliasing enabled for crisp 3D edge rendering without heavy MSAA performance cost.
- **Tone Mapping:** ACESFilmicToneMapping (`exposure: 1.0`) ensuring natural saturation across neon cyan, emerald green, and crimson red light sources.
