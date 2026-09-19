# FULFILL-X — Product Component Registry

## Overview

This registry lists every primary backend service, database ORM model, REST API module, agent component, and frontend view in FULFILL-X, classifying their operational state: `LIVE`, `WORKING`, `MOCK`, `SIMULATION`, `SYNTHETIC`, `REPLAY`, `STATIC`, `UNUSED`, `BROKEN`, or `UNVERIFIED`.

---

## 1. Backend Core Services

| Component | Location | Purpose | Dependencies | State | Verification Basis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WorldService** | `backend/app/services/world.py` | Authoritative supply chain network state manager | `WorldRepository`, `WorldStateSnapshot` | `LIVE` | 100% test pass, Postgres ORM sync |
| **RiskEngine** | `backend/app/services/risk.py` | Deterministic node risk calculation & graph propagation | `WorldService`, `SignalService` | `LIVE` | 100% test pass, deterministic mathematical clamping |
| **AIService** | `backend/app/services/ai.py` | Multi-provider AI reasoning & schema enforcement | `MockProvider`, `OllamaProvider`, `OpenAIProvider` | `WORKING` | Local mock/Ollama verified; Bedrock `UNVERIFIED` |
| **AgentService** | `backend/app/services/agents.py` | Specialist agent registry & reasoning orchestrator | `AgentRegistry`, `AIService` | `LIVE` | 8 specialist agents verified |
| **CoordinatorService** | `backend/app/services/coordinator.py` | Reconciles specialist proposals into candidate execution plans | `SpecialistAgents`, `AdversaryAgent` | `LIVE` | 100% determinism pass across 3 runs |
| **PlannerService** | `backend/app/services/planner.py` | Multi-objective Pareto optimization plan generator | `RiskEngine`, `WorldService` | `LIVE` | Pareto frontier calculation verified |
| **VerificationService** | `backend/app/services/verification.py` | Rule-based & simulation sandbox plan verification | `VerificationAgent`, `DigitalTwin` | `LIVE` | Scenario A/B/C verification test pass |
| **CockpitService** | `backend/app/services/cockpit.py` | Human-in-the-loop decision approval & audit logging | `PostgresDB`, `EventBus` | `LIVE` | Stale approval rejection & audit log pass |
| **EvaluationService** | `backend/app/services/evaluation.py` | Benchmark evaluation harness & scenario execution | `WorldService`, `RiskEngine` | `LIVE` | Benchmark metric calculation pass |
| **DataPlatformService** | `backend/app/services/data.py` | Connector lifecycle, data quality, entity resolution | `DataQualityEngine`, `DataAdapters` | `WORKING` | Weather/Earthquake/RSS verified live/synthetic |
| **ObservabilityService** | `backend/app/services/observability.py` | System metrics, tracing, dead-letter event queue | `EventBus`, `PrometheusRegistry` | `LIVE` | `/metrics` endpoint & telemetry test pass |
| **PredictionService** | `backend/app/services/ml.py` | ML model inference, feature store, PSI drift detection | `DemandModel`, `DisruptionModel` | `LIVE` | PyTorch/Scikit-learn CPU inference pass |
| **GraphService** | `backend/app/graph/service.py` | GNN propagation, NetworkX topology, causal SCM | `PyGModel`, `NetworkX`, `SCM` | `LIVE` | GNN inference & counterfactual test pass |
| **DigitalTwinService** | `backend/app/simulation/service.py` | Discrete-time simulation & Monte Carlo engine | `DigitalTwin`, `MonteCarloEngine` | `LIVE` | Isolated state snapshots, 100% determinism |
| **MultiAgentResilienceService** | `backend/app/agents/resilience/service.py` | Bounded debate, memory decay, continuous learning | `BoundedDebateEngine`, `AgentMemoryEngine` | `LIVE` | Phase 9 test suite pass (11/11 tests) |
| **ResilienceOSService** | `backend/app/services/resilience_os.py` | 15-stage canonical cycle orchestrator & Scorecard | `PolicyEngine`, `ExecutionProvider` | `LIVE` | Phase 10 test suite pass (13/13 tests) |
| **PolicyEngine** | `backend/app/governance/policy_engine.py` | Server-side deterministic policy evaluation | `PolicyDefinitions` | `LIVE` | Rule evaluation (PASS/WARN/BLOCK) pass |
| **ExecutionSafetyPlane** | `backend/app/execution/safety.py` | Safe-by-design execution provider interface | `MockExecutionProvider` | `LIVE` | DRY_RUN protection test pass |
| **SystemDegradationManager**| `backend/app/core/degradation.py` | Operational status modes & chaos fault injection | `SystemOperationalMode` | `LIVE` | Mode toggles & fault clear pass |

---

## 2. Database ORM Models (`backend/app/models/`)

