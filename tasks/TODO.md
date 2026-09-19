# FULFILL-X — Task Backlog (TODO)

> All tasks must have: ID | Phase | Description | Owner | Dependencies | Files | Status | Verification | Result | Commit

---

## Phase 02 — World Model + Synthetic Data + First Vertical Slice [COMPLETED]

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P02-001 | World Pydantic Schemas (`backend/app/schemas/world.py`) | Phase 01 complete | DONE |
| P02-002 | Domain Model / World State (`backend/app/models/world.py`) | P02-001 | DONE |
| P02-003 | Deterministic Synthetic Network Generator (`backend/app/generator/synthetic.py`) | P02-001 | DONE |
| P02-004 | World Repository / State Store (`backend/app/repository/world.py`) | P02-002 | DONE |
| P02-005 | World Service (`backend/app/services/world.py`) | P02-004 | DONE |
| P02-006 | World REST API (`backend/app/api/world.py`) | P02-005 | DONE |
| P02-007 | World Serialization / Snapshot | P02-002 | DONE |
| P02-008 | Deterministic Reproduction Tests (`tests/test_world_model.py`) | P02-003 | DONE |
| P02-009 | Frontend World-State Integration (`frontend/src/`) | P02-006 | DONE |
| P02-010 | 2D Supply-Chain Visualization (`frontend/src/components/world/World2DView.tsx`) | P02-009 | DONE |
| P02-011 | Initial 3D World Data Adapter (`frontend/src/components/world/World3DView.tsx`) | P02-009 | DONE |
| P02-012 | World Model Integration Tests | P02-008 | DONE |
| P02-013 | Documentation / Diagrams / Handoff | P02-012 | DONE |

## Phase 03 — Risk Engine Implementation

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P03-001 | Signal Fusion Engine (`backend/app/engine/fusion.py` - 6-hour window deduplication) | P02 complete | PLANNED |
| P03-002 | Direct Impact Risk Scorer (`backend/app/engine/direct_risk.py`) | P03-001 | PLANNED |
| P03-003 | Multi-Dimensional Risk Decomposition (financial, SLA, operational, sustainability) | P03-002 | PLANNED |
| P03-004 | BFS Risk Propagation Engine (`backend/app/engine/propagation.py` - decay factor 0.6) | P03-003 | PLANNED |
| P03-005 | Risk Engine REST API (`/api/risks` endpoints) | P03-004 | PLANNED |
| P03-006 | Risk Propagation Unit & Integration Tests (`backend/tests/test_risk_engine.py`) | P03-005 | PLANNED |
| P03-007 | Frontend Risk Explorer Integration (`frontend/src/components/risk/`) | P03-005 | PLANNED |


## Phase 03 — Scenario Engine

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P03-001 | Implement ScenarioObject schema and ORM | P01-001 | PLANNED |
| P03-002 | Implement ScenarioEngine.compose(signals, relationship) | P02-004 | PLANNED |
| P03-003 | Implement ScenarioEngine.simulate(scenario, world) | P03-002 | PLANNED |
| P03-004 | Write unit tests: test_scenario_engine.py | P03-003 | PLANNED |
| P03-005 | Verify: compound scenario produces correct risk delta | P03-004 | PLANNED |
| P03-006 | Commit P03 | P03-005 | PLANNED |

## Phase 04 — AI Provider Abstraction

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P04-001 | Implement abstract AIProvider base class | P00 complete | PLANNED |
| P04-002 | Implement MockAIProvider (deterministic, seeded) | P04-001 | PLANNED |
| P04-003 | Implement GeminiProvider | P04-001 | PLANNED |
| P04-004 | Implement OllamaProvider | P04-001 | PLANNED |
| P04-005 | Implement BedrockProvider (optional) | P04-001 | PLANNED |
| P04-006 | Implement provider factory with fallback chain | P04-002,P04-003,P04-004 | PLANNED |
| P04-007 | Write unit tests: all providers with mock network | P04-006 | PLANNED |
| P04-008 | Verify: MockProvider output is deterministic (seed=42) | P04-007 | PLANNED |
| P04-009 | Commit P04 | P04-008 | PLANNED |

