# FULFILL-X — UI ROUTE MAP & WORKSPACE SPECIFICATION

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. ROUTE MAP SPECIFICATION MATRIX

This document specifies every explicit route in `FULFILL-X`, detailing purpose, user actions, API sources, WebSocket events, Zustand state, TanStack Query data, 3D scene representation, 2D UI layout, animations, transitions, and state budgets.

---

### ROUTE 1: HOME WORKSPACE (`/`)
- **Purpose:** Atmospheric entry point presenting an overview of the global supply network topology, resilience health score, and operational status.
- **User Actions:** Explore spatial supply network, select active tenant/seed preset, trigger quick demo simulation, jump to Command Center.
- **API Sources:** `GET /api/world/summary`, `GET /api/world/snapshot`, `GET /api/risk/map`, `GET /api/health`.
- **WebSocket Events:** `NODE_DISRUPTED`, `RISK_PROPAGATED`, `RECOVERY_INITIATED`.
- **Zustand State:** `authStore` (user, org), `realtimeStore` (health, nodeRisks).
- **TanStack Query:** `useQuery(['worldSummary'])`, `useQuery(['worldSnapshot'])`.
- **3D Scene:** Atmospheric spatial supply network mesh with ambient particle glow, rotating global globe/map projection, floating nodes and connecting edges.
- **2D UI:** Floating cybernetic hero overlay, real-time KPI ticker, seed preset selector, quick launch actions.
- **Animations:** Slow floating ambient node rotation, particle pulse stream along active edges, hero text fade-in.
- **Transitions:** Spatial camera zoom fly-through into `/command` or `/world` on user click.
- **Loading State:** Ambient particle mesh with skeleton text overlay (`Loading FULFILL-X Spatial Topology...`).
- **Empty State:** Clean synthetic grid with "Seed Initial Network State" trigger button.
- **Error State:** Red ambient light pulse with retry button and connection diagnostics drawer.
- **Permission State:** Public landing view with restricted actions prompting authentication modal.
- **Offline/Degraded State:** Banner overlay ("Offline Mode — Serving Synthetic Baseline Snapshot").
- **Responsive Behavior:** 3D canvas scales down; mobile view switches to 2D network diagram.
- **Accessibility Requirements:** Keyboard navigation for seed selector; screen reader summary text.
- **Performance Budget:** Max 30k polygons; 60 FPS target; 1.5s initial load.

---

### ROUTE 2: COMMAND CENTER WORKSPACE (`/command`)
- **Purpose:** Live operational command center providing real-time visibility into disruptions, agent activity, and execution pipeline status.
- **User Actions:** Inject signal, launch Specialist War Room, open Decision Cockpit, jump to Node Inspector, switch seed/preset.
- **API Sources:** `GET /api/world/summary`, `GET /api/world/snapshot`, `GET /api/risk/map`, `GET /api/ai/providers`.
- **WebSocket Events:** `SIGNAL_INJECTED`, `NODE_DISRUPTED`, `AGENT_ACTION_PROPOSED`, `DECISION_STATUS_CHANGED`.
- **Zustand State:** `realtimeStore` (activeSignals, nodeRisks), `authStore`.
- **TanStack Query:** `useQuery(['worldSummary'])`, `useQuery(['riskMap'])`.
- **3D Scene:** Tactical network command grid with active node risk status halos, realtime signal pulse vectors, and agent camera focus.
- **2D UI:** 4-quadrant operational HUD: System Health Meter, Live Risk Map Table, Active Signal Stream, Specialist Swarm Quick Status.
- **Animations:** Red pulse rings on disrupted nodes, glowing edge traffic particles, warning badge flash on severe signals.
- **Transitions:** Smooth pan & zoom to target node upon selection.
- **Loading State:** HUD skeleton panels with pulse animation.
- **Empty State:** "Network Healthy — No Active Disruptions Detected".
- **Error State:** Connection alert drawer with reconnect button.
- **Permission State:** Action buttons (Inject Signal, Execute Plan) disabled if user role is `ANALYST`.
- **Offline/Degraded State:** Yellow status banner indicating fallback in-memory state active.
- **Responsive Behavior:** 4-quadrant layout stacks vertically on tablet/mobile screens.
- **Accessibility Requirements:** ARIA live region for incoming signals; full keyboard tab order.
- **Performance Budget:** Max 40k polygons; 60 FPS; <100ms UI interaction latency.

---

### ROUTE 3: WORLD TOPOLOGY WORKSPACE (`/world`)
- **Purpose:** Interactive 3D/2D supply chain network topology layout displaying nodes (suppliers, hubs, ports, plants, demand centers) and directional edges.
- **User Actions:** Click node/edge to select, inspect capacity/lead-time/inventory, drag camera, toggle 2D/3D mode, filter node types.
- **API Sources:** `GET /api/world/snapshot`, `GET /api/world/nodes/{id}`, `GET /api/world/summary`.
- **WebSocket Events:** `NODE_DISRUPTED`, `INVENTORY_LEVEL_CHANGED`, `CAPACITY_MUTATED`.
- **Zustand State:** `worldStore` (selectedNodeId, viewMode), `realtimeStore`.
- **TanStack Query:** `useQuery(['worldSnapshot'])`, `useQuery(['nodeDetail', selectedNodeId])`.
- **3D Scene:** 3D force-directed or geographic node network graph with glowing node geometries, directional flow particles on edges, and elevation displacement based on node capacity.
- **2D UI:** Node filter bar, 2D SVG fallback toggle, selected node quick card, search input.
- **Animations:** Smooth node hover scale up, edge particle velocity proportional to transit load.
- **Transitions:** Camera zooms smoothly to selected node position (`focusOnNode(nodeId)`).
- **Loading State:** 3D wireframe bounding box with shimmer effects.
- **Empty State:** "No nodes in network topology — Run seed API".
- **Error State:** Network fetch failure card with manual refresh button.
- **Permission State:** All users can view topology; node property editing requires `OPERATOR` or `ADMIN`.
- **Offline/Degraded State:** Displays last cached snapshot from local storage.
- **Responsive Behavior:** 3D canvas hides on mobile devices (<640px), rendering SVG 2D layout instead.
- **Accessibility Requirements:** Alternative 2D data table accessible via keyboard (`Alt+T`).
- **Performance Budget:** Max 50k polygons; 60 FPS desktop / 30 FPS mobile.