| Model | Table | Purpose | Tenant Scope | State |
| :--- | :--- | :--- | :--- | :--- |
| `WorldNodeModel` | `world_nodes` | Supply chain network node persistence | `organization_id` | `LIVE` |
| `WorldEdgeModel` | `world_edges` | Transport/dependency edge persistence | `organization_id` | `LIVE` |
| `UserModel` | `users` | User identity & authentication records | Global | `LIVE` |
| `OrganizationModel` | `organizations` | Tenant organization accounts | `organization_id` | `LIVE` |
| `MembershipModel` | `memberships` | User role mapping | `organization_id` | `LIVE` |
| `DigitalTwinRecordModel` | `digital_twin_records` | Digital Twin snapshot metadata | `organization_id` | `LIVE` |
| `SimulationRunRecordModel` | `simulation_run_records` | Simulation trajectory logs | `organization_id` | `LIVE` |
| `MonteCarloResultRecordModel` | `monte_carlo_results` | Monte Carlo iteration summaries | `organization_id` | `LIVE` |
| `AgentMemoryModel` | `agent_memories` | Structured agent operational memories | `organization_id` | `LIVE` |
| `OutcomeRecordModel` | `outcome_records` | Expected vs actual decision outcomes | `organization_id` | `LIVE` |
| `FeedbackRecordModel` | `feedback_records` | Decision alignment feedback records | `organization_id` | `LIVE` |
| `LearningDatasetModel` | `learning_datasets` | Versioned training dataset records | `organization_id` | `LIVE` |
| `ChallengerModelRecordModel` | `challenger_models` | Challenger candidate model metadata | `organization_id` | `LIVE` |
| `Workspace` | `workspaces` | Enterprise workspace hierarchy | `organization_id`, `workspace_id` | `LIVE` |
| `WorkspaceMembership` | `workspace_memberships` | Enterprise workspace user roles | `workspace_id` | `LIVE` |
| `PolicyDefinition` | `policy_definitions` | Server-side policy rule definitions | `organization_id`, `workspace_id` | `LIVE` |
| `PolicyEvaluationModel` | `policy_evaluations` | Historical policy check results | `organization_id`, `workspace_id` | `LIVE` |
| `ExecutionRecordModel` | `execution_records` | Plan execution audit records | `organization_id`, `workspace_id` | `LIVE` |
| `ResilienceCycleModel` | `resilience_cycles` | Resilience OS operational cycle logs | `organization_id`, `workspace_id` | `LIVE` |
| `ExecutiveDecisionRecordModel`| `executive_decision_records` | Immutable executive decision records | `organization_id`, `workspace_id` | `LIVE` |

---

## 3. Frontend Workspaces (`frontend/src/components/`)

| Workspace Component | File | Purpose | Primary Data Connection | State |
| :--- | :--- | :--- | :--- | :--- |
| **CommandCenter** | `command/CommandCenter.tsx` | Executive Command Center overview | `fetchWorldSummary`, `fetchRiskMap` | `WORKING` |
| **World2DView / World3DView** | `world/World2DView.tsx`, `World3DView.tsx` | Visual supply chain twin visualizer | `WorldStateSnapshot` | `WORKING` |
| **IntelligencePanel** | `intelligence/IntelligencePanel.tsx` | Risk & Signal intelligence feed | `fetchSignals`, `fetchRiskMap` | `WORKING` |
| **SpecialistWarRoom** | `agents/SpecialistWarRoom.tsx` | Specialist proposal & deliberation viewer | `fetchSpecialistProposals` | `WORKING` |
| **DecisionCockpit** | `cockpit/DecisionCockpit.tsx` | Human approval decision cockpit | `fetchPendingDecisions` | `WORKING` |
| **EvaluationDashboard** | `evaluation/EvaluationDashboard.tsx` | Benchmark evaluation runner | `runEvaluation` | `WORKING` |
| **DemoMode** | `demo/DemoMode.tsx` | Interactive 7-stage script demo | `DemoService` | `WORKING` |
| **DataFabric** | `data/DataFabric.tsx` | Integration connectors & quality dashboard | `fetchDataSources` | `WORKING` |
| **SecurityConsole** | `security/SecurityConsole.tsx` | RBAC & audit log manager | `fetchAuditLogs` | `WORKING` |
| **ObservabilityCenter** | `observability/ObservabilityCenter.tsx` | Telemetry & event stream dashboard | `fetchObservabilityMetrics` | `WORKING` |
| **PredictiveIntelligence** | `ml/PredictiveIntelligence.tsx` | ML demand & disruption forecasting | `fetchMLModels`, `predict` | `WORKING` |
| **GraphIntelligence** | `graph/GraphIntelligence.tsx` | GNN risk propagation & causal SCM | `fetchGraphSnapshot` | `WORKING` |
| **DigitalTwinWorkspace** | `simulation/DigitalTwinWorkspace.tsx` | Monte Carlo twin simulator | `runSimulation` | `WORKING` |
| **ResilienceAgentsWorkspace**| `learning/ResilienceAgentsWorkspace.tsx` | Agent debate, memory, learning console | `triggerDeliberation`, `trainChallenger` | `WORKING` |
| **ResilienceOSWorkspace** | `resilience/ResilienceOSWorkspace.tsx` | Resilience OS Control Loop & Scorecard | `executeResilienceCycle` | `WORKING` |
| **GovernanceCenter** | `governance/GovernanceCenter.tsx` | Policy Engine & Chaos fault injection | `evaluatePolicy`, `injectChaosFault` | `WORKING` |
