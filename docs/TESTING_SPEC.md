# FULFILL-X — Testing Specification

## 1. Purpose

Define the complete testing strategy for FULFILL-X: unit tests,
integration tests, end-to-end tests, evaluation harness, and
performance tests.

## 2. Testing Pyramid

```
         ┌──────┐
         │  E2E │  (Playwright)
        ┌┴──────┴┐
        │  Integ │  (pytest + MSW)
       ┌┴────────┴┐
       │   Unit   │  (pytest + Vitest)
      └────────────┘
```

## 3. Backend Tests

### 3.1 Unit Tests (pytest)

#### World Model Engine
```python
# test_world_model.py
def test_create_synthetic_network():
    """Synthetic MVP network has correct node/edge counts."""

def test_node_risk_score_range():
    """All risk scores are in [0.0, 1.0]."""

def test_disruption_propagation():
    """Disrupting node X propagates risk to its neighbors."""

def test_world_state_deterministic():
    """World model with same seed produces identical output."""
```

#### Risk Engine
```python
# test_risk_engine.py
def test_composite_risk_score():
    """Composite risk = weighted average of dimensions."""

def test_risk_update_on_signal():
    """Ingesting a HIGH severity signal increases composite risk > 0.5."""

def test_risk_propagation_depth():
    """Risk propagates max 3 hops through the graph."""

def test_zero_risk_baseline():
    """Network with no signals has risk scores close to 0."""
```

#### Scenario Engine
```python
# test_scenario_engine.py
def test_compound_scenario_creation():
    """Compound scenario with 2 signals produces valid ScenarioObject."""

def test_cascading_scenario_amplification():
    """Cascading relationship amplifies risk vs. concurrent."""

def test_scenario_affects_correct_nodes():
    """Only nodes in signal affected_node_ids are disrupted."""
```

#### Agent Tests
```python
# test_agents.py
def test_inventory_agent_returns_valid_proposal(mock_ai_provider):
    """Inventory agent with mock provider returns valid AgentProposal."""

def test_agent_constraint_violation_returns_infeasible(mock_ai_provider):
    """Proposal exceeding capacity returns INFEASIBLE status."""

def test_agent_timeout_returns_timeout_status():
    """Agent that exceeds timeout_seconds returns TIMEOUT status."""

def test_adversary_agent_finds_vulnerability(mock_ai_provider):
    """Adversary agent returns at least 1 finding for vulnerable plan."""

def test_coordinator_ranks_plans(mock_ai_provider):
    """Coordinator returns ranked list of plans sorted by composite score."""

def test_all_agents_deterministic(mock_ai_provider):
    """All agents with mock provider + same input produce identical output."""
```

#### Simulation Engine
```python
# test_simulation.py
def test_simulate_reroute_action():
    """Rerouting a disrupted edge reduces delay in simulation result."""

def test_simulate_inventory_transfer():
    """Transferring inventory reduces stockout risk at target node."""

def test_simulation_rejects_capacity_exceeded():
    """Simulation rejects action that exceeds node capacity."""

def test_simulation_is_deterministic():
    """Same plan + world state + seed always produces same result."""
```

#### Evaluation Harness
```python
# test_evaluation.py
def test_full_benchmark_runs_to_completion():
    """Full benchmark suite completes without error using mock provider."""

def test_benchmark_is_reproducible():
    """Two runs with same seed produce identical results."""

def test_benchmark_detects_regression():
    """Modified agent that produces worse plans fails regression tests."""

def test_evaluation_metrics_defined():
    """All required metrics (response_time, sla_preservation, etc.) are present."""
```

### 3.2 Integration Tests (pytest)

```python
# test_api.py
async def test_get_world_returns_200():
    """GET /api/world returns 200 with valid WorldStateSnapshot."""

async def test_post_scenario_creates_and_returns_201():
    """POST /api/scenarios creates scenario and returns 201."""

async def test_post_agents_run_returns_202():
    """POST /api/agents/run returns 202; plan arrives via WebSocket."""

async def test_approve_plan_mutates_world_state():
    """POST /api/plans/{id}/approve updates world state via simulation."""

async def test_reject_plan_logs_audit_entry():
    """POST /api/plans/{id}/reject creates audit log entry."""
```

### 3.3 Test Configuration

```python
# conftest.py
@pytest.fixture
def mock_ai_provider():
    return MockAIProvider(seed=42)

@pytest.fixture
async def test_db():
    # In-memory SQLite for unit/integration tests
    ...

@pytest.fixture
def synthetic_world():
    return SyntheticDataGenerator(seed=42).generate_network(
        suppliers=5, warehouses=3, fulfillment_centers=2, customers=10
    )
```

