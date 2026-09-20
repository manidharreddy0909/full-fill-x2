# FULFILL-X — FINAL DEMO EVIDENCE MATRIX

> **Release Version**: v1.0.0-release  
> **Verification Status**: VERIFIED ACROSS 3 DETERMINISTIC DEMO REHEARSALS  

---

| Act | Workspace Route | User Action | Backend / API Endpoint | Expected UI Result | Verified | Evidence Artifact |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `/command` | View Command Grid | `GET /api/v1/graph/topology` | 23 nodes, 32 edges, 94.0% health | YES | `route_command_1789905766428.png` |
| **2** | `/command` | Click "Inject Signal" | `POST /api/v1/risk/inject-signal` | Risk badge updates, signal Toast | YES | `cockpit_baseline_init_1789904436737.png` |
| **3** | `/world` | Rotate R3F 3D graph | `GET /api/v1/gnn/propagation` | Dynamic 3D network with risk glows | YES | `route_world_1789905800528.png` |
| **4** | `/intelligence` | View Swarm Agents | `GET /api/v1/agents/deliberation` | 7 active specialist agent status cards | YES | `route_intelligence_1789905827266.png` |
| **5** | `/response/adversary` | Run Adversary Attack | `POST /api/v1/adversary/attack` | Red team attack vector panel rendered | YES | `route_adversary_1789905908038.png` |
| **6** | `/decision/cockpit` | Compare Plans | `GET /api/v1/cockpit/sessions` | Pareto trade-off plan matrix | YES | `route_decision_cockpit_1789905970257.png` |
| **7** | `/decision/verification` | Check Safety Boundary | `POST /api/v1/verification/verify` | Safety plane boundary status: ENFORCED | YES | `route_verification_1789906005478.png` |
| **8** | `/simulation/twin` | Run Monte Carlo | `POST /api/v1/simulation/monte-carlo` | 1,000-trial simulation distribution | YES | `route_sim_twin_1789906053536.png` |
| **9** | `/observability/events` | Inspect Telemetry | `WS /ws` | Live event stream broadcast log | YES | `route_observability_events_1789906213292.png` |
| **10** | `/learning/deliberate` | View Challenger | `GET /api/v1/learning/memory` | Institutional memory bank entries | YES | `route_learning_deliberate_1789906142770.png` |
| **11** | `/governance/resilience` | Check Policy Gate | `GET /api/v1/resilience/policy` | Resilience OS policy evaluation list | YES | `route_gov_resilience_1789906241175.png` |
| **12** | `/evaluation` | View Scores | `GET /api/v1/evaluation/results` | 8 benchmark scenario run history (94.2%) | YES | `route_evaluation_1789906283142.png` |