---

### ROUTE 4: WORLD ENTITY INSPECTOR WORKSPACE (`/world/node/:id`)
- **Purpose:** Detailed deep-dive inspector workspace for an individual supply chain entity (supplier, hub, port, plant, demand center).
- **User Actions:** Inspect inventory level, lead time, capacity utilization, upstream/downstream edges, risk score breakdown, inject signal on node.
- **API Sources:** `GET /api/world/nodes/{id}`, `GET /api/risk/nodes/{id}/detail`, `GET /api/world/snapshot`.
- **WebSocket Events:** `NODE_DISRUPTED`, `INVENTORY_LEVEL_CHANGED`, `RISK_SCORE_UPDATED`.
- **Zustand State:** `worldStore` (selectedNodeId), `realtimeStore`.
- **TanStack Query:** `useQuery(['nodeDetail', nodeId])`, `useQuery(['nodeRiskDetail', nodeId])`.
- **3D Scene:** Focused 3D isometric view of target node entity model surrounded by connected upstream/downstream edge vectors.
- **2D UI:** Multi-tab node detail panel: Overview, Risk Breakdown, Upstream Dependencies, Downstream Impact, Historical Signals.
- **Animations:** 3D entity rotation animation, animated inventory level gauge bar, risk score sparklines.
- **Transitions:** Slide-in right panel transition with camera orbit focus.
- **Loading State:** Entity card skeleton loader.
- **Empty State:** "Entity Not Found — Invalid Node ID".
- **Error State:** Error banner ("Failed to load entity details for node").
- **Permission State:** Node modification options locked for read-only roles.
- **Offline/Degraded State:** Displays cached entity record.
- **Responsive Behavior:** Inspector converts to full-width tab on narrow viewports.
- **Accessibility Requirements:** High contrast risk indicators, explicit ARIA labels.
- **Performance Budget:** Max 15k polygons; 60 FPS; <50ms tab transition.

---

### ROUTE 5: INTELLIGENCE - RISK & HEATMAP WORKSPACE (`/intelligence/risk`)
- **Purpose:** Comprehensive risk engine explorer detailing risk propagation decay across graph hops, composite risk score matrices, and node criticality rankings.
- **User Actions:** Recalculate risk scores, adjust decay factor parameter, filter nodes by risk band (Critical, High, Medium, Low), trigger signal injection.
- **API Sources:** `GET /api/risk/map`, `POST /api/risk/recalculate`, `GET /api/risk/nodes/{id}/detail`.
- **WebSocket Events:** `RISK_PROPAGATED`, `RISK_RECALCULATED`, `SIGNAL_RESOLVED`.
- **Zustand State:** `riskStore` (selectedRiskBand, decayFactor), `realtimeStore`.
- **TanStack Query:** `useQuery(['riskMap'])`, `useMutation(['recalculateRisk'])`.
- **3D Scene:** 3D Risk Heatmap Volume Field with color-graded risk pulses (Red = Critical, Amber = High, Emerald = Low) radiating outward across topology edges.
- **2D UI:** Risk band filter tabs, Risk Level distribution histogram, Criticality ranking table, Risk explanation trace drawer.
- **Animations:** Radiating concentric risk waves emanating from disrupted nodes; smooth risk gauge fill transitions.
- **Transitions:** Cross-fade transition into GNN or Causal views.
- **Loading State:** Risk grid shimmer matrix with calculating spinner.
- **Empty State:** "Zero Active Risk Signals — All Network Nodes Operating at Baseline (Green)".
- **Error State:** "Risk Engine Unreachable — Check API connectivity".
- **Permission State:** Recalculate and reset buttons restricted to `OPERATOR`+.
- **Offline/Degraded State:** Displays static risk matrix calculated from baseline state.
- **Responsive Behavior:** 3D heatmap falls back to 2D color-coded node matrix table.
- **Accessibility Requirements:** Colorblind-safe palettes (Viridis/Magma option) and text risk labels.
- **Performance Budget:** Max 35k polygons; 60 FPS.

---

### ROUTE 6: INTELLIGENCE - SIGNALS WORKSPACE (`/intelligence/signals`)
- **Purpose:** Real-time threat signal monitoring workspace displaying all ingested weather, earthquake, port disruption, cyber threat, and market signals.
- **User Actions:** Filter signals by severity/type/source, inject custom signal, resolve active signal, inspect signal target propagation.
- **API Sources:** `GET /api/risk/signals`, `POST /api/risk/signals/inject`, `POST /api/risk/signals/{id}/resolve`.
- **WebSocket Events:** `SIGNAL_INJECTED`, `SIGNAL_RESOLVED`, `SIGNAL_SEVERITY_MUTATED`.
- **Zustand State:** `realtimeStore` (activeSignals).
- **TanStack Query:** `useQuery(['riskSignals'])`, `useMutation(['injectSignal'])`, `useMutation(['resolveSignal'])`.
- **3D Scene:** 3D Radar Threat Dome displaying incoming threat vectors as incoming trajectory arcs converging on target network nodes.
- **2D UI:** Live signal stream feed with search/filter controls, Signal Injector modal button, Resolved signal history log.
- **Animations:** Radar sweep rotation animation, pulsing threat trajectory arcs on new signal arrival.
- **Transitions:** Smooth camera focus to target node on signal click.
- **Loading State:** Table row skeleton placeholders.
- **Empty State:** "No active risk signals present in system".
- **Error State:** Signal stream error state with reconnect prompt.
- **Permission State:** Signal injection and resolution disabled for read-only users.
- **Offline/Degraded State:** In-memory fallback signal list active.
- **Responsive Behavior:** Radar 3D view collapses; list view takes full width.
- **Accessibility Requirements:** ARIA live region `polite` for signal list additions.
- **Performance Budget:** Max 25k polygons; 60 FPS.

