# FULFILL-X — Agent System Specification

## 1. Purpose

Define the complete agent system architecture: base contracts, orchestration,
individual agent specifications, and inter-agent coordination protocol.

This document is the authoritative reference for all agent implementation.

---

## 2. Agent System Architecture

```
AgentOrchestrator
├── dispatch(scenario, world, risks) → asyncio.gather()
│   ├── InventoryAgent.execute()
│   ├── SupplierAgent.execute()
│   ├── TransportationAgent.execute()
│   ├── FulfillmentAgent.execute()
│   ├── SustainabilityAgent.execute()
│   └── ResilienceAgent.execute()
│
├── collect(proposals[])
│   └── CoordinatorAgent.execute(proposals[])
│       └── reconcile + rank → RankedPlan[]
│
└── for each plan:
    AdversaryAgent.execute(plan)
    └── attack + rate → AdversaryFinding[]

merge adversary findings → final RankedPlan[]
broadcast plan.ranked
```

---

## 3. Base Agent Contract

```python
from abc import ABC, abstractmethod
from app.schemas.agents import AgentInput, AgentOutput, AgentResult
from app.ai.provider import AIProvider

class BaseAgent(ABC):
    id: AgentId
    name: str
    description: str
    objective: str
    system_prompt: str          # static, defined in code — never user-supplied
    input_schema: type[BaseModel]
    output_schema: type[BaseModel]
    allowed_action_types: list[str]   # whitelist for constraint engine
    constraints: ConstraintSet
    timeout_seconds: float = 30.0
    ai_provider: AIProvider

    @abstractmethod
    async def execute(self, input: AgentInput) -> AgentResult:
        """Full safe pipeline: prompt → validate → constrain → simulate → result."""

    @abstractmethod
    def build_prompt(self, input: AgentInput, world: WorldStateSnapshot) -> str:
        """Construct the user-facing prompt from typed inputs."""

    def validate_output(self, raw: dict) -> AgentOutput:
        """Parse and validate AI output against output_schema."""
        return self.output_schema.model_validate(raw)

    async def safe_execute(self, input: AgentInput) -> AgentResult:
        """Template method: AI → validate → constrain → simulate → result."""
        try:
            async with asyncio.timeout(self.timeout_seconds):
                raw = await self.ai_provider.generate(
                    system_prompt=self.system_prompt,
                    user_prompt=self.build_prompt(input, input.world_state),
                    output_schema=self.output_schema,
                )
                output = self.validate_output(raw)
                constraint_result = self.constraints.check(output.actions)
                if not constraint_result.feasible:
                    return AgentResult(
                        status=AgentResultStatus.INFEASIBLE,
                        agent_id=self.id,
                        violations=constraint_result.violations,
                    )
                sim_result = await simulation_engine.simulate(output.actions, input.world_state)
                if not sim_result.valid:
                    return AgentResult(status=AgentResultStatus.SIMULATION_REJECTED, ...)
                return AgentResult(status=AgentResultStatus.PROPOSED, proposal=output, sim_result=sim_result)
        except asyncio.TimeoutError:
            return AgentResult(status=AgentResultStatus.TIMEOUT, agent_id=self.id)
```

---

## 4. AgentResult Status Values

| Status | Description |
|--------|-------------|
| `PROPOSED` | Valid proposal produced |
| `INFEASIBLE` | Failed constraint check |
| `SIMULATION_REJECTED` | Failed simulation |
| `TIMEOUT` | Exceeded timeout_seconds |
| `AI_ERROR` | AI provider returned invalid output |
| `PARTIAL` | Partial results only (Adversary) |

---

## 5. AI Safety Enforcement

**CRITICAL**: The AI provider is called ONCE per agent execution.
The LLM output is IMMEDIATELY validated against the typed Pydantic schema.
Any output that fails validation is REJECTED — not retried with relaxed constraints.

LLMs never:
- Write to any database
- Access the simulation engine directly
- Modify world state
- Call other agents

---

## 6. Individual Agent Specifications

---

### 6.1 Inventory Agent

**ID**: `inventory`
**Color**: `#4A90D9` (blue)
**Objective**: Minimize stockout risk across all nodes
**Timeout**: 30s

#### Input
```python
class InventoryAgentInput(AgentInput):
    # plus inherited: scenario, world_state, risk_scores, constraints
    inventory_records: list[InventoryRecord]
    demand_forecasts: dict[str, float]  # customer_zone_id → units/day
    safety_stock_thresholds: dict[str, float]  # node_id → min ratio
    disrupted_supplier_ids: list[str]
```

