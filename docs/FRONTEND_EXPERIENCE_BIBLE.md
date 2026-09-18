# FULFILL-X — Frontend Experience Bible

## 1. Purpose

Define the complete frontend experience: every screen's purpose, user
goals, components, data requirements, API, WebSocket events, state,
animations, 3D relationship, error/loading/empty states, and accessibility.

This document drives implementation. Every screen in `frontend/src/screens/`
must map to a section here.

---

## 2. Application Shell

### App Boot Sequence

```
1. SPA loads (CloudFront → index.html + JS bundle)
2. QueryClientProvider + ThemeProvider + WebSocketProvider initialize
3. WebSocket connects → connection.ready received
4. GET /api/world (TanStack Query, instant cache check)
5. GET /api/risks/network
6. GET /api/signals
7. Route: / → redirect to /command
8. Command Center renders with loading skeletons
9. Data arrives → content renders
10. WebSocket events begin: world.update, signal.detected
```

### Shell Layout

```
┌────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                        │
│ [FULFILL-X logo] Network: DEGRADED 0.58  [WS: ●] [Provider: G]│
├─────────────┬──────────────────────────────────────────────────┤
│             │                                                  │
│ SIDEBAR     │  SCREEN OUTLET                                   │
│ (72px wide) │  (12 screen components)                          │
│             │                                                  │
│ [⌘] Command │                                                  │
│ [🌐] World  │                                                  │
│ [📡] Signals│                                                  │
│ [⚠] Risks   │                                                  │
│ [🧪] Scen.  │                                                  │
│ [🤖] Agents │                                                  │
│ [📊] Plans  │                                                  │
│ [⚔] Advers.│                                                  │
│ [🔬] Stress │                                                  │
│ [✅] Decide │                                                  │
│ [📈] Eval   │                                                  │
│ [⚙] System  │                                                  │
│             │                                                  │
├─────────────┴──────────────────────────────────────────────────┤
│ STATUS BAR: WS status | Active scenario | Last event | Time    │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Screen 01 — Command Center (`/command`)

**Purpose**: Real-time operational overview — health, signals, top risks, quick actions.

**User Goal**: In 5 seconds, understand the current network state and decide next action.

**Primary CTA**: "Create Scenario" | "Run Agents"

### Data Required

| Data | Source | Refresh |
|------|--------|---------|
| `network_health_score` | `GET /api/risks/network` | `risk.update` WS |
| `active_signals` | `GET /api/signals` | `signal.detected` WS |
| `top_risks` | `GET /api/risks/network` | `risk.update` WS |
| `world_nodes` (mini 3D) | `GET /api/world` | `world.update` WS |
| `active_scenario` | `GET /api/scenarios` | `scenario.activated` WS |

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HERO: Network Health Score                                   │
│ ●  0.58  DEGRADED  ──────────────────────  [40%=amber bar]  │
├──────────────────────┬──────────────────────────────────────┤
│ KPI ROW (4 cards)    │                                      │
│ ┌─────────────────┐  │  MINI 3D GLOBE (right 40%)           │
│ │ Active Signals  │  │  (full width × 40% height)           │
│ │      7          │  │  Simplified node network             │
│ │  ▲ 2 CRITICAL   │  │  Live: color = risk                 │
│ └─────────────────┘  │  Clickable: navigate to /world       │
│ ┌─────────────────┐  │                                      │
│ │ At-Risk Nodes   │  │                                      │
│ │      12         │  │                                      │
│ └─────────────────┘  │                                      │
│ ┌─────────────────┐  ├──────────────────────────────────────┤
│ │ SLA Risk (mean) │  │ TOP 5 RISKS (list)                   │
│ │     0.72        │  │ 1. Apex Electronics — 0.88 CRITICAL  │
│ └─────────────────┘  │ 2. Osaka Warehouse — 0.82 HIGH       │
│ ┌─────────────────┐  │ 3. APAC Route — disrupted            │
│ │ Active Plans    │  │ 4. Seoul FC — 0.65 ELEVATED          │
│ │      0          │  │ 5. Tier-2 Supplier B — 0.55 ELEVATED │
│ └─────────────────┘  │                                      │
├──────────────────────┴──────────────────────────────────────┤
│ SIGNAL FEED (live scroll, virtual)                          │
│ ● CRITICAL · Typhoon Hana · 3m ago                          │
│ ● HIGH · Factory Fire Shenzhen · 8m ago                     │
│ ● MEDIUM · Demand Spike NA · 1h ago                         │
├─────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS: [+ Create Scenario] [▶ Run Agents] [⚙ Seed] │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `NetworkHealthHero` — large score + status + color bar
- `MetricCard` × 4
- `SignalFeed` — virtual scroll, live WebSocket updates
- `MiniWorldScene` — R3F canvas (simplified, non-interactive)
- `TopRiskList` — ordered list with risk bars

### Animation
- Health score: counter animation on mount (300ms)
- Signal new arrival: slide-in from top + toast for CRITICAL
- Risk updates: KPI cards pulse briefly (200ms)

### Error State
"Failed to load dashboard" with retry button. Last known values cached.

### Loading State
Skeleton cards matching layout. MiniWorldScene shows empty globe with spinner.

### Empty State
If no signals: "Network Healthy — No Active Signals" + green illustration.

### Accessibility
- All KPIs have `aria-label`
- Signal feed has `aria-live="polite"`
- Health score announced on update

---

## 4. Screen 02 — 3D World Model (`/world`)

**Purpose**: Interactive 3D visualization of the entire supply network.

**User Goal**: Understand spatial relationships; inspect disrupted nodes; trigger actions.

**Primary CTA**: "Run Agents" (node inspector)

### Data Required
`GET /api/world` → nodes + edges → Zustand `worldSnapshot`

### Layout
Full-viewport canvas. Floating panels.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                 REACT THREE FIBER CANVAS                    │
│          (orbit, pan, zoom, click, hover)                   │
│                                                             │
│  ┌──────────────────────┐                                   │
│  │ CONTROL PANEL (float)│  ┌───────────────────────────┐   │
│  │ ○ Risk Heatmap       │  │ NODE INSPECTOR (float)     │   │
│  │ ○ Flow Particles     │  │ Apex Electronics           │   │
│  │ ○ Agent Overlay      │  │ SUPPLIER · TIER 1 · APAC  │   │
│  │ ○ Dependency Edges   │  │ ──────────────────────     │   │
│  │ Type: [All ▾]        │  │ Risk: 0.88 ████████░       │   │
│  │ Region: [All ▾]      │  │ Financial: 0.72            │   │
│  │                      │  │ SLA: 0.80                  │   │
│  │ [Reset Camera R]     │  │ Operational: 0.90          │   │
│  └──────────────────────┘  │ Inventory: 0.45            │   │
│                             │ Status: DISRUPTED          │   │
│                             │ Signals: Typhoon Hana      │   │
│                             │                            │   │
│                             │ [View in Risk Explorer]    │   │
│                             │ [Run Agents on This Node]  │   │
│                             └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `WorldScene` (R3F full canvas)
- `NodeLayer` (instanced mesh + selection ring)
- `EdgeLayer` (tube geometry + particle flow)
- `DisruptionWave` (shader-based expanding ring)
- `AgentOverlay` (orbit icons per active agent)
- `ControlPanel` (floating, Framer Motion)
- `NodeInspector` (floating, Framer Motion slide-in from right)
- `EdgeDetail` (floating, smaller)
- `PostProcessing` (bloom + FXAA)
- `OrbitControls` (Three.js OrbitControls + GSAP camera transitions)

### Animations
- **Idle**: Subtle ambient particle flow on all routes
- **Node hover**: Scale +5%, tooltip
- **Node select**: Ring appears, inspector slides in (250ms)
- **Risk update**: Color lerp on affected nodes (400ms)
- **Disruption**: Wave animation at disrupted node
- **Double-click**: Camera flies in to node (GSAP, 1200ms)
- **R key**: Camera resets (GSAP, 800ms)

### 3D Relationship
This IS the 3D screen. Source: Zustand `worldSnapshot`.
Updated by `world.update` + `risk.propagated` WebSocket events.

### WebGL Fallback
If WebGL unavailable: React Flow 2D graph with same data.

### Empty State
"Loading world model..." spinner in center of canvas.

### Accessibility
- 2D list fallback accessible by keyboard
- Node names announced on focus

---

## 5. Screen 03 — Signal Intelligence (`/signals`)

**Purpose**: Browse, filter, and act on disruption signals.

**User Goal**: Find critical signals, understand their scope, promote to scenario.

**Primary CTA**: "Promote to Scenario"

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ FILTER BAR                                                  │
│ [Type ▾] [Severity ▾] [Region ▾] [Status ▾] [🔍 Search...]  │
├──────────────────────────┬──────────────────────────────────┤
│ SIGNAL LIST              │ SIGNAL DETAIL                    │
│ (virtual scroll)         │                                  │
│                          │ ═══════ TYPHOON HANA ═══════════ │
│ ● CRITICAL               │ Severity: CRITICAL               │
│   Typhoon Hana — Osaka   │ Type: WEATHER                    │
│   Conf: 0.94 · 3m ago    │ Confidence: 0.94 (●●●●○)        │
│                          │ Detected: 3m ago                 │
│ ● HIGH                   │ Region: APAC                     │
│   Factory Fire Shenzhen  │                                  │
│   Conf: 0.88 · 8m ago    │ Affected Nodes (3):             │
│                          │ • Osaka Warehouse [wh-001]       │
│ ● MEDIUM                 │ • Port of Osaka [port-001]       │
│   Demand Spike NA        │ • APAC Route [rt-001]            │
│   Conf: 0.61 · 1h ago    │                                  │
│                          │ Source: JMA Weather Service       │
│ ● LOW                    │ Raw: typhoon_hana_jma_2026...    │
│   Shipping Delays APAC   │                                  │
│   Conf: 0.40 · 2h ago    │ GEO MINI MAP (leaflet/svg)       │
│                          │ [polygon overlay on map]         │
│ [Load More ↓]            │                                  │
│                          │ ACTIONS:                         │
│                          │ [📌 Pin] [🧪 Promote to Scenario]│
│                          │ [✓ Mark Resolved]                │
└──────────────────────────┴──────────────────────────────────┘
```

