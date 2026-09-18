# FULFILL-X — Backend Specification

## 1. Purpose

Define the complete backend architecture, technology stack, module
structure, and implementation patterns for the FULFILL-X server.

## 2. User Problem

The backend is the intelligence engine. It must:
- Maintain an authoritative, deterministic world model
- Score risk across multiple dimensions in real time
- Orchestrate 8 specialist AI agents safely
- Simulate plan effects before acceptance
- Stream live updates to the frontend
- Record all decisions for audit and evaluation

## 3. Technology Stack

| Technology | Version | Role |
|-----------|---------|------|
| Python | 3.12 | Runtime |
| FastAPI | 0.111.x | Web framework + WebSocket |
| Uvicorn | 0.30.x | ASGI server |
| Pydantic v2 | 2.x | Data validation + schemas |
| SQLAlchemy | 2.x | ORM |
| Alembic | 1.x | Database migrations |
| PostgreSQL | 16.x | Authoritative state store |
| Redis | 7.x | Cache + pub/sub for WebSocket |
| asyncpg | 0.29.x | Async PostgreSQL driver |
| aioredis | 2.x | Async Redis client |
| httpx | 0.27.x | Async HTTP client (for AI providers) |
| google-generativeai | 0.7.x | Gemini SDK |
| boto3 | 1.x | AWS SDK (Bedrock + S3) |
| pytest | 8.x | Test framework |
| pytest-asyncio | 0.23.x | Async test support |
| ruff | 0.5.x | Linting |
| mypy | 1.x | Type checking |

## 4. Module Structure

```
backend/
├── app/
│   ├── main.py               # FastAPI app factory
│   ├── config.py             # Settings (Pydantic BaseSettings)
│   ├── dependencies.py       # FastAPI dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py         # Top-level router
│   │   ├── world.py          # /api/world endpoints
│   │   ├── signals.py        # /api/signals endpoints
│   │   ├── risks.py          # /api/risks endpoints
│   │   ├── scenarios.py      # /api/scenarios endpoints
│   │   ├── agents.py         # /api/agents endpoints
│   │   ├── plans.py          # /api/plans endpoints
│   │   ├── evaluation.py     # /api/evaluation endpoints
│   │   └── system.py         # /api/system endpoints
│   │
│   ├── ws/
│   │   ├── __init__.py
│   │   ├── hub.py            # WebSocket connection manager
│   │   └── events.py         # Event type definitions
│   │
│   ├── engines/
│   │   ├── __init__.py
│   │   ├── world_model.py    # World model CRUD + graph
│   │   ├── risk_engine.py    # Multi-dimensional risk scoring
│   │   ├── scenario_engine.py # Compound scenario composition
│   │   ├── simulation.py     # Deterministic plan simulator
│   │   └── evaluation.py     # Benchmark harness
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base.py           # Base agent class + contract
│   │   ├── orchestrator.py   # Agent dispatch + coordination
│   │   ├── inventory.py      # Inventory Agent
│   │   ├── supplier.py       # Supplier Agent
│   │   ├── transportation.py # Transportation Agent
│   │   ├── fulfillment.py    # Fulfillment Agent
│   │   ├── sustainability.py # Sustainability Agent
│   │   ├── resilience.py     # Resilience Agent
│   │   ├── coordinator.py    # Coordinator Agent
│   │   └── adversary.py      # Adversary Agent
│   │
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── provider.py       # Abstract AI provider interface
│   │   ├── gemini.py         # Gemini provider
│   │   ├── ollama.py         # Ollama provider
│   │   ├── bedrock.py        # AWS Bedrock provider
│   │   └── mock.py           # Deterministic mock provider
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── world.py          # SQLAlchemy world model ORM
│   │   ├── signals.py        # Signal ORM
│   │   ├── scenarios.py      # Scenario ORM
│   │   ├── plans.py          # Plan ORM
│   │   └── audit.py          # Audit log ORM
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── world.py          # Pydantic world schemas
│   │   ├── signals.py        # Pydantic signal schemas
│   │   ├── risks.py          # Pydantic risk schemas
│   │   ├── scenarios.py      # Pydantic scenario schemas
│   │   ├── agents.py         # Pydantic agent schemas
│   │   ├── plans.py          # Pydantic plan schemas
│   │   └── evaluation.py     # Pydantic evaluation schemas
│   │
│   ├── data/
│   │   ├── __init__.py
│   │   └── synthetic.py      # Synthetic MVP data generator
│   │
│   └── db/
│       ├── __init__.py
│       ├── session.py        # Async DB session factory
│       └── migrations/       # Alembic migration scripts
│
├── tests/
│   ├── conftest.py
│   ├── test_world_model.py
│   ├── test_risk_engine.py
│   ├── test_scenario_engine.py
│   ├── test_agents.py
│   ├── test_simulation.py
│   ├── test_evaluation.py
│   └── test_api.py
│
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml
├── .env.example
└── Makefile
```

