# FULFILL-X — Sandbox Execution Simulation Specification

## 1. Overview & Architecture

The **Sandbox Execution Simulator** is the isolated simulation core within `VerificationEngine`. It enables non-destructive evaluation of candidate supply chain interventions (e.g. inventory transfers, supplier re-allocations, route switches, and order priority modifications) prior to human authorization.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTHORITATIVE WORLD STATE                       │
│                        (PostgreSQL / Memory Repo)                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ DEEP CLONE (Immutability Barrier)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SANDBOX SIMULATION SNAPSHOT                       │
│                                                                        │
│   1. Apply Action Mutators  ─────►   2. Propagate Flow & Capacity       │
│                                                   │                    │
│   4. Compute State Delta    ◄─────   3. Re-evaluate Risk & Constraints │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ VERIFICATION FINDINGS
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   HUMAN DECISION COCKPIT (VERIFIED)                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mutator Rules by Action Type

The Sandbox Simulator implements specific mathematical mutations on snapshot clones:

### A. `STOCK_TRANSFER` & `FC_REALLOCATION`
- **Source Node**: $\text{Stock}_{\text{projected}} = \text{Stock}_{\text{current}} - \text{Quantity}$
- **Target Node**: $\text{Stock}_{\text{projected}} = \text{Stock}_{\text{current}} + \text{Quantity}$
- **Validation**:
  - $\text{Stock}_{\text{projected}} < 0 \implies \text{CRITICAL FAILED}$ (`has_negative_inventory = True`)
  - $\text{Stock}_{\text{projected}} < \text{SafetyStock} \implies \text{WARNING}$ (`violates_safety_stock = True`)

### B. `REORDER_STOCK`
- **Target Facility**: $\text{Stock}_{\text{projected}} = \text{Stock}_{\text{current}} + \text{Quantity}$
- **Capacity Impact**: $\text{Utilization}_{\text{projected}} = \frac{\text{Stock}_{\text{projected}}}{\text{FacilityCapacity}}$
- **Validation**: $\text{Utilization}_{\text{projected}} > 1.0 \implies \text{CRITICAL FAILED}$ (`is_over_capacity = True`)

### C. `REROUTE_FLOW` & `MODE_SWITCH`
- **Target Edge**: Reroutes flow units from primary edge to secondary edge.
- **Capacity & Delay**: 
  - $\text{Capacity}_{\text{edge}} = \text{CurrentFlow} + \text{ReroutedVolume}$
  - $\text{Delay}_{\text{projected}} = \text{BaselineDelay} \times \text{CongestionFactor}$
- **Validation**: Edge disruption or blocked route $\implies \text{ERROR FAILED}$ (`is_blocked = True`)

---

## 3. State Diff & Metric Matrix

Post-simulation, `StateDiffCalculator` computes exact pre-versus-post snapshot deltas:

$$\Delta \text{Metric} = \text{Metric}_{\text{Sandbox}} - \text{Metric}_{\text{Baseline}}$$

Recorded deltas include:
- `capacity_utilization_diff`: Facility peak loading delta (%)
- `transport_delay_diff`: Transport chain latency delta (hours)
- `risk_score_diff`: Systemic risk decay or increase
- `cost_diff`: Financial execution cost ($)
- `carbon_emissions_diff`: Environmental footprint delta ($kg\text{ CO}_2$)

---

## 4. Safety & Immutability Verification

`VerificationService` includes automated assertion checks:
```python
assert world_repo.get_snapshot() == baseline_snapshot
assert risk_repo.get_risk_map() == baseline_risk_map
```
This guarantees 100% state isolation—no candidate plan simulation can ever leak into or pollute the authoritative live world model.
