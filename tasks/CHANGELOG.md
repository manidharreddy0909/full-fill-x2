# FULFILL-X — Changelog

All significant changes to the project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.6.0] — 2026-09-19 — Phase 05: Specialist Agent System & Safe Execution Pipeline

### Added

**Backend Specialist Agent System (`backend/app/agents/`, `schemas/`, `services/`, `api/`)**
- `backend/app/schemas/agent.py` — Strongly-typed Pydantic v2 schemas: `AgentId`, `AgentObjective`, `AgentResultStatus`, `AgentActionType`, `AgentAction`, `AgentProposal`, `AgentResult`, `AgentMetadata`, `AllSpecialistProposalsResponse`.
- `backend/app/agents/base.py` — `BaseAgent` abstract class with mandatory `safe_execute()` template method enforcing snapshot immutability checks (`snap_id_before == snap_id_after` and `risk_snap_before == risk_snap_after`) and entity validation (`validate_proposal_entities()`).
- `backend/app/agents/inventory.py` — `InventoryAgent` (`MINIMIZE_STOCKOUT_RISK`, actions `REORDER_STOCK`, `STOCK_TRANSFER`).
- `backend/app/agents/supplier.py` — `SupplierAgent` (`REDUCE_SUPPLIER_DISRUPTION`, actions `SUPPLIER_SWITCH`, `DUAL_SOURCE_ALLOCATION`).
- `backend/app/agents/transportation.py` — `TransportationAgent` (`REDUCE_DELAY_AND_COST`, actions `REROUTE_FLOW`, `MODE_SWITCH`).
- `backend/app/agents/fulfillment.py` — `FulfillmentAgent` (`PROTECT_SERVICE_LEVEL`, actions `ORDER_PRIORITY_CHANGE`, `FC_REALLOCATION`).
- `backend/app/agents/sustainability.py` — `SustainabilityAgent` (`REDUCE_EMISSIONS`, actions `EMISSIONS_ANNOTATION`).
- `backend/app/agents/resilience.py` — `ResilienceAgent` (`REDUCE_SYSTEMIC_FRAGILITY`, actions `DIVERSIFY_DEPENDENCY`).
- `backend/app/agents/registry.py` — `AgentRegistry` singleton managing registration and retrieval of all 6 specialist agents.
- `backend/app/services/agents.py` — `AgentService` orchestrator supporting single agent execution and parallel `run_all_specialists()` via `asyncio.gather()`.
- `backend/app/api/agents.py` — FastAPI REST endpoints: `GET /api/agents`, `GET /api/agents/{id}`, `POST /api/agents/{id}/run`, `POST /api/agents/run-all`. Registered in `backend/app/api/router.py`.

**Backend Specialist Agent Test Suite (`backend/tests/test_agents.py`)**
- Comprehensive test suite: immutability verification, entity validation (rejecting hallucinated node IDs), 6 individual specialist agents, registry, service orchestrator, and REST API endpoints (6/6 agent tests + API tests). Total backend test suite: **51/51 PASS**.

**Frontend Specialist War Room UI (`frontend/src/`)**
- `frontend/src/types/agent.ts` — TypeScript interfaces matching backend Pydantic agent models.
- `frontend/src/api/agentApi.ts` — Async API client for fetching agent metadata, running single agent, and running all 6 specialist agents.
- `frontend/src/components/agents/SpecialistWarRoom.tsx` — Glassmorphic side-drawer UI with "Run All 6 Specialist Agents" trigger, agent filter tabs, 6 brand-colored agent cards (Inventory `#4A90D9`, Supplier `#7BC67E`, Transportation `#E8A24A`, Fulfillment `#9B7FE8`, Sustainability `#52B788`, Resilience `#E8574A`), confidence meters, proposed action tables (cost, delay, parameters), evidence signal badges, and expandable reasoning trace accordions.
- Updated `Navbar.tsx` & `App.tsx` — Integrated "Specialist War Room" header button and Phase 05 title badge. `npm run build` PASS.

**Architecture Decisions**
- Added `ADR-018: Specialist Agent System & Non-Authoritative Proposal Architecture` to `docs/DECISION_LOG.md`.

---

## [0.5.0] — 2026-09-19 — Phase 04: AI Provider Abstraction & Safe Intelligence Layer

### Added

