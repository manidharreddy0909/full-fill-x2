# FULFILL-X — Open Questions

> Unresolved decisions that must be made before or during implementation.
> Do NOT invent answers merely to make this document look complete.

---

## Architecture Questions

### Q-ARCH-001 — Signal Fusion Window Duration

**Question**: Is the 6-hour signal fusion window configurable at runtime, or is it a fixed constant?

**Why it matters**: If the window is configurable, it must be stored in settings + exposed via API.
If fixed, it lives in a constant. Configurability adds complexity.

**Affected components**: SignalFusionEngine, Settings, API (optional endpoint)

**Options**:
1. Fixed at 6 hours (simple; requires code change to adjust)
2. Configurable per session via env var (medium complexity)
3. Configurable per scenario via API (complex; probably overkill for MVP)

**Recommended**: Option 1 (fixed) for Phase 01; review for Phase 12.

**Decide by**: Phase 02 start

---

### Q-ARCH-002 — Risk Propagation Decay Factor

**Question**: What is the correct risk propagation decay factor (currently assumed: 0.6/hop)?

**Why it matters**: Too high (0.9) and risk spreads to the whole network.
Too low (0.3) and risk doesn't reach downstream nodes at all.

**Affected components**: RiskEngine.propagate(), RISK_ENGINE_SPEC.md formulas

**Options**:
1. 0.6 (assumed — moderate attenuation)
2. 0.7 (more propagation)
3. 0.5 (less propagation)
4. Node-type specific (e.g., 0.8 for Tier-1 dependencies, 0.4 for route dependencies)

**Recommended**: 0.6 as MVP default; make it configurable via `RISK_DECAY_FACTOR` env var.

**Decide by**: Phase 02 start

---

### Q-ARCH-003 — Coordinator Scoring Weights: Configurable at Runtime?

**Question**: Can the Director change the scoring weights (SLA/cost/emissions/fragility) in the Decision Cockpit?

**Why it matters**: If yes, the weights API must be added; frontend needs a weight input UI.
If no, weights are fixed constants.

**Affected components**: Coordinator, API (POST /api/agents/run request body), Decision Cockpit UI

**Options**:
1. Fixed weights (Phase 01 default)
2. User-configurable in agent run request (medium complexity)
3. User-configurable in real-time in Decision Cockpit (high complexity)

**Recommended**: Option 2 — pass as optional field in `POST /api/agents/run`. Default to preset weights.

**Decide by**: Phase 05 start

---

### Q-ARCH-004 — Adversary Plan Scoring Integration Formula

**Question**: What is the exact formula for incorporating adversary_rating into plan's final_score?

**Current assumption**: `final_score = composite_score * 0.8 + adversary_rating * 0.2`

**Why it matters**: Wrong weighting could make adversary findings dominate (unfair) or be ignored (useless).

**Affected components**: Coordinator, API (plan response), Plan Comparison UI

**Options**:
1. `final_score = composite * 0.8 + adversary * 0.2`
2. `final_score = composite * adversary` (multiplicative penalty)
3. `final_score = composite - (1 - adversary) * 0.3` (penalty subtraction)

**Recommended**: Option 1 for MVP. Validate during demo rehearsal.

**Decide by**: Phase 06 start

---

### Q-ARCH-005 — Sustainability Agent: Advisory or Veto?

**Question**: Can the Sustainability Agent veto proposals that exceed the ESG threshold?

**Why it matters**: Veto power means no plan can be approved if emissions delta > threshold.
Advisory means the Director is informed but can override.

**Affected components**: SustainabilityAgent, Coordinator, ConstraintEngine

**Options**:
1. Advisory only (warning shown; director can approve anyway)
2. Hard veto (plan rejected if emissions exceed threshold)
3. Soft veto (plan ranked last if emissions exceed threshold; still selectable)

**Recommended**: Option 1 for MVP with explicit warning in Decision Cockpit.

**Decide by**: Phase 05 start

---

### Q-ARCH-006 — Stress Test Determinism

**Question**: Is the stress test engine deterministic (seeded) or stochastic?

**Why it matters**: If stochastic, same plan run twice may get different survival rates.
This breaks evaluation harness reproducibility.

**Affected components**: StressTestEngine, EvaluationEngine

**Options**:
1. Fully deterministic (use SIMULATION_SEED; same input → same result)
2. Stochastic (adds realism but breaks reproducibility)
3. Configurable: deterministic in evaluation mode, stochastic in production

**Recommended**: Option 1 (always deterministic) for Phase 01.

**Decide by**: Phase 09 start

---

## Data Questions

### Q-DATA-001 — Port Entity: Is it a Node or a Special Edge Attribute?

**Question**: Ports are currently modeled as `WorldNode` with `type=PORT`. However, ports
could also be modeled as attributes on edges (routes that pass through them).

