# FULFILL-X — API Catalog

## 1. Purpose

Map every UI operation to a backend API. For every endpoint document:
method, path, purpose, request, response, errors, domain service, and frontend consumer.

**Inconsistency Correction (ADR-013)**: `API_SPEC.md` line 72 returns `"risk_score": 0.72`
(flat float). This is inconsistent with `DATA_MODEL.md` which defines `NodeRiskScores`
as a multi-dimensional object. The corrected response uses `NodeRiskScores`.

---

## 2. API Overview

| Group | Count | Base Path |
|-------|-------|-----------|
| World Model | 5 | `/api/world` |
| Signals | 4 | `/api/signals` |
| Risks | 3 | `/api/risks` |
| Scenarios | 5 | `/api/scenarios` |
| Agents | 3 | `/api/agents` |
| Plans | 5 | `/api/plans` |
| Evaluation | 3 | `/api/evaluation` |
| System | 4 | `/api/system` |
| **Total** | **32** | |

---

## 3. World Model Endpoints

### GET /api/world

| Field | Value |
|-------|-------|
| **Purpose** | Full world state snapshot |
| **Auth** | None (Phase 01) |
| **Domain Service** | `WorldModelEngine.get_snapshot()` |
| **Frontend** | Command Center KPIs, 3D WorldScene |
| **Cache** | Redis (60s TTL; invalidated on world.update) |

**Response 200**:
```json
{
  "data": {
    "snapshot_id": "uuid",
    "timestamp": "ISO-8601",
    "network_health_score": 0.58,
    "nodes": [
      {
        "id": "sup-001",
        "type": "SUPPLIER",
        "name": "Apex Electronics",
        "tier": 1,
        "position": { "x": 1.2, "y": 0.8, "z": -0.3 },
        "risk_scores": {
          "composite": 0.88,
          "financial": 0.72,
          "sla": 0.80,
          "operational": 0.90,
          "sustainability": 0.45
        },
        "inventory_level": 0.45,
        "is_disrupted": true,
        "disruption_source_ids": ["sig-typhoon-001"],
        "region": "APAC"
      }
    ],
    "edges": [
      {
        "id": "rt-001",
        "type": "ROUTE",
        "source_node_id": "sup-001",
        "target_node_id": "wh-001",
        "transport_mode": "SEA",
        "load": 0.91,
        "delay_hours": 48.0,
        "is_disrupted": true,
        "emissions_per_unit": 2.4
      }
    ]
  }
}
```

**Error**:
```json
{ "error": { "code": "WORLD_UNAVAILABLE", "message": "Database unreachable; serving stale snapshot" } }
```

---

### GET /api/world/nodes/{node_id}

| Field | Value |
|-------|-------|
| **Purpose** | Single node detail with full attributes |
| **Domain Service** | `WorldModelEngine.get_node(node_id)` |
| **Frontend** | Node Inspector panel (3D screen), Risk Explorer detail |

**Response 200**: Full `WorldNode` object including `inventory_records`, `outgoing_edges`.

**Error 404**: `{ "error": { "code": "NODE_NOT_FOUND" } }`

---

### GET /api/world/edges/{edge_id}

| Field | Value |
|-------|-------|
| **Purpose** | Single edge detail |
| **Domain Service** | `WorldModelEngine.get_edge(edge_id)` |
| **Frontend** | Edge detail panel (3D screen) |

---

### POST /api/world/seed

| Field | Value |
|-------|-------|
| **Purpose** | Seed the world with synthetic data |
| **Request** | `{ "preset": "double_punch" \| "healthy" \| "custom", "seed": 42 }` |
| **Domain Service** | `SyntheticDataGenerator.generate_and_persist()` |
| **Frontend** | System Status screen (admin action) |
| **Notes** | Clears all existing world data; use in demo mode only |

---

### POST /api/world/reset

| Field | Value |
|-------|-------|
| **Purpose** | Reset world to last seeded state |
| **Frontend** | System Status screen (demo reset) |

---

## 4. Signal Endpoints

### GET /api/signals

| Field | Value |
|-------|-------|
| **Purpose** | List all active signals |
| **Query Params** | `severity`, `type`, `region`, `status`, `limit`, `offset` |
| **Domain Service** | `SignalIngestor.list_signals()` |
| **Frontend** | Signal Intelligence screen |

