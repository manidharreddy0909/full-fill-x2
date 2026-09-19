"""004_distributed_realtime_observability

Revision ID: 004_distributed_realtime
Revises: 003_real_world_data
Create Date: 2026-09-19
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "004_distributed_realtime"
down_revision = "003_real_world_data"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Idempotency Records Table
    op.create_table(
        "idempotency_records",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("organization_id", sa.String(64), nullable=False, server_default="org-fulfillx-default"),
        sa.Column("event_id", sa.String(64), nullable=False),
        sa.Column("consumer_id", sa.String(64), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="COMPLETED"),
        sa.Column("result_hash", sa.String(64), nullable=True),
        sa.Column("details", sa.JSON(), nullable=True),
    )
    op.create_index("idx_idempotency_org_event_consumer", "idempotency_records", ["organization_id", "event_id", "consumer_id"], unique=True)
    op.create_index("idx_idempotency_org_processed", "idempotency_records", ["organization_id", "processed_at"])

    # 2. Operational Alerts Table
    op.create_table(
        "operational_alerts",
        sa.Column("alert_id", sa.String(64), primary_key=True),
        sa.Column("organization_id", sa.String(64), nullable=False, server_default="org-fulfillx-default"),
        sa.Column("fingerprint", sa.String(128), nullable=False),
        sa.Column("severity", sa.String(32), nullable=False),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("message", sa.String(1024), nullable=False),
        sa.Column("source_component", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("acknowledged_by", sa.String(128), nullable=True),
        sa.Column("evidence", sa.JSON(), nullable=True),
    )
    op.create_index("idx_alerts_org_fingerprint", "operational_alerts", ["organization_id", "fingerprint"])
    op.create_index("idx_alerts_org_status_severity", "operational_alerts", ["organization_id", "status", "severity"])
    op.create_index("idx_alerts_created_at", "operational_alerts", ["created_at"])


def downgrade() -> None:
    op.drop_table("operational_alerts")
    op.drop_table("idempotency_records")