---

### ROUTE 7: INTELLIGENCE - GNN WORKSPACE (`/intelligence/gnn`)
- **Purpose:** Graph Neural Network intelligence workspace displaying embeddings, node risk predictions, disruption propagation paths, and graph topology features.
- **User Actions:** Run GNN risk prediction, analyze node propagation path, inspect edge weight attention matrices, toggle node feature layers.
- **API Sources:** `POST /api/graph/predict-risk`, `POST /api/graph/propagation/analyze`, `GET /api/graph/status`.
- **WebSocket Events:** `GNN_PREDICTION_COMPLETED`, `PROPAGATION_ANALYSIS_UPDATED`.
- **Zustand State:** `graphStore` (selectedNodeId, propagationResult).
- **TanStack Query:** `useMutation(['predictGNNRisk'])`, `useMutation(['analyzePropagation'])`.
- **3D Scene:** 3D Neural Graph Layer visualization showing node feature embeddings in latent space connected by neural attention weights.
- **2D UI:** GNN model status card, latent feature distribution plot, propagation path node step table, attention weight sliders.
- **Animations:** Glowing neural activation pulses travelling along GNN graph edges; smooth latent space node cluster layout transitions.
- **Transitions:** Spatial fly-through camera transition into Causal workspace.
- **Loading State:** Latent space point cloud loading spinner.
- **Empty State:** "Run GNN Risk Prediction to compute node propagation probabilities".
- **Error State:** "GNN Model Inference Error — Falling back to deterministic risk engine".
- **Permission State:** Model inference execution restricted to `ANALYST`+.
- **Offline/Degraded State:** In-memory mock GNN predictor fallback.
- **Responsive Behavior:** 3D latent space view switches to 2D node list with propagation step badges.
- **Accessibility Requirements:** Accessible text explanation of GNN propagation paths.
- **Performance Budget:** Max 40k polygons; 60 FPS.

---

### ROUTE 8: INTELLIGENCE - CAUSAL INTELLIGENCE WORKSPACE (`/intelligence/causal`)
- **Purpose:** Causal discovery and counterfactual reasoning workspace for analyzing root-cause hypotheses and simulating "What-If" structural interventions.
- **User Actions:** Generate causal hypotheses for disrupted nodes, run counterfactual interventions, compare actual vs. counterfactual outcome trajectories.
- **API Sources:** `POST /api/graph/causal/hypotheses`, `POST /api/graph/causal/counterfactual`, `GET /api/graph/causal/status`.
- **WebSocket Events:** `CAUSAL_HYPOTHESIS_GENERATED`, `COUNTERFACTUAL_RUN_COMPLETED`.
- **Zustand State:** `causalStore` (hypotheses, counterfactualResult).
- **TanStack Query:** `useMutation(['getCausalHypotheses'])`, `useMutation(['runCounterfactual'])`.
- **3D Scene:** Directed Acyclic Graph (DAG) Causal Network visualizer displaying causal intervention nodes with counterfactual outcome trajectory overlays.
- **2D UI:** Root-Cause Hypothesis ranking list, Counterfactual parameter config drawer, Comparison chart (Actual vs. Counterfactual), Causal confidence score indicator.
- **Animations:** Causal direction arrow animations along DAG edges; split-screen counterfactual trajectory line animations.
- **Transitions:** Smooth camera tilt and pan to targeted causal sub-graph.
- **Loading State:** DAG graph skeleton layout animation.
- **Empty State:** "Select a disrupted node to discover root-cause causal hypotheses".
- **Error State:** "Causal Discovery Engine Error — Check graph connectivity".
- **Permission State:** Counterfactual interventions restricted to `ANALYST` or higher.
- **Offline/Degraded State:** Uses deterministic synthetic causal DAG models.
- **Responsive Behavior:** DAG graph converts to hierarchical tree list view on small screens.
- **Accessibility Requirements:** Text alternative table for causal relationships.
- **Performance Budget:** Max 30k polygons; 60 FPS.

---

