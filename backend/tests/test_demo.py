"""
FULFILL-X Automated Demo Engine Test Suite (Phase 16)
Validates scenario registry, state machine transitions, step/fast modes, pause/resume/reset,
human approval/rejection gates, report generation, REST API endpoints, and 100% determinism reproducibility across 3 consecutive runs.
"""
import pytest
import os
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.demo import (
    DemoScenarioId,
    DemoStatus,
    DemoModeType,
)
from app.demo.scenarios import DemoScenarioRegistry
from app.demo.service import DemoService
from app.demo.report import DemoReportGenerator

client = TestClient(app)


def test_demo_scenario_registry():
    """Verify all 5 competition scenarios are properly registered and configured."""
    scenarios = DemoScenarioRegistry.list_scenarios()
    assert len(scenarios) == 5

    scenario_ids = [sc.scenario_id for sc in scenarios]
    assert DemoScenarioId.DEMO_01 in scenario_ids
    assert DemoScenarioId.DEMO_05 in scenario_ids

    primary = DemoScenarioRegistry.get_scenario(DemoScenarioId.DEMO_05)
    assert primary is not None
    assert primary.title == "Full Resilience Challenge (Primary Showcase)"
    assert primary.seed == 42
    assert len(primary.storyboard_steps) == 12


@pytest.mark.asyncio
async def test_demo_service_step_workflow():
    """Test manual step-by-step workflow execution and state machine transitions."""
    service = DemoService.get_instance()
    service.reset_demo()

    session = await service.start_demo(
        scenario_id=DemoScenarioId.DEMO_05,
        mode=DemoModeType.STEP,
        seed=42,
    )

    assert session.status == DemoStatus.OBSERVING
    assert session.current_step_index == 0
    assert len(session.timeline) == 12

    # Step to stage 1 (Risk Analysis)
    session = await service.step_demo(session.session_id)
    assert session.current_step_index == 1
    assert session.status == DemoStatus.RISK_DETECTED

    # Advance through remaining stages to AWAITING_APPROVAL
    while session.current_step_index < 7:
        session = await service.step_demo(session.session_id)

    assert session.status == DemoStatus.AWAITING_APPROVAL

    # Approve plan
    session = await service.approve_plan(
        session_id=session.session_id,
        approver_name="Chief Supply Chain Officer",
        decision_rationale="Approved Plan C for maximum resilience",
        selected_plan_id="Candidate C",
    )

    assert session.status == DemoStatus.COMPLETED
    assert session.evaluation_summary is not None
    assert session.evaluation_summary.resilience_score > 0.0


@pytest.mark.asyncio
async def test_demo_service_pause_resume_reset():
    """Test pause, resume, and reset functionality."""
    service = DemoService.get_instance()
    service.reset_demo()

    session = await service.start_demo(
        scenario_id=DemoScenarioId.DEMO_01,
        mode=DemoModeType.STEP,
        seed=42,
    )

    # Pause
    session = await service.pause_demo(session.session_id)
    assert session.status == DemoStatus.PAUSED

    # Resume
    session = await service.resume_demo(session.session_id)
    assert session.status == DemoStatus.OBSERVING

    # Reset
    service.reset_demo()
    status_info = service.get_status()
    assert status_info["active_session"] is None


@pytest.mark.asyncio
async def test_demo_rejection_workflow():
    """Test human rejection gate workflow."""
    service = DemoService.get_instance()
    service.reset_demo()

    session = await service.start_demo(
        scenario_id=DemoScenarioId.DEMO_02,
        mode=DemoModeType.STEP,
        seed=42,
    )

    # Fast forward to approval stage
    while session.current_step_index < 7:
        session = await service.step_demo(session.session_id)

    # Reject decision
    session = await service.reject_plan(
        session_id=session.session_id,
        approver_name="Logistics VP",
        decision_rationale="Rejected due to excessive cost",
    )

    assert session.status == DemoStatus.REJECTED


