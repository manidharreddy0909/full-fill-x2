# FULFILL-X — FINAL DEMO RECOVERY GUIDE

> **Purpose**: Immediate presenter recovery procedures for live presentation contingencies.

---

## Contingency Recovery Matrix

| Observed Issue | Root Cause | Presenter Action / Recovery Procedure | Recovery Time |
| :--- | :--- | :--- | :---: |
| **Backend Unreachable** | Server process stopped | In Terminal 1, run `uvicorn app.main:app --reload --port 8000` | < 3 sec |
| **Frontend Disconnected** | Vite dev server stopped | In Terminal 2, run `npm run dev` | < 2 sec |
| **WebSocket Disconnected** | Network glitch / socket reset | Click **Refresh** in browser (`F5`) or click **Reset Seed (`↻`)** | < 1 sec |
| **Stale Session Data** | Previous demo run residue | Click **Reset Seed (`↻`)** in header or navigate to `/decision/cockpit` | < 1 sec |
| **Simulation Stall** | Browser memory pressure | Hard refresh (`Ctrl+Shift+R`) | < 2 sec |
| **Clean Reset Needed** | Reset to seed=42 baseline | Click **"INITIALIZE BASELINE PIPELINE"** on Cockpit workspace | < 1 sec |
