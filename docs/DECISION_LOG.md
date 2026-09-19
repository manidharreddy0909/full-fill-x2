# FULFILL-X — Architecture Decision Log

> All significant architecture decisions are recorded here.
> Format: ID | Date | Status | Context | Decision | Consequences

---

## ADR-001: Backend Framework — FastAPI

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 00

**Context**: Need an async Python web framework with WebSocket support,
automatic OpenAPI docs, and excellent Pydantic integration.

**Options Considered**:
1. FastAPI + Uvicorn
2. Django + Channels
3. Starlette (bare)
4. Node.js (Express/Fastify)

**Decision**: FastAPI + Uvicorn.

**Rationale**:
- Native async/await (asyncio) — required for concurrent agent execution
- First-class Pydantic v2 integration — aligns with our schema-first approach
- WebSocket support built-in
- Automatic OpenAPI docs (useful for agent contract documentation)
- Python matches our ML/AI tooling

**Consequences**:
- Team must know Python 3.12 async patterns
- Must use asyncpg for PostgreSQL (not psycopg2)

---

## ADR-002: State Database — PostgreSQL

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 00

**Context**: Need a reliable, auditable, ACID-compliant database for
the authoritative world state and audit log.

**Options Considered**:
1. PostgreSQL
2. SQLite (dev only)
3. MongoDB
4. DynamoDB

**Decision**: PostgreSQL 16 (RDS in AWS, local Docker in dev).

**Rationale**:
- ACID compliance critical for audit log integrity
- Complex joins for world graph queries
- Alembic migrations for schema evolution
- RDS managed service removes ops burden

**Consequences**:
- Cannot use DynamoDB's auto-scaling for the audit log
- Must manage connection pooling carefully with asyncpg

---

## ADR-003: Cache & Pub/Sub — Redis

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 00

**Context**: WebSocket fan-out across multiple backend instances requires
pub/sub. Hot path data (world state snapshot) needs caching.

**Options Considered**:
1. Redis
2. AWS SQS + SNS
3. In-process (single instance only)

**Decision**: Redis (ElastiCache in AWS, local Docker in dev).

**Rationale**:
- Single service for both cache and pub/sub
- Mature ecosystem (aioredis)
- Sub-millisecond latency for world state reads
- WebSocket hub uses Redis pub/sub for fan-out across ECS tasks

**Consequences**:
- Adds operational complexity vs. in-process
- Must handle Redis failure gracefully (degraded WebSocket mode)

---

## ADR-004: 3D Engine — React Three Fiber + Three.js

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 00

**Context**: Need interactive 3D visualization of the supply network in
the browser.

**Options Considered**:
1. React Three Fiber + Three.js + Drei
2. Babylon.js
3. WebGL raw (no framework)
4. Deck.gl (geospatial-focused)
5. 2D only (React Flow + D3)

**Decision**: React Three Fiber + Three.js + Drei.

**Rationale**:
- Best React integration (declarative scene graph)
- Largest ecosystem, most tutorials and examples
- Drei provides camera controls, LOD, instances out of the box
- Post-processing via @react-three/postprocessing
- GSAP integrates well for camera animation

**Consequences**:
- Three.js bundle adds ~600KB gzipped (mitigated by code splitting)
- WebGL-only; IE not supported (acceptable)
- Must implement WebGL fallback for accessibility

---

## ADR-005: AI Provider Abstraction

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 00

**Context**: Multiple AI providers needed: Gemini (primary), Ollama
(local/privacy), Bedrock (optional AWS), Mock (deterministic testing).

**Decision**: Abstract `AIProvider` class with per-provider implementations.
Provider selected via environment variable with fallback chain.

**Rationale**:
- Enables deterministic testing via Mock provider
- Allows provider switching without code changes
- Fallback chain ensures resilience
- Consistent typed output via Pydantic schema parameter

**Consequences**:
- All provider implementations must conform to the same interface
- Breaking changes to interface require updating all providers

---

## ADR-006: Container Platform — ECS Fargate

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 00

**Context**: Need a reliable, low-ops container hosting for demo deployment.

**Options Considered**:
1. ECS Fargate
2. EC2 + Docker
3. Kubernetes (EKS)
4. Lambda + API Gateway
5. App Runner

**Decision**: ECS Fargate.