## Phase 05 — Specialist Agents

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P05-001 | Implement BaseAgent with safe_execute pipeline | P04-006 | PLANNED |
| P05-002 | Implement ConstraintEngine | P05-001 | PLANNED |
| P05-003 | Implement SimulationEngine | P05-001 | PLANNED |
| P05-004 | Implement InventoryAgent | P05-001,P05-002,P05-003 | PLANNED |
| P05-005 | Implement SupplierAgent | P05-001,P05-002,P05-003 | PLANNED |
| P05-006 | Implement TransportationAgent | P05-001,P05-002,P05-003 | PLANNED |
| P05-007 | Implement FulfillmentAgent | P05-001,P05-002,P05-003 | PLANNED |
| P05-008 | Implement SustainabilityAgent | P05-001,P05-002,P05-003 | PLANNED |
| P05-009 | Implement ResilienceAgent | P05-001,P05-002,P05-003 | PLANNED |
| P05-010 | Implement CoordinatorAgent | P05-004–P05-009 | PLANNED |
| P05-011 | Implement AgentOrchestrator (asyncio.gather) | P05-010 | PLANNED |
| P05-012 | Write unit tests: test_agents.py | P05-011 | PLANNED |
| P05-013 | Verify: all 6 specialists + coordinator produce proposals (mock) | P05-012 | PLANNED |
| P05-014 | Commit P05 | P05-013 | PLANNED |

## Phase 06 — Adversary Agent

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P06-001 | Implement DisruptionLibrary | P00 complete | PLANNED |
| P06-002 | Implement AdversaryAgent | P05-003,P04-006 | PLANNED |
| P06-003 | Integrate adversary loop in Orchestrator | P06-002,P05-011 | PLANNED |
| P06-004 | Write unit tests: test_adversary.py | P06-003 | PLANNED |
| P06-005 | Verify: adversary finds ≥1 vulnerability in test plan | P06-004 | PLANNED |
| P06-006 | Commit P06 | P06-005 | PLANNED |

## Phase 07 — Backend API

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P07-001 | Implement FastAPI app factory (main.py, config.py) | P00 complete | PLANNED |
| P07-002 | Implement all REST API routers (world, signals, risks, scenarios, agents, plans, eval, system) | P01-P06 complete | PLANNED |
| P07-003 | Implement WebSocket hub with Redis pub/sub | P07-001 | PLANNED |
| P07-004 | Implement database session management (asyncpg) | P07-001 | PLANNED |
| P07-005 | Implement .env.example and settings | P07-001 | PLANNED |
| P07-006 | Write integration tests: test_api.py | P07-002,P07-003 | PLANNED |
| P07-007 | Verify: all endpoints return correct status codes | P07-006 | PLANNED |
| P07-008 | Verify: WebSocket events delivered in correct order | P07-006 | PLANNED |
| P07-009 | Commit P07 | P07-008 | PLANNED |

## Phase 08 — Frontend Core

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P08-001 | Scaffold Vite + React + TS + Tailwind + shadcn/ui | P00 complete | PLANNED |
| P08-002 | Implement design tokens (CSS custom properties from DESIGN_SYSTEM.md) | P08-001 | PLANNED |
| P08-003 | Implement ShellLayout (sidebar, header, status bar) | P08-002 | PLANNED |
| P08-004 | Implement React Router routes (all 12) | P08-001 | PLANNED |
| P08-005 | Implement Zustand store (full schema) | P08-001 | PLANNED |
| P08-006 | Implement TanStack Query setup + all query hooks | P08-005 | PLANNED |
| P08-007 | Implement WebSocket context + provider | P08-005 | PLANNED |
| P08-008 | Implement shared components: MetricCard, AgentCard, SignalBadge, PlanCard, RiskBar, RadarChart | P08-002 | PLANNED |
| P08-009 | Write unit tests: all shared components | P08-008 | PLANNED |
| P08-010 | Verify: npm run build passes, no TS errors | P08-008 | PLANNED |
| P08-011 | Commit P08 | P08-010 | PLANNED |

## Phase 09 — 3D World Model

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P09-001 | Implement WorldScene (R3F Canvas + environment) | P08-001 | PLANNED |
| P09-002 | Implement NodeLayer (instanced mesh, risk color lerp) | P09-001 | PLANNED |
| P09-003 | Implement EdgeLayer (tube geometry, particle flow) | P09-001 | PLANNED |
| P09-004 | Implement DisruptionWave component | P09-001 | PLANNED |
| P09-005 | Implement PostProcessing (bloom, FXAA) | P09-001 | PLANNED |
| P09-006 | Implement OrbitControls + GSAP camera transitions | P09-001 | PLANNED |
| P09-007 | Implement NodeInspector panel (floating 2D) | P09-002 | PLANNED |
| P09-008 | Implement WebGL fallback (React Flow 2D) | P09-001 | PLANNED |
| P09-009 | Write visual regression test: Playwright screenshot | P09-005 | PLANNED |
| P09-010 | Verify: 60fps with 100 nodes on benchmark hardware | P09-009 | PLANNED |
| P09-011 | Commit P09 | P09-010 | PLANNED |

