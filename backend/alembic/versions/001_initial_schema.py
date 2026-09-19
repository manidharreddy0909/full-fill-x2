"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-19 23:59:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. world_snapshots
    op.create_table(
        'world_snapshots',
        sa.Column('snapshot_id', sa.String(length=64), primary_key=True),
        sa.Column('seed', sa.Integer(), nullable=False, server_default='42'),
        sa.Column('preset', sa.String(length=32), nullable=False, server_default='healthy'),
        sa.Column('total_nodes', sa.Integer(), nullable=False),
        sa.Column('total_edges', sa.Integer(), nullable=False),
        sa.Column('network_health_score', sa.Float(), nullable=False),
        sa.Column('data_payload', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_world_snapshots_seed_preset', 'world_snapshots', ['seed', 'preset'])
    op.create_index('idx_world_snapshots_created_at', 'world_snapshots', ['created_at'])

    # 2. signals
    op.create_table(
        'signals',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('signal_type', sa.String(length=64), nullable=False),
        sa.Column('severity', sa.String(length=32), nullable=False),
        sa.Column('title', sa.String(length=256), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('source', sa.String(length=128), nullable=False, server_default='system'),
        sa.Column('region', sa.String(length=64), nullable=True),
        sa.Column('affected_node_ids', sa.JSON(), nullable=False),
        sa.Column('affected_edge_ids', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('dedupe_hash', sa.String(length=64), nullable=True),
        sa.Column('schema_version', sa.String(length=16), nullable=False, server_default='v1.0'),
        sa.Column('observed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_signals_type_severity', 'signals', ['signal_type', 'severity'])
    op.create_index('idx_signals_status', 'signals', ['status'])
    op.create_index('idx_signals_created_at', 'signals', ['created_at'])
    op.create_index('idx_signals_dedupe_hash', 'signals', ['dedupe_hash'])

    # 3. risk_snapshots
    op.create_table(
        'risk_snapshots',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('world_seed', sa.Integer(), nullable=False, server_default='42'),
        sa.Column('risk_level', sa.String(length=32), nullable=False),
        sa.Column('average_risk', sa.Float(), nullable=False),
        sa.Column('node_risks', sa.JSON(), nullable=False),
        sa.Column('explanations', sa.JSON(), nullable=False),
        sa.Column('propagation_paths', sa.JSON(), nullable=False),
        sa.Column('engine_version', sa.String(length=16), nullable=False, server_default='v1.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_risk_snapshots_seed', 'risk_snapshots', ['world_seed'])
    op.create_index('idx_risk_snapshots_created_at', 'risk_snapshots', ['created_at'])

    # 4. scenarios
    op.create_table(
        'scenarios',
        sa.Column('scenario_id', sa.String(length=64), primary_key=True),
        sa.Column('scenario_type', sa.String(length=64), nullable=False),
        sa.Column('seed', sa.Integer(), nullable=False, server_default='42'),
        sa.Column('trigger', sa.String(length=256), nullable=False),
        sa.Column('affected_entities', sa.JSON(), nullable=False),
        sa.Column('parameters', sa.JSON(), nullable=False),
        sa.Column('fingerprint', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_scenarios_fingerprint', 'scenarios', ['fingerprint'])

    # 5. agent_proposals
    op.create_table(
        'agent_proposals',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('agent_type', sa.String(length=64), nullable=False),
        sa.Column('objective', sa.String(length=256), nullable=False),
        sa.Column('actions', sa.JSON(), nullable=False),
        sa.Column('estimated_cost', sa.Float(), nullable=False),
        sa.Column('delay_hours', sa.Float(), nullable=False),
        sa.Column('carbon_impact', sa.Float(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('reasoning', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_agent_proposals_session', 'agent_proposals', ['session_id'])

    # 6. candidate_plans
    op.create_table(
        'candidate_plans',
        sa.Column('plan_id', sa.String(length=64), primary_key=True),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('candidate_name', sa.String(length=128), nullable=False),
        sa.Column('metrics', sa.JSON(), nullable=False),
        sa.Column('constraints', sa.JSON(), nullable=False),
        sa.Column('pareto_points', sa.JSON(), nullable=False),
        sa.Column('robustness_score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_candidate_plans_session', 'candidate_plans', ['session_id'])

    # 7. verification_reports
    op.create_table(
        'verification_reports',
        sa.Column('report_id', sa.String(length=64), primary_key=True),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('plan_id', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('pass_rate', sa.Float(), nullable=False),
        sa.Column('passed_checks', sa.Integer(), nullable=False),
        sa.Column('total_checks', sa.Integer(), nullable=False),
        sa.Column('findings', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_verification_reports_session', 'verification_reports', ['session_id'])

    # 8. approval_decisions
    op.create_table(
        'approval_decisions',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('plan_id', sa.String(length=64), nullable=False),
        sa.Column('plan_name', sa.String(length=128), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('approver', sa.String(length=128), nullable=False),
        sa.Column('rationale', sa.Text(), nullable=False),
        sa.Column('applied_actions', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_approval_decisions_session', 'approval_decisions', ['session_id'])

    # 9. evaluation_runs
    op.create_table(
        'evaluation_runs',
        sa.Column('run_id', sa.String(length=64), primary_key=True),
        sa.Column('scenario_id', sa.String(length=64), nullable=False),
        sa.Column('seed', sa.Integer(), nullable=False),
        sa.Column('final_health', sa.Float(), nullable=False),
        sa.Column('final_risk', sa.Float(), nullable=False),
        sa.Column('resilience_score', sa.Float(), nullable=False),
        sa.Column('slr', sa.Float(), nullable=False),
        sa.Column('step_count', sa.Integer(), nullable=False),
        sa.Column('metrics', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_evaluation_runs_scenario', 'evaluation_runs', ['scenario_id'])

    # 10. audit_events
    op.create_table(
        'audit_events',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('session_id', sa.String(length=64), nullable=True),
        sa.Column('actor', sa.String(length=128), nullable=False),
        sa.Column('stage', sa.String(length=64), nullable=False),
        sa.Column('action', sa.String(length=128), nullable=False),
        sa.Column('details', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_audit_events_session', 'audit_events', ['session_id'])

    # 11. event_history
    op.create_table(
        'event_history',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('event_type', sa.String(length=64), nullable=False),
        sa.Column('sequence', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(length=64), nullable=True),
        sa.Column('stage', sa.String(length=64), nullable=True),
        sa.Column('source', sa.String(length=128), nullable=False),
        sa.Column('severity', sa.String(length=32), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('correlation_id', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_event_history_type', 'event_history', ['event_type'])
    op.create_index('idx_event_history_session', 'event_history', ['session_id'])

    # 12. data_provenance
    op.create_table(
        'data_provenance',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('entity_id', sa.String(length=64), nullable=False),
        sa.Column('entity_type', sa.String(length=64), nullable=False),
        sa.Column('source_type', sa.String(length=32), nullable=False),
        sa.Column('source_url', sa.String(length=256), nullable=True),
        sa.Column('collector', sa.String(length=128), nullable=False),
        sa.Column('ingested_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('observed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('license', sa.String(length=64), nullable=False),
        sa.Column('parser_version', sa.String(length=16), nullable=False),
        sa.Column('schema_version', sa.String(length=16), nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_data_provenance_entity', 'data_provenance', ['entity_id'])
    op.create_index('idx_data_provenance_hash', 'data_provenance', ['content_hash'])


def downgrade() -> None:
    op.drop_table('data_provenance')
    op.drop_table('event_history')
    op.drop_table('audit_events')
    op.drop_table('evaluation_runs')
    op.drop_table('approval_decisions')
    op.drop_table('verification_reports')
    op.drop_table('candidate_plans')
    op.drop_table('agent_proposals')
    op.drop_table('scenarios')
    op.drop_table('risk_snapshots')
    op.drop_table('signals')
    op.drop_table('world_snapshots')