### ROUTE 9: RESPONSE - SPECIALIST WAR ROOM (`/response/war-room`)
- **Purpose:** Multi-agent swarm collaboration war room where Specialist Agents (Inventory, Logistics, Supplier, Risk) deliberate on active network threats.
- **User Actions:** Trigger swarm deliberation, inspect individual agent proposals, view agent trade-off analysis, select candidate plan for Decision Cockpit preview.
- **API Sources:** `POST /api/coordinator/deliberate`, `GET /api/agents/specialists`, `POST /api/coordinator/normalize`.
- **WebSocket Events:** `AGENT_ACTION_PROPOSED`, `SWARM_DELIBERATION_STARTED`, `SWARM_CONSENSUS_REACHED`.
- **Zustand State:** `agentStore` (deliberationState, agentProposals, candidatePlans).
- **TanStack Query:** `useMutation(['triggerDeliberation'])`, `useQuery(['specialistAgents'])`.
- **3D Scene:** 3D Agent Constellation Arena featuring 4 Specialist Agent Nodes (Inventory = Emerald, Logistics = Blue, Supplier = Purple, Risk = Amber) surrounding a central Swarm Coordinator Node.
- **2D UI:** 4-Agent live message stream feed, Swarm Consensus progress bar, Candidate Plan list, Trade-Off matrix table (Cost vs. Recovery Time vs. SLA Impact).
- **Animations:** Rotating agent energy rings, particle beam transfers between specialists during deliberation, consensus glow flash.
- **Transitions:** Spatial fly-through camera transition into Decision Cockpit.
- **Loading State:** Agent nodes pulsing with loading spinners and status text ("Deliberating...").
- **Empty State:** "Click 'Trigger Swarm Deliberation' to initiate specialist agent analysis".
- **Error State:** "Specialist Agent Timeout — Partial agent responses normalized".
- **Permission State:** Deliberation trigger available to `OPERATOR`+.
- **Offline/Degraded State:** Offline mock agent responses generated deterministically.
- **Responsive Behavior:** Constellation arena scales down; agent feeds convert to tabs.
- **Accessibility Requirements:** ARIA live region for agent message feeds; keyboard navigation for candidate selection.
- **Performance Budget:** Max 35k polygons; 60 FPS.

---

### ROUTE 10: RESPONSE - ADVERSARY CHAOS ENGINE (`/response/adversary`)
- **Purpose:** Adversarial resilience testing workspace where the Adversary Agent generates stress-test attack vectors to expose network vulnerabilities.
- **User Actions:** Launch adversarial stress test, select attack intensity (Mild, Moderate, Severe, Extreme), review attack surface report, trigger automated defense response.
- **API Sources:** `POST /api/adversary/attack`, `GET /api/adversary/vulnerabilities`, `POST /api/adversary/simulate-defense`.
- **WebSocket Events:** `CHAOS_FAULT_INJECTED`, `ADVERSARY_ATTACK_STARTED`, `VULNERABILITY_EXPOSED`.
- **Zustand State:** `adversaryStore` (attackResult, vulnerabilities).
- **TanStack Query:** `useMutation(['launchAdversarialAttack'])`, `useQuery(['vulnerabilities'])`.
- **3D Scene:** Cybernetic Adversary Arena displaying red stress-test attack vectors bombarding network topology nodes, highlighting bottleneck points under load.
- **2D UI:** Attack intensity slider, Vulnerability score gauge, Attack surface breakdown table, Defense mitigation recommendation list.
- **Animations:** Red threat lightning bolts striking vulnerable nodes; node health degradation visual effects.
- **Transitions:** Camera zoom to most severely impacted node.
- **Loading State:** Adversarial scan laser effect overlay.
- **Empty State:** "No adversarial test executed — Select intensity to begin stress test".
- **Error State:** "Adversary Engine Error — Attack aborted".
- **Permission State:** Adversarial execution strictly restricted to `ADMIN` / `SECURITY_OFFICER`.
- **Offline/Degraded State:** Pre-calculated synthetic attack scenarios.
- **Responsive Behavior:** 3D arena hides on mobile screens; vulnerability list takes full screen.
- **Accessibility Requirements:** Clear text warnings for destructive stress testing.
- **Performance Budget:** Max 40k polygons; 60 FPS.

---

### ROUTE 11: RESPONSE - SCENARIO GENERATOR & INJECTOR (`/response/scenarios`)
- **Purpose:** Deterministic disruption scenario generator for single, compound, demand shock, and delayed recovery testing.
- **User Actions:** Create custom scenario, select target node, set start hour / duration / severity, save scenario preset, inject scenario into World Model.
- **API Sources:** `POST /api/simulation/scenarios/generate`, `POST /api/risk/signals/inject`, `GET /api/simulation/scenarios/presets`.
- **WebSocket Events:** `SCENARIO_CREATED`, `SCENARIO_INJECTED`, `SCENARIO_EXECUTION_STEP`.
- **Zustand State:** `scenarioStore` (customScenario, scenarioPresets).
- **TanStack Query:** `useMutation(['generateScenario'])`, `useQuery(['scenarioPresets'])`.
- **3D Scene:** Interactive Scenario Spatial Timeline displaying disruption events plotted along a 3D horizontal time axis (+0h to +72h).
- **2D UI:** Scenario builder form (Disruption type, target, severity, duration), Saved scenario preset gallery, Timeline preview graph.
- **Animations:** Event marker drops onto 3D timeline; event radius expansion visualization.
- **Transitions:** Smooth transition to Digital Twin workspace upon injection.
- **Loading State:** Scenario timeline skeleton shimmer.
- **Empty State:** "No scenario events created — Use builder above or choose preset".
- **Error State:** "Invalid Scenario Parameters — Duration must be >0".
- **Permission State:** Scenario injection restricted to `OPERATOR`+.
- **Offline/Degraded State:** Local scenario generation active.
- **Responsive Behavior:** 3D timeline converts to vertical event list on narrow viewports.
- **Accessibility Requirements:** Full keyboard form control and screen reader announcements.
- **Performance Budget:** Max 25k polygons; 60 FPS.

---