## Phase 10 — All 12 Screens

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P10-001 | Implement Command Center | P08, P09 | PLANNED |
| P10-002 | Implement 3D World Model screen | P09 | PLANNED |
| P10-003 | Implement Signal Intelligence | P08 | PLANNED |
| P10-004 | Implement Risk Explorer | P08 | PLANNED |
| P10-005 | Implement Scenario Lab | P08 | PLANNED |
| P10-006 | Implement Agent War Room | P08 | PLANNED |
| P10-007 | Implement Plan Comparison | P08 | PLANNED |
| P10-008 | Implement Adversary Attack | P08 | PLANNED |
| P10-009 | Implement Stress Test | P08 | PLANNED |
| P10-010 | Implement Decision Cockpit | P08 | PLANNED |
| P10-011 | Implement Evaluation | P08 | PLANNED |
| P10-012 | Implement System Status | P08 | PLANNED |
| P10-013 | Write E2E tests: all 12 screens happy path | P10-001–P10-012 | PLANNED |
| P10-014 | Verify: all E2E tests pass | P10-013 | PLANNED |
| P10-015 | Verify: accessibility audit passes (axe) | P10-014 | PLANNED |
| P10-016 | Commit P10 | P10-015 | PLANNED |

## Phase 11 — Evaluation Harness

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P11-001 | Implement 5 benchmark scenarios (B001–B005) | P05, P06 | PLANNED |
| P11-002 | Implement EvaluationEngine.run_suite() | P11-001 | PLANNED |
| P11-003 | Implement all evaluation metrics | P11-002 | PLANNED |
| P11-004 | Verify: benchmark with seed=42 produces deterministic results | P11-003 | PLANNED |
| P11-005 | Verify: B002 (demo scenario) passes all assertions | P11-004 | PLANNED |
| P11-006 | Commit P11 | P11-005 | PLANNED |

## Phase 12 — AWS Deployment

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P12-001 | Create VPC, subnets, security groups | P00 complete | PLANNED |
| P12-002 | Create RDS PostgreSQL instance | P12-001 | PLANNED |
| P12-003 | Create ElastiCache Redis cluster | P12-001 | PLANNED |
| P12-004 | Create ECR repositories (backend, frontend) | P12-001 | PLANNED |
| P12-005 | Create ECS cluster + task definitions | P12-004 | PLANNED |
| P12-006 | Create ALB + target groups + listener rules | P12-005 | PLANNED |
| P12-007 | Create CloudFront distribution | P12-006 | PLANNED |
| P12-008 | Store secrets in SSM Parameter Store | P12-001 | PLANNED |
| P12-009 | Build + push backend Docker image | P07 complete | PLANNED |
| P12-010 | Build + push frontend Docker image | P08-P10 complete | PLANNED |
| P12-011 | Deploy ECS services | P12-009,P12-010 | PLANNED |
| P12-012 | Run smoke test: GET /api/system/health returns HEALTHY | P12-011 | PLANNED |
| P12-013 | Run evaluation suite on AWS: seed=42, mock provider | P12-012 | PLANNED |
| P12-014 | Set up GitHub Actions CI/CD pipeline | P12-011 | PLANNED |
| P12-015 | Verify: public URL accessible, all screens render | P12-012 | PLANNED |
| P12-016 | Commit P12 infra code | P12-015 | PLANNED |

## Phase 13 — Demo Polish

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P13-001 | Seed demo data with preset "double_punch" scenario | P12 complete | PLANNED |
| P13-002 | Rehearse demo narrative (DEMO_SPEC.md) | P13-001 | PLANNED |
| P13-003 | Record backup demo video | P13-002 | PLANNED |
| P13-004 | Verify: full demo runs in ≤12 minutes | P13-003 | PLANNED |
| P13-005 | Export evaluation benchmark results PDF | P12-013 | PLANNED |
| P13-006 | Final commit: tag v1.0.0-demo | P13-004 | PLANNED |
