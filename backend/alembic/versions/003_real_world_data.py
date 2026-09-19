"""real_world_data_tables

Revision ID: 003_real_world_data
Revises: 002_identity_and_tenancy
Create Date: 2026-09-19 20:20:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_real_world_data'
down_revision = '002_identity_and_tenancy'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'data_sources',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=False),
        sa.Column('source_type', sa.String(length=64), nullable=False),
        sa.Column('endpoint_url', sa.Text(), nullable=False),
        sa.Column('requires_auth', sa.Boolean(), nullable=True),
        sa.Column('cost_tier', sa.String(length=32), nullable=True),
        sa.Column('license_type', sa.String(length=64), nullable=True),
        sa.Column('refresh_interval_seconds', sa.Integer(), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=True),
        sa.Column('health_status', sa.String(length=32), nullable=True),
        sa.Column('last_successful_fetch', sa.DateTime(), nullable=True),
        sa.Column('last_attempt', sa.DateTime(), nullable=True),
        sa.Column('failure_count', sa.Integer(), nullable=True),
        sa.Column('source_metadata', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_data_sources_organization_id', 'data_sources', ['organization_id'])
    op.create_index('ix_data_sources_category', 'data_sources', ['category'])
    op.create_index('ix_data_sources_enabled', 'data_sources', ['enabled'])
    op.create_index('ix_data_sources_health_status', 'data_sources', ['health_status'])

    op.create_table(
        'source_runs',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('mode', sa.String(length=32), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('records_fetched', sa.Integer(), nullable=True),
        sa.Column('records_processed', sa.Integer(), nullable=True),
        sa.Column('records_accepted', sa.Integer(), nullable=True),
        sa.Column('records_rejected', sa.Integer(), nullable=True),
        sa.Column('signals_generated', sa.Integer(), nullable=True),
        sa.Column('latency_ms', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['source_id'], ['data_sources.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_source_runs_organization_id', 'source_runs', ['organization_id'])
    op.create_index('ix_source_runs_source_id', 'source_runs', ['source_id'])
    op.create_index('ix_source_runs_started_at', 'source_runs', ['started_at'])
    op.create_index('ix_source_runs_status', 'source_runs', ['status'])

    op.create_table(
        'raw_records',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('source_record_id', sa.String(length=256), nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('raw_payload', sa.JSON(), nullable=False),
        sa.Column('ingested_at', sa.DateTime(), nullable=False),
        sa.Column('observed_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'source_id', 'content_hash', name='uq_raw_record_hash')
    )
    op.create_index('ix_raw_records_organization_id', 'raw_records', ['organization_id'])
    op.create_index('ix_raw_records_source_id', 'raw_records', ['source_id'])
    op.create_index('ix_raw_records_source_record_id', 'raw_records', ['source_record_id'])

    op.create_table(
        'external_observations',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('source_record_id', sa.String(length=256), nullable=False),
        sa.Column('observed_at', sa.DateTime(), nullable=False),
        sa.Column('ingested_at', sa.DateTime(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('location_name', sa.String(length=256), nullable=True),
        sa.Column('observation_type', sa.String(length=64), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('quality_score', sa.Float(), nullable=True),
        sa.Column('provenance_id', sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'source_id', 'source_record_id', name='uq_obs_source_record')
    )
    op.create_index('ix_external_observations_organization_id', 'external_observations', ['organization_id'])
    op.create_index('ix_external_observations_source_id', 'external_observations', ['source_id'])
    op.create_index('ix_external_observations_observation_type', 'external_observations', ['observation_type'])

    op.create_table(
        'external_signals',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('signal_type', sa.String(length=64), nullable=False),
        sa.Column('severity', sa.String(length=32), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('affected_entity_ids', sa.JSON(), nullable=False),
        sa.Column('evidence', sa.JSON(), nullable=False),
        sa.Column('provenance_id', sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_external_signals_organization_id', 'external_signals', ['organization_id'])
    op.create_index('ix_external_signals_source_id', 'external_signals', ['source_id'])
    op.create_index('ix_external_signals_signal_type', 'external_signals', ['signal_type'])
    op.create_index('ix_external_signals_severity', 'external_signals', ['severity'])

    op.create_table(
        'entity_resolution_candidates',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('external_entity_name', sa.String(length=256), nullable=False),
        sa.Column('external_latitude', sa.Float(), nullable=True),
        sa.Column('external_longitude', sa.Float(), nullable=True),
        sa.Column('matched_node_id', sa.String(length=64), nullable=True),
        sa.Column('match_score', sa.Float(), nullable=True),
        sa.Column('match_status', sa.String(length=32), nullable=True),
        sa.Column('match_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_entity_resolution_candidates_organization_id', 'entity_resolution_candidates', ['organization_id'])
    op.create_index('ix_entity_resolution_candidates_match_status', 'entity_resolution_candidates', ['match_status'])

    op.create_table(
        'entity_aliases',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('alias_name', sa.String(length=256), nullable=False),
        sa.Column('canonical_node_id', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'alias_name', name='uq_tenant_entity_alias')
    )
    op.create_index('ix_entity_aliases_organization_id', 'entity_aliases', ['organization_id'])

    op.create_table(
        'data_quality_reports',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('organization_id', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('run_id', sa.String(length=64), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('completeness_score', sa.Float(), nullable=False),
        sa.Column('validity_score', sa.Float(), nullable=False),
        sa.Column('freshness_score', sa.Float(), nullable=False),
        sa.Column('overall_quality_score', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('records_evaluated', sa.Integer(), nullable=True),
        sa.Column('records_accepted', sa.Integer(), nullable=True),
        sa.Column('records_rejected', sa.Integer(), nullable=True),
        sa.Column('issues', sa.JSON(), nullable=False),
        sa.Column('warnings', sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_data_quality_reports_organization_id', 'data_quality_reports', ['organization_id'])


def downgrade():
    op.drop_table('data_quality_reports')
    op.drop_table('entity_aliases')
    op.drop_table('entity_resolution_candidates')
    op.drop_table('external_signals')
    op.drop_table('external_observations')
    op.drop_table('raw_records')
    op.drop_table('source_runs')
    op.drop_table('data_sources')
