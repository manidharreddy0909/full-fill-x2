# FULFILL-X — Demo Storyboard

## 1. Overview

**Demo Name**: "The Double Punch"
**Duration**: 12 minutes
**Audience**: Technical evaluators, supply chain executives, AI researchers
**Hardware**: Laptop → 1920×1080 external display (or projector)
**Mode**: Live system with pre-seeded data (not slides; not fake UI)

---

## 2. Setup (Before Demo)

```bash
# 1. Verify system is running
curl http://localhost:8000/api/system/health  → {"status":"HEALTHY"}

# 2. Seed demo data (puts network in healthy state)
curl -X POST http://localhost:8000/api/world/seed -d '{"preset":"healthy","seed":42}'

# 3. Verify 3D world loads
open http://localhost:5173/world

# 4. Set AI provider to mock for speed (can switch to Gemini live)
curl -X POST http://localhost:8000/api/system/providers/switch -d '{"provider":"mock"}'
```

---

## 3. Demo Script — Segment by Segment

---

### SEGMENT 1: Network Starts Healthy (0:00–1:00)

**Presenter action**: Navigate to `/command`

**What audience sees**:
- Command Center: Network Health = **0.94 HEALTHY** (green)
- 3D mini globe: all nodes green
- Signal feed: "No Active Signals"
- KPIs: 0 critical signals, 1 at-risk node (background noise)

**Talking points**:
> "Here's our global supply network — 5 suppliers, 3 warehouses, 2 fulfillment centers,
> 10 customer zones. Network health is 0.94. This is our baseline."

**Navigation**: Click mini-globe → navigate to `/world`

**What audience sees**:
- Full 3D world: green nodes, animated particle flows, healthy routes
- Camera orbits slowly on autopilot

> "The 3D world is live data. Every node's color encodes its real-time risk score.
> Every particle represents freight moving through our supply network."

---

### SEGMENT 2: Weak Signals Appear (1:00–2:30)

**Presenter action**: Inject Typhoon Hana signal via API or Signal Intelligence screen

**Real system action**: `POST /api/signals` (preset: typhoon_hana)
**Underlying functionality**: `SignalIngestor.ingest()` → risk recompute → `signal.detected` + `risk.update` events

**What audience sees**:
- 3D: white flash at Osaka Warehouse + Port of Osaka
- Health score drops: 0.94 → 0.82 (amber)
- Signal Intelligence toast notification: "CRITICAL: Typhoon Hana"
- 3D: Osaka node begins color-shifting toward amber

**Talking points**:
> "Typhoon Hana just made landfall near Osaka. The system detected it in real-time.
> Our Osaka warehouse is now at elevated risk. Notice the 3D visualization updating automatically."

**Presenter action**: Inject Factory Fire Shenzhen signal

**What audience sees**:
- 3D: red flash at Apex Electronics + red glow begins
- Health drops: 0.82 → 0.58 (degraded)
- Risk propagation wave: amber expanding from disrupted nodes

> "A factory fire just broke out at our Tier-1 electronics supplier in Shenzhen.
> Now we have two concurrent critical disruptions. Health is at 0.58."

**Navigate to**: `/signals`

---

### SEGMENT 3: Signal Fusion and Risk Analysis (2:30–4:00)

**Presenter action**: Navigate to `/signals`

**What audience sees**:
- Signal Intelligence: 2 CRITICAL signals in list
- Select both signals: detail panels side by side
- Confidence bars visible (0.94, 0.88)
- Affected node count per signal

> "The system has ingested two independent signals — a typhoon and a factory fire.
> Both have high confidence. And they both affect overlapping parts of our network."

**Presenter action**: Navigate to `/risks`

**What audience sees**:
- Risk Explorer: sortable table (Apex Electronics 0.88 at top)
- Heat map: red cluster in APAC region
- Node detail: risk breakdown across 4 dimensions

> "Risk has propagated through 3 hops of our dependency graph. The risk engine is
> entirely deterministic — no AI here. Pure graph math. And it explains itself:
> this financial risk came from the typhoon signal, not the factory fire."

---

### SEGMENT 4: Compound Scenario (4:00–5:30)

**Presenter action**: Navigate to `/scenarios`, click "+ New Scenario"

**Presenter action**: Select both signals on React Flow canvas
**Presenter action**: Set Relationship: CONCURRENT, Magnitude: 1.2×
**Presenter action**: Click "Simulate"

**Real system action**: `POST /api/scenarios` + `POST /api/scenarios/{id}/simulate`
**Underlying functionality**: `ScenarioEngine.compose()` + `ScenarioSimulator.simulate()`

**What audience sees**:
- Scenario canvas: two signal nodes connected by "CONCURRENT" edge
- Risk delta panel appears: "SLA risk: 0.20 → 0.72"
- Mini 3D embed: disruption wave plays step by step (each hop)

> "We've composed a compound scenario: typhoon plus factory fire, happening simultaneously.
> The simulation shows our SLA risk jumps from 20% to 72%. That's not one disruption —
> it's the compound effect of both acting together."

---

### SEGMENT 5: Specialist Agents Respond (5:30–7:30)

**Presenter action**: Click "Run Agents" (or navigate to `/agents` and trigger from there)

**Real system action**: `POST /api/agents/run`
**Underlying functionality**: `AgentOrchestrator.run_pipeline()` via `asyncio.gather()`