def test_demo_report_generator(tmp_path):
    """Test structured JSON and Markdown report artifact generation."""
    service = DemoService.get_instance()
    service.reset_demo()

    # Create dummy completed session
    session = service._active_session
    if not session:
        import asyncio
        session = asyncio.run(service.start_demo(scenario_id=DemoScenarioId.DEMO_05, seed=42))
        session = asyncio.run(service.approve_plan(session.session_id))

    out_dir = str(tmp_path / "artifacts" / "demo")
    report = DemoReportGenerator.generate_report(session, output_dir=out_dir)

    assert report is not None
    assert os.path.exists(os.path.join(out_dir, "demo_report.json"))
    assert os.path.exists(os.path.join(out_dir, "demo_report.md"))

    with open(os.path.join(out_dir, "demo_report.md"), "r", encoding="utf-8") as f:
        md_text = f.read()
        assert "# FULFILL-X Competition Demo Report" in md_text
        assert "Executive Summary" in md_text


def test_demo_rest_api_endpoints():
    """Test all Demo Mode REST API endpoints via TestClient."""
    # GET status
    resp = client.get("/api/demo/status")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "available_scenarios" in data
    assert len(data["available_scenarios"]) == 5

    # GET scenarios
    resp = client.get("/api/demo/scenarios")
    assert resp.status_code == 200
    scenarios = resp.json()["data"]
    assert len(scenarios) == 5

    # POST start
    resp = client.post(
        "/api/demo/start",
        json={"scenario_id": "DEMO-05", "mode": "STEP", "seed": 42},
    )
    assert resp.status_code == 200
    session_data = resp.json()["data"]
    session_id = session_data["session_id"]
    assert session_data["status"] == "OBSERVING"

    # POST step
    resp = client.post("/api/demo/step", json={"session_id": session_id})
    assert resp.status_code == 200
    assert resp.json()["data"]["current_step_index"] == 1

    # POST pause
    resp = client.post(f"/api/demo/pause?session_id={session_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "PAUSED"

    # POST resume
    resp = client.post(f"/api/demo/resume?session_id={session_id}")
    assert resp.status_code == 200

    # GET session
    resp = client.get(f"/api/demo/session/{session_id}")
    assert resp.status_code == 200

    # Fast forward to approval
    for _ in range(6):
        client.post("/api/demo/step", json={"session_id": session_id})

    # POST approve
    resp = client.post(
        "/api/demo/approve",
        json={
            "session_id": session_id,
            "approver_name": "Chief Officer",
            "decision_rationale": "Validated",
            "selected_plan_id": "Candidate C",
        },
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "COMPLETED"

    # GET report
    resp = client.get(f"/api/demo/report/{session_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["workflow_completed"] is True

    # POST reset
    resp = client.post("/api/demo/reset")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_100_percent_determinism_across_3_runs():
    """
    CRITICAL VERIFICATION: Run primary showcase DEMO-05 3 consecutive times
    with seed=42 and assert 100% identical outputs (Run 1 == Run 2 == Run 3).
    """
    service = DemoService.get_instance()
    results = []

    for run_idx in range(3):
        service.reset_demo()

        session = await service.start_demo(
            scenario_id=DemoScenarioId.DEMO_05,
            mode=DemoModeType.STEP,
            seed=42,
        )

        # Step through full workflow
        for _ in range(7):
            session = await service.step_demo(session.session_id)

        session = await service.approve_plan(
            session_id=session.session_id,
            approver_name="CSCO",
            decision_rationale="Deterministic Run Test",
            selected_plan_id="Candidate C",
        )

        # Extract deterministic metrics
        health_score = session.executive_summary.network_health_score
        risk_score = session.executive_summary.critical_risk_count
        resilience_score = session.evaluation_summary.resilience_score
        slr = session.evaluation_summary.service_level_realization
        step_count = len(session.timeline)

        results.append({
            "health_score": health_score,
            "risk_score": risk_score,
            "resilience_score": resilience_score,
            "slr": slr,
            "step_count": step_count,
        })

    # Assert 100% identity across all 3 runs
    assert results[0] == results[1], f"Run 1 != Run 2: {results[0]} vs {results[1]}"
    assert results[1] == results[2], f"Run 2 != Run 3: {results[1]} vs {results[2]}"
    print(f"\n100% Determinism Verified Across 3 Runs! Result: {results[0]}")