### ROUTE 12: DECISION - MULTI-OBJECTIVE COCKPIT (`/decision/cockpit`)
- **Purpose:** Central Decision Cockpit for evaluating candidate resilience plans, inspecting Pareto optimal trade-offs, and submitting plans for policy verification.
- **User Actions:** Select candidate plan, adjust multi-objective weight sliders (Cost vs Speed vs Risk), submit plan to Policy Engine, request executive approval.
- **API Sources:** `GET /api/cockpit/proposals`, `POST /api/cockpit/evaluate`, `POST /api/cockpit/submit-approval`.
- **WebSocket Events:** `DECISION_STATUS_CHANGED`, `PLAN_VERIFIED`, `POLICY_EVALUATED`.
- **Zustand State:** `cockpitStore` (selectedPlanId, objectiveWeights), `realtimeStore`.
- **TanStack Query:** `useQuery(['cockpitProposals'])`, `useMutation(['evaluatePlan'])`.
- **3D Scene:** 3D Pareto Surface Landscape showing candidate plan points in 3D objective space (X = Cost, Y = Recovery Time, Z = Risk Reduction).
- **2D UI:** Candidate Plan comparison table, Objective weight sliders, Plan action execution steps list, Verification status badges.
- **Animations:** Pareto surface mesh deformation on weight slider changes; selected plan point highlights with glowing spatial beam.
- **Transitions:** Camera flies smoothly to selected plan coordinates on Pareto surface.
- **Loading State:** Pareto surface wireframe loader.
- **Empty State:** "No candidate plans generated — Run Specialist Swarm Deliberation".
- **Error State:** "Cockpit Service Error — Unable to evaluate candidate plan".
- **Permission State:** Submission for approval requires `OPERATOR` or `OWNER`.
- **Offline/Degraded State:** Synthetic Pareto candidate plan evaluation.
- **Responsive Behavior:** 3D Pareto surface toggles to 2D radar/spider chart view.
- **Accessibility Requirements:** Accessible data table for candidate plan metrics.
- **Performance Budget:** Max 45k polygons; 60 FPS.

---

### ROUTE 13: DECISION - VERIFICATION & CONSTRAINT SANDBOX (`/decision/verification`)
- **Purpose:** Execution safety sandbox for programmatically verifying candidate plans against physical capacity, inventory, lead time, and route constraints.
- **User Actions:** Run verification check on plan, inspect constraint violation logs, simulate action execution in isolated sandbox, view safety pass/fail report.
- **API Sources:** `POST /api/verification/verify`, `GET /api/verification/constraints`, `POST /api/verification/sandbox/run`.
- **WebSocket Events:** `PLAN_VERIFIED`, `CONSTRAINT_VIOLATION_DETECTED`.
- **Zustand State:** `verificationStore` (verificationResult, constraintFilter).
- **TanStack Query:** `useMutation(['verifyPlan'])`, `useQuery(['verificationConstraints'])`.
- **3D Scene:** 3D Sandbox Network Mesh executing plan actions step-by-step with green checkmarks for passed constraints and red warning rings for violations.
- **2D UI:** Verification Status Card (`VERIFIED`, `CONDITIONAL`, `REJECTED`), Constraint rule check matrix, Sandbox action playback controls.
- **Animations:** Action execution step-by-step particle animation along network routes; constraint pass glow effects.
- **Transitions:** Smooth transition to Executive Approval page upon successful verification.
- **Loading State:** Verification progress bar with rule validation steps checklist.
- **Empty State:** "Select a candidate plan to initiate sandbox constraint verification".
- **Error State:** "Verification Engine Error — Rule set evaluation failed".
- **Permission State:** Verification inspection accessible to all; rule parameter editing restricted to `COMPLIANCE_OFFICER`.
- **Offline/Degraded State:** Deterministic offline sandbox rule engine active.
- **Responsive Behavior:** 3D sandbox step view switches to vertical stepper UI.
- **Accessibility Requirements:** Text status indicators (`VERIFIED` / `REJECTED`) alongside color indicators.
- **Performance Budget:** Max 30k polygons; 60 FPS.

---

### ROUTE 14: DECISION - HUMAN-IN-THE-LOOP EXECUTIVE APPROVAL (`/decision/approval`)
- **Purpose:** Executive governance portal for reviewing verified resilience decisions, checking operator digital signatures, and issuing formal binding approval or rejection.
- **User Actions:** Review plan executive summary, inspect policy evaluation report, sign digital approval authorization, reject plan with comments.
- **API Sources:** `GET /api/cockpit/approvals/pending`, `POST /api/cockpit/approve`, `POST /api/cockpit/reject`.
- **WebSocket Events:** `EXECUTIVE_APPROVAL_GRANTED`, `DECISION_REJECTED`.
- **Zustand State:** `authStore` (currentUser), `cockpitStore`.
- **TanStack Query:** `useQuery(['pendingApprovals'])`, `useMutation(['approveDecision'])`.
- **3D Scene:** Minimalist Spatial Executive Seal with glowing security ring reflecting decision status (`PENDING`, `APPROVED`, `REJECTED`).
- **2D UI:** Executive Summary Card, Financial Impact Summary, Risk Mitigation ROI metric, Digital Signature Input, Binding Approve / Reject buttons.
- **Animations:** Security seal ring rotation; green verification check pulse on approval; red lock flash on rejection.
- **Transitions:** Smooth navigation to Execution Safety Plane upon approval.
- **Loading State:** Security context loading spinner.
- **Empty State:** "No Pending Decisions Awaiting Executive Approval".
- **Error State:** "Approval Submission Failed — Invalid operator security token".
- **Permission State:** Approval action strictly enforced for `OWNER` / `EXECUTIVE` roles via RBAC.
- **Offline/Degraded State:** Offline approval staging with pending sync badge.
- **Responsive Behavior:** Optimized for tablet / desktop executive review.
- **Accessibility Requirements:** Full keyboard navigation for approval signature and submit buttons.
- **Performance Budget:** Max 15k polygons; 60 FPS.

---