**What audience sees**:
- Agent War Room: 6 specialist card cards animate in
- Each card shows RUNNING status (pulsing ring)
- 3D: agent overlay badges appear at relevant nodes (each agent's color)
- Cards complete one by one (mock provider: ~2s total)
- Coordinator card: "Reconciling proposals..."
- Adversary card: "Attacking plans..."

> "Six specialist AI agents are running in parallel. The inventory agent handles
> reorders. The transportation agent reroutes around the disrupted port. The
> sustainability agent checks if we're increasing emissions. They can't talk to
> each other — the coordinator resolves conflicts."

**Presenter action**: Click "Inventory Agent" card

**What audience sees**:
- Reasoning: "Priority reorder triggered by Osaka WH stockout probability 0.82..."
- Evidence: [Inventory 0.45] [Demand +20%] [Lead time 96h]
- Actions table: 12 reorders, 4 transfers

> "This is the AI's reasoning — but it's been validated. It passed schema validation,
> constraint checking, and simulation. If the agent's proposal violated a constraint,
> it was rejected before ever reaching here."

---

### SEGMENT 6: Plans and Adversary Attack (7:30–9:30)

**Presenter action**: Navigate to `/plans`

**What audience sees**:
- Plan Comparison: 3 ranked plans (Best SLA / Balanced / Min Cost)
- Radar chart overlaying all 3 plans
- Adversary ratings visible on each plan card

> "The coordinator produced 3 recovery plans. Plan 1 maximizes SLA but costs $42K
> more. Plan 3 is cheapest but the adversary found serious weaknesses. Plan 2 is
> the balanced option."

**Presenter action**: Click "View Adversary" on Plan 2

**Navigate to**: `/adversary`

**What audience sees**:
- Attack tree: plan's key actions + 2 attack vectors branching off
- Finding #1: "Alt Manila route collapses at +20% demand spike"
- Adversary rating gauge: 0.78

> "The adversary agent — our AI red-teamer — found that Plan 2 has one weakness:
> the Manila alternative route is already near capacity. If demand spikes 20%,
> it fails. The system flagged it. Now we know."

---

### SEGMENT 7: Stress Test (9:30–10:30)

**Presenter action**: Navigate to `/stress`

**Presenter action**: Select Plan 2, select 5 stressors, click "Run Stress Test"

**What audience sees**:
- Stressor rows appear one by one (WebSocket streaming)
- Pass/Fail per stressor
- Survival rate: 7/10

> "We stress-tested Plan 2 against 10 adversarial stressor combinations.
> It survived 7 out of 10. The triple-hit scenario — port closure plus demand spike
> plus supplier failure — causes cascading collapse. Probability: 2.1%. Acceptable."

---

### SEGMENT 8: Decision Cockpit (10:30–11:30)

**Presenter action**: Navigate to `/decision`

**What audience sees**:
- Recommended plan summary (full evidence chain)
- Constraint satisfaction: all green checkmarks
- Evidence chain traced from signal → risk → scenario → agents → coordinator → adversary → stress

> "Every number you see here is traceable. We know which signal caused which risk,
> which risk triggered which agent action, which action the coordinator chose,
> and whether the adversary found a weakness."

**Presenter action**: Type approval note, click "Approve"

**Real system action**: `POST /api/plans/{id}/approve`
**Underlying functionality**: `SimulationEngine.apply()` → `WorldModelEngine.mutate()` → audit log

**What audience sees**:
- 3D world: new routes animate in
- Node colors shift toward healthier state
- Health score climbs: 0.58 → 0.81
- Success toast: "Plan Approved"
- Status bar: "MISSION RESOLVED"

> "Plan approved. The system has applied the recovery actions to our world model.
> Network health is recovering. This decision is now audit-logged with full
> evidence — the signal that started it, the AI that proposed it,
> and the human who approved it."

---

### SEGMENT 9: Evaluation (11:30–12:00)

**Presenter action**: Navigate to `/evaluation`

**Presenter action**: Click "Run Suite" (mock provider, seed 42)

**What audience sees**:
- Test cases appearing: 21/23 pass
- Key metrics: Agent response P95 = 4.2s, Determinism = 100%

> "Every benchmark run with seed 42 produces identical results.
> The evaluation harness is deterministic. You can reproduce these numbers yourself.
> That's not a slide — it's a reproducible, auditable benchmark."

---

## 4. Fallback Protocol

| Failure | Fallback |
|---------|---------|
| Backend unreachable | Show recorded demo video |
| Gemini provider slow | Switch to mock provider live |
| 3D scene not loading | Navigate to 2D Risk Explorer instead |
| WebSocket disconnected | Reconnection auto-triggers; worst case: API polling |
| Scenario simulation error | Use pre-simulated scenario (load from DB) |

**Always have**: A screen recording of a perfect demo run as absolute fallback.

---

## 5. Demo Q&A — Expected Questions

| Question | Answer |
|---------|--------|
| "Is the AI making the decision?" | No. AI proposes; constraints and simulation validate; human approves |
| "How is this reproducible?" | Mock provider + seed=42 → deterministic outputs |
| "What if two agents disagree?" | Coordinator detects and resolves conflicts explicitly |
| "How does the adversary work?" | Separate AI agent that tries to break plans; finds failure vectors |
| "Is the 3D world live?" | Yes — every color encodes a real risk score from the database |
| "What's the AWS architecture?" | Show `/system` screen → ECS, RDS, ElastiCache, CloudFront |
