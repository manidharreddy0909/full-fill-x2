# FULFILL-X — Changelog
 
 All significant changes to the project are documented here.
 Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
 ## [2.3.0] — 2026-09-28 — Phase 6G, 6H & 6I: Deep Intelligence, Extraordinary Demo & Final Hardening

### Added & Integrated
- **Deep Intelligence Progressive Disclosure Bridges (`DeepDecisionLinkCard.tsx`)**: Created universal progressive disclosure bridges linking GNN, Causal, Predictive ML, Simulation Digital Twin, War Room, Adversary Lab, and Risk Engine directly to the Decision Clearance Cockpit.
- **7 Deep Intelligence Workspaces Upgraded**:
  - `GNNWorkspace.tsx`: Displays cascade impact score, topological propagation depth, and downstream risk bridge.
  - `CausalWorkspace.tsx`: Displays counterfactual `do(X)` risk reduction, attenuation rate, and structural causality bridge.
  - `PredictiveIntelligence.tsx`: Displays disruption probability and PSI drift telemetry bridge.
  - `DigitalTwinWorkspace.tsx`: Displays Monte Carlo P50 service level and stochastic confidence bridge.
  - `WarRoomWorkspace.tsx`: Displays specialist swarm deliberation consensus and coordinator reconciliation bridge.
  - `AdversaryWorkspace.tsx`: Displays attack vector probing counts, critical boundary thresholds, and stress-test envelope bridge.
  - `RiskWorkspace.tsx`: Displays network composite fragility, decay factors, and risk propagation bridge.
- **Extraordinary Demo System**: Verified and regenerated multi-step deterministic competition demonstration artifacts (`artifacts/demo/demo_report.json` and `artifacts/demo/demo_report.md`) covering all 12 stages from nominal observation to outcome retention.
- **Master Documentation**: Published `docs/PHASE_6G_6H_6I_FINAL_COMPLETION.md`.

### Verified
- `tsc --noEmit`: 0 errors.
- `npm run build`: Production bundle built in 11.57s (2,622 modules transformed, 0 errors).
- `pytest`: 313/313 tests PASS (100% pass rate in 98.31s).
- Live runtime daemons confirmed: FastAPI (`http://127.0.0.1:8000`), Vite Dev Server (`http://127.0.0.1:5173`).

---

## [2.2.0] — 2026-09-28 — Phase 6F: Decision Convergence & Safety Clearance

### Added & Integrated
- **Authoritative Decision Evidence Model**: Created `frontend/src/types/decisionEvidence.ts` synthesizing Incident context, Hindsight recalled memories, Resilience Genome invariants, Recovery Skill preconditions, Transferability evaluation, Deep Intelligence studio summaries, Strategy candidate matrices, Governance policies, Deterministic verification, and Outcome feedback.
- **Decision Clearance Convergence Panel**: Created `frontend/src/components/cockpit/DecisionEvidencePanel.tsx` with multi-tab convergence views, authoritative clearance badges (`RECOMMENDED`, `AUTHORIZED`, `REQUIRES_APPROVAL`, `BLOCKED`), policy condition checks, and governed execution.
- **Closed-Loop Outcome Retention**: Implemented direct feedback capture (Predicted vs Actual recovery time & cost deltas) and live retain API calls to `/api/experiences/retain` updating Hindsight memory.
- **Cockpit Workspace Integration**: Enhanced `frontend/src/components/workspaces/CockpitWorkspace.tsx` to mount both the converged decision evidence clearance workspace and the autonomous 8-stage pipeline orchestrator.

### Verified
- `tsc --noEmit`: 0 errors.
- `npm run build`: Production bundle built in 11.71s (2,621 modules, 0 errors).
- `pytest`: 313/313 tests PASS.
- Published `docs/PHASE_6F_DECISION_CONVERGENCE.md`.

---


+
+### Added & Integrated
+- **Hindsight Substrate Wiring**: Connected the complete closed loop: `Incident -> Retrieval -> Recall -> Reflect -> Genome -> Boundary -> Skill -> Challenge -> Transfer -> Strategy -> Governance -> Decision -> Outcome -> Retain -> Delta`.
+- **Backend Status Endpoint**: Added `/api/hindsight/status` in `backend/app/api/hindsight.py` delivering real live memory counts, genome counts, and truth separation verification.
+- **Experience Memory**: Wired live `GET /api/experiences` query, expanded prediction vs actual delta cards, validated success conditions, failure boundaries, and reflection trigger.
+- **Resilience Genome**: Connected `useIncidentContextStore.setSelectedGenomeId`, live synthesis indicators, and reflection trigger.
+- **Transfer Intelligence**: Context-aware 4-state transfer assessment (`TRANSFERABLE`, `PARTIAL`, `NON-TRANSFERABLE`, `UNKNOWN`) with condition verification tables and `TruthTag`.
+- **Strategy Arena**: Synchronized candidate selection with global store, connected to `/challenge` and `/decision/cockpit` with `TruthTag` and `EvidenceCard`.
+
+### Verified
+- `tsc --noEmit`: 0 TypeScript errors.
+- `npm run build`: Production bundle built in 26.06s (2,620 modules, 0 errors).
+- `pytest`: 64/64 passing across core Hindsight/Skills/Challenge/Eval suites; 313/313 passing full backend suite.
+- Published `docs/PHASE_6E_HINDSIGHT_INTEGRATION.md`.
+
+---
 
+## [2.0.1] — 2026-09-28 — Phase 6D.1: Acceptance, Forensic Regression & Context-Continuity Audit
+
+### Verified & Audited
+- Forensic source inspection of Phase 6B, 6C, and 6D components (`TruthTag`, `EvidenceCard`, tokens, `incidentContextStore`, `ContextBar`, `hindsightApi`, `CommandWorkspace`).
+- Cross-workspace context continuity verified across Command $\rightarrow$ Risk $\rightarrow$ GNN $\rightarrow$ Causal $\rightarrow$ ML $\rightarrow$ War Room $\rightarrow$ Adversary $\rightarrow$ Verification $\rightarrow$ Cockpit.
+- Deterministic context invalidation enforced in `useIncidentContextStore.setActiveIncident()` (resets strategy, genome, memory, challenge, boundary, and feedback on incident transition).
+- Epistemic truth audit completed: all demo fixtures strictly tagged with `DEMO / SIMULATED / INFERRED / LEARNED` labels.
+- 31 active routes and 26 workspaces verified without regression.
+- Full backend regression suite: **313/313 pytest tests PASS** (85.30s).
+- Frontend verification: `tsc --noEmit` **0 errors**, `npm run build` **PASS (11.85s, 2,620 modules)**.
+- Published `docs/PHASE_6D1_ACCEPTANCE_AUDIT.md`.
+
+---
 
+## [2.0.0] — 2026-09-28 — Phase 6B + 6C + 6D: Shared Design System, Global Resilience Context & Unified Command Center
+
+### Added
+
+**Epistemic Truth Design System (Phase 6B)**
+- `frontend/src/visual/tokens.ts`: Epistemic color palette `COLOR.truth` (`observed`, `simulated`, `predicted`, `inferred`, `learned`), `TruthMode` type, and `truthColor` resolver.
+- `frontend/src/index.css`: Added `.truth-tag` styling classes and badges.
+- `frontend/src/components/common/TruthTag.tsx`: Standardized epistemic provenance indicator with Lucide icons.
+- `frontend/src/components/common/EvidenceCard.tsx`: Reusable decision grounding card linking strategy choices to memory provenance, genome IDs, challenge validation rates, and boundary guards.
+
+**Global Resilience Context & Situational Awareness (Phase 6C)**
+- `frontend/src/store/incidentContextStore.ts`: Cross-workspace Zustand store maintaining situational awareness across active incident signature, impacted node, selected strategy, recalled memories, genome versions, truth mode, and boundary alerts.
+- `frontend/src/api/hindsightApi.ts`: REST API client for Hindsight services (`/api/hindsight/status`, `/api/experiences`, `/api/genomes`, `/api/reflect`).
+- `frontend/src/components/common/ContextBar.tsx`: Global operational awareness strip mounted under topbar across all 26 workspaces.
+- `frontend/src/components/layouts/ResilienceIntelligenceLayout.tsx`: Mounted `<ContextBar />` globally.
+- `frontend/src/components/workspaces/GNNWorkspace.tsx` & `CausalWorkspace.tsx`: Integrated `useSearchParams` (`?node=`) and store synchronization for cross-workspace deep linking.
+
+**Unified Command Center & Live Data Wiring (Phase 6D)**
+- `frontend/src/components/workspaces/CommandWorkspace.tsx`: 3-tab operational cockpit structuring 7 canonical questions:
+  1. What is happening? (Active Disruption & Impact)
+  2. Why is it happening? (Causal Root Cause)
+  3. What could happen next? (GNN Multi-Hop Cascade)
+  4. What can we do? (Strategy Arena & Recalled Memories)
+  5. Will it work? (Counterfactual Challenge Probing)
+  6. Is it safe? (Adaptive Governance & Verification)
+  7. What did we learn? (Genome Evolution & Delta)
+- `frontend/src/components/workspaces/ExperienceMemoryWorkspace.tsx`: Live query integration with `listExperiences()`.
+- `frontend/src/components/workspaces/ResilienceGenomeWorkspace.tsx`: Live query integration with `listGenomes()`.
+
+### Verified
+- `tsc --noEmit`: 0 TypeScript errors.
+- `npm run build`: Production bundle built in 7.15s (2,620 modules, 0 errors).
+- `pytest`: 64/64 passing in 3.42s across all core suites.
+- All 26 workspaces and 31 routes intact and functional.
+
+---

## [1.9.0] — 2026-09-28 — Phase 5: Hindsight Learning Evaluation & Measurable Improvement

### Added

**Hindsight Learning Evaluation Package (`backend/app/hindsight_eval/`)**
- `ScenarioSequenceGenerator`: Canonical 30-incident deterministic benchmark sequence with 8 scenario families (BASELINE, DEGRADATION, RELATED, TRANSFER, BOUNDARY, NOVEL, DEPENDENCY_FAILURE, DEMAND_SURGE, TOPOLOGY_CHANGE, STALE). Ground truth strictly isolated from agent observation.
- `MemorylessAgent`: Operates without accumulated memory. Discards all experience between episodes. Repeated mistakes on identical failure conditions (28% capacity). `retained_episodes` always returns empty list.
- `HindsightAgent`: Operated with persistent Hindsight memory. Recalls prior failure boundaries via `ExperienceRetriever.recall()`. Avoids repeated mistakes, evaluates PARTIAL transferability on related conditions, reports UNKNOWN on novel zero-coverage events, accumulates `retained_episodes`.
- `EvaluationExperimentRunner`: Full A/B experiment orchestrator producing metrics, learning curves, hindsight dependency verification, artifact export to `evaluation.json` and `evaluation.csv`.
- `HindsightEvaluationService`: Singleton managing canonical runs, caching, and export paths.

**REST API (`backend/app/api/hindsight_eval.py`, mounted in `router.py`)**
- `GET /api/evaluation/learning/status`: Service status and export paths.
- `POST /api/evaluation/learning/canonical-run`: Execute canonical 30-episode A/B experiment.
- `GET /api/evaluation/learning/report`: Latest report with full episode traces.
- `GET /api/evaluation/learning/traces?episode_index=N`: Side-by-side episode comparison and causal attribution.
- `GET /api/evaluation/learning/export/json`: Download machine-readable `evaluation.json`.
- `GET /api/evaluation/learning/export/csv`: Download `evaluation.csv` (17 features per episode).

**Frontend Integration**
- `frontend/src/types/hindsightEval.ts`: Full TypeScript types for all Phase 5 models.
- `frontend/src/api/hindsightEvalApi.ts`: Typed async REST client.
- `frontend/src/components/workspaces/EvaluationWorkspace.tsx`: Redesigned with dual-tab architecture:
  - **Tab 1 (Hindsight Learning Evaluation)**: 6 comparative KPI cards, SVG learning curve visualizer, full comparison table (7 metrics × 4 columns), episode explorer with behavioral divergence highlighting, side-by-side decision trace panel with causal attribution tags, artifact download buttons.
  - **Tab 2 (Benchmark Suite)**: Original Phase 12 benchmark scenario registry and run history (preserved).

