"""
FULFILL-X Multi-Agent Resilience & Continuous Learning Master Service (Phase 9)
Master singleton orchestrator bridging multi-agent deliberation, structured memory,
agent calibration, outcome capture, feedback generation, continuous learning, and Challenger governance.
Dispatches real-time events via EventTransport.
"""
from typing import Dict, List, Optional, Tuple
from app.agents.resilience.deliberation import DeliberationOrchestrator
from app.agents.resilience.evaluation import PolicyEvaluator
from app.agents.resilience.feedback import FeedbackEngine
from app.agents.resilience.learning import ContinuousLearningPipeline
from app.agents.resilience.memory import AgentMemoryEngine
from app.agents.resilience.outcomes import OutcomeEngine
from app.agents.resilience.performance import AgentPerformanceTracker
from app.agents.resilience.schemas import (
    AgentMemory,
    AgentPerformanceRecord,
    ChallengerModelRecord,
    DeliberationSession,
    FeedbackRecord,
    LearningDataset,
    LearningRunResult,
    MemoryStatus,
    MemoryType,
    OutcomeRecord,
    PolicyEvaluationRecord,
)
from app.realtime.event_bus import event_bus, EventBus
from app.schemas.events import EventEnvelope, EventSeverity, EventType


class MultiAgentResilienceService:
    """
    Master singleton orchestrator for Phase 9 Multi-Agent Resilience & Continuous Learning.
    """

    _instance: Optional["MultiAgentResilienceService"] = None

    def __init__(self, event_bus_inst: Optional[EventBus] = None):
        self.event_bus = event_bus_inst or event_bus
        self.memory_engine = AgentMemoryEngine()
        self.performance_tracker = AgentPerformanceTracker()
        self.deliberation_orchestrator = DeliberationOrchestrator(max_rounds=3)
        self.outcome_engine = OutcomeEngine()
        self.feedback_engine = FeedbackEngine()
        self.learning_pipeline = ContinuousLearningPipeline()
        self.policy_evaluator = PolicyEvaluator()

    @classmethod
    def get_instance(cls) -> "MultiAgentResilienceService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # 1. Deliberation & Debate
    def deliberate(
        self,
        organization_id: str = "org-fulfillx-default",
        target_node_ids: Optional[List[str]] = None,
        specialist_proposals: Optional[List[dict]] = None,
    ) -> DeliberationSession:
        session = self.deliberation_orchestrator.deliberate(
            organization_id=organization_id,
            target_node_ids=target_node_ids,
            specialist_proposals=specialist_proposals,
        )
        self._publish_event(
            EventType.DELIBERATION_COMPLETED,
            payload={
                "deliberation_id": session.deliberation_id,
                "consensus_status": session.consensus_status.value,
                "rounds_count": len(session.rounds),
            },
        )
        return session

    # 2. Agent Memory & Provenance
    def add_memory(
        self,
        agent_id: str,
        lesson: str,
        organization_id: str = "org-fulfillx-default",
        memory_type: MemoryType = MemoryType.LESSON,
        event_reference: Optional[str] = None,
        confidence: float = 0.8,
    ) -> AgentMemory:
        mem = self.memory_engine.add_memory(
            agent_id=agent_id,
            lesson=lesson,
            organization_id=organization_id,
            memory_type=memory_type,
            event_reference=event_reference,
            confidence=confidence,
        )
        self._publish_event(
            EventType.AGENT_MEMORY_CREATED,
            payload={"memory_id": mem.memory_id, "agent_id": agent_id, "lesson": lesson},
        )
        return mem

    def query_memories(
        self,
        organization_id: str = "org-fulfillx-default",
        agent_id: Optional[str] = None,
        memory_type: Optional[MemoryType] = None,
    ) -> List[AgentMemory]:
        return self.memory_engine.query_memories(
            organization_id=organization_id,
            agent_id=agent_id,
            memory_type=memory_type,
        )

    def validate_memory(self, memory_id: str) -> Optional[AgentMemory]:
        mem = self.memory_engine.validate_lesson(memory_id)
        if mem:
            self._publish_event(
                EventType.AGENT_LESSON_VALIDATED,
                payload={"memory_id": memory_id, "confidence": mem.confidence},
            )
        return mem

    # 3. Agent Performance & Calibration
    def get_agent_performance(self, agent_id: str) -> Optional[AgentPerformanceRecord]:
        return self.performance_tracker.get_performance(agent_id)

    def get_all_agent_performance(self) -> List[AgentPerformanceRecord]:
        return self.performance_tracker.get_all_performance()

    # 4. Outcome Capture & Feedback Engine
    def record_outcome(
        self,
        decision_id: str,
        expected_service_level: float,
        actual_service_level: float,
        expected_cost: float,
        actual_cost: float,
        expected_recovery_hours: float,
        actual_recovery_hours: float,
        organization_id: str = "org-fulfillx-default",
    ) -> Tuple[OutcomeRecord, FeedbackRecord]:
        outcome = self.outcome_engine.record_outcome(
            decision_id=decision_id,
            expected_service_level=expected_service_level,
            actual_service_level=actual_service_level,
            expected_cost=expected_cost,
            actual_cost=actual_cost,
            expected_recovery_hours=expected_recovery_hours,
            actual_recovery_hours=actual_recovery_hours,
            organization_id=organization_id,
        )
        feedback = self.feedback_engine.generate_feedback(outcome)

        self._publish_event(
            EventType.OUTCOME_RECORDED,
            payload={
                "outcome_id": outcome.outcome_id,
                "service_deviation": outcome.service_deviation,
                "cost_deviation": outcome.cost_deviation,
            },
        )
        self._publish_event(
            EventType.FEEDBACK_RECORDED,
            payload={
                "feedback_id": feedback.feedback_id,
                "feedback_type": feedback.feedback_type.value,
                "accuracy_score": feedback.accuracy_score,
            },
        )
        return outcome, feedback

    def list_outcomes(self, organization_id: str = "org-fulfillx-default") -> List[OutcomeRecord]:
        return self.outcome_engine.list_outcomes(organization_id=organization_id)

    def list_feedback(self, organization_id: str = "org-fulfillx-default") -> List[FeedbackRecord]:
        return self.feedback_engine.list_feedback(organization_id=organization_id)

    # 5. Continuous Learning & Challenger Governance
    def train_challenger(
        self,
        dataset_name: str = "DemandOutcomeDataset",
        model_name: str = "DemandForecastModel",
        organization_id: str = "org-fulfillx-default",
    ) -> Tuple[ChallengerModelRecord, LearningRunResult]:
        outcomes = self.list_outcomes(organization_id=organization_id)
        dataset = self.learning_pipeline.create_dataset(
            name=dataset_name,
            outcomes=outcomes,
            organization_id=organization_id,
        )
        chal_record, run_res = self.learning_pipeline.train_challenger(
            dataset_id=dataset.dataset_id,
            model_name=model_name,
            organization_id=organization_id,
        )
        self._publish_event(
            EventType.MODEL_CHALLENGER_CREATED,
            payload={
                "challenger_id": chal_record.challenger_id,
                "model_name": model_name,
                "version": chal_record.version,
                "is_improvement": run_res.is_improvement,
            },
        )
        return chal_record, run_res

    def activate_challenger(
        self,
        challenger_id: str,
        approved_by: str = "Head of AI Operations",
        activation_reason: str = "Validated lower MAE baseline improvement",
    ) -> ChallengerModelRecord:
        record = self.learning_pipeline.activate_challenger(
            challenger_id=challenger_id,
            approved_by=approved_by,
            activation_reason=activation_reason,
        )
        self._publish_event(
            EventType.MODEL_PROMOTED,
            payload={
                "challenger_id": challenger_id,
                "model_name": record.model_name,
                "version": record.version,
                "approved_by": approved_by,
            },
        )
        return record

    def rollback_model(self, model_name: str, approved_by: str = "Head of Operations") -> str:
        prev_id = self.learning_pipeline.rollback_model(model_name=model_name, approved_by=approved_by)
        self._publish_event(
            EventType.MODEL_ROLLBACK,
            payload={"model_name": model_name, "reverted_to_model_id": prev_id},
        )
        return prev_id

    def evaluate_policy(
        self,
        situation: dict,
        candidate_actions: list,
    ) -> PolicyEvaluationRecord:
        return self.policy_evaluator.evaluate_policy(
            situation=situation,
            candidate_actions=candidate_actions,
        )

    def _publish_event(self, event_type: EventType, payload: dict):
        try:
            import asyncio
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(
                    self.event_bus.publish(
                        event_type=event_type,
                        payload=payload,
                        source="MultiAgentResilienceService",
                        severity=EventSeverity.INFO,
                    )
                )
            except RuntimeError:
                pass
        except Exception:
            pass
