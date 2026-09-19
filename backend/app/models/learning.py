"""
FULFILL-X Multi-Agent & Continuous Learning Database Models (Phase 9)
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, JSON, DateTime
from datetime import datetime
from app.db.session import Base


class AgentMemoryModel(Base):
    __tablename__ = "agent_memories"

    memory_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    agent_id = Column(String, nullable=False, index=True)
    memory_type = Column(String, nullable=False)
    event_reference = Column(String, nullable=True)
    context_json = Column(JSON, nullable=False)
    decision_json = Column(JSON, nullable=False)
    expected_outcome = Column(JSON, nullable=False)
    actual_outcome = Column(JSON, nullable=True)
    lesson = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    source = Column(String, nullable=False)
    decay_factor = Column(Float, default=1.0)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentPerformanceModel(Base):
    __tablename__ = "agent_performance"

    agent_id = Column(String, primary_key=True, index=True)
    agent_name = Column(String, nullable=False)
    proposals_count = Column(Integer, default=0)
    valid_proposals_count = Column(Integer, default=0)
    verification_success_count = Column(Integer, default=0)
    mean_predicted_impact = Column(Float, default=0.0)
    mean_observed_impact = Column(Float, default=0.0)
    calibration_mae = Column(Float, default=0.0)
    calibration_rmse = Column(Float, default=0.0)
    simulation_agreement_score = Column(Float, default=0.85)
    adversarial_survival_rate = Column(Float, default=0.88)
    updated_at = Column(DateTime, default=datetime.utcnow)


class DeliberationSessionModel(Base):
    __tablename__ = "deliberation_sessions"

    deliberation_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    target_nodes_json = Column(JSON, nullable=False)
    rounds_json = Column(JSON, nullable=False)
    evidence_bundle_json = Column(JSON, nullable=False)
    consensus_status = Column(String, nullable=False)
    final_recommendation = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class OutcomeRecordModel(Base):
    __tablename__ = "outcome_records"

    outcome_id = Column(String, primary_key=True, index=True)
    decision_id = Column(String, nullable=False, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    expected_service_level = Column(Float, nullable=False)
    actual_service_level = Column(Float, nullable=False)
    expected_cost = Column(Float, nullable=False)
    actual_cost = Column(Float, nullable=False)
    expected_recovery_hours = Column(Float, nullable=False)
    actual_recovery_hours = Column(Float, nullable=False)
    service_deviation = Column(Float, nullable=False)
    cost_deviation = Column(Float, nullable=False)
    recovery_deviation = Column(Float, nullable=False)
    attribution_json = Column(JSON, nullable=False)
    observed_at = Column(DateTime, default=datetime.utcnow)


class FeedbackRecordModel(Base):
    __tablename__ = "feedback_records"

    feedback_id = Column(String, primary_key=True, index=True)
    outcome_id = Column(String, nullable=False, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    feedback_type = Column(String, nullable=False)
    accuracy_score = Column(Float, nullable=False)
    comments = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class LearningDatasetModel(Base):
    __tablename__ = "learning_datasets"

    dataset_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    record_count = Column(Integer, nullable=False)
    checksum = Column(String, nullable=False)
    data_origin = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class LearningRunModel(Base):
    __tablename__ = "learning_runs"

    run_id = Column(String, primary_key=True, index=True)
    dataset_id = Column(String, nullable=False, index=True)
    model_name = Column(String, nullable=False)
    train_mae = Column(Float, nullable=False)
    val_mae = Column(Float, nullable=False)
    train_rmse = Column(Float, nullable=False)
    val_rmse = Column(Float, nullable=False)
    baseline_mae = Column(Float, nullable=False)
    is_improvement = Column(Boolean, default=False)
    execution_time_sec = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChallengerModelRecordModel(Base):
    __tablename__ = "challenger_models"

    challenger_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    model_name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    active_model_id = Column(String, nullable=False)
    baseline_metric = Column(Float, nullable=False)
    challenger_metric = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    checksum = Column(String, nullable=False)
    artifact_path = Column(String, nullable=False)
    activation_reason = Column(String, nullable=True)
    approved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentLessonModel(Base):
    __tablename__ = "agent_lessons"

    lesson_id = Column(String, primary_key=True, index=True)
    agent_id = Column(String, nullable=False, index=True)
    lesson_text = Column(String, nullable=False)
    evidence_count = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    validated_at = Column(DateTime, default=datetime.utcnow)