**Testing (`backend/tests/test_hindsight_eval.py`)**
- 9 new deterministic tests covering: scenario integrity, Memoryless isolation, Hindsight persistence & avoidance, related transfer reasoning, UNKNOWN detection, causal attribution, 30-episode runner metrics, Hindsight dependency proof, and service lifecycle.

**Documentation**
- `docs/EVALUATION_LEARNING_SPEC.md`: Full Phase 5 evaluation architecture, benchmark dataset, metrics table, decision attribution schema, and artifact exports.
- `ADR-042` in `docs/DECISION_LOG.md`: Architecture decision for A/B deterministic experiment approach.

### Verified Test Results

| Test Suite | Count | Status |
|---|---|---|
| Phase 2A — Hindsight (`test_hindsight.py`) | 10/10 | ✅ PASS |
| Phase 3 — Skills (`test_skills.py`) | 23/23 | ✅ PASS |
| Phase 4 — Challenge (`test_challenge.py`) | 22/22 | ✅ PASS |
| **Phase 5 — Evaluation (`test_hindsight_eval.py`)** | **9/9** | ✅ PASS |
| **Combined** | **64/64** | ✅ PASS |
| Frontend TypeScript Build | 2600 modules | ✅ PASS |

### Empirical Learning Results

| Metric | Memoryless | Hindsight | Δ |
|---|---|---|---|
| Recovery Success Rate | 43.3% | 93.3% | **+50.0%** |
| Repeated Mistake Rate | 36.7% | 0.0% | **−36.7%** |
| Unsafe Action Rate | 36.7% | 3.3% | **−33.3%** |
| Boundary Avoidance Rate | 0.0% | 40.0% | **+40.0%** |
| Unknown Detection Rate | 0.0% | 3.3% | **+3.3%** |
| Average Prediction Error | 2.50h | 0.40h | **−2.10h** |
| Transfer Accuracy | 0.0% | 76.7% | **+76.7%** |

---

## [1.8.0] — 2026-09-28 — Phase 4: Challenge Engine, Counterfactual Learning & Adaptive Autonomy

### Added

**Challenge Scenario Generation & Gradient Probing (`backend/app/challenge/`)**
- `ChallengeScenarioGenerator` implementing 8+ hypothesis-driven challenge families: `BOUNDARY_TEST`, `CAPACITY_DEGRADATION`, `DEPENDENCY_FAILURE`, `TOPOLOGY_CHANGE`, `DEMAND_SURGE`, `STALE_EVIDENCE`, `CONFLICTING_EVIDENCE`, and `NOVEL_CONDITION`.
- Controlled gradient boundary probing evaluating parameter sequences (e.g. 45%, 42%, 41%, 40%, 39%, 37%, 35%) to empirically discover exact failure transition points.

**Counterfactual Simulation Engine (`backend/app/challenge/counterfactual.py`)**
- Reuses deterministic simulation engine to compare Skill A vs Alternative Strategy B (e.g. Emergency Inventory Draw) and Baseline (no action) under identical perturbations.
- Computes delta service level, delta recovery hours, delta cost, and trade-off recommendations with strict `TruthStatus.SIMULATED` guarantees.

**Active Learning, Hindsight Recall & Adaptive Autonomy (`backend/app/challenge/prioritizer.py`, `governance.py`)**
- Active learning prioritizer with uncertainty zone classification (`KNOWN`, `PROBABLE`, `UNCERTAIN`, `UNKNOWN`).
- Hindsight recall queries past challenges to reuse evidence and avoid redundant testing (`challenge_reuse`).
- Adaptive autonomy engine calibrating execution authorization (`AUTO` -> `MONITOR` -> `APPROVAL` -> `BLOCK`) based on empirical outcomes without bypassing authoritative governance policies.

**Skill Immutability & Safe Evolution Triggering (`backend/app/challenge/service.py`)**
- Challenges discovering failure boundaries trigger `SkillEvolutionProposal` through `SkillEvolutionEngine`. Old skill versions ($v_1$, $v_2$) remain 100% immutable.
- Canonical 4-step Phase 4 active learning demonstration workflow.

**REST API & Challenge Engine UI (`backend/app/api/challenge.py`, `frontend/src/components/workspaces/ChallengeEngineWorkspace.tsx`)**
- REST endpoints under `/api/challenge/*`.
- Interactive frontend workspace featuring skill envelope, boundary configuration, gradient probe visualizer, counterfactual arena, prediction error telemetry, and canonical demo runner.

## [1.7.0] — 2026-09-20 — Phase 7: Graph Neural Networks & Causal Intelligence Platform

### Added

**Graph ML Engine & Feature Extractor (`backend/app/graph/`)**
- `GraphMLAdapter` converting World Model snapshots to NetworkX `DiGraph` and PyTorch Geometric tensor representations.
- `GraphFeatureExtractor` producing 22D node feature vectors and 4D edge feature vectors adhering to `graph_feature_schema_version = "1.0.0"`.

**CPU-Native GNN Models, Baselines & Registry (`backend/app/graph/models/`, `training.py`, `registry.py`)**
- `GraphSAGEPredictor` 2-layer message-passing neural network with automated `NetworkXGNNFallback` fallback.
- `GraphModelTrainer` evaluating GNN models against 3 baselines (Deterministic Risk Engine, Network Centrality, Phase 6 non-graph ML) with `is_gnn_preferred` safeguards.
- `LocalGraphModelRegistry` managing model lifecycles with SHA-256 checksum verification and instant rollback.

**Disruption Propagation, Causal Intelligence & Counterfactual Engine (`backend/app/graph/propagation.py`, `causal.py`, `counterfactual.py`)**
- `PropagationEngine` tracing multi-hop downstream reachability up to 4 hops with path decay probabilities and impact severity levels.
- `CausalHypothesisGenerator` linking root causes to downstream targets with explicit evidence support and assumption tracking.
- `CounterfactualEngine` running sandboxed `do(node.capacity = X)` simulations calculating `risk_delta`, `service_delta`, and `cost_delta`.

**REST API, Security RBAC & Realtime Integration (`backend/app/api/graph.py`, `auth.py`, `security.py`, `events.py`)**
- Alembic migration `006_gnn_causal_intelligence.py` creating graph and causal tables.
- 14 RBAC permissions (`GRAPH_*`, `GNN_*`, `CAUSAL_*`) and 10 realtime event types registered.
- REST endpoints under `/api/graph/*`, `/api/gnn/*`, `/api/causal/*`.

**Cinematic Graph Intelligence Operations Workspace (`frontend/src/components/graph/GraphIntelligence.tsx`)**
- Premium frontend workspace featuring Network Topology Explorer, Disruption Propagation Visualizer, Causal Explorer, and What-If Counterfactual Sandbox. Registered under top-level `GRAPH INTELLIGENCE` tab.

## [1.6.0] — 2026-09-20 — Phase 6: Predictive AI / ML Platform (Free-First / Local-First / Deterministic / Explainable)

### Added

**Predictive ML Architecture & Algorithms (`backend/app/ml/`)**
- Free-First local ML engine built on `scikit-learn`, `numpy`, `pandas`, `scipy`, and `joblib`.
- `DemandForecastingModel` (predictive values + 95% confidence intervals), `DisruptionProbabilityModel` (calibrated probabilities + risk drivers), and `OperationalAnomalyDetector` (Isolation Forest + Z-Score scoring).

**Naive Baseline Comparison Safeguard & Local Model Registry (`backend/app/ml/training.py`, `backend/app/ml/registry.py`)**
- `ModelTrainer` comparing every ML model against naive baselines; marks `is_baseline_preferred = True` if ML model fails to beat baseline.
- `LocalModelRegistry` with checksum verification, lifecycle states (`TRAINED`, `VALIDATED`, `CANDIDATE`, `ACTIVE`, `RETIRED`, `REJECTED`), and instant rollback (`rollback_model`).

**Anti-Leakage Feature Store & Deterministic Dataset Generator (`backend/app/ml/features.py`, `backend/app/ml/datasets.py`, `backend/app/ml/store.py`)**
- `FeatureExtractor` computing temporal, operational, network, external, risk, and lag features adhering to `feature_schema_version = "v1.0.0"`.
- `DeterministicDatasetGenerator` producing time-aware train/val/test splits ($70\% / 15\% / 15\%$) across 6 scenario modes with seed 42.

**Inference, Predictive Signals & Drift Monitoring (`backend/app/ml/inference.py`, `backend/app/ml/drift.py`, `backend/app/ml/explainability.py`)**
- `PredictionService` producing `Prediction` envelopes and publishing `PredictiveSignal` objects into `SignalFusionEngine`.
- `ExplanationGenerator` producing deterministic feature importance drivers and natural language evidence narratives.
- `DriftDetector` computing Population Stability Index (PSI) and Kolmogorov-Smirnov statistics.

**ORM Persistence, Alembic Migration & Security (`backend/app/models/ml.py`, `005_predictive_ml_platform.py`, `auth.py`, `security.py`)**
- Persistent SQLAlchemy 2.0 ORM models (`MLDatasetModel`, `MLModelRecordModel`, `MLPredictionRecordModel`, `MLDriftRecordModel`) and Alembic migration `005_predictive_ml_platform.py`.
- Registered 7 ML permissions (`ML_READ`, `ML_TRAIN`, `ML_EVALUATE`, `ML_ACTIVATE`, `ML_RETIRE`, `ML_PREDICT`, `ML_MANAGE`) in `Permission` enum and `ROLE_PERMISSIONS_MAP`.

**Predictive Intelligence Workspace UI (`frontend/src/components/ml/PredictiveIntelligence.tsx`, `Navbar.tsx`, `App.tsx`)**
- `PredictiveIntelligence.tsx` workspace featuring Demand Forecast Chart, Disruption Probability Map, Anomaly Inspector, Model Observatory, and Training/Drift Console.
- Registered top-level `PREDICTIVE ML` tab in Navbar shell.

---

## [1.5.0] — 2026-09-19 — Phase 5: Distributed Realtime + Observability (Free-First / Local-First / Event-Driven)

### Added

**Distributed Event Transport Abstraction (`backend/app/realtime/transport.py`, `backend/app/realtime/event_bus.py`)**
- `EventTransport` protocol interface with `InMemoryEventTransport` (Free-First default) and `RedisEventTransport` (Redis Streams & Consumer Groups with zero-downtime fallback to memory).
- TransportFactory dynamic binding and backwards-compatible EventBus integration.

**Hardened Event Envelope & Traceability (`backend/app/schemas/events.py`)**
- Extended `EventEnvelope` with `correlation_id`, `causation_id`, `producer`, `metadata`, and `schema_version` (v1.0.0).
- Added event types: `ALERT_TRIGGERED`, `ALERT_ACKNOWLEDGED`, `METRICS_COLLECTED`, `HEALTH_STATUS_CHANGED`, `DEAD_LETTER_EVENT`.

**Idempotency & Deduplication Engine (`backend/app/services/idempotency.py`, `backend/app/models/idempotency.py`, `004_distributed_realtime_observability.py`)**
- `IdempotencyEngine` preventing duplicate event execution on `(event_id, consumer_id)`.
- Persistent ORM table `IdempotencyRecordModel` and Alembic migration `004_distributed_realtime_observability.py`.

**Hardened WebSocket Realtime Gateway (`backend/app/realtime/websocket_manager.py`, `backend/app/api/websocket.py`)**
- JWT authentication & `SecurityContext` registration on WebSocket connect.
- Per-client bounded queue (`MAX_QUEUE_SIZE = 1000`) with event priority retention (`CRITICAL`, `HIGH`, `NORMAL`, `LOW`) and backpressure management.

**Observability, Telemetry & Alert Subsystem (`backend/app/core/telemetry.py`, `metrics.py`, `services/alerts.py`, `api/observability.py`)**
- Structured JSON Logger with secret redaction and correlation propagation.
- Non-fatal `TracingSpan` OpenTelemetry context wrappers.
- Prometheus Metrics Registry (`/metrics`) and Deep Health check (`/health/deep`).
- `AlertEngine` evaluating operational rules with fingerprint deduplication, cooldown timers (`300s`), and `/api/observability/*` REST endpoints.

