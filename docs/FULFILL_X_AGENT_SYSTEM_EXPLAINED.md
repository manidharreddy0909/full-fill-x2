# FULFILL-X — AGENT SYSTEM EXPLAINED

> **Location**: `backend/app/agents/`  
> **Schema Standard**: Pydantic structured output models  

---

## 1. Specialist Swarm Roster

| Agent Name | Module File | Primary Objective | Key Input Data | Output Proposal Schema |
| :--- | :--- | :--- | :--- | :--- |
| **Inventory Agent** | `inventory_agent.py` | Minimize stockout risk & safety stock buffer | Node inventory levels & lead times | `InventoryPlanProposal` |
| **Supplier Agent** | `supplier_agent.py` | Reroute supplier allocation & capacity | Supplier health & contract limits | `SupplierRerouteProposal` |
| **Transportation Agent** | `transportation_agent.py` | Optimize carrier routing & shipping costs | Transit times, freight rates, delays | `TransportRouteProposal` |
| **Fulfillment Agent** | `fulfillment_agent.py` | Protect customer SLA fulfillment targets | Warehouse order queues & picking throughput | `FulfillmentAllocationProposal` |
| **Sustainability Agent** | `sustainability_agent.py` | Minimize carbon emissions (CO2e) | Transit mode emissions factors | `SustainabilityMetricsProposal` |
| **Resilience Agent** | `resilience_agent.py` | Reduce systemic network fragility | Graph centrality & bottleneck metrics | `ResilienceScoreProposal` |
| **Coordinator Agent** | `coordinator.py` | Reconcile proposal trade-offs into Pareto set | Proposals from all 6 domain agents | `ReconciledCandidatePlans` |
| **Adversary Agent** | `backend/app/adversary/agent.py` | Red-team attack candidate plans for weakness | ReconciledCandidatePlans | `AdversarialAttackVector` |

---

## 2. Reasoning Lifecycle Stage

```
1. OBSERVE   ─> Reads risk signals & network state from World Model
2. ANALYZE   ─> Evaluates domain impact metrics (cost, delay, carbon, stockout)
3. HYPOTHESIZE ─> Formulates candidate mitigation strategies
4. PROPOSE   ─> Emits structured Pydantic proposal schema to Coordinator
5. VALIDATE  ─> Passes proposal to Safety Boundary & Adversary Agent
```

---

## 3. AI Execution Mode Clarification

- **Mock AI Mode (Default Offline)**: Uses deterministic domain heuristics to return instant structured Pydantic proposals (`seed=42`).
- **Live AI Mode (Configured)**: Connects to Gemini, Ollama, or AWS Bedrock via `backend/app/ai/` provider adapters to execute LLM reasoning prompts with Pydantic JSON schema enforcement.