#### Output Schema
```python
class InventoryAgentOutput(AgentOutput):
    reorder_actions: list[ReorderAction]
    transfer_actions: list[StockTransferAction]
    buffer_recommendations: list[BufferRecommendation]

class ReorderAction(BaseModel):
    node_id: str
    product_id: str
    quantity: float
    urgency: str  # IMMEDIATE | HIGH | STANDARD
    from_supplier_id: str
    estimated_cost: float
    estimated_lead_time_hours: float

class StockTransferAction(BaseModel):
    from_node_id: str
    to_node_id: str
    product_id: str
    quantity: float
    estimated_cost: float
    estimated_time_hours: float
```

#### Constraints
```python
InventoryConstraints(
    max_transfer_cost_per_unit=50.0,
    max_reorder_lead_time_hours=168.0,  # 7 days
    cannot_exceed_capacity=True,
    cannot_transfer_more_than_available=True,
    min_safety_stock_ratio=0.1,
)
```

#### Tools (for prompt context)
- `get_stockout_probability(node_id, product_id, horizon_hours)` → float
- `get_demand_forecast(customer_zone_id, horizon_hours)` → float
- `get_transfer_cost(from_node, to_node, quantity)` → float

#### Failure Mode
- AI timeout: generate deterministic reorder for all nodes below safety stock
- All proposals infeasible: flag for human review; return minimum-damage recommendation

#### UI Representation
Card shows: reorder count, highest stockout risk node, total cost estimate.
Detail shows: reorder table (node, product, quantity, urgency, cost).

#### 3D Representation
- Reorder actions: pulsing ring on source node (color: agent blue)
- Transfer actions: animated particle beam between nodes (blue particles)

#### Tests
```python
def test_inventory_agent_returns_valid_proposal(mock_provider)
def test_reorder_actions_respect_capacity_constraint(mock_provider)
def test_transfer_cannot_exceed_available_stock(mock_provider)
def test_timeout_returns_fallback_reorder(mock_provider)
```

---

### 6.2 Supplier Agent

**ID**: `supplier`
**Color**: `#7BC67E` (green)
**Objective**: Reduce supplier disruption impact
**Timeout**: 30s

#### Input
Inherits `AgentInput` plus:
- `supplier_alternatives: dict[str, list[SupplierAlternative]]`
- `supplier_risk_scores: dict[str, float]`

#### Output Schema
```python
class SupplierAgentOutput(AgentOutput):
    switch_recommendations: list[SupplierSwitch]
    dual_source_proposals: list[DualSourceProposal]
    escalation_flags: list[SupplierEscalation]

class SupplierSwitch(BaseModel):
    from_supplier_id: str
    to_supplier_id: str
    reason: str
    switch_cost: float
    lead_time_delta_hours: float
    risk_reduction_estimate: float
```

#### Constraints
```python
SupplierConstraints(
    alternative_must_be_qualified=True,
    max_lead_time_increase_hours=48.0,
    max_switch_cost=100000.0,
    min_qualification_score=0.7,
)
```

#### Failure Mode
No qualified alternatives: escalation flag for human review.

---

### 6.3 Transportation Agent

**ID**: `transportation`
**Color**: `#E8A24A` (amber)
**Objective**: Minimize fulfillment delay and cost across all routes
**Timeout**: 30s

#### Output Schema
```python
class TransportationAgentOutput(AgentOutput):
    reroute_actions: list[RerouteAction]
    mode_switches: list[ModeSwitchAction]
    capacity_reservations: list[CapacityReservation]

class RerouteAction(BaseModel):
    original_route_id: str
    alternative_route_id: str
    affected_shipment_ids: list[str]
    delay_reduction_hours: float
    cost_delta: float
    emissions_delta: float

class ModeSwitchAction(BaseModel):
    route_id: str
    from_mode: str  # SEA | ROAD | RAIL
    to_mode: str    # AIR (usually upgrade for urgency)
    affected_shipment_ids: list[str]
    cost_delta: float  # typically much higher
    time_reduction_hours: float
    emissions_delta: float  # typically much higher
```

#### Constraints
```python
TransportationConstraints(
    alternative_route_must_exist=True,
    max_mode_switch_cost_multiplier=5.0,
    min_lead_time_improvement_hours=4.0,
)
```

#### Failure Mode
No alternative routes: recommend emergency air freight + flag cost/emissions.

#### 3D Representation
- Rerouted routes: new tube geometry grows from source to destination (600ms)
- Mode switch: icon changes on route (truck → plane)

