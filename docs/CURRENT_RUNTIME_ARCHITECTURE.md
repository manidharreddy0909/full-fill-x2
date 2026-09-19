# FULFILL-X — Current Runtime Architecture

## Overview

This document presents the **actual current runtime architecture** of FULFILL-X, derived directly from inspecting source code in `backend/app/`, `frontend/src/`, and `backend/tests/`.

---

## 1. End-to-End Application Flow Architecture

```mermaid
flowchart TD
    User([User / Operator]) -->|React UI / Vite| Frontend[Frontend React OS]
    Frontend -->|HTTP REST / JSON| APIRouter[FastAPI Router /api/*]
    Frontend <-->|WebSocket JSON Envelopes| WSManager[WebSocketManager]
    
    APIRouter -->|SecurityContext & RBAC| AuthDep[get_security_context]
    AuthDep -->|Pass| OSControlPlane[ResilienceOSService]
    
    OSControlPlane -->|Observation| WorldSvc[WorldService]
    OSControlPlane -->|Prediction| MLService[PredictionService / GraphService]
    OSControlPlane -->|Simulation| TwinService[DigitalTwin & MonteCarloEngine]
    OSControlPlane -->|Agent Debate| AgentSvc[MultiAgentResilienceService]
    OSControlPlane -->|Verification| VerifSvc[VerificationService]
    OSControlPlane -->|Policy Evaluation| PolicyEng[PolicyEngine]
    OSControlPlane -->|Dry-Run Execution| ExecSafety[ExecutionSafetyPlane]
    OSControlPlane -->|Measure & Learn| LearnPipeline[ContinuousLearningPipeline]
    
    WorldSvc -->|SQLAlchemy ORM| Postgres[(PostgreSQL / In-Memory Repo)]
    EventBus[EventBus / Redis Streams] <-->|Publish Events| WSManager
```

---

## 2. Realtime Event & WebSockets Architecture

```mermaid
flowchart LR
    Producer[Backend Services / ResilienceOS] -->|Publish EventEnvelope| EventBus[EventBus]
    EventBus -->|In-Memory / Redis Streams| EventTransport[EventTransport]
    EventTransport -->|Session / Tenant Filter| WSManager[WebSocketManager]
    WSManager -->|WS Broadcast| ClientWS[Browser WebSocket Client]
    
    ClientWS -->|ClientWsMessage PING/SUBSCRIBE| WSManager
    WSManager -->|Heartbeat PONG| ClientWS
```

---

## 3. Intelligence & Predictive AI/ML Architecture

```mermaid
flowchart TD
    DataAdapters[Weather / Earthquake / RSS Adapters] -->|Raw Signals| DataQuality[DataQualityEngine]
    DataQuality -->|Clean Signals| SignalSvc[SignalService]
    SignalSvc -->|Compound Risk| RiskEngine[RiskEngine]
    
    RiskEngine -->|Node Feature Matrix| FeatureStore[FeatureStore]
    FeatureStore -->|Features| MLInference[PredictionService / PyTorch]
    MLInference -->|Demand & Disruption Forecasts| GNNEngine[PyTorch Geometric GNN]
    GNNEngine -->|Risk Propagation Graph| SCM[Structural Causal Model / SCM]
    SCM -->|Counterfactual Trajectories| CounterfactualEngine[CounterfactualEngine]
```

---

## 4. Simulation & Monte Carlo Twin Architecture

```mermaid
flowchart TD
    WorldSnapshot[WorldStateSnapshot (Production)] -->|Deep Copy / Isolated Snapshot| TwinInstance[DigitalTwin (SIMULATION Mode)]
    TwinInstance -->|Discrete-Time Step (1h Resolution)| DynamicsEngine[DigitalTwinDynamics]
    
    DynamicsEngine -->|Compound Disturbances| ScenarioGen[ScenarioGenerator]
    ScenarioGen -->|Thread/Process Pool (100-5000 runs)| MonteCarloEngine[MonteCarloEngine]
    
    MonteCarloEngine -->|Percentile Metrics (P10, P50, P90)| ResilienceCalc[ResilienceMetricsCalculator]
    ResilienceCalc -->|Resilience Curve & VaR/CVaR| StrategyAnalyzer[RobustStrategyAnalyzer]
```

---

## 5. Multi-Agent Deliberation & Continuous Learning Architecture

```mermaid
flowchart TD
    SpecialistProposals[Inventory, Supplier, Transport, Fulfillment] -->|Proposals| DelibOrchestrator[DeliberationOrchestrator]
    DelibOrchestrator -->|Bounded Debate (Max 3 Rounds)| BoundedDebate[BoundedDebateEngine]
    
    BoundedDebate <-->|Adversary Challenge| AdversaryAgent[AdversaryAgent]
    BoundedDebate <-->|Constraint Validation| VerificationAgent[VerificationAgent]
    
    BoundedDebate -->|DecisionEvidenceBundle| MemoryEngine[AgentMemoryEngine]
    
    ExecutedDecision[Executed Plan Outcome] -->|Actual vs Expected| OutcomeEngine[OutcomeEngine]
    OutcomeEngine -->|Deviations| FeedbackEngine[FeedbackEngine]
    FeedbackEngine -->|Feedback Records| LearnPipeline[ContinuousLearningPipeline]
    
    LearnPipeline -->|Retrain Candidate Model| ChallengerRecord[ChallengerModelRecord]
    ChallengerRecord -->|Human Gate Approval (activate_challenger)| ActiveModel[Active Model Promotion]
    ActiveModel -->|One-Click Safety Rollback| PreviousModel[Rollback Model]
```

---

## 6. Enterprise Governance & Execution Safety Architecture

```mermaid
flowchart TD
    CandidatePlan[Candidate Execution Plan] -->|Policy Check| PolicyEng[PolicyEngine]
    PolicyEng -->|Evaluate max_cost, min_sla, min_resilience| PolicyResult{Policy Evaluation}
    
    PolicyResult -->|PASS / WARN| HumanGate[Human Operator Signature Gate]
    PolicyResult -->|BLOCK| BlockedExecution[Execution Blocked & Logged]
    
    HumanGate -->|Operator Signature Provided| ExecSafety[ExecutionSafetyPlane]
    ExecSafety -->|Enforce DRY_RUN Mode| MockProvider[MockExecutionProvider]
    MockProvider -->|Safe Dry-Run Executed| AuditRecord[ExecutiveDecisionRecord]
```