### ROUTE 15: SIMULATION - DIGITAL TWIN SNAPSHOT WORKSPACE (`/simulation/twin`)
- **Purpose:** Executable Digital Twin simulation workspace for creating versioned, isolated world snapshots and running scenario step-by-step simulations without production mutation.
- **User Actions:** Create twin snapshot, inspect twin state, advance simulation step (+1h, +6h, +24h), mutate twin parameters, reset twin state.
- **API Sources:** `POST /api/simulation/twin/create`, `GET /api/simulation/twin/{id}`, `POST /api/simulation/twin/{id}/step`.
- **WebSocket Events:** `TWIN_CREATED`, `TWIN_STEP_EXECUTED`, `TWIN_STATE_MUTATED`.
- **Zustand State:** `twinStore` (activeTwinId, twinState, stepCount).
- **TanStack Query:** `useMutation(['createTwin'])`, `useQuery(['twinState', twinId])`.
- **3D Scene:** Holographic Digital Twin World Projection rendering twin network nodes with isolation aura, displaying real-time step counter and simulated inventory depletion vectors.
- **2D UI:** Twin control bar (Play, Pause, Step Forward, Reset), Step counter HUD (+0h to +72h), State delta inspector panel, Isolation status indicator (`PRODUCTION_MUTATION = FALSE`).
- **Animations:** Holographic scanline sweep effect across twin mesh; smooth inventory level depletion bar animations.
- **Transitions:** Seamless spatial camera switch to Monte Carlo workspace.
- **Loading State:** Holographic projection initialization spinner.
- **Empty State:** "Click 'Create Twin Snapshot' to branch an isolated simulation environment".
- **Error State:** "Twin Snapshot Creation Error — Failed to deep-copy world state".
- **Permission State:** Twin creation available to `ANALYST`+.
- **Offline/Degraded State:** Local in-memory Digital Twin execution.
- **Responsive Behavior:** 3D holographic canvas collapses; step controls dock to top.
- **Accessibility Requirements:** Screen reader text updates on every simulation step.
- **Performance Budget:** Max 40k polygons; 60 FPS.

---

### ROUTE 16: SIMULATION - MONTE CARLO RESILIENCE ENGINE (`/simulation/monte-carlo`)
- **Purpose:** High-performance Monte Carlo simulation workspace executing hundreds of parallel stochastic futures across random disruption scenarios to generate statistical confidence bounds.
- **User Actions:** Configure Monte Carlo parameters (n_simulations, horizon, seed), launch simulation run, inspect P10/P50/P90 service level distributions, view CVaR 95% tail risk.
- **API Sources:** `POST /api/simulation/monte-carlo/run`, `GET /api/simulation/monte-carlo/results/{id}`.
- **WebSocket Events:** `SIMULATION_STEP_COMPLETED`, `MONTE_CARLO_RUN_FINISHED`.
- **Zustand State:** `monteCarloStore` (runConfig, results).
- **TanStack Query:** `useMutation(['runMonteCarlo'])`, `useQuery(['mcResult', runId])`.
- **3D Scene:** 3D Stochastic Future Cloud rendering 100 parallel trajectory lines in 3D space, color-coded by service level outcome (Emerald = P90, Cyan = P50, Amber = P10, Red = Tail Risk).
- **2D UI:** Simulation progress bar (e.g. `Simulating 84/100 futures...`), Percentile distribution graph (P10/25/50/75/90), Resilience Scorecard (`81.51`), CVaR 95% cost indicator.
- **Animations:** Multi-line trajectory growth animation during simulation execution; statistical bell curve fill animation.
- **Transitions:** Cross-fade to Robust Strategy Comparison workspace.
- **Loading State:** Dynamic particle swarm acceleration animation while parallel CPU workers execute.
- **Empty State:** "Configure simulation count and click 'Run Monte Carlo Engine'".
- **Error State:** "Monte Carlo Execution Error — Worker pool timeout".
- **Permission State:** Launching runs >1000 iterations requires `ANALYST` or higher.
- **Offline/Degraded State:** Deterministic 100% reproducible offline Monte Carlo engine.
- **Responsive Behavior:** 3D trajectory cloud converts to 2D percentile chart.
- **Accessibility Requirements:** Tabular breakdown of percentiles (P10, P50, P90, CVaR95).
- **Performance Budget:** Max 50k polygons; 60 FPS.

---

### ROUTE 17: SIMULATION - ROBUST STRATEGY ANALYZER (`/simulation/strategies`)
- **Purpose:** Robust strategy evaluation workspace for comparing baseline, reactive, and proactive resilience strategies across diverse horizon scenarios.
- **User Actions:** Select strategies for comparison, choose horizon (24h, 48h, 72h), execute strategy simulation, analyze win-rate and robustness matrices.
- **API Sources:** `POST /api/simulation/strategies/compare`, `GET /api/simulation/strategies/presets`.
- **WebSocket Events:** `STRATEGY_COMPARISON_COMPLETED`.
- **Zustand State:** `strategyStore` (selectedStrategies, comparisonResult).
- **TanStack Query:** `useMutation(['compareStrategies'])`, `useQuery(['strategyPresets'])`.
- **3D Scene:** Dual-surface 3D Horizon Comparison Chart rendering strategy performance topographies over time.
- **2D UI:** Strategy selector checkboxes, Side-by-side metric comparison cards (Service Level, Total Cost, Recovery Time), Win-rate matrix.
- **Animations:** Smooth bar chart height growth; strategy curve morphing transitions.
- **Transitions:** Fly-through transition to Learning workspace.
- **Loading State:** Side-by-side skeleton loader panels.
- **Empty State:** "Select at least 2 strategies to compare performance across horizon scenarios".
- **Error State:** "Strategy Comparison Failed — Invalid strategy configuration".
- **Permission State:** Accessible to all authenticated users.
- **Offline/Degraded State:** Synthetic offline strategy comparison results.
- **Responsive Behavior:** Side-by-side comparison stacks vertically on narrow viewports.
- **Accessibility Requirements:** Text summary of winning strategy and key trade-offs.
- **Performance Budget:** Max 30k polygons; 60 FPS.

