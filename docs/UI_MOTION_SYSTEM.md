# FULFILL-X — UI MOTION SYSTEM & DOMAIN TIMELINES

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. MOTION PHILOSOPHY & ANCHORING

In `FULFILL-X`, motion is not decorative UI fluff — **motion communicates system state transitions**.

Every animation curve, particle velocity shift, and spatial node transition maps to concrete domain lifecycle events emitted by the backend REST API or WebSocket event stream.

---

## 2. ANIMATION TOKENS (FRAMER MOTION / GSAP)

`FULFILL-X` establishes standardized motion tokens using Framer Motion and GSAP:

```typescript
// Motion System Tokens
export const MOTION_TOKENS = {
  springFast: { type: 'spring', stiffness: 400, damping: 25 },
  springSmooth: { type: 'spring', stiffness: 250, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 300, damping: 15 },
  easeSpatial: [0.16, 1, 0.3, 1], // Custom cubic-bezier for camera fly-throughs
  durationFast: 0.15,
  durationNormal: 0.3,
  durationSlow: 0.6,
  durationSpatial: 1.2,
};
```

---

## 3. DOMAIN ENTITY MOTION TIMELINES & BACKEND EVENT TRIGGERS

### 1. Agent Motion State Timeline
- **States:** `IDLE` → `ACTIVATING` → `ANALYZING` → `PROPOSING` → `DELIBERATING` → `CONSENSUS`
- **Backend Trigger Events:**
  - `IDLE` → `ACTIVATING`: `POST /api/coordinator/deliberate` received.
  - `ACTIVATING` → `ANALYZING`: `SWARM_DELIBERATION_STARTED` event.
  - `ANALYZING` → `PROPOSING`: Specialist agent output schema validated.
  - `PROPOSING` → `DELIBERATING`: `AGENT_ACTION_PROPOSED` event.
  - `DELIBERATING` → `CONSENSUS`: `SWARM_CONSENSUS_REACHED` event.
- **Visual Motion Effect:**
  - `IDLE`: Gentle 3D floating rotation (0.5 Hz).
  - `ACTIVATING`: 3D node glow intensity ramps up 0% → 100% in 300ms.
  - `ANALYZING`: High-frequency particle ring spinning (2 Hz).
  - `PROPOSING`: Energy beam emission directed toward Swarm Coordinator Node.
  - `DELIBERATING`: Cross-specialist particle transfers flashing.
  - `CONSENSUS`: Synchronized emerald flash pulse across all 4 specialist nodes.

### 2. Risk Motion State Timeline
- **States:** `SIGNAL` → `DETECTED` → `PROPAGATING` → `IMPACTED` → `MITIGATED`
- **Backend Trigger Events:**
  - `SIGNAL` → `DETECTED`: `POST /api/risk/signals/inject` or `SIGNAL_INJECTED` event.
  - `DETECTED` → `PROPAGATING`: `RISK_PROPAGATED` event.
  - `PROPAGATING` → `IMPACTED`: Node composite risk score threshold exceeded (`>= 0.5`).
  - `IMPACTED` → `MITIGATED`: `SIGNAL_RESOLVED` event or plan execution.
- **Visual Motion Effect:**
  - `SIGNAL`: Red radar pulse arc expanding from target coordinates.
  - `DETECTED`: Node geometry turns amber; warning badge ping animation starts.
  - `PROPAGATING`: Crimson wave pulse radiating along connecting edges (speed proportional to decay factor).
  - `IMPACTED`: Node turns bright crimson with outer danger ring vibration.
  - `MITIGATED`: Crimson color fades to emerald green over 800ms with contraction wave.

### 3. Scenario Motion State Timeline
- **States:** `CREATED` → `INJECTED` → `PROPAGATING` → `SIMULATING` → `COMPLETE`
- **Backend Trigger Events:** `POST /api/simulation/scenarios/generate`, `SCENARIO_INJECTED`.
- **Visual Motion Effect:** Event marker drops onto 3D timeline (+0h to +72h); time cursor animates horizontally.

### 4. Decision Motion State Timeline
- **States:** `GENERATED` → `ATTACKED` → `REVISED` → `VERIFIED` → `APPROVAL_REQUIRED` → `APPROVED` / `REJECTED`
- **Backend Trigger Events:** `POST /api/cockpit/evaluate`, `PLAN_VERIFIED`, `EXECUTIVE_APPROVAL_GRANTED`.
- **Visual Motion Effect:** Candidate plan point appears on 3D Pareto surface; green checkmark pulse on verification; gold lock seal rotation on approval.

### 5. Simulation Motion State Timeline
- **States:** `READY` → `RUNNING` → `PAUSED` → `COMPLETE` → `COMPARING`
- **Backend Trigger Events:** `POST /api/simulation/twin/step`, `MONTE_CARLO_RUN_FINISHED`.
- **Visual Motion Effect:** Holographic scanline moves over twin mesh; multi-line stochastic futures grow dynamically in 3D cloud.
