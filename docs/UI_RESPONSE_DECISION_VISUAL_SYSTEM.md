# FULFILL-X — Phase 13C Response & Decision Visual System Architecture

## Overview

Phase 13C transforms the **RESPONSE** (Active Incident Response & Red Team Chaos Testing) and **DECISION** (Multi-Objective Decision Control & Safety Gate Verification) domains into visually distinctive, production-grade operational environments.

```
CAUSAL / RISK (Understanding the Problem)
      ↓
   WAR ROOM (Autonomous Incident Command)
      ↓
   ADVERSARY (Resilience Attack Laboratory)
      ↓
  CANDIDATE PLANS (Multi-Objective Trade-Off Matrix)
      ↓
DECISION COCKPIT (Pipeline Orchestrator & Approval)
      ↓
 VERIFICATION (Decision Safety Boundary & State Diff)
      ↓
   APPROVAL (Execution & Immutability)
```

---

## 1. Visual Environment Specifications

### A. Autonomous Incident Command — War Room (`/response/war-room`)
- **Visual Identity**: Active Incident Command.
- **Layout**: Top Incident Header HUD | Left Active Specialist Swarm | Center/Right Swarm Deliberation & Conflict Trace.
- **Severity Mapping**:
  - `NORMAL` (`#34d399`)
  - `WARNING` (`#fbbf24`)
  - `HIGH` (`#fb923c`)
  - `CRITICAL` (`#f87171`)
- **Data Binding**: `triggerDeliberation()`, `fetchWorldSummary()`, `useAgentStore`, `useRealtimeStore`.

### B. Resilience Attack Laboratory — Adversary (`/response/adversary`)
- **Visual Identity**: Red Team Chaos Testing ("WHAT CAN BREAK?").
- **Flow**: Base Plan → Attack Vector → Failure Condition → Impact → Resilience Result.
- **Features**: Attack suite generator, full adversary simulation runner, vulnerability pattern detection.
- **Data Binding**: `fetchAdversaryStatus()`, `generateAttackSuite()`, `runAdversary()`, `fetchLatestFindings()`.

### C. Multi-Objective Decision Control — Cockpit (`/decision/cockpit`)
- **Visual Identity**: Clean Comparative Decision Control.
- **Features**:
  - Multi-stage pipeline progress rail (`OBSERVE` → `RISK ANALYSIS` → `SPECIALISTS` → `COORDINATE` → `STRESS TEST` → `OPTIMIZE` → `VERIFY` → `APPROVE`).
  - `PlanComparisonMatrix` for side-by-side trade-off comparison (Cost, Risk, Delay, Resilience, Emissions).
  - REAL Approve / Reject actions calling `approveCockpitPlan()` and `rejectCockpitPlan()`.
- **Data Binding**: `fetchCockpitStatus()`, `createCockpitSession()`, `runCockpitLoop()`, `approveCockpitPlan()`, `rejectCockpitPlan()`.

### D. Decision Safety Boundary — Verification Sandbox (`/decision/verification`)
- **Visual Identity**: Safety Gate & Feasibility Engine.
- **Flow**: Proposed State → Constraint Check → Feasibility → State Diff → Verified / Rejected.
- **State Diff Matrix**: `VerificationStateDiff` showing BEFORE → CHANGE → AFTER (e.g. Warehouse capacity $100 \rightarrow 80$, Route $ACTIVE \rightarrow REROUTED$).
- **Data Binding**: `verificationApi.getStatus()`, `verificationApi.getLatestReport()`, `verificationApi.runVerification(plan)`.

---

## 2. Reusable Response & Decision Visual Primitives

Located in `frontend/src/visual/response/`:
- `IncidentHeader.tsx`: Top HUD header bar for active incidents.
- `AdversaryAttackPath.tsx`: Renders attack surface, vector, simulated impact, and resilience score.
- `PlanComparisonMatrix.tsx`: Side-by-side trade-off matrix with real Approve/Reject controls.
- `VerificationStateDiff.tsx`: Renders BEFORE → CHANGE → AFTER state transformation diffs.

---

## 3. Verification & Performance Discipline

- **Frontend Production Build**: `npm run build` passed in **7.54s** across 2,591 transformed modules with **0 TypeScript errors**.
- **Backend Test Suite**: `pytest backend/tests/` passed **249/249 tests** in **67.92s** with 0 failures.
- **Browser Verification**: Confirmed active rendering of all four response & decision routes.
