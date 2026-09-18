# FULFILL-X — Master Plan

## Vision

FULFILL-X makes supply chain fulfillment **resilient by design**. When
disruptions occur — weather events, port closures, supplier failures,
demand shocks — FULFILL-X detects them instantly, simulates their
propagation through the network, and deploys specialist AI agents to
generate, validate, and select the optimal multi-objective response plan.

The system is **explainable**, **auditable**, and **adversarially
tested**. Every recommendation includes traceable evidence, quantified
trade-offs, and adversarial stress results.

---

## Core Pipeline

```
OBSERVE → WORLD MODEL → RISK → COMPOUND SCENARIO →
SPECIALIST AGENTS → ADVERSARY → MULTI-OBJECTIVE PLAN → VERIFY → MEMORY
```

### Stage Descriptions

| Stage | Description |
|-------|-------------|
| **OBSERVE** | Ingest signals: weather, geopolitical, supplier health, demand, logistics |
| **WORLD MODEL** | Maintain a live, deterministic graph of nodes, edges, inventory, routes |
| **RISK** | Score each node and edge across multiple risk dimensions |
| **COMPOUND SCENARIO** | Combine concurrent disruptions into a unified scenario object |
| **SPECIALIST AGENTS** | Deploy 7 specialist agents to generate resilience proposals |
| **ADVERSARY** | Deploy 1 adversary agent to stress-test proposals |
| **MULTI-OBJECTIVE PLAN** | Score and rank plans across cost, SLA, sustainability, fragility |
| **VERIFY** | Validate plan feasibility against constraints and simulation |
| **MEMORY** | Store outcomes for evaluation, learning, and audit |

---

## Project Phases

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 00 | Initialization | ✅ COMPLETE | Repository, governance, all specs |
| 01 | World Model + Data | PLANNED | Deterministic network model, synthetic data |
| 02 | Risk Engine | PLANNED | Multi-dimensional risk scoring |
| 03 | Scenario Engine | PLANNED | Compound scenario composition |
| 04 | Agent Framework | PLANNED | AI provider abstraction + agent contracts |
| 05 | Specialist Agents | PLANNED | All 7 specialist agents + coordinator |
| 06 | Adversary Agent | PLANNED | Plan stress testing |
| 07 | Backend API | PLANNED | FastAPI + WebSocket server |
| 08 | Frontend Core | PLANNED | React + TS + Vite + Tailwind scaffold |
| 09 | 3D World Model UI | PLANNED | React Three Fiber visualization |
| 10 | All 12 Screens | PLANNED | Full UI implementation |
| 11 | Evaluation Harness | PLANNED | Deterministic benchmarks |
| 12 | AWS Deployment | PLANNED | ECS Fargate + RDS + ElastiCache |
| 13 | Demo Polish | PLANNED | Scripted demo, rehearsal, documentation |

---

## Success Criteria (Hackathon)

1. Live 3D visualization of supply network with real-time risk propagation
2. Compound scenario simulation with agent response in < 5 seconds
3. Adversarial stress testing visible in UI
4. Multi-objective plan comparison with trade-off explanation
5. Full evaluation harness with reproducible benchmark
6. AWS deployment with public URL
7. 12-minute demo narrative (scripted)
8. Clean, auditable codebase with complete documentation

---

## Milestones

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| M0 | Phase 00 | All governance + specs committed |
| M1 | Phase 01-03 | Running simulation, risk scores output |
| M2 | Phase 04-06 | All agents producing validated proposals |
| M3 | Phase 07 | Full API + WebSocket backend running |
| M4 | Phase 08-10 | All 12 screens rendering live data |
| M5 | Phase 11 | Evaluation harness passing benchmarks |
| M6 | Phase 12 | AWS deployment live |
| M7 | Phase 13 | Demo rehearsed and recorded |

---

## Non-Negotiables

- All AI proposals pass through schema validation before state mutation
- All UI screens have loading, empty, and error states
- All agents have fully typed input/output schemas
- No undocumented architecture decisions
- Initial commit exists; every milestone has a tagged commit
- `git status` is clean at every milestone
- Evaluation harness is deterministic and reproducible

---

*See `docs/ARCHITECTURE.md` for the system architecture diagram.*
*See `tasks/TODO.md` for the full task backlog.*
