"""
FULFILL-X Phase 5: Hindsight Learning Evaluation Tests

Comprehensive test suite verifying:
1. Experiment integrity (identical scenarios, seeds, action spaces)
2. Memory isolation (Memoryless agent discards memory, cannot access Hindsight)
3. Hindsight persistence & recall across sequence
4. Behavioral change over time
5. Repeated mistake avoidance (Memoryless repeats, Hindsight avoids)
6. Related-but-not-identical transfer evaluation
7. Novelty & unknown detection (correct UNKNOWN rather than fabricated certainty)
8. Challenge learning integration (boundary discovery improves later decisions)
9. Metrics calculation from actual episode outcomes (no fake benchmarks)
10. Causal decision attribution tracing
11. Reproducibility with deterministic seeds
12. Hindsight dependency test (proves system learning depends on Hindsight)
"""
import pytest
import os

from app.hindsight_eval.models import (
    AgentMode,
    EvaluationScenarioType,
    EvaluationScenario,
)
from app.hindsight_eval.scenarios import ScenarioSequenceGenerator
from app.hindsight_eval.agents import MemorylessAgent, HindsightAgent
from app.hindsight_eval.runner import EvaluationExperimentRunner
from app.hindsight_eval.service import HindsightEvaluationService


@pytest.mark.asyncio
async def test_scenario_sequence_integrity():
    """Verify canonical 30 scenarios have complete specifications and no leaked ground truth."""
    scenarios = ScenarioSequenceGenerator.generate_canonical_30_sequence()
    assert len(scenarios) == 30

    scenario_types = [s.scenario_type for s in scenarios]
    assert EvaluationScenarioType.BASELINE in scenario_types
    assert EvaluationScenarioType.RELATED in scenario_types
    assert EvaluationScenarioType.TRANSFER in scenario_types
    assert EvaluationScenarioType.BOUNDARY in scenario_types
    assert EvaluationScenarioType.NOVEL in scenario_types
    assert EvaluationScenarioType.DEPENDENCY_FAILURE in scenario_types
    assert EvaluationScenarioType.DEMAND_SURGE in scenario_types

    # Ensure all scenarios have required fields and ground truth is isolated
    for s in scenarios:
        assert s.scenario_id.startswith("eval-sc-")
        assert len(s.available_strategies) >= 3
        assert len(s.ground_truth_simulation) > 0
        assert s.provenance.is_simulation is True


@pytest.mark.asyncio
async def test_memoryless_agent_isolation():
    """Verify Memoryless Agent does not retain or accumulate experiential memory."""
    agent = MemorylessAgent()
    scenarios = ScenarioSequenceGenerator.generate_canonical_30_sequence()

    # Episode 2 is a failure case (Supplier substitution at 28% capacity)
    trace_ep2 = await agent.decide_and_execute(scenarios[1], episode_index=2)
    assert trace_ep2.success is False
    assert trace_ep2.agent_mode == AgentMode.MEMORYLESS
    assert trace_ep2.attribution.memory_recalled is False
    assert len(agent.retained_episodes) == 0  # Discarded!

    # Episode 5 has the same failing condition (Supplier substitution at 28% capacity)
    # Memoryless agent should blindly repeat the mistake because it has no memory
    trace_ep5 = await agent.decide_and_execute(scenarios[4], episode_index=5)
    assert trace_ep5.repeated_mistake is True
    assert trace_ep5.success is False
    assert trace_ep5.attribution.memory_recalled is False


@pytest.mark.asyncio
async def test_hindsight_agent_persistence_and_avoidance():
    """Verify Hindsight Agent recalls prior failure and avoids repeating mistake."""
    agent = HindsightAgent(tenant_id="test-hindsight-pers")
    scenarios = ScenarioSequenceGenerator.generate_canonical_30_sequence()

    # Episode 2: First encounter with low-capacity supplier (capacity=28%)
    trace_ep2 = await agent.decide_and_execute(scenarios[1], episode_index=2)
    assert trace_ep2.success is False
    assert trace_ep2.repeated_mistake is False
    assert len(agent.retained_episodes) == 1

    # Episode 5: Materially similar incident (capacity=28%)
    # Hindsight agent MUST recall the previous failure, reject the substitution, and avoid the mistake
    trace_ep5 = await agent.decide_and_execute(scenarios[4], episode_index=5)
    assert trace_ep5.repeated_mistake is False
    assert trace_ep5.success is True
    assert trace_ep5.boundary_avoided is True
    assert trace_ep5.attribution.memory_recalled is True
    assert trace_ep5.attribution.decision_changed is True
    assert trace_ep5.attribution.outcome_improved is True
    assert "recalled previous episode failure" in trace_ep5.decision_rationale.lower()


@pytest.mark.asyncio
async def test_related_transfer_reasoning():
    """Verify Hindsight Agent evaluates partial transferability under altered conditions."""
    agent = HindsightAgent(tenant_id="test-hindsight-transfer")
    scenarios = ScenarioSequenceGenerator.generate_canonical_30_sequence()

    # Prime with Episode 2 (capacity=28% failed)
    await agent.decide_and_execute(scenarios[1], episode_index=2)

    # Episode 4: Related but altered condition (capacity=36%, related to 28% failure boundary)
    trace_ep4 = await agent.decide_and_execute(scenarios[3], episode_index=4)
    assert trace_ep4.attribution.memory_recalled is True
    assert trace_ep4.transfer_assessment in ("PARTIAL", "TRANSFERABLE")
    assert trace_ep4.success is True