### Components
- `SignalFilter` (multi-select dropdowns + search)
- `SignalList` (virtual scroll via `@tanstack/react-virtual`)
- `SignalCard` (status dot + severity + confidence badge + time)
- `SignalDetail` (panel with full attributes)
- `ConfidenceBar` (5-dot visual for confidence level)
- `GeoMiniMap` (static SVG or minimal Leaflet map)
- `AffectedNodesList` (clickable links → navigate to 3D screen focused on node)

### WebSocket
`signal.detected` → prepend to list + highlight.
`signal.resolved` → update status in list.

### Loading State
Skeleton list rows.

### Empty State (filtered)
"No signals matching current filters" + "Clear Filters" button.

### Empty State (no signals)
"Network is clean — no active disruption signals" + green check icon.

---

## 6. Screen 04 — Risk Explorer (`/risks`)

**Purpose**: Explore multi-dimensional risk scores across all network nodes.

**User Goal**: Identify highest-risk nodes and understand their risk composition.

**Primary CTA**: "Explain Risk" → expand to detail

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ CONTROLS: Time Horizon [Current ▾] · Sort [Composite ▾]     │
│ Network Health: ██████░░░░ 0.58                             │
├────────────────────┬──────────────────┬─────────────────────┤
│ RISK TABLE         │ HEAT MAP         │ NODE DETAIL          │
│ (sortable)         │ (grid/matrix)    │                      │
│                    │                  │ Apex Electronics     │
│ Node       Comp    │ Color = risk     │ ════════════════════  │
│ ApexElec   0.88    │ Row = region     │ Financial  ████ 0.72 │
│ OsakaWH    0.82    │ Col = node type  │ SLA        ████ 0.80 │
│ APACRt     0.72    │                  │ Operational█████0.90 │
│ TokyoDC    0.65    │ [Click cell →    │ Sustain    ██░░ 0.45 │
│ SeoulFC    0.58    │  select node]    │                      │
│ ...                │                  │ Contributing:        │
│                    │                  │ • Typhoon Hana 0.72  │
│ [Export CSV]       │                  │ • Propagated/Osaka   │
│                    │                  │                      │
│                    │                  │ [View in 3D World]   │
└────────────────────┴──────────────────┴─────────────────────┘
```

### Components
- `RiskTable` (sortable, virtualized for 30+ nodes)
- `RiskHeatMap` (2D SVG grid; color by risk; click to select node)
- `NodeRiskDetail` (4 dim bars + contributing signals + propagation chain)
- `RiskBar` (thin bar with color gradient; value label)
- `TimeHorizonSelector` (current / 24h projection / 7d projection)

### WebSocket
`risk.update` → update table + heat map.
`risk.propagated` → animate wave on heat map.

### Loading State
Table: skeleton rows. Heat map: grey grid squares.

---

## 7. Screen 05 — Scenario Lab (`/scenarios`)

**Purpose**: Compose compound disruption scenarios from signals and simulate their effects.

**User Goal**: Understand compound risk before committing to an agent run.

**Primary CTA**: "Simulate" then "Run Agents"

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Select Scenario ▾]  or  [+ New Scenario]                   │
├─────────────────┬────────────────────────┬──────────────────┤
│ SIGNAL PICKER   │ SCENARIO CANVAS        │ PARAMS           │
│                 │ (React Flow)           │                  │
│ ● CRITICAL      │                        │ Name: [_______]  │
│  Typhoon Hana   │ [Sig1]─CONCURRENT─     │                  │
│  [Add +]        │ [Sig2]                 │ Relation:        │
│                 │                        │ ● Concurrent     │
│ ● HIGH          │                        │ ○ Cascading      │
│  Factory Fire   │                        │ ○ Amplifying     │
│  [Add +]        │                        │                  │
│                 │  + Add Signal          │ Magnitude: 1.2×  │
│ ● MEDIUM        │                        │ Duration: [72h]  │
│  Demand Spike   │                        │ Cascade delay:   │
│  [Add +]        │                        │ [6h] (if casc.)  │
│                 │                        │                  │
│                 │                        │ RISK DELTA       │
│                 │                        │ SLA: 0.20 → 0.72 │
│                 │ MINI 3D (bottom)       │ Cost: +$1.2M est │
│                 │ Disruption wave        │ Nodes at risk: 8 │
│                 │ animation preview      │                  │
│                 │                        │ [💡 Simulate]    │
│                 │                        │ [▶ Run Agents]   │
└─────────────────┴────────────────────────┴──────────────────┘
```

