"""
FULFILL-X ORM Database Models (Phase 2)
SQLAlchemy 2.0 Declarative Models matching docs/DATA_MODEL.md
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    JSON,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class WorldSnapshotModel(Base):
    __tablename__ = "world_snapshots"

    snapshot_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    seed: Mapped[int] = mapped_column(Integer, nullable=False, default=42)
    preset: Mapped[str] = mapped_column(String(32), nullable=False, default="healthy")
    total_nodes: Mapped[int] = mapped_column(Integer, nullable=False)
    total_edges: Mapped[int] = mapped_column(Integer, nullable=False)
    network_health_score: Mapped[float] = mapped_column(Float, nullable=False)
    data_payload: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        Index("idx_world_snapshots_seed_preset", "seed", "preset"),
        Index("idx_world_snapshots_created_at", "created_at"),
    )


class SignalModel(Base):
    __tablename__ = "signals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    signal_type: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    source: Mapped[str] = mapped_column(String(128), nullable=False, default="system")
    region: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    affected_node_ids: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    affected_edge_ids: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ACTIVE")
    dedupe_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    schema_version: Mapped[str] = mapped_column(String(16), nullable=False, default="v1.0")
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        Index("idx_signals_type_severity", "signal_type", "severity"),
        Index("idx_signals_status", "status"),
        Index("idx_signals_created_at", "created_at"),
    )


class RiskSnapshotModel(Base):
    __tablename__ = "risk_snapshots"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    world_seed: Mapped[int] = mapped_column(Integer, nullable=False, default=42)
    risk_level: Mapped[str] = mapped_column(String(32), nullable=False)
    average_risk: Mapped[float] = mapped_column(Float, nullable=False)
    node_risks: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    explanations: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    propagation_paths: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    engine_version: Mapped[str] = mapped_column(String(16), nullable=False, default="v1.0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        Index("idx_risk_snapshots_seed", "world_seed"),
        Index("idx_risk_snapshots_created_at", "created_at"),
    )


class ScenarioModel(Base):
    __tablename__ = "scenarios"

    scenario_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    scenario_type: Mapped[str] = mapped_column(String(64), nullable=False)
    seed: Mapped[int] = mapped_column(Integer, nullable=False, default=42)
    trigger: Mapped[str] = mapped_column(String(256), nullable=False)
    affected_entities: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class AgentProposalModel(Base):
    __tablename__ = "agent_proposals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    agent_type: Mapped[str] = mapped_column(String(64), nullable=False)
    objective: Mapped[str] = mapped_column(String(256), nullable=False)
    actions: Mapped[List[Any]] = mapped_column(JSON, nullable=False)
    estimated_cost: Mapped[float] = mapped_column(Float, nullable=False)
    delay_hours: Mapped[float] = mapped_column(Float, nullable=False)
    carbon_impact: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    reasoning: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CandidatePlanModel(Base):
    __tablename__ = "candidate_plans"

    plan_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    candidate_name: Mapped[str] = mapped_column(String(128), nullable=False)
    metrics: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    constraints: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    pareto_points: Mapped[List[Any]] = mapped_column(JSON, nullable=False)
    robustness_score: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class VerificationReportModel(Base):
    __tablename__ = "verification_reports"

    report_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    plan_id: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    pass_rate: Mapped[float] = mapped_column(Float, nullable=False)
    passed_checks: Mapped[int] = mapped_column(Integer, nullable=False)
    total_checks: Mapped[int] = mapped_column(Integer, nullable=False)
    findings: Mapped[List[Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class ApprovalDecisionModel(Base):
    __tablename__ = "approval_decisions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    plan_id: Mapped[str] = mapped_column(String(64), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    approver: Mapped[str] = mapped_column(String(128), nullable=False)
    rationale: Mapped[Text] = mapped_column(Text, nullable=False)
    applied_actions: Mapped[List[Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class EvaluationRunModel(Base):
    __tablename__ = "evaluation_runs"

    run_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    seed: Mapped[int] = mapped_column(Integer, nullable=False)
    final_health: Mapped[float] = mapped_column(Float, nullable=False)
    final_risk: Mapped[float] = mapped_column(Float, nullable=False)
    resilience_score: Mapped[float] = mapped_column(Float, nullable=False)
    slr: Mapped[float] = mapped_column(Float, nullable=False)
    step_count: Mapped[int] = mapped_column(Integer, nullable=False)
    metrics: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class AuditEventModel(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    actor: Mapped[str] = mapped_column(String(128), nullable=False)
    stage: Mapped[str] = mapped_column(String(64), nullable=False)
    action: Mapped[str] = mapped_column(String(128), nullable=False)
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class EventHistoryModel(Base):
    __tablename__ = "event_history"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    session_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    stage: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source: Mapped[str] = mapped_column(String(128), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    correlation_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class DataProvenanceModel(Base):
    __tablename__ = "data_provenance"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False)  # "synthetic" or "external"
    source_url: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    collector: Mapped[str] = mapped_column(String(128), nullable=False, default="FULFILL-X")
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    license: Mapped[str] = mapped_column(String(64), nullable=False, default="MIT")
    parser_version: Mapped[str] = mapped_column(String(16), nullable=False, default="v1.0")
    schema_version: Mapped[str] = mapped_column(String(16), nullable=False, default="v1.0")
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