**Operations Observatory Workspace UI (`frontend/src/components/observability/ObservabilityCenter.tsx`, `Navbar.tsx`, `App.tsx`)**
- `ObservabilityCenter.tsx` featuring System Pulse, Event Pipeline Flow visualizer, Live Event Stream, Trace Explorer, Alert Center, and Deep System Health breakdown.
- Connected `ObservabilityCenter` into `App.tsx` navigation shell under top-level `OBSERVABILITY` tab.

**Comprehensive Specifications & Unit Test Suites (`docs/`, `backend/tests/`)**
- Authored `DISTRIBUTED_EVENT_ARCHITECTURE.md`, `EVENT_TRANSPORT_SPEC.md`, `EVENT_SCHEMA_SPEC.md`, `EVENT_REPLAY_SPEC.md`, `REALTIME_ARCHITECTURE.md`, `OBSERVABILITY_ARCHITECTURE.md`, `METRICS_SPEC.md`, `TRACING_SPEC.md`, `ALERTING_SPEC.md`, `OPERATIONS_RUNBOOK.md`, `FAILURE_MODES.md`, and `ADR-035`.
- Authored test suites (`test_event_transport.py`, `test_idempotency.py`, `test_observability.py`, `test_alerts.py`, `test_websocket_hardening.py`).

---

## [1.4.0] — 2026-09-19 — Phase 4: Real-World Data + Supply-Chain Integrations (Free-First / Local-First / Open-Data-First)

### Added

**Vendor-Neutral Open Data Adapters & Ingestion Architecture (`backend/app/adapters/`, `backend/app/services/ingestion.py`)**
- Abstract `DataSourceAdapter` protocol contract and dynamic `AdapterRegistry` supporting `LIVE`, `HYBRID`, and `OFFLINE` (Seed 42) modes.
- Open-Meteo Weather API adapter (`OpenMeteoWeatherAdapter`), USGS Earthquake GeoJSON adapter (`USGSEarthquakeAdapter`), OpenStreetMap/Ports geospatial adapter (`OpenStreetMapPortAdapter`), and RSS Weak-Signal Intelligence feed adapter (`RSSWeakSignalAdapter`).
- Free-First policy: 100% open APIs / local deterministic fallback fixtures without requiring paid API keys.

**Canonical Data Models & Row-Level Tenant Persistence (`backend/app/models/data_ingestion.py`, `backend/alembic/versions/003_real_world_data.py`)**
- Pydantic v2 schemas (`ExternalObservation`, `ExternalSignal`, `EntityResolutionCandidate`, `DataQualityReport`, `IngestionRunSummary`) and 8 SQLAlchemy 2.0 ORM tables.
- Alembic migration `003_real_world_data.py` with multi-tenant row-level `organization_id` scoping.

**Data Quality Engine & Deterministic Entity Resolution (`backend/app/services/data_quality.py`, `backend/app/services/entity_resolution.py`)**
- `DataQualityEngine` calculating completeness ($S_c$), validity ($S_v$), freshness ($S_f$), and duplicate ($S_d$) metric scores into composite reports ($S_{\text{overall}}$).
- `EntityResolutionService` mapping external entities/locations to canonical supply chain graph nodes via exact alias matching, name matching, and Haversine spatial proximity matching ($\le 50\text{ km}$).

**Data Replay Engine, Ingestion Scheduler & REST API Router (`backend/app/services/data_replay.py`, `backend/app/services/scheduler.py`, `backend/app/api/ingestion.py`)**
- `DataReplayService` for offline historical replay benchmarking ($100\%$ determinism verified).
- `IngestionScheduler` background loop for periodic polling.
- REST API router registered under `/api/data/*` using Phase 3 `SecurityContext` & RBAC permissions (`Permission.DATA_IMPORT`).

**Cinematic Data Fabric Workspace (`frontend/src/components/data/DataFabric.tsx`, `App.tsx`, `Navbar.tsx`)**
- `DataFabric.tsx` workspace featuring Source Observatory, Live Ingestion Stream, Data Quality Inspector, Entity Resolution Workspace, Provenance Explorer, and Storage view.
- Connected `DataFabric` into main `App.tsx` navigation under `DATA` workspace tab.

**Comprehensive Specifications & Test Suite (`docs/`, `backend/tests/`)**
- Authored `DATA_INTEGRATION_ARCHITECTURE.md`, `DATA_SOURCES.md`, `DATA_ADAPTER_SPEC.md`, `DATA_QUALITY_SPEC.md`, `ENTITY_RESOLUTION_SPEC.md`, `DATA_REPLAY_SPEC.md`, `DATA_SECURITY.md`, `DATA_OPERATIONS.md`, `DATA_API.md`, and `ADR-034`.
- Authored unit test suites `backend/tests/test_data_adapters.py` and `backend/tests/test_data_ingestion.py` (8/8 PASS, 173/173 full backend PASS).

---

## [1.3.0] — 2026-09-19 — Phase 3: Identity + Enterprise Security (Free-First / Local-First / Zero-Trust)

### Added

**Zero-Trust Identity & Tenant Isolation Engine (`backend/app/models/identity.py`, `backend/app/schemas/auth.py`, `backend/app/services/auth.py`)**
- Persistent SQLAlchemy 2.0 ORM identity models (`UserModel`, `OrganizationModel`, `MembershipModel`) and Alembic migration `002_identity_and_tenancy.py`.
- Row-level `organization_id` tenant scoping columns added across all 9 persistent domain tables.
- Cryptographic password hashing using standard library PBKDF2-HMAC-SHA256 (100,000 iterations) and HMAC-SHA256 JWT access/refresh token management with in-memory revocation blacklist.

**Authoritative RBAC Policy Matrix & Security Context (`backend/app/core/security.py`, `backend/app/api/deps.py`, `backend/app/api/auth.py`)**
- Authoritative RBAC policy matrix mapping 6 system roles (`OWNER`, `ADMIN`, `OPERATOR`, `ANALYST`, `VIEWER`, `AUDITOR`) to 30 explicit permissions.
- FastAPI dependency injection (`get_security_context`, `require_permission`, `require_role`) and REST API router registered under `/api/auth/*`.

**Boundary Security, Rate Limiter & Tenant WebSockets (`backend/app/core/rate_limit.py`, `backend/app/realtime/`, `backend/app/main.py`)**
- `SlidingWindowRateLimiter` sliding window rate limiter (120 req/min).
- HTTP Security Headers (`nosniff`, `DENY`, `1; mode=block`).
- Tenant-aware WebSocket connection token verification and `EventEnvelope.organization_id` streaming filter.

**Cinematic Frontend Experience & Security Workspace (`frontend/src/components/auth/IdentityGateway.tsx`, `frontend/src/components/security/SecurityConsole.tsx`, `Navbar.tsx`, `App.tsx`)**
- `IdentityGateway.tsx` login/register modal and `SecurityConsole.tsx` enterprise security workspace.
- Registered top-level `SECURITY` workspace tab and User Account status pill in Navbar.

**Comprehensive Specifications & Test Suite (`docs/`, `backend/tests/`)**
- Authored `IDENTITY_ARCHITECTURE.md`, `AUTHORIZATION_MODEL.md`, `SECURITY_MODEL.md`, `THREAT_MODEL.md`, `SESSION_SECURITY.md`, `COGNITO_ADAPTER.md`, `SECURITY_OPERATIONS.md`, and `ADR-033`.
- Authored unit & security test suites `backend/tests/test_auth.py` and `backend/tests/test_security_rbac.py` (9/9 PASS, 165/165 full backend PASS).

---

## [1.2.0] — 2026-09-19 — Phase 2: Real Data Platform (Free-First / Local-First)

### Added

**Free-First Layered Persistence Architecture (`backend/app/db/`, `backend/app/models/db.py`, `backend/alembic/`)**
- Layered persistence layer supporting local open-source infrastructure (PostgreSQL 16, Redis 7) with zero-overhead fallback to `MEMORY` mode.
- SQLAlchemy 2.0 async ORM models & Alembic migrations (`001_initial_schema.py`) covering all 12 platform entities: `world_snapshots`, `signals`, `risk_snapshots`, `scenarios`, `agent_proposals`, `candidate_plans`, `verification_reports`, `approval_decisions`, `evaluation_runs`, `audit_events`, `event_history`, and `data_provenance`.
- Concrete PostgreSQL repository adapters (`PostgresWorldRepository`, `PostgresRiskRepository`, `PostgresEvaluationRepository`).

**Data Platform Service & Quality Engine (`backend/app/services/data.py`, `backend/app/api/data.py`)**
- `DataPlatformService` handling data provenance recording, automated data quality checks (orphan edge/signal validation), deterministic seeding (`seed=42`), JSON/JSONL/CSV import/export, and configurable data retention policies.
- Persistent `EventBus` event sink recording live events asynchronously to `event_history` without blocking WebSockets.
- REST endpoints registered under `/api/data/*` (`/status`, `/stats`, `/provenance`, `/quality`, `/seed`, `/export`, `/import`).

**Operational Data Platform Frontend View (`frontend/src/components/data/DataFoundation.tsx`, `Navbar.tsx`, `App.tsx`)**
- Created `DataFoundation.tsx` providing real-time storage mode monitoring, record count statistics, quality scores, deterministic seeding triggers, export format options (JSON, JSONL, CSV), and file import interface.
- Registered top-level `DATA` workspace tab in primary application navigation shell.

**Comprehensive Specifications & Documentation (`docs/`)**
- Authored `FREE_FIRST_ARCHITECTURE.md`, `DATA_PLATFORM_SPEC.md`, `DATA_MODEL.md`, `DATABASE_SPEC.md`, `DATA_PROVENANCE_SPEC.md`, `DATA_MIGRATION_GUIDE.md`, and added `ADR-032` to `DECISION_LOG.md`.
- Authored unit test suites `backend/tests/test_database.py` and `backend/tests/test_data_platform.py` (7/7 PASS).

---

## [1.1.0] — 2026-09-19 — Phase 1: Real AWS + Production Infrastructure

### Added

**AWS Production Infrastructure & IaC Audit (`infra/terraform/*.tf`)**
- Terraform IaC specifications covering AWS ECR (`fulfillx-backend`), ECS Fargate (`fulfillx-cluster`), Application Load Balancer (`fulfillx-alb`), S3 static hosting + CloudFront OAC, and CloudWatch log groups (`/ecs/fulfillx-backend`).
- Security group isolation restricting ECS task ingress strictly to ALB security group (`aws_security_group.alb.id`).
- ALB 24-hour idle timeout (`idle_timeout = 86400`) for persistent WebSockets.

**AWS Bedrock AI Integration & Auto-Fallback (`backend/app/providers/bedrock.py`, `factory.py`)**
- `BedrockProvider` adapter configured with automatic fallback to `MockAIProvider` if AWS credentials or model access are absent.

**Operational Runbooks & Live Deployment Specifications (`docs/AWS_LIVE_DEPLOYMENT.md`, `docs/AWS_OPERATIONS_RUNBOOK.md`, `docs/DECISION_LOG.md`)**
- Created `docs/AWS_LIVE_DEPLOYMENT.md` and `docs/AWS_OPERATIONS_RUNBOOK.md`.
- Added `ADR-031: AWS Production Infrastructure & Deployment Readiness` to `docs/DECISION_LOG.md`.

---

## [1.0.0] — 2026-09-19 — Phase 17: Final Product Experience, Complete QA & Submission Readiness

### Added

**Unified Product Shell & Navigation (`frontend/src/App.tsx`, `frontend/src/components/common/Navbar.tsx`)**
- 8 top-level product tabs: `COMMAND`, `WORLD`, `INTELLIGENCE`, `RESPONSE`, `DECISION`, `SIMULATION`, `EVALUATION`, and `DEMO`.
- Active status pill indicators, seamless view switching, responsive layout, and unified dark glassmorphism design.

**Executive Command Center (`frontend/src/components/command/CommandCenter.tsx`)**
- High-level executive dashboard visualizing core resilience KPIs (Health Score, Resilience Score, SLR, Risk Score), top elevated risk nodes, live event feeds, and decision loop shortcuts.

**Signal Ingestion & Fusion Intelligence Panel (`frontend/src/components/intelligence/IntelligencePanel.tsx`)**
- Dedicated view tracing raw disruption signals through 6-hour deduplication clustering, BFS risk propagation, and evidence links.

