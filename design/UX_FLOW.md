# FULFILL-X — UX Flow

## 1. Purpose

Define the complete user experience flows for all personas across
all 12 screens. This is the definitive source for navigation, decision
paths, and state transitions from the user's perspective.

## 2. Primary UX Flows

### Flow 1: Director — Morning Operational Check

```
Login / App Load
    └── Command Center (default)
        ├── Sees network health: DEGRADED (0.58)
        ├── Sees 2 active critical signals in feed
        ├── Clicks "View 3D World"
        │   └── 3D World Model
        │       ├── Observes disruption wave on Osaka
        │       ├── Clicks affected warehouse node
        │       ├── Reads node inspector (risk 0.82, inventory 0.45)
        │       └── Clicks "Run Agent Response"
        │           └── [Navigate to Agent War Room]
        └── Agent War Room
            ├── Monitors all 6 specialist agents running
            ├── Reads proposals as they complete
            └── Clicks "View Plans"
                └── Plan Comparison
                    ├── Compares 3 ranked plans
                    ├── Reads adversary findings per plan
                    ├── Selects Plan B
                    └── Clicks "Go to Decision Cockpit"
                        └── Decision Cockpit
                            ├── Reviews Plan B full summary
                            ├── Types approval note
                            └── Clicks "Approve" → Plan applied
```

---

### Flow 2: Analyst — Compound Scenario Modeling

```
Signal Intelligence
    ├── Filters by CRITICAL severity
    ├── Reads Signal 1 (Typhoon, confidence 0.94)
    ├── Reads Signal 2 (Factory Fire, confidence 0.88)
    ├── Selects both signals
    └── Clicks "Build Scenario"
        └── Scenario Lab
            ├── Signals appear on scenario canvas
            ├── Sets relationship: CONCURRENT
            ├── Sets magnitude: 1.2×
            ├── Sets duration: 72 hours
            ├── Clicks "Simulate"
            │   └── Risk wave animates on mini-3D embed
            │   └── Risk delta: SLA 0.20 → 0.72
            └── Clicks "Run Agents"
                └── Agent War Room (→ continue in Flow 1)
```

---

### Flow 3: Analyst — Post-Incident Evaluation

```
Evaluation
    ├── Sees previous benchmark run results
    ├── Selects "B002 - Dual Concurrent Disruption"
    ├── Clicks "Run Test"
    │   └── Test runs with mock provider + seed 42
    │   └── Results tick green: 21/23 pass
    └── Clicks on failed test
        └── Test detail: expected SLA ≥ 0.85, got 0.79
            └── Analyst notes and reports to engineering
```

---

### Flow 4: Director — Adversarial Deep Dive

```
Plan Comparison
    ├── Sees Plan A ranked #1 (composite 0.82)
    ├── Sees adversary rating: 0.81
    ├── Clicks "View Adversary Attack" on Plan A
    └── Adversary Attack screen
        ├── Attack tree visualizes 3 findings
        ├── Finding: "Alternative Manila route collapses under 20% demand spike"
        │   Severity: HIGH, Probability: 0.52
        ├── Director: "acceptable risk — proceed"
        └── Returns to Decision Cockpit to approve Plan A
```

---

### Flow 5: Analyst — Stress Test

```
Stress Test
    ├── Selects Plan B
    ├── Configures stressors:
    │   ├── Additional port closure: 20%
    │   ├── Demand spike: +15%
    │   └── Air freight capacity reduction: -30%
    ├── Clicks "Run Stress Test"
    │   └── Progress bar: 0% → 100% (10 stressors)
    └── Results:
        ├── Plan B survives 7/10 stressor combinations
        ├── Collapses under extreme triple-hit (2.1% probability)
        └── Analyst exports report and returns to Plan Comparison
```

---

## 3. Navigation Map

```
Command Center ←→ 3D World Model
      ↕
Signal Intelligence → Scenario Lab → Agent War Room → Plan Comparison → Decision Cockpit
                                                               ↕
                                                       Adversary Attack
                                                               ↕
                                                        Stress Test
                      Evaluation ←→ System Status
```

All screens accessible from sidebar at any time.

---

## 4. Error Recovery Flows

### WebSocket Disconnection
```
WebSocket Status Indicator: RED
    └── Auto-reconnect (3 attempts, exponential backoff)
        ├── Reconnected: Status GREEN, resumes live updates
        └── Failed: "Reconnect" button shown; API polling fallback (5s interval)
```

### Agent Timeout
```
Agent Card: TIMEOUT status (amber)
    └── "Retry Agent" button shown
        └── Click → dispatch single agent again
```

### AI Provider Unavailable
```
System Status: Provider DEGRADED
    └── Automatic fallback: Gemini → Ollama → Mock
    └── Banner: "Using fallback provider: Mock"
```

## 5. Empty States

| Screen | Empty Condition | Empty State Content |
|--------|----------------|---------------------|
| Command Center | No signals | "Network Stable — No Active Signals" + illustration |
| Signal Intelligence | No signals | "No Signals Matching Filters" + clear filters button |
| Agent War Room | No scenario | "Select or Create a Scenario to Run Agents" |
| Plan Comparison | No plans | "Run the Agent Pipeline to Generate Plans" |
| Evaluation | No runs | "No Benchmark Runs Yet — Click Run" |

## 6. Loading States

All screens use skeleton components (shimmer animation) while data loads.
Loading skeletons match the shape of the actual content to minimize layout shift.

## 7. Accessibility Flows

- All screens navigable via keyboard (Tab + Arrow keys)
- All interactive elements have focus rings (`ring-2 ring-accent-primary`)
- All status changes announced via `aria-live="polite"` regions
- 3D scene has a keyboard-navigable 2D fallback list
