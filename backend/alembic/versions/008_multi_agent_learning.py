"""008_multi_agent_learning

Revision ID: 008_multi_agent_learning
Revises: 007_digital_twin_simulation
Create Date: 2026-09-20 05:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008_multi_agent_learning'
down_revision = '007_digital_twin_simulation'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'agent_memories',
        sa.Column('memory_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('agent_id', sa.String(), nullable=False),
        sa.Column('memory_type', sa.String(), nullable=False),
        sa.Column('event_reference', sa.String(), nullable=True),
        sa.Column('context_json', sa.JSON(), nullable=False),
        sa.Column('decision_json', sa.JSON(), nullable=False),
        sa.Column('expected_outcome', sa.JSON(), nullable=False),
        sa.Column('actual_outcome', sa.JSON(), nullable=True),
        sa.Column('lesson', sa.String(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('decay_factor', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('memory_id')
    )
    op.create_index('ix_agent_memories_organization_id', 'agent_memories', ['organization_id'])
    op.create_index('ix_agent_memories_agent_id', 'agent_memories', ['agent_id'])

    op.create_table(
        'agent_performance',
        sa.Column('agent_id', sa.String(), nullable=False),
        sa.Column('agent_name', sa.String(), nullable=False),
        sa.Column('proposals_count', sa.Integer(), nullable=True),
        sa.Column('valid_proposals_count', sa.Integer(), nullable=True),
        sa.Column('verification_success_count', sa.Integer(), nullable=True),
        sa.Column('mean_predicted_impact', sa.Float(), nullable=True),
        sa.Column('mean_observed_impact', sa.Float(), nullable=True),
        sa.Column('calibration_mae', sa.Float(), nullable=True),
        sa.Column('calibration_rmse', sa.Float(), nullable=True),
        sa.Column('simulation_agreement_score', sa.Float(), nullable=True),
        sa.Column('adversarial_survival_rate', sa.Float(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('agent_id')
    )

    op.create_table(
        'deliberation_sessions',
        sa.Column('deliberation_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('target_nodes_json', sa.JSON(), nullable=False),
        sa.Column('rounds_json', sa.JSON(), nullable=False),
        sa.Column('evidence_bundle_json', sa.JSON(), nullable=False),
        sa.Column('consensus_status', sa.String(), nullable=False),
        sa.Column('final_recommendation', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('deliberation_id')
    )
    op.create_index('ix_deliberation_sessions_organization_id', 'deliberation_sessions', ['organization_id'])

    op.create_table(
        'outcome_records',
        sa.Column('outcome_id', sa.String(), nullable=False),
        sa.Column('decision_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('expected_service_level', sa.Float(), nullable=False),
        sa.Column('actual_service_level', sa.Float(), nullable=False),
        sa.Column('expected_cost', sa.Float(), nullable=False),
        sa.Column('actual_cost', sa.Float(), nullable=False),
        sa.Column('expected_recovery_hours', sa.Float(), nullable=False),
        sa.Column('actual_recovery_hours', sa.Float(), nullable=False),
        sa.Column('service_deviation', sa.Float(), nullable=False),
        sa.Column('cost_deviation', sa.Float(), nullable=False),
        sa.Column('recovery_deviation', sa.Float(), nullable=False),
        sa.Column('attribution_json', sa.JSON(), nullable=False),
        sa.Column('observed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('outcome_id')
    )
    op.create_index('ix_outcome_records_decision_id', 'outcome_records', ['decision_id'])
    op.create_index('ix_outcome_records_organization_id', 'outcome_records', ['organization_id'])

    op.create_table(
        'feedback_records',
        sa.Column('feedback_id', sa.String(), nullable=False),
        sa.Column('outcome_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('feedback_type', sa.String(), nullable=False),
        sa.Column('accuracy_score', sa.Float(), nullable=False),
        sa.Column('comments', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('feedback_id')
    )
    op.create_index('ix_feedback_records_outcome_id', 'feedback_records', ['outcome_id'])

    op.create_table(
        'learning_datasets',
        sa.Column('dataset_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('version', sa.String(), nullable=False),
        sa.Column('record_count', sa.Integer(), nullable=False),
        sa.Column('checksum', sa.String(), nullable=False),
        sa.Column('data_origin', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('dataset_id')
    )

    op.create_table(
        'learning_runs',
        sa.Column('run_id', sa.String(), nullable=False),
        sa.Column('dataset_id', sa.String(), nullable=False),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('train_mae', sa.Float(), nullable=False),
        sa.Column('val_mae', sa.Float(), nullable=False),
        sa.Column('train_rmse', sa.Float(), nullable=False),
        sa.Column('val_rmse', sa.Float(), nullable=False),
        sa.Column('baseline_mae', sa.Float(), nullable=False),
        sa.Column('is_improvement', sa.Boolean(), nullable=True),
        sa.Column('execution_time_sec', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('run_id')
    )

    op.create_table(
        'challenger_models',
        sa.Column('challenger_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('version', sa.String(), nullable=False),
        sa.Column('active_model_id', sa.String(), nullable=False),
        sa.Column('baseline_metric', sa.Float(), nullable=False),
        sa.Column('challenger_metric', sa.Float(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('checksum', sa.String(), nullable=False),
        sa.Column('artifact_path', sa.String(), nullable=False),
        sa.Column('activation_reason', sa.String(), nullable=True),
        sa.Column('approved_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('challenger_id')
    )

    op.create_table(
        'agent_lessons',
        sa.Column('lesson_id', sa.String(), nullable=False),
        sa.Column('agent_id', sa.String(), nullable=False),
        sa.Column('lesson_text', sa.String(), nullable=False),
        sa.Column('evidence_count', sa.Integer(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('validated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('lesson_id')
    )


def downgrade() -> None:
    op.drop_table('agent_lessons')
    op.drop_table('challenger_models')
    op.drop_table('learning_runs')
    op.drop_table('learning_datasets')
    op.drop_table('feedback_records')
    op.drop_table('outcome_records')
    op.drop_table('deliberation_sessions')
    op.drop_table('agent_performance')
    op.drop_table('agent_memories')