**Enhanced 3D Spatial Digital Twin Overlays (`frontend/src/components/world/World3DView.tsx`)**
- Interactive floating node type (Suppliers, Hubs, Ports, Plants) and risk level (Critical, High, Medium, Low) filter overlays.

**Documentation & System Specifications (`docs/FINAL_PRODUCT_SPEC.md`, `docs/FINAL_TEST_MATRIX.md`, `docs/DECISION_LOG.md`)**
- Created `docs/FINAL_PRODUCT_SPEC.md` and `docs/FINAL_TEST_MATRIX.md`.
- Added `ADR-030: Final Product Experience Architecture & Submission Readiness` to `docs/DECISION_LOG.md`.

### Fixed

**Async WebSocket Coroutine Boundary (`backend/app/realtime/event_bus.py`)**
- Resolved all pytest `RuntimeWarning: coroutine 'WebSocketManager.broadcast_to_session' was never awaited` warnings by converting `on_event_bus_published` to an async subscriber handler and directly awaiting subscriber callbacks in `EventBus.publish`.

---

## [0.17.0] — 2026-09-19 — Phase 16: Competition Demo Mode, Guided Scenario Engine & Judge-Facing Demonstration

### Added

**Competition Demo Engine (`backend/app/demo/`, `backend/app/schemas/demo.py`, `backend/app/api/demo.py`)**
- `backend/app/schemas/demo.py` — Pydantic v2 schemas: `DemoScenarioId` (`DEMO-01`–`DEMO-05`), `DemoStatus` (14-state machine), `DemoModeType` (`STEP`, `FAST`), `DemoStepRecord`, `DemoScenario`, `DemoSession`, `DemoStartRequest`, `DemoStepRequest`, `DemoApprovalRequest`, `DemoStatusResponse`, `DemoReport`.
- `backend/app/demo/scenarios.py` — `DemoScenarioRegistry` with 5 scenarios (`DEMO-01` to `DEMO-05`), featuring primary showcase `DEMO-05` (*Full Resilience Challenge*) with fixed `seed=42`.
- `backend/app/demo/service.py` — `DemoService` singleton orchestrating 14-state machine (`IDLE` $\rightarrow$ `OBSERVING` $\rightarrow$ `RISK_DETECTED` $\rightarrow$ `SPECIALISTS_RUNNING` $\rightarrow$ `COORDINATING` $\rightarrow$ `ADVERSARY_RUNNING` $\rightarrow$ `OPTIMIZING` $\rightarrow$ `VERIFYING` $\rightarrow$ `AWAITING_APPROVAL` $\rightarrow$ `APPROVED`/`REJECTED` $\rightarrow$ `COMPLETED`), pause/resume/step/reset, approval gate, report generation, and realtime event emissions via `event_bus`.
- `backend/app/demo/report.py` — `DemoReportGenerator` building machine-readable `artifacts/demo/demo_report.json` and human-readable `artifacts/demo/demo_report.md`.
- `backend/app/api/demo.py` — REST API router exposing `/api/demo/status`, `/scenarios`, `/start`, `/step`, `/pause`, `/resume`, `/reset`, `/approve`, `/reject`, `/session/{session_id}`, `/report/{session_id}`.

**Frontend Demo Mode Console (`frontend/src/components/demo/`, `types/demo.ts`, `api/demoApi.ts`)**
- `frontend/src/types/demo.ts` & `frontend/src/api/demoApi.ts` — TypeScript interfaces and fetch API client for Competition Demo Mode.
- `frontend/src/components/demo/DemoScenarioSelector.tsx` — Card selector for competition scenarios highlighting `DEMO-05` Showcase.
- `frontend/src/components/demo/DemoTimeline.tsx` — 12-stage visual storyboard progress indicator with stage status icons and metrics.
- `frontend/src/components/demo/DemoControlBar.tsx` — Interactive control bar for Launch, Fast Run, Step Forward, Pause, Resume, Reset, and Human Approval buttons.
- `frontend/src/components/demo/DemoResult.tsx` — Competition presentation report card with network health, resilience scores, SLR, and human decision details.
- `frontend/src/components/demo/DemoMode.tsx` — Main demo console container.
- `frontend/src/components/common/Navbar.tsx` & `App.tsx` — Added prominent "Competition Demo Mode" navigation button and route integration.

**Automated Test Suite & 100% Determinism Verification (`backend/tests/test_demo.py`)**
- Created `backend/tests/test_demo.py` testing scenario registry, 14-state machine transitions, manual/fast modes, pause/resume/reset, human approval/rejection gates, REST API endpoints, report generation, and 100% determinism verification across 3 consecutive runs (`Run 1 == Run 2 == Run 3`).
- All 150/150 backend pytest tests PASS cleanly.
- Frontend production bundle (`npm run build`) builds with 0 errors.

**Documentation & Decision Log**
- Created `docs/DEMO_MODE_SPEC.md` (Competition Demo Architecture & State Machine).
- Created `docs/DEMO_SCRIPT.md` (12-stage, 3–5 minute judge presentation script).
- Added `ADR-029: Deterministic Competition Demo Architecture` in `docs/DECISION_LOG.md`.
- Updated `docs/MASTER_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/API_CATALOG.md`, `tasks/TODO.md`, `tasks/IN_PROGRESS.md`, `tasks/DONE.md`.

---

## [0.16.0] — 2026-09-19 — Phase 15: Security Audit, AI Safety, Dependency Security & Open-Source Attribution

### Added

**Security Audit & Threat Modeling (`docs/SECURITY_AUDIT.md`, `docs/SECURITY_SCORECARD.md`)**
- `docs/SECURITY_AUDIT.md` — Comprehensive security audit specification featuring full FULFILL-X threat model, trust-boundary architecture (Browser $\rightarrow$ CloudFront $\rightarrow$ ALB $\rightarrow$ ECS $\rightarrow$ API $\rightarrow$ Domain Engine $\rightarrow$ AI Providers), Mermaid trust-boundary diagram, and evidence-based vulnerability inventory across 12 domains.
- `docs/SECURITY_SCORECARD.md` — Published factual security scorecard documenting status, empirical verification evidence, and remaining production risks across all security domains.

**Open-Source Attribution & SBOM Artifacts (`THIRD_PARTY_NOTICES.md`, `artifacts/security/sbom_inventory.json`)**
- `THIRD_PARTY_NOTICES.md` — Complete open-source attribution notice covering Python backend libraries, TypeScript frontend packages, fonts (Inter, JetBrains Mono OFL-1.1), Lucide icons (ISC), and container base images.
- `artifacts/security/sbom_inventory.json` — Software Bill of Materials (SBOM) dependency inventory generated in CycloneDX v1.5 JSON format.

**Backend Security Hardening & Test Suite (`backend/app/main.py`, `backend/tests/test_security.py`)**
- `backend/app/main.py` — Added 10 MB request payload size limit middleware rejecting oversized entity bodies with HTTP 413.
- `backend/tests/test_security.py` — Created automated security test suite executing 12+ security test cases covering secret safety, CORS enforcement, malformed JSON rejection, payload size limits, path traversal prevention, error sanitization (no stack trace exposure in production), agent state immutability, prompt injection boundaries, Cockpit approval security, and WebSocket session isolation.

**Documentation & Architecture**
- Added `ADR-028: Security Architecture, AI Safety Boundary & Open-Source Attribution` to `docs/DECISION_LOG.md`.
- Updated `docs/ARCHITECTURE.md` (Section 13 Security Architecture), `docs/MASTER_PLAN.md`, `docs/API_CATALOG.md` (Section 18), `tasks/TODO.md`, `tasks/IN_PROGRESS.md`, `tasks/DONE.md`.

---

## [0.15.0] — 2026-09-19 — Phase 14: AWS Deployment, Cloud Infrastructure & Production Integration

### Added

**AWS Infrastructure as Code (`infra/terraform/`)**
- `infra/terraform/variables.tf` — Configurable variables (`aws_region`, `environment`, `app_name`, `backend_port`, `fargate_cpu`, `fargate_memory`).
- `infra/terraform/main.tf` — AWS provider v5 setup and default tagging policy (`Project: FULFILL-X`, `ManagedBy: Terraform`).
- `infra/terraform/s3_cloudfront.tf` — S3 bucket, CloudFront Origin Access Control (OAC), CloudFront distribution with SPA 404 fallback to `/index.html`, and security headers.
- `infra/terraform/ecs_alb.tf` — ECR repository (`fulfillx-backend`), CloudWatch log group (`/ecs/fulfillx-backend`), ECS Fargate cluster, task definition, Fargate service, ALB, target group (`/health` probe, 86400s WebSocket idle timeout), and HTTP listener.
- `infra/terraform/iam_security.tf` — ALB security group, ECS task security group (restricting ingress ONLY from ALB), ECS execution role, and ECS task role with Bedrock `InvokeModel` policy.
- `infra/terraform/outputs.tf` — Exports `cloudfront_domain_name`, `alb_dns_name`, `ecr_repository_url`, `s3_bucket_name`.

**Backend & Provider Settings (`backend/app/config.py`, `backend/app/providers/bedrock.py`)**
- `backend/app/config.py` — Added `AWS_REGION` ("us-east-1") and `AWS_BEDROCK_MODEL_ID` ("anthropic.claude-3-sonnet-20240229-v1:0") configuration attributes.
- `backend/app/providers/bedrock.py` — Bedrock AI provider boundary adapter with `is_configured` credential check and fallback to `MockAIProvider`.

**Automated Deployment & Smoke Test Scripts (`scripts/aws/`)**
- `scripts/aws/deploy-all.sh` & `deploy-all.ps1` — One-click automated deployment (Terraform apply, ECR docker login/tag/push, S3 static sync, CloudFront invalidation).
- `scripts/aws/smoke-test.sh` & `smoke-test.ps1` — Automated smoke test scripts validating HTTP 200 probes across `/health`, `/api/health`, `/api/world/summary`, and `/api/evaluation/status`.
- `scripts/aws/destroy.sh` & `destroy.ps1` — Controlled teardown scripts.

**CI/CD Pipeline & Automated Test Suite (`.github/workflows/ci-cd.yml`, `backend/tests/test_aws_integration.py`)**
- `.github/workflows/ci-cd.yml` — GitHub Actions workflow executing pytest test suite, frontend production build, and Terraform format/validation checks.
- `backend/tests/test_aws_integration.py` — AWS integration and security test suite covering settings, Bedrock adapter initialization, readiness probes, secret protection, and CORS origin validation (`126/126 backend tests PASS`).

**Documentation & Architecture**
- Created `docs/AWS_ARCHITECTURE.md` (detailed topology, security matrix, Bedrock boundary, cost breakdown).
- Created `docs/AWS_DEPLOYMENT.md` (20-section step-by-step AWS operations guide).
- Added `ADR-027: AWS Production Deployment & Cloud Infrastructure Architecture` to `docs/DECISION_LOG.md`.
- Updated `docs/API_CATALOG.md` (Section 18), `docs/MASTER_PLAN.md`, `docs/ARCHITECTURE.md`, `tasks/TODO.md`, `tasks/IN_PROGRESS.md`, `tasks/DONE.md`.

---

## [0.14.0] — 2026-09-19 — Phase 13: Production Hardening, Containerization & Deployment Preparation

### Added

**Backend Production Infrastructure & Hardening (`backend/app/`, `backend/Dockerfile`, `backend/requirements.txt`)**
- `backend/app/config.py` — Environment-driven Pydantic `Settings` model supporting `APP_ENV`, `APP_HOST`, `APP_PORT`, `LOG_LEVEL`, `CORS_ORIGINS`, `AI_PROVIDER`, `AI_FALLBACK_PROVIDER`, `WEBSOCKET_ENABLED`, `EVALUATION_ENABLED`, `API_PREFIX`, and single-source application version (`0.13.0`).
- `backend/app/main.py` — Production FastAPI entrypoint featuring request correlation middleware (`X-Request-ID`), structured logging, environment-controlled CORS (wildcards disabled in production), global error handling (sanitizing stack traces & secrets), and graceful shutdown lifespan handlers (closing active WebSockets cleanly).
- `backend/app/api/health.py` — Probing endpoints exposing `/health` (lightweight liveness probe for Docker/K8s) and `/api/health` (deep readiness probe inspecting WorldRepository, RiskRepository, and AI Provider status).
- `backend/Dockerfile` — Security-hardened Python 3.12-slim production container running non-root user `fulfillx` (UID 10001) with `HEALTHCHECK` probe.
- `backend/requirements.txt` — Pinned production dependencies for FastAPI, Uvicorn, Pydantic, HTTPX, Pytest, Pytest-Asyncio, WebSockets.
- `backend/.dockerignore` — Excludes `.git`, `.env`, `__pycache__`, `.pytest_cache`, logs, and IDE metadata from container contexts.

