# FULFILL-X — CHANGE IMPACT MAP

> **Impact Reference Guide for Developers Modifying System Components**

---

| If You Change... | Files / Components Affected | Required Test Command |
| :--- | :--- | :--- |
| **Risk Scoring Algorithm** | `backend/app/risk/engine.py`, `backend/app/api/risk.py`, `CommandWorkspace.tsx` | `pytest backend/tests/test_risk_engine.py` |
| **Specialist Agent Proposals** | `backend/app/agents/swarm.py`, `useAgentStore.ts`, `AgentConstellationWorkspace.tsx` | `pytest backend/tests/test_agents.py` |
| **Adversary Attack Engine** | `backend/app/adversary/agent.py`, `AdversaryWorkspace.tsx` | `pytest backend/tests/test_adversary.py` |
| **Safety Invariant Plane** | `backend/app/verification/engine.py`, `VerificationWorkspace.tsx` | `pytest backend/tests/test_verification.py` |
| **Monte Carlo Parameters** | `backend/app/simulation/monte_carlo.py`, `DigitalTwinWorkspace.tsx` | `pytest backend/tests/test_monte_carlo.py` |
| **API Response Schemas** | `backend/app/schemas/`, `frontend/src/api/`, all workspace components | `pytest backend/tests/` & `npm run build --prefix frontend` |
