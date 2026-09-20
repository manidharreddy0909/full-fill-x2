# FULFILL-X — FINAL DEMO RUNBOOK

> **Target Audience**: Presenter, Hackathon Judge, Technical Reviewer  
> **Demo Target**: DEMO-05 (Seed=42)  
> **Target Duration**: 5–7 Minutes  

---

## 1. Clean Environment Startup

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
.venv\Scripts\activate   # Windows PowerShell
uvicorn app.main:app --reload --port 8000
```
*Verify*: Visit `http://localhost:8000/health` → `{"status": "ok"}`

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
*Verify*: Visit `http://localhost:5173/command`

---

## 2. Fast Reset Procedure (< 5 Seconds)

If a presenter needs to reset the demonstration state during a live presentation:

1. Click the **Reset Seed (`↻`)** button in the global header bar.
2. Navigate to `http://localhost:5173/decision/cockpit`.
3. Click **"INITIALIZE BASELINE PIPELINE"**.
4. The system state instantly resets to seed=42 baseline with 0 residual session state.

---

## 3. Recommended Presentation Route Order

| Order | Workspace Route | Act | Timing |
| :---: | :--- | :--- | :---: |
| 1 | `/command` | Act 1: Observe & Act 2: Detect | 45 sec |
| 2 | `/world` | Act 3: Understand (World Graph & GNN) | 45 sec |
| 3 | `/intelligence` | Act 4: Specialist Agents Swarm | 45 sec |
| 4 | `/response/adversary` | Act 5: Adversarial Stress Test | 45 sec |
| 5 | `/decision/cockpit` | Act 6: Decision Cockpit & Act 7: Verification | 45 sec |
| 6 | `/simulation/twin` | Act 8: Digital Twin & Monte Carlo | 45 sec |
| 7 | `/observability/events` | Act 9: Execution & Act 10: Telemetry Stream | 30 sec |
| 8 | `/learning/deliberate` | Act 11: Memory & Deliberate Learning | 30 sec |
| 9 | `/governance/resilience` | Act 12: Resilience OS Policy Gate | 30 sec |
| 10 | `/evaluation` | Act 13: Benchmark Evaluation Summary | 45 sec |
