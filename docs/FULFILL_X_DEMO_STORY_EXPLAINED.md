# FULFILL-X — DEMO STORY EXPLAINED (DEMO-05)

> **Scenario**: DEMO-05 — Full Resilience Challenge  
> **Seed**: 42  
> **Initial Health**: 94.0%  
> **Final Evaluation Score**: 94.2%  

---

## The 13-Act Resilience Narrative

### Act 1: OBSERVE (`/command`)
- **What occurs**: System loads default 23-node supply network state at seed=42. Global network health score reads 94.0% with 0 disrupted nodes.
- **Why it matters**: Demonstrates continuous observation of supply network topology rather than reactive ticket logging.

### Act 2: DETECT (`/command`)
- **What occurs**: Presenter clicks `"Inject Signal"`. A simulated disruption signal hits tier-1 supplier `sup-001`.
- **Why it matters**: Demonstrates early weak-signal detection before total inventory stockout occurs.

### Act 3: UNDERSTAND (`/world`)
- **What occurs**: System transitions to 3D World Model (`/world`). GNN risk propagation predicts bottleneck impact at downstream warehouse `wh-001`.
- **Why it matters**: Shows structural supply network understanding via Graph Neural Networks and Causal DAG models.

### Act 4: SPECIALIST AGENTS (`/intelligence`)
- **What occurs**: 7 domain specialist agents (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience, Coordinator) propose independent mitigations.
- **Why it matters**: Decomposes complex supply problems across domain-expert AI agents instead of relying on a single monolithic prompt.

### Act 5: ADVERSARIAL CHALLENGE (`/response/adversary`)
- **What occurs**: Red-team Adversary Agent attacks candidate proposals, exposing single-supplier backup vulnerability.
- **Why it matters**: Proves FULFILL-X does not blindly trust initial AI recommendations.

### Act 6: DECISION (`/decision/cockpit`)
- **What occurs**: Decision Cockpit compares Pareto trade-offs (cost vs delay vs resilience) and selects `PLAN-RESILIENCE-01`.
- **Why it matters**: Makes operational trade-offs transparent and quantitative.

### Act 7: VERIFICATION (`/decision/verification`)
- **What occurs**: Formal safety boundary checks invariant constraints; status reads `ENFORCED`.
- **Why it matters**: Ensures no unsafe AI recommendation can cross into execution authorization.

### Act 8: DIGITAL TWIN (`/simulation/twin`)
- **What occurs**: Digital twin simulates candidate plan across discrete event timeline.
- **Why it matters**: Validates operational plan performance against a living simulation model.

### Act 9: MONTE CARLO (`/simulation/twin`)
- **What occurs**: Monte Carlo engine executes 1,000-trial stochastic simulation, confirming 99.2% SLA protection.
- **Why it matters**: Stress-tests plan resilience across 1,000 potential future scenarios.

### Act 10: SAFE AUTHORIZATION (`/decision/cockpit`)
- **What occurs**: Single-click authorization gate executes plan cleanly without unvalidated side-effects.
- **Why it matters**: Enforces human-in-the-loop AI safety boundaries.

### Act 11: OBSERVABILITY (`/observability/events`)
- **What occurs**: Live WebSocket event feed logs execution telemetry stream.
- **Why it matters**: Keeps the entire agentic loop transparent and auditable.

### Act 12: LEARNING (`/learning/deliberate`)
- **What occurs**: Outcome is stored into challenger memory bank for continuous improvement.
- **Why it matters**: Converts operational resolution experience into institutional memory.

### Act 13: EVALUATION (`/evaluation`)
- **What occurs**: Benchmark evaluation harness scores system performance at 94.2%.
- **Why it matters**: Provides rigorous quantitative proof of fulfillment resilience.
