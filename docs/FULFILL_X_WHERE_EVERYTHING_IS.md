# FULFILL-X — WHERE EVERYTHING IS

> **Release Baseline**: `6869cae8f31788ee68b06e7a4615ef4a5b504cfd`  

---

## 1. Full-Stack Code Locator Matrix

| Feature Domain | UI Workspace Component | Frontend State / Store | REST API Endpoint | Backend Service / Module | Backend Test File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Command Center** | `CommandWorkspace.tsx` | `useResilienceStore.ts` | `GET /api/v1/graph/topology` | `app/graph/service.py` | `test_graph_api.py` |
| **World Model 3D** | `WorldWorkspace.tsx` | `useResilienceStore.ts` | `GET /api/v1/twin/state` | `app/twin/service.py` | `test_twin.py` |
| **GNN Topology** | `GNNWorkspace.tsx` | `useResilienceStore.ts` | `GET /api/v1/gnn/propagation` | `app/gnn/models.py` | `test_gnn_models.py` |
| **Causal Counterfactuals** | `CausalWorkspace.tsx` | `useResilienceStore.ts` | `POST /api/v1/causal/counterfactual` | `app/causal/service.py` | `test_causal_counterfactual.py` |
| **Specialist Agents Swarm** | `AgentConstellationWorkspace.tsx` | `useAgentStore.ts` | `GET /api/v1/agents/deliberation` | `app/agents/swarm.py` | `test_agents.py` |
| **Adversarial Stress Test** | `AdversaryWorkspace.tsx` | `useResilienceStore.ts` | `POST /api/v1/adversary/attack` | `app/adversary/agent.py` | `test_adversary.py` |
| **Decision Cockpit** | `CockpitWorkspace.tsx` | `useCockpitStore.ts` | `GET /api/v1/cockpit/sessions` | `app/cockpit/service.py` | `test_cockpit.py` |
| **Formal Safety Plane** | `VerificationWorkspace.tsx` | `useCockpitStore.ts` | `POST /api/v1/verification/verify` | `app/verification/engine.py` | `test_verification.py` |
| **Digital Twin Simulation** | `DigitalTwinWorkspace.tsx` | `useTwinStore.ts` | `POST /api/v1/simulation/monte-carlo` | `app/simulation/monte_carlo.py` | `test_monte_carlo.py` |
| **Deliberate Learning** | `DeliberateWorkspace.tsx` | `useResilienceStore.ts` | `GET /api/v1/learning/memory` | `app/learning/pipeline.py` | `test_learning_pipeline.py` |
| **Realtime Observability** | `EventsWorkspace.tsx` | `useResilienceStore.ts` | `WS /ws` | `app/realtime/websocket_manager.py` | `test_websocket_hardening.py` |
| **Resilience OS Governance** | `ResilienceOSWorkspace.tsx` | `useResilienceStore.ts` | `GET /api/v1/resilience/policy` | `app/resilience/policy_engine.py` | `test_policy_engine.py` |
| **Evaluation Harness** | `EvaluationWorkspace.tsx` | `useResilienceStore.ts` | `GET /api/v1/evaluation/results` | `app/evaluation/harness.py` | `test_evaluation.py` |

---

## 2. Directory Structure Map

```
FULFILL-X/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers and route handlers
│   │   ├── agents/          # 7 Specialist Swarm Agents + Coordinator
│   │   ├── adversary/       # Red team attack agent
│   │   ├── ai/              # AI provider adapters (Gemini, Ollama, Bedrock, Mock)
│   │   ├── causal/          # Causal DAG counterfactual impact engine
│   │   ├── cockpit/         # Decision cockpit & Pareto plan reconciliation
│   │   ├── evaluation/      # Benchmark scoring harness
│   │   ├── gnn/             # PyTorch/Scikit GNN embedding models
│   │   ├── graph/           # NetworkX 23-node supply chain graph
│   │   ├── learning/        # Deliberate learning & challenger memory
│   │   ├── realtime/        # WebSocket event connection manager
│   │   ├── resilience/      # Policy engine & operational mode controls
│   │   ├── security/        # Tenant header isolation & RBAC
│   │   ├── simulation/      # Digital Twin & Monte Carlo 1,000-trial engine
│   │   └── verification/    # Formal safety boundary plane
│   └── tests/               # 62 Pytest backend test files (249 passed)
├── frontend/
│   └── src/
│       ├── api/             # Axios client & TanStack queryClient
│       ├── components/
│       │   ├── layouts/     # SpatialAppLayout & top navigation header
│       │   ├── ui/          # Reusable glass cards, badges, buttons, tooltips
│       │   ├── visualization/ # R3F WebGL 3D graph canvases & Recharts
│       │   └── workspaces/  # 18 Major workspace React components
│       ├── store/           # Zustand stores (`useResilienceStore`, etc.)
│       └── App.tsx          # React Router v6 routing table
└── docs/                    # Architectural specs & release matrices
```
