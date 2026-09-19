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

## Phase 03 — Risk Engine Implementation [COMPLETED]

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P03-001 | Signal Fusion Engine (`backend/app/engine/fusion.py` - 6-hour window deduplication) | P02 complete | DONE |
| P03-002 | Direct Impact Risk Scorer (`backend/app/engine/direct_risk.py` / `risk.py`) | P03-001 | DONE |
| P03-003 | Multi-Dimensional Risk Decomposition (financial, SLA, operational, sustainability) | P03-002 | DONE |
| P03-004 | BFS Risk Propagation Engine (`backend/app/engine/risk.py` - decay factor 0.6) | P03-003 | DONE |
| P03-005 | Risk Engine REST API (`/api/risks` and `/api/signals` endpoints) | P03-004 | DONE |
| P03-006 | Risk Propagation Unit & Integration Tests (`backend/tests/test_risk_engine.py`, `test_fusion.py`, `test_risk_api.py`) | P03-005 | DONE |
| P03-007 | Frontend Risk Explorer Integration & Signal Injector (`frontend/src/components/risk/`, `App.tsx`) | P03-005 | DONE |


## Phase 03 — Scenario Engine

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P03-001 | Implement ScenarioObject schema and ORM | P01-001 | PLANNED |
| P03-002 | Implement ScenarioEngine.compose(signals, relationship) | P02-004 | PLANNED |
| P03-003 | Implement ScenarioEngine.simulate(scenario, world) | P03-002 | PLANNED |
| P03-004 | Write unit tests: test_scenario_engine.py | P03-003 | PLANNED |
| P03-005 | Verify: compound scenario produces correct risk delta | P03-004 | PLANNED |
| P03-006 | Commit P03 | P03-005 | PLANNED |

## Phase 04 — AI Provider Abstraction [COMPLETED]

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P04-001 | Implement abstract AIProvider base class (`backend/app/providers/base.py`) | P00 complete | DONE |
| P04-002 | Implement MockAIProvider (deterministic, seeded) (`backend/app/providers/mock.py`) | P04-001 | DONE |
| P04-003 | Implement GeminiProvider adapter (`backend/app/providers/gemini.py`) | P04-001 | DONE |
| P04-004 | Implement OllamaProvider adapter (`backend/app/providers/ollama.py`) | P04-001 | DONE |
| P04-005 | Implement BedrockProvider boundary adapter (`backend/app/providers/bedrock.py`) | P04-001 | DONE |
| P04-006 | Implement ProviderFactory with fallback chain (`backend/app/providers/factory.py`) | P04-002–P04-005 | DONE |
| P04-007 | Implement AIService & AI Safety Boundary (`backend/app/services/ai.py`) | P04-006 | DONE |
| P04-008 | Implement AI REST API Router (`backend/app/api/ai.py`) | P04-007 | DONE |
| P04-009 | Write AI provider & safety tests (`test_ai_provider.py`, `test_ai_service.py`, `test_ai_api.py`) | P04-008 | DONE |
| P04-010 | Frontend AI Provider Status Integration (`frontend/src/types/ai.ts`, `api/aiApi.ts`, `Navbar.tsx`) | P04-008 | DONE |

## Phase 05 — Specialist Agents [COMPLETED]

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P05-001 | Implement BaseAgent with safe_execute template pipeline & snapshot immutability verification | P04-006 | DONE |
| P05-002 | Implement InventoryAgent (`MINIMIZE_STOCKOUT_RISK`) | P05-001 | DONE |
| P05-003 | Implement SupplierAgent (`REDUCE_SUPPLIER_DISRUPTION`) | P05-001 | DONE |
| P05-004 | Implement TransportationAgent (`REDUCE_DELAY_AND_COST`) | P05-001 | DONE |
| P05-005 | Implement FulfillmentAgent (`PROTECT_SERVICE_LEVEL`) | P05-001 | DONE |
| P05-006 | Implement SustainabilityAgent (`REDUCE_EMISSIONS`) | P05-001 | DONE |
| P05-007 | Implement ResilienceAgent (`REDUCE_SYSTEMIC_FRAGILITY`) | P05-001 | DONE |
| P05-008 | Implement AgentRegistry singleton managing all 6 specialists | P05-002–P05-007 | DONE |
| P05-009 | Implement AgentService orchestrator with parallel execution (`asyncio.gather`) | P05-008 | DONE |
| P05-010 | Implement Agent REST API (`GET /api/agents`, `POST /api/agents/{id}/run`, `POST /api/agents/run-all`) | P05-009 | DONE |
| P05-011 | Comprehensive unit test suite (`backend/tests/test_agents.py` - 51/51 PASS) | P05-010 | DONE |
| P05-012 | Frontend TypeScript types & API client (`types/agent.ts`, `api/agentApi.ts`) | P05-010 | DONE |
| P05-013 | Specialist War Room UI Component (`SpecialistWarRoom.tsx`, `Navbar.tsx`, `App.tsx`) | P05-012 | DONE |
| P05-014 | Documentation, ADR-018 & Phase 05 Commit | P05-013 | DONE |

