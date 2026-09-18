# FULFILL-X — Agentic Fulfillment Resilience Intelligence System

> **Status**: Phase 00 Complete — Project Governance Initialized

---

## What is FULFILL-X?

FULFILL-X is a production-quality, hackathon-ready agentic system that provides **fulfillment resilience intelligence** for complex supply networks.

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
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + shadcn/ui |
| 3D Visualization | React Three Fiber + Three.js + Drei |
| Animation | Framer Motion + GSAP |
| Charts / Flow | Recharts + React Flow |
| State | Zustand + TanStack Query |
| Backend | Python + FastAPI + WebSockets |
| AI Providers | Gemini, Ollama, AWS Bedrock, Mock |
| Database | PostgreSQL + Redis |
| Infrastructure | AWS (ECS Fargate + ALB + RDS + ElastiCache) |
| Simulation | Deterministic Python engine |

---

## Specialist Agents

| Agent | Objective |
|-------|-----------|
| Inventory Agent | Minimize stockout risk |
| Supplier Agent | Reduce supplier disruption impact |
| Transportation Agent | Minimize delay and cost |
| Fulfillment Agent | Protect service-level agreements |
| Sustainability Agent | Minimize emissions |
| Resilience Agent | Reduce systemic fragility |
| Coordinator Agent | Reconcile proposals and trade-offs |
| Adversary Agent | Attack plans and expose weaknesses |

---

## Main UI Screens

1. Command Center
2. 3D World Model
3. Signal Intelligence
4. Risk Explorer
5. Scenario Lab
6. Agent War Room
7. Plan Comparison
8. Adversary Attack
9. Stress Test
10. Decision Cockpit
11. Evaluation
12. System / AWS Status

---

## Quick Start (Development)

```bash
# Backend
cd backend
python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) | Agent operating rules |
| [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md) | Vision, phases, milestones |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | Product requirements |
| [docs/FRONTEND_SPEC.md](docs/FRONTEND_SPEC.md) | Frontend specification |
| [docs/3D_SPEC.md](docs/3D_SPEC.md) | 3D world model spec |
| [docs/BACKEND_SPEC.md](docs/BACKEND_SPEC.md) | Backend specification |
| [docs/API_SPEC.md](docs/API_SPEC.md) | API contracts |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Data structures & schemas |
| [docs/AGENT_SPEC.md](docs/AGENT_SPEC.md) | Agent contracts |
| [docs/AWS_SPEC.md](docs/AWS_SPEC.md) | AWS deployment architecture |
| [docs/TESTING_SPEC.md](docs/TESTING_SPEC.md) | Testing strategy |
| [docs/DEMO_SPEC.md](docs/DEMO_SPEC.md) | Demo flow |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Visual design system |
| [docs/SECURITY_SPEC.md](docs/SECURITY_SPEC.md) | Security model |
| [tasks/TODO.md](tasks/TODO.md) | Upcoming tasks |
| [tasks/DONE.md](tasks/DONE.md) | Completed tasks |

---

## License

Proprietary — All Rights Reserved. See [LICENSES/THIRD_PARTY.md](LICENSES/THIRD_PARTY.md) for third-party attributions.