**Response 200**:
```json
{
  "data": {
    "signals": [
      {
        "id": "sig-001",
        "type": "WEATHER",
        "severity": "CRITICAL",
        "confidence": 0.94,
        "title": "Typhoon Hana — Port of Osaka",
        "description": "...",
        "affected_node_ids": ["wh-001", "port-001"],
        "geographic_scope": { "type": "Point", "coordinates": [135.5, 34.5] },
        "detected_at": "ISO-8601",
        "status": "ACTIVE"
      }
    ],
    "total": 7,
    "active_critical": 2
  }
}
```

---

### GET /api/signals/{signal_id}

| Field | Value |
|-------|-------|
| **Purpose** | Single signal detail |
| **Frontend** | Signal detail panel |

---

### POST /api/signals

| Field | Value |
|-------|-------|
| **Purpose** | Inject a synthetic signal (demo/test only) |
| **Request** | `Signal` create schema |
| **Domain Service** | `SignalIngestor.ingest()` |
| **Frontend** | Admin: Signal Intelligence (not exposed in production) |
| **Side Effects** | Triggers Risk Engine recompute; broadcasts `signal.detected` |

---

### PATCH /api/signals/{id}/resolve

| Field | Value |
|-------|-------|
| **Purpose** | Mark signal as resolved |
| **Domain Service** | `SignalIngestor.resolve(signal_id)` |
| **Side Effects** | Triggers Risk Engine recompute |

---

## 5. Risk Endpoints

### GET /api/risks

| Field | Value |
|-------|-------|
| **Purpose** | Full risk score map for all nodes |
| **Domain Service** | `RiskEngine.get_current_map()` |
| **Frontend** | Risk Explorer (table + heat map) |

**Response 200**:
```json
{
  "data": {
    "computed_at": "ISO-8601",
    "network_health_score": 0.58,
    "nodes": [
      {
        "node_id": "sup-001",
        "risk_scores": { "composite": 0.88, "financial": 0.72, ... },
        "explanation": {
          "contributing_signals": [{ "signal_id": "sig-001", "contribution": 0.72 }],
          "propagated_from": [],
          "dominant_dimension": "operational"
        }
      }
    ]
  }
}
```

---

### GET /api/risks/nodes/{node_id}

| Field | Value |
|-------|-------|
| **Purpose** | Detailed risk for one node including explanation |
| **Frontend** | Risk Explorer node detail, Decision Cockpit evidence |

---

### GET /api/risks/network

| Field | Value |
|-------|-------|
| **Purpose** | Network-level summary (health score + top risks) |
| **Frontend** | Command Center KPIs |

---

## 6. Scenario Endpoints

### GET /api/scenarios

| Field | Value |
|-------|-------|
| **Purpose** | List all scenarios |
| **Frontend** | Scenario Lab dropdown |

---

### POST /api/scenarios

| Field | Value |
|-------|-------|
| **Purpose** | Create a new scenario |
| **Request** | `{ name, signal_ids[], relationship, magnitude_multiplier, duration_hours }` |
| **Response 201** | `ScenarioObject` (status=DRAFT) |
| **Side Effects** | Broadcasts `scenario.created` |

---

### GET /api/scenarios/{id}

| Field | Value |
|-------|-------|
| **Purpose** | Full scenario with propagation steps |
| **Frontend** | Scenario Lab detail |

---

### POST /api/scenarios/{id}/simulate

| Field | Value |
|-------|-------|
| **Purpose** | Simulate scenario against current world |
| **Response 200** | `SimulationResult` (propagation_steps, risk_delta) |
| **Side Effects** | Streams `scenario.propagation_step` events via WebSocket |

---

### POST /api/scenarios/{id}/activate

| Field | Value |
|-------|-------|
| **Purpose** | Activate scenario and optionally trigger agent run |
| **Request** | `{ run_agents: bool, provider: str }` |
| **Response 202** | accepted |

---

## 7. Agent Endpoints

### POST /api/agents/run

| Field | Value |
|-------|-------|
| **Purpose** | Run full agent pipeline |
| **Request** | `{ scenario_id: uuid, provider: str, weights: dict }` |
| **Response 202** | `{ run_id: uuid }` (accepted; updates via WebSocket) |
| **Domain Service** | `AgentOrchestrator.run_pipeline()` |
| **Frontend** | Agent War Room |
| **WebSocket** | Streams: `agent.started`, `agent.proposal`, `coordinator.updated`, `adversary.attack`, `plan.ranked` |

