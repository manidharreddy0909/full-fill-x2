"""identity and tenancy migration

Revision ID: 002_identity_and_tenancy
Revises: 001_initial_schema
Create Date: 2026-09-19 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002_identity_and_tenancy'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('email', sa.String(length=256), nullable=False),
        sa.Column('display_name', sa.String(length=128), nullable=False),
        sa.Column('password_hash', sa.String(length=256), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('identity_provider', sa.String(length=32), nullable=False, server_default='local'),
        sa.Column('external_subject', sa.String(length=128), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_users_email_status', 'users', ['email', 'status'], unique=False)
    op.create_index('idx_users_created_at', 'users', ['created_at'], unique=False)

    # 2. Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('slug', sa.String(length=128), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('settings', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('idx_organizations_slug_status', 'organizations', ['slug', 'status'], unique=False)

    # 3. Create memberships table
    op.create_table(
        'memberships',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.String(length=64), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False, server_default='OPERATOR'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'user_id', name='uq_org_user_membership')
    )
    op.create_index('idx_memberships_org_role', 'memberships', ['organization_id', 'role'], unique=False)

    # 4. Add organization_id column to existing domain tables
    for table_name in [
        'world_snapshots',
        'signals',
        'risk_snapshots',
        'audit_events',
        'event_history'
    ]:
        op.add_column(table_name, sa.Column('organization_id', sa.String(length=64), nullable=False, server_default='org-fulfillx-default'))
        op.create_index(f'idx_{table_name}_org_id', table_name, ['organization_id'], unique=False)


def downgrade() -> None:
    for table_name in [
        'world_snapshots',
        'signals',
        'risk_snapshots',
        'audit_events',
        'event_history'
    ]:
        op.drop_index(f'idx_{table_name}_org_id', table_name=table_name)
        op.drop_column(table_name, 'organization_id')

    op.drop_table('memberships')
    op.drop_table('organizations')
    op.drop_table('users')