### Components
- `ScenarioSelector` (dropdown with existing scenarios)
- `SignalPicker` (filterable list; click to add to canvas)
- `ScenarioCanvas` (React Flow; nodes = signals; edges = relationship type)
- `RelationshipSelector` (radio: CONCURRENT / CASCADING / AMPLIFYING)
- `MagnitudeSlider` (0.1–10.0)
- `DurationInput`
- `RiskDeltaPanel` (shows before/after risk metrics)
- `MiniSimulationView` (R3F embed; plays propagation animation)

### WebSocket
`scenario.propagation_step` → animate each step in mini-3D view.
`scenario.simulated` → show risk delta, enable "Run Agents".

### Empty State (canvas)
"Add signals from the list to start building your scenario"

---

## 8. Screen 06 — Agent War Room (`/agents`)

**Purpose**: Monitor all specialist agents running in parallel.

**User Goal**: Watch agents work; review proposals; see which agents produced results.

**Primary CTA**: "View Plans" (enabled after coordinator completes)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PIPELINE STATUS                                             │
│ Scenario: "The Double Punch" · Provider: Gemini             │
│ Status: ██░░░░░░░░ 6/8 Complete · 3.2s elapsed             │
├─────────────────────────────────────────────────────────────┤
│ AGENT GRID (2 × 4)                                          │
│                                                             │
│ ┌─────────────────┐ ┌──────────────────┐ ┌──────────────┐  │
│ │ ◎ INVENTORY     │ │ ◎ SUPPLIER       │ │ ◎ TRANSPORT  │  │
│ │ COMPLETE ✓      │ │ COMPLETE ✓       │ │ RUNNING ●    │  │
│ │ 12 reorders     │ │ 2 switches       │ │              │  │
│ │ 4 transfers     │ │ conf: 0.81       │ │ ████░░ 45%   │  │
│ │ conf: 0.88      │ │                  │ │              │  │
│ │ [View Detail]   │ │ [View Detail]    │ │              │  │
│ └─────────────────┘ └──────────────────┘ └──────────────┘  │
│                                                             │
│ ┌─────────────────┐ ┌──────────────────┐ ┌──────────────┐  │
│ │ ◎ FULFILLMENT   │ │ ◎ SUSTAINABILITY  │ │ ◎ RESILIENCE │  │
│ │ COMPLETE ✓      │ │ COMPLETE ✓       │ │ TIMEOUT ⚠    │  │
│ │ SLA: OK         │ │ +8% emissions    │ │ [Retry]      │  │
│ └─────────────────┘ └──────────────────┘ └──────────────┘  │
│                                                             │
│ ┌───────────────────────────────┐ ┌──────────────────────┐ │
│ │ ◎ COORDINATOR                 │ │ ◎ ADVERSARY          │ │
│ │ COMPLETE ✓ · 3 plans ranked   │ │ RUNNING ●           │ │
│ │ 1 conflict resolved           │ │ Attacking Plan A...  │ │
│ └───────────────────────────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ SELECTED AGENT DETAIL (click any card)                      │
│ Agent: Inventory Agent                                      │
│ Reasoning: "Priority reorder triggered by Osaka WH         │
│             stockout probability 0.82 within 48h..."       │
│ Evidence: [Inventory 0.45] [Demand +20%] [Lead time 96h]   │
│ Actions: Reorder 500u from Backup Supply Inc (conf: 0.89)  │
│          Transfer 200u: EU Hub → APAC (cost: $4,200)       │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `PipelineStatusBar` (scenario name, provider, progress, timer)
- `AgentCard` × 8 (status dot, metrics, progress bar when RUNNING)
- `AgentDetail` (proposal reasoning, evidence, actions table)
- `ConflictResolutionList` (coordinator card detail)