---

### 6.4 Fulfillment Agent

**ID**: `fulfillment`
**Color**: `#9B7FE8` (purple)
**Objective**: Protect service-level agreements
**Timeout**: 30s

#### Output Schema
```python
class FulfillmentAgentOutput(AgentOutput):
    order_priority_adjustments: list[OrderPriorityChange]
    fc_allocations: list[FCAllocationChange]
    sla_exception_notifications: list[SLAExceptionNotification]

class SLAExceptionNotification(BaseModel):
    customer_zone_id: str
    affected_order_ids: list[str]
    new_estimated_delivery: datetime
    reason: str  # factual, conservative
    penalty_estimate: float
```

#### Constraints
```python
FulfillmentConstraints(
    cannot_exceed_fc_capacity=True,
    priority_customers_must_maintain_sla=True,
    exception_notification_must_be_factual=True,
)
```

---

### 6.5 Sustainability Agent

**ID**: `sustainability`
**Color**: `#52B788` (forest green)
**Objective**: Minimize emissions increase from recovery actions
**Timeout**: 30s

#### Input
Inherits `AgentInput` plus:
- `proposed_actions_from_other_agents: list[ProposalAction]`
- `esq_threshold: float` — max allowable emissions delta %

#### Output Schema
```python
class SustainabilityAgentOutput(AgentOutput):
    emission_deltas: dict[str, float]  # action_id → delta kg CO2e
    lower_emission_alternatives: list[EmissionsAlternative]
    esq_compliance: ESGComplianceResult

class ESGComplianceResult(BaseModel):
    is_compliant: bool
    total_emissions_delta_kg: float
    threshold_kg: float
    breaching_actions: list[str]
```

#### Special Behavior
The Sustainability Agent is the **only agent** that reads and comments on
proposals from OTHER agents. It does not generate primary actions itself;
it annotates and proposes lower-emission alternatives for existing proposals.

**DECISION REQUIRED (ADR-014)**: Should Sustainability Agent have veto power
over proposals that breach ESG threshold, or only advisory power?

---

### 6.6 Resilience Agent

**ID**: `resilience`
**Color**: `#E8574A` (red-orange)
**Objective**: Reduce systemic fragility and single points of failure
**Timeout**: 30s

#### Output Schema
```python
class ResilienceAgentOutput(AgentOutput):
    spof_identifications: list[SinglePointOfFailure]
    diversification_proposals: list[DiversificationProposal]
    resilience_score_delta: float  # estimated improvement

class SinglePointOfFailure(BaseModel):
    node_id: str
    criticality: float
    description: str
    dependent_node_count: int
    alternative_availability: bool
```

#### Tools
- `analyze_spof(graph)` → list[SPOF]
- `compute_resilience_score(graph)` → float

---

### 6.7 Coordinator Agent

**ID**: `coordinator`
**Color**: `#A8B5C5` (neutral)
**Objective**: Reconcile proposals from all specialist agents into ranked plans
**Timeout**: 45s (longer — more complex synthesis)

#### Input
```python
class CoordinatorInput(BaseModel):
    specialist_proposals: list[AgentProposal]  # from 6 specialist agents
    world_state: WorldStateSnapshot
    risk_scores: RiskScoreMap
    objective_weights: dict[str, float]  # {cost, sla, emissions, fragility}
    constraints: ConstraintSet
```

#### Process
1. Detect conflicting actions across proposals
2. Resolve conflicts (conservative: prefer less-disruptive action)
3. Bundle compatible proposal subsets into plan candidates
4. Score each candidate bundle across 4 objectives
5. Rank by composite score
6. Return up to 5 ranked plans

#### Output Schema
```python
class CoordinatorOutput(BaseModel):
    ranked_plans: list[RankedPlanCandidate]
    conflict_resolutions: list[ConflictResolution]
    trade_off_summary: str

class ConflictResolution(BaseModel):
    conflict_type: str
    agent_a_id: AgentId
    agent_b_id: AgentId
    resolution: str
    preferred_action_id: str
```

#### Conflict Detection
```python
CONFLICT_TYPES = [
    "SAME_ROUTE_USED_TWICE",     # Transportation + Resilience both route via same bottleneck
    "CAPACITY_DOUBLE_BOOK",      # Two agents both allocate same FC capacity
    "SUPPLIER_SWITCH_CONFLICT",  # Inventory orders from supplier Supplier Agent is switching away from
    "SLA_NOTIFICATION_PREMATURE", # Fulfillment issues exception before Coordinator confirms infeasibility
]
```

