"""
FULFILL-X Idempotency ORM Models (Phase 5)
Prevents duplicate event processing in distributed realtime transport architectures.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Index, JSON, Integer
from app.db.session import Base


class IdempotencyRecordModel(Base):
    __tablename__ = "idempotency_records"

    id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), nullable=False, default="org-fulfillx-default")
    event_id = Column(String(64), nullable=False, index=True)
    consumer_id = Column(String(64), nullable=False, index=True)
    processed_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    status = Column(String(32), nullable=False, default="COMPLETED")
    result_hash = Column(String(64), nullable=True)
    details = Column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_idempotency_org_event_consumer", "organization_id", "event_id", "consumer_id", unique=True),
        Index("idx_idempotency_org_processed", "organization_id", "processed_at"),
    )
