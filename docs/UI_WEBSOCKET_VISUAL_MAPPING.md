# FULFILL-X — UI WEBSOCKET VISUAL MAPPING

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. REALTIME WEBSOCKET TAXONOMY & ENVELOPE SCHEMA

`FULFILL-X` streams real-time events via WebSockets (`/ws/events`). Incoming event envelopes conform strictly to `EventEnvelope`:

```typescript
export interface EventEnvelope {
  event_id: string;
  event_type: string; // NODE_DISRUPTED, RISK_PROPAGATED, AGENT_ACTION_PROPOSED, etc.
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  organization_id: string;
  workspace_id: string;
  payload: Record<string, any>;
}
```

---

## 2. REALTIME VISUAL & 3D PARTICLE MAPPING MATRIX

| Event Type | 3D Visual Response | 2D HUD Response | Toast Notification | Zustand Action Dispatched |
| :--- | :--- | :--- | :--- | :--- |
| **`NODE_DISRUPTED`** | Red `RiskPulse` radiates from target node mesh; node turns crimson | Disrupted node count badge increments; status dot flashes red | Critical Toast: `"Node {id} Disrupted (Severity {sev})"` | `realtimeStore.updateNodeRisk(nodeId, risk)` |
| **`RISK_PROPAGATED`** | Crimson particle beam flows along downstream edge mesh | Risk heatmap table updates hop decay values | Informational Toast: `"Risk propagated to {target}"` | `realtimeStore.setRiskMap(updatedMap)` |
| **`SIGNAL_INJECTED`** | Red arc trajectory drops onto radar threat dome | Active signal stream table prepends new row | Warning Toast: `"Threat Signal Injected: {type}"` | `realtimeStore.addSignal(signal)` |
| **`AGENT_ACTION_PROPOSED`** | Energy beam transfers between Specialist orb and Coordinator | Agent feed adds proposal message with confidence score | Info Toast: `"{agent} proposed {action}"` | `agentStore.addProposal(proposal)` |
| **`SWARM_CONSENSUS_REACHED`** | Emerald flash pulse across 4 specialist nodes in arena | Consensus progress bar reaches 100% | Success Toast: `"Swarm consensus reached ({candId})"` | `agentStore.setConsensus(true)` |
| **`CHAOS_FAULT_INJECTED`** | Red threat lightning bolt strikes targeted node | Vulnerability gauge updates to higher threat level | Alert Toast: `"Chaos Fault Injected by Adversary"` | `adversaryStore.addFault(fault)` |
| **`PLAN_VERIFIED`** | Green checkmark beam highlights candidate plan point | Verification status badge changes `REJECTED` -> `VERIFIED` | Success Toast: `"Plan {id} passed safety verification"` | `verificationStore.setResult(res)` |
| **`POLICY_EVALUATED`** | Governance cube shield flashes amber/red if rule violated | Policy test log displays rule violation reason | Warning Toast: `"Policy check: {action} on {planId}"` | `governanceStore.addEvaluation(eval)` |
| **`EXECUTIVE_APPROVAL_GRANTED`** | Executive seal ring rotates and emits golden glow pulse | Executive summary badge changes to `APPROVED` | Success Toast: `"Executive Approval Granted by {user}"` | `cockpitStore.setApprovalStatus('APPROVED')` |
| **`SIMULATION_STEP_COMPLETED`** | Digital Twin holographic scanline advances +1 step | Step counter HUD increments (+24h) | None | `twinStore.advanceStep(stepData)` |
| **`MONTE_CARLO_RUN_FINISHED`** | 100 stochastic trajectory lines solidify in 3D cloud | Percentile chart renders P10/P50/P90 distributions | Info Toast: `"Monte Carlo simulation run complete"` | `monteCarloStore.setResults(results)` |
| **`CHALLENGER_PROMOTED`** | Orbiting neural particles emit green promotion flash | Champion policy card updates to new model ID | Success Toast: `"Challenger model promoted to Champion"` | `learningStore.setChampion(modelId)` |
| **`EXECUTION_MODE_MUTATED`** | Dual-lock safety gate barrier shifts position | Safety mode badge toggles (`DRY_RUN` / `LIVE`) | Warning Toast: `"Execution Safety Mode: {mode}"` | `executionStore.setMode(mode)` |