**Rationale**:
- Serverless containers — no EC2 management
- Simpler than EKS for a demo deployment
- Native ALB integration for WebSocket
- Native CloudWatch integration
- Familiar to most AWS practitioners

**Consequences**:
- Cold starts possible (mitigated by keeping minimum 1 task running)
- Lambda excluded because WebSocket + stateful simulation incompatible
- EKS excluded as unnecessarily complex for demo

---

## ADR-007: Frontend State — Zustand + TanStack Query

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 00

**Context**: Frontend needs two distinct types of state: server state
(data from API) and UI state (selected node, sidebar collapse, etc.).

**Decision**: TanStack Query for server state; Zustand for UI/local state.

**Rationale**:
- TanStack Query: built-in caching, refetch on focus, optimistic updates
- Zustand: minimal boilerplate, React hooks native, TypeScript friendly
- Separation of concerns: server state ≠ UI state
- Avoids Redux complexity for a single-developer-speed project

**Consequences**:
- Must not store server data in Zustand (it lives in TanStack Query cache)
- WebSocket events update Zustand, which triggers TanStack Query invalidation

---

## ADR-008: Evaluation Harness Determinism

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 00

**Context**: The evaluation harness must produce identical results on
every run so judges can reproduce results.

**Decision**: All evaluation runs use `provider=mock` and `seed=42` by default.
The Mock AI provider returns pre-defined, schema-valid outputs for known inputs.
The simulation engine uses seeded random.

**Rationale**:
- Eliminates LLM non-determinism from benchmark results
- Allows reproducible CI testing
- Judges can run `POST /api/evaluation/run` and get the exact same results

**Consequences**:
- Mock provider outputs must be manually curated to be realistic
- Cannot use Mock provider for real-world evaluation (requires live provider)

---

## ADR-009: Signal Fusion Engine & Window Duration

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 01

**Context**: Supply chain signals often arrive in bursts from multiple sources (e.g. weather alerts, social media, news). Ingesting them raw creates duplicate risk scoring and noise.

**Decision**: Implement a deterministic `SignalFusionEngine` with a 6-hour fusion window. Co-located signals of the same type within the window are merged using compound probability formulas: `fused_confidence = 1 - ∏(1 - confidence_i)`.

**Rationale**:
- Eliminates duplicate risk propagation calculations
- Produces mathematically sound confidence weighting
- Fixed window simplifies state management for Phase 01 MVP

---

## ADR-010: AI Safety Control Boundary

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 01

**Context**: AI models can hallucinate invalid state mutations, non-existent node IDs, or physically impossible inventory changes.

**Decision**: Strict control boundary: **LLMs propose; deterministic code validates & decides.**
Every LLM proposal passes through: Pydantic Schema Validation → Constraint Engine check → World Model Simulator → State Mutation. Unvalidated LLM output is never written to PostgreSQL or returned as authoritative state.

**Rationale**:
- Guaranteed system integrity and safety
- Prevents corrupt supply chain state mutations
- High explainability and auditability

---

## ADR-011: Multi-Dimensional Risk Scoring Standard

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 01

**Context**: Inconsistency identified during Phase 01 cross-check: `API_SPEC.md` returned a single float for `risk_score`, while `DATA_MODEL.md` defined `NodeRiskScores` with financial, SLA, operational, and sustainability dimensions.

**Decision**: Standardize all layers (Database, Pydantic, REST API, WebSockets, Frontend, 3D Engine) on `NodeRiskScores` (multi-dimensional object with `composite` score).

**Rationale**:
- Operators need dimensional breakdown to make trade-offs
- Single float obscures whether risk is financial vs. SLA
- 3D node rendering can visualize composite risk while tooltips show full multi-dimensional breakdown

---

## ADR-012: 3D Visualization Spatial Topology

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 01

**Context**: Determining whether the 3D scene should render a geographic 3D globe or a logical network graph topology.

**Decision**: 3D scene uses **Logical Network Topology Layout** with fixed node positions, fixed camera angles, and data-driven visual encoding (color, particle flow, wave rings).

**Rationale**:
- Avoids visual clutter caused by tight geographic clustering (e.g., East Asia manufacturing hubs)
- Maximizes readability of supply node interdependencies
- Dramatically improves 3D performance and frame stability (enables instanced mesh rendering)

---

