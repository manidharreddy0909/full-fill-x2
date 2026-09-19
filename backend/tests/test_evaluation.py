"""
Comprehensive Test Suite for FULFILL-X Phase 12 — Evaluation Harness & Benchmark Suite
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.evaluation import (
    EvaluationRun,
    EvaluationStatus,
    GroundTruth,
    BenchmarkScenario,
    MetricResult,
)
from app.evaluation.scenarios import ScenarioRegistry
from app.evaluation.metrics import MetricCalculator
from app.evaluation.baseline import BENCHMARK_REGRESSION_BASELINE, evaluate_baseline_compliance
from app.evaluation.runner import EvaluationRunner
from app.repository.evaluation import EvaluationRepository
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.services.evaluation import EvaluationService

client = TestClient(app)


# 1. Schema Tests
def test_valid_evaluation_schema():
    gt = GroundTruth(
        scenario_id="SCENARIO-01",
        expected_affected_nodes=["sup-001"],
        expected_risk_nodes=["sup-001"],
    )
    scenario = BenchmarkScenario(
        scenario_id="SCENARIO-01",
        name="Test Scenario",
        description="Testing scenario schema",
        seed=42,
        ground_truth=gt,
    )
    run = EvaluationRun(
        run_id="run-test-123",
        benchmark_id="BENCHMARK-V1",
        scenario_id="SCENARIO-01",
        seed=42,
        started_at="2026-09-19T00:00:00Z",
        status=EvaluationStatus.COMPLETED,
    )

    assert run.run_id == "run-test-123"
    assert run.status == EvaluationStatus.COMPLETED
    assert scenario.ground_truth.scenario_id == "SCENARIO-01"


# 2. Scenario Registry Tests
def test_scenario_registry():
    registry = ScenarioRegistry()
    scenarios = registry.list_scenarios()
    assert len(scenarios) == 8, "Expected exactly 8 benchmark scenarios in registry"

    scenario_ids = [s.scenario_id for s in scenarios]
    for i in range(1, 9):
        expected_id = f"SCENARIO-0{i}"
        assert expected_id in scenario_ids, f"Missing scenario {expected_id}"

    sc01 = registry.get_scenario("SCENARIO-01")
    assert sc01 is not None
    assert sc01.ground_truth.scenario_id == "SCENARIO-01"
    assert len(sc01.ground_truth.expected_affected_nodes) > 0


# 3. Metric Calculation Engine Tests
def test_metric_risk_detection():
    gt = GroundTruth(
        scenario_id="SCENARIO-01", expected_risk_nodes=["node-A", "node-B"]
    )
    res = MetricCalculator.calculate_risk_detection(["node-A", "node-B"], gt)
    assert res.value == 1.0
    assert res.raw_counts["precision"] == 1.0
    assert res.raw_counts["recall"] == 1.0
    assert res.raw_counts["true_positives"] == 2

    # Partial match
    res_part = MetricCalculator.calculate_risk_detection(["node-A", "node-C"], gt)
    assert res_part.raw_counts["true_positives"] == 1
    assert res_part.raw_counts["false_positives"] == 1
    assert res_part.raw_counts["false_negatives"] == 1


def test_metric_risk_localization():
    gt = GroundTruth(
        scenario_id="SCENARIO-01", expected_affected_nodes=["n1", "n2", "n3"]
    )
    res = MetricCalculator.calculate_risk_localization(["n1", "n2", "n4"], gt)
    # intersection: n1, n2 (2). union: n1, n2, n3, n4 (4). IoU = 0.5
    assert res.value == 0.5


def test_metric_scenario_and_agent_validity():
    registry = ScenarioRegistry()
    sc01 = registry.get_scenario("SCENARIO-01")
    world_nodes = ["sup-001", "port-001", "wh-001", "fc-001"]

    res_scen = MetricCalculator.calculate_scenario_validity(sc01, world_nodes)
    assert res_scen.value == 1.0

    proposals = [
        {"agent_id": "inventory", "action_type": "REALLOCATE", "target_entity_id": "wh-001"},
        {"agent_id": "supplier", "action_type": "SWITCH", "target_entity_id": "sup-001"},
    ]
    res_agent = MetricCalculator.calculate_agent_proposal_validity(proposals, world_nodes)
    assert res_agent.value == 1.0


def test_metric_robustness_and_transparency():
    res_rob = MetricCalculator.calculate_plan_robustness(0.90, 0.80)
    assert res_rob.value == 0.90  # 1.0 - (0.90 - 0.80) = 0.90

    payload = {
        "evidence": ["sig-1"],
        "constraints": ["c1"],
        "reasoning": ["r1"],
        "tradeoffs": ["t1"],
        "impact": {"val": 1},
        "verification": ["v1"],
    }
    res_transp = MetricCalculator.calculate_transparency_completeness(payload)
    assert res_transp.value == 1.0


# 4. Runner & State Isolation Tests
@pytest.mark.asyncio
async def test_evaluation_runner_isolation_and_execution():
    world_repo = WorldRepository.get_instance()
    risk_repo = RiskRepository.get_instance()

    nodes_before = len(world_repo.graph.nodes)
    signals_before = len(risk_repo.list_signals())

    runner = EvaluationRunner()
    run = await runner.run_scenario("SCENARIO-01")

    assert run.status == EvaluationStatus.COMPLETED
    assert run.scenario_id == "SCENARIO-01"
    assert "risk_detection" in run.metrics
    assert "verification_accuracy" in run.metrics

    nodes_after = len(world_repo.graph.nodes)
    signals_after = len(risk_repo.list_signals())

    assert nodes_before == nodes_after, "Production WorldRepository was mutated by runner!"
    assert signals_before == signals_after, "Production RiskRepository was mutated by runner!"


@pytest.mark.asyncio
async def test_deterministic_reproducibility():
    runner = EvaluationRunner()

    runA = await runner.run_scenario("SCENARIO-01", seed_override=42)
    runB = await runner.run_scenario("SCENARIO-01", seed_override=42)

    assert runA.status == EvaluationStatus.COMPLETED
    assert runB.status == EvaluationStatus.COMPLETED

    # Compare deterministic metrics
    for m_key in runA.metrics:
        valA = runA.metrics[m_key].value
        valB = runB.metrics[m_key].value
        assert valA == valB, f"Metric '{m_key}' differs between reproducible runs ({valA} vs {valB})"


# 5. Benchmark Suite & Baseline Compliance
@pytest.mark.asyncio
async def test_benchmark_full_suite():
    runner = EvaluationRunner()
    report = await runner.run_benchmark("BENCHMARK-V1")

    assert report.scenarios_evaluated == 8
    assert len(report.runs) == 8
    assert report.summary.overall_score > 0.0

    compliance = evaluate_baseline_compliance(report.summary.model_dump())
    assert "overall_score" in compliance
    assert compliance["scenario_validity"]["passed"] is True


# 6. Evaluation Repository Tests
def test_evaluation_repository():
    repo = EvaluationRepository.get_instance()
    repo.clear()

    run = EvaluationRun(
        run_id="run-repo-1",
        benchmark_id="BM1",
        scenario_id="SCENARIO-01",
        seed=42,
        started_at="2026-09-19T00:00:00Z",
        status=EvaluationStatus.COMPLETED,
    )
    repo.save_run(run)

    fetched = repo.get_run("run-repo-1")
    assert fetched is not None
    assert fetched.run_id == "run-repo-1"

    runs = repo.list_runs()
    assert len(runs) == 1


# 7. Evaluation API Endpoints Tests
def test_evaluation_api_endpoints():
    # GET /api/evaluation/status
    res_status = client.get("/api/evaluation/status")
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "HEALTHY"

    # GET /api/evaluation/scenarios
    res_scenarios = client.get("/api/evaluation/scenarios")
    assert res_scenarios.status_code == 200
    scenarios_data = res_scenarios.json()
    assert len(scenarios_data) == 8

    # POST /api/evaluation/run
    res_run = client.post(
        "/api/evaluation/run",
        json={"scenario_id": "SCENARIO-01", "seed": 42},
    )
    assert res_run.status_code == 200
    run_data = res_run.json()
    assert run_data["scenario_id"] == "SCENARIO-01"
    assert run_data["status"] == "COMPLETED"

    # GET /api/evaluation/runs
    res_runs = client.get("/api/evaluation/runs")
    assert res_runs.status_code == 200
    assert len(res_runs.json()) >= 1

    # GET /api/evaluation/runs/{run_id}
    run_id = run_data["run_id"]
    res_get_run = client.get(f"/api/evaluation/runs/{run_id}")
    assert res_get_run.status_code == 200
    assert res_get_run.json()["run_id"] == run_id

    # POST /api/evaluation/run-all
    res_run_all = client.post("/api/evaluation/run-all", json={"benchmark_id": "BM-TEST"})
    assert res_run_all.status_code == 200
    report_data = res_run_all.json()
    assert report_data["scenarios_evaluated"] == 8

    # GET /api/evaluation/report
    res_report = client.get("/api/evaluation/report")
    assert res_report.status_code == 200
    assert "summary" in res_report.json()

    # POST /api/evaluation/compare
    res_compare = client.post(
        "/api/evaluation/compare",
        json={"baseline_run_id": run_id, "target_run_id": run_id},
    )
    assert res_compare.status_code == 200
    comp_data = res_compare.json()
    assert comp_data["baseline_run_id"] == run_id
