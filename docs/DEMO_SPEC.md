# FULFILL-X — Demo Specification

## 1. Purpose

Define the complete demo narrative, scripted flow, scenario, and
talking points for the FULFILL-X hackathon demonstration.

## 2. Demo Format

- **Duration**: 12 minutes (10 min demo + 2 min Q&A buffer)
- **Audience**: Technical judges + business evaluators
- **Mode**: Live system with pre-seeded synthetic data
- **Fallback**: Recorded video backup (same script, pre-recorded)
- **Presenter**: 1–2 people (1 narrator, 1 driver)

## 3. Demo Scenario

**"The Double Punch"**

A Category 4 typhoon is approaching the Port of Osaka, simultaneously
with a fire at a Tier-1 electronics supplier in Shenzhen. Both events
hit within 6 hours of each other.

- **Signal 1**: WEATHER / CRITICAL — Typhoon Hana, Port of Osaka
  - Affected nodes: 3 warehouses, 2 fulfillment centers, 4 sea routes
  - Confidence: 0.94
- **Signal 2**: SUPPLIER_HEALTH / HIGH — Fire at Apex Electronics, Shenzhen
  - Affected nodes: Apex Electronics (Tier-1 supplier)
  - Confidence: 0.88

This creates a compound scenario that stresses inventory, supplier,
transportation, fulfillment, and sustainability agents simultaneously.

## 4. Scripted Demo Flow

### Segment 1: Hook (0:00 – 1:00)

> "Imagine two things go wrong at the same time. A typhoon. A factory fire.
> You have 200 SKUs at risk, 50,000 orders in flight, and 3 minutes to
> decide. Here's how FULFILL-X responds."

**Screen**: Command Center — show live network health score dropping in real time.

**Points**:
- Network health score: 0.58 (amber)
- 2 active signals visible in feed
- 3D world mini-view shows disruption wave

---

### Segment 2: 3D World Model (1:00 – 2:30)

> "The 3D World Model gives us a spatial picture of the disruption."

**Action**: Navigate to 3D World Model screen.

**Driver Actions**:
1. Let disruption wave animate outward from Osaka and Shenzhen
2. Click affected warehouse node → inspector panel opens
3. Show inventory level (red), risk score (0.82)
4. Orbit camera to show full network

**Points**:
- Nodes color-coded by risk: red = disrupted, amber = at-risk, green = healthy
- Routes flashing red for disrupted sea lanes
- Risk propagation visible as ripple effect

---

### Segment 3: Signal Intelligence (2:30 – 3:30)

> "FULFILL-X ingested two signals and classified them automatically."

**Screen**: Signal Intelligence

**Driver Actions**:
1. Show Signal 1 (typhoon) — severity: CRITICAL, confidence: 0.94
2. Show Signal 2 (supplier fire) — severity: HIGH, confidence: 0.88
3. Click "Promote to Scenario" → Scenario Lab opens

**Points**:
- Signal classification is automatic
- Confidence score derived from signal source reliability

---

### Segment 4: Scenario Lab (3:30 – 4:30)

> "We compose a compound scenario: concurrent disruptions, amplified."

**Screen**: Scenario Lab

**Driver Actions**:
1. Show the two signals on the scenario canvas (React Flow)
2. Relationship: CONCURRENT, magnitude: 1.2×
3. Click "Simulate" → show risk delta propagation on mini-3D embed
4. Click "Run Agents"

**Points**:
- Compound scenario captures the interaction between events
- Risk delta: SLA at-risk jumps from 0.20 to 0.72

---

### Segment 5: Agent War Room (4:30 – 6:30)

> "Six specialist agents run in parallel. Watch them work."

**Screen**: Agent War Room

**Driver Actions**:
1. Watch all agent cards animate to RUNNING state
2. Inventory Agent completes first — shows "12 reorder actions"
3. Transportation Agent — "3 route reroutes, $42K cost delta"
4. Sustainability Agent — "emissions +8%: mode switch to air freight flagged"
5. Adversary Agent — animates last (stress testing the plans)