---

### GET /api/agents/run/{run_id}

| Field | Value |
|-------|-------|
| **Purpose** | Status of a running or completed agent pipeline |
| **Frontend** | Agent War Room (polling fallback if WebSocket disconnected) |

---

### GET /api/agents/run/{run_id}/proposals

| Field | Value |
|-------|-------|
| **Purpose** | All agent proposals from a completed run |
| **Frontend** | Agent War Room detail |

---

## 8. Plan Endpoints

### GET /api/plans

| Field | Value |
|-------|-------|
| **Purpose** | List all ranked plans from last agent run |
| **Frontend** | Plan Comparison |

**Response 200**:
```json
{
  "data": {
    "plans": [
      {
        "id": "plan-001",
        "rank": 1,
        "name": "Best SLA",
        "composite_score": 0.82,
        "final_score": 0.81,
        "sla_preservation": 0.91,
        "cost_delta": 42000,
        "emissions_delta_percent": 12,
        "fragility_delta": -0.20,
        "adversary_rating": 0.81,
        "adversary_findings_count": 2,
        "status": "PROPOSED"
      }
    ]
  }
}
```

---

### GET /api/plans/{plan_id}

| Field | Value |
|-------|-------|
| **Purpose** | Full plan detail including actions and adversary findings |
| **Frontend** | Plan Comparison detail, Decision Cockpit |

---

### GET /api/plans/{plan_id}/adversary

| Field | Value |
|-------|-------|
| **Purpose** | Adversary findings for a plan |
| **Frontend** | Adversary Attack screen |

---

### POST /api/plans/{plan_id}/adversary/run

| Field | Value |
|-------|-------|
| **Purpose** | Re-run adversary on a specific plan |
| **Frontend** | Adversary Attack screen (re-run button) |
| **Response 202** | accepted; updates via WebSocket |

---

### POST /api/plans/{plan_id}/approve

| Field | Value |
|-------|-------|
| **Purpose** | Approve a plan → apply to world state |
| **Request** | `{ note: str, approver: str }` |
| **Response 200** | `{ plan_id, applied_at, world_snapshot_after }` |
| **Domain Service** | `Orchestrator.approve_plan()` → `SimulationEngine.apply()` → `WorldModelEngine.mutate()` |
| **Side Effects** | World state mutation, audit log entry, `plan.accepted` + `world.update` events |
| **Frontend** | Decision Cockpit |

### POST /api/plans/{plan_id}/reject

| Field | Value |
|-------|-------|
| **Purpose** | Reject a plan |
| **Request** | `{ reason: str }` |

---

### POST /api/evaluation/stress

| Field | Value |
|-------|-------|
| **Purpose** | Run stress test on a plan |
| **Request** | `{ plan_id, stressors: list[str] }` |
| **Response 202** | accepted; streams `stress-test.progress` events |
| **Frontend** | Stress Test screen |

---

## 9. Evaluation Endpoints

### GET /api/evaluation/suites

| Field | Value |
|-------|-------|
| **Purpose** | List available benchmark suites |
| **Frontend** | Evaluation screen |

---

### POST /api/evaluation/run

| Field | Value |
|-------|-------|
| **Purpose** | Run benchmark suite |
| **Request** | `{ suite_id, provider: "mock", seed: 42 }` |
| **Response 202** | `{ run_id }` |
| **Frontend** | Evaluation screen |

---

### GET /api/evaluation/results/{run_id}

| Field | Value |
|-------|-------|
| **Purpose** | Results of an evaluation run |
| **Frontend** | Evaluation screen results |

---

## 10. System Endpoints

### GET /api/system/health

| Field | Value |
|-------|-------|
| **Purpose** | System health check (used by ALB, smoke tests) |
| **Response 200** | `{ status: "HEALTHY" \| "DEGRADED", services: {...} }` |
| **Auth** | None (public) |

---

### GET /api/system/providers

| Field | Value |
|-------|-------|
| **Purpose** | AI provider status |
| **Frontend** | System Status screen |

---

### POST /api/system/providers/switch

