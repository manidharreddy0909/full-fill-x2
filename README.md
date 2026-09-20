# FULFILL-X — Agentic Fulfillment Resilience Intelligence System

> **Status**: Production Release v1.0 — Autonomous Operations OS & Hackathon Submission

---

## What is FULFILL-X?

FULFILL-X is a production-quality agentic system that provides **fulfillment resilience intelligence** for complex supply networks.

It continuously:
- **Observes** real-world signals (weather, geopolitics, supplier health, demand shifts)
- **Maintains** a live world model of the supply network
- **Quantifies** multi-dimensional risk with compound scenario analysis
- **Deploys** specialist AI agents to propose resilient plans
- **Adversarially validates** those plans to expose hidden weaknesses
- **Selects** the optimal multi-objective fulfillment plan
- **Explains** every decision with traceable evidence

### Core Pipeline

```
OBSERVE → WORLD MODEL → RISK → COMPOUND SCENARIO →
SPECIALIST AGENTS → ADVERSARY → MULTI-OBJECTIVE PLAN → VERIFY → MEMORY
```

---

## Architecture at a Glance

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS v3 |
| **3D Visualization** | React Three Fiber + Three.js + Drei |
| **Animation** | Framer Motion |
| **State** | Zustand + TanStack React Query |
| **Backend** | Python 3.12 + FastAPI + WebSockets |
| **AI Providers** | Gemini, Ollama, AWS Bedrock, Seeded Mock |
| **Simulation** | Deterministic Monte Carlo & Graph Propagation Engine |
| **Cloud Infrastructure (IaC)** | Terraform (Amazon ECR, ECS Fargate, ALB, S3, CloudFront, CloudWatch) |

---

## Specialist Agents

| Agent | Objective |
|---|---|
| **Inventory Agent** | Minimize stockout risk |
| **Supplier Agent** | Reduce supplier disruption impact |
| **Transportation Agent** | Minimize delay and cost |
| **Fulfillment Agent** | Protect service-level agreements |
| **Sustainability Agent** | Minimize emissions |
| **Resilience Agent** | Reduce systemic fragility |
| **Coordinator Agent** | Reconcile proposals and trade-offs |
| **Adversary Agent** | Attack candidate plans and expose weaknesses |

---

## Main UI Workspaces

1. Executive Command Center (`/command`)
2. 3D Digital Twin & Spatial Network (`/world`)
3. Swarm Intelligence & Specialist Agents (`/intelligence`)
4. GNN Multi-hop Risk Propagation (`/intelligence/gnn`)
5. Causal DAG Counterfactual Simulator (`/intelligence/causal`)
6. Incident Command War Room (`/response/war-room`)
7. Adversary Attack Laboratory (`/response/adversary`)
8. Decision Cockpit 8-Stage Pipeline (`/decision/cockpit`)
9. Safety Boundary Sandbox Verification (`/decision/verification`)
10. Digital Twin 1,000-Run Monte Carlo Simulation (`/simulation/twin`)
11. Continuous Learning & Challenger Governance (`/learning/deliberate`)
12. Observability & Event Stream Telemetry (`/observability/events`)
13. Policy Engine & Governance (`/governance/policies`)
14. System Evaluation Benchmark Suite (`/evaluation`)

---

## Quick Start (Development & Local Runtime)

```bash
# 1. Backend Startup
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 2. Frontend Startup
cd frontend
npm install
npm run dev
```

Visit local frontend at `http://localhost:5173` and backend API at `http://localhost:8000/docs`.

---

## Documentation Index

| Document | Purpose |
|---|---|
| [LICENSE](LICENSE) | Root Proprietary Software License |
| [SECURITY.md](SECURITY.md) | Security Policy & Vulnerability Disclosure Guidance |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Developer Contribution Guidelines |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Professional Code of Conduct |
| [LICENSES/THIRD_PARTY.md](LICENSES/THIRD_PARTY.md) | Third-Party Open Source License Notices |
| [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md) | Architectural Vision & Phase Roadmap |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System Runtime Architecture |
| [docs/AWS_ARCHITECTURE.md](docs/AWS_ARCHITECTURE.md) | AWS Deployment Specification |

---

## Licensing & Attribution

- **FULFILL-X Source Code**: Proprietary — All Rights Reserved. See [LICENSE](LICENSE) for details.
- **Third-Party Dependencies**: Retain their respective open-source licenses (MIT, Apache 2.0, BSD-3-Clause, ISC). See [LICENSES/THIRD_PARTY.md](LICENSES/THIRD_PARTY.md) for the full inventory.
