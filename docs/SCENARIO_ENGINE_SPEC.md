# FULFILL-X — Scenario Engine Specification

## 1. Purpose

Define how FULFILL-X composes multiple disruption signals into a coherent
compound scenario, simulates its effect on world state, and produces
a step-by-step propagation record for UI playback.

The Scenario Engine is **fully deterministic** given the same inputs and seed.

---

## 2. Pipeline

```
Baseline World State
   │
   ▼
[ScenarioComposer]
   │ Signal set + relationship + parameters
   ▼
ScenarioObject (draft)
   │
   ▼
[ScenarioValidator]
   │ Check: signals compatible, parameters in range
   ▼
[ScenarioSimulator]
   │ Apply scenario to a copy of world state
   ▼
PropagationSteps[] + RiskDelta + ScenarioState
   │
   ▼
ScenarioObject (SIMULATED status)
   │ Stored in PostgreSQL
   │ Served via GET /api/scenarios/{id}
```

---

## 3. Scenario Relationships

| Relationship | Description | Formula |
|-------------|-------------|---------|
| `CONCURRENT` | Both disruptions active simultaneously | risk = compose_compound([r1, r2]) |
| `CASCADING` | Disruption 1 triggers disruption 2 with delay | r2 activates after delay_hours |
| `AMPLIFYING` | Each disruption amplifies the other | risk = r1 * r2 * magnitude_multiplier |

---

## 4. ScenarioObject Schema

```python
class ScenarioObject(BaseModel):
    id: UUID
    name: str
    description: str
    signal_ids: list[UUID]
    relationship: ScenarioRelationship
    magnitude_multiplier: float = Field(ge=0.1, le=10.0, default=1.0)
    duration_hours: float = Field(gt=0.0, default=72.0)
    cascade_delay_hours: float = Field(ge=0.0, default=6.0)  # for CASCADING only

    # Computed after simulation
    affected_node_ids: list[str] = []
    propagation_steps: list[PropagationStep] = []
    risk_delta: NodeRiskScoresDelta | None = None
    baseline_network_health: float | None = None
    scenario_network_health: float | None = None

    created_at: datetime
    simulated_at: datetime | None = None
    status: ScenarioStatus  # DRAFT | SIMULATED | ACTIVE | RESOLVED
```

---

## 5. PropagationStep

Used by the frontend to animate the scenario effect step-by-step:

```python
class PropagationStep(BaseModel):
    step_index: int
    timestamp_offset_hours: float  # time offset from scenario start
    node_id: str
    risk_before: float
    risk_after: float
    trigger: str  # "direct_signal" | "propagated_from:{node_id}"
    hop: int
```

The frontend uses `propagation_steps` to animate the disruption wave in the 3D scene,
replaying each hop sequentially with 500ms delay per hop.

---

## 6. ScenarioSimulator

```python
class ScenarioSimulator:
    seed: int

    def simulate(
        self,
        scenario: ScenarioObject,
        signals: list[Signal],
        world_state: WorldStateSnapshot,
    ) -> SimulationResult:
        """
        1. Copy world state (no mutation)
        2. Apply each signal's risk delta to copy
        3. Run RiskEngine.propagate() on the copy
        4. Record each step as PropagationStep
        5. Compute risk_delta = after - before
        6. Return SimulationResult with propagation_steps
        """
```

The simulator operates on a **copy** of world state. The authoritative
world state is NOT mutated by scenario simulation.
World state is only mutated when a plan is approved via Decision Cockpit.

---

## 7. Validation Rules

| Rule | Check |
|------|-------|
| Signals exist | All `signal_ids` refer to existing, active signals |
| Magnitude range | `magnitude_multiplier` in [0.1, 10.0] |
| Duration range | `duration_hours` in (0, 720] |
| Non-empty | At least 1 signal |
| Compatibility | AMPLIFYING requires ≥ 2 overlapping affected_node_ids |
| No duplicate signals | Same signal cannot appear twice |

---

## 8. Deterministic Replay

Any scenario can be replayed deterministically:
- Given the same `scenario_id`, the simulation always produces the same output
- `SIMULATION_SEED` from env determines any tie-breaking
- Propagation step timestamps are deterministic

This is critical for:
- Evaluation harness reproducibility
- Demo mode reliability
- Audit log verification

---

## 9. API

```
GET /api/scenarios
  → list[ScenarioSummary]

POST /api/scenarios
  Request: {name, signal_ids, relationship, magnitude_multiplier, duration_hours}
  Response 201: ScenarioObject (status=DRAFT)

GET /api/scenarios/{id}
  → ScenarioObject (with propagation_steps if SIMULATED)

POST /api/scenarios/{id}/simulate
  Response 200: SimulationResult (updates scenario to SIMULATED status)

POST /api/scenarios/{id}/activate
  → Marks scenario as ACTIVE; triggers agent pipeline
  Response 202: accepted, WebSocket delivers updates
```

---

## 10. WebSocket Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `scenario.created` | POST /api/scenarios | ScenarioSummary |
| `scenario.simulated` | POST /api/scenarios/{id}/simulate | SimulationResult |
| `scenario.propagation_step` | During simulation (streaming) | PropagationStep |
| `scenario.activated` | POST /api/scenarios/{id}/activate | ScenarioObject |

---

## 11. Frontend Representation

**Scenario Lab screen**:
- React Flow canvas: signal nodes → relationship arrow → scenario node
- Parameters panel: relationship, magnitude, duration controls
- After simulation: mini-3D embed plays propagation animation
- Risk delta summary: "SLA risk: 0.20 → 0.72 (+0.52)"

---

## 12. 3D Representation

Propagation animation sequence:
1. `scenario.propagation_step` events arrive from WebSocket
2. Frontend queues steps by `timestamp_offset_hours`
3. Each step triggers disruption wave at `node_id`
4. Steps play back at 500ms per hop in the mini-3D embed on Scenario Lab
5. On full 3D World Model screen: full animation at 1s per hop

---

## 13. Failure Mode

| Failure | Response |
|---------|---------|
| No signals in scenario | 422: "At least one signal required" |
| AMPLIFYING with non-overlapping signals | 422: "Amplifying requires overlapping affected nodes" |
| Simulation engine error | 500: ScenarioObject remains DRAFT; error logged |
| DB write failure | 503; retry 3x with backoff |

---

## 14. Tests

```python
# test_scenario_engine.py

def test_concurrent_scenario_composition():
    """Two signals → CONCURRENT ScenarioObject with union of affected nodes."""

def test_risk_delta_is_positive():
    """Scenario risk_delta shows net increase vs. baseline."""

def test_amplifying_requires_overlapping_nodes():
    """AMPLIFYING with non-overlapping signals raises validation error."""

def test_simulation_is_deterministic():
    """Same scenario + same seed → identical propagation_steps."""

def test_propagation_steps_ordered_by_hop():
    """PropagationSteps sorted by hop (0 first, max_hops last)."""

def test_cascading_delays_second_signal():
    """CASCADING scenario has step at t=0 and step at t=cascade_delay_hours."""

def test_scenario_does_not_mutate_world_state():
    """After simulation, authoritative world state is unchanged."""
```
