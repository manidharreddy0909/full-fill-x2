"""
FULFILL-X Demo Service & State Machine Orchestrator (Phase 16)
Orchestrates guided demo scenarios seamlessly reusing Cockpit, World, Risk, Agent, Coordinator,
Adversary, Planner, Verification, and Evaluation services without business logic duplication.
"""
from datetime import datetime, timezone
import time
import logging
from typing import Dict, List, Optional, Any

from app.schemas.demo import (
    DemoScenario,
    DemoScenarioId,
    DemoStatus,
    DemoModeType,
    DemoStepRecord,
    DemoSession,
    DemoReport,
)
from app.schemas.cockpit import DecisionStage, DecisionStageStatus
from app.demo.scenarios import DemoScenarioRegistry
from app.demo.report import DemoReportGenerator
from app.services.cockpit import CockpitService
from app.services.evaluation import EvaluationService
from app.repository.world import WorldRepository
from app.repository.risk import RiskRepository
from app.realtime.event_bus import event_bus
from app.schemas.events import EventType, EventSeverity

logger = logging.getLogger("fulfillx.demo_service")


class DemoService:
    """
    Singleton service orchestrating competition Demo Sessions.
    """

    _instance: Optional["DemoService"] = None

    def __init__(self):
        self.cockpit_service: CockpitService = CockpitService.get_instance()
        self.evaluation_service: EvaluationService = EvaluationService.get_instance()
        self.world_repo: WorldRepository = WorldRepository.get_instance()
        self.risk_repo: RiskRepository = RiskRepository.get_instance()
        self._active_session: Optional[DemoSession] = None
        self._step_sequence_mapping: List[DecisionStage] = [
            DecisionStage.OBSERVING,
            DecisionStage.ANALYZING_RISK,
            DecisionStage.RUNNING_SPECIALISTS,
            DecisionStage.COORDINATING,
            DecisionStage.ADVERSARIAL_TESTING,
            DecisionStage.OPTIMIZING,
            DecisionStage.VERIFYING,
            DecisionStage.READY_FOR_APPROVAL,
        ]

    @classmethod
    def get_instance(cls) -> "DemoService":
        if cls._instance is None:
            cls._instance = DemoService()
        return cls._instance

    def get_status(self) -> Dict[str, Any]:
        """Return current Demo Engine status."""
        return {
            "active_session": self._active_session,
            "available_scenarios": DemoScenarioRegistry.list_scenarios(),
            "system_healthy": True,
            "ai_provider": "mock",
        }

    async def start_demo(
        self,
        scenario_id: DemoScenarioId = DemoScenarioId.DEMO_05,
        mode: DemoModeType = DemoModeType.STEP,
        seed: int = 42,
    ) -> DemoSession:
        """
        Initialize and launch a new competition Demo Session.
        """
        scenario = DemoScenarioRegistry.get_scenario(scenario_id)
        if not scenario:
            scenario = DemoScenarioRegistry.get_scenario(DemoScenarioId.DEMO_05)

        logger.info(f"Starting Demo Session for {scenario.scenario_id} ({scenario.title}) in {mode} mode with seed={seed}")

        # Create linked Cockpit decision session
        cockpit_sess = self.cockpit_service.create_session(preset=scenario.preset, seed=seed)

        # Build 12-stage demo storyboard timeline
        timeline: List[DemoStepRecord] = []
        for idx, title in enumerate(scenario.storyboard_steps):
            stage = self._step_sequence_mapping[min(idx, len(self._step_sequence_mapping) - 1)]
            status = "COMPLETED" if idx == 0 else "PENDING"
            timeline.append(
                DemoStepRecord(
                    step_index=idx,
                    stage=stage,
                    title=title,
                    status=status,
                    summary="Initialized" if idx == 0 else "Waiting for step execution",
                    key_metrics={"preset": scenario.preset, "seed": seed} if idx == 0 else {},
                )
            )

        session = DemoSession(
            scenario_id=scenario.scenario_id,
            mode=mode,
            status=DemoStatus.OBSERVING,
            seed=seed,
            current_step_index=0,
            timeline=timeline,
            cockpit_session_id=cockpit_sess.session_id,
            executive_summary=cockpit_sess.summary,
        )

        self._active_session = session

        # Publish WebSocket Lifecycle Event
        await event_bus.publish(
            event_type=EventType.SESSION_STARTED,
            source="DemoService",
            session_id=session.session_id,
            severity=EventSeverity.HIGH,
            payload={
                "demo_session_id": session.session_id,
                "scenario_id": scenario.scenario_id,
                "mode": mode,
                "seed": seed,
            },
        )

        # If FAST mode, run full workflow automatically
        if mode == DemoModeType.FAST:
            await self._run_fast_mode(session)

        return self._active_session

    async def _run_fast_mode(self, session: DemoSession) -> None:
        """Run all steps automatically up to AWAITING_APPROVAL."""
        while session.current_step_index < len(session.timeline) - 2 and session.status not in [
            DemoStatus.AWAITING_APPROVAL,
            DemoStatus.COMPLETED,
            DemoStatus.FAILED,
            DemoStatus.PAUSED,
        ]:
            await self.step_demo(session.session_id)

    async def step_demo(self, session_id: str, target_step_index: Optional[int] = None) -> DemoSession:
        """
        Advance demo state machine by one step or to target step index.
        """
        if not self._active_session or self._active_session.session_id != session_id:
            raise ValueError(f"Demo session '{session_id}' not found or inactive")

        session = self._active_session

        if session.status in [DemoStatus.COMPLETED, DemoStatus.FAILED, DemoStatus.CANCELLED]:
            return session

        current_idx = session.current_step_index
        next_idx = target_step_index if target_step_index is not None else current_idx + 1

        if next_idx >= len(session.timeline):
            return session

        start_time = time.perf_counter()
        target_step = session.timeline[next_idx]
        target_step.status = "IN_PROGRESS"

        # Update Session status according to stage
        stage_status_map = {
            DecisionStage.OBSERVING: DemoStatus.OBSERVING,
            DecisionStage.ANALYZING_RISK: DemoStatus.RISK_DETECTED,
            DecisionStage.RUNNING_SPECIALISTS: DemoStatus.SPECIALISTS_RUNNING,
            DecisionStage.COORDINATING: DemoStatus.COORDINATING,
            DecisionStage.ADVERSARIAL_TESTING: DemoStatus.ADVERSARY_RUNNING,
            DecisionStage.OPTIMIZING: DemoStatus.OPTIMIZING,
            DecisionStage.VERIFYING: DemoStatus.VERIFYING,
            DecisionStage.READY_FOR_APPROVAL: DemoStatus.AWAITING_APPROVAL,
        }
        session.status = stage_status_map.get(target_step.stage, DemoStatus.OBSERVING)

        # Emit Stage Started Realtime Event
        await event_bus.publish(
            event_type=EventType.STAGE_STARTED,
            source="DemoService",
            session_id=session.session_id,
            stage=target_step.stage.value,
            payload={"step_index": next_idx, "title": target_step.title},
        )

        # Execute backend stage logic via CockpitService
        try:
            if session.cockpit_session_id:
                cockpit_sess = await self.cockpit_service.run_stage(
                    session_id=session.cockpit_session_id,
                    target_stage=target_step.stage,
                )
                session.executive_summary = cockpit_sess.summary

                # Collect metrics & evidence
                target_step.key_metrics = {
                    "stage": target_step.stage.value,
                    "network_health": cockpit_sess.summary.network_health_score if cockpit_sess.summary else 0.0,
                    "risk_level": cockpit_sess.summary.critical_risk_count if cockpit_sess.summary else 0,
                }

            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            target_step.status = "COMPLETED"
            target_step.duration_ms = duration_ms
            target_step.summary = f"Executed {target_step.title} successfully"

            # Mark previous step as completed if needed
            session.timeline[current_idx].status = "COMPLETED"
            session.current_step_index = next_idx
            session.updated_at = datetime.now(timezone.utc)

            # If reached final stage (READY_FOR_APPROVAL), transition session to AWAITING_APPROVAL
            if target_step.stage == DecisionStage.READY_FOR_APPROVAL:
                session.status = DemoStatus.AWAITING_APPROVAL
                await event_bus.publish(
                    event_type=EventType.APPROVAL_REQUESTED,
                    source="DemoService",
                    session_id=session.session_id,
                    severity=EventSeverity.HIGH,
                    payload={"session_id": session.session_id, "title": "Human Executive Decision Required"},
                )

        except Exception as exc:
            logger.error(f"Error stepping demo session {session_id} at step {next_idx}: {exc}")
            target_step.status = "FAILED"
            session.status = DemoStatus.FAILED
            raise exc

        return session

    async def pause_demo(self, session_id: str) -> DemoSession:
        """Pause active demo execution."""
        if self._active_session and self._active_session.session_id == session_id:
            self._active_session.status = DemoStatus.PAUSED
            self._active_session.updated_at = datetime.now(timezone.utc)
        return self._active_session

    async def resume_demo(self, session_id: str) -> DemoSession:
        """Resume paused demo execution."""
        if self._active_session and self._active_session.session_id == session_id:
            self._active_session.status = DemoStatus.OBSERVING
            self._active_session.updated_at = datetime.now(timezone.utc)
            if self._active_session.mode == DemoModeType.FAST:
                await self._run_fast_mode(self._active_session)
        return self._active_session

    async def approve_plan(
        self,
        session_id: str,
        approver_name: str = "Chief Supply Chain Officer",
        decision_rationale: str = "Approved Plan C — Total Network Resilience",
        selected_plan_id: str = "Candidate C",
    ) -> DemoSession:
        """
        Execute human approval gate in Demo Mode and trigger Evaluation Engine.
        """
        if not self._active_session or self._active_session.session_id != session_id:
            raise ValueError(f"Demo session '{session_id}' not found")

        session = self._active_session

        # Approve linked Cockpit session
        if session.cockpit_session_id:
            cockpit_sess = self.cockpit_service.record_approval(
                session_id=session.cockpit_session_id,
                plan_id=selected_plan_id,
                approver=approver_name,
                rationale=decision_rationale,
            )
            session.executive_summary = cockpit_sess.summary

        # Run Phase 12 Evaluation Engine to calculate benchmark metrics
        try:
            eval_run = await self.evaluation_service.run_scenario(
                scenario_id="SCENARIO-08",
                seed=session.seed,
            )
            session.evaluation_run_id = eval_run.run_id
            session.evaluation_summary = eval_run.summary
        except Exception as e:
            logger.warning(f"Evaluation runner warning during demo approval: {e}")

        # Update session status
        session.status = DemoStatus.COMPLETED
        session.updated_at = datetime.now(timezone.utc)

        # Mark last step completed
        if session.timeline:
            session.timeline[-1].status = "COMPLETED"

        # Emit Realtime Demo Approved & Completed events
        await event_bus.publish(
            event_type=EventType.DECISION_APPROVED,
            source="DemoService",
            session_id=session.session_id,
            severity=EventSeverity.CRITICAL,
            payload={
                "approver": approver_name,
                "plan_selected": selected_plan_id,
                "rationale": decision_rationale,
            },
        )
        await event_bus.publish(
            event_type=EventType.SESSION_COMPLETED,
            source="DemoService",
            session_id=session.session_id,
            severity=EventSeverity.HIGH,
            payload={"session_id": session.session_id, "status": "COMPLETED"},
        )

        # Generate Competition Demo Report Artifacts
        DemoReportGenerator.generate_report(session)

        return session

    async def reject_plan(
        self,
        session_id: str,
        approver_name: str = "Chief Supply Chain Officer",
        decision_rationale: str = "Rejected due to unacceptable carbon emissions delta",
    ) -> DemoSession:
        """
        Execute human rejection in Demo Mode.
        """
        if not self._active_session or self._active_session.session_id != session_id:
            raise ValueError(f"Demo session '{session_id}' not found")

        session = self._active_session

        if session.cockpit_session_id:
            cockpit_sess = self.cockpit_service.record_rejection(
                session_id=session.cockpit_session_id,
                plan_id="Candidate C",
                approver=approver_name,
                rationale=decision_rationale,
            )
            session.executive_summary = cockpit_sess.summary

        session.status = DemoStatus.REJECTED
        session.updated_at = datetime.now(timezone.utc)

        await event_bus.publish(
            event_type=EventType.DECISION_REJECTED,
            source="DemoService",
            session_id=session.session_id,
            severity=EventSeverity.HIGH,
            payload={"approver": approver_name, "rationale": decision_rationale},
        )

        # Generate Competition Demo Report Artifacts
        DemoReportGenerator.generate_report(session)

        return session

    def get_report(self, session_id: str) -> DemoReport:
        """Get or generate DemoReport for a session."""
        if not self._active_session or self._active_session.session_id != session_id:
            raise ValueError(f"Demo session '{session_id}' not found")
        return DemoReportGenerator.generate_report(self._active_session)

    def reset_demo(self) -> None:
        """Reset Demo Engine state and world repository to clean baseline."""
        self.world_repo.reset_world()
        self.risk_repo.reset_risk_state()
        if self._active_session:
            self._active_session.status = DemoStatus.RESET
        self._active_session = None
        logger.info("Demo Service reset to clean baseline state.")
