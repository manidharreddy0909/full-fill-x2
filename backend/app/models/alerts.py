"""
FULFILL-X Operational Alert ORM Models (Phase 5)
Persists operational alert engine notifications, severity badges, and human acknowledgment states.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Index, JSON, Boolean
from app.db.session import Base


class OperationalAlertModel(Base):
    __tablename__ = "operational_alerts"

    alert_id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), nullable=False, index=True, default="org-fulfillx-default")
    fingerprint = Column(String(128), nullable=False, index=True)
    severity = Column(String(32), nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    title = Column(String(256), nullable=False)
    message = Column(String(1024), nullable=False)
    source_component = Column(String(64), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="ACTIVE")  # ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(String(128), nullable=True)
    evidence = Column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_alerts_org_fingerprint", "organization_id", "fingerprint"),
        Index("idx_alerts_org_status_severity", "organization_id", "status", "severity"),
        Index("idx_alerts_created_at", "created_at"),
    )
