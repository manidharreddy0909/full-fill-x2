"""
FULFILL-X Digital Twin & Monte Carlo Database Models (Phase 8)
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, JSON, DateTime
from datetime import datetime
from app.db.session import Base


class DigitalTwinRecordModel(Base):
    __tablename__ = "digital_twins"

    twin_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    world_snapshot_id = Column(String, nullable=False)
    graph_snapshot_id = Column(String, nullable=False)
    twin_version = Column(String, default="1.0.0")
    seed = Column(Integer, default=42)
    mode = Column(String, default="SIMULATION")
    production_mutation = Column(Boolean, default=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)


class SimulationRunRecordModel(Base):
    __tablename__ = "simulation_runs"

    run_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    twin_id = Column(String, nullable=False, index=True)
    scenario_id = Column(String, nullable=False, index=True)
    seed = Column(Integer, nullable=False)
    horizon_hours = Column(Integer, nullable=False)
    overall_service_level = Column(Float, nullable=False)
    total_backlog = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    recovery_time_hours = Column(Float, nullable=False)
    time_to_failure_hours = Column(Float, nullable=True)
    max_disrupted_nodes = Column(Integer, nullable=False)
    stockout_occurred = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MonteCarloResultRecordModel(Base):
    __tablename__ = "monte_carlo_results"

    mc_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    twin_id = Column(String, nullable=False, index=True)
    scenario_id = Column(String, nullable=False, index=True)
    n_simulations = Column(Integer, nullable=False)
    seed = Column(Integer, nullable=False)
    horizon_hours = Column(Integer, nullable=False)
    execution_time_sec = Column(Float, nullable=False)
    resilience_score = Column(Float, nullable=False)
    service_p50 = Column(Float, nullable=False)
    cost_cvar95 = Column(Float, nullable=False)
    ttr_p90 = Column(Float, nullable=False)
    stockout_prob = Column(Float, nullable=False)
    metrics_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class StrategyComparisonRecordModel(Base):
    __tablename__ = "strategy_comparisons"

    comparison_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    scenario_id = Column(String, nullable=False)
    recommended_strategy_id = Column(String, nullable=False)
    baseline_summary = Column(JSON, nullable=False)
    candidates_summary = Column(JSON, nullable=False)
    trade_offs = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TwinCalibrationRecordModel(Base):
    __tablename__ = "twin_calibrations"

    calibration_id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, default="org-fulfillx-default")
    twin_id = Column(String, nullable=False, index=True)
    world_snapshot_id = Column(String, nullable=False)
    mae_service_level = Column(Float, nullable=False)
    rmse_service_level = Column(Float, nullable=False)
    recovery_time_error_hours = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
