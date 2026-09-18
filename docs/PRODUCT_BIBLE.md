# FULFILL-X — Product Bible

> The single source of truth for understanding FULFILL-X from zero
> knowledge to full implementation readiness.
> Version: Phase 01 — Architecture Mapping Complete

---

## 1. Executive Overview

FULFILL-X is an **agentic fulfillment resilience intelligence system**.
It continuously monitors a supply network, detects and fuses disruption
signals, models compound risk scenarios, deploys specialist AI agents to
generate recovery plans, adversarially stress-tests those plans, and
presents a multi-objective verified decision to the operator — in under
5 seconds on synthetic data.

The system is:
- **Explainable**: Every recommendation has traceable evidence and reasoning
- **Adversarially validated**: Every plan is attacked before acceptance
- **Deterministic at its core**: AI proposes; constraints and simulation decide
- **Visually compelling**: A cinematic 3D supply network shows data, not decoration

---

## 2. Problem

Modern fulfillment operations face three compounding failures:

| Failure | Description |
|---------|-------------|
| **Reactive blindness** | Disruptions are discovered after damage is done. Weather events, port closures, factory fires — operators learn from news, not from systems |
| **Analysis paralysis** | Multi-factor concurrent disruptions overwhelm human analysis capacity. A typhoon + supplier fire + demand spike require simultaneous modeling across hundreds of interdependencies |
| **Trade-off opacity** | Recovery plans optimize one metric (usually cost or speed) while destroying others (SLA commitments, sustainability, network resilience). There is no mechanism to make trade-offs visible and auditable |

**Downstream consequence**: Fulfillment failures damage customer trust, trigger SLA penalties, create regulatory exposure, and generate unnecessary emissions from emergency logistics decisions.

---

## 3. Why Existing Operational Workflows Are Insufficient

| Tool | Limitation |
|------|-----------|
| ERP / WMS | Shows current state; cannot model compound future scenarios |
| BI dashboards | Historical reporting; not real-time; no agent action |
| Manual war rooms | Slow, unscalable, undocumented; decisions not traceable |
| Rule-based alerts | Single-signal; cannot detect compound weak-signal patterns |
| Generic AI assistants | No domain constraints; no simulation; no adversarial validation |

FULFILL-X solves the gap between **awareness** and **verified, auditable, multi-objective action**.

---

## 4. FULFILL-X Solution

FULFILL-X implements an **end-to-end intelligence pipeline**:

```
OBSERVE → WORLD MODEL → SIGNAL FUSION → RISK DETECTION →
RISK PROPAGATION → COMPOUND SCENARIO → SPECIALIST AGENTS →
COORDINATOR → ADVERSARY → MULTI-OBJECTIVE PLANNER →
CONSTRAINT VALIDATION → STRESS TEST → VERIFIED DECISION → MEMORY
```

Each stage has:
- A deterministic engine (Python)
- A typed data contract (Pydantic v2)
- A visual representation (React / Three.js)
- A traceable audit record (PostgreSQL)

---

## 5. Target Users

| Persona | Role | Primary Screens |
|---------|------|----------------|
| Supply Chain Command Director | Senior operations leader; approves recovery plans | Command Center, Decision Cockpit |
| Risk Analyst | Quantitative modeler; composes scenarios | Risk Explorer, Scenario Lab, Evaluation |
| Logistics Planner | Operational executor; reads agent proposals | Agent War Room, Plan Comparison |
| Sustainability Officer | ESG tracking; validates emissions impact | Plan Comparison (sustainability dimension) |

---

## 6. Core User Journey

```
1. Director opens app → sees network at 0.58 health (amber)
2. Signal Intelligence shows 2 CRITICAL signals
3. Analyst promotes signals to compound scenario
4. Scenario Lab runs simulation → risk delta: SLA 0.20 → 0.72
5. Director clicks "Run Agent Response"
6. 6 specialist agents run in parallel (< 5s on mock)
7. Coordinator produces 3 ranked plans
8. Adversary attacks each plan, exposes weaknesses
9. Director views Plan Comparison → selects Plan B (balanced)
10. Stress Test confirms Plan B survives 7/10 stressor combos
11. Decision Cockpit: Director approves Plan B with note
12. World state updates → 3D shows new routes activating
13. Audit log records decision with full evidence chain
```

