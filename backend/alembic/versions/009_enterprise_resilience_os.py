"""
Migration 009: Multi-Tenant Enterprise + Production + Resilience OS
Revision ID: 009_enterprise_resilience_os
Revises: 008_multi_agent_learning
Create Date: 2026-09-20 04:45:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '009_enterprise_resilience_os'
down_revision = '008_multi_agent_learning'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'workspaces',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('type', sa.String(length=32), nullable=False, server_default='PRODUCTION'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workspaces_organization_id'), 'workspaces', ['organization_id'], unique=False)

    op.create_table(
        'workspace_memberships',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('workspace_id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.String(length=64), nullable=False),
        sa.Column('role', sa.String(length=64), nullable=False, server_default='OPERATOR'),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workspace_memberships_workspace_id'), 'workspace_memberships', ['workspace_id'], unique=False)
    op.create_index(op.f('ix_workspace_memberships_user_id'), 'workspace_memberships', ['user_id'], unique=False)

    op.create_table(
        'policy_definitions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('workspace_id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('policy_type', sa.String(length=64), nullable=False),
        sa.Column('threshold_value', sa.Float(), nullable=False),
        sa.Column('action_on_violation', sa.String(length=32), nullable=False, server_default='BLOCK'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_policy_definitions_organization_id'), 'policy_definitions', ['organization_id'], unique=False)
    op.create_index(op.f('ix_policy_definitions_workspace_id'), 'policy_definitions', ['workspace_id'], unique=False)

    op.create_table(
        'policy_evaluations',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('workspace_id', sa.String(length=64), nullable=False),
        sa.Column('policy_id', sa.String(length=64), nullable=False),
        sa.Column('decision_id', sa.String(length=64), nullable=False),
        sa.Column('observed_value', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('evaluated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_policy_evaluations_organization_id'), 'policy_evaluations', ['organization_id'], unique=False)
    op.create_index(op.f('ix_policy_evaluations_workspace_id'), 'policy_evaluations', ['workspace_id'], unique=False)

    op.create_table(
        'execution_records',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('workspace_id', sa.String(length=64), nullable=False),
        sa.Column('decision_id', sa.String(length=64), nullable=False),
        sa.Column('execution_mode', sa.String(length=32), nullable=False, server_default='DRY_RUN'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PENDING'),
        sa.Column('authorized_by', sa.String(length=128), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('result_summary', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_execution_records_organization_id'), 'execution_records', ['organization_id'], unique=False)
    op.create_index(op.f('ix_execution_records_workspace_id'), 'execution_records', ['workspace_id'], unique=False)

    op.create_table(
        'resilience_cycles',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('workspace_id', sa.String(length=64), nullable=False),
        sa.Column('environment_id', sa.String(length=64), nullable=False, server_default='env-production'),
        sa.Column('stage', sa.String(length=64), nullable=False, server_default='IDLE'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resilience_score', sa.Float(), nullable=False, server_default='0.85'),
        sa.Column('evidence_summary', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resilience_cycles_organization_id'), 'resilience_cycles', ['organization_id'], unique=False)

    op.create_table(
        'executive_decision_records',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('workspace_id', sa.String(length=64), nullable=False),
        sa.Column('decision_id', sa.String(length=64), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('problem_statement', sa.Text(), nullable=False),
        sa.Column('risk_level', sa.String(length=32), nullable=False, server_default='MEDIUM'),
        sa.Column('resilience_score', sa.Float(), nullable=False, server_default='0.85'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_executive_decision_records_organization_id'), 'executive_decision_records', ['organization_id'], unique=False)


def downgrade():
    op.drop_table('executive_decision_records')
    op.drop_table('resilience_cycles')
    op.drop_table('execution_records')
    op.drop_table('policy_evaluations')
    op.drop_table('policy_definitions')
    op.drop_table('workspace_memberships')
    op.drop_table('workspaces')
