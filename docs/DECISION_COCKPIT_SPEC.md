# FULFILL-X — Phase 10: Decision Cockpit & End-to-End Intelligence Console Specification

## 1. Overview & Purpose
Phase 10 delivers the **Decision Cockpit** — the central command console and workflow orchestrator for FULFILL-X.
It ties together all reasoning layers built across Phase 01 to Phase 09 into an end-to-end, reproducible, transparent operational workflow:

$$\text{OBSERVE} \longrightarrow \text{RISK} \longrightarrow \text{SPECIALISTS} \longrightarrow \text{COORDINATOR} \longrightarrow \text{ADVERSARY} \longrightarrow \text{PLANNER} \longrightarrow \text{VERIFICATION} \longrightarrow \text{DECISION COCKPIT} \longrightarrow \text{HUMAN APPROVAL}$$

---

## 2. Core Operational Workflow & Stages

| Stage # | Stage Key | Title | Description | Domain Service Invoked |
|---|---|---|---|---|
| **01** | `OBSERVING` | Network Observation | Ingest topology snapshot, node statuses, edge capacities | `WorldRepository` |
| **02** | `ANALYZING_RISK` | Risk Propagation | Compute deterministic multi-hop risk, composite scores | `RiskRepository`, `RiskEngineService` |
| **03** | `RUNNING_SPECIALISTS` | Specialist Multi-Agent | Execute 6 specialist agents in parallel | `SpecialistAgentService` |
| **04** | `COORDINATING` | Proposal Reconciliation | Reconcile proposals into candidate plans (A/B/C) | `CoordinatorService` |
| **05** | `ADVERSARIAL_TESTING` | Adversary Red-Team | Subject candidate plans to controlled stress testing | `AdversaryService` |
| **06** | `OPTIMIZING` | Multi-Objective Planning | Construct Pareto frontiers & normalized trade-offs | `PlannerService` |
| **07** | `VERIFYING` | Verification Engine | Execute pre-commit validation in isolated sandbox | `VerificationService` |
| **08** | `READY_FOR_APPROVAL` | Human Approval Gate | Audit gate for human approval/rejection decision | `CockpitService` |

---

## 3. Key Features

### 3.1 Non-Authoritative Immutability Protection
- The Cockpit orchestrator operates exclusively on isolated sandbox copies of state.
- Calling `run_full_loop()`, approving, rejecting, or resetting a session **never** mutates the live authoritative `WorldRepository` or `RiskRepository`.
- Assertions verify that `world_before.nodes == world_after.nodes`, `world_before.edges == world_after.edges`, and `risk_before.node_risks == risk_after.node_risks`.

### 3.2 Traceable Evidence & Audit Provenance
- Every stage execution appends structured evidence links (`EvidenceLink`) and chronological audit events (`AuditEvent`).
- Users can inspect exact input/output payloads, reasoning traces, pareto metrics, and sandbox check details via the interactive slide-over `EvidenceDrawer`.

---

## 4. REST API Schema

- `GET /api/cockpit/status`: Return system cockpit engine status.
- `POST /api/cockpit/session`: Create a new decision session.
- `GET /api/cockpit/session/{session_id}`: Retrieve a session state.
- `POST /api/cockpit/session/{session_id}/run`: Execute full 8-stage decision loop.
- `POST /api/cockpit/session/{session_id}/stage`: Step through a single workflow stage.
- `POST /api/cockpit/session/{session_id}/approve`: Record human approval for a candidate plan.
- `POST /api/cockpit/session/{session_id}/reject`: Record human rejection for a candidate plan.
- `POST /api/cockpit/session/{session_id}/reset`: Reset session state to clean initial observation.

---

## 5. Verification & Testing
- 8 new unit and integration tests added in `backend/tests/test_cockpit.py`.
- Full backend suite: 101/101 PASS (`pytest backend/tests/ -v`).
- Frontend production build: TypeScript strict compilation & Vite bundle PASS.