**Why it matters**: Node modeling means ports have full risk scores, 3D representation,
and dependency edges. Edge-attribute modeling is simpler but limits analysis.

**Affected components**: WorldModelSpec, DataModel, SyntheticGenerator, 3D NodeLayer

**Recommended**: Node modeling (already decided in WORLD_MODEL_SPEC.md). Confirm this is acceptable.

**Decide by**: Phase 01 start (already leaning toward Node)

---

### Q-DATA-002 — Historical Risk Snapshots

**Question**: Should the system store historical risk score snapshots for time-series visualization?

**Why it matters**: The Risk Explorer could show "Risk over last 24h" trend lines.
But storing snapshots adds DB schema complexity + storage.

**Affected components**: PostgreSQL schema, RiskEngine, Risk Explorer UI

**Options**:
1. No historical storage (Phase 01 — current state only)
2. Store hourly snapshots in `risk_snapshots` table
3. Use a time-series extension (TimescaleDB)

**Recommended**: No historical storage in Phase 01. Add as Phase 12 enhancement.

**Decide by**: Phase 02 start

---

## AI Questions

### Q-AI-001 — Mock Provider Response Library Coverage

**Question**: Which exact Pydantic output schemas need mock responses, and how many variants?

**Why it matters**: The mock provider must cover all 8 agent schemas + coordinator + adversary.
Under-coverage breaks evaluation harness tests.

**Affected components**: MockProvider, test fixtures

**Action required**: Define `DEFAULT_MOCK_RESPONSES` dict with one realistic response per schema.
Add to `backend/app/ai/mock_responses.py`.

**Decide by**: Phase 04 start

---

### Q-AI-002 — AI Prompt Length Limits

**Question**: What is the maximum prompt length for each provider?

**Why it matters**: The world state prompt summary must be truncated to fit within context windows.
Gemini Flash: ~128K tokens. Ollama Llama3.2: ~8K tokens.

**Affected components**: `build_prompt()` in each agent; WorldStateSnapshot `.to_prompt_summary()`

**Options**:
1. Top-N nodes by risk (e.g., top 20 most relevant)
2. Nodes within N hops of disrupted nodes
3. Fixed truncation by character count

**Recommended**: Option 2 — contextually relevant nodes only. Reduces prompt and improves quality.

**Decide by**: Phase 04 start

---

## Frontend Questions

### Q-FE-001 — Mini 3D World on Command Center: Interactive or Static?

**Question**: Is the mini 3D world on Command Center interactive (clickable nodes) or
a read-only viewport?

**Why it matters**: Interactive adds complexity (click handling in a small canvas).
Static is simpler but less impressive.

**Recommended**: Static (read-only) with a "View Full 3D World" button. Click on mini-globe
navigates to `/world`. No in-canvas interaction.

**Decide by**: Phase 08 start

---

### Q-FE-002 — Scenario Lab: Can Scenarios Be Deleted?

**Question**: Can users delete scenarios from the Scenario Lab dropdown?

**Affects**: API (DELETE /api/scenarios/{id}), database cascade rules, UI

**Recommended**: No delete in Phase 01 (only DRAFT and RESOLVED states).

---

## Testing Questions

### Q-TEST-001 — Visual Regression Baseline: When to Generate?

**Question**: When should we generate the Playwright visual regression baseline screenshots?

**Why it matters**: Baseline must be generated on a clean, stable build.
Generating too early (before 3D is complete) will cause constant test failures.

**Recommended**: Generate visual regression baselines at the end of Phase 09 (3D complete).

---

### Q-TEST-002 — E2E Test Environment: Separate or Shared DB?

**Question**: Do E2E tests use the development DB or a dedicated test DB?

**Why it matters**: Tests running against shared dev DB can corrupt state.

**Recommended**: Separate test DB (`fulfillx_test`); `ENVIRONMENT=test` resets between test runs.

**Decide by**: Phase 07 start

---

## Demo Questions

### Q-DEMO-001 — Live Gemini vs. Mock for Demo

**Question**: Should the demo run with real Gemini API or mock provider?

**Trade-off**:
- Gemini: More impressive but ~2–4s latency; internet dependency; cost
- Mock: Instant; deterministic; zero risk of failure; less impressive

**Recommended**: Use mock for evaluation judges (reproducible). Use Gemini for boardroom demos
(impressive, with mock fallback pre-configured). Add a clear provider badge in UI.

---

### Q-DEMO-002 — Network Health Recovery Animation Duration

**Question**: When a plan is approved, how long should the network health score take to
visually recover? Real-time? Animated count-up?

**Recommended**: 3s animated count-up from 0.58 → 0.81, pausing at each milestone.
Add to `PlanChangeAnimation` implementation.
