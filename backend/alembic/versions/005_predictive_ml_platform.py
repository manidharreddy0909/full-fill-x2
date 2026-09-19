"""005_predictive_ml_platform

Revision ID: 005_predictive_ml
Revises: 004_distributed_realtime
Create Date: 2026-09-20
"""
from alembic import op
import sqlalchemy as sa

revision = "005_predictive_ml"
down_revision = "004_distributed_realtime"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. ML Datasets Table
    op.create_table(
        "ml_datasets",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("organization_id", sa.String(64), nullable=False, server_default="org-fulfillx-default"),
        sa.Column("label_definition", sa.String(128), nullable=False),
        sa.Column("record_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("time_range_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("time_range_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("generation_mode", sa.String(32), nullable=False, server_default="SYNTHETIC"),
        sa.Column("seed", sa.Integer(), nullable=False, server_default="42"),
        sa.Column("quality_score", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
    )
    op.create_index("idx_ml_datasets_org_created", "ml_datasets", ["organization_id", "created_at"])

    # 2. ML Models Table
    op.create_table(
        "ml_models",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("organization_id", sa.String(64), nullable=False, server_default="org-fulfillx-default"),
        sa.Column("model_name", sa.String(128), nullable=False),
        sa.Column("model_version", sa.String(32), nullable=False),
        sa.Column("task_type", sa.String(64), nullable=False),
        sa.Column("algorithm", sa.String(64), nullable=False),
        sa.Column("feature_schema_version", sa.String(32), nullable=False, server_default="v1.0.0"),
        sa.Column("training_dataset_id", sa.String(64), nullable=False),
        sa.Column("metrics_json", sa.JSON(), nullable=True),
        sa.Column("baseline_metrics_json", sa.JSON(), nullable=True),
        sa.Column("is_baseline_preferred", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("status", sa.String(32), nullable=False, server_default="TRAINED"),
        sa.Column("artifact_location", sa.String(256), nullable=False),
        sa.Column("checksum", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_ml_models_org_task_status", "ml_models", ["organization_id", "task_type", "status"])

    # 3. ML Predictions Table
    op.create_table(
        "ml_predictions",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("organization_id", sa.String(64), nullable=False, server_default="org-fulfillx-default"),
        sa.Column("model_id", sa.String(64), nullable=False),
        sa.Column("model_version", sa.String(32), nullable=False),
        sa.Column("task_type", sa.String(64), nullable=False),
        sa.Column("entity_id", sa.String(64), nullable=False),
        sa.Column("horizon", sa.String(16), nullable=False, server_default="24h"),
        sa.Column("predicted_value", sa.Float(), nullable=True),
        sa.Column("disruption_probability", sa.Float(), nullable=True),
        sa.Column("anomaly_score", sa.Float(), nullable=True),
        sa.Column("is_anomaly", sa.Boolean(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("payload_json", sa.JSON(), nullable=True),
    )
    op.create_index("idx_ml_predictions_org_entity_gen", "ml_predictions", ["organization_id", "entity_id", "generated_at"])

    # 4. ML Drift Reports Table
    op.create_table(
        "ml_drift_reports",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("organization_id", sa.String(64), nullable=False, server_default="org-fulfillx-default"),
        sa.Column("model_id", sa.String(64), nullable=False),
        sa.Column("model_version", sa.String(32), nullable=False),
        sa.Column("prediction_drift_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("overall_status", sa.String(32), nullable=False, server_default="HEALTHY"),
        sa.Column("evaluated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("details_json", sa.JSON(), nullable=True),
    )
    op.create_index("idx_ml_drift_org_model_eval", "ml_drift_reports", ["organization_id", "model_id", "evaluated_at"])


def downgrade() -> None:
    op.drop_table("ml_drift_reports")
    op.drop_table("ml_predictions")
    op.drop_table("ml_models")
    op.drop_table("ml_datasets")