## Phase 06 — Coordinator Agent [COMPLETED]

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P06-001 | Coordinator Pydantic Schemas (`backend/app/schemas/coordinator.py`) | Phase 05 complete | DONE |
| P06-002 | Proposal Normalization & Action Deduplication (`backend/app/engine/reconciliation.py`) | P06-001 | DONE |
| P06-003 | Agreement Detection & Traceable Proposal Attribution | P06-002 | DONE |
| P06-004 | Conflict Detection (route, resource, objective opposition) | P06-002 | DONE |
| P06-005 | 6-Objective Impact Matrix & Trade-off Engine | P06-003 | DONE |
| P06-006 | Candidate Plan Generator (Candidate Plan A, B, C) | P06-005 | DONE |
| P06-007 | Constraint Filter & Entity Integrity Validator | P06-006 | DONE |
| P06-008 | Coordinator Agent with Immutability Safety Boundary (`backend/app/agents/coordinator.py`) | P06-007 | DONE |
| P06-009 | Coordinator Service (`backend/app/services/coordinator.py`) | P06-008 | DONE |
| P06-010 | Coordinator REST API (`backend/app/api/coordinator.py`) | P06-009 | DONE |
| P06-011 | Backend Test Suite (`backend/tests/test_coordinator.py` - 60/60 total PASS) | P06-010 | DONE |
| P06-012 | Frontend TypeScript types & API client (`types/coordinator.ts`, `api/coordinatorApi.ts`) | P06-010 | DONE |
| P06-013 | Coordination Board UI Component (`CoordinationBoard.tsx`, `SpecialistWarRoom.tsx`) | P06-012 | DONE |
| P06-014 | Map Candidate Plan Preview Integration & Banner (`App.tsx`) | P06-013 | DONE |
| P06-015 | Documentation, ADR-019 & Phase 06 Commit | P06-014 | DONE |

## Phase 07 — Adversary Agent & Stress Testing Framework [COMPLETED]

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P07-001 | Adversary Pydantic Schemas (`backend/app/schemas/adversary.py`) | Phase 06 complete | DONE |
| P07-002 | Controlled Attack Taxonomy (12 Attack Types) | P07-001 | DONE |
| P07-003 | Deterministic Attack Generator (`backend/app/engine/adversary.py`) | P07-002 | DONE |
| P07-004 | Red-Team Attack Targeting Strategy (high risk, bottlenecks, single sources) | P07-003 | DONE |
| P07-005 | Candidate Plan Stress Analysis (Plans A/B/C side-by-side) | P07-004 | DONE |
| P07-006 | Deterministic Stress Simulator on Isolated Snapshot Copies | P07-005 | DONE |
| P07-007 | Transparent 8-Dimension Resilience Scorer | P07-006 | DONE |
| P07-008 | Red-Team Vulnerability Detection Engine | P07-007 | DONE |
| P07-009 | Plan Assumption Challenge & Invalidation Generator | P07-008 | DONE |
| P07-010 | Bounded Compound Attack Scenario Generation | P07-009 | DONE |
| P07-011 | Adversary Agent with Immutability Safety Boundary (`backend/app/agents/adversary.py`) | P07-010 | DONE |
| P07-012 | Adversary Service (`backend/app/services/adversary.py`) | P07-011 | DONE |
| P07-013 | Adversary REST API (`backend/app/api/adversary.py`) | P07-012 | DONE |
| P07-014 | Frontend TypeScript types & API client (`types/adversary.ts`, `api/adversaryApi.ts`) | P07-013 | DONE |
| P07-015 | Adversary Board UI Component (`AdversaryBoard.tsx`, `SpecialistWarRoom.tsx`) | P07-014 | DONE |
| P07-016 | Deterministic Test Suite (`backend/tests/test_adversary.py` - 70/70 PASS) | P07-015 | DONE |
| P07-017 | State Mutation Safety Test (`assert world_before == world_after`) | P07-016 | DONE |
| P07-018 | End-to-End Demo Verification | P07-017 | DONE |
| P07-019 | Documentation (`docs/ADVERSARY_SPEC.md`, ADR-020 in `docs/DECISION_LOG.md`) | P07-018 | DONE |
| P07-020 | Final Verification (pytest & npm build passing) | P07-019 | DONE |

