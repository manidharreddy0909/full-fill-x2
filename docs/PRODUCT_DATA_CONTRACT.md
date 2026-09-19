# FULFILL-X — Product Data Contract & Source of Truth Map

## Overview

This contract establishes the **Single Source of Truth (SSOT)** for every primary entity in FULFILL-X, defining its owner service, persistence location, mutator, event notification, and frontend consumer.

---

## Single Source of Truth Matrix

| Entity | Single Source of Truth Owner | Primary Persistence Location | Mutator | Event Published | Frontend Consumer |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Users & Auth** | `SecurityService` | PostgreSQL `users` | `AuthRouter` | `USER_LOGGED_IN` | `IdentityGateway` / `useAuthStore` |
| **Organizations & Workspaces** | `SecurityService` | PostgreSQL `organizations`, `workspaces` | `GovernanceRouter` | `ORGANIZATION_UPDATED` | `Navbar` / `useAuthStore` |
| **World Nodes & Edges** | `WorldService` | PostgreSQL `world_nodes`, `world_edges` | `WorldService` / Seed | `STAGE_STARTED` | `World2DView` / `World3DView` |
| **Signals & Interruptions** | `SignalService` | In-Memory / DB | `SignalsRouter` | `SIGNAL_DETECTED` | `IntelligencePanel` |
| **Risk Scores & Maps** | `RiskEngine` | In-Memory Snapshot | `RiskEngine` | `RISK_UPDATED` | `CommandCenter` / `RiskExplorer` |
| **Specialist Proposals** | `AgentService` | Specialist Agents | `AgentService` | `SPECIALIST_COMPLETED` | `SpecialistWarRoom` |
| **Reconciled Plans** | `CoordinatorService` | In-Memory Candidate | `CoordinatorService` | `COORDINATOR_COMPLETED` | `SpecialistWarRoom` |
| **Pareto Execution Plans** | `PlannerService` | Pareto Frontier | `PlannerService` | `PLAN_GENERATED` | `DecisionCockpit` |
| **Verification Results** | `VerificationService` | Sandbox Log | `VerificationService` | `VERIFICATION_COMPLETED` | `DecisionCockpit` |
| **Policy Evaluations** | `PolicyEngine` | PostgreSQL `policy_evaluations` | `PolicyEngine` | `POLICY_EVALUATED` | `GovernanceCenter` |
| **Approved Decisions** | `CockpitService` | PostgreSQL `executive_decision_records` | `CockpitService` | `DECISION_APPROVED` | `DecisionCockpit` |
| **Execution Records** | `ExecutionSafetyPlane` | PostgreSQL `execution_records` | `MockExecutionProvider` | `EXECUTION_COMPLETED` | `GovernanceCenter` |
| **Digital Twin Snapshots** | `DigitalTwinService` | PostgreSQL `digital_twin_records` | `DigitalTwin` | `TWIN_CREATED` | `DigitalTwinWorkspace` |
| **Monte Carlo Trajectories**| `MonteCarloEngine` | PostgreSQL `monte_carlo_results` | `MonteCarloEngine` | `MONTE_CARLO_COMPLETED` | `DigitalTwinWorkspace` |
| **Agent Memories** | `AgentMemoryEngine` | PostgreSQL `agent_memories` | `AgentMemoryEngine` | `AGENT_MEMORY_CREATED` | `ResilienceAgentsWorkspace` |
| **Outcome Records** | `OutcomeEngine` | PostgreSQL `outcome_records` | `OutcomeEngine` | `OUTCOME_RECORDED` | `ResilienceAgentsWorkspace` |
| **Challenger Models** | `ContinuousLearningPipeline`| PostgreSQL `challenger_models` | `LearningPipeline` | `MODEL_CHALLENGER_CREATED` | `ResilienceAgentsWorkspace` |
| **Resilience Cycles** | `ResilienceOSService` | PostgreSQL `resilience_cycles` | `ResilienceOSService` | `RESILIENCE_CYCLE_COMPLETED`| `ResilienceOSWorkspace` |
| **System Degradation Mode** | `SystemDegradationManager`| Memory / Health State | `SystemDegradationManager` | `SYSTEM_DEGRADED` | `ResilienceOSWorkspace` / `Navbar` |