**Backend AI Provider Architecture (`backend/app/providers/`, `schemas/`, `services/`, `api/`)**
- `backend/app/schemas/ai.py` — Strongly-typed Pydantic v2 schemas: `TaskType`, `AIProviderType`, `AIProviderStatus`, `AIUsage`, `AIError`, `AIRequest`, `AIResponse`, `ProviderInfo`, `AIProvidersSummaryResponse`, `AIHealthResponse`.
- `backend/app/providers/base.py` — Abstract `AIProvider` base class (`generate`, `health`, `capabilities`).
- `backend/app/providers/mock.py` — `MockAIProvider` 100% offline, seed-reproducible provider adapter for scenario generation, specialist reasoning, coordinator reasoning, and adversarial analysis.
- `backend/app/providers/gemini.py` — `GeminiProvider` adapter for Google Gemini API (`gemini-1.5-flash`, `gemini-1.5-pro`) with isolated credentials & async JSON output parsing.
- `backend/app/providers/ollama.py` — `OllamaProvider` local adapter (`http://localhost:11434`) for offline open-source models with connection fallback.
- `backend/app/providers/bedrock.py` — `BedrockProvider` AWS Bedrock boundary adapter for Claude 3 / Titan models.
- `backend/app/providers/factory.py` — Singleton `ProviderFactory` managing provider registry and automatic fallback chain to `MockAIProvider`.
- `backend/app/services/ai.py` — `AIService` enforcing **AI Safety Control Boundary** ("LLMs propose; deterministic code decides"). Performs structured output JSON schema validation without mutating authoritative world or risk state.
- `backend/app/api/ai.py` — Typed FastAPI REST endpoints: `GET /api/ai/providers`, `GET /api/ai/health`, `POST /api/ai/generate`.

**Backend Automated AI Provider Test Suite (`backend/tests/`)**
- `test_ai_provider.py` — Provider contract, mock determinism, expected schema generation, health, capabilities, and factory fallback tests (5/5 PASS).
- `test_ai_service.py` — AI safety control boundary state preservation, schema validation failure handling, fallback chain, and health diagnostic tests (4/4 PASS).
- `test_ai_api.py` — REST API integration tests for provider list, health, and generation endpoints (3/3 PASS). Total test suite: 45/45 PASS.

**Frontend AI Status Integration (`frontend/src/`)**
- `frontend/src/types/ai.ts` — TypeScript interfaces matching backend AI schemas.
- `frontend/src/api/aiApi.ts` — API client for fetching AI providers, health, and executing AI reasoning.
- Updated `frontend/src/components/common/Navbar.tsx` & `App.tsx` — Integrated active AI Provider status pill (`AI: MOCK (ACTIVE)`) into global header. `npm run build` PASS.

**Architecture Decisions**
- Added `ADR-017: Vendor-Neutral AI Provider Abstraction & Safe Intelligence Boundary` to `docs/DECISION_LOG.md`.

---

## [0.4.0] — 2026-09-19 — Phase 03: Risk Engine Implementation & End-to-End Vertical Slice

### Added

**Backend Risk Intelligence Engine (`backend/app/engine/`, `schemas/`, `api/`)**
- `backend/app/schemas/signal.py` — Strongly-typed Pydantic v2 schemas for disruption signals: `Signal`, `SignalCreateRequest`, `FusedSignal`, `SignalType`, `SignalSeverity`, `SignalStatus`.
- `backend/app/schemas/risk.py` — Strongly-typed Pydantic v2 schemas for risk scoring: `RiskLevel`, `SignalContribution`, `RiskExplanation`, `NodeRiskDetail`, `RiskScoreMap`.
- `backend/app/engine/fusion.py` — `SignalFusionEngine` with 6-hour sliding window signal deduplication and compound confidence weighting (`1 - ∏(1 - c_i)`).
- `backend/app/engine/risk.py` — Deterministic `RiskEngine` containing `DirectImpactScorer` (`LOW=0.25`, `MEDIUM=0.50`, `HIGH=0.75`, `CRITICAL=0.95`), `CompoundComposer`, `GraphPropagator` (BFS propagation across `DEPENDENCY` edges, `MAX_HOPS=3`, `DECAY_FACTOR=0.6`), `DimensionalRiskComposer` (Financial, SLA, Operational, Sustainability breakdown), and `ExplanationBuilder`.
- `backend/app/repository/risk.py` — Thread-safe `RiskRepository` managing signal store and calculated risk maps (integrated with `WorldRepository` and `RLock()`).
- `backend/app/services/risk.py` — `RiskService` orchestrating signal ingestion, resolution, recalculation, and detail generation.
- `backend/app/api/signals.py` & `risks.py` — Typed FastAPI REST endpoints: `GET /api/signals`, `POST /api/signals`, `PATCH /api/signals/{id}/resolve`, `GET /api/risks`, `GET /api/risks/nodes/{id}`, `POST /api/risks/recalculate`, `POST /api/risks/reset`.