### WebSocket
`agent.started` → card status → RUNNING.
`agent.proposal` → card status → COMPLETE/FAILED/TIMEOUT.
`coordinator.updated` → coordinator card → COMPLETE.
`adversary.attack` → adversary card → COMPLETE; "View Plans" button activates.

### Empty State
"Select or create a scenario, then click Run Agents"

### Loading State (pipeline running)
Each card animates between RUNNING (pulsing ring) and COMPLETE.

---

## 9. Screen 07 — Plan Comparison (`/plans`)

**Purpose**: Compare ranked plans across multiple objectives.

**User Goal**: Select the best plan based on trade-offs.

**Primary CTA**: "Go to Decision Cockpit" with selected plan.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PLAN CARDS (horizontal, scrollable if > 5)                  │
│                                                             │
│ ┌────────────────┐ ┌─────────────────┐ ┌────────────────┐  │
│ │ #1 BEST SLA    │ │ #2 BALANCED ★   │ │ #3 MIN COST    │  │
│ │ Score: 0.82    │ │ Score: 0.79     │ │ Score: 0.68    │  │
│ │ SLA: 0.91      │ │ SLA: 0.85       │ │ SLA: 0.72      │  │
│ │ Cost: +$42K    │ │ Cost: +$38K     │ │ Cost: +$22K    │  │
│ │ Emit: +12%     │ │ Emit: +8%       │ │ Emit: +5%      │  │
│ │ Adv: ████ 0.81 │ │ Adv: ████ 0.78  │ │ Adv: ██░░ 0.61 │  │
│ │ [ Select ]     │ │ [ Select ✓ ]   │ │ [ Select ]     │  │
│ └────────────────┘ └─────────────────┘ └────────────────┘  │
├────────────────────────────┬────────────────────────────────┤
│ RADAR CHART                │ METRIC TABLE                   │
│ (overlay all 3 plans)      │ Metric     #1     #2     #3    │
│                            │ SLA       0.91   0.85   0.72  │
│   Cost ─────── SLA         │ Cost      +$42K  +$38K  +$22K │
│        ╲      ╱            │ Emissions  +12%   +8%    +5%  │
│   Frag  ╲    ╱ Emit       │ Fragility  -20%  -15%   -8%  │
│                            │ Adversary  0.81   0.78   0.61  │
│ Legend: ── #1, ─ ─ #2     │                                │
│          ···  #3            │                                │
└────────────────────────────┴────────────────────────────────┘
│ ADVERSARY FINDINGS (for selected plan)                      │
│ Finding 1: [HIGH] Alt Manila route collapses at +20% demand │
│ Finding 2: [MEDIUM] EU backup supplier 6-week lead time     │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `PlanCard` (metrics summary + select toggle)
- `RadarChart` (Recharts RadarChart with 3 overlapping datasets)
- `MetricComparisonTable`
- `AdversaryFindingList` (accordion items per finding)

