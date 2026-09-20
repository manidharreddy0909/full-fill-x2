# FULFILL-X — Phase 13B Intelligence Visual System Architecture

## Overview

Phase 13B establishes five visually distinct, data-bound intelligence environments representing the computational intelligence pipeline of FULFILL-X:

```
WORLD (Physical Topology)
  ↓
SIGNALS (Telemetry & Observability)
  ↓
INTELLIGENCE (Multi-Agent Swarm Constellation)
  ↓
AGENTS (Deep Mind & Structured Reasoning Pipeline)
  ↓
GNN (Graph Neural Network Latent Matrix & Propagation)
  ↓
CAUSAL (Do-Calculus DAG & Counterfactual Sandbox)
  ↓
DECISION (Autonomous Pipeline Cockpit)
```

---

## 1. Visual Environment Specifications

### A. Multi-Agent Swarm Constellation (`/intelligence` & `/intelligence/agents`)
- **Visual Identity**: Orbital intelligence flight deck.
- **Composition**: Central Master Coordinator Node (`#c084fc`) at origin `[0,0,0]` surrounded by 6 Specialist Agent Nodes in a 3D circle ($R = 12$).
- **Data Binding**: `fetchAgents()`, `runAllSpecialists()`, `runCoordinator()`, WebSocket real-time events (`useRealtimeStore`).
- **Interactive Drawers**: 2D/3D mode switch, live WebSocket event feed ticker, reconciled candidate plans overlay drawer.

### B. Agent Mind & Reasoning Pipeline (`/intelligence/agents/:agentId`)
- **Visual Identity**: Operational AI mind & workspace view.
- **Structured Reasoning Pipeline**:
  - `SIGNAL` → Telemetry signal ingestion & risk trigger monitoring.
  - `ANALYSIS` → Specialist domain risk assessment.
  - `HYPOTHESIS` → Mitigation strategy formulation.
  - `PROPOSAL` → Structured candidate proposal emission (`actions`, `confidence`, `cost`, `delay`).
  - `VALIDATION` → Safety boundary verification before coordinator reconciliation.
- **Institutional Memory Timeline**: Chronological `AgentMemory` history log from `fetchAgentMemories`.

### C. Graph Intelligence Laboratory (`/intelligence/gnn`)
- **Visual Identity**: Mathematical graph neural network matrix (visually distinct from physical supply-chain topology).
- **Features**:
  - Latent space graph node matrix (`GNNGraphPrimitive`).
  - Predictive risk output with 95% confidence intervals (`predicted_risk_score`, `confidence_lower_95`, `confidence_upper_95`).
  - Multihop graph propagation path tracer (`trajectory`).
  - Graph centrality feature matrix (`degree_centrality`, `betweenness_centrality`).

### D. Causal Intelligence Laboratory (`/intelligence/causal`)
- **Visual Identity**: Structural Causal DAG & Counterfactual Sandbox.
- **Flow**: `CAUSE` → `MECHANISM` → `EFFECT`.
- **Evidence Level Demarcation**:
  - `SANDBOX_COUNTERFACTUAL` (Verified counterfactual do-calculus intervention).
  - `HIGH_CONFIDENCE_HYPOTHESIS` (Strong structural causal hypothesis).
  - `OBSERVED_ASSOCIATION` (Observational statistical association).
- **Counterfactual Run Simulation**: Interactively executes `runCounterfactualSimulation` with real API parameters.

---

## 2. Reusable Intelligence Visual Primitives

Located in `frontend/src/visual/intelligence/`:
- `AgentReasoningPipeline.tsx`: Renders structured operational reasoning stages with metrics.
- `AgentMemoryTimeline.tsx`: Renders institutional memory log timeline entries.
- `GNNGraphPrimitive.tsx`: Renders mathematical graph nodes, risk state rings, and propagation highlights.
- `CausalDAGPrimitive.tsx`: Renders cause-mechanism-effect flow DAG with counterfactual run results.

---

## 3. Data & API Binding Registry

| Environment | REST Endpoint | WebSocket / Store | Visual Primitive |
|---|---|---|---|
| Swarm Constellation | `/api/agents`, `/api/coordinator` | `useAgentStore`, `useRealtimeStore` | `AgentEntityPrimitive`, `AgentConstellationViewport` |
| Agent Mind | `/api/agents/:id`, `/api/learning/memories` | `useAgentStore` | `AgentReasoningPipeline`, `AgentMemoryTimeline` |
| GNN Lab | `/api/graph/snapshot`, `/api/gnn/predict`, `/api/graph/propagate` | `useVisualEnvironmentStore` | `GNNGraphPrimitive` |
| Causal Lab | `/api/causal/hypotheses`, `/api/causal/counterfactual` | `useVisualEnvironmentStore` | `CausalDAGPrimitive` |

---

## 4. Accessibility & Performance Discipline

- **2D / 3D Fallback**: Every 3D visualization includes an accessible 2D data matrix option.
- **No Fabricated Data**: Visual state strictly reflects backend API responses.
- **Performance**: Zero external high-poly assets; uses shared R3F primitives and Framer Motion hardware-accelerated transitions.
