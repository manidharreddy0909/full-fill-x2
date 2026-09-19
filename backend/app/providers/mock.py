"""
FULFILL-X Deterministic Mock AI Provider (Phase 04)
Matching docs/AI_ARCHITECTURE.md (P04-004)
"""
import time
import json
from typing import Any
from app.providers.base import AIProvider
from app.schemas.ai import (
    AIRequest,
    AIResponse,
    AIProviderType,
    AIUsage,
    ProviderInfo,
    TaskType,
)


class MockAIProvider(AIProvider):
    """
    100% Deterministic Seed-Reproducible Mock AI Provider.
    Used for automated evaluation harness, CI testing, and offline development.
    Requires no API keys or network calls.
    """

    def __init__(self, model_name: str = "mock-gpt4o-v1"):
        self.model_name = model_name

    async def generate(self, request: AIRequest) -> AIResponse:
        start_time = time.perf_counter()

        structured_output: dict[str, Any] | None = None
        content = ""

        if request.task_type == TaskType.SCENARIO_GEN:
            content = f"Mock scenario generated for prompt: '{request.prompt}'."
            structured_output = {
                "scenario_name": "Synthetic Disruption Overlay",
                "severity_multiplier": 1.25,
                "target_node_ids": request.input_context.get("affected_node_ids", ["sup-001"]),
                "recommended_action": "Reroute shipments to secondary warehouse W2",
            }
        elif request.task_type in (TaskType.SPECIALIST_REASONING, TaskType.COORDINATOR_REASONING):
            content = f"Specialist recommendation for prompt: '{request.prompt}'."
            structured_output = {
                "recommendation_summary": "Adjust reorder point by +25% to mitigate supplier lead time inflation",
                "confidence_score": 0.88,
                "impacted_skus": ["SKU-001", "SKU-002"],
                "mitigation_cost_usd": 15000.0,
            }
        elif request.task_type == TaskType.ADVERSARIAL_ANALYSIS:
            content = f"Adversarial analysis identified potential vulnerability: '{request.prompt}'."
            structured_output = {
                "vulnerability_type": "SINGLE_POINT_OF_FAILURE",
                "target_node_id": "port-001",
                "attack_vector": "Cascading vessel backlog delay",
                "impact_score": 0.85,
            }
        elif request.task_type == TaskType.PLAN_EXPLANATION:
            content = f"Plan evaluation breakdown: '{request.prompt}'."
            structured_output = {
                "tradeoff_analysis": "Plan B trades 12% higher transport cost for 95% SLA protection",
                "risk_reduction_percentage": 42.5,
                "feasibility_score": 0.91,
            }
        else:
            content = f"[Mock AI] Execution output for prompt: '{request.prompt}'."
            structured_output = {
                "status": "PROCESSED",
                "summary": content,
                "input_received": request.prompt,
            }

        # If expected schema is provided and custom output needed
        if request.expected_schema and "properties" in request.expected_schema:
            props = request.expected_schema["properties"]
            mock_custom: dict[str, Any] = {}
            for key, spec in props.items():
                p_type = spec.get("type", "string")
                if p_type == "string":
                    mock_custom[key] = f"Mock {key} value"
                elif p_type in ("number", "integer"):
                    mock_custom[key] = 100
                elif p_type == "boolean":
                    mock_custom[key] = True
                elif p_type == "array":
                    mock_custom[key] = ["item_1", "item_2"]
                else:
                    mock_custom[key] = {}
            structured_output = mock_custom

        latency_ms = (time.perf_counter() - start_time) * 1000.0 + 5.0  # Simulated 5ms execution

        prompt_tokens = len(request.prompt.split()) + 10
        completion_tokens = len(content.split()) + 20

        return AIResponse(
            request_id=request.request_id,
            provider=AIProviderType.MOCK,
            model_name=self.model_name,
            content=content,
            structured_output=structured_output,
            usage=AIUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
                estimated_cost_usd=0.0,
            ),
            latency_ms=round(latency_ms, 2),
            status="SUCCESS",
        )

    async def health(self) -> ProviderInfo:
        return ProviderInfo(
            name=AIProviderType.MOCK,
            configured=True,
            available=True,
            models=[self.model_name, "mock-claude3-v1"],
            latency_ms=1.2,
            status_details="Deterministic Mock Provider Ready (100% Offline Capability)",
        )

    def capabilities(self) -> dict[str, Any]:
        return {
            "streaming": False,
            "structured_output": True,
            "vision": False,
            "max_context_window": 128000,
            "offline_support": True,
        }