---

## 10. Screen 08 — Adversary Attack (`/adversary`)

**Purpose**: Detailed adversarial analysis of a plan's vulnerabilities.

**User Goal**: Understand what could go wrong; assess whether risks are acceptable.

**Primary CTA**: "Accept Risk" → return to Decision Cockpit | "Re-run Adversary"

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Plan: "Balanced Recovery" · Adversary Rating: 0.78          │
├────────────────────────────┬────────────────────────────────┤
│ ATTACK TREE                │ FINDING DETAIL                 │
│ (React Flow, read-only)    │                                │
│                            │ Finding #1                     │
│ [Plan B]                   │ ════════════════════════       │
│    ↓              ↓        │ Attack: Alt Manila route       │
│ [Manila ⚠HIGH]  [EU ⚠MED] │ Failure: Route collapse under │
│                            │   +20% demand spike            │
│ Manila detail:             │ Severity: HIGH                 │
│  Prob: 0.52                │ Probability: 0.52              │
│  Sim: FAIL at +20%         │ Sim Evidence: FAILED           │
│                            │                                │
│ EU detail:                 │ Mitigation hint:               │
│  Prob: 0.31                │ Reserve 30% Manila buffer or   │
│  Sim: borderline           │ identify 3rd alternative route │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
│ ADVERSARY RATING GAUGE: ██████████░░░░░░ 0.78              │
│ [← Return to Plans]    [↻ Re-run Adversary]                │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `AttackTree` (React Flow read-only; nodes = plan actions; edges = attacks)
- `FindingDetail` (finding card with severity badge, probability, sim evidence)
- `AdversaryRatingGauge` (radial gauge)