**Backend Automated Risk Test Suite (`backend/tests/`)**
- `test_fusion.py` — 6-hour sliding window deduplication, multi-cluster outside 6hr window, and max severity ordering tests (3/3 PASS).
- `test_risk_engine.py` — Severity mapping, compound score upper-bound clamping, risk level bands, BFS hop decay, explanation traceability, and 100% seed determinism tests (6/6 PASS).
- `test_risk_api.py` — REST API integration tests for signals, risk recalculation, node risk detail, and reset endpoints (4/4 PASS). Total backend test suite: 33/33 PASS.

**Frontend Risk State & Intelligence UI (`frontend/src/`)**
- `frontend/src/types/risk.ts` — TypeScript interfaces matching backend Risk and Signal Pydantic models.
- `frontend/src/api/riskApi.ts` — Fetch API client for signal and risk endpoints.
- `frontend/src/components/risk/SignalInjectorModal.tsx` — Modal component providing interactive weak signal creation with quick demo presets (Supplier S1 Halt, Port P1 Typhoon, Warehouse W1 Cyber).
- `frontend/src/components/risk/RiskExplorer.tsx` — Detailed risk inspector drawer displaying multi-dimensional risk index matrix, risk level bands, deterministic explanation text, active fused signals, and upstream/downstream propagation impact nodes.
- Updated `World2DView.tsx` & `World3DView.tsx` — Integrated real-time composite risk scores into 2D node borders, stock meters, 3D emissive colors, selected indicator rings, and disruption pulses.
- `frontend/src/App.tsx` — Wire up live Risk API state, automatic risk recalculation, Signal Injector modal, and Risk Explorer panel. `npm run build` PASS.

**Architecture Decisions**
- Added `ADR-016: Deterministic Risk Engine & BFS Graph Propagation Architecture` to `docs/DECISION_LOG.md`.

---

## [0.3.0] — 2026-09-19 — Phase 02: World Model + Synthetic Data + First Vertical Slice

### Added

**Backend World Model Architecture (`backend/app/`)**
- `backend/app/schemas/world.py` — Strict Pydantic v2 schemas: `Position3D`, `NodeRiskScores`, `WorldNode`, `WorldEdge`, `Product`, `InventoryRecord`, `Order`, `Shipment`, `Commitment`, `WorldStateSnapshot`, `WorldSummary`, `ApiResponse`.
- `backend/app/models/world.py` — `SupplyNetworkGraph` in-memory graph domain model with fast adjacency indices (`_outgoing_edges`, `_incoming_edges`, `_nodes_by_type`), snapshot serialization, and health/risk computation.
- `backend/app/generator/synthetic.py` — `SyntheticDataGenerator` seeded random network generator (5 suppliers, 3 ports, 3 warehouses, 2 FCs, 10 customer zones, 3 products, inventory, orders, commitments, route & dependency edges). Guarantees `seed=42 == seed=42` deterministic reproduction. Presets: `healthy`, `double_punch`.
- `backend/app/repository/world.py` — Thread-safe `WorldRepository` state store supporting atomic snapshots, seeding, resetting, and summary metric aggregation.
- `backend/app/services/world.py` — Business logic `WorldService` exposing graph operations and graph visualizer layout transforms.
- `backend/app/api/world.py` — Typed FastAPI REST endpoints: `GET /api/world`, `GET /api/world/summary`, `GET /api/world/graph`, `GET /api/world/nodes/{id}`, `GET /api/world/edges/{id}`, `POST /api/world/seed`, `POST /api/world/reset`.
- `backend/app/main.py` — FastAPI server with CORS middleware enabling frontend communication.

**Backend Automated Test Suite (`backend/tests/`)**
- `test_schemas.py` — Pydantic schema validation, clamping, range constraints, and serialization tests (5/5 PASS).
- `test_generator.py` — Deterministic seed reproduction, preset overlay, structural graph integrity tests (5/5 PASS).
- `test_repository.py` — Thread-safe state store, singleton, snapshot restore, summary metric tests (4/4 PASS).
- `test_api.py` — REST API integration tests using FastAPI `TestClient` (6/6 PASS).

