"""
FULFILL-X Graph & Causal Intelligence Database Models (Phase 7)
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, JSON, DateTime
from datetime import datetime
from app.db.base import Base


class GraphSnapshotModel(Base):
    __tablename__ = "graph_snapshots"

    snapshot_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    world_seed = Column(Integer, default=42)
    node_count = Column(Integer, nullable=False)
    edge_count = Column(Integer, nullable=False)
    graph_version = Column(String, default="1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)


class GraphModelRecordModel(Base):
    __tablename__ = "graph_model_records"

    model_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    model_name = Column(String, nullable=False)
    task_type = Column(String, nullable=False)
    model_version = Column(String, nullable=False)
    state = Column(String, default="ACTIVE")
    baseline_metric = Column(Float, nullable=False)
    gnn_metric = Column(Float, nullable=False)
    is_gnn_preferred = Column(Boolean, default=True)
    checksum = Column(String, nullable=False)
    artifact_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class GraphPredictionRecordModel(Base):
    __tablename__ = "graph_predictions"

    prediction_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    task_type = Column(String, nullable=False)
    target_id = Column(String, nullable=False, index=True)
    predicted_risk = Column(Float, nullable=False)
    horizon_hours = Column(Integer, default=24)
    lower_bound_95 = Column(Float, nullable=False)
    upper_bound_95 = Column(Float, nullable=False)
    model_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class PropagationTraceRecordModel(Base):
    __tablename__ = "propagation_traces"

    trace_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    origin_node_id = Column(String, nullable=False, index=True)
    depth = Column(Integer, nullable=False)
    propagation_probability = Column(Float, nullable=False)
    affected_nodes = Column(JSON, nullable=False)
    affected_edges = Column(JSON, nullable=False)
    expected_impact = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class CausalHypothesisRecordModel(Base):
    __tablename__ = "causal_hypotheses"

    hypothesis_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    cause_node_id = Column(String, nullable=False, index=True)
    effect_node_id = Column(String, nullable=False, index=True)
    propagation_path = Column(JSON, nullable=False)
    confidence = Column(Float, nullable=False)
    causal_status = Column(String, nullable=False)
    assumptions = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class CounterfactualRunModel(Base):
    __tablename__ = "counterfactual_runs"

    run_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    target_node_id = Column(String, nullable=False, index=True)
    parameter_overrides = Column(JSON, nullable=False)
    baseline_network_risk = Column(Float, nullable=False)
    counterfactual_network_risk = Column(Float, nullable=False)
    risk_delta = Column(Float, nullable=False)
    service_delta = Column(Float, nullable=False)
    cost_delta = Column(Float, nullable=False)
    execution_time_ms = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
