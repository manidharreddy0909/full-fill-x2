# FULFILL-X — Phase 16 Competition Demo Mode Specification

## 1. Executive Overview

**Phase 16 — Competition Demo Mode** provides a deterministic, guided, judge-facing presentation engine for FULFILL-X.
It enables live, offline-capable, step-by-step or fast-run demonstrations of the end-to-end intelligence pipeline:

```text
WORLD MODEL (Baseline State)
   ↓
RISK ENGINE (Signal Injection & Propagation)
   ↓
SPECIALIST AGENTS (6 Domain Proposals)
   ↓
COORDINATOR (Reconciliation & Trade-Offs)
   ↓
ADVERSARY (Red-Team Stress Testing)
   ↓
MULTI-OBJECTIVE PLANNER (Pareto Frontier Optimization)
   ↓
VERIFICATION ENGINE (Sandbox Deterministic Validation)
   ↓
HUMAN DECISION GATE (CSCO Authorization)
   ↓
REAL-TIME EVENT BUS (WebSocket Broadcasts)
   ↓
BENCHMARK EVALUATION (Phase 12 Scoring Engine)
```

---

## 2. Core Architectural Principles

1. **Zero Logic Duplication**: Demo Mode orchestrates pre-existing domain services (`CockpitService`, `EvaluationService`, `WorldRepository`, `RiskRepository`, `EventBus`) without duplicating business logic.
2. **100% Deterministic Guarantee**: Using fixed seed `42` (`DEMO-05: Full Resilience Challenge`), consecutive runs produce 100% identical outputs (`Run 1 == Run 2 == Run 3`).
3. **Offline AI Provider Ready**: Uses `MockAIProvider` by default, guaranteeing zero network dependency during competition live judging.
4. **State Immutability**: All step execution, adversary stress testing, and evaluation runs execute on temporary deep snapshot copies. Authoritative repositories remain 100% protected.

---

## 3. Demo State Machine (14 States)

```text
IDLE → INITIALIZING → OBSERVING → RISK_DETECTED → SCENARIO_GENERATED
   → SPECIALISTS_RUNNING → COORDINATING → ADVERSARY_RUNNING → OPTIMIZING
   → VERIFYING → AWAITING_APPROVAL → APPROVED / REJECTED → COMPLETED
                                  ↑ (PAUSED / CANCELLED / RESET)
```

---

## 4. Registered Competition Scenarios

| Scenario ID | Title | Disruption Type | Primary Showcase | Preset | Seed |
| --- | --- | --- | --- | --- | --- |
| `DEMO-01` | Supplier Shock | Supplier Disruption | No | `double_punch` | 42 |
| `DEMO-02` | Port Closure | Port Closure | No | `double_punch` | 42 |
| `DEMO-03` | Demand Surge | Demand Spike | No | `healthy` | 42 |
| `DEMO-04` | Compound Fulfillment Crisis | Multi-Vector Disruption | No | `double_punch` | 42 |
| `DEMO-05` | Full Resilience Challenge | Multi-Tiered Cascading Failure | **YES (Primary)** | `double_punch` | 42 |

---

## 5. API Catalog

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/demo/status` | GET | Fetch active session, engine health, and registered scenarios |
| `/api/demo/scenarios` | GET | List available competition demo scenarios |
| `/api/demo/start` | POST | Initialize and launch demo session (Step or Fast mode) |
| `/api/demo/step` | POST | Advance active session state machine by one stage |
| `/api/demo/pause` | POST | Pause active demo execution |
| `/api/demo/resume` | POST | Resume paused demo execution |
| `/api/demo/reset` | POST | Reset Demo engine and world state to clean baseline |
| `/api/demo/approve` | POST | Execute human approval gate and trigger benchmark evaluation |
| `/api/demo/reject` | POST | Execute human rejection gate |
| `/api/demo/session/{session_id}` | GET | Get current session details |
| `/api/demo/report/{session_id}` | GET | Generate structured JSON & Markdown competition presentation reports |

---

## 6. Generated Artifacts

Upon demo completion, two artifacts are written to `artifacts/demo/`:
- `artifacts/demo/demo_report.json`: Full machine-readable session dump including timeline, metrics, and approval records.
- `artifacts/demo/demo_report.md`: Clean Markdown report for competition judges.
