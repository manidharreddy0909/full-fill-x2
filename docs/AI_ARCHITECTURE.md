# FULFILL-X — AI Architecture

## 1. Purpose

Define the complete AI architecture: provider abstraction, safety boundary,
prompt engineering strategy, output validation, and fallback behavior.

This document enforces the most critical constraint in FULFILL-X:

> **LLMs propose. Deterministic systems decide.**

---

## 2. The AI Safety Boundary

```
┌─────────────────────────────────────────────────────────┐
│                    LLM BOUNDARY                          │
│                                                          │
│  System Prompt (static, code-defined)                    │
│  User Prompt (built from typed inputs)                   │
│      ↓                                                   │
│  LLM generates JSON text                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          ↓ raw JSON text
┌─────────────────────────────────────────────────────────┐
│              VALIDATION BOUNDARY (deterministic)          │
│                                                          │
│  1. Pydantic v2 schema validation                        │
│     → Rejects non-conforming output immediately          │
│     → No retry with relaxed constraints                  │
│                                                          │
│  2. Constraint Engine check                              │
│     → Checks all ProposalActions against ConstraintSet   │
│     → Returns INFEASIBLE if any action violates          │
│                                                          │
│  3. Simulation Engine                                    │
│     → Applies actions to copy of world state             │
│     → Returns valid/invalid + resulting state            │
│                                                          │
│  4. Accept / Reject decision                             │
│     → Only ACCEPTED proposals can proceed to Coordinator │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          ↓ only after ACCEPT
┌─────────────────────────────────────────────────────────┐
│              AUTHORITATIVE WORLD STATE                    │
│              (PostgreSQL — append-only mutations)         │
└─────────────────────────────────────────────────────────┘
```

**The LLM never:**
- Reads from the database directly
- Writes to any database
- Calls any external service
- Accesses world state except via typed prompt context
- Sees other agents' private chain-of-thought

---

## 3. Provider Interface

```python
from abc import ABC, abstractmethod
from pydantic import BaseModel

class AIProvider(ABC):
    """Abstract interface all providers must implement."""

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        output_schema: type[BaseModel],
        temperature: float = 0.7,
        seed: int | None = None,
    ) -> dict:
        """
        Generate structured output.

        Args:
            system_prompt: Static agent persona + instructions
            user_prompt: Dynamic context built from typed inputs
            output_schema: Pydantic model class for validation
            temperature: Creativity (0.0 = deterministic, 1.0 = creative)
            seed: If provided, request deterministic output (provider-dependent)

        Returns:
            dict conforming to output_schema fields

        Raises:
            AIProviderError: If provider returns invalid/empty output
            AIProviderTimeoutError: If provider exceeds timeout
        """

    @abstractmethod
    async def health_check(self) -> ProviderHealth:
        """Return current health status."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier for logging and UI."""

    @property
    @abstractmethod
    def supports_structured_output(self) -> bool:
        """True if provider supports native JSON schema enforcement."""
```

---

## 4. Provider Implementations

### 4.1 Gemini Provider

```python
class GeminiProvider(AIProvider):
    name = "gemini"
    supports_structured_output = True

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def generate(self, system_prompt, user_prompt, output_schema, temperature=0.7, seed=None):
        config = GenerationConfig(
            temperature=temperature,
            response_mime_type="application/json",
            response_schema=output_schema.model_json_schema(),
        )
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=[system_prompt, user_prompt],
            config=config,
        )
        return json.loads(response.text)
```

**Notes**:
- Uses Gemini structured output (JSON schema enforcement)
- No chain-of-thought in response (controlled by system prompt)
- Model: `gemini-2.0-flash` for speed; configurable

### 4.2 Ollama Provider

```python
class OllamaProvider(AIProvider):
    name = "ollama"
    supports_structured_output = True

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2"):
        self.client = AsyncClient(host=base_url)
        self.model = model

    async def generate(self, system_prompt, user_prompt, output_schema, temperature=0.7, seed=None):
        response = await self.client.chat(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            format=output_schema.model_json_schema(),
            options={"temperature": temperature, **({"seed": seed} if seed else {})},
        )
        return json.loads(response.message.content)
```

**Notes**:
- Local inference — no data leaves the machine
- Supports `seed` parameter for near-deterministic output
- Model configurable (default: llama3.2)

### 4.3 AWS Bedrock Provider (Optional)

```python
class BedrockProvider(AIProvider):
    name = "bedrock"
    supports_structured_output = False  # JSON enforced via prompt engineering

    def __init__(self, region: str = "us-east-1", model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"):
        self.client = boto3.client("bedrock-runtime", region_name=region)
        self.model_id = model_id
```

**Notes**:
- Optional — enabled only if `AI_PROVIDER=bedrock`
- Uses Anthropic Claude via Bedrock
- JSON enforced via system prompt (not native schema)
- Requires additional Pydantic validation strictness

### 4.4 Mock Provider (Deterministic)

```python
class MockProvider(AIProvider):
    name = "mock"
    supports_structured_output = True

    def __init__(self, seed: int = 42, response_library: dict = DEFAULT_MOCK_RESPONSES):
        self.seed = seed
        self.rng = random.Random(seed)
        self.library = response_library

    async def generate(self, system_prompt, user_prompt, output_schema, temperature=0.7, seed=None):
        """
        Returns a deterministic, pre-defined response based on output_schema type.
        Always valid. Always passes Pydantic validation.
        """
        schema_name = output_schema.__name__
        if schema_name in self.library:
            return self.library[schema_name]
        raise MockProviderError(f"No mock response defined for {schema_name}")

    async def health_check(self):
        return ProviderHealth(status="HEALTHY", latency_ms=0.0)
```

