# MONTE CARLO SIMULATION ENGINE SPECIFICATION

## Overview
The `MonteCarloEngine` executes $N$ (100 to 5,000) seeded simulation iterations using CPU worker parallelism.

## Reproducibility & Seed Structure
```
master_seed = 42
run_seed = (master_seed + i * 10007) & 0x7FFFFFFF
```
Repeated runs with the same seed generate 100% identical percentiles and resilience scores.

## Statistical Output
- **Percentiles**: $P_{10}, P_{25}, P_{50}, P_{75}, P_{90}$ for Service Level, Cost, Backlog, and Recovery Time.
- **Value-at-Risk ($VaR_{95}$)**: 95th percentile cost threshold.
- **Conditional Value-at-Risk ($CVaR_{95}$)**: Average cost in the worst 5% of outcomes.
- **Time-to-Recovery (TTR)**: Hours elapsed until network service recovers to $\ge 90\%$.
- **Stockout Probability**: Frequency of unfulfilled demand across iterations.