---

### ROUTE 18: LEARNING - CONTINUOUS DELIBERATION & CHALLENGER WORKSPACE (`/learning/deliberate`)
- **Purpose:** Continuous learning workspace for orchestrating agent deliberation pipelines, evaluating challenger policies against champion baselines, and triggering model retrain runs.
- **User Actions:** Trigger continuous deliberation pipeline, inspect challenger model metrics, promote challenger to champion policy, review governance logs.
- **API Sources:** `POST /api/learning/deliberate`, `POST /api/learning/train-challenger`, `POST /api/learning/promote-champion`.
- **WebSocket Events:** `LEARNING_CYCLE_COMPLETED`, `CHALLENGER_PROMOTED`.
- **Zustand State:** `learningStore` (championModel, challengerModel, trainingRuns).
- **TanStack Query:** `useMutation(['triggerLearning'])`, `useMutation(['promoteChampion'])`.
- **3D Scene:** 3D Champion vs Challenger Neural Ring displaying real-time policy metric convergence curves in 3D orbit space.
- **2D UI:** Champion vs Challenger comparison scorecard, Policy win-rate history chart, Retrain trigger button, Governance approval badge.
- **Animations:** Orbiting neural particles with green highlight on challenger outperformance; promotion animation sequence.
- **Transitions:** Camera zoom into Agent Memory Store.
- **Loading State:** Retraining progress circle with epoch loss ticker.
- **Empty State:** "No active training run — Click 'Train Challenger Policy'".
- **Error State:** "Challenger Training Aborted — Loss diverged".
- **Permission State:** Promoting champion policy strictly restricted to `ML_ENGINEER` / `ADMIN`.
- **Offline/Degraded State:** Deterministic mock training pipeline.
- **Responsive Behavior:** 3D neural ring converts to 2D loss curve graph.
- **Accessibility Requirements:** Accessible text table comparing Champion vs Challenger loss and accuracy.
- **Performance Budget:** Max 30k polygons; 60 FPS.

---

### ROUTE 19: LEARNING - AGENT MEMORY STORE (`/learning/memory`)
- **Purpose:** Inspection workspace for agent episodic and semantic memory stores, displaying experience replay tuples `(State, Action, Reward, NextState)`.
- **User Actions:** Search agent memory by keyword/tag, filter by reward score, inspect memory vector embeddings, prune stale memory tuples.
- **API Sources:** `GET /api/learning/memory/search`, `GET /api/learning/memory/stats`, `DELETE /api/learning/memory/{id}`.
- **WebSocket Events:** `MEMORY_TUPLE_ADDED`, `MEMORY_STORE_PRUNED`.
- **Zustand State:** `memoryStore` (memoryTuples, totalTuples).
- **TanStack Query:** `useQuery(['agentMemory'])`, `useMutation(['pruneMemory'])`.
- **3D Scene:** 3D Memory Vector Galaxy displaying experience replay nodes clustered by spatial similarity in vector space.
- **2D UI:** Memory search bar, Experience tuple inspector card, Reward distribution histogram, Memory retention status indicator.
- **Animations:** Galaxy rotation animation; memory node highlight on search selection.
- **Transitions:** Smooth zoom to selected memory tuple in vector space.
- **Loading State:** Particle galaxy assembling animation.
- **Empty State:** "Memory Store Empty — Run agent deliberation cycles to accumulate experience".
- **Error State:** "Failed to load memory vector index".
- **Permission State:** Memory pruning restricted to `ADMIN`.
- **Offline/Degraded State:** Local memory tuple cache display.
- **Responsive Behavior:** 3D galaxy switches to 2D memory log table.
- **Accessibility Requirements:** Fully searchable ARIA data table.
- **Performance Budget:** Max 45k polygons; 60 FPS.

---

### ROUTE 20: OBSERVABILITY - REALTIME EVENT BUS STREAM (`/observability/events`)
- **Purpose:** Real-time event bus telemetry center streaming all system events (`NODE_DISRUPTED`, `AGENT_ACTION_PROPOSED`, `POLICY_EVALUATED`, `SIGNAL_INJECTED`) live via WebSocket.
- **User Actions:** Filter events by severity (`INFO`, `WARN`, `CRITICAL`), search event payload, pause/resume event stream, export event log JSON.
- **API Sources:** `GET /api/observability/events/history`, `GET /api/observability/events/stats`.
- **WebSocket Events:** `*` (All system WebSocket event envelopes).
- **Zustand State:** `realtimeStore` (eventHistory, isStreamPaused).
- **TanStack Query:** `useQuery(['eventStats'])`.
- **3D Scene:** 3D Kinetic Event Stream Matrix displaying event particles flowing through visual channel pipelines based on event topic and severity.
- **2D UI:** Real-time Event Stream Table, Stream control toolbar (Pause, Clear, Export), Severity filter chips, Event throughput TPS meter.
- **Animations:** Cascading new event row slide-in; particle acceleration burst on high severity events.
- **Transitions:** Fast cross-fade to Distributed Traces view.
- **Loading State:** Stream table shimmer loading rows.
- **Empty State:** "Event Stream Active — Awaiting incoming system events...".
- **Error State:** "WebSocket Stream Disconnected — Attempting auto-reconnect (1/5)...".
- **Permission State:** Accessible to all authenticated users.
- **Offline/Degraded State:** Displays stored in-memory event buffer.
- **Responsive Behavior:** 3D stream matrix collapses; table view fills viewport.
- **Accessibility Requirements:** ARIA live region `polite` for event stream updates with pause control.
- **Performance Budget:** Max 25k polygons; 60 FPS.

---

