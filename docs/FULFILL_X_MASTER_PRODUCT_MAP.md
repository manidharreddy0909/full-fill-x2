# FULFILL-X — MASTER PRODUCT MAP

> **Release Baseline**: `6869cae8f31788ee68b06e7a4615ef4a5b504cfd`  
> **Status**: Frozen Production Release Baseline  

---

## 1. System Hierarchy Tree

```
FULFILL-X (Agentic Fulfillment Resilience Intelligence Platform)
│
├── 1. Frontend Workspace Layer (React 18 + R3F + Tailwind)
│   ├── Command Center (`/command`) — Operations overview & node matrix
│   ├── World Model (`/world`, `/world/node/:id`) — 3D spatial graph twin
│   ├── Intelligence Workspaces
│   │   ├── Agent Constellation (`/intelligence`, `/intelligence/agents`)
│   │   ├── Risk Explorer (`/intelligence/risk`)
│   │   ├── GNN Risk Topology (`/intelligence/gnn`)
│   │   └── Causal Counterfactuals (`/intelligence/causal`)
│   ├── Autonomous Response Workspaces
│   │   ├── Incident War Room (`/response/war-room`)
│   │   └── Adversary Attack Lab (`/response/adversary`)
│   ├── Decision Cockpit & Verification
│   │   ├── Pipeline Orchestrator (`/decision/cockpit`)
│   │   └── Formal Safety Plane (`/decision/verification`)
│   ├── Digital Twin & Simulation
│   │   └── Monte Carlo Twin (`/simulation/twin`)
│   ├── Deliberate Learning (`/learning/deliberate`) — Challenger memory bank
│   ├── Real-Time Observability (`/observability/events`) — WebSocket event stream
│   ├── Governance & Policy Engine
│   │   ├── Resilience OS (`/governance/resilience`)
│   │   └── Enterprise Policy Plane (`/governance/policies`)
│   └── Evaluation Harness (`/evaluation`) — Benchmark scoring suite
│
├── 2. Agent Intelligence Layer (`backend/app/agents`)
│   ├── 7 Specialist Swarm Agents (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience, Coordinator)
│   ├── Adversary Red-Team Agent (`backend/app/adversary`)
│   └── Deliberation & Proposal Reconciliation Pipeline
│
├── 3. World Model & Risk Engine Layer (`backend/app/graph` & `backend/app/risk`)
│   ├── NetworkX Supply Graph (23 nodes, 32 edges)
│   ├── PyTorch/Scikit GNN Embedding & Risk Propagation
│   └── Causal DAG Impact Estimation
│
├── 4. Simulation & Verification Layer (`backend/app/simulation` & `backend/app/verification`)
│   ├── Discrete Event Digital Twin Simulation Engine
│   ├── Seed-based 1,000-trial Monte Carlo Engine
│   └── Formal Safety Verification Boundary Plane
│
├── 5. Infrastructure & Security Layer (`backend/app/security` & `deploy/aws`)
│   ├── Multi-tenant `X-Tenant-ID` Isolation Middleware
│   ├── Structured AI Provider Adapters (Gemini, Ollama, Bedrock, Mock AI)
│   └── WebSocket Event Broadcast Manager (`backend/app/realtime`)
```

---

## 2. High-Level Component Dependency Matrix

| Component | Purpose | Input Dependencies | Output Artifacts | Primary Consumer |
| :--- | :--- | :--- | :--- | :--- |
| **World Model Graph** | Maintains 23-node supply network state | Ingested signals & supplier status | Network topology & node metrics | Command Center, GNN Engine |
| **Risk Engine** | Computes node & network risk scores | Raw telemetry & signal events | Composite risk scores & alerts | Specialist Swarm Agents |
| **Specialist Swarm Agents** | Generates domain mitigation proposals | Risk scores & supply state | Candidate plan proposals | Coordinator Agent |
| **Adversary Agent** | Attacks proposals to expose weaknesses | Candidate plan proposals | Vulnerability vector & stress score | Decision Cockpit |
| **Decision Cockpit** | Reconciles Pareto plan trade-offs | Evaluated candidate plans | Selected mitigation plan | Safety Verification Plane |
| **Safety Plane** | Enforces invariant constraints | Selected plan & safety policies | Authorization verdict (`ENFORCED`) | Execution & Digital Twin |
| **Digital Twin** | Simulates plan performance | Authorized plan & scenario seed | Monte Carlo distribution & SLA risk | Observability & Learning |
| **Deliberate Learning** | Retains operational resolution memory | Execution outcomes & feedback | Challenger model updates | Future Agent Deliberation |
