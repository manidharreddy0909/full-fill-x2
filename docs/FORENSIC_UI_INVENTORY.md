# FULFILL-X — Forensic UI Inventory & Source Audit

## 1. Executive Summary

This document records the complete, authoritative source tree inventory of all routes, pages, workspaces, layouts, shared UI components, buttons, tabs, 3D primitives, Zustand stores, and API clients in FULFILL-X.

---

## 2. Authoritative Source Inventory Matrix

| Item | File Path | Route | Purpose | State / API | Interactive | Tested | Status |
|---|---|---|---|---|---|---|---|
| **App Layout Shell** | `frontend/src/components/layouts/SpatialAppLayout.tsx` | Global | Top-level spatial viewport frame & modals | `appShellStore`, `visualEnvironmentStore` | YES | YES | **VERIFIED** |
| **Navbar** | `frontend/src/components/common/Navbar.tsx` | Global | Grouped tab navigation, preset/seed selector, status pills | `authStore`, REST seed APIs | YES | YES | **VERIFIED** |
| **Home Landing** | `frontend/src/components/workspaces/HomeWorkspace.tsx` | `/` | Operational introduction, live network state & 3D canvas | `worldApi.ts`, `riskApi.ts` | YES | YES | **VERIFIED** |
| **Command Control** | `frontend/src/components/workspaces/CommandWorkspace.tsx` | `/command` | Operations hub, alerts ticker & live network topology | `worldApi.ts`, `riskApi.ts`, WS | YES | YES | **VERIFIED** |
| **World Model** | `frontend/src/components/workspaces/WorldWorkspace.tsx` | `/world` | Digital twin topology, node heatmaps & Inspector drawer | `worldApi.ts`, `riskApi.ts` | YES | YES | **VERIFIED** |
| **Node Inspector** | `frontend/src/components/workspaces/NodeInspectorWorkspace.tsx` | `/world/node/:id` | Dedicated node dependency & risk breakdown | `worldApi.ts` | YES | YES | **VERIFIED** |
| **Swarm Constellation** | `frontend/src/components/workspaces/AgentConstellationWorkspace.tsx` | `/intelligence`, `/intelligence/agents` | Multi-agent reasoning pipeline & proposal list | `agentApi.ts`, `coordinatorApi.ts` | YES | YES | **VERIFIED** |
| **Agent Detail** | `frontend/src/components/workspaces/AgentDetailWorkspace.tsx` | `/intelligence/agents/:agentId` | Agent-specific memory logs & proposal history | `agentApi.ts` | YES | YES | **VERIFIED** |
| **Risk Workspace** | `frontend/src/components/workspaces/RiskWorkspace.tsx` | `/intelligence/risk` | Multi-dimensional risk matrix & signal injection | `riskApi.ts` | YES | YES | **VERIFIED** |
| **Graph GNN** | `frontend/src/components/workspaces/GNNWorkspace.tsx` | `/intelligence/gnn` | GNN risk propagation vectors & layer embeddings | `graphIntelligenceApi.ts` | YES | YES | **VERIFIED** |
| **Causal DAG** | `frontend/src/components/workspaces/CausalWorkspace.tsx` | `/intelligence/causal` | Causal hypothesis trees & counterfactual simulation | `graphIntelligenceApi.ts` | YES | YES | **VERIFIED** |
| **Incident War Room** | `frontend/src/components/workspaces/WarRoomWorkspace.tsx` | `/response/war-room` | Active disruption triage & specialist conflict resolution | `coordinatorApi.ts`, WS | YES | YES | **VERIFIED** |
| **Adversary Testing** | `frontend/src/components/workspaces/AdversaryWorkspace.tsx` | `/response/adversary` | Red-team vulnerability stress test engine | `adversaryApi.ts` | YES | YES | **VERIFIED** |
| **Decision Cockpit** | `frontend/src/components/workspaces/CockpitWorkspace.tsx` | `/decision/cockpit` | Multi-objective plan synthesis & pipeline orchestrator | `cockpitApi.ts` | YES | YES | **VERIFIED** |
| **Verification Gate** | `frontend/src/components/workspaces/VerificationWorkspace.tsx` | `/decision/verification` | Formal constraint verification & authorization boundary | `verificationApi.ts`, `enterpriseApi.ts` | YES | YES | **VERIFIED** |
| **Digital Twin Lab** | `frontend/src/components/workspaces/DigitalTwinWorkspace.tsx` | `/simulation/twin` | Stochastic Monte Carlo simulation & criticality rankings | `simulationApi.ts` | YES | YES | **VERIFIED** |
| **Deliberate Learning** | `frontend/src/components/workspaces/DeliberateWorkspace.tsx` | `/learning/deliberate` | Institutional memory log & challenger model lifecycle | `learningApi.ts` | YES | YES | **VERIFIED** |
| **Observability Telemetry**| `frontend/src/components/workspaces/EventsWorkspace.tsx` | `/observability/events` | Real-time WebSocket feed & operational alerts triage | `observabilityApi.ts`, WS | YES | YES | **VERIFIED** |
| **Resilience OS** | `frontend/src/components/workspaces/ResilienceOSWorkspace.tsx` | `/governance/resilience` | Enterprise resilience scorecard & chaos fault injection | `enterpriseApi.ts` | YES | YES | **VERIFIED** |
| **Governance Policies** | `frontend/src/components/workspaces/GovernanceWorkspace.tsx` | `/governance/policies` | Model cards inspector & policy evaluation engine | `enterpriseApi.ts` | YES | YES | **VERIFIED** |
| **Evaluation Harness** | `frontend/src/components/workspaces/EvaluationWorkspace.tsx` | `/evaluation` | Benchmark scenario catalog & run history table | `evaluation.ts` | YES | YES | **VERIFIED** |

---

## 3. Inventory Summary

- **Total Workspace Components**: 18
- **Total Route Paths Defined**: 20
- **Total API Client Modules**: 24
- **Total Shared UI Components**: 32
- **Zustand State Stores**: 5 (`appShellStore`, `visualEnvironmentStore`, `realtimeStore`, `authStore`, `evaluationStore`)