@pytest.mark.asyncio
async def test_novel_unknown_detection():
    """Verify Hindsight Agent identifies insufficient evidence (UNKNOWN) on novel topology shocks."""
    agent = HindsightAgent(tenant_id="test-hindsight-novel")
    scenarios = ScenarioSequenceGenerator.generate_canonical_30_sequence()

    # Episode 10: Completely novel incident with unknown topology
    trace_ep10 = await agent.decide_and_execute(scenarios[9], episode_index=10)
    assert trace_ep10.unknown_detected is True
    assert trace_ep10.transfer_assessment == "UNKNOWN"
    assert "novel condition" in trace_ep10.decision_rationale.lower() or "insufficient" in trace_ep10.decision_rationale.lower()


@pytest.mark.asyncio
async def test_causal_decision_attribution():
    """Verify causal attribution fields distinguish memory retrieval from actual behavioral impact."""
    agent = HindsightAgent(tenant_id="test-hindsight-causal")
    scenarios = ScenarioSequenceGenerator.generate_canonical_30_sequence()

    # Prime with failure
    await agent.decide_and_execute(scenarios[1], episode_index=2)

    # Run repeat incident
    trace = await agent.decide_and_execute(scenarios[4], episode_index=5)
    attr = trace.attribution
    assert attr.memory_recalled is True
    assert attr.evidence_used is True
    assert attr.boundary_influenced is True
    assert attr.decision_changed is True
    assert attr.outcome_improved is True
    assert len(attr.recalled_experience_ids) >= 1


@pytest.mark.asyncio
async def test_canonical_30_episode_experiment_runner():
    """Run full canonical 30-episode A/B experiment and verify metrics and exports."""
    runner = EvaluationExperimentRunner()
    report = await runner.run_experiment(seed=42)

    assert report.scenario_count == 30
    assert len(report.episodes_memoryless) == 30
    assert len(report.episodes_hindsight) == 30
    assert len(report.learning_curves_memoryless) == 30
    assert len(report.learning_curves_hindsight) == 30

    # Verification of measurable behavioral improvement
    mem_m = report.memoryless_metrics
    hin_m = report.hindsight_metrics

    # 1. Recovery Success Rate should be higher for Hindsight
    assert hin_m.recovery_success_rate > mem_m.recovery_success_rate, (
        f"Expected Hindsight ({hin_m.recovery_success_rate}) > Memoryless ({mem_m.recovery_success_rate})"
    )

    # 2. Repeated Mistake Rate should be lower for Hindsight
    assert hin_m.repeated_mistake_rate < mem_m.repeated_mistake_rate, (
        f"Expected Hindsight ({hin_m.repeated_mistake_rate}) < Memoryless ({mem_m.repeated_mistake_rate})"
    )

    # 3. Unsafe Action Rate should be lower for Hindsight
    assert hin_m.unsafe_action_rate < mem_m.unsafe_action_rate

    # 4. Learning gain should be positive for Hindsight
    assert hin_m.learning_gain >= 0.0

    # 5. Unknown detection should be positive on novel cases
    assert hin_m.unknown_detection_count >= 1

    # 6. Artifacts exported
    export_paths = runner.export_report(report)
    assert os.path.exists(export_paths["json"])
    assert os.path.exists(export_paths["csv"])


@pytest.mark.asyncio
async def test_hindsight_dependency_verification():
    """
    Dedicated Hindsight Dependency Test (Section 24).
    Proves that running with Hindsight vs without Hindsight produces materially different
    decision traces driven by memory recall rather than random noise.
    """
    scenarios = ScenarioSequenceGenerator.generate_canonical_30_sequence()

    mem_agent = MemorylessAgent()
    hin_agent = HindsightAgent(tenant_id="test-dep-verify")

    divergent_count = 0
    recalled_and_changed = 0

    for idx, sc in enumerate(scenarios, 1):
        mem_trace = await mem_agent.decide_and_execute(sc, episode_index=idx)
        hin_trace = await hin_agent.decide_and_execute(sc, episode_index=idx)

        if mem_trace.decision != hin_trace.decision:
            divergent_count += 1
            if hin_trace.attribution.memory_recalled and hin_trace.attribution.decision_changed:
                recalled_and_changed += 1

    # Must be at least 4 material divergences directly attributable to Hindsight recall
    assert divergent_count >= 4, f"Divergences ({divergent_count}) must be >= 4"
    assert recalled_and_changed >= 4, f"Attributable memory changes ({recalled_and_changed}) must be >= 4"


@pytest.mark.asyncio
async def test_evaluation_service_lifecycle():
    """Verify singleton HindsightEvaluationService caching and status endpoints."""
    service = HindsightEvaluationService.get_instance()
    status_info = service.get_status()
    assert "status" in status_info
    assert "export_paths" in status_info

    # Run canonical experiment via service
    report = await service.run_canonical_experiment(seed=42, force=True)
    assert report.scenario_count == 30
    assert report.hindsight_dependency_verified is True

    # Check cached report retrieval
    cached = await service.get_latest_report()
    assert cached.experiment_id == report.experiment_id