**Frontend World Model Vertical Slice (`frontend/`)**
- Full Vite + React 18 + TypeScript application.
- `frontend/src/types/world.ts` — TypeScript interfaces matching backend Pydantic models.
- `frontend/src/api/worldApi.ts` — Fetch client connecting to REST endpoints with offline preview fallback.
- `frontend/src/components/common/Navbar.tsx` — Top Header with preset switcher, seed input controller, 2D/3D toggle, and live health pill.
- `frontend/src/components/world/WorldSummaryBar.tsx` — Network KPI bar displaying node counts by type, total inventory, utilization, disruptions, and health score.
- `frontend/src/components/world/World2DView.tsx` — Operational 2D 5-Tier layout displaying interactive nodes, risk borders, stock meters, and disruption indicators.
- `frontend/src/components/world/World3DView.tsx` — React Three Fiber + Three.js + Drei spatial scene renderer mapping real node 3D coordinates, custom geometries, floating HTML labels, and route lines.
- `frontend/src/components/world/NodeInspector.tsx` — Drawer panel exposing node details, multi-dimensional risk breakdown matrix (Financial, SLA, Operational, Sustainability), inventory meters, and connected routes.

**Architecture Decisions**
- Added `ADR-015: World Model Vertical Slice & Deterministic Graph Architecture` to `docs/DECISION_LOG.md`.

---

## [0.2.0] — 2026-09-18 — Phase 01: Complete Product Intelligence & Architecture Mapping

### Added

**Complete Product Intelligence Specifications (14 files)**
- `docs/PRODUCT_BIBLE.md` — 43-section master intelligence document detailing vision, domain model, agentic design, UI mapping, and complete system end-to-end flow.
- `docs/WORLD_MODEL_SPEC.md` — Complete graph entity specs, ER diagrams, Pydantic/SQLAlchemy models, state transitions, and 3D visual mapping.
- `docs/RISK_ENGINE_SPEC.md` — Deterministic risk propagation math, 6-hour signal fusion engine, multi-dimensional scoring matrix, and direct impact scoring formulas.
- `docs/SCENARIO_ENGINE_SPEC.md` — Compound scenario simulation pipeline, concurrent/cascading/amplifying relationship models, and propagation step tracking.
- `docs/AGENT_SYSTEM_SPEC.md` — Detailed contracts for all 8 specialist agents (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience, Coordinator, Adversary), orchestrator lifecycle, prompt engineering rules, and JSON output schemas.
- `docs/AI_ARCHITECTURE.md` — AI safety control boundary specs ("LLMs propose; deterministic code decides"), provider interface, fallback chain, and mock provider specs.
- `docs/API_CATALOG.md` — Complete catalog of all 32 REST endpoints with request/response envelopes, domain services, and frontend consumer mapping.
- `docs/WEBSOCKET_SPEC.md` — Complete catalog of real-time WebSocket events, payloads, triggers, and 3D visual reactions.
- `docs/FRONTEND_EXPERIENCE_BIBLE.md` — Detailed UI layout, interaction states, data requirements, components, and animations for all 12 frontend screens.
- `docs/3D_EXPERIENCE_BIBLE.md` — React Three Fiber scene graph specs, shaders, particle flow rules, camera state management, and performance strategy.
- `docs/VISUAL_DESIGN_BIBLE.md` — Design tokens, typography, HSL color palettes, cards, buttons, micro-animations, glassmorphism specs, and WCAG accessibility targets.
- `docs/GAMIFICATION_SPEC.md` — Operational Mission narrative design, milestone feedback, progress mechanics, and audience engagement rules.
- `docs/DEMO_STORYBOARD.md` — 12-minute segment-by-segment presenter script, exact API calls, 3D camera cues, Q&A prep, and fallback protocol.
- `docs/OPEN_QUESTIONS.md` — 14 unresolved architectural decisions categorized by domain with explicit options, recommendations, and decision deadlines.

**Architecture Decisions**
- Added ADR-009 through ADR-014 to `docs/DECISION_LOG.md` (Signal Fusion Engine, AI Control Safety Boundary, Multi-Dimensional Risk Standard, 3D Logical Topology Layout, WebSocket Fan-out Pattern, Phase 01 Intelligence Bible Standard).

