# FULFILL-X Graph Neural Networks & Causal Intelligence Architecture (Phase 7)

## Overview
Phase 7 introduces topological message-passing neural networks (GraphSAGE), multi-hop disruption propagation tracing, causal hypothesis generation, and sandboxed counterfactual (`do`-intervention) simulations to FULFILL-X.

```
+-------------------+       +--------------------+       +-------------------------+
| World Model       | ----> | GraphMLAdapter     | ----> | GraphFeatureExtractor   |
| (SupplyNetwork)   |       | (Zero-copy DiGraph)|       | (schema v1.0.0)         |
+-------------------+       +--------------------+       +-------------------------+
                                                                      |
                                                                      v
                                                         +--------------------------+
                                                         | GraphSAGE GNN & Fallback |
                                                         | (Risk & Trajectories)    |
                                                         +--------------------------+
                                                                      |
                                                                      v
                                                         +--------------------------+
                                                         | Propagation & Causal Engine|
                                                         | (Path Decay & Sandbox do)  |
                                                         +--------------------------+
```

## Safety Boundary Enforced
- **Advisory Input**: GNN predictions, propagation traces, and causal hypotheses act strictly as **advisory intelligence** (`GraphSignal` / `CausalSignal`).
- **Zero World State Mutation**: Counterfactual simulations operate strictly inside an isolated deep-copied sandbox environment.
- **No Causal Overclaiming**: Causal associations are labeled with explicit assumptions and status states (`CAUSAL_HYPOTHESIS`, `OBSERVED_ASSOCIATION`, `INSUFFICIENT_EVIDENCE`).