### ROUTE 21: OBSERVABILITY - DISTRIBUTED TRACES WORKSPACE (`/observability/traces`)
- **Purpose:** Distributed tracing workspace for inspecting end-to-end trace spans across Resilience OS execution cycles (`REST API` → `World Model` → `Risk Engine` → `Swarm Agents` → `Policy Engine` → `Verification`).
- **User Actions:** Inspect trace waterfall timeline, filter spans by latency (>100ms), search trace ID, view span tags and error logs.
- **API Sources:** `GET /api/observability/traces`, `GET /api/observability/traces/{id}`.
- **WebSocket Events:** `TRACE_SPAN_COMPLETED`.
- **Zustand State:** `observabilityStore` (selectedTraceId, traceDetail).
- **TanStack Query:** `useQuery(['tracesList'])`, `useQuery(['traceDetail', traceId])`.
- **3D Scene:** 3D Waterfall Trace Lattice displaying trace spans as horizontal 3D translucent bars arranged chronologically by subsystem layer.
- **2D UI:** Trace List Table, Span Waterfall Timeline, Span Detail Drawer (Duration, Latency, Inputs, Outputs, Status).
- **Animations:** Timeline expansion animation on span click; red highlight on bottleneck spans.
- **Transitions:** Smooth camera focus onto selected span lattice tier.
- **Loading State:** Trace waterfall skeleton bars.
- **Empty State:** "No traces matching search query".
- **Error State:** "Trace Store Error — Unable to retrieve trace details".
- **Permission State:** Accessible to all users.
- **Offline/Degraded State:** Displays synthetic trace spans.
- **Responsive Behavior:** 3D lattice collapses; gantt chart view adjusts to screen width.
- **Accessibility Requirements:** Keyboard navigation for gantt chart span rows.
- **Performance Budget:** Max 20k polygons; 60 FPS.

---

### ROUTE 22: GOVERNANCE - POLICY ENGINE WORKSPACE (`/governance/policies`)
- **Purpose:** Governance and compliance control plane for configuring hard financial limits, operational constraints, and policy rule sets.
- **User Actions:** View active policy rules, adjust max cost threshold ($50k), toggle rule enforcement mode (`PASS`, `WARN`, `BLOCK`), add compliance rule.
- **API Sources:** `GET /api/governance/policies`, `POST /api/governance/policies/update`, `POST /api/governance/policies/evaluate`.
- **WebSocket Events:** `POLICY_MUTATED`, `POLICY_EVALUATED`.
- **Zustand State:** `governanceStore` (activePolicies, evaluationHistory).
- **TanStack Query:** `useQuery(['governancePolicies'])`, `useMutation(['updatePolicy'])`.
- **3D Scene:** Minimalist Cybernetic Governance Cube displaying active policy enforcement boundaries as glowing perimeter shields around the core execution sphere.
- **2D UI:** Policy Rules Table (Cost Limit, SLA Floor, Disruption Cap), Rule Config Modals, Policy Test Evaluator form, Governance Audit Status.
- **Animations:** Shield pulse animation on policy violation test; smooth toggle switch transitions.
- **Transitions:** Cross-fade to Execution Safety Plane.
- **Loading State:** Policy list table skeleton loader.
- **Empty State:** "No policy rules configured — Load default enterprise policy preset".
- **Error State:** "Policy Engine Update Failed — Invalid rule syntax".
- **Permission State:** Rule editing strictly restricted to `COMPLIANCE_OFFICER` / `ADMIN`.
- **Offline/Degraded State:** In-memory policy engine active.
- **Responsive Behavior:** 3D shield hidden on mobile viewports.
- **Accessibility Requirements:** High contrast status badges (`BLOCK` = Red, `PASS` = Emerald, `WARN` = Amber).
- **Performance Budget:** Max 15k polygons; 60 FPS.

---

### ROUTE 23: GOVERNANCE - EXECUTION SAFETY PLANE (`/governance/execution`)
- **Purpose:** Execution Safety Plane workspace for monitoring plan execution safety modes (`DRY_RUN` vs `LIVE`), reviewing operator execution authorization logs, and managing execution locks.
- **User Actions:** Toggle execution mode (`DRY_RUN` default), inspect dry-run execution summaries, review authorization signatures, release execution safety lock.
- **API Sources:** `GET /api/execution/safety/status`, `POST /api/execution/safety/mode`, `POST /api/execution/safety/dry-run`.
- **WebSocket Events:** `EXECUTION_MODE_MUTATED`, `DRY_RUN_COMPLETED`.
- **Zustand State:** `executionStore` (executionMode, dryRunHistory).
- **TanStack Query:** `useQuery(['executionSafetyStatus'])`, `useMutation(['setExecutionMode'])`.
- **3D Scene:** 3D Execution Safety Gate displaying a physical dual-lock barrier that glows amber in `DRY_RUN` mode and emerald in `LIVE` mode (locked by default).
- **2D UI:** Safety Mode Toggle (DRY RUN locked), Execution Request History, Human Authorization Validator, Dry-Run Simulation Log.
- **Animations:** Safety barrier lock mechanism rotation animation; mode switch status glow change.
- **Transitions:** Smooth navigation to Audit Log workspace.
- **Loading State:** Safety plane status loader.
- **Empty State:** "No recent execution requests logged".
- **Error State:** "Execution Safety Plane Failure — System locked to DRY RUN mode for security".
- **Permission State:** Mode switching to `LIVE` strictly locked to `OWNER` with MFA authentication.
- **Offline/Degraded State:** Hard-locked to `DRY_RUN` mode during degraded state.
- **Responsive Behavior:** 3D safety barrier collapses; status card fills view.
- **Accessibility Requirements:** Explicit text warnings for live execution modes.
- **Performance Budget:** Max 15k polygons; 60 FPS.