**Points**:
- Each agent has a defined objective and constraints
- Sustainability agent flags the trade-off between speed and emissions
- Adversary agent is testing every plan for weaknesses

---

### Segment 6: Plan Comparison (6:30 – 8:00)

> "The Coordinator produces three ranked recovery plans. Let's compare."

**Screen**: Plan Comparison

**Driver Actions**:
1. Show 3 plan cards side by side
2. Point to radar chart — Plan A: best SLA (0.91), higher cost
3. Plan B: balanced — good SLA (0.85), lower emissions
4. Plan C: minimum cost — SLA risk (0.72)
5. Show adversary rating: Plan A = 0.81, Plan B = 0.78, Plan C = 0.61

**Points**:
- Plan comparison makes trade-offs explicit and quantified
- Adversary rating tells you which plan survives a second hit

---

### Segment 7: Adversary Attack (8:00 – 8:45)

> "The Adversary Agent attacks Plan A. Here's what it found."

**Screen**: Adversary Attack

**Driver Actions**:
1. Select Plan A
2. Show attack tree (React Flow)
3. Highlight: "Alternative route via Malaysia has 40% lower capacity — collapses under 20% demand increase"
4. Severity: HIGH, probability: 0.52

**Points**:
- The adversary found a hidden vulnerability before we committed
- This is why adversarial testing is essential

---

### Segment 8: Decision Cockpit (8:45 – 9:30)

> "Plan B it is. The director approves in one action."

**Screen**: Decision Cockpit

**Driver Actions**:
1. Show Plan B summary: SLA 0.85, cost +$38K, emissions +8%, adversary rating 0.78
2. Add note: "Approved — balanced response for typhoon + supplier disruption"
3. Click "Approve" — confirmation modal appears
4. Confirm → world state updates → 3D world shows new routes animating in

**Points**:
- Every decision is logged and auditable
- World state updates deterministically after approval
- 3D world shows new routes activating

---

### Segment 9: Evaluation (9:30 – 10:30)

> "Everything you saw was reproducible. Here's the benchmark."

**Screen**: Evaluation

**Driver Actions**:
1. Show benchmark suite: 5 scenarios, 23 tests
2. Run B002 (the demo scenario): watch tests tick green
3. Show metrics: agent_response_time_p95 = 2.4s, sla_preservation = 0.85
4. Show determinism: "Same seed, same result, every time"

**Points**:
- Evaluation harness is fully deterministic with mock provider
- Proves the system works without relying on LLM non-determinism
- Benchmark can be re-run by judges

---

### Segment 10: Wrap (10:30 – 11:00)

> "FULFILL-X observes, models, risks, agents, adversary, plans, verifies.
> In under 5 seconds on synthetic data. On AWS, it's one URL away."

**Screen**: System / AWS Status

**Points**:
- Show AWS services: all green
- API latency, uptime
- Switch AI provider live (Gemini → Mock → back)

---

## 5. Demo Data Seed

All demo data must be seeded with `seed=42` for reproducibility.

```bash
# Seed demo data
python -m backend.app.data.synthetic --seed 42 --preset demo
```

## 6. Demo Checklist (Pre-Demo)

- [ ] Backend running, health check green
- [ ] Frontend loaded, no console errors
- [ ] Demo data seeded
- [ ] Network healthy at 0.58
- [ ] Signal Intelligence pre-populated with typhoon + supplier signals
- [ ] Scenario Lab pre-configured with "The Double Punch"
- [ ] 3D scene renders at 60fps
- [ ] WebSocket connected
- [ ] Recorded backup video ready
- [ ] Presenter notes printed

## 7. Backup Plan

If live demo fails:
1. Switch to recorded backup video (same script)
2. Narrate over recording
3. Show code / architecture slides as supplemental

## 8. Demo Environment

```
Frontend URL: https://demo.fulfill-x.example.com
API URL: https://api.fulfill-x.example.com
WebSocket: wss://api.fulfill-x.example.com/ws/demo-client
```

## 9. Post-Demo Materials

- README with setup instructions
- Architecture walkthrough (docs/ARCHITECTURE.md)
- Evaluation benchmark results export (PDF)
- Docker Compose for local reproduction