---

## 7. System Mental Model

FULFILL-X has **one authoritative world state** in PostgreSQL.

The pipeline is:
1. **Signals** (external events) update the world via the Signal Ingestor
2. The **Risk Engine** scores every node and edge
3. The **Scenario Engine** composes compound disruptions
4. The **Agent Orchestrator** deploys specialist agents
5. Agents use **AI providers** to generate **proposals** (JSON)
6. Proposals are validated against **typed schemas + constraint engine**
7. Proposals that pass validation enter the **Simulation Engine**
8. The simulation accepts or rejects proposals deterministically
9. The **Coordinator Agent** ranks valid proposals into plans
10. The **Adversary Agent** stress-tests each plan
11. The **Multi-Objective Planner** scores plans across 4 dimensions
12. Approved plans mutate world state via the Simulation Engine
13. All mutations are audit-logged

**The LLM never touches world state directly.**

---

## 8. World Model

### Purpose
The World Model is the single, authoritative, graph-structured representation of the supply network at any point in time.

### Inputs
- Synthetic data seed (Phase 01–11)
- Plan acceptance events (mutate state)
- Signal ingestor updates

### Process
A directed graph G = (N, E) where:
- N = {Supplier, Warehouse, FulfillmentCenter, CustomerZone, Port} nodes
- E = {Route, Dependency} edges

State is stored in PostgreSQL. The in-memory graph is rebuilt from DB on startup and updated incrementally.

### Outputs
- `WorldStateSnapshot` (Pydantic schema) — served via `GET /api/world`
- `world.update` WebSocket event (broadcast on any state change)

### Data
See `docs/WORLD_MODEL_SPEC.md` for full entity definitions.

### Dependencies
- PostgreSQL (persistence)
- Redis (snapshot cache)
- Signal Ingestor (state updates)
- Simulation Engine (plan application)

### Validation
- All node IDs are unique
- All edge source/target IDs reference existing nodes
- All numeric fields are in valid ranges
- Graph connectivity is verified on seed generation

### Frontend Representation
- `GET /api/world` → Zustand `worldSnapshot` → `NodeLayer`, `EdgeLayer` in 3D
- KPI metrics on Command Center

### 3D Representation
- Nodes: geometry by type (sphere/box/octahedron), color by risk score
- Edges: tubes with particle flow indicating route activity

### API
`GET /api/world` · `GET /api/world/nodes/{id}` · `GET /api/world/edges/{id}`

### Testing
- Deterministic seed produces fixed node/edge counts
- All risk scores in [0.0, 1.0]
- Graph is acyclic where required

### Failure Mode
- DB unreachable: serve last cached snapshot from Redis; flag `stale: true`
- Graph corruption: halt ingestion, alert, serve last valid snapshot

### Demo Role
World starts at health 0.58 (pre-seeded with "Double Punch" scenario pending)

---

## 9. Supply Network

The synthetic MVP network has:

| Entity | Count | Description |
|--------|-------|-------------|
| Suppliers | 5 | 2 Tier-1, 3 Tier-2; electronics, components, packaging |
| Warehouses | 3 | Regional: APAC, EU, NA |
| Fulfillment Centers | 2 | High-volume order processing |
| Customer Zones | 10 | Geographic demand clusters |
| Ports | 3 | Osaka, Shanghai, Rotterdam |
| Routes | ~25 | Sea lanes, air corridors, road segments |

---

## 10. Entities

Full entity definitions are in `docs/WORLD_MODEL_SPEC.md`.

Key entities:

