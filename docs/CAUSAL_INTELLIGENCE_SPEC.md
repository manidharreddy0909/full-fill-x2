# FULFILL-X Causal Intelligence Specification (Phase 7)

## Causal Hypothesis Structure
- `CausalHypothesis`: Formally models relationships between root cause nodes and downstream target nodes.
- **Statuses**: `OBSERVED_ASSOCIATION`, `CAUSAL_HYPOTHESIS`, `SUPPORTED_BY_EXPERIMENT`, `REJECTED`, `INSUFFICIENT_EVIDENCE`.
- **Explicit Assumptions**: Tracks domain assumptions (e.g. active route status, constant throughput) to prevent correlation/causation conflation.