---

## 11. Screen 09 — Stress Test (`/stress`)

**Purpose**: Validate plan robustness against compound stressor scenarios.

**User Goal**: See survival rate; decide if the plan is robust enough.

**Primary CTA**: "Run Stress Test" | "Approve Plan Anyway"

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ CONFIGURATION                                               │
│ Plan: [Balanced Recovery ▾]                                 │
│                                                             │
│ STRESSORS (select what to test):                            │
│ ☑ Additional port closure (+20%)                            │
│ ☑ Demand spike (+15%)                                       │
│ ☑ Air freight capacity reduction (-30%)                     │
│ ☑ Secondary supplier failure                                │
│ ☑ Fuel price spike (+40%)                                   │
│ ☐ Cyber attack on logistics                                 │
│ ☐ Regulatory freeze                                         │
│                                                             │
│ [▶ Run Stress Test]                                         │
├─────────────────────────────────────────────────────────────┤
│ RESULTS                                                     │
│ Survival Rate: ███████░░░ 7/10 · 70%                        │
│                                                             │
│ Stressor                    Result    Failure Mode          │
│ ─────────────────────────────────────────────────────       │
│ Port closure (+20%)         PASS ✓                          │
│ Demand spike (+15%)         PASS ✓                          │
│ Air freight reduction       FAIL ✗    Route congestion      │
│ Secondary supplier fail     PASS ✓                          │
│ Triple combo (unlikely)     FAIL ✗    Cascading collapse    │
│ ...                                                         │
│                                                             │
│ Probability of worst case: 2.1%                             │
│ [← Back to Plans]  [✅ Approve Anyway]  [📄 Export]        │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `StressorCheckboxList`
- `StressTestProgressBar` (real-time as stressors run)
- `StressTestResultTable` (rows appear as WebSocket events arrive)
- `SurvivalRateGauge`

### WebSocket
`stress-test.progress` → add row to results table.
`stress-test.completed` → show summary + enable action buttons.

---

## 12. Screen 10 — Decision Cockpit (`/decision`)

**Purpose**: Final human-in-the-loop approval interface.

**User Goal**: Review the recommended plan's full evidence chain and make an auditable decision.