### 3.4 Run Commands

```bash
# Unit tests only
pytest backend/tests/ -m unit -v

# Integration tests (requires running DB + Redis or mocks)
pytest backend/tests/ -m integration -v

# Full suite with coverage
pytest backend/tests/ --cov=app --cov-report=html --cov-report=term-missing

# Type check
mypy backend/app/ --strict

# Lint
ruff check backend/
```

---

## 4. Frontend Tests

### 4.1 Unit Tests (Vitest + React Testing Library)

```typescript
// CommandCenter.test.tsx
describe('CommandCenter', () => {
  it('renders loading skeleton when data is loading')
  it('renders KPI cards when data is available')
  it('shows error banner on API error')
  it('updates risk score display when WebSocket event arrives')
})

// AgentCard.test.tsx
describe('AgentCard', () => {
  it('shows IDLE status by default')
  it('shows spinning indicator when status is RUNNING')
  it('renders proposal content when status is COMPLETE')
})

// PlanComparison.test.tsx
describe('PlanComparison', () => {
  it('renders radar chart with correct dimensions')
  it('highlights selected plan')
  it('calls approve mutation on button click')
})
```

### 4.2 Integration Tests (MSW)

- Mock all API endpoints with MSW handlers
- Test full screen render cycle: load → data → interaction
- Test WebSocket event handling via custom `WS` mock

### 4.3 End-to-End Tests (Playwright)

```typescript
// e2e/command-center.spec.ts
test('Command Center loads and shows network health', async ({ page }) => {
  await page.goto('/command')
  await expect(page.getByTestId('network-health-score')).toBeVisible()
  await expect(page.getByTestId('active-signals-count')).toBeVisible()
})

// e2e/agent-pipeline.spec.ts
test('Agent pipeline completes and shows ranked plans', async ({ page }) => {
  await page.goto('/scenarios')
  await page.getByTestId('create-scenario-btn').click()
  // ... compose scenario ...
  await page.getByTestId('run-agents-btn').click()
  await page.waitForSelector('[data-testid="ranked-plans"]', { timeout: 10000 })
  await expect(page.getByTestId('plan-card')).toHaveCount(3)
})

// Run against: 12 screens × happy path + error states
```

### 4.4 Accessibility Tests

```typescript
// accessibility.spec.ts
import { checkA11y } from 'axe-playwright'

test('Command Center passes axe accessibility audit', async ({ page }) => {
  await page.goto('/command')
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  })
})
// Run for all 12 screens
```

### 4.5 Visual Regression Tests

```typescript
// visual.spec.ts
test('Command Center visual regression', async ({ page }) => {
  await page.goto('/command')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot('command-center.png', { threshold: 0.05 })
})
```

---

## 5. Evaluation Harness

The evaluation harness is a deterministic benchmark suite that validates
end-to-end system behavior. All runs use `provider=mock` and `seed=42`.

### 5.1 Benchmark Scenarios

| ID | Scenario | Expected Result |
|----|---------|----------------|
| B001 | Single supplier disruption | ≥ 1 reroute action, SLA preservation ≥ 0.85 |
| B002 | Dual concurrent disruption | ≥ 3 plans ranked, adversary rating ≥ 0.5 |
| B003 | Port closure + demand spike | Coordinator proposes hybrid plan |
| B004 | No disruptions (baseline) | Risk scores < 0.2, no agent actions |
| B005 | Total supplier failure (worst case) | Adversary finds ≥ 1 CRITICAL vulnerability |

### 5.2 Evaluation Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `agent_response_time_p95` | 95th percentile agent pipeline duration | < 5s (mock) |
| `sla_preservation_mean` | Mean SLA preservation across all plans | > 0.80 |
| `adversary_detection_rate` | % of plans with ≥ 1 adversary finding | > 90% |
| `plan_feasibility_rate` | % of plans that pass constraint check | > 80% |
| `evaluation_determinism` | Hash of results matches expected | 100% |

---

## 6. Performance Tests

```bash
# Backend: 50 concurrent users, 2 minute load test
locust -f backend/tests/perf/locustfile.py --users 50 --spawn-rate 5 --run-time 120s

# 3D scene: FPS benchmark with 500 nodes
# Run via browser automation: Playwright + performance.mark/measure
```

---

## 7. Test Coverage Targets

| Layer | Target |
|-------|--------|
| Backend (unit) | 85% line coverage |
| Backend (integration) | All API endpoints covered |
| Frontend (unit) | 70% component coverage |
| E2E | All 12 screens + happy path |
| Accessibility | WCAG 2.1 AA (zero violations) |
| Evaluation harness | 100% deterministic |
