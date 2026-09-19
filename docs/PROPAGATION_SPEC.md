# FULFILL-X Disruption Propagation Specification (Phase 7)

## Multi-Hop Propagation Algorithm
- Traces downstream reachability up to `max_depth` (default 4 hops).
- Computes path decay probability $P = 0.90 \times (0.80)^{h-1}$ for hop distance $h$.
- Outputs primary & secondary trajectories with transit time estimates and impact severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
