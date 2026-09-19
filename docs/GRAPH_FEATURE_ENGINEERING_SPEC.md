# FULFILL-X Graph Feature Engineering Specification (Phase 7)

## Feature Extraction Pipeline
- `GraphFeatureExtractor`: Evaluates topological metrics using NetworkX algorithms (PageRank, betweenness, degree centrality, ancestors, descendants).
- **Leakage Prevention**: All features are extracted from point-in-time graph snapshots with time-aware train/val/test splits.