| Field | Value |
|-------|-------|
| **Purpose** | Switch active AI provider |
| **Request** | `{ provider: "gemini" \| "ollama" \| "bedrock" \| "mock" }` |
| **Frontend** | System Status screen |

---

### GET /api/system/audit

| Field | Value |
|-------|-------|
| **Purpose** | Audit log (last 50 entries) |
| **Frontend** | Decision Cockpit (history panel) |

---

## 11. API→Frontend Mapping Summary

| Screen | Primary APIs |
|--------|-------------|
| Command Center | GET /api/world, GET /api/risks/network, GET /api/signals |
| 3D World Model | GET /api/world |
| Signal Intelligence | GET /api/signals, GET /api/signals/{id} |
| Risk Explorer | GET /api/risks, GET /api/risks/nodes/{id} |
| Scenario Lab | GET/POST /api/scenarios, POST /api/scenarios/{id}/simulate |
| Agent War Room | POST /api/agents/run, GET /api/agents/run/{id} |
| Plan Comparison | GET /api/plans, GET /api/plans/{id} |
| Adversary Attack | GET /api/plans/{id}/adversary, POST .../adversary/run |
| Stress Test | POST /api/evaluation/stress |
| Decision Cockpit | GET /api/plans/{id}, POST /api/plans/{id}/approve|reject |
| Evaluation | GET /api/evaluation/suites, POST /api/evaluation/run |
| System Status | GET /api/system/health, GET /api/system/providers |

---

## 12. Adversary Endpoints (Phase 07)

### GET /api/adversary/status
| Field | Value |
|-------|-------|
| **Purpose** | Check status and supported attack taxonomy of Adversary Engine |
| **Response** | `AdversaryStatus` schema |
| **Frontend** | Specialist War Room -> Adversary Red-Team Tab |

### POST /api/adversary/run
| Field | Value |
|-------|-------|
| **Purpose** | Run deterministic Adversary analysis on candidate plans |
| **Request** | `AdversaryRunRequest` (candidate_plans, coordination_id, seed) |
| **Response** | `AdversaryReport` schema |
| **Frontend** | Specialist War Room -> Run Adversary Red-Team Action |

### POST /api/adversary/stress-test
| Field | Value |
|-------|-------|
| **Purpose** | Stress test specific candidate plan against custom attack injection |
| **Request** | `StressTestRequest` (candidate_plan, attack) |
| **Response** | `PlanStressResult` schema |
| **Frontend** | Custom Attack Injection Panel |

### POST /api/adversary/attack-suite
| Field | Value |
|-------|-------|
| **Purpose** | Generate and preview deterministic attack suite |
| **Request** | `AdversaryRunRequest` |
| **Response** | `List[AdversaryAttack]` |
| **Frontend** | Attack Suite Tab |

### GET /api/adversary/findings
| Field | Value |
|-------|-------|
| **Purpose** | Retrieve latest generated adversary findings report |
| **Response** | `AdversaryReport` |
| **Frontend** | Adversary Findings View |

---

## 13. Planner Endpoints (Phase 08)

### GET /api/planner/status
| Field | Value |
|-------|-------|
| **Purpose** | Check status, tracked objectives, and constraint rules of Multi-Objective Planner Engine |
| **Response 200** | `{ status: "READY", engine_version: "1.0.0", tracked_objectives: [...], hard_constraints: [...], soft_constraints: [...] }` |
| **Frontend** | Specialist War Room -> Planner Board Tab |

---

### POST /api/planner/run
| Field | Value |
|-------|-------|
| **Purpose** | Run full multi-objective optimization, constraint checks, baseline/robust Pareto frontiers, sensitivity sweeps, and trade-off profiles |
| **Request** | `{ candidate_plans: [...], adversary_report: {...}, coordination_id: "..." }` |
| **Response 200** | `PlannerReport` schema |
| **Frontend** | Specialist War Room -> Run Multi-Objective Planner Action |

---

### POST /api/planner/pareto
| Field | Value |
|-------|-------|
| **Purpose** | Calculate Baseline and Robust Pareto Frontiers for custom plan sets |
| **Request** | `{ candidate_plans: [...], adversary_report: {...} }` |
| **Response 200** | `{ baseline_frontier: ParetoFrontier, robust_frontier: ParetoFrontier }` |
| **Frontend** | Pareto Frontier Analysis view |

---

