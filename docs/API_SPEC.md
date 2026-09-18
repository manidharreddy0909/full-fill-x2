# FULFILL-X — API Specification

## 1. Purpose

Define all REST and WebSocket API contracts between the frontend and
backend. These contracts are stable interfaces; breaking changes require
a version bump.

## 2. Base URL

```
Development:  http://localhost:8000
Production:   https://api.fulfill-x.example.com
```

## 3. Authentication

Phase 01 (MVP): No authentication (internal demo only).
Phase 12 (Production): Bearer token (AWS Cognito JWT).

## 4. Common Response Envelope

All REST responses use:
```json
{
  "data": <payload>,
  "meta": {
    "timestamp": "2026-09-18T21:00:00Z",
    "request_id": "uuid"
  },
  "error": null
}
```

On error:
```json
{
  "data": null,
  "meta": { "timestamp": "...", "request_id": "..." },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "human-readable message",
    "details": [...]
  }
}
```

---

## 5. Endpoints

### 5.1 World Model

#### `GET /api/world`

Returns the current world state snapshot.

**Response 200**:
```json
{
  "data": {
    "snapshot_id": "uuid",
    "timestamp": "2026-09-18T21:00:00Z",
    "nodes": [
      {
        "id": "node-001",
        "type": "SUPPLIER",
        "name": "Apex Electronics",
        "position": { "x": 1.2, "y": 0.8, "z": -0.3 },
        "risk_score": 0.72,
        "inventory_level": 0.45,
        "is_disrupted": true,
        "tags": ["tier-1", "electronics"]
      }
    ],
    "edges": [
      {
        "id": "edge-001",
        "source_node_id": "node-001",
        "target_node_id": "node-002",
        "type": "ROUTE",
        "load": 0.8,
        "delay_hours": 24,
        "is_disrupted": false
      }
    ]
  }
}
```

#### `GET /api/world/nodes/{node_id}`

Returns a single node with full detail.

#### `GET /api/world/edges/{edge_id}`

Returns a single edge with full detail.

---

### 5.2 Signals

#### `GET /api/signals`

Query parameters: `type`, `severity`, `region`, `status`, `limit`, `offset`

**Response 200**:
```json
{
  "data": {
    "signals": [
      {
        "id": "sig-001",
        "type": "WEATHER",
        "severity": "HIGH",
        "title": "Typhoon approaching Port of Osaka",
        "description": "...",
        "confidence": 0.91,
        "region": "APAC",
        "affected_node_ids": ["node-003", "node-007"],
        "created_at": "2026-09-18T18:00:00Z",
        "status": "ACTIVE"
      }
    ],
    "total": 14
  }
}
```

#### `POST /api/signals/{signal_id}/promote`

Promotes a signal to a scenario seed.

**Response 200**: ScenarioObject (see 5.4)

---

### 5.3 Risks

#### `GET /api/risks`

Returns risk scores for all nodes.

**Response 200**:
```json
{
  "data": {
    "risk_map": {
      "node-001": {
        "composite": 0.72,
        "financial": 0.65,
        "sla": 0.80,
        "operational": 0.70,
        "sustainability": 0.40
      }
    },
    "network_health": 0.58,
    "highest_risk_nodes": ["node-001", "node-007"],
    "computed_at": "2026-09-18T21:00:00Z"
  }
}
```

#### `GET /api/risks/nodes/{node_id}`

Returns full risk breakdown for a single node.

---

### 5.4 Scenarios

#### `GET /api/scenarios`

Returns list of all scenarios.

#### `POST /api/scenarios`

Creates a new compound scenario.

**Request body**:
```json
{
  "name": "Dual disruption - APAC ports + electronics supplier",
  "signal_ids": ["sig-001", "sig-003"],
  "relationship": "CONCURRENT",
  "magnitude_multiplier": 1.0,
  "duration_hours": 72
}
```

**Response 201**: ScenarioObject

#### `GET /api/scenarios/{scenario_id}`

Returns a scenario with full detail.

#### `POST /api/scenarios/{scenario_id}/simulate`

Runs the scenario through the simulation engine.

**Response 200**:
```json
{
  "data": {
    "scenario_id": "...",
    "propagation_steps": [...],
    "affected_nodes": [...],
    "risk_delta": {...},
    "simulation_id": "..."
  }
}
```

---

### 5.5 Agent Operations

#### `GET /api/agents`

Returns status of all agents.

**Response 200**:
```json
{
  "data": {
    "agents": [
      {
        "id": "inventory",
        "name": "Inventory Agent",
        "status": "IDLE",
        "last_run_at": "...",
        "last_proposal_id": "..."
      }
    ]
  }
}
```

