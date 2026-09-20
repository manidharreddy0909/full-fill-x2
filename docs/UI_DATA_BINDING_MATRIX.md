# FULFILL-X — UI DATA BINDING MATRIX

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. STRICT FRONTEND DATA PIPELINE RULE

Every visualization, HUD panel, 3D spatial node, and motion state in `FULFILL-X` must adhere to an explicit 6-stage data pipeline chain:

```
Backend API / WebSocket Event
  │
  ▼
TanStack Query / Zustand Store
  │
  ▼
Normalized Frontend Model Layer
  │
  ▼
React Component Workspace
  │
  ▼
Spatial 3D / 2D Visual Primitive
  │
  ▼
Framer Motion / GSAP Animation State
```

**Rule:** No visual component may mutate business state directly or contain hardcoded static data. All state originates from authenticated backend API responses or validated WebSocket event payloads.

---

## 2. EXHAUSTIVE DATA BINDING MATRIX

| Route / Component | Backend API Endpoint | WebSocket Event | TanStack Query Key | Zustand Store Slice | 3D Visual Primitive | Motion State Trigger |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Navbar & Header** | `GET /api/health`, `GET /api/ai/providers` | `HEALTH_MUTATED` | `['health']` | `realtimeStore.networkHealth` | `LivePulseDot` | Flash green/red on status change |
| **Command Center** | `GET /api/world/summary` | `SIGNAL_INJECTED` | `['worldSummary']` | `realtimeStore.activeSignals` | `TacticalGridMesh` | Risk halo expansion on signal |
| **World Topology** | `GET /api/world/snapshot` | `NODE_DISRUPTED` | `['worldSnapshot']` | `worldStore.snapshot` | `SpatialNode`, `SpatialEdge` | Node geometry pulse & scale up |
| **Node Inspector** | `GET /api/world/nodes/{id}` | `INVENTORY_MUTATED` | `['nodeDetail', id]` | `worldStore.selectedNodeId` | `FocusedNodeMesh` | Inventory gauge fill transition |
| **Risk Heatmap** | `GET /api/risk/map` | `RISK_PROPAGATED` | `['riskMap']` | `riskStore.nodeRisks` | `RiskPulseVolume` | Radiating concentric risk waves |
| **Threat Signals** | `GET /api/risk/signals` | `SIGNAL_INJECTED` | `['riskSignals']` | `realtimeStore.activeSignals` | `RadarThreatDome` | Arc trajectory pulse on arrival |
| **GNN Topology** | `POST /api/graph/predict-risk` | `GNN_PREDICTED` | `['gnnPrediction']` | `graphStore.prediction` | `NeuralLatentCloud` | Latent cluster layout spring |
| **Causal Intelligence** | `POST /api/graph/causal/hypotheses` | `CAUSAL_UPDATED` | `['causalHypotheses']` | `causalStore.hypotheses` | `DAGNetworkMesh` | Directional arrow flow animation |
| **Specialist War Room** | `POST /api/coordinator/deliberate` | `AGENT_ACTION_PROPOSED` | `['agentSpecialists']` | `agentStore.proposals` | `AgentConstellation` | Energy beam transfer to coordinator |
| **Adversary Engine** | `POST /api/adversary/attack` | `CHAOS_FAULT_INJECTED` | `['attackResult']` | `adversaryStore.attack` | `AdversaryArena` | Red lightning strike on node |
| **Scenario Injector** | `POST /api/simulation/scenarios/generate` | `SCENARIO_CREATED` | `['scenariosList']` | `scenarioStore.scenario` | `ScenarioTimelineMesh` | Event marker drop onto 3D timeline |
| **Decision Cockpit** | `GET /api/cockpit/proposals` | `DECISION_STATUS_CHANGED` | `['cockpitProposals']` | `cockpitStore.proposals` | `ParetoLandscapeMesh` | Surface deformation on weight change |
| **Verification Sandbox** | `POST /api/verification/verify` | `PLAN_VERIFIED` | `['verificationResult']` | `verificationStore.result` | `SandboxNetworkMesh` | Step-by-step action playback beam |
| **Executive Approval** | `POST /api/cockpit/approve` | `EXECUTIVE_APPROVAL_GRANTED` | `['pendingApprovals']` | `cockpitStore.approval` | `ExecutiveSealMesh` | Gold seal ring rotation & check pulse |
| **Digital Twin** | `POST /api/simulation/twin/create` | `TWIN_STEP_EXECUTED` | `['twinState', id]` | `twinStore.twinState` | `DigitalTwinHologram` | Holographic scanline sweep effect |
| **Monte Carlo Engine** | `POST /api/simulation/monte-carlo/run` | `MONTE_CARLO_RUN_FINISHED` | `['mcResult', id]` | `monteCarloStore.result` | `StochasticFutureCloud` | Parallel trajectory line growth |
| **Strategy Analyzer** | `POST /api/simulation/strategies/compare` | `STRATEGY_COMPLETED` | `['strategyComparison']` | `strategyStore.comparison` | `HorizonComparisonChart` | Dual-surface elevation morphing |
| **Deliberate Learning** | `POST /api/learning/deliberate` | `CHALLENGER_PROMOTED` | `['learningStatus']` | `learningStore.champion` | `ChampionChallengerRing` | Neural ring orbit particle flash |
| **Agent Memory Store** | `GET /api/learning/memory/search` | `MEMORY_TUPLE_ADDED` | `['agentMemory']` | `memoryStore.tuples` | `MemoryVectorGalaxy` | Galaxy point cloud similarity cluster |
| **Observability Stream** | `GET /api/observability/events/history` | `*` (All events) | `['eventStats']` | `realtimeStore.eventHistory` | `KineticEventStream` | Cascading event row slide-in |
| **Distributed Traces** | `GET /api/observability/traces` | `TRACE_SPAN_COMPLETED` | `['tracesList']` | `observabilityStore.traces` | `TraceWaterfallLattice` | Gantt timeline bar expansion |
| **Policy Engine** | `GET /api/governance/policies` | `POLICY_MUTATED` | `['governancePolicies']` | `governanceStore.policies` | `GovernanceCube` | Perimeter shield pulse on violation |
| **Execution Safety** | `GET /api/execution/safety/status` | `EXECUTION_MODE_MUTATED` | `['executionSafety']` | `executionStore.mode` | `ExecutionSafetyGate` | Dual-lock barrier rotation |