**Backend Automated Smoke Test Suite (`backend/tests/test_production_smoke.py`)**
- 8 comprehensive unit and integration tests covering liveness `/health`, readiness `/api/health`, request correlation `X-Request-ID` propagation, error sanitization, CORS origin enforcement, malformed JSON rejection, performance latency baselines (< 3ms for health & graph operations), and WebSocket ping/pong protocol (`126/126 total backend pytest PASS`).

**Frontend Containerization & Bundle Optimization (`frontend/`, `frontend/Dockerfile`, `frontend/nginx.conf`)**
- `frontend/src/api/config.ts` — Dynamic API Base URL (`getApiBaseUrl()`) and WebSocket URL (`getWsBaseUrl()`) resolver supporting development, Docker Compose, and AWS cloud environments.
- Updated all API clients (`worldApi.ts`, `riskApi.ts`, `aiApi.ts`, `agentApi.ts`, `coordinatorApi.ts`, `adversaryApi.ts`, `plannerApi.ts`, `verificationApi.ts`, `cockpitApi.ts`, `evaluation.ts`, `websocket.ts`) to use dynamic URL getters instead of hardcoded localhost assumptions.
- `frontend/vite.config.ts` — Rollup `manualChunks` code splitting isolating React core and Three.js WebGL engine, reducing main application bundle size from 1,193 kB to **184 kB (84.5% reduction)**. `npm run build` PASS.
- `frontend/Dockerfile` — Multi-stage build (`node:20-alpine` build stage $\rightarrow$ `nginx:1.25-alpine` static asset runtime).
- `frontend/nginx.conf` — Production Nginx server configuration featuring SPA fallback routing, static asset caching, security headers (`X-Frame-Options`, `X-Content-Type-Options`, `CSP`, `HSTS`), and reverse proxy rules for `/api/` and `/ws`.

**Container Orchestration & Documentation (`docker-compose.yml`, `docs/`)**
- `docker-compose.yml` — Production Docker Compose configuration running `backend` (port 8000) and `frontend` (port 80) on isolated `fulfillx-net` bridge network with health checks and restart policies.
- `docs/PRODUCTION_READINESS.md` — Comprehensive 15-point production readiness checklist, container topology, performance latency baselines, and Phase 14 AWS deployment blueprint.
- Added `ADR-026: Production Hardening, Containerization & Health Probes Architecture` to `docs/DECISION_LOG.md`.
- Updated `docs/API_CATALOG.md` (Section 18), `docs/MASTER_PLAN.md`, `docs/ARCHITECTURE.md`, `tasks/TODO.md`, `tasks/IN_PROGRESS.md`, `tasks/DONE.md`.

---

## [0.13.0] — 2026-09-19 — Phase 12: Evaluation Harness & Benchmark Suite

### Added

**Backend Evaluation Infrastructure (`backend/app/schemas/`, `evaluation/`, `repository/`, `services/`, `api/`)**
- `backend/app/schemas/evaluation.py` — Strongly-typed Pydantic v2 schemas: `EvaluationRunStatus`, `MetricType`, `GroundTruth`, `BenchmarkScenario`, `MetricResult`, `EvaluationRun`, `EvaluationSummary`, `EvaluationReport`, `MetricDelta`, and `BenchmarkComparison`.
- `backend/app/evaluation/scenarios.py` — `BenchmarkScenarioRegistry` containing 8 deterministic, reproducible scenarios (`SCENARIO-01` through `SCENARIO-08`) with explicit ground-truth expectations.
- `backend/app/evaluation/metrics.py` — `MetricEngine` implementing 10 quantitative formulas ($F_1$, IoU localization, scenario validity, agent proposal validity, coordination agreement/conflict quality, adversarial coverage, plan feasibility, plan robustness, verification accuracy, transparency completeness).
- `backend/app/evaluation/baseline.py` — `RegressionBaseline` defining empirical metric thresholds and compliance evaluation.
- `backend/app/evaluation/runner.py` — `EvaluationRunner` orchestrating deterministic pipeline execution on isolated supply network graph snapshot copies.
- `backend/app/repository/evaluation.py` — `EvaluationRepository` bounded in-memory store for evaluation runs, reports, and comparisons.
- `backend/app/services/evaluation.py` — `EvaluationService` orchestrating execution, report generation, comparisons, and emitting real-time events (`EVALUATION_STARTED`, `SCENARIO_STARTED`, `METRIC_CALCULATED`, `EVALUATION_COMPLETED`).
- `backend/app/api/evaluation.py` — Typed FastAPI REST router: `GET /api/evaluation/status`, `GET /api/evaluation/scenarios`, `POST /api/evaluation/run`, `POST /api/evaluation/run-all`, `GET /api/evaluation/runs`, `GET /api/evaluation/runs/{run_id}`, `GET /api/evaluation/report`, `POST /api/evaluation/compare`. Registered in `backend/app/api/router.py`.

**Backend Evaluation Test Suite (`backend/tests/test_evaluation.py`)**
- 11 comprehensive unit and integration tests covering schemas, ground-truth model, scenario registry, metric engine formulas, runner isolation, determinism, repository operations, baseline compliance, comparison engine, REST API endpoints, and production state mutation safety assertions (`118/118 total backend pytest PASS`).

**Frontend Evaluation Dashboard UI (`frontend/src/`)**
- `frontend/src/types/evaluation.ts` — TypeScript definitions matching backend evaluation models.
- `frontend/src/api/evaluation.ts` — Strongly-typed fetch API client for evaluation endpoints.
- `frontend/src/store/evaluationStore.ts` — React hook store (`useEvaluationStore()`) managing status, scenarios, runs, report, loading, and error states.
- `frontend/src/components/evaluation/EvaluationDashboard.tsx` — Functional glassmorphic dashboard with benchmark controls (scenario dropdown, seed input, Run, Run All), metric card grid (10 core metrics with baseline badges), scenario results matrix, and detailed run inspect modal.
- `frontend/src/components/cockpit/DecisionCockpit.tsx` — Live "SYSTEM EVALUATION" metrics drawer panel fetching real-time benchmark scores.
- Integrated into `Navbar.tsx` and `App.tsx` with dedicated "Evaluation Suite" navigation button. `npm run build` PASS.

**Documentation & Artifacts**
- Added `docs/EVALUATION_SPEC.md` specification.
- Added `ADR-025: Deterministic Evaluation Harness & Quantitative Benchmark Architecture` to `docs/DECISION_LOG.md`.
- Updated `docs/API_CATALOG.md` (Section 17), `docs/MASTER_PLAN.md`, `docs/ARCHITECTURE.md`, `tasks/TODO.md`, `tasks/IN_PROGRESS.md`, `tasks/DONE.md`.
- Machine-readable benchmark report artifacts generated in `artifacts/evaluation/latest_report.json` and `artifacts/evaluation/latest_report.md`.

---

## [0.12.0] — 2026-09-19 — Phase 11: Real-Time Intelligence & Live Operational Event Layer

### Added

**Backend Real-Time Infrastructure (`backend/app/schemas/`, `realtime/`, `api/`)**
- `backend/app/schemas/events.py` — Strongly-typed Pydantic v2 event envelopes (`event_id`, `event_type`, `sequence`, `timestamp`, `session_id`, `stage`, `source`, `severity`, `payload`), 27 lifecycle `EventType` enums, `EventSeverity`, `ClientWsAction`, and `ClientWsMessage`.
- `backend/app/realtime/event_bus.py` — High-performance in-process async `EventBus` pub/sub hub with monotonic sequence numbers, session filtering, bounded memory catch-up replay log (`deque(maxlen=100)`), and zero domain-state mutation.
- `backend/app/realtime/websocket_manager.py` — `WebSocketManager` singleton managing active socket connections, session-specific broadcasting, and graceful exception handling.
- `backend/app/api/websocket.py` — FastAPI WebSocket endpoints (`/ws` & `/ws/{session_id}`) supporting client PING/PONG and subscription ACK.
- Real-Time Event Producers: Wired lifecycle event broadcasting across `CockpitService`, `SpecialistAgentService`, `RiskEngine`, `SignalIngestor`, `CoordinatorService`, `AdversaryService`, `PlannerService`, and `VerificationService`.

**Backend Real-Time Test Suite (`backend/tests/test_realtime.py`)**
- 6 comprehensive unit and integration tests covering schemas, pub/sub, session filtering, catch-up replay, WebSocket API routes, lifecycle event emissions, and zero state mutation safety assertions (`107/107 total backend pytest PASS`).

**Frontend Real-Time Client & Live Visualizations (`frontend/src/`)**
- `frontend/src/types/events.ts` — TypeScript definitions matching backend event models.
- `frontend/src/api/websocket.ts` — `RealtimeWebSocketClient` handling automatic reconnection with exponential backoff, sequence ordering, and duplicate frame filtering.
- `frontend/src/store/realtimeStore.ts` — React hook store (`useRealtimeStore()`) managing connection status, event stream, stage execution statuses, agent progress, risk updates, and toasts.
- `frontend/src/components/common/EventToastContainer.tsx` — Non-intrusive toast notification overlays for `HIGH`/`CRITICAL` severity events.
- Live Decision Cockpit & Map Updates: Driven `DecisionCockpit.tsx` WS connection status pill (`LIVE`, `RECONNECTING`, `OFFLINE`), reactive stage execution spinners, 3-column Live Event Stream panel, and real-time 2D/3D visual risk state updates (`World2DView.tsx`, `World3DView.tsx`, `App.tsx`). `npm run build` PASS.

**Documentation & ADRs**
- Added `docs/WEBSOCKET_SPEC.md` specification.
- Added `ADR-024: Real-Time Intelligence & Live Operational Event Infrastructure` to `docs/DECISION_LOG.md`.
- Updated `docs/API_CATALOG.md` (Section 16), `tasks/TODO.md`, `tasks/IN_PROGRESS.md`, `tasks/DONE.md`.

---

## [0.11.0] — 2026-09-19 — Phase 10: Decision Cockpit & End-to-End Intelligence Console

### Added

**Backend Decision Cockpit Orchestrator (`backend/app/schemas/`, `services/`, `api/`)**
- `backend/app/schemas/cockpit.py` — Strongly-typed Pydantic v2 schemas: `DecisionStage`, `DecisionStageStatus`, `DecisionWorkflowStatus`, `DecisionStageRecord`, `DecisionTimeline`, `EvidenceLink`, `ExecutiveSummary`, `ApprovalDecision`, `AuditEvent`, `CockpitError`, `DecisionSession`, `SessionCreateRequest`, `SessionRunRequest`, `SessionApproveRequest`, `SessionRejectRequest`, `CockpitStatusResponse`.
- `backend/app/services/cockpit.py` — `CockpitService` managing an 8-stage state machine (`OBSERVING` $\rightarrow$ `ANALYZING_RISK` $\rightarrow$ `RUNNING_SPECIALISTS` $\rightarrow$ `COORDINATING` $\rightarrow$ `ADVERSARIAL_TESTING` $\rightarrow$ `OPTIMIZING` $\rightarrow$ `VERIFYING` $\rightarrow$ `READY_FOR_APPROVAL`).
- Immutability Protection & Assertion: Explicit assertion that `world_before == world_after` & `risk_before == risk_after` across session creation, full loop execution, stage execution, human approval/rejection, and session reset.
- `backend/app/api/cockpit.py` — FastAPI REST router: `GET /api/cockpit/status`, `POST /api/cockpit/session`, `GET /api/cockpit/session/{id}`, `POST /api/cockpit/session/{id}/run`, `POST /api/cockpit/session/{id}/stage`, `POST /api/cockpit/session/{id}/approve`, `POST /api/cockpit/session/{id}/reject`, `POST /api/cockpit/session/{id}/reset`. Registered in `backend/app/api/router.py`.

