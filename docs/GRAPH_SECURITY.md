# FULFILL-X Graph Security & Governance (Phase 7)

## Permissions & RBAC
14 fine-grained permissions:
- `GRAPH_READ`, `GRAPH_ANALYZE`
- `GNN_READ`, `GNN_TRAIN`, `GNN_EVALUATE`, `GNN_ACTIVATE`, `GNN_RETIRE`, `GNN_PREDICT`, `GNN_MANAGE`
- `CAUSAL_READ`, `CAUSAL_ANALYZE`, `CAUSAL_COUNTERFACTUAL`, `CAUSAL_MANAGE`

## Tenant Isolation & Artifact Checksums
All graph snapshots and counterfactual runs include mandatory `organization_id` scoping. Model artifacts are verified with SHA-256 checksums before loading.