### POST /api/planner/sensitivity
| Field | Value |
|-------|-------|
| **Purpose** | Run sensitivity sweeps across cost, disruption, and demand factors |
| **Request** | `{ candidate_plans: [...], sweep_variables: [...] }` |
| **Response 200** | `{ sensitivity_results: List[PlanSensitivityItem] }` |
| **Frontend** | Sensitivity Sweeps Chart |

---

### GET /api/planner/report
| Field | Value |
|-------|-------|
| **Purpose** | Retrieve latest generated Multi-Objective Planner evaluation report |
| **Response 200** | `PlannerReport` schema |
| **Frontend** | Specialist War Room -> Multi-Objective Planner Tab |

---

## 14. Verification & Validation Endpoints (Phase 09)

### GET /api/verification/status
| Field | Value |
|-------|-------|
| **Purpose** | Get active status, version, and health of the Verification & Validation Engine |
| **Response 200** | `VerificationStatusResponse` schema (`{ status, active_verifications, memory_snapshot_isolation: true, version }`) |
| **Frontend** | Specialist War Room -> Verification Tab |

---

### POST /api/verification/run
| Field | Value |
|-------|-------|
| **Purpose** | Execute deterministic verification and sandbox simulation on candidate plans |
| **Request** | `VerificationRequest` (`{ plans: List[ExecutionPlan], include_simulation: true }`) |
| **Response 200** | `VerificationReport` schema (`{ verification_id, plan_id, status: VERIFIED/CONDITIONAL/REJECTED, pass_rate, state_diff, findings, validation_checks }`) |
| **Frontend** | Specialist War Room -> Verification Board (Run Verification Simulation) |

---

### POST /api/verification/simulate
| Field | Value |
|-------|-------|
| **Purpose** | Run isolated sandbox execution simulation for a single execution plan |
| **Request** | `ExecutionPlan` schema |
| **Response 200** | `SimulationResult` schema (`{ plan_id, pass_rate, state_diff, findings, capacity_checks, route_checks, inventory_checks, dependency_checks, risk_checks, constraint_checks }`) |
| **Frontend** | Sandbox Simulator View |

---

### GET /api/verification/report
| Field | Value |
|-------|-------|
| **Purpose** | Retrieve latest cached or active verification report for a plan ID |
| **Request Query** | `?plan_id=plan-candidate-a` |
| **Response 200** | `VerificationReport` schema |
| **Frontend** | Verification Board Detail View |

---

## 15. Decision Cockpit & Workflow Orchestration Endpoints (Phase 10)

### GET /api/cockpit/status
| Field | Value |
|-------|-------|
| **Purpose** | Check status, active sessions count, and immutability safety guarantee |
| **Response 200** | `CockpitStatusResponse` schema |
| **Frontend** | Decision Cockpit Header |

---

### POST /api/cockpit/session
| Field | Value |
|-------|-------|
| **Purpose** | Create a new decision cockpit session for a preset & seed |
| **Request** | `SessionCreateRequest` (`{ preset_name: "double_punch", seed: 42 }`) |
| **Response 200** | `DecisionSession` schema |
| **Frontend** | Decision Cockpit (Initialization) |

---

### GET /api/cockpit/session/{session_id}
| Field | Value |
|-------|-------|
| **Purpose** | Retrieve complete state of an active decision session |
| **Response 200** | `DecisionSession` schema |
| **Frontend** | Decision Cockpit Board |

---

### POST /api/cockpit/session/{session_id}/run
| Field | Value |
|-------|-------|
| **Purpose** | Execute full 8-stage decision workflow loop end-to-end |
| **Response 200** | `DecisionSession` schema |
| **Frontend** | Decision Cockpit ("RUN FULL DECISION LOOP" button) |

---

### POST /api/cockpit/session/{session_id}/stage
| Field | Value |
|-------|-------|
| **Purpose** | Step through a single workflow stage |
| **Request** | `{ target_stage: "COORDINATING" }` |
| **Response 200** | `DecisionSession` schema |
| **Frontend** | Timeline Stage Item Click |

---

### POST /api/cockpit/session/{session_id}/approve
| Field | Value |
|-------|-------|
| **Purpose** | Log human approval decision for a candidate plan |
| **Request** | `SessionApproveRequest` (`{ plan_id: "candidate-a", approver: "CSO", rationale: "Verified" }`) |
| **Response 200** | `DecisionSession` schema |
| **Frontend** | Human Approval Gate ("APPROVE PLAN" button) |