**Primary CTA**: "Approve" | "Reject" | "Defer"

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ RECOMMENDED PLAN: "Balanced Recovery"                       │
│ Final Score: 0.79 ·  Adversary: 0.78 · Stress: 70%         │
├─────────────────────────────────────────────────────────────┤
│ PLAN SUMMARY (full width)                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ METRICS                │ ACTIONS (collapsible list)     │ │
│ │ SLA: 0.85 (↑ from 0.72)│ 1. Reorder 500u from Backup   │ │
│ │ Cost: +$38K            │    Supplier (cost: $22K)       │ │
│ │ Emissions: +8%         │ 2. Reroute APAC Route via MNL  │ │
│ │ Fragility: -15%        │    (delay -48h, cost +$12K)   │ │
│ │ Net Score: 0.79        │ 3. Transfer 200u EU→APAC       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ EVIDENCE CHAIN                                              │
│ Signal: Typhoon Hana (conf: 0.94) → Risk: 0.82 (Osaka WH)  │
│ → Scenario: Double Punch → Agent: Inventory reorder x12     │
│ → Coordinator: Plan B ranked #2 → Adversary: 0.78 robust    │
│ → Stress: 7/10 survive                                      │
├─────────────────────────────────────────────────────────────┤
│ CONSTRAINTS                                                 │
│ ✓ SLA preservation ≥ 0.80    ✓ Cost within budget           │
│ ✓ Emissions ≤ +10% threshold ✓ All suppliers qualified      │
│                                                             │
│ APPROVAL NOTE (required for audit):                         │
│ [Text area: Approved based on balanced trade-off...]        │
│                                                             │
│ [✅ Approve] [❌ Reject] [⏸ Defer 24h]                     │
│                                                             │
│ AUDIT LOG (last 5 decisions)                                │
│ 2026-09-18 21:30 · Plan A approved · Director Smith · ...   │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `PlanSummaryCard` (full metrics + actions list)
- `EvidenceChain` (traceable decision path)
- `ConstraintSatisfactionList` (check items)
- `ApprovalNoteInput`
- `DecisionButtons` (Approve/Reject/Defer with confirmation modal)
- `AuditLogFeed`

---

## 13. Screen 11 — Evaluation (`/evaluation`)

**Purpose**: Run and review deterministic benchmark suite results.

**User Goal**: Validate system behavior against expected outcomes.

**Primary CTA**: "Run Suite"

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ SUITE SELECTOR: [B001 Single Disruption ▾]                  │
│ Provider: mock · Seed: 42 · [▶ Run Suite]                   │
├──────────────────────────┬──────────────────────────────────┤
│ TEST CASES               │ RESULTS SUMMARY                  │
│                          │                                  │
│ ✓ B001-TC001             │ Pass Rate: ████████░░ 21/23      │
│   Single signal risk     │ Agent Response P95: 4.2s         │
│   Expected: 0.72         │ SLA Preservation: 0.87           │
│   Actual: 0.72 ✓         │ Adversary Detection: 94%         │
│                          │ Determinism: 100% ✓              │
│ ✓ B001-TC002             │                                  │
│   Risk propagation       │ HISTORY (last 5 runs)            │
│                          │ [Recharts line chart]            │
│ ✗ B001-TC021             │ Pass rate trend                  │
│   SLA preservation ≥0.85 │                                  │
│   Expected: ≥0.85        │                                  │
│   Actual: 0.79 ✗         │ [Export Results PDF]             │
│   [View Failure Detail]  │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

### Components
- `SuiteSelector`
- `TestCaseList` (✓/✗ icons, expected vs. actual)
- `ResultsSummaryPanel` (metrics + history chart)
- `FailureDetailModal`

---

## 14. Screen 12 — System / AWS Status (`/system`)

**Purpose**: Operational health of all services.

**User Goal**: Diagnose issues; switch AI provider; reset demo state.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM STATUS                                               │
│ Overall: ● DEGRADED                                         │
├─────────────────────────────────────────────────────────────┤
│ SERVICE GRID                                                │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│ │ Backend API  │ │ PostgreSQL   │ │ Redis                │  │
│ │ ● HEALTHY    │ │ ● HEALTHY    │ │ ● HEALTHY           │  │
│ │ P99: 142ms   │ │ Pool: 8/20   │ │ Mem: 24MB           │  │
│ └──────────────┘ └──────────────┘ └──────────────────────┘  │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│ │ WebSocket    │ │ ECS Backend  │ │ ECS Frontend         │  │
│ │ ● HEALTHY    │ │ ● HEALTHY    │ │ ● HEALTHY           │  │
│ │ Conns: 3     │ │ Tasks: 1/1   │ │ Tasks: 1/1          │  │
│ └──────────────┘ └──────────────┘ └──────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ AI PROVIDERS                                                │
│ ● Gemini   · ACTIVE · P99: 1.2s      [Switch ▾]            │
│ ○ Ollama   · DEGRADED · conn refused                       │
│ ○ Mock     · HEALTHY · 0ms           [Set Active]          │
├─────────────────────────────────────────────────────────────┤
│ DEMO CONTROLS (admin only)                                  │
│ [🔄 Reseed Demo Data]  [💾 Export State]  [🗑 Reset World]  │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `ServiceStatusCard` × 6
- `AIProviderCard` (status + latency + switch control)
- `LatencyChart` (Recharts area chart)
- `DemoControls` (seed, export, reset)
