"""
FULFILL-X AI Provider Schemas (Phase 04)
Matching docs/AI_ARCHITECTURE.md & docs/API_CATALOG.md
"""
from enum import Enum
from typing import Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, ConfigDict


class TaskType(str, Enum):
    SCENARIO_GEN = "SCENARIO_GEN"
    SPECIALIST_REASONING = "SPECIALIST_REASONING"
    COORDINATOR_REASONING = "COORDINATOR_REASONING"
    ADVERSARIAL_ANALYSIS = "ADVERSARIAL_ANALYSIS"
    PLAN_EXPLANATION = "PLAN_EXPLANATION"
    DECISION_SUMMARY = "DECISION_SUMMARY"
    GENERAL = "GENERAL"


class AIProviderType(str, Enum):
    MOCK = "mock"
    GEMINI = "gemini"
    OLLAMA = "ollama"
    BEDROCK = "bedrock"


class AIProviderStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    UNAVAILABLE = "UNAVAILABLE"
    DEGRADED = "DEGRADED"
    NOT_CONFIGURED = "NOT_CONFIGURED"


class AIUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    estimated_cost_usd: float = 0.0


class AIError(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class AIRequest(BaseModel):
    request_id: UUID = Field(default_factory=uuid4, description="Unique task invocation UUID")
    task_type: TaskType = Field(default=TaskType.GENERAL, description="Category of AI reasoning task")
    prompt: str = Field(..., description="User or agent prompt instruction")
    system_prompt: str | None = Field(default=None, description="System boundary prompt instruction")
    system_context: dict[str, Any] = Field(default_factory=dict, description="Deterministic system state context")
    input_context: dict[str, Any] = Field(default_factory=dict, description="Domain specific input variables")
    expected_schema: dict[str, Any] | None = Field(default=None, description="Optional JSON Schema object for structured validation")
    temperature: float = Field(default=0.2, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: int = Field(default=1000, ge=1, le=8192, description="Max token generation limit")
    timeout_seconds: float = Field(default=10.0, ge=1.0, le=60.0, description="Execution timeout threshold")


class AIResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    request_id: UUID = Field(..., description="Request UUID matching AIRequest")
    provider: AIProviderType = Field(..., description="Provider that generated response")
    model_name: str = Field(..., description="Specific model version string")
    content: str = Field(..., description="Raw string response or narrative text")
    structured_output: dict[str, Any] | None = Field(default=None, description="Validated JSON dictionary payload")
    usage: AIUsage = Field(default_factory=AIUsage, description="Token usage metrics")
    latency_ms: float = Field(default=0.0, description="Execution latency in milliseconds")
    status: str = Field(default="SUCCESS", description="SUCCESS, TIMEOUT, SCHEMA_VALIDATION_ERROR, PROVIDER_ERROR")
    error: AIError | None = Field(default=None, description="Error payload if failed")


class ProviderInfo(BaseModel):
    name: AIProviderType = Field(..., description="Provider identifier")
    configured: bool = Field(..., description="Whether required credentials/settings are present")
    available: bool = Field(..., description="Whether provider endpoint is currently reachable")
    models: list[str] = Field(default_factory=list, description="Supported model names")
    latency_ms: float | None = Field(default=None, description="Health check ping latency")
    status_details: str = Field(default="", description="Human-readable configuration or error message")


class AIProvidersSummaryResponse(BaseModel):
    active_provider: AIProviderType = Field(..., description="Currently active global provider")
    providers: list[ProviderInfo] = Field(..., description="List of all registered providers and health")


class AIHealthResponse(BaseModel):
    status: str = Field(..., description="Overall AI subsystem health: HEALTHY, DEGRADED, MOCK_ONLY")
    active_provider: AIProviderType = Field(..., description="Currently active provider")
    available_count: int = Field(..., description="Number of available providers")
    details: dict[str, Any] = Field(default_factory=dict, description="Detailed diagnostic metrics")