## 5. AI Provider Abstraction

All AI providers implement the `AIProvider` abstract interface:

```python
from abc import ABC, abstractmethod
from typing import Any
from app.schemas.agents import AgentInput, AgentProposal

class AIProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        output_schema: type[BaseModel],
        temperature: float = 0.7,
        seed: int | None = None,
    ) -> BaseModel:
        """Generate structured output conforming to output_schema."""
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Return True if the provider is reachable."""
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier."""
        ...
```

Provider selection is configured via environment variable:
```
AI_PROVIDER=gemini|ollama|bedrock|mock
```

Fallback chain: `gemini → ollama → mock`

## 6. Agent Safety Pipeline

```python
async def safe_agent_execute(
    agent: BaseAgent,
    input: AgentInput,
    world_state: WorldStateSnapshot,
    constraints: ConstraintSet,
) -> AgentResult:
    # 1. AI generates proposal
    raw_proposal = await agent.ai_provider.generate(
        system_prompt=agent.system_prompt,
        user_prompt=agent.build_prompt(input, world_state),
        output_schema=agent.output_schema,
    )

    # 2. Pydantic validation (already done by generate())
    # 3. Constraint check
    constraint_result = constraints.check(raw_proposal)
    if not constraint_result.feasible:
        return AgentResult(status="INFEASIBLE", findings=constraint_result.violations)

    # 4. Simulation
    sim_result = await simulation_engine.simulate(raw_proposal, world_state)

    # 5. Accept or reject
    if sim_result.valid:
        return AgentResult(status="PROPOSED", proposal=raw_proposal, sim_result=sim_result)
    else:
        return AgentResult(status="REJECTED", reason=sim_result.rejection_reason)
```

## 7. WebSocket Hub

```python
class WebSocketHub:
    def __init__(self, redis: Redis):
        self._connections: dict[str, WebSocket] = {}
        self._redis = redis

    async def connect(self, ws: WebSocket, client_id: str) -> None: ...
    async def disconnect(self, client_id: str) -> None: ...
    async def broadcast(self, event: WSEvent) -> None: ...
    async def send_to(self, client_id: str, event: WSEvent) -> None: ...
```

Redis pub/sub is used for fan-out when multiple backend instances run.

## 8. Configuration (Environment Variables)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/fulfillx

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Providers
AI_PROVIDER=mock  # default for local dev
GEMINI_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
BEDROCK_REGION=us-east-1

# App
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173
SECRET_KEY=...
ENVIRONMENT=development

# Simulation
SIMULATION_SEED=42
```

## 9. API Summary

See `docs/API_SPEC.md` for full endpoint documentation.

## 10. Data Models

See `docs/DATA_MODEL.md` for all Pydantic schemas and SQLAlchemy models.

## 11. Failure Modes

| Failure | Detection | Response |
|---------|-----------|---------|
| AI provider timeout | httpx.TimeoutException | Fallback to next provider |
| DB connection lost | SQLAlchemy OperationalError | Circuit breaker + 503 |
| Redis disconnect | aioredis.ConnectionError | WebSocket degraded mode |
| Agent timeout | asyncio.TimeoutError | Return TIMEOUT status |
| Schema validation failure | Pydantic ValidationError | 422 response with details |

## 12. Testing

```bash
# Run all tests
pytest backend/tests/ -v

# Run with coverage
pytest backend/tests/ --cov=app --cov-report=html

# Type check
mypy backend/app/

# Lint
ruff check backend/
```

## 13. Future Extensions

- Streaming LLM responses to frontend via WebSocket
- Multi-agent parallel execution with asyncio.gather
- Agent memory (RAG with vector store)
- Real-time signal ingestion via Kafka