**Backend Cockpit Test Suite (`backend/tests/test_cockpit.py`)**
- 8 comprehensive unit and integration tests covering schemas, session creation, workflow state machine stage execution, full decision loop orchestration, human approval/rejection gates, session reset, state mutation immutability safety, and REST API endpoints (101/101 total backend pytest PASS).

**Frontend Decision Cockpit UI (`frontend/src/`)**
- `frontend/src/types/cockpit.ts` — TypeScript interfaces matching backend models.
- `frontend/src/api/cockpitApi.ts` — Async API fetch client functions.
- `frontend/src/components/cockpit/EvidenceDrawer.tsx` — Interactive slide-over drawer rendering step-by-step provenance traces & metadata payloads.
- `frontend/src/components/cockpit/DecisionCockpit.tsx` — Glassmorphic fullscreen console with header & live controls ("RUN FULL DECISION LOOP", "Reset Session"), 8-stage workflow timeline, executive summary metrics, candidate plan comparison matrix, human approval gate, evidence chain, and chronological audit log.
- Integration into `Navbar.tsx`, `SpecialistWarRoom.tsx`, and `App.tsx` with dedicated "Decision Cockpit" header button and tab 6 in Specialist War Room. `npm run build` PASS.

**Documentation & ADRs**
- Added `docs/DECISION_COCKPIT_SPEC.md` specification.
- Added `ADR-023: Decision Cockpit & End-to-End Workflow Orchestration Architecture` to `docs/DECISION_LOG.md`.
- Updated `docs/API_CATALOG.md` (Section 15), `tasks/TODO.md`, `tasks/IN_PROGRESS.md`, `tasks/DONE.md`.

---

## [0.10.0] — 2026-09-19 — Phase 09: Verification & Validation Engine

### Added

**Backend Verification & Sandbox Engine (`backend/app/engine/`, `schemas/`, `agents/`, `services/`, `api/`)**
- `backend/app/schemas/verification.py` — Strongly-typed Pydantic v2 schemas: `VerificationStatus` (`VERIFIED`, `CONDITIONAL`, `REJECTED`), `ValidationSeverity`, `ValidationCategory`, `ExecutionPlan`, `ValidationCheck`, `CapacityCheck`, `RouteCheck`, `InventoryCheck`, `DependencyCheck`, `RiskCheck`, `ConstraintCheck`, `StateDiff`, `SimulationResult`, `VerificationFinding`, `VerificationReport`, `VerificationStatusResponse`, `VerificationRequest`.
- `backend/app/engine/verification.py` — `VerificationEngine` featuring `ExecutionPlanBuilder`, `ActionValidator`, `CapacityValidator`, `RouteValidator`, `InventoryValidator`, `DependencyValidator`, `SandboxSimulator` (isolated `WorldStateSnapshot` simulation), `RiskReEvaluator`, `ConstraintReEvaluator`, `StateDiffCalculator` (before vs after operational deltas), and `ReportGenerator`.
- `backend/app/agents/verification.py` — `VerificationAgent` implementing `BaseAgent` interface with strict AI safety boundary (AI used strictly for narrative explanations, never altering deterministic pass/fail statuses, metrics, or validation check outcomes).
- `backend/app/services/verification.py` — `VerificationService` orchestrator managing verification analysis, sandbox execution simulation, state mutation safety assertions (`world_before == world_after` & `risk_before == risk_after`), and report caching.
- `backend/app/api/verification.py` — FastAPI REST endpoints: `GET /api/verification/status`, `POST /api/verification/run`, `POST /api/verification/simulate`, `GET /api/verification/report`. Registered in `backend/app/api/router.py`.

**Backend Verification Test Suite (`backend/tests/test_verification.py`)**
- Comprehensive test suite covering Pydantic schemas, execution plan building, action validation, capacity validation, route validation, inventory stock-out prevention validation, graph dependency validation, isolated sandbox simulation, state mutation immutability safety, verification scenarios (Scenario A VERIFIED, Scenario B CONDITIONAL, Scenario C REJECTED), service E2E, and REST API endpoints (93/93 total backend pytest PASS).

**Frontend Verification Board UI (`frontend/src/`)**
- `frontend/src/types/verification.ts` — TypeScript interfaces matching backend verification models.
- `frontend/src/api/verificationApi.ts` — Async API client for fetching status, running verification simulations, executing sandbox runs, and retrieving reports.
- `frontend/src/components/agents/VerificationBoard.tsx` — Glassmorphic UI board rendering Status Hero Badge (`VERIFIED`, `CONDITIONAL`, `REJECTED`), Before vs After Snapshot Matrix, Validation Check Tabs (Capacity, Routes, Inventory, Dependencies, Risk, Constraints), and Detailed Verification Findings.
- Updated `SpecialistWarRoom.tsx` — Integrated `Verification & Validation` sub-tab alongside `Specialists`, `Coordinator`, `Adversary`, and `Multi-Objective Planner`, with "Run Verification Simulation" action button. `npm run build` PASS.

**Documentation & ADRs**
- Added `docs/VERIFICATION_SPEC.md` and `docs/EXECUTION_SIMULATION_SPEC.md` specifications.
- Added `ADR-022: Authoritative Plan Verification & Sandbox Execution Engine` to `docs/DECISION_LOG.md`.
- Updated `docs/API_CATALOG.md` (Section 14), `docs/DEMO_STORYBOARD.md`, `docs/ARCHITECTURE.md`.

---

## [0.9.0] — 2026-09-19 — Phase 08: Multi-Objective Planner & Optimization Engine

### Added

**Backend Multi-Objective Planner Engine (`backend/app/engine/`, `schemas/`, `agents/`, `services/`, `api/`)**
- `backend/app/schemas/planner.py` — Strongly-typed Pydantic v2 schemas: `ObjectiveDirection`, `PlannerObjective`, `ConstraintType`, `FeasibilityStatus`, `ParetoDominanceStatus`, `ObjectiveValue`, `ObjectiveVector`, `Constraint`, `FeasibilityResult`, `ParetoPoint`, `ParetoFrontier`, `RobustnessProfile`, `PlanSensitivityItem`, `PlanEvaluation`, `PlannerReport`.
- `backend/app/engine/planner.py` — `ObjectiveNormalizer` (maps 14 objectives to range [0.0, 1.0]), `ConstraintEvaluator` (evaluates Hard/Soft constraints: `FEASIBLE`, `INFEASIBLE`, `CONDITIONAL`), `ParetoEngine` (formal Pareto dominance math & Baseline/Robust Pareto Frontiers), `SensitivityAnalyzer` (parameter sweeps across ±50% cost, disruption, and demand factors), and `PlannerEngine` orchestrator.
- `backend/app/agents/planner.py` — `PlannerAgent` implementing `BaseAgent` interface with snapshot immutability safety boundary.
- `backend/app/services/planner.py` — `PlannerService` orchestrator connecting candidate plans, stress reports, and optimization calculations.
- `backend/app/api/planner.py` — FastAPI REST endpoints: `GET /api/planner/status`, `POST /api/planner/run`, `POST /api/planner/pareto`, `POST /api/planner/sensitivity`, `GET /api/planner/report`. Registered in `backend/app/api/router.py`.

**Backend Multi-Objective Planner Test Suite (`backend/tests/test_planner.py`)**
- Comprehensive test suite covering Pydantic v2 schemas, metric normalization [0.0, 1.0], hard/soft constraint evaluator, Pareto dominance math, baseline and robust Pareto frontiers, sensitivity parameter sweeps, state mutation immutability safety (`assert world_before == world_after` & `assert risk_before == risk_after`), service E2E, and REST API endpoints (78/78 total backend pytest PASS).

**Frontend Planner Board UI (`frontend/src/`)**
- `frontend/src/types/planner.ts` — TypeScript interfaces matching backend planner models.
- `frontend/src/api/plannerApi.ts` — Async API client for fetching status, running optimization, calculating pareto frontiers, sensitivity analysis, and retrieving reports.
- `frontend/src/components/agents/PlannerBoard.tsx` — Glassmorphic UI board rendering Baseline vs Robust Pareto Frontiers, Feasibility Constraints, Robustness Profiles, Sensitivity Sweeps, and Objective Vector Trade-off profiles.
- Updated `SpecialistWarRoom.tsx` — Integrated `Multi-Objective Planner` sub-tab alongside `Specialists`, `Coordinator`, and `Adversary`, with "Run Multi-Objective Planner" action button. `npm run build` PASS.

**Documentation & ADRs**
- Added `docs/PLANNER_SPEC.md` and `docs/OPTIMIZATION_SPEC.md` specifications.
- Added `ADR-021: Multi-Objective Optimization & Robust Pareto Planning Engine` to `docs/DECISION_LOG.md`.
- Updated `docs/API_CATALOG.md` (Section 13), `docs/DEMO_STORYBOARD.md`, `docs/ARCHITECTURE.md`.

---

## [0.8.0] — 2026-09-19 — Phase 07: Adversary Agent & Stress Testing Framework

### Added

**Backend Adversary Engine & Red-Team System (`backend/app/engine/`, `schemas/`, `agents/`, `services/`, `api/`)**
- `backend/app/schemas/adversary.py` — Strongly-typed Pydantic v2 schemas: `AttackType` (12 controlled attack types), `AttackSeverity`, `ResilienceDimension` (8 explicit dimensions), `VulnerabilityType`, `AttackTarget`, `AttackAssumption`, `AdversaryAttack`, `StressScenario`, `DegradationMetric`, `ResilienceScore`, `Vulnerability`, `DefensiveRecommendation`, `PlanStressResult`, `AdversaryStatus`, `AdversaryReport`.
- `backend/app/engine/adversary.py` — `AdversaryEngine` featuring `AttackTargetingStrategy` (red-team targeting of exposed suppliers, ports, bottlenecks), seed-based reproducible `AttackGenerator` (`seed=42`), isolated snapshot `StressSimulator` (`WorldStateSnapshot.model_copy(deep=True)`), 8-dimension transparent `ResilienceScorer`, and structural `VulnerabilityDetector`.
- `backend/app/agents/adversary.py` — `AdversaryAgent` implementing `BaseAgent` interface with snapshot immutability safety boundary.
- `backend/app/services/adversary.py` — `AdversaryService` orchestrator managing red-team attack suites, candidate plan stress tests, and findings caching.
- `backend/app/api/adversary.py` — FastAPI REST endpoints: `GET /api/adversary/status`, `POST /api/adversary/run`, `POST /api/adversary/stress-test`, `POST /api/adversary/attack-suite`, `GET /api/adversary/findings`. Registered in `backend/app/api/router.py`.

**Backend Adversary Test Suite (`backend/tests/test_adversary.py`)**
- Comprehensive test suite covering Pydantic schemas, 12-type attack taxonomy, seed-based generator determinism (`attacks_run_1 == attacks_run_2`), red-team targeting strategy, snapshot isolation & state mutation safety (`assert world_before == world_after` & `assert risk_before == risk_after`), 8-dimension resilience scoring, vulnerability detection, end-to-end service execution, and REST API endpoints (70/70 total backend pytest PASS).

**Frontend Adversary Board UI (`frontend/src/`)**
- `frontend/src/types/adversary.ts` — TypeScript definitions matching backend adversary schemas.
- `frontend/src/api/adversaryApi.ts` — Async API client for adversary status, execution, attack suite generation, and findings retrieval.
- `frontend/src/components/agents/AdversaryBoard.tsx` — Glassmorphic UI board featuring executive summary metrics, Candidate Plan comparative resilience matrix (Plans A/B/C compared side-by-side across 8 dimensions, service degradation, cost spike, transit delay, recovery time, and assumption invalidations), Red-Team Vulnerabilities tab, Attack Suite preview tab, and Defensive Recommendations tab.
- Updated `SpecialistWarRoom.tsx` — Integrated `Adversary Red-Team` tab alongside `Specialist Proposals` and `Coordinator & Candidate Plans`, with "Run Adversary Red-Team" action button. `npm run build` PASS.

**Documentation & ADRs**
- Added `docs/ADVERSARY_SPEC.md` specification.
- Added `ADR-020: Adversary Red-Team Agent & Isolated Snapshot Stress Testing Engine` to `docs/DECISION_LOG.md`.

---

## [0.7.0] — 2026-09-19 — Phase 06: Coordinator Agent & Multi-Agent Proposal Reconciliation


### Added

