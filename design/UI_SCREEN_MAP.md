# FULFILL-X — UI Screen Map

## 1. Purpose

Map all 12 screens: layout zones, component inventory, data requirements,
and interaction hotspots.

---

## Screen 1: Command Center (`/command`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Network Health Score (large) | AI Provider | WS Status  │
├──────────────────────────────┬──────────────────────────────────┤
│ KPI ROW (4 cards)            │                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌┤ MINI 3D WORLD                    │
│ │Health│ │Risks │ │SLA   │ ││ (React Three Fiber, 40% width)   │
│ │ 0.58 │ │  7   │ │ 0.78 │ ││                                  │
│ └──────┘ └──────┘ └──────┘ └┤                                  │
│                              │                                  │
│ SIGNAL FEED (scrollable)     ├──────────────────────────────────┤
│ ● CRITICAL Typhoon Osaka     │ TOP 3 RISKS                      │
│ ● HIGH Factory Fire Shenzhen │ 1. Osaka WH — 0.90               │
│ ● MEDIUM Demand Spike NA     │ 2. Apex Electronics — 0.88       │
│                              │ 3. APAC Route — disrupted        │
│ [Create Scenario] [Run Agents│                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

### Components
- `MetricCard` × 4
- `SignalFeed` (virtual scroll, WebSocket-updated)
- `MiniWorldScene` (R3F canvas, simplified)
- `TopRiskList`
- `QuickActionButtons`

### Data
- `GET /api/world` → health score
- `GET /api/signals` → signal feed
- `GET /api/risks` → top risks
- `WS: world.update, signal.new, risk.update`

---

## Screen 2: 3D World Model (`/world`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    FULL VIEWPORT                                │
│              React Three Fiber Canvas                           │
│         (orbit, pan, zoom, click nodes/edges)                   │
│                                                                 │
│                                                                 │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐ │
│  │ CONTROL PANEL (float)    │  │ NODE INSPECTOR (float)       │ │
│  │ ○ Risk Heatmap           │  │ Osaka Warehouse              │ │
│  │ ○ Particle Flow          │  │ Risk: 0.90 | Inv: 0.45       │ │
│  │ ○ Agent Overlay          │  │ Status: DISRUPTED            │ │
│  │ Filter: [All] [Supplier] │  │ [View Details] [Run Agents]  │ │
│  └──────────────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Components
- `WorldScene` (R3F full canvas)
- `ControlPanel` (floating panel, Framer Motion)
- `NodeInspector` (floating panel, appears on click)
- `CameraControls` (GSAP-animated)

### Data
- `GET /api/world` → nodes, edges
- `WS: world.update` → live updates

---

## Screen 3: Signal Intelligence (`/signals`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ FILTERS: [Type ▾] [Severity ▾] [Region ▾] [Status ▾]  [Search] │
├──────────────────────────────┬──────────────────────────────────┤
│ SIGNAL LIST (sortable)       │ SIGNAL DETAIL                    │
│ ┌────────────────────────┐   │                                  │
│ │● CRITICAL WEATHER      │◄  │ Typhoon Hana                    │
│ │  Typhoon Hana - Osaka  │   │ ────────────────────────────    │
│ │  Conf: 0.94  3m ago    │   │ Severity: CRITICAL               │
│ └────────────────────────┘   │ Confidence: 0.94                 │
│ ┌────────────────────────┐   │ Region: APAC                    │
│ │● HIGH SUPPLIER_HEALTH  │   │ Affected Nodes: 3               │
│ │  Factory Fire Shenzhen │   │ Source: JMA Weather              │
│ │  Conf: 0.88  8m ago    │   │                                  │
│ └────────────────────────┘   │ MINI MAP (geographic scope)      │
│                              │                                  │
│ [Load More]                  │ [Pin] [Promote to Scenario]      │
└──────────────────────────────┴──────────────────────────────────┘
```

### Components
- `SignalFilter`
- `SignalList` (virtual scroll)
- `SignalCard`
- `SignalDetail`
- `GeoMiniMap`

---

## Screen 4: Risk Explorer (`/risks`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ TIME HORIZON: [Current] [24h] [7d]    SORT BY: [Composite ▾]   │
├───────────────────────┬─────────────────┬───────────────────────┤
│ RISK TABLE (sortable) │ RISK HEAT MAP   │ NODE RISK DETAIL      │
│ Node      Comp  SLA   │ (2D grid/map)   │                       │
│ OsakaWH   0.90  0.95  │                 │ Osaka Warehouse       │
│ Apex Elec 0.88  0.80  │ Color = risk    │ ─────────────────────  │
│ APAC Rt   0.72  0.85  │ heatmap         │ Financial:  ████ 0.72 │
│ Tokyo DC  0.68  0.70  │                 │ SLA:        █████ 0.95│
│ ...                   │                 │ Operational:████ 0.80 │
│                       │                 │ Sustainability:██ 0.40│
│                       │                 │                       │
│                       │                 │ [Export Risk Report]  │
└───────────────────────┴─────────────────┴───────────────────────┘
```

### Components
- `RiskTable`
- `RiskHeatMap` (2D canvas or SVG)
- `NodeRiskDetail`
- `RiskBar` × 4
- `TimeHorizonSelector`

---

## Screen 5: Scenario Lab (`/scenarios`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO: [Select existing ▾]  or  [+ New Scenario]             │
├──────────────┬──────────────────────────────┬───────────────────┤
│ SIGNAL       │ SCENARIO CANVAS (React Flow) │ SCENARIO PARAMS   │
│ SELECTOR     │                              │                   │
│ ┌──────────┐ │  [Signal 1]──CONCURRENT──    │ Name: [______]   │
│ │● CRITICAL│ │  [Signal 2]                  │ Duration: [72h]  │
│ │ Typhoon  │ │                              │ Magnitude: [1.2x]│
│ └──────────┘ │                              │ Relationship:    │
│ ┌──────────┐ │  + Add Signal                │ ○ Concurrent     │
│ │● HIGH    │ │                              │ ○ Cascading      │
│ │ Factory  │ │                              │ ○ Amplifying     │
│ └──────────┘ │                              │                   │
│              │                              │ RISK DELTA:       │
│              │                              │ SLA: 0.20→0.72    │
│              │                              │                   │
│              │ MINI 3D EMBED (sim result)   │ [Simulate]        │
│              │ (disruption wave preview)    │ [Run Agents]      │
└──────────────┴──────────────────────────────┴───────────────────┘
```

---

## Screen 6: Agent War Room (`/agents`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO: "The Double Punch"  │ Status: 6/6 Complete  │ 3.2s   │
├─────────────────────────────────────────────────────────────────┤
│ AGENT GRID (2×4)                                                │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│ │◎ Inventory   │ │◎ Supplier    │ │◎ Transport   │ │◎ Fulfil│ │
│ │ COMPLETE     │ │ COMPLETE     │ │ COMPLETE     │ │COMPLETE│ │
│ │ 12 reorders  │ │ 2 switches   │ │ 3 reroutes   │ │SLA: OK │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│ │◎ Sustain     │ │◎ Resilience  │ │◎ Coordinator │ │◎ Advers│ │
│ │ COMPLETE     │ │ COMPLETE     │ │ COMPLETE     │ │COMPLETE│ │
│ │ +8% emit.    │ │ 3 SPOFs      │ │ 3 plans      │ │ 0.78   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ PROPOSAL DETAIL (selected agent)                                │
│ Reasoning: "Priority reorder triggered by Osaka WH stockout..." │
│ Evidence: [Inventory level 0.45] [Demand forecast +20%]         │
│ Actions: Reorder 500 units from Backup Supplier C (confidence 0.89)│
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 7: Plan Comparison (`/plans`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ PLAN CARDS (horizontal)                                         │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ #1 BEST SLA      │ │ #2 BALANCED ✓    │ │ #3 MIN COST      │ │
│ │ SLA: 0.91        │ │ SLA: 0.85        │ │ SLA: 0.72        │ │
│ │ Cost: +$42K      │ │ Cost: +$38K      │ │ Cost: +$22K      │ │
│ │ Emit: +12%       │ │ Emit: +8%        │ │ Emit: +5%        │ │
│ │ Adv: ████ 0.81   │ │ Adv: ████ 0.78   │ │ Adv: ██░░ 0.61   │ │
│ │ [Select]         │ │ [Select]         │ │ [Select]         │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ RADAR CHART (overlay all 3 plans)  │ METRIC TABLE               │
│ (Cost, SLA, Emissions, Fragility,  │ Metric  Plan1  Plan2  Plan3│
│  Adversary)                        │ SLA     0.91   0.85   0.72 │
│                                    │ Cost    -12%   -10%   -5%  │
│                                    │ Emit    +12%   +8%    +5%  │
│                                    │ Frag    -20%   -15%   -8%  │
└────────────────────────────────────┴────────────────────────────┘
```

---

## Screen 8–12 layouts abbreviated

**Screen 8 (Adversary Attack)**: Plan selector top; React Flow attack tree center; finding list right.

**Screen 9 (Stress Test)**: Plan selector; stressor checkboxes panel; progress bar; results grid (pass/fail).

**Screen 10 (Decision Cockpit)**: Full-width plan summary card; metric breakdown; approve/reject/defer buttons; audit log feed.

**Screen 11 (Evaluation)**: Test suite list left; results dashboard right; historical trend Recharts chart bottom.

**Screen 12 (System Status)**: Service status grid (colored indicators); latency Recharts; AI provider cards with switch button.

---

## Component Reuse Matrix

| Component | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | S12 |
|-----------|----|----|----|----|----|----|----|----|----|----|-----|-----|
| MetricCard | ✓ | | | | | | | | | ✓ | ✓ | ✓ |
| AgentCard | | | | | | ✓ | | | | | | |
| SignalBadge | ✓ | | ✓ | | ✓ | | | | | | | |
| PlanCard | | | | | | | ✓ | ✓ | ✓ | ✓ | | |
| RiskBar | | | | ✓ | | ✓ | | | | | | |
| RadarChart | | | | | | | ✓ | | | ✓ | | |
| 3D Scene | ✓ | ✓ | | | ✓ | | | | | | | |
