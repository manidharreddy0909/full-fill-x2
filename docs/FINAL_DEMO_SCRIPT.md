# FULFILL-X — FINAL DEMO SCRIPT & NARRATION

> **Target Duration**: 5–7 Minutes  
> **Presenter Audience**: Hackathon Judges / Technical Evaluators  

---

### ACT 1 & 2: OBSERVE & DETECT (0:00 - 0:45)
- **SCREEN**: `/command` (Command Center)
- **ACTION**: Point to global network health score (94.0%), top critical nodes list, and click **"Inject Signal"**.
- **WHAT TO SAY**: "Welcome to FULFILL-X, an Autonomous Fulfillment Resilience OS. Rather than waiting for supply chain disruptions to cause stockouts, FULFILL-X continuously observes real-world signals across suppliers, ports, and fulfillment centers."
- **JUDGE VISUAL CUE**: Risk heat map shifts dynamically, signal notification banner appears.
- **TECHNICAL PROOF**: Signals ingested via FastAPI endpoints, Pydantic validated, and published over WebSocket.

---

### ACT 3: UNDERSTAND (0:45 - 1:30)
- **SCREEN**: `/world` (Supply Chain World Model & 3D Topology)
- **ACTION**: Rotate R3F 3D graph canvas, select node `wh-001` to view node metadata drawer.
- **WHAT TO SAY**: "FULFILL-X builds a living spatial digital twin of the fulfillment network. Using GNN risk propagation and causal DAG analysis, the system predicts how a disruption at a tier-1 supplier impacts downstream fulfillment centers."
- **JUDGE VISUAL CUE**: 3D node network highlighting risk propagation edges in red/amber.
- **TECHNICAL PROOF**: PyTorch/Scikit embedding model estimates risk propagation probabilities across NetworkX graph edges.

---

### ACT 4 & 5: AGENTS & ADVERSARIAL CHALLENGE (1:30 - 2:45)
- **SCREEN**: `/intelligence` → `/response/adversary`
- **ACTION**: Show specialist agent swarm (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience, Coordinator) and click **"Inject Attack Vector"**.
- **WHAT TO SAY**: "Instead of relying on a single LLM prompt, FULFILL-X deploys 7 specialist agents that independently propose mitigations. Crucially, we introduce an **Adversary Attack Agent** that stress-tests proposed plans against hidden bottleneck failures before approval."
- **JUDGE VISUAL CUE**: Adversary attack vector card highlights plan weaknesses; candidate resilience score updates.
- **TECHNICAL PROOF**: Adversarial red-team agent executes constraint violation checks against proposed multi-agent plans.

---

### ACT 6 & 7: DECISION & VERIFICATION (2:45 - 3:30)
- **SCREEN**: `/decision/cockpit` & `/decision/verification`
- **ACTION**: Open plan comparison matrix and highlight safety plane status (**ENFORCED**).
- **WHAT TO SAY**: "In the Decision Cockpit, trade-offs between cost, delay, service level, and carbon emissions are made explicit. Before any plan can be authorized, it must pass formal deterministic safety verification boundaries."
- **JUDGE VISUAL CUE**: Pareto trade-off radar chart and green verification checkmarks.
- **TECHNICAL PROOF**: Deterministic safety assertion engine checks invariants before setting execution authorization.

---

### ACT 8 & 9: DIGITAL TWIN SIMULATION & EXECUTION (3:30 - 4:15)
- **SCREEN**: `/simulation/twin` & `/observability/events`
- **ACTION**: Click **"Run Monte Carlo Simulation"** (1,000 trials).
- **WHAT TO SAY**: "To ensure resilience across uncertain futures, FULFILL-X runs a 1,000-trial Monte Carlo simulation on our discrete event digital twin engine. Once verified, execution is authorized cleanly through observability channels."
- **JUDGE VISUAL CUE**: Simulation distribution histogram fills dynamically; live WebSocket event stream logs execution telemetry.
- **TECHNICAL PROOF**: Deterministic Python simulation engine runs 1,000 iterations in under 1 second.

---

### ACT 10, 11 & 12: LEARNING, GOVERNANCE & EVALUATION (4:15 - 5:15)
- **SCREEN**: `/learning/deliberate` → `/governance/resilience` → `/evaluation`
- **ACTION**: Highlight challenger model memory bank, policy rules, and final scenario score (94.2%).
- **WHAT TO SAY**: "FULFILL-X closes the loop through deliberate learning, storing operational outcomes into institutional memory to continuously refine future agent recommendations."
- **JUDGE VISUAL CUE**: Evaluation score card displays 94.2% overall resilience rating across 8 benchmark scenarios.
- **TECHNICAL PROOF**: Challenger model evaluation harness scores agent plan validity, risk detection accuracy, and plan feasibility.