**Backend Coordinator Reconciliation Engine (`backend/app/engine/`, `schemas/`, `agents/`, `services/`, `api/`)**
- `backend/app/schemas/coordinator.py` — Strongly-typed Pydantic v2 schemas: `ProposalNormalization`, `Agreement`, `Conflict`, `ConflictType`, `ObjectiveImpact`, `TradeOff`, `CandidatePlan`, `CandidatePlanStatus`, `CoordinatorResult`, `CoordinatorResultStatus`.
- `backend/app/engine/reconciliation.py` — 100% deterministic `ReconciliationEngine` comprising `ProposalNormalizer`, `AgreementDetector` (traceable proposal attribution), `ConflictDetector` (mutually exclusive route, resource contention, objective opposition), `TradeOffAnalyzer` (6-objective impact matrix & trade-off vectors), `CandidatePlanGenerator` (Candidate Plans A, B, C), and `ConstraintFilter` (entity integrity validation).
- `backend/app/agents/coordinator.py` — `CoordinatorAgent` implementing `BaseAgent` interface with snapshot immutability verification (`snap_id_before == snap_id_after` and `risk_snap_before == risk_snap_after`).
- `backend/app/services/coordinator.py` — `CoordinatorService` orchestrator supporting pre-computed proposals or automated end-to-end specialist collection with partial failure resilience (`PARTIAL_PROPOSALS`).
- `backend/app/api/coordinator.py` — FastAPI REST endpoints: `GET /api/coordinator/status`, `POST /api/coordinator/run`, `POST /api/coordinator/run-all`. Registered in `backend/app/api/router.py`.

**Backend Coordinator Test Suite (`backend/tests/test_coordinator.py`)**
- Comprehensive test suite covering Pydantic schemas, normalization deduplication, agreement detection, conflict detection, trade-off matrix scoring, candidate plan generation, entity constraint filtering, CoordinatorAgent safe_execute immutability, 100% determinism (`res1 == res2 == res3`), partial failure handling, and REST API endpoints (60/60 total backend PASS).

**Frontend Coordination Board UI (`frontend/src/`)**
- `frontend/src/types/coordinator.ts` — TypeScript interfaces matching backend coordinator schemas.
- `frontend/src/api/coordinatorApi.ts` — Async API client for coordinator status and execution endpoints.
- `frontend/src/components/agents/CoordinationBoard.tsx` — Glassmorphic UI featuring executive summary metrics, Agreements Panel, Conflict Panel (Agent A vs Agent B objective opposition), 6-Objective Trade-off Matrix Board, and Candidate Plan cards (`Candidate Plan A`, `Candidate Plan B`, `Candidate Plan C`) with action tables, cost/delay/emissions metrics, and trade-off comparison accordions.
- Updated `SpecialistWarRoom.tsx` & `App.tsx` — Integrated `Specialists` vs `Coordinator Board` sub-tabs, "Run Coordinator Reconciliation" trigger, and Candidate Plan 2D/3D map preview overlay banner (`UNEXECUTED CANDIDATE PLAN — WORLD STATE UNMUTATED`). `npm run build` PASS.

**Architecture Decisions**
- Added `ADR-019: Coordinator Agent & Multi-Agent Proposal Reconciliation Layer` to `docs/DECISION_LOG.md`.

---

## [0.6.0] — 2026-09-19 — Phase 05: Specialist Agent System & Safe Execution Pipeline

### Added

**Backend Specialist Agent System (`backend/app/agents/`, `schemas/`, `services/`, `api/`)**
- `backend/app/schemas/agent.py` — Strongly-typed Pydantic v2 schemas: `AgentId`, `AgentObjective`, `AgentResultStatus`, `AgentActionType`, `AgentAction`, `AgentProposal`, `AgentResult`, `AgentMetadata`, `AllSpecialistProposalsResponse`.
- `backend/app/agents/base.py` — `BaseAgent` abstract class with mandatory `safe_execute()` template method enforcing snapshot immutability checks (`snap_id_before == snap_id_after` and `risk_snap_before == risk_snap_after`) and entity validation (`validate_proposal_entities()`).
- `backend/app/agents/inventory.py` — `InventoryAgent` (`MINIMIZE_STOCKOUT_RISK`, actions `REORDER_STOCK`, `STOCK_TRANSFER`).
- `backend/app/agents/supplier.py` — `SupplierAgent` (`REDUCE_SUPPLIER_DISRUPTION`, actions `SUPPLIER_SWITCH`, `DUAL_SOURCE_ALLOCATION`).
- `backend/app/agents/transportation.py` — `TransportationAgent` (`REDUCE_DELAY_AND_COST`, actions `REROUTE_FLOW`, `MODE_SWITCH`).
- `backend/app/agents/fulfillment.py` — `FulfillmentAgent` (`PROTECT_SERVICE_LEVEL`, actions `ORDER_PRIORITY_CHANGE`, `FC_REALLOCATION`).
- `backend/app/agents/sustainability.py` — `SustainabilityAgent` (`REDUCE_EMISSIONS`, actions `EMISSIONS_ANNOTATION`).
- `backend/app/agents/resilience.py` — `ResilienceAgent` (`REDUCE_SYSTEMIC_FRAGILITY`, actions `DIVERSIFY_DEPENDENCY`).
- `backend/app/agents/registry.py` — `AgentRegistry` singleton managing registration and retrieval of all 6 specialist agents.
- `backend/app/services/agents.py` — `AgentService` orchestrator supporting single agent execution and parallel `run_all_specialists()` via `asyncio.gather()`.
- `backend/app/api/agents.py` — FastAPI REST endpoints: `GET /api/agents`, `GET /api/agents/{id}`, `POST /api/agents/{id}/run`, `POST /api/agents/run-all`. Registered in `backend/app/api/router.py`.

**Backend Specialist Agent Test Suite (`backend/tests/test_agents.py`)**
- Comprehensive test suite: immutability verification, entity validation (rejecting hallucinated node IDs), 6 individual specialist agents, registry, service orchestrator, and REST API endpoints (6/6 agent tests + API tests). Total backend test suite: **51/51 PASS**.

**Frontend Specialist War Room UI (`frontend/src/`)**
- `frontend/src/types/agent.ts` — TypeScript interfaces matching backend Pydantic agent models.
- `frontend/src/api/agentApi.ts` — Async API client for fetching agent metadata, running single agent, and running all 6 specialist agents.
- `frontend/src/components/agents/SpecialistWarRoom.tsx` — Glassmorphic side-drawer UI with "Run All 6 Specialist Agents" trigger, agent filter tabs, 6 brand-colored agent cards (Inventory `#4A90D9`, Supplier `#7BC67E`, Transportation `#E8A24A`, Fulfillment `#9B7FE8`, Sustainability `#52B788`, Resilience `#E8574A`), confidence meters, proposed action tables (cost, delay, parameters), evidence signal badges, and expandable reasoning trace accordions.
- Updated `Navbar.tsx` & `App.tsx` — Integrated "Specialist War Room" header button and Phase 05 title badge. `npm run build` PASS.

**Architecture Decisions**
- Added `ADR-018: Specialist Agent System & Non-Authoritative Proposal Architecture` to `docs/DECISION_LOG.md`.

---

## [0.5.0] — 2026-09-19 — Phase 04: AI Provider Abstraction & Safe Intelligence Layer

### Added

**Backend AI Provider Architecture (`backend/app/providers/`, `schemas/`, `services/`, `api/`)**
- `backend/app/schemas/ai.py` — Strongly-typed Pydantic v2 schemas: `TaskType`, `AIProviderType`, `AIProviderStatus`, `AIUsage`, `AIError`, `AIRequest`, `AIResponse`, `ProviderInfo`, `AIProvidersSummaryResponse`, `AIHealthResponse`.
- `backend/app/providers/base.py` — Abstract `AIProvider` base class (`generate`, `health`, `capabilities`).
- `backend/app/providers/mock.py` — `MockAIProvider` 100% offline, seed-reproducible provider adapter for scenario generation, specialist reasoning, coordinator reasoning, and adversarial analysis.
- `backend/app/providers/gemini.py` — `GeminiProvider` adapter for Google Gemini API (`gemini-1.5-flash`, `gemini-1.5-pro`) with isolated credentials & async JSON output parsing.
- `backend/app/providers/ollama.py` — `OllamaProvider` local adapter (`http://localhost:11434`) for offline open-source models with connection fallback.
- `backend/app/providers/bedrock.py` — `BedrockProvider` AWS Bedrock boundary adapter for Claude 3 / Titan models.
- `backend/app/providers/factory.py` — Singleton `ProviderFactory` managing provider registry and automatic fallback chain to `MockAIProvider`.
- `backend/app/services/ai.py` — `AIService` enforcing **AI Safety Control Boundary** ("LLMs propose; deterministic code decides"). Performs structured output JSON schema validation without mutating authoritative world or risk state.
- `backend/app/api/ai.py` — Typed FastAPI REST endpoints: `GET /api/ai/providers`, `GET /api/ai/health`, `POST /api/ai/generate`.

**Backend Automated AI Provider Test Suite (`backend/tests/`)**
- `test_ai_provider.py` — Provider contract, mock determinism, expected schema generation, health, capabilities, and factory fallback tests (5/5 PASS).
- `test_ai_service.py` — AI safety control boundary state preservation, schema validation failure handling, fallback chain, and health diagnostic tests (4/4 PASS).
- `test_ai_api.py` — REST API integration tests for provider list, health, and generation endpoints (3/3 PASS). Total test suite: 45/45 PASS.

**Frontend AI Status Integration (`frontend/src/`)**
- `frontend/src/types/ai.ts` — TypeScript interfaces matching backend AI schemas.
- `frontend/src/api/aiApi.ts` — API client for fetching AI providers, health, and executing AI reasoning.
- Updated `frontend/src/components/common/Navbar.tsx` & `App.tsx` — Integrated active AI Provider status pill (`AI: MOCK (ACTIVE)`) into global header. `npm run build` PASS.

**Architecture Decisions**
- Added `ADR-017: Vendor-Neutral AI Provider Abstraction & Safe Intelligence Boundary` to `docs/DECISION_LOG.md`.

---

## [0.4.0] — 2026-09-19 — Phase 03: Risk Engine Implementation & End-to-End Vertical Slice

### Added

**Backend Risk Intelligence Engine (`backend/app/engine/`, `schemas/`, `api/`)**
- `backend/app/schemas/signal.py` — Strongly-typed Pydantic v2 schemas for disruption signals: `Signal`, `SignalCreateRequest`, `FusedSignal`, `SignalType`, `SignalSeverity`, `SignalStatus`.
- `backend/app/schemas/risk.py` — Strongly-typed Pydantic v2 schemas for risk scoring: `RiskLevel`, `SignalContribution`, `RiskExplanation`, `NodeRiskDetail`, `RiskScoreMap`.
- `backend/app/engine/fusion.py` — `SignalFusionEngine` with 6-hour sliding window signal deduplication and compound confidence weighting (`1 - ∏(1 - c_i)`).
- `backend/app/engine/risk.py` — Deterministic `RiskEngine` containing `DirectImpactScorer` (`LOW=0.25`, `MEDIUM=0.50`, `HIGH=0.75`, `CRITICAL=0.95`), `CompoundComposer`, `GraphPropagator` (BFS propagation across `DEPENDENCY` edges, `MAX_HOPS=3`, `DECAY_FACTOR=0.6`), `DimensionalRiskComposer` (Financial, SLA, Operational, Sustainability breakdown), and `ExplanationBuilder`.
- `backend/app/repository/risk.py` — Thread-safe `RiskRepository` managing signal store and calculated risk maps (integrated with `WorldRepository` and `RLock()`).
- `backend/app/services/risk.py` — `RiskService` orchestrating signal ingestion, resolution, recalculation, and detail generation.
- `backend/app/api/signals.py` & `risks.py` — Typed FastAPI REST endpoints: `GET /api/signals`, `POST /api/signals`, `PATCH /api/signals/{id}/resolve`, `GET /api/risks`, `GET /api/risks/nodes/{id}`, `POST /api/risks/recalculate`, `POST /api/risks/reset`.