## Phase 08 — Multi-Objective Planner & Optimization Engine [COMPLETED]

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P08-001 | Planner Pydantic v2 Schemas (`backend/app/schemas/planner.py`) | Phase 07 complete | DONE |
| P08-002 | Objective Normalizer Range [0.0, 1.0] (`backend/app/engine/planner.py`) | P08-001 | DONE |
| P08-003 | Hard/Soft Business Constraint Evaluator (`backend/app/engine/planner.py`) | P08-001 | DONE |
| P08-004 | Formal Pareto Dominance Engine & Baseline/Robust Frontiers | P08-002 | DONE |
| P08-005 | Parameter Sensitivity Analyzer (±50% parameter sweeps) | P08-004 | DONE |
| P08-006 | Planner Engine Orchestrator (`PlannerEngine`) | P08-005 | DONE |
| P08-007 | Planner Agent with Immutability Safety Boundary (`backend/app/agents/planner.py`) | P08-006 | DONE |
| P08-008 | Planner Service (`backend/app/services/planner.py`) | P08-007 | DONE |
| P08-009 | Planner REST API (`backend/app/api/planner.py`) | P08-008 | DONE |
| P08-010 | Frontend TypeScript types & API client (`types/planner.ts`, `api/plannerApi.ts`) | P08-009 | DONE |
| P08-011 | Planner Board UI Component (`PlannerBoard.tsx`, `SpecialistWarRoom.tsx`) | P08-010 | DONE |
| P08-012 | Test Suite (`backend/tests/test_planner.py` - 78/78 total PASS) | P08-011 | DONE |
| P08-013 | State Mutation Immutability Test (`assert world_before == world_after`) | P08-012 | DONE |
| P08-014 | Documentation (`docs/PLANNER_SPEC.md`, `OPTIMIZATION_SPEC.md`, ADR-021) | P08-013 | DONE |
| P08-015 | Final Verification (`pytest` & `npm run build` passing) | P08-014 | DONE |



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

## Phase 09 — Verification & Validation Engine [COMPLETED]

| ID | Description | Dependencies | Status |
|----|-------------|-------------|--------|
| P09-001 | Verification Schemas (`backend/app/schemas/verification.py`) | Phase 08 complete | DONE |
| P09-002 | Verification Engine Core (`backend/app/engine/verification.py`) | P09-001 | DONE |
| P09-003 | Action Validator & Capacity Check | P09-002 | DONE |
| P09-004 | Transport Route & Logistics Validator | P09-002 | DONE |
| P09-005 | Inventory & Stockout Prevention Check | P09-002 | DONE |
| P09-006 | Graph & Dependency Echelon Validator | P09-002 | DONE |
| P09-007 | Systemic Risk & Operational Constraint Re-evaluator | P09-002 | DONE |
| P09-008 | State Diff Calculator & Immutability Assertion | P09-002 | DONE |
| P09-009 | Verification Agent with AI Safety Boundary (`backend/app/agents/verification.py`) | P09-002 | DONE |
| P09-010 | Verification Service & Caching Orchestrator (`backend/app/services/verification.py`) | P09-009 | DONE |
| P09-011 | Verification REST API Endpoints (`backend/app/api/verification.py`) | P09-010 | DONE |
| P09-012 | Verification Unit & Integration Tests (`backend/tests/test_verification.py`) | P09-011 | DONE |
| P09-013 | Verification Board Cockpit UI (`frontend/src/components/agents/VerificationBoard.tsx`) | P09-011 | DONE |
| P09-014 | Verification Documentation & Decision Log Update | P09-012, P09-013 | DONE |

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