#### Scoring Formula
```python
composite_score = (
    weights["sla_preservation"] * sla_score +
    weights["cost_delta"] * (1.0 - normalized_cost_increase) +
    weights["emissions_delta"] * (1.0 - normalized_emissions_increase) +
    weights["fragility_delta"] * (1.0 - normalized_fragility)
)

# After adversary rating is available:
final_score = composite_score * 0.8 + adversary_rating * 0.2
```

**DECISION REQUIRED (ADR-011)**: Validate this final scoring formula.

---

### 6.8 Adversary Agent

**ID**: `adversary`
**Color**: `#E85D4A` (red)
**Objective**: Stress-test plans by identifying failure vectors
**Timeout**: 30s per plan
**Max findings**: 5 per plan

#### Input
```python
class AdversaryInput(BaseModel):
    plan: RankedPlanCandidate
    world_state: WorldStateSnapshot
    disruption_library: list[DisruptionTemplate]
```

#### Process
1. AI selects most plausible attack vectors from disruption library
2. For each attack vector: `simulate_disruption(plan, disruption)`
3. Record `SimulationResult` as evidence
4. Rate plan robustness based on findings

#### Output Schema
```python
class AdversaryOutput(BaseModel):
    findings: list[AdversaryFinding]  # max 5
    adversary_rating: float  # 0.0 = fragile, 1.0 = robust
    worst_case_scenario: str  # brief description

class AdversaryFinding(BaseModel):
    attack_vector: str
    failure_mode: str
    severity: SignalSeverity
    probability: float  # estimated probability of this attack succeeding
    sim_evidence: SimulationResult  # what the simulation showed
    mitigation_hint: str | None  # advisory only
```

#### Critical Constraint
**The Adversary NEVER proposes alternative plans.**
It only finds weaknesses and rates robustness.

#### Chain of Thought
The AI's internal reasoning is NEVER exposed.
Only the `findings` and `adversary_rating` are returned to the frontend.

---

## 7. Orchestrator Execution Flow

```python
class AgentOrchestrator:
    async def run_pipeline(
        self,
        scenario: ScenarioObject,
        world_state: WorldStateSnapshot,
        risk_scores: RiskScoreMap,
        provider: str = "gemini",
    ) -> OrchestratorResult:

        # Step 1: Parallel specialist dispatch
        specialist_results = await asyncio.gather(
            inventory_agent.execute(input),
            supplier_agent.execute(input),
            transportation_agent.execute(input),
            fulfillment_agent.execute(input),
            sustainability_agent.execute(input),
            resilience_agent.execute(input),
            return_exceptions=True,
        )

        # Step 2: Filter valid proposals (PROPOSED status only)
        valid_proposals = [r for r in specialist_results
                           if isinstance(r, AgentResult) and r.status == PROPOSED]

        # Broadcast agent.proposal events for each
        for proposal in valid_proposals:
            await ws_hub.broadcast(WSEvent(type="agent.proposal", payload=proposal))

        # Step 3: Coordinator
        coordinator_input = CoordinatorInput(specialist_proposals=valid_proposals, ...)
        coordinator_result = await coordinator_agent.execute(coordinator_input)
        ranked_plans = coordinator_result.ranked_plans

        # Step 4: Adversary (sequential, one plan at a time)
        for plan in ranked_plans:
            adversary_result = await adversary_agent.execute(AdversaryInput(plan=plan, ...))
            plan.adversary_findings = adversary_result.findings
            plan.adversary_rating = adversary_result.adversary_rating

        # Final sort: composite * 0.8 + adversary_rating * 0.2
        ranked_plans.sort(key=lambda p: p.final_score, reverse=True)

        # Broadcast
        await ws_hub.broadcast(WSEvent(type="plan.ranked", payload=ranked_plans))
        return OrchestratorResult(plans=ranked_plans)
```

---

## 8. Tests (System Level)

```python
# test_orchestrator.py

async def test_full_pipeline_completes_with_mock_provider():
    """End-to-end orchestrator with mock provider produces valid RankedPlan[]."""

async def test_all_6_specialists_dispatched():
    """Orchestrator dispatches all 6 specialist agents."""

async def test_timeout_agent_does_not_block_pipeline():
    """If one agent times out, others complete and coordinator still runs."""

async def test_adversary_runs_once_per_plan():
    """N plans → N adversary runs."""

async def test_final_score_accounts_for_adversary_rating():
    """Plan with higher adversary_rating ranks higher than one with equal composite."""
```