## ADR-013: WebSocket Event Real-Time Fan-Out Pattern

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 01

**Context**: The 3D scene, Command Center, Agent Console, and Decision Cockpit must update in real time without continuous REST polling.

**Decision**: Dedicated WebSocket event channel emitting typed events (`world.update`, `signal.detected`, `risk.recalculated`, `agent.reasoning`, `adversary.finding`, `plan.ranked`).

**Rationale**:
- Sub-50ms latency for real-time visual feedback
- Enables cinematic particle animations and disruption wave propagation
- Single WebSocket Connection per browser client; Zustand routes events to local UI stores

---

## ADR-014: Phase 01 Intelligence Bible & Traceability Standard

**Date**: 2026-09-18
**Status**: ACCEPTED
**Phase**: 01

**Context**: Moving directly to code implementation without full specifications creates fragmented interfaces, missing fields, and communication gaps between backend, AI agents, and 3D UI.

**Decision**: Enforce Phase 01 Complete Product Intelligence mapping before Phase 02 code implementation. All 14 specialized specifications (PRODUCT_BIBLE, WORLD_MODEL_SPEC, RISK_ENGINE_SPEC, SCENARIO_ENGINE_SPEC, AGENT_SYSTEM_SPEC, AI_ARCHITECTURE, API_CATALOG, WEBSOCKET_SPEC, 3D_EXPERIENCE_BIBLE, VISUAL_DESIGN_BIBLE, FRONTEND_EXPERIENCE_BIBLE, GAMIFICATION_SPEC, DEMO_STORYBOARD, OPEN_QUESTIONS) must be synchronized.

**Rationale**:
- Allows any AI developer or human engineer to implement any module independently with 100% contract stability
- Guarantees end-to-end traceability from raw signal input to 3D rendering and demo narrative

---

## ADR-015: World Model Vertical Slice & Seeded Determinism

**Date**: 2026-09-19
**Status**: ACCEPTED
**Phase**: 02

**Context**: Need a foundational World Model that serves as the single source of truth for all downstream risk calculations, scenario generation, specialist AI agents, 2D topology graphs, and 3D spatial visualizers.

**Decision**: Implement `SupplyNetworkGraph` in Python with explicit Pydantic v2 schemas (`WorldNode`, `WorldEdge`, `WorldStateSnapshot`, `Position3D`, `NodeRiskScores`), backed by `SyntheticDataGenerator` using centralized `random.Random(seed)`.

**Rationale**:
- Guaranteed exact seed reproducibility (`seed=42 == seed=42`) across test harnesses, backend APIs, and frontend visualizers.
- Strict control boundary prevents unvalidated AI outputs from mutating state directly.
- Single dataset drives both 2D operational topology and 3D React Three Fiber spatial rendering.

---

---

## ADR-016: Deterministic Risk Engine & BFS Graph Propagation Architecture

**Date**: 2026-09-19
**Status**: ACCEPTED
**Phase**: 03

**Context**: Need a fast, 100% deterministic, explainable risk intelligence engine that fuses weak disruption signals, calculates multi-dimensional node/edge risks, and propagates risk downstream across multi-tiered supply network dependencies.

**Decision**:
1. **Signal Fusion**: Implement 6-hour sliding deduplication window and compound confidence weighting (`1 - ∏(1 - c_i)`).
2. **Deterministic Risk Scorer**: Direct impact scoring mapped to severity bands (`LOW=0.25`, `MEDIUM=0.50`, `HIGH=0.75`, `CRITICAL=0.95`).
3. **BFS Graph Propagation**: Propagate risk downstream over `DEPENDENCY` edges up to `MAX_HOPS=3` with logarithmic decay factor (`DECAY_FACTOR=0.6`).
4. **Traceable Explanations**: Generate deterministic, structured natural-language explanations preserving contributing signal UUIDs, primary driver, and affected upstream/downstream node lists.
5. **No LLMs in Risk Calculation**: All risk scores are calculated by deterministic Python algorithms; LLMs only consume risk outputs downstream.

**Rationale**:
- Ensures 100% reproducible benchmark evaluation and automated testing (`seed=42` produces identical risk maps every time).
- Guarantees bounded scores in `[0.0, 1.0]`.
- Gives human operators full auditability into why a specific warehouse or fulfillment center is marked at-risk.

