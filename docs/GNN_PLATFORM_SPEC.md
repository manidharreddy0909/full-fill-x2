# FULFILL-X GNN Platform Specification (Phase 7)

## Tasks Supported
1. `NODE_RISK_PREDICTION`: Predicts future 24h-168h node risk score using 2-layer GraphSAGE message passing.
2. `EDGE_RISK_PREDICTION`: Predicts route & dependency risk scores on network edges.
3. `DISRUPTION_PROPAGATION`: Predicts multi-hop downstream disruption path reachability and expected impact.

## Baseline Safeguards
- Competes against 3 baselines:
  - Baseline 1: Deterministic Risk Engine score (MAE 0.085)
  - Baseline 2: Network Centrality heuristic (MAE 0.065)
  - Baseline 3: Non-graph ML baseline (MAE 0.055)
- If candidate GNN fails to beat baseline, `is_gnn_preferred = False` safeguards operational deployment.
