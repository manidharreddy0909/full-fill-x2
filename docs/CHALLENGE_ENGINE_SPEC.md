# FULFILL-X — Phase 4 Specification: Challenge Engine, Counterfactual Learning & Adaptive Autonomy

## 1. Overview & Purpose

The **Challenge Engine** marks the evolutionary transition of the Experiential Resilience Intelligence Platform from passive observational learning to **Active Learning**.

Rather than waiting for operational failures to occur in production, the Challenge Engine asks:
> *"We have learned this recovery Skill. Under what conditions would it fail?"*

It deliberately tests the boundaries, assumptions, dependency chains, and uncertainty limits of learned skills via controlled simulation, discovering new failure boundaries and feeding empirical evidence back into Hindsight without mutating authoritative world state or promoting simulated results to observed reality.

---

## 2. Core Architecture

```text
HINDSIGHT MEMORY (Past Episodes)
    ↓
EXPERIENTIAL GENOME (Verified Conditions & Boundaries)
    ↓
RESILIENCE SKILL (Versioned, Immutable Capability)
    ↓
CHALLENGE ENGINE (Targeted Hypothesis Probing)
    ↓
COUNTERFACTUAL SCENARIO (What-If Branching)
    ↓
SIMULATION (Isolated Digital Twin / Dynamics)
    ↓
SKILL SURVIVES / FAILS (Prediction vs Actual Calibration)
    ↓
NEW EVIDENCE (Strictly TruthStatus.SIMULATED)
    ↓
HINDSIGHT RETAIN (Simulated Memory Episode)
    ↓
SKILL EVOLUTION PROPOSAL (v1 remains immutable → v2/v3 proposed)
    ↓
ADAPTIVE AUTONOMY GOVERNANCE (Calibrated execution gates)
```

---

## 3. Challenge Scenario Families

| Scenario Type | Objective | Example |
|---|---|---|
| `BOUNDARY_TEST` | Probes immediately below and above known thresholds | Probe capacity at 38% and 42% against 40% threshold |
| `CAPACITY_DEGRADATION` | Removes precondition safety margin | Reduces supplier capacity by 60% |
| `DEPENDENCY_FAILURE` | Injects sudden outage on upstream dependency | Disables intermediate warehouse or chokepoint port |
| `TOPOLOGY_CHANGE` | Reroutes network flow through alternate hub | Adds intermediate transshipment hub with transit delay |
| `DEMAND_SURGE` | Tests volume surge limits | Spikes demand by 1.5x–2.0x |
| `STALE_EVIDENCE` | Tests aging supporting evidence | Evaluates skill when evidence is &gt; 90 days old |
| `CONFLICTING_EVIDENCE` | Introduces conflicting real-world feedback | Injects labor strike / port embargo reports |
| `NOVEL_CONDITION` | Unprecedented factor with zero prior evidence | Identifies `UNKNOWN` zone without hallucinating |

---

## 4. Controlled Gradient Boundary Probing

The engine supports bounded deterministic parameter probing (e.g. `[0.45, 0.42, 0.41, 0.40, 0.39, 0.37, 0.35]`).
- Probes step-by-step to pinpoint the exact transition point where a skill moves from applicable to unsafe.
- Generates discovered boundary recommendations (e.g. `capacity >= 0.40 required for recovery`).

---

## 5. Counterfactual Simulation Engine

The Counterfactual Engine answers two complementary questions under identical perturbed world states:
1. *"What would have happened if we used Skill A?"*
2. *"What would have happened if we used Alternative Strategy B (or Baseline inaction)?"*

- **Safety Invariant**: All counterfactual results are tagged with `TruthStatus.SIMULATED` and `is_simulation=True`.
- **Metrics Calculated**: Delta Service Level, Delta Recovery Hours, Delta Cost, and Comparative Trade-off Recommendation.

---

## 6. Active Learning & Uncertainty Zones

Every scenario is categorized into an uncertainty envelope:
- **`KNOWN`**: Strong empirical coverage (&gt;= 5 matching experiences) within verified envelope.
- **`PROBABLE`**: Moderate coverage (2–4 experiences), minor extrapolation.
- **`UNCERTAIN`**: Operating near failure boundaries (within 5%) or contradictory signals.
- **`UNKNOWN`**: Novel condition with zero historical coverage. The system explicitly declares `UNKNOWN`.

### Duplicate Test Avoidance via Hindsight Recall:
Before executing a new challenge, the engine queries `ExperienceRetriever.recall()`. If a past challenge with high similarity (&gt; 90%) exists, the past evidence is reused rather than running redundant tests.

---

## 7. Adaptive Autonomy Governance

Empirical challenge outcomes directly influence recommended operational autonomy:
- **`AUTO`**: Consistently high confidence (&gt;= 0.85), survived &gt;= 2 challenges, 0 recent failures.
- **`MONITOR`**: Baseline validity met; autonomous execution with telemetry monitoring.
- **`APPROVAL`**: High uncertainty, newly discovered failure boundary, or recent failure. Human sign-off mandatory.
- **`BLOCK`**: Critical boundary breach detected. Autonomy suspended until re-validated.

> **Invariant**: *Confidence != Authorization*. Existing governance engines and enterprise policies remain strictly authoritative.

---

## 8. Skill Immutability & Safe Evolution Flow

The Challenge Engine **never automatically mutates or rewrites an existing skill**.
When a challenge discovers a new boundary or failure:
1. Evidence is retained in Hindsight (`TruthStatus.SIMULATED`).
2. `SkillEvolutionEngine` generates a structured `SkillEvolutionProposal`.
3. The existing skill version ($v_1$ or $v_2$) remains **100% immutable**.
4. The proposed version requires explicit validation and governance approval before activation.

---

## 9. Measurable Tracking Outputs

The engine tracks quantitative metrics feeding Phase 5 evaluation:
- `challenge_count`
- `challenge_success_rate`
- `challenge_failure_rate`
- `boundary_discoveries`
- `unknown_scenarios`
- `prediction_error_avg_hours`
- `skill_versions_created`
- `evidence_reuse`
- `challenge_reuse`
