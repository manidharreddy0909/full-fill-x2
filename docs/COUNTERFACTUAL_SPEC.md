# FULFILL-X Counterfactual Simulation Specification (Phase 7)

## Sandboxed do-Intervention Sandbox
- Evaluates `do(node.capacity = X)` interventions inside an isolated deep-copied sandbox snapshot.
- Compares baseline network risk & service level against counterfactual scenario to calculate `risk_delta`, `service_delta`, and `cost_delta`.
- Never mutates authoritative production state.
