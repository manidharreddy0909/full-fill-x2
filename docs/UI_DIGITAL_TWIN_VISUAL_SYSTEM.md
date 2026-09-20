# FULFILL-X — Phase 13D-1 Digital Twin & Simulation Visual System

## 1. Visual Philosophy & Story
The FULFILL-X Digital Twin Laboratory transforms `/simulation/twin` from a passive analytics page into a living, high-precision simulation engine for resilient supply chain operations.

The central narrative flow:
```
REAL WORLD → WORLD MODEL → SCENARIO → DIGITAL TWIN → SIMULATION → MANY POSSIBLE OUTCOMES → RISK / CRITICALITY → RESILIENCE INSIGHT
```

### Visual Environment: DIGITAL TWIN LABORATORY
- **Atmosphere**: Scientific, spatial, cinematic, operational, controlled high-tech.
- **Color Palette**: Obsidian (`#030712`) background, cyan (`#06b6d4`), emerald (`#10b981`), violet (`#8b5cf6`), amber (`#f59e0b`), crimson (`#ef4444`) for critical disruption states.
- **Micro-Interactions**: Glassmorphic panels, subtle glow shaders, dynamic telemetry status indicators, interactive percentile distribution bars.

---

## 2. Component & Workspace Architecture

### DigitalTwinWorkspace (`frontend/src/components/workspaces/DigitalTwinWorkspace.tsx`)
1. **Header HUD Bar**:
   - Simulation ID, seed (`0x7F4A9E`), iterations count, horizon (days), and status pill (`STANDBY`, `EXECUTING`, `COMPLETED`).
   - View Mode Switcher: `[ BASELINE ] [ SIMULATED ] [ DIFFERENCE ]`.
2. **Left Panel: Scenario Configurator (`ScenarioConfigurator.tsx`)**:
   - Precise input controls mapped to backend schema:
     - Demand Shock (`demand_shock_pct`): range -50% to +100%.
     - Recovery Delay (`recovery_delay_multiplier`): 0.5x to 3.0x.
     - Simulation Iterations (`n_simulations`): 50 to 5000 runs.
     - Forecast Horizon (`horizon`): 7 to 90 days.
     - Deterministic Seed (`seed`): integer seed for reproducible Monte Carlo runs.
3. **Center Panel: 3D Living Digital Twin World**:
   - Reuses spatial primitives: `WorldNodePrimitive`, `FlowEdgePrimitive`, `AtmosphereLayer`, `CameraController`.
   - Visualizes disruption propagation, edge load changes, and node criticality levels in 3D.
4. **Right Panel: Monte Carlo Results (`MonteCarloDistribution.tsx`)**:
   - Real percentile bands: P10, P50, P90 Service Level.
   - Stockout Probability & CVaR 95% Cost.
   - TTR P90 (Time to Recover).
   - 8-Dimension Supply Network Resilience Breakdown (Redundancy, Absorptive, Adaptive, Restorative, Flexibility, Visibility, Collaboration, Velocity).
5. **Bottom Panel: Criticality Rankings Table (`CriticalityRankingsTable.tsx`)**:
   - Sorted list of critical nodes based on simulation outcome.
   - Interactive selection triggers camera focus on the node in 3D.

---

## 3. Simulation Lifecycle States

- **NO SIMULATION / STANDBY**: Displaying base world model awaiting scenario configuration.
- **EXECUTING**: Full-screen status banner with real backend request lifecycle (`POST /api/simulation/monte-carlo`).
- **COMPLETED**: Detailed Monte Carlo outcome distribution, resilience curve, criticality rankings, and baseline vs. simulated delta highlighting.
- **ERROR**: Clear diagnostic feedback panel if API request fails.

---

## 4. API & Data Mappings

- **Twin Status**: `GET /api/simulation/twin/status` -> `TwinStatus`
- **Create Twin**: `POST /api/simulation/twin/create` -> `TwinModel`
- **Run Monte Carlo**: `POST /api/simulation/monte-carlo` -> `MonteCarloResult`
  - Body: `{ demand_shock_pct, recovery_delay_multiplier, n_simulations, horizon, seed }`
- **Analyze Criticality**: `POST /api/simulation/criticality` -> `CriticalityResult[]`

---

## 5. Non-Authoritative Frontend Compliance
- **No Local Fabrication**: All outcome numbers, probabilities, CVaR figures, and node criticality scores come directly from backend endpoint calculations.
- **Deterministic Replay**: Passing identical seeds produces identical backend Monte Carlo outcomes.