**Critical**: The mock response library (`DEFAULT_MOCK_RESPONSES`) must be:
- Maintained by hand for each agent output schema
- Realistic (not trivially simple)
- Covering multiple scenarios (indexed by scenario type)

---

## 5. Provider Factory

```python
class AIProviderFactory:
    FALLBACK_CHAIN = ["gemini", "ollama", "mock"]

    @classmethod
    def create(cls, provider_name: str, settings: Settings) -> AIProvider:
        providers = {
            "gemini": lambda: GeminiProvider(api_key=settings.GEMINI_API_KEY),
            "ollama": lambda: OllamaProvider(base_url=settings.OLLAMA_BASE_URL),
            "bedrock": lambda: BedrockProvider(region=settings.BEDROCK_REGION),
            "mock": lambda: MockProvider(seed=settings.SIMULATION_SEED),
        }
        if provider_name not in providers:
            raise ValueError(f"Unknown provider: {provider_name}")
        return providers[provider_name]()

    @classmethod
    async def create_with_fallback(cls, preferred: str, settings: Settings) -> AIProvider:
        """Try preferred provider, fall back through chain if health check fails."""
        chain = [preferred] + [p for p in cls.FALLBACK_CHAIN if p != preferred]
        for name in chain:
            try:
                provider = cls.create(name, settings)
                health = await provider.health_check()
                if health.status == "HEALTHY":
                    return provider
            except Exception:
                continue
        raise AllProvidersUnavailableError("All AI providers failed health check")
```

---

## 6. Prompt Engineering Strategy

### 6.1 System Prompt Structure

```
[ROLE]
You are the {agent_name} for FULFILL-X, an agentic supply chain resilience system.

[OBJECTIVE]
{agent_objective}

[CONSTRAINTS]
- You must only propose actions within the allowed_action_types: {allowed_action_types}
- You must not expose your internal reasoning
- You must produce valid JSON conforming exactly to the output schema
- Your reasoning field must be ≤ 200 words, operational, evidence-based

[OUTPUT]
Respond ONLY with valid JSON. No explanation outside the JSON structure.
Do not include chain-of-thought, analysis steps, or meta-commentary.
```

### 6.2 User Prompt Structure

```
CURRENT SCENARIO:
{scenario.to_prompt_summary()}

WORLD STATE:
{world_state.to_prompt_summary()}  # truncated to relevant nodes only

RISK SCORES:
{risk_scores.to_prompt_summary()}  # top 10 highest risk nodes

CONTEXT:
{context}

Produce your proposal following the output schema exactly.
```

### 6.3 Chain-of-Thought Isolation

The system prompt explicitly instructs the LLM not to include reasoning in the JSON output.
The `reasoning` field in `AgentOutput` is a **condensed operational summary** (≤ 200 words),
not the full chain-of-thought.

The raw LLM response is:
1. Stored in a debug log (never exposed to frontend)
2. Stripped of any XML/markdown wrapping
3. Parsed as JSON immediately

---

## 7. Structured Output Enforcement

**Priority**: Use native structured output (JSON schema enforcement) where available.
- Gemini: ✅ `response_schema` parameter
- Ollama: ✅ `format` parameter
- Bedrock: ❌ prompt-only JSON enforcement

For Bedrock: add an additional extraction step that finds the JSON object
within the raw text response before Pydantic validation.

---

## 8. Error Handling

```python
class AIProviderError(Exception): pass
class AIOutputValidationError(AIProviderError): pass
class AIProviderTimeoutError(AIProviderError): pass
class AISchemaConformanceError(AIProviderError): pass
class AllProvidersUnavailableError(AIProviderError): pass
```

All errors are caught in `safe_execute()` and converted to `AgentResult(status=AI_ERROR)`.
The orchestrator continues with remaining valid proposals.

---

## 9. AI Provider Status in UI

**System / AWS Status screen** shows:

| Provider | Status | Latency | Last Error |
|---------|--------|---------|-----------|
| Gemini | HEALTHY | 1.2s | — |
| Ollama | DEGRADED | N/A | Connection refused |
| Bedrock | INACTIVE | N/A | Not configured |
| Mock | HEALTHY | 0ms | — |

Users can switch the active provider via `POST /api/system/providers/switch`.

---

## 10. Tests

```python
# test_ai_providers.py

async def test_mock_provider_is_deterministic():
    p1 = MockProvider(seed=42).generate(schema=InventoryAgentOutput)
    p2 = MockProvider(seed=42).generate(schema=InventoryAgentOutput)
    assert p1 == p2

async def test_gemini_provider_output_validates_schema(live_api_key):
    result = await GeminiProvider(live_api_key).generate(
        system_prompt="...", user_prompt="...", output_schema=InventoryAgentOutput
    )
    InventoryAgentOutput.model_validate(result)  # must not raise

async def test_fallback_chain_skips_unavailable_provider():
    factory = AIProviderFactory()
    provider = await factory.create_with_fallback("gemini", settings_no_gemini_key)
    assert provider.name != "gemini"

async def test_invalid_ai_output_raises_schema_error():
    with pytest.raises(AISchemaConformanceError):
        bad_mock = MockProvider(response_library={"InventoryAgentOutput": {"bad": "data"}})
        await inventory_agent_with(bad_mock).execute(input)
```