---

## [0.1.0] — 2026-09-18 — Phase 00: Project Initialization

### Added

**Repository & Governance**
- Initialized Git repository
- Created complete directory structure (docs/, diagrams/, design/, tasks/, backend/, frontend/, data/, evaluation/, infrastructure/, LICENSES/)
- Created `.gitignore` (Python, Node, env, Docker, Terraform)
- Created `README.md` with project overview, architecture table, agent list, screen list, documentation index
- Created `AGENTS.md` with 14 operating rules for all AI agents

**Documentation (15 spec files)**
- `docs/MASTER_PLAN.md` — vision, 13-phase plan, success criteria, milestones
- `docs/ARCHITECTURE.md` — system architecture, data flow, tech decisions, failure modes, Mermaid diagrams
- `docs/PRODUCT_SPEC.md` — 4 personas, user stories, 12 screens, NFRs, acceptance criteria
- `docs/FRONTEND_SPEC.md` — React+TS+Vite+Tailwind+R3F stack, all 12 screen specs, routing, WebSocket schema, performance targets
- `docs/3D_SPEC.md` — scene composition, node/edge encoding, data-to-visual mapping, interaction model, animation specs, performance
- `docs/BACKEND_SPEC.md` — Python+FastAPI stack, complete module tree, AI provider abstraction, agent safety pipeline, WebSocket hub
- `docs/API_SPEC.md` — all REST endpoints with request/response schemas, WebSocket event catalog, error codes
- `docs/DATA_MODEL.md` — Pydantic v2 schemas, SQLAlchemy ORM models, TypeScript interfaces, ER diagram
- `docs/AGENT_SPEC.md` — 8 agent contracts (input/output/objective/constraints/tools/failure/UI), orchestration flow
- `docs/AWS_SPEC.md` — full AWS topology, VPC networking, ECS task definitions, ALB routing, CI/CD, cost estimate
- `docs/TESTING_SPEC.md` — backend unit/integration, frontend unit/E2E/a11y/visual regression, evaluation harness
- `docs/DEMO_SPEC.md` — 12-minute scripted demo, "The Double Punch" scenario, segment-by-segment actions
- `docs/DESIGN_SYSTEM.md` — color tokens, typography, spacing, shadows, components, animations, icons, layout
- `docs/SECURITY_SPEC.md` — threat model, secret management, AI safety constraints, audit logging, CORS, rate limits
- `docs/DECISION_LOG.md` — 8 architecture decision records (ADR-001 through ADR-008)
- `docs/DIAGRAMS.md` — diagram index with all 9 files
- `docs/HANDOFF.md` — complete handoff protocol for next AI session

**Diagrams (9 Mermaid files)**
- `diagrams/system-architecture.mmd`
- `diagrams/end-to-end-flow.mmd`
- `diagrams/data-flow.mmd`
- `diagrams/agent-flow.mmd`
- `diagrams/risk-propagation.mmd`
- `diagrams/adversarial-loop.mmd`
- `diagrams/frontend-architecture.mmd`
- `diagrams/aws-architecture.mmd`
- `diagrams/deployment-flow.mmd`

**Design (4 files)**
- `design/UX_FLOW.md` — all persona flows, navigation map, error recovery, empty states
- `design/UI_SCREEN_MAP.md` — ASCII layouts for all 12 screens, component reuse matrix
- `design/3D_INTERACTION_MAP.md` — all 3D interactions, state transitions, animation timeline
- `design/VISUAL_LANGUAGE.md` — visual philosophy, principles, 3D language, typography specimens

**Task Tracking**
- `tasks/TODO.md` — full backlog: 13 phases, ~100 tasks
- `tasks/IN_PROGRESS.md`
- `tasks/DONE.md` — all 44 Phase 00 tasks
- `tasks/CHANGELOG.md` (this file)

**Infrastructure Stubs**
- `Dockerfile` (multi-stage backend + frontend)
- `docker-compose.yml` (backend + frontend + postgres + redis)
- `backend/.gitkeep`, `frontend/.gitkeep`, `data/.gitkeep`, `evaluation/.gitkeep`, `infrastructure/.gitkeep`
- `LICENSES/THIRD_PARTY.md`

### Changed
- Nothing (initial release)

### Fixed
- Nothing (initial release)

---

*Next milestone: Phase 01 — World Model & Synthetic Data*