| Entity | Purpose | Risk-Bearing |
|--------|---------|-------------|
| Supplier | Source of components/products | Yes — supplier disruption propagates downstream |
| Warehouse | Regional inventory buffer | Yes — stockout risk |
| FulfillmentCenter | Order processing | Yes — SLA risk |
| CustomerZone | Demand sink | Receives risk (SLA breach) |
| Port | Transport chokepoint | Yes — closure disrupts multiple routes |
| Route | Connection between nodes | Yes — delay/disruption propagates |
| Product | SKU being tracked | Tied to inventory levels |
| Inventory | Stock level at a node | Directly determines stockout risk |
| Order | Customer demand commitment | Creates SLA obligation |
| Shipment | In-transit inventory | Exposed to route disruption |

---

## 11. Dependencies

Dependency edges (distinct from route edges) model:
- Supplier → Warehouse (supply dependency)
- Warehouse → FulfillmentCenter (inventory dependency)
- FulfillmentCenter → CustomerZone (SLA commitment)
- Supplier A → Supplier B (tier dependency: B depends on A's components)

Dependency edges are used by the Risk Engine for propagation.

---

## 12. Signals

Signals are structured representations of external disruption events.

| Signal Type | Examples |
|------------|---------|
| WEATHER | Typhoon, flood, blizzard |
| GEOPOLITICAL | Trade restriction, sanctions, strike |
| SUPPLIER_HEALTH | Factory fire, financial distress, capacity reduction |
| DEMAND_SHIFT | Demand spike, demand collapse, promotional surge |
| LOGISTICS | Port closure, carrier capacity reduction, fuel price spike |
| REGULATORY | Customs change, import restriction, compliance requirement |
| CYBER | Ransomware attack on logistics provider |

Each signal carries:
- `type`, `severity` (LOW/MEDIUM/HIGH/CRITICAL)
- `confidence` (0.0–1.0) — how reliable is the signal source
- `affected_node_ids` — which network nodes are directly impacted
- `geographic_scope` — GeoJSON polygon
- `raw_data` — original signal payload

---

## 13. Weak-Signal Fusion

**DECISION REQUIRED (ADR-009)**: The current Phase 00 specification does not define a formal weak-signal fusion mechanism.

The intended behavior:
- Multiple low-severity signals of the same type in the same region within a time window are **fused** into a single higher-confidence signal
- Example: 3 LOGISTICS/LOW signals about shipping delays in APAC within 6h → fused to LOGISTICS/MEDIUM with confidence 0.75
- Fusion is **deterministic**: same input signals → same fused output

This must be implemented in the `SignalFusionEngine` (new subsystem).

See `docs/OPEN_QUESTIONS.md` → Q-ARCH-001.

---

## 14. Risk Engine

### Purpose
Assign multi-dimensional risk scores to every node and edge in the supply network based on active signals and graph structure.

### Inputs
- `WorldStateSnapshot` (current graph)
- `List[Signal]` (active signals)
- `SignalFusionResult` (fused signals from SignalFusionEngine)

### Process

```
Raw signals
   ↓ [SignalFusionEngine]
Fused signal set
   ↓ [RiskEngine.score_direct()]
Direct impact scores (nodes directly in signal.affected_node_ids)
   ↓ [RiskEngine.propagate()]
Propagated scores (BFS through dependency edges, decay factor 0.6/hop, max 3 hops)
   ↓ [RiskEngine.compose()]
Multi-dimensional risk scores (financial, SLA, operational, sustainability)
   ↓ [RiskEngine.explain()]
Risk explanations (which signals caused which scores)
```

### Outputs
- `RiskScoreMap` (node_id → NodeRiskScores)
- Risk explanations per node
- `network_health_score` (1.0 - weighted_average_composite)

### Determinism
All risk calculation is **fully deterministic** given the same inputs.
No LLM is involved in risk scoring.

**DECISION REQUIRED (ADR-010)**: Propagation decay factor (currently assumed 0.6/hop). See `docs/OPEN_QUESTIONS.md` → Q-ARCH-002.

### Frontend Representation
- Risk Explorer screen: sortable risk table + heat map
- Command Center: top-risk node list
- All 3D nodes: color = risk score interpolation

### 3D Representation
- Node color lerps from green (0.0) to red (1.0) proportional to composite risk
- Disruption waves animate from nodes with `is_disrupted: true`

### API
`GET /api/risks` · `GET /api/risks/nodes/{id}`

---

## 15. Compound Risk

When multiple signals affect overlapping nodes, their risk contributions are **composed**, not merely summed:

```
compound_risk = 1 - product((1 - risk_i) for each signal_i affecting node)
```

This prevents risk scores from exceeding 1.0 while reflecting true compound impact.

**DECISION REQUIRED (ADR-010)**: Validate this formula against domain expertise.

---

## 16. Risk Propagation

Risk propagates through dependency edges using BFS:

```
for hop in range(max_hops=3):
    for each unvisited neighbor:
        neighbor.risk = max(neighbor.risk, source.risk * decay_factor^hop)
```

Propagation stops at the maximum hop depth or when risk falls below threshold 0.05.

---

## 17. Scenario Engine

### Purpose
Compose multiple signals into a coherent compound scenario object, then simulate its effect on the world state.

### Inputs
- One or more `Signal` objects (selected by user or auto-triggered)
- Relationship type (CONCURRENT / CASCADING / AMPLIFYING)
- Magnitude multiplier (1.0–10.0)
- Duration (hours)

### Process
1. Validate signal compatibility (no conflicting geographic scope)
2. Compute union of affected nodes
3. Apply magnitude multiplier to risk deltas
4. For CASCADING: sequence disruptions with 6h offset
5. For AMPLIFYING: multiply risk scores of overlapping nodes
6. Generate `ScenarioObject` with propagation steps

### Outputs
- `ScenarioObject` — stored in PostgreSQL
- Propagation step list (for 3D animation playback)
- Risk delta (before/after comparison)

### Determinism
Scenario composition is **fully deterministic** given same inputs.
Simulation uses `SIMULATION_SEED` for any random elements.

### Frontend Representation
- Scenario Lab: React Flow canvas (signal nodes → relationship edges → scenario node)
- Mini 3D embed shows risk wave animation after simulation

### API
`POST /api/scenarios` · `POST /api/scenarios/{id}/simulate`

---

## 18. Specialist Agents

Eight specialist agents run in parallel (via `asyncio.gather`):

| Agent | Objective | Primary Tool |
|-------|-----------|-------------|
| Inventory | Minimize stockout | Reorder + stock transfer actions |
| Supplier | Reduce supplier disruption | Supplier switch recommendations |
| Transportation | Minimize delay/cost | Route rerouting, mode switches |
| Fulfillment | Protect SLA commitments | Order priority, FC allocation |
| Sustainability | Minimize emissions | Emissions-aware alternative selection |
| Resilience | Reduce systemic fragility | SPOF identification, diversification |
| Coordinator | Reconcile proposals | Multi-objective plan ranking |
| Adversary | Break plans | Vulnerability identification |

Each agent follows the **AI Safety Boundary**: proposes → validates → simulates → result.

Full contracts in `docs/AGENT_SYSTEM_SPEC.md`.

---

## 19. Coordinator

The Coordinator Agent is distinct from specialist agents:
- **Receives** proposals from all 6 specialists
- **Detects and resolves** conflicting actions (e.g., two agents both routing via same bottleneck)
- **Scores** each proposal bundle across 4 dimensions
- **Produces** up to 5 ranked `RankedPlan` objects

Scoring weights are configurable:

```python
DEFAULT_WEIGHTS = {
    "sla_preservation": 0.35,
    "cost_delta": 0.25,
    "emissions_delta": 0.20,
    "fragility_delta": 0.20,
}
```

**DECISION REQUIRED (ADR-011)**: Are these weights configurable by the user at runtime?

---

## 20. Adversary

The Adversary Agent:
- **Receives** a single `RankedPlan`
- **Selects** attack vectors from the `DisruptionLibrary`
- **Simulates** each attack against the plan using the Simulation Engine
- **Reports** findings (attack vector, failure mode, severity, probability)
- **Produces** an adversary rating (0.0 = fragile, 1.0 = robust)

The Adversary never proposes alternative plans. It only finds weaknesses.

Maximum 5 findings per plan. All findings are traceable to a simulation result.

---

## 21. Multi-Objective Planner

The multi-objective planner is the **scoring component within the Coordinator**:

```
Plan scores across 4 dimensions:
  cost_delta: negative is better (cost reduction)
  sla_preservation: 0.0–1.0, higher is better
  emissions_delta: lower is better (less additional emissions)
  fragility_delta: negative is better (less fragile)

composite = weighted_sum(dimensions, DEFAULT_WEIGHTS)
```

Plans are ranked by `composite` score, then adjusted by `adversary_rating`.

**DECISION REQUIRED (ADR-011)**: Final scoring formula including adversary rating adjustment.

---

## 22. Constraint Validation

Every agent proposal is validated against a `ConstraintSet` before simulation:

```python
class ConstraintSet:
    max_transfer_cost: float
    max_capacity_utilization: float
    min_supplier_qualification_score: float
    max_emission_delta_percent: float
    min_sla_preservation_threshold: float
```

Constraint check is **fully deterministic** — no AI involved.
Failed constraint check → `status: INFEASIBLE`, not passed to simulator.

---

## 23. Stress Testing

The Stress Test Engine applies multiple adversarial stressors to a plan sequentially:

| Stressor | Description |
|---------|-------------|
| Additional port closure | Removes an alternative route |
| Demand spike | +15% sudden demand increase |
| Air freight capacity reduction | Reduces emergency mode capacity |
| Secondary supplier failure | Removes a backup supplier |
| Fuel price spike | Increases all transport costs |

Results: pass/fail per stressor + survival rate across all combinations.

**DECISION REQUIRED (ADR-012)**: Is stress test deterministic (seeded) or stochastic?

---

## 24. Decision Cockpit

The Decision Cockpit is the final human-in-the-loop interface:

- Shows the **top-ranked plan** with full evidence chain
- Shows **adversary rating** and **stress test survival rate**
- Shows **constraint satisfaction** breakdown
- Provides: **Approve** / **Reject** / **Defer** actions
- All actions are **audit-logged** with timestamp, actor, and note

Approval triggers:
1. `POST /api/plans/{id}/approve`
2. Backend runs final simulation validation
3. World state mutates (plan applied)
4. WebSocket broadcasts `plan.accepted` + `world.update`
5. 3D world shows new routes animating in

---

## 25. Decision Memory

All decisions are stored in the `audit_log` table:

```
event_type: PLAN_APPROVED / PLAN_REJECTED / PLAN_DEFERRED
entity_id: plan_id
payload: {plan_summary, scores, adversary_rating, approver_note, stress_test_survival}
actor: user_id (or "system")
created_at: UTC timestamp
```

Memory enables:
- Post-incident review
- Evaluation harness comparison (expected vs. actual outcomes)
- Future ML training signal (out of scope for MVP)

---

## 26. AI Provider Layer

Four providers implement the same `AIProvider` interface:

| Provider | Use Case | Deterministic |
|---------|---------|--------------|
| Gemini | Primary production | No (temperature > 0) |
| Ollama | Local / privacy mode | No (temperature > 0) |
| AWS Bedrock | Optional enterprise | No |
| Mock | Testing / evaluation | **Yes** (seeded) |

Provider selection: `AI_PROVIDER` env var. Fallback chain: `gemini → ollama → mock`.

All providers return **validated Pydantic models**. Raw LLM output never touches state.

Full specification in `docs/AI_ARCHITECTURE.md`.

---

## 27. Deterministic Simulation

The Simulation Engine is entirely deterministic:

```python
class SimulationEngine:
    seed: int  # from SIMULATION_SEED env var

    def simulate(
        self,
        proposal: AgentProposal,
        world_state: WorldStateSnapshot,
    ) -> SimulationResult:
        """
        Apply proposal actions to a copy of world state.
        Returns whether the resulting state is feasible.
        All operations are deterministic given same inputs.
        """
```

The simulation creates a **copy** of world state, applies proposed actions,
checks all constraints, and returns `valid: bool` plus `resulting_state`.
Only accepted results can mutate the authoritative world state.

---

## 28. Backend

Full specification in `docs/BACKEND_SPEC.md`.

Key architecture:
- **FastAPI** — async, WebSocket-native, Pydantic-integrated
- **Module structure**: `api/` · `ws/` · `engines/` · `agents/` · `ai/` · `models/` · `schemas/`
- **Signal Fusion Engine** (NEW — not in Phase 00 BACKEND_SPEC, add to Phase 01 TODO)
- **Stress Test Engine** (NEW — not fully specified in Phase 00)
- **Background task queue**: `asyncio` tasks for long-running agent pipelines

**Gap found**: `StressTestEngine` module not in Phase 00 `BACKEND_SPEC.md` module tree.
**Gap found**: `SignalFusionEngine` not in Phase 00 `BACKEND_SPEC.md`.

Both have been added to `docs/OPEN_QUESTIONS.md` and `tasks/TODO.md`.

---

## 29. APIs

Full specification in `docs/API_SPEC.md` and `docs/API_CATALOG.md`.

**Inconsistency found**: `API_SPEC.md` line 72 uses `"risk_score": 0.72` (flat float) but
`DATA_MODEL.md` defines `risk_scores` as `NodeRiskScores` (object with 5 dimensions).

**Correction**: API response must return `NodeRiskScores` object, not flat float.
This is tracked in `docs/DECISION_LOG.md` → ADR-013.

---

## 30. WebSockets

Full specification in `docs/WEBSOCKET_SPEC.md`.

WebSocket is the primary real-time channel. All agent activity, world updates, and
plan events are delivered via WebSocket — not polling.

---

## 31. Frontend

Full specification in `docs/FRONTEND_SPEC.md` and `docs/FRONTEND_EXPERIENCE_BIBLE.md`.

12 screens. React 18 + TypeScript + Vite + Tailwind + shadcn/ui.
State: Zustand (UI) + TanStack Query (server) + WebSocket context.

---

## 32. 3D Experience

Full specification in `docs/3D_EXPERIENCE_BIBLE.md`.

The 3D world is a **data-driven visualization**, not a decorative animation.
Every visual effect maps to a specific backend state field.

No visual effect exists without a backend cause.

---

## 33. State Management

```
Server state (API data):         TanStack Query cache
  → invalidated by WS events

Real-time state (WS events):     Zustand store
  → triggers TanStack Query invalidation

UI state (selected node, etc):   Zustand store
  → drives 3D scene + panels
```

The 3D scene reads from Zustand. When Zustand updates (via WebSocket), the 3D scene
re-renders with animated transitions.

---

## 34. AWS

Full specification in `docs/AWS_SPEC.md`.

MVP deployment: ECS Fargate + ALB + RDS + ElastiCache + S3 + CloudFront.

Every AWS service has a documented purpose. No service is included for cosmetic reasons.

---

## 35. Security

Full specification in `docs/SECURITY_SPEC.md`.

Key principle: **LLM never touches world state directly.**
All AI outputs pass through: schema validation → constraint check → simulation → approval.

---

## 36. Testing

Full specification in `docs/TESTING_SPEC.md` and `docs/TEST_TRACEABILITY.md`.

Evaluation harness is fully deterministic with `provider=mock` + `seed=42`.

---

## 37. Evaluation

The evaluation harness validates end-to-end system behavior using 5 benchmark scenarios.
Results must be reproducible by anyone running `POST /api/evaluation/run` with `seed=42`.

Metrics tracked:
- `agent_response_time_p95` (< 5s)
- `sla_preservation_mean` (> 0.80)
- `adversary_detection_rate` (> 90%)
- `plan_feasibility_rate` (> 80%)
- `evaluation_determinism` (100%)

---

## 38. Demo Mode

Demo mode uses pre-seeded data (`--preset double_punch`) so the demo always starts
in the same state. The demo scenario "The Double Punch" (typhoon + factory fire) is
pre-configured but not pre-activated — the demo presenter triggers each step live.

No fake UI-only animations. Every demo step corresponds to real system behavior.

Full demo script in `docs/DEMO_STORYBOARD.md`.

---

## 39. Failure / Fallback Behavior

| Component | Failure | Fallback |
|-----------|---------|---------|
| AI provider | Timeout/unavailable | Chain: Gemini → Ollama → Mock |
| PostgreSQL | Unreachable | Redis snapshot; 503 after 5s |
| Redis | Unreachable | WebSocket degrades to polling |
| WebGL (3D) | Unsupported | React Flow 2D fallback |
| Agent timeout | > 30s | Return `status: TIMEOUT`; partial results |
| Simulation engine | Error | Return `status: SIMULATION_ERROR`; block plan acceptance |

---

## 40. Open-Source Attribution

All dependencies reviewed in `LICENSES/THIRD_PARTY.md`.

No open-source project is cloned and renamed.
All external code is used under compatible licenses (MIT, Apache-2.0, BSD).

---

## 41. Future Evolution

| Area | Future Extension |
|------|----------------|
| Signals | Real-time external signal ingestion (Kafka / EventBridge) |
| World Model | Geographic projection (lat/lng → globe) |
| Agents | Agent memory via RAG vector store |
| 3D | WebXR (AR/VR) mode |
| Evaluation | ML training loop using decision outcomes |
| Auth | AWS Cognito JWT (post-demo) |
| Scale | Multi-region deployment |

---

## 42. Complete End-to-End Flow

```
1. User opens browser → CloudFront serves React SPA
2. Frontend loads → GET /api/world (TanStack Query)
3. Frontend connects WebSocket ws://api/ws/{client_id}
4. World state renders in 3D + Command Center KPIs
5. Signal Ingestor receives synthetic signal (typhoon)
6. Signal stored in DB; world node marked is_disrupted: true
7. Risk Engine recomputes scores; risk propagates 3 hops
8. WebSocket broadcasts: world.update + risk.update
9. Frontend: 3D nodes color-transition; KPI health drops
10. User: Signal Intelligence → selects 2 signals
11. User: POST /api/scenarios (compound, CONCURRENT, 1.2x)
12. Scenario Engine: compose + simulate → ScenarioObject stored
13. WebSocket: scenario.created
14. User: POST /api/agents/run (scenario_id, provider=gemini)
15. Orchestrator: asyncio.gather(6 agents)
16. Each agent: AI.generate → Pydantic validate → constraints → simulate
17. WebSocket: agent.started x6 → agent.proposal x6
18. Coordinator: reconcile → rank 3 plans
19. Adversary: attack each plan (3 runs) → findings
20. WebSocket: plan.ranked
21. User: GET /api/plans → Plan Comparison screen
22. User: POST /api/evaluation/stress (plan B)
23. Stress Test: 10 stressors → 7/10 pass
24. User: POST /api/plans/B/approve (note)
25. Simulation: validate → apply to world state
26. Audit log written
27. WebSocket: plan.accepted + world.update
28. 3D: new routes animate in; nodes color to healthier state
```

---

## 43. Definition of Done

Phase is DONE when:

**Code**:
- [ ] All backend engines implemented and tested
- [ ] All 8 agents implemented with mock provider
- [ ] All REST endpoints respond correctly
- [ ] WebSocket events delivered in correct sequence
- [ ] All 12 frontend screens render with live data
- [ ] 3D world updates in real-time from WebSocket
- [ ] Plan approval mutates world state

**Quality**:
- [ ] Backend test coverage ≥ 85%
- [ ] All E2E tests pass (12 screens × happy path)
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Evaluation harness: 5 benchmarks deterministic (seed=42)

**Deployment**:
- [ ] AWS deployment: public URL accessible
- [ ] All services healthy: `GET /api/system/health → HEALTHY`
- [ ] Demo data seeded and demo rehearsed

**Documentation**:
- [ ] All documents consistent
- [ ] HANDOFF.md current
- [ ] git status clean