---

### POST /api/cockpit/session/{session_id}/reject
| Field | Value |
|-------|-------|
| **Purpose** | Log human rejection decision for a candidate plan |
| **Request** | `SessionRejectRequest` (`{ plan_id: "candidate-b", approver: "CSO", rationale: "Infeasible" }`) |
| **Response 200** | `DecisionSession` schema |
| **Frontend** | Human Approval Gate ("REJECT PLAN" button) |

---

### POST /api/cockpit/session/{session_id}/reset
| Field | Value |
|-------|-------|
| **Purpose** | Reset decision session state to clean initial observation |
| **Response 200** | `DecisionSession` schema |
| **Frontend** | Decision Cockpit Header ("Reset Session" button) |

---

## 16. Real-Time WebSocket Endpoints (Phase 11)

### WS /ws
| Field | Value |
|-------|-------|
| **Purpose** | Global WebSocket connection endpoint for real-time live operational event streams |
| **Protocol** | `ws://` / `wss://` |
| **Outbound Frame** | `EventEnvelope` (`{ event_id, event_type, sequence, timestamp, source, severity, payload }`) |
| **Inbound Action** | `ClientWsMessage` (`{ action: "PING" / "SUBSCRIBE" / "UNSUBSCRIBE" }`) |
| **Frontend** | RealtimeStore (`RealtimeWebSocketClient`) |

---

---

## 17. Evaluation Harness & Benchmark Endpoints (Phase 12)

### GET /api/evaluation/status
| Field | Value |
|-------|-------|
| **Purpose** | Retrieve evaluation harness status, total scenarios registered, and latest overall score |
| **Response 200** | `EvaluationStatusResponse` |
| **Frontend** | Evaluation Dashboard & Cockpit summary bar |

---

### GET /api/evaluation/scenarios
| Field | Value |
|-------|-------|
| **Purpose** | List all 8 registered benchmark scenarios and ground truths |
| **Response 200** | `List[BenchmarkScenario]` |
| **Frontend** | Evaluation Dashboard scenario selector |

---

### POST /api/evaluation/run
| Field | Value |
|-------|-------|
| **Purpose** | Execute a single benchmark scenario on isolated graph state |
| **Request** | `{ "scenario_id": "SCENARIO-01", "seed": 42 }` |
| **Response 200** | `EvaluationRun` |
| **Frontend** | Evaluation Dashboard ("Run Selected Scenario" button) |

---

### POST /api/evaluation/run-all
| Field | Value |
|-------|-------|
| **Purpose** | Run complete benchmark suite across all 8 registered scenarios |
| **Request** | `{ "benchmark_id": "BENCHMARK-V1" }` |
| **Response 200** | `EvaluationReport` |
| **Frontend** | Evaluation Dashboard ("Run Full Benchmark Suite" button) |

---

### GET /api/evaluation/runs
| Field | Value |
|-------|-------|
| **Purpose** | List historical benchmark evaluation runs |
| **Response 200** | `List[EvaluationRun]` |

---

### GET /api/evaluation/report
| Field | Value |
|-------|-------|
| **Purpose** | Retrieve latest benchmark evaluation report |
| **Response 200** | `EvaluationReport` |

---

### POST /api/evaluation/compare
| Field | Value |
|-------|-------|
| **Purpose** | Compare baseline evaluation run against target evaluation run |
| **Request** | `{ "baseline_run_id": "run-01", "target_run_id": "run-02" }` |
| **Response 200** | `BenchmarkComparison` |

---

## 18. Health & Readiness Endpoints (Phase 13 / Phase 14 AWS)

### GET /health
| Field | Value |
|-------|-------|
| **Purpose** | Lightweight Liveness Probe for Docker / AWS ALB probes |
| **Response 200** | `{ "status": "ok", "version": "0.15.0", "environment": "production", "timestamp": "ISO-8601" }` |

---

### GET /api/health
| Field | Value |
|-------|-------|
| **Purpose** | Deep Readiness Probe inspecting WorldRepository, RiskRepository, AWS Bedrock and AI Provider Factory |
| **Response 200/503** | `ReadinessResponse` |





