"""007_digital_twin_simulation

Revision ID: 007_digital_twin_simulation
Revises: 006_gnn_causal_intelligence
Create Date: 2026-09-20 04:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '007_digital_twin_simulation'
down_revision = '006_gnn_causal_intelligence'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'digital_twins',
        sa.Column('twin_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('world_snapshot_id', sa.String(), nullable=False),
        sa.Column('graph_snapshot_id', sa.String(), nullable=False),
        sa.Column('twin_version', sa.String(), nullable=True),
        sa.Column('seed', sa.Integer(), nullable=True),
        sa.Column('mode', sa.String(), nullable=True),
        sa.Column('production_mutation', sa.Boolean(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('twin_id')
    )
    op.create_index('ix_digital_twins_organization_id', 'digital_twins', ['organization_id'])

    op.create_table(
        'simulation_runs',
        sa.Column('run_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('twin_id', sa.String(), nullable=False),
        sa.Column('scenario_id', sa.String(), nullable=False),
        sa.Column('seed', sa.Integer(), nullable=False),
        sa.Column('horizon_hours', sa.Integer(), nullable=False),
        sa.Column('overall_service_level', sa.Float(), nullable=False),
        sa.Column('total_backlog', sa.Float(), nullable=False),
        sa.Column('total_cost', sa.Float(), nullable=False),
        sa.Column('recovery_time_hours', sa.Float(), nullable=False),
        sa.Column('time_to_failure_hours', sa.Float(), nullable=True),
        sa.Column('max_disrupted_nodes', sa.Integer(), nullable=False),
        sa.Column('stockout_occurred', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('run_id')
    )
    op.create_index('ix_simulation_runs_twin_id', 'simulation_runs', ['twin_id'])
    op.create_index('ix_simulation_runs_scenario_id', 'simulation_runs', ['scenario_id'])

    op.create_table(
        'monte_carlo_results',
        sa.Column('mc_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('twin_id', sa.String(), nullable=False),
        sa.Column('scenario_id', sa.String(), nullable=False),
        sa.Column('n_simulations', sa.Integer(), nullable=False),
        sa.Column('seed', sa.Integer(), nullable=False),
        sa.Column('horizon_hours', sa.Integer(), nullable=False),
        sa.Column('execution_time_sec', sa.Float(), nullable=False),
        sa.Column('resilience_score', sa.Float(), nullable=False),
        sa.Column('service_p50', sa.Float(), nullable=False),
        sa.Column('cost_cvar95', sa.Float(), nullable=False),
        sa.Column('ttr_p90', sa.Float(), nullable=False),
        sa.Column('stockout_prob', sa.Float(), nullable=False),
        sa.Column('metrics_json', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('mc_id')
    )
    op.create_index('ix_monte_carlo_results_twin_id', 'monte_carlo_results', ['twin_id'])
    op.create_index('ix_monte_carlo_results_scenario_id', 'monte_carlo_results', ['scenario_id'])

    op.create_table(
        'strategy_comparisons',
        sa.Column('comparison_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('scenario_id', sa.String(), nullable=False),
        sa.Column('recommended_strategy_id', sa.String(), nullable=False),
        sa.Column('baseline_summary', sa.JSON(), nullable=False),
        sa.Column('candidates_summary', sa.JSON(), nullable=False),
        sa.Column('trade_offs', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('comparison_id')
    )

    op.create_table(
        'twin_calibrations',
        sa.Column('calibration_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('twin_id', sa.String(), nullable=False),
        sa.Column('world_snapshot_id', sa.String(), nullable=False),
        sa.Column('mae_service_level', sa.Float(), nullable=False),
        sa.Column('rmse_service_level', sa.Float(), nullable=False),
        sa.Column('recovery_time_error_hours', sa.Float(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('calibration_id')
    )
    op.create_index('ix_twin_calibrations_twin_id', 'twin_calibrations', ['twin_id'])


def downgrade() -> None:
    op.drop_table('twin_calibrations')
    op.drop_table('strategy_comparisons')
    op.drop_table('monte_carlo_results')
    op.drop_table('simulation_runs')
    op.drop_table('digital_twins')