**Backend Automated Risk Test Suite (`backend/tests/`)**
- `test_fusion.py` — 6-hour sliding window deduplication, multi-cluster outside 6hr window, and max severity ordering tests (3/3 PASS).
- `test_risk_engine.py` — Severity mapping, compound score upper-bound clamping, risk level bands, BFS hop decay, explanation traceability, and 100% seed determinism tests (6/6 PASS).
- `test_risk_api.py` — REST API integration tests for signals, risk recalculation, node risk detail, and reset endpoints (4/4 PASS). Total backend test suite: 33/33 PASS.

**Frontend Risk State & Intelligence UI (`frontend/src/`)**
- `frontend/src/types/risk.ts` — TypeScript interfaces matching backend Risk and Signal Pydantic models.
- `frontend/src/api/riskApi.ts` — Fetch API client for signal and risk endpoints.
- `frontend/src/components/risk/SignalInjectorModal.tsx` — Modal component providing interactive weak signal creation with quick demo presets (Supplier S1 Halt, Port P1 Typhoon, Warehouse W1 Cyber).
- `frontend/src/components/risk/RiskExplorer.tsx` — Detailed risk inspector drawer displaying multi-dimensional risk index matrix, risk level bands, deterministic explanation text, active fused signals, and upstream/downstream propagation impact nodes.
- Updated `World2DView.tsx` & `World3DView.tsx` — Integrated real-time composite risk scores into 2D node borders, stock meters, 3D emissive colors, selected indicator rings, and disruption pulses.
- `frontend/src/App.tsx` — Wire up live Risk API state, automatic risk recalculation, Signal Injector modal, and Risk Explorer panel. `npm run build` PASS.

**Architecture Decisions**
- Added `ADR-016: Deterministic Risk Engine & BFS Graph Propagation Architecture` to `docs/DECISION_LOG.md`.

---

## [0.3.0] — 2026-09-19 — Phase 02: World Model + Synthetic Data + First Vertical Slice

### Added

**Backend World Model Architecture (`backend/app/`)**
- `backend/app/schemas/world.py` — Strict Pydantic v2 schemas: `Position3D`, `NodeRiskScores`, `WorldNode`, `WorldEdge`, `Product`, `InventoryRecord`, `Order`, `Shipment`, `Commitment`, `WorldStateSnapshot`, `WorldSummary`, `ApiResponse`.
- `backend/app/models/world.py` — `SupplyNetworkGraph` in-memory graph domain model with fast adjacency indices (`_outgoing_edges`, `_incoming_edges`, `_nodes_by_type`), snapshot serialization, and health/risk computation.
- `backend/app/generator/synthetic.py` — `SyntheticDataGenerator` seeded random network generator (5 suppliers, 3 ports, 3 warehouses, 2 FCs, 10 customer zones, 3 products, inventory, orders, commitments, route & dependency edges). Guarantees `seed=42 == seed=42` deterministic reproduction. Presets: `healthy`, `double_punch`.
- `backend/app/repository/world.py` — Thread-safe `WorldRepository` state store supporting atomic snapshots, seeding, resetting, and summary metric aggregation.
- `backend/app/services/world.py` — Business logic `WorldService` exposing graph operations and graph visualizer layout transforms.
- `backend/app/api/world.py` — Typed FastAPI REST endpoints: `GET /api/world`, `GET /api/world/summary`, `GET /api/world/graph`, `GET /api/world/nodes/{id}`, `GET /api/world/edges/{id}`, `POST /api/world/seed`, `POST /api/world/reset`.
- `backend/app/main.py` — FastAPI server with CORS middleware enabling frontend communication.

**Backend Automated Test Suite (`backend/tests/`)**
- `test_schemas.py` — Pydantic schema validation, clamping, range constraints, and serialization tests (5/5 PASS).
- `test_generator.py` — Deterministic seed reproduction, preset overlay, structural graph integrity tests (5/5 PASS).
- `test_repository.py` — Thread-safe state store, singleton, snapshot restore, summary metric tests (4/4 PASS).
- `test_api.py` — REST API integration tests using FastAPI `TestClient` (6/6 PASS).

**Frontend World Model Vertical Slice (`frontend/`)**
- Full Vite + React 18 + TypeScript application.
- `frontend/src/types/world.ts` — TypeScript interfaces matching backend Pydantic models.
- `frontend/src/api/worldApi.ts` — Fetch client connecting to REST endpoints with offline preview fallback.
- `frontend/src/components/common/Navbar.tsx` — Top Header with preset switcher, seed input controller, 2D/3D toggle, and live health pill.
- `frontend/src/components/world/WorldSummaryBar.tsx` — Network KPI bar displaying node counts by type, total inventory, utilization, disruptions, and health score.
- `frontend/src/components/world/World2DView.tsx` — Operational 2D 5-Tier layout displaying interactive nodes, risk borders, stock meters, and disruption indicators.
- `frontend/src/components/world/World3DView.tsx` — React Three Fiber + Three.js + Drei spatial scene renderer mapping real node 3D coordinates, custom geometries, floating HTML labels, and route lines.
- `frontend/src/components/world/NodeInspector.tsx` — Drawer panel exposing node details, multi-dimensional risk breakdown matrix (Financial, SLA, Operational, Sustainability), inventory meters, and connected routes.

**Architecture Decisions**
- Added `ADR-015: World Model Vertical Slice & Deterministic Graph Architecture` to `docs/DECISION_LOG.md`.

---

## [0.2.0] — 2026-09-18 — Phase 01: Complete Product Intelligence & Architecture Mapping

### Added

**Complete Product Intelligence Specifications (14 files)**
- `docs/PRODUCT_BIBLE.md` — 43-section master intelligence document detailing vision, domain model, agentic design, UI mapping, and complete system end-to-end flow.
- `docs/WORLD_MODEL_SPEC.md` — Complete graph entity specs, ER diagrams, Pydantic/SQLAlchemy models, state transitions, and 3D visual mapping.
- `docs/RISK_ENGINE_SPEC.md` — Deterministic risk propagation math, 6-hour signal fusion engine, multi-dimensional scoring matrix, and direct impact scoring formulas.
- `docs/SCENARIO_ENGINE_SPEC.md` — Compound scenario simulation pipeline, concurrent/cascading/amplifying relationship models, and propagation step tracking.
- `docs/AGENT_SYSTEM_SPEC.md` — Detailed contracts for all 8 specialist agents (Inventory, Supplier, Transportation, Fulfillment, Sustainability, Resilience, Coordinator, Adversary), orchestrator lifecycle, prompt engineering rules, and JSON output schemas.
- `docs/AI_ARCHITECTURE.md` — AI safety control boundary specs ("LLMs propose; deterministic code decides"), provider interface, fallback chain, and mock provider specs.
- `docs/API_CATALOG.md` — Complete catalog of all 32 REST endpoints with request/response envelopes, domain services, and frontend consumer mapping.
- `docs/WEBSOCKET_SPEC.md` — Complete catalog of real-time WebSocket events, payloads, triggers, and 3D visual reactions.
- `docs/FRONTEND_EXPERIENCE_BIBLE.md` — Detailed UI layout, interaction states, data requirements, components, and animations for all 12 frontend screens.
- `docs/3D_EXPERIENCE_BIBLE.md` — React Three Fiber scene graph specs, shaders, particle flow rules, camera state management, and performance strategy.
- `docs/VISUAL_DESIGN_BIBLE.md` — Design tokens, typography, HSL color palettes, cards, buttons, micro-animations, glassmorphism specs, and WCAG accessibility targets.
- `docs/GAMIFICATION_SPEC.md` — Operational Mission narrative design, milestone feedback, progress mechanics, and audience engagement rules.
- `docs/DEMO_STORYBOARD.md` — 12-minute segment-by-segment presenter script, exact API calls, 3D camera cues, Q&A prep, and fallback protocol.
- `docs/OPEN_QUESTIONS.md` — 14 unresolved architectural decisions categorized by domain with explicit options, recommendations, and decision deadlines.

**Architecture Decisions**
- Added ADR-009 through ADR-014 to `docs/DECISION_LOG.md` (Signal Fusion Engine, AI Control Safety Boundary, Multi-Dimensional Risk Standard, 3D Logical Topology Layout, WebSocket Fan-out Pattern, Phase 01 Intelligence Bible Standard).

---

## [0.1.0] — 2026-09-18 — Phase 00: Project Initialization

### Added

**Repository & Governance**
- Initialized Git repository
- Created complete directory structure (docs/, diagrams/, design/, tasks/, backend/, frontend/, data/, evaluation/, infrastructure/, LICENSES/)
- Created `.gitignore` (Python, Node, env, Docker, Terraform)
- Created `README.md` with project overview, architecture table, agent list, screen list, documentation index
- Created `AGENTS.md` with 14 operating rules for all AI agents

**Documentation (15 spec files)**
- `docs/MASTER_PLAN.md` — vision, 13-phase plan, success criteria, milestones
- `docs/ARCHITECTURE.md` — system architecture, data flow, tech decisions, failure modes, Mermaid diagrams
- `docs/PRODUCT_SPEC.md` — 4 personas, user stories, 12 screens, NFRs, acceptance criteria
- `docs/FRONTEND_SPEC.md` — React+TS+Vite+Tailwind+R3F stack, all 12 screen specs, routing, WebSocket schema, performance targets
- `docs/3D_SPEC.md` — scene composition, node/edge encoding, data-to-visual mapping, interaction model, animation specs, performance
- `docs/BACKEND_SPEC.md` — Python+FastAPI stack, complete module tree, AI provider abstraction, agent safety pipeline, WebSocket hub
- `docs/API_SPEC.md` — all REST endpoints with request/response schemas, WebSocket event catalog, error codes
- `docs/DATA_MODEL.md` — Pydantic v2 schemas, SQLAlchemy ORM models, TypeScript interfaces, ER diagram
- `docs/AGENT_SPEC.md` — 8 agent contracts (input/output/objective/constraints/tools/failure/UI), orchestration flow
- `docs/AWS_SPEC.md` — full AWS topology, VPC networking, ECS task definitions, ALB routing, CI/CD, cost estimate
- `docs/TESTING_SPEC.md` — backend unit/integration, frontend unit/E2E/a11y/visual regression, evaluation harness
- `docs/DEMO_SPEC.md` — 12-minute scripted demo, "The Double Punch" scenario, segment-by-segment actions
- `docs/DESIGN_SYSTEM.md` — color tokens, typography, spacing, shadows, components, animations, icons, layout
- `docs/SECURITY_SPEC.md` — threat model, secret management, AI safety constraints, audit logging, CORS, rate limits
- `docs/DECISION_LOG.md` — 8 architecture decision records (ADR-001 through ADR-008)
- `docs/DIAGRAMS.md` — diagram index with all 9 files
- `docs/HANDOFF.md` — complete handoff protocol for next AI session

**Diagrams (9 Mermaid files)**
- `diagrams/system-architecture.mmd`
- `diagrams/end-to-end-flow.mmd`
- `diagrams/data-flow.mmd`
- `diagrams/agent-flow.mmd`
- `diagrams/risk-propagation.mmd`
- `diagrams/adversarial-loop.mmd`
- `diagrams/frontend-architecture.mmd`
- `diagrams/aws-architecture.mmd`
- `diagrams/deployment-flow.mmd`

**Design (4 files)**
- `design/UX_FLOW.md` — all persona flows, navigation map, error recovery, empty states
- `design/UI_SCREEN_MAP.md` — ASCII layouts for all 12 screens, component reuse matrix
- `design/3D_INTERACTION_MAP.md` — all 3D interactions, state transitions, animation timeline
- `design/VISUAL_LANGUAGE.md` — visual philosophy, principles, 3D language, typography specimens

**Task Tracking**
- `tasks/TODO.md` — full backlog: 13 phases, ~100 tasks
- `tasks/IN_PROGRESS.md`
- `tasks/DONE.md` — all 44 Phase 00 tasks
- `tasks/CHANGELOG.md` (this file)

**Infrastructure Stubs**
- `Dockerfile` (multi-stage backend + frontend)
- `docker-compose.yml` (backend + frontend + postgres + redis)
- `backend/.gitkeep`, `frontend/.gitkeep`, `data/.gitkeep`, `evaluation/.gitkeep`, `infrastructure/.gitkeep`
- `LICENSES/THIRD_PARTY.md`

### Changed
- Nothing (initial release)

### Fixed
- Nothing (initial release)

---

*Next milestone: Phase 01 — World Model & Synthetic Data*
