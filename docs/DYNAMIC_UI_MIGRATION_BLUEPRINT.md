# FULFILL-X — Dynamic UI Migration Blueprint

## Overview

This blueprint specifies the technical architecture and migration roadmap for transforming the current frontend application into a fully dynamic, real-time, state-managed **Resilience OS UI**.

---

## 1. Target Frontend Architecture

```text
SERVER STATE (TanStack Query)
    ↓
    ├── /api/world/snapshot
    ├── /api/risks/map
    ├── /api/agents/proposals
    ├── /api/simulation/run
    └── /api/resilience-os/scorecard

CLIENT / UI LOCAL STATE (Zustand Stores)
    ↓
    ├── useAuthStore (user, role, tenant, permissions)
    ├── useRealtimeStore (WebSocket events, heartbeats)
    ├── useUIStore (activeTab, viewMode 2D/3D, selectedNodeId)
    └── useSimulationStore (scenario parameters, iterations)

REALTIME EVENT LAYER (WebSocket Manager)
    ↓
    ├── Session-scoped WebSocket channel (/api/ws/{session_id})
    ├── Automatic reconnect & exponential backoff
    └── EventEnvelope dispatcher pushing to Zustand & Query cache

AUTHORITATIVE BACKEND PERSISTENCE
    ↓
    └── FastAPI Backend + PostgreSQL Authoritative State
```

---

## 2. State Management Separation Contract

| Data Category | Target Owner | Technology | Revalidation Strategy |
| :--- | :--- | :--- | :--- |
| **World Model & Nodes** | Server State | TanStack Query | Refetch on window focus / 10s polling |
| **Risk Scores & Signals** | Server State + Realtime | TanStack Query + WS Event | WS push `RISK_UPDATED` / 5s |
| **Specialist Proposals** | Server State | TanStack Query | Refetch on deliberation event |
| **Simulations & Monte Carlo**| Server State | TanStack Query | On demand execution |
| **Active Tab & View Mode** | UI Local State | Zustand `useUIStore` | Instant local state update |
| **User Session & RBAC** | Client Auth State | Zustand `useAuthStore` | JWT payload / 15m refresh |
| **Realtime Event Stream** | Realtime Event Store | Zustand `useRealtimeStore` | Live WebSocket broadcast |

---

## 3. Component Migration Roadmap

### Stage 1: TanStack Query Provider & Query Keys
- Introduce `@tanstack/react-query` to wrap main App root.
- Define query keys: `['world', 'snapshot']`, `['risks', 'map']`, `['agents', 'proposals']`, `['resilience', 'scorecard']`.

### Stage 2: Realtime Mutation Cache Invalidation
- Connect WebSocket event dispatcher to query cache:
  - Event `SIGNAL_DETECTED` $\rightarrow$ Invalidate `['signals']` and `['risks', 'map']`.
  - Event `DECISION_APPROVED` $\rightarrow$ Invalidate `['cockpit', 'decisions']` and `['resilience', 'scorecard']`.
  - Event `MODEL_PROMOTED` $\rightarrow$ Invalidate `['learning', 'challengers']` and `['ml', 'models']`.

### Stage 3: Optimistic UI Updates for Consequential Actions
- In `DecisionCockpit`: Apply optimistic approval state while awaiting server authorization response.
- In `GovernanceCenter`: Optimistically update `SystemHealthStatus` badge when toggling operational modes.

### Stage 4: Error Boundaries & Fallback Components
- Wrap major workspaces in React `ErrorBoundary` with graceful retry buttons.
- Display explicit loading skeletons and empty states when backend returns zero records.
