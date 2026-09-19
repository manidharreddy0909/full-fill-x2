"""006_gnn_causal_intelligence

Revision ID: 006_gnn_causal_intelligence
Revises: 005_predictive_ml_platform
Create Date: 2026-09-20 03:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006_gnn_causal_intelligence'
down_revision = '005_predictive_ml_platform'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'graph_snapshots',
        sa.Column('snapshot_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('world_seed', sa.Integer(), nullable=True),
        sa.Column('node_count', sa.Integer(), nullable=False),
        sa.Column('edge_count', sa.Integer(), nullable=False),
        sa.Column('graph_version', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('snapshot_id')
    )
    op.create_index(op.f('ix_graph_snapshots_organization_id'), 'graph_snapshots', ['organization_id'], unique=False)

    op.create_table(
        'graph_model_records',
        sa.Column('model_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('task_type', sa.String(), nullable=False),
        sa.Column('model_version', sa.String(), nullable=False),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('baseline_metric', sa.Float(), nullable=False),
        sa.Column('gnn_metric', sa.Float(), nullable=False),
        sa.Column('is_gnn_preferred', sa.Boolean(), nullable=True),
        sa.Column('checksum', sa.String(), nullable=False),
        sa.Column('artifact_path', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('model_id')
    )

    op.create_table(
        'graph_predictions',
        sa.Column('prediction_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('task_type', sa.String(), nullable=False),
        sa.Column('target_id', sa.String(), nullable=False),
        sa.Column('predicted_risk', sa.Float(), nullable=False),
        sa.Column('horizon_hours', sa.Integer(), nullable=True),
        sa.Column('lower_bound_95', sa.Float(), nullable=False),
        sa.Column('upper_bound_95', sa.Float(), nullable=False),
        sa.Column('model_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('prediction_id')
    )

    op.create_table(
        'propagation_traces',
        sa.Column('trace_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('origin_node_id', sa.String(), nullable=False),
        sa.Column('depth', sa.Integer(), nullable=False),
        sa.Column('propagation_probability', sa.Float(), nullable=False),
        sa.Column('affected_nodes', sa.JSON(), nullable=False),
        sa.Column('affected_edges', sa.JSON(), nullable=False),
        sa.Column('expected_impact', sa.String(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('trace_id')
    )

    op.create_table(
        'causal_hypotheses',
        sa.Column('hypothesis_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('cause_node_id', sa.String(), nullable=False),
        sa.Column('effect_node_id', sa.String(), nullable=False),
        sa.Column('propagation_path', sa.JSON(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('causal_status', sa.String(), nullable=False),
        sa.Column('assumptions', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('hypothesis_id')
    )

    op.create_table(
        'counterfactual_runs',
        sa.Column('run_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('target_node_id', sa.String(), nullable=False),
        sa.Column('parameter_overrides', sa.JSON(), nullable=False),
        sa.Column('baseline_network_risk', sa.Float(), nullable=False),
        sa.Column('counterfactual_network_risk', sa.Float(), nullable=False),
        sa.Column('risk_delta', sa.Float(), nullable=False),
        sa.Column('service_delta', sa.Float(), nullable=False),
        sa.Column('cost_delta', sa.Float(), nullable=False),
        sa.Column('execution_time_ms', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('run_id')
    )


def downgrade() -> None:
    op.drop_table('counterfactual_runs')
    op.drop_table('causal_hypotheses')
    op.drop_table('propagation_traces')
    op.drop_table('graph_predictions')
    op.drop_table('graph_model_records')
    op.drop_table('graph_snapshots')