**Consequences**:
- AI agents in later phases will consume explicit, structured risk state without hallucinating risk values.
- Downstream propagation depth is bounded (`MAX_HOPS=3`) to prevent unrealistic global panics across unrelated nodes.

---

## ADR-017: Vendor-Neutral AI Provider Abstraction & Safe Intelligence Boundary

**Date**: 2026-09-19
**Status**: ACCEPTED
**Phase**: 04

**Context**: Future specialist AI agents (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience, Coordinator, Adversary) require reasoning capabilities across multiple AI model vendors (Gemini, Ollama, Bedrock, Mock). However, LLMs must never directly mutate authoritative world state or bypass system constraints.

**Decision**:
1. **Abstract AIProvider Base Class**: All providers implement `AIProvider` (`generate()`, `health()`, `capabilities()`).
2. **Deterministic Mock Default**: `MockAIProvider` is the default provider (`FULFILLX_AI_PROVIDER=mock`). Works 100% offline with zero external network or API key dependencies.
3. **Provider Factory & Fallback**: `ProviderFactory` manages adapters (`mock`, `gemini`, `ollama`, `bedrock`). If a primary provider is unconfigured or unreachable, it falls back gracefully to `mock`.
4. **AI Safety Control Boundary**: Enforce strict rule: **"LLMs propose; deterministic code validates & decides"**. `AIService` parses and validates model outputs against JSON schemas before returning payloads. `AIService` never mutates `WorldRepository` or `RiskRepository` directly.
5. **Typed REST APIs & Frontend Status**: Expose `/api/ai/providers`, `/api/ai/health`, `/api/ai/generate` with live provider status indicators in the frontend UI.

**Rationale**:
- Prevents vendor lock-in; allows switching between cloud Gemini, local Ollama, or AWS Bedrock via environment configuration.
- Guarantees 100% test reproducibility and offline CI build stability.
- Protects supply chain world model integrity against LLM hallucinations or invalid state mutations.

**Consequences**:
- AI reasoning is purely additive; system correctness and risk calculations remain 100% functional even if external AI APIs fail or are offline.

---

## ADR-018: Specialist Agent System & Non-Authoritative Proposal Architecture

**Date**: 2026-09-19
**Status**: ACCEPTED
**Phase**: 05

**Context**: FULFILL-X requires domain-specific specialist agents (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience) to analyze multi-tiered risk snapshots and generate actionable mitigation proposals without compromising world state integrity or executing unvalidated operational mutations.

**Decision**:
1. **6 Domain Specialist Agents**: Implement 6 dedicated specialist agents, each targeting a single operational domain objective (`MINIMIZE_STOCKOUT_RISK`, `REDUCE_SUPPLIER_DISRUPTION`, `REDUCE_DELAY_AND_COST`, `PROTECT_SERVICE_LEVEL`, `REDUCE_EMISSIONS`, `REDUCE_SYSTEMIC_FRAGILITY`).
2. **Safe Execution Pipeline (`safe_execute`)**: Implemented template pattern in `BaseAgent`. Pre-execution and post-execution snapshot comparison (`snap_id_before == snap_id_after` and `risk_snap_before == risk_snap_after`) guarantees zero state side-effects.
3. **Strict Entity ID Validation (`validate_proposal_entities`)**: Every proposed action's target node and edge IDs are strictly validated against authoritative `WorldStateSnapshot` node/edge registries to reject LLM-hallucinated entities instantly.
4. **Coexistence Without Selection**: All 6 specialist agents execute independently (in parallel via `asyncio.gather`), outputting candidate `AgentProposal` objects. Specialist agents do NOT pick winners or arbitrate tradeoffs (reserved for Coordinator / Multi-Agent Consensus in future phases).
5. **Specialist War Room Frontend**: Interactive UI drawer allowing single or all-specialist execution with confidence indicators, action cost/delay tables, evidence signal links, and reasoning trace step inspection.

**Rationale**:
- Enforces strict safety boundary: **"LLMs propose; deterministic code validates & decides"**.
- Prevents invalid supply chain operations from mutating state or polluting risk evaluations.
- Enables clear, audit-ready operational transparency for human logistics planners.

**Consequences**:
- Specialist agents produce proposals only; state mutation requires subsequent coordinator approval and deterministic validation.

---

*Last updated: Phase 05 — Specialist Agent System Complete*