#### `POST /api/agents/run`

Triggers agent pipeline for a scenario.

**Request body**:
```json
{
  "scenario_id": "uuid",
  "agent_ids": ["inventory", "supplier", "transportation"],
  "provider": "gemini"
}
```

**Response 202**: Accepted, results delivered via WebSocket

---

### 5.6 Plans

#### `GET /api/plans`

Returns ranked plans for the active scenario.

**Response 200**:
```json
{
  "data": {
    "plans": [
      {
        "id": "plan-001",
        "rank": 1,
        "name": "Priority Reroute + Safety Stock",
        "proposing_agents": ["transportation", "inventory"],
        "scores": {
          "cost_delta": -0.12,
          "sla_preservation": 0.91,
          "emissions_delta": 0.08,
          "fragility_delta": -0.15,
          "composite": 0.82
        },
        "adversary_rating": 0.78,
        "actions": [...],
        "constraints_satisfied": true,
        "simulation_valid": true
      }
    ]
  }
}
```

#### `GET /api/plans/{plan_id}`

Returns a single plan with full detail.

#### `GET /api/plans/{plan_id}/adversary`

Returns adversary findings for a plan.

#### `POST /api/plans/{plan_id}/approve`

Approves and applies a plan.

**Request body**: `{ "approver_note": "..." }`

**Response 200**:
```json
{
  "data": {
    "plan_id": "...",
    "status": "ACCEPTED",
    "applied_at": "...",
    "audit_id": "..."
  }
}
```

#### `POST /api/plans/{plan_id}/reject`

Rejects a plan with reason.

---

### 5.7 Evaluation

#### `GET /api/evaluation`

Returns list of evaluation runs.

#### `POST /api/evaluation/run`

Runs the full benchmark suite.

**Request body**:
```json
{
  "suite": "full",
  "provider": "mock",
  "seed": 42
}
```

**Response 202**: Accepted, results delivered via WebSocket

#### `POST /api/evaluation/stress`

Runs a stress test on a plan.

---

### 5.8 System

#### `GET /api/system/health`

Returns health of all system components.

**Response 200**:
```json
{
  "data": {
    "status": "HEALTHY",
    "components": {
      "database": "HEALTHY",
      "redis": "HEALTHY",
      "ai_provider_gemini": "HEALTHY",
      "ai_provider_ollama": "DEGRADED"
    },
    "uptime_seconds": 3600
  }
}
```

#### `GET /api/system/providers`

Returns active AI providers and their status.

#### `POST /api/system/providers/switch`

Switches the active AI provider.

---

## 6. WebSocket API

### Connection

```
ws://localhost:8000/ws/{client_id}
```

### Client → Server Messages

```json
{ "type": "ping" }
{ "type": "subscribe", "topics": ["world", "agents", "plans"] }
{ "type": "unsubscribe", "topics": ["agents"] }
```

### Server → Client Events

| Event Type | Payload Schema | Description |
|-----------|---------------|-------------|
| `pong` | `{}` | Keepalive response |
| `world.update` | WorldStateSnapshot | World model changed |
| `risk.update` | RiskScoreMap | Risk scores recomputed |
| `signal.new` | Signal | New signal ingested |
| `scenario.created` | ScenarioObject | New scenario created |
| `agent.started` | `{agentId, task, scenarioId}` | Agent started |
| `agent.proposal` | AgentProposal | Agent proposal ready |
| `adversary.finding` | AdversaryFinding | Adversary finding |
| `plan.ranked` | RankedPlan[] | Plans ranked |
| `plan.accepted` | AcceptedPlan | Plan applied |
| `eval.progress` | `{step, total, result}` | Evaluation progress |
| `eval.complete` | EvaluationResult | Evaluation done |
| `system.health` | SystemHealth | Health update |

---

## 7. Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 422 | Request payload invalid |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | State conflict (e.g., plan already approved) |
| `PROVIDER_UNAVAILABLE` | 503 | All AI providers down |
| `SIMULATION_FAILED` | 500 | Simulation engine error |
| `AGENT_TIMEOUT` | 504 | Agent did not complete in time |
| `CONSTRAINT_VIOLATION` | 422 | Proposal violates constraints |

---

## 8. Rate Limits (Production)

| Endpoint | Limit |
|----------|-------|
| `POST /api/agents/run` | 10/minute |
| `POST /api/evaluation/run` | 2/minute |
| `GET /api/*` | 100/minute |

---

*All request/response schemas are defined as Pydantic v2 models in `backend/app/schemas/`.*
