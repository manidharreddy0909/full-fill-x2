# FULFILL-X — INTERACTION FLOW MAP

> **Release Baseline**: `6869cae8f31788ee68b06e7a4615ef4a5b504cfd`  

---

## Complete Control Execution Flows

### Flow 1: Click "Inject Signal" (Command Center)
```
USER ACTION: Click "Inject Signal" button on Command Workspace
 └─> FRONTEND EVENT: `handleInjectSignal()` in CommandWorkspace.tsx
      └─> API CALL: POST `/api/v1/risk/inject-signal` payload `{ node_id: "sup-001", signal_type: "DISRUPTION" }`
           └─> FASTAPI ROUTE: `inject_signal_api()` in `backend/app/api/risk.py`
                └─> DOMAIN SERVICE: `RiskEngine.process_signal()` in `backend/app/risk/engine.py`
                     └─> PERSISTENCE: Updates in-memory graph state & node risk score
                          └─> WEBSOCKET BROADCAST: Event `RISK_SIGNAL_INJECTED` via `websocket_manager.broadcast()`
                               └─> FRONTEND UPDATE: `useResilienceStore` receives WebSocket event, updates node risk badge to amber
                                    └─> VISIBLE RESULT: Signal Toast appears, node heat map pulses amber, network health score recalculates.
```

---

### Flow 2: Click "Initialize Baseline Pipeline" (Decision Cockpit)
```
USER ACTION: Click "INITIALIZE BASELINE PIPELINE" button on Cockpit Workspace
 └─> FRONTEND EVENT: `handleInitializeSession("baseline")` in CockpitWorkspace.tsx
      └─> API CALL: POST `/api/v1/cockpit/sessions` payload `{ scenario: "DEMO-05", seed: 42 }`
           └─> FASTAPI ROUTE: `create_session_api()` in `backend/app/api/cockpit.py`
                └─> DOMAIN SERVICE: `CockpitService.create_session()` in `backend/app/cockpit/service.py`
                     └─> AGENT SWARM EXECUTION: Invokes 7 Specialist Swarm Agents + Coordinator
                          └─> WEBSOCKET BROADCAST: Event `SESSION_CREATED` with session ID (`50c31f37`)
                               └─> FRONTEND UPDATE: `useCockpitStore.setActiveSession()`
                                    └─> VISIBLE RESULT: Cockpit view switches to Active Session mode, displaying active stage progress rail and candidate plan comparison table.
```

---

### Flow 3: Click "Run Monte Carlo Simulation" (Digital Twin)
```
USER ACTION: Click "Run Monte Carlo Simulation" button on Digital Twin Workspace
 └─> FRONTEND EVENT: `handleRunMonteCarlo()` in DigitalTwinWorkspace.tsx
      └─> API CALL: POST `/api/v1/simulation/monte-carlo` payload `{ iterations: 1000, seed: 42 }`
           └─> FASTAPI ROUTE: `run_monte_carlo_api()` in `backend/app/api/simulation.py`
                └─> SIMULATION ENGINE: `MonteCarloEngine.run_simulation()` in `backend/app/simulation/monte_carlo.py`
                     └─> COMPUTATION: Executes 1,000 discrete event iterations, calculates SLA protection and CVaR95 cost
                          └─> WEBSOCKET BROADCAST: Event `MONTE_CARLO_COMPLETED`
                               └─> FRONTEND UPDATE: `useTwinStore.setMonteCarloResults()`
                                    └─> VISIBLE RESULT: Histogram chart fills dynamically, 99.2% SLA protection score displayed.
```
