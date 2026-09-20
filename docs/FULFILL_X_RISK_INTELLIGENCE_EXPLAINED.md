# FULFILL-X — RISK INTELLIGENCE EXPLAINED

> **Location**: `backend/app/risk/`  

---

## 1. Risk Pipeline Lifecycle

```
RAW SIGNAL INGESTION ─> SIGNAL FUSION ─> NODE RISK SCORING ─> COMPOUND SCENARIO GENERATION ─> AGENT DISPATCH
```

1. **Raw Signal Ingestion**: Ingests telemetry alerts (weather delays, supplier port closures, geopolitical events).
2. **Signal Fusion**: Aggregates overlapping signals using a weighted exponential decay function.
3. **Node Risk Scoring**: Computes individual node risk scores between `0.0` (Healthy) and `1.0` (Severe Disruption).
4. **Compound Scenario Generation**: Combines multi-node vulnerabilities into compound stress scenarios.
5. **Agent Dispatch**: Triggers Specialist Swarm Agents when network risk exceeds the 15% warning threshold.
