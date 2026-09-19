"""
FULFILL-X Enterprise Multi-Tenancy & Resilience OS SQLAlchemy ORM Models (Phase 10)
Defines Workspace, WorkspaceMembership, PolicyDefinition, PolicyEvaluation,
ExecutionRecord, ResilienceCycle, and ExecutiveDecisionRecord tables.
"""
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import Dict, Any, Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.models.db import Base


class WorkspaceType(str, PyEnum):
    PRODUCTION = "PRODUCTION"
    SIMULATION = "SIMULATION"
    SANDBOX = "SANDBOX"


class PolicyViolationAction(str, PyEnum):
    PASS = "PASS"
    WARN = "WARN"
    BLOCK = "BLOCK"


class ExecutionMode(str, PyEnum):
    DRY_RUN = "DRY_RUN"
    SIMULATED = "SIMULATED"
    LIVE = "LIVE"


class ExecutionStatus(str, PyEnum):
    PENDING = "PENDING"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class CycleStage(str, PyEnum):
    IDLE = "IDLE"
    OBSERVING = "OBSERVING"
    INTELLIGENCE_READY = "INTELLIGENCE_READY"
    RISK_ASSESSMENT = "RISK_ASSESSMENT"
    SCENARIO_GENERATION = "SCENARIO_GENERATION"
    SIMULATION = "SIMULATION"
    AGENT_DELIBERATION = "AGENT_DELIBERATION"
    ADVERSARIAL_TEST = "ADVERSARIAL_TEST"
    PLAN_OPTIMIZATION = "PLAN_OPTIMIZATION"
    VERIFICATION = "VERIFICATION"
    HUMAN_APPROVAL = "HUMAN_APPROVAL"
    EXECUTION_READY = "EXECUTION_READY"
    EXECUTING = "EXECUTING"
    OUTCOME_CAPTURE = "OUTCOME_CAPTURE"
    LEARNING = "LEARNING"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    DEGRADED = "DEGRADED"


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(64), primary_key=True, default=lambda: f"ws-{uuid4().hex[:10]}")
    organization_id = Column(String(64), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    type = Column(Enum(WorkspaceType), default=WorkspaceType.PRODUCTION, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class WorkspaceMembership(Base):
    __tablename__ = "workspace_memberships"

    id = Column(String(64), primary_key=True, default=lambda: f"wsm-{uuid4().hex[:10]}")
    workspace_id = Column(String(64), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(64), default="OPERATOR", nullable=False)
    joined_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class PolicyDefinition(Base):
    __tablename__ = "policy_definitions"

    id = Column(String(64), primary_key=True, default=lambda: f"pol-{uuid4().hex[:10]}")
    organization_id = Column(String(64), nullable=False, index=True)
    workspace_id = Column(String(64), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    policy_type = Column(String(64), nullable=False)  # max_cost, min_service_level, min_resilience, etc.
    threshold_value = Column(Float, nullable=False)
    action_on_violation = Column(Enum(PolicyViolationAction), default=PolicyViolationAction.BLOCK, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class PolicyEvaluationModel(Base):
    __tablename__ = "policy_evaluations"

    id = Column(String(64), primary_key=True, default=lambda: f"peval-{uuid4().hex[:10]}")
    organization_id = Column(String(64), nullable=False, index=True)
    workspace_id = Column(String(64), nullable=False, index=True)
    policy_id = Column(String(64), nullable=False, index=True)
    decision_id = Column(String(64), nullable=False, index=True)
    observed_value = Column(Float, nullable=False)
    status = Column(Enum(PolicyViolationAction), nullable=False)
    explanation = Column(Text, nullable=False)
    evaluated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class ExecutionRecordModel(Base):
    __tablename__ = "execution_records"

    id = Column(String(64), primary_key=True, default=lambda: f"exec-{uuid4().hex[:10]}")
    organization_id = Column(String(64), nullable=False, index=True)
    workspace_id = Column(String(64), nullable=False, index=True)
    decision_id = Column(String(64), nullable=False, index=True)
    execution_mode = Column(Enum(ExecutionMode), default=ExecutionMode.DRY_RUN, nullable=False)
    status = Column(Enum(ExecutionStatus), default=ExecutionStatus.PENDING, nullable=False)
    authorized_by = Column(String(128), nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    result_summary = Column(Text, nullable=True)


class ResilienceCycleModel(Base):
    __tablename__ = "resilience_cycles"

    id = Column(String(64), primary_key=True, default=lambda: f"cyc-{uuid4().hex[:10]}")
    organization_id = Column(String(64), nullable=False, index=True)
    workspace_id = Column(String(64), nullable=False, index=True)
    environment_id = Column(String(64), default="env-production", nullable=False)
    stage = Column(Enum(CycleStage), default=CycleStage.IDLE, nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    resilience_score = Column(Float, default=0.85, nullable=False)
    evidence_summary = Column(Text, nullable=True)


class ExecutiveDecisionRecordModel(Base):
    __tablename__ = "executive_decision_records"

    id = Column(String(64), primary_key=True, default=lambda: f"edrec-{uuid4().hex[:10]}")
    organization_id = Column(String(64), nullable=False, index=True)
    workspace_id = Column(String(64), nullable=False, index=True)
    decision_id = Column(String(64), nullable=False, index=True, unique=True)
    summary = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)
    risk_level = Column(String(32), default="MEDIUM", nullable=False)
    resilience_score = Column(Float, default=0.85, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
