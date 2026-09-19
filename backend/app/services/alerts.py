"""
FULFILL-X Operational Alert Engine (Phase 5)
Evaluates system health, consumer lag, data freshness, and security rules,
enforcing fingerprint deduplication, cooldown timers, and persistent storage.
"""
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from uuid import uuid4

from app.schemas.events import EventEnvelope, EventType, EventSeverity
from app.models.alerts import OperationalAlertModel
from app.config import settings

logger = logging.getLogger("fulfillx.services.alerts")


class AlertEngine:
    """
    Evaluates operational rules, prevents alert storms via cooldown,
    persists active alerts, and broadcasts ALERT_TRIGGERED events.
    """
    _instance: Optional["AlertEngine"] = None

    def __init__(self, cooldown_seconds: int = 300):
        self._cooldown_seconds = cooldown_seconds
        # Fingerprint -> datetime of last triggered alert
        self._cooldown_tracker: Dict[str, datetime] = {}
        self._active_alerts: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def get_instance(cls) -> "AlertEngine":
        if cls._instance is None:
            cls._instance = AlertEngine(cooldown_seconds=getattr(settings, "ALERT_COOLDOWN_SECONDS", 300))
        return cls._instance

    def _compute_fingerprint(self, source_component: str, title: str, organization_id: str) -> str:
        raw = f"{organization_id}:{source_component}:{title}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:32]

    async def trigger_alert(
        self,
        source_component: str,
        title: str,
        message: str,
        severity: EventSeverity = EventSeverity.HIGH,
        organization_id: str = "org-fulfillx-default",
        evidence: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Trigger an operational alert if not restricted by cooldown.
        Persists to DB if configured and publishes ALERT_TRIGGERED to EventBus.
        """
        now = datetime.now(timezone.utc)
        fingerprint = self._compute_fingerprint(source_component, title, organization_id)

        # Cooldown check
        if fingerprint in self._cooldown_tracker:
            last_time = self._cooldown_tracker[fingerprint]
            if (now - last_time).total_seconds() < self._cooldown_seconds:
                logger.debug(f"Alert '{title}' suppressed due to cooldown ({self._cooldown_seconds}s)")
                return None

        self._cooldown_tracker[fingerprint] = now
        alert_id = f"alt-{uuid4().hex[:10]}"
        evidence = evidence or {}

        alert_data = {
            "alert_id": alert_id,
            "organization_id": organization_id,
            "fingerprint": fingerprint,
            "severity": severity.value if hasattr(severity, "value") else str(severity),
            "title": title,
            "message": message,
            "source_component": source_component,
            "status": "ACTIVE",
            "created_at": now.isoformat(),
            "acknowledged_at": None,
            "acknowledged_by": None,
            "evidence": evidence,
        }

        self._active_alerts[alert_id] = alert_data

        # Persist to database if configured
        if settings.PERSISTENCE_MODE == "postgres":
            try:
                from app.db.session import get_async_sessionmaker

                async with get_async_sessionmaker()() as session:
                    model = OperationalAlertModel(
                        alert_id=alert_id,
                        organization_id=organization_id,
                        fingerprint=fingerprint,
                        severity=alert_data["severity"],
                        title=title,
                        message=message,
                        source_component=source_component,
                        status="ACTIVE",
                        created_at=now,
                        evidence=evidence,
                    )
                    session.add(model)
                    await session.commit()
            except Exception as ex:
                logger.warning(f"Error persisting operational alert record: {ex}")

        # Publish ALERT_TRIGGERED to EventBus
        try:
            from app.realtime.event_bus import event_bus
            await event_bus.publish(
                event_type=EventType.ALERT_TRIGGERED,
                payload=alert_data,
                organization_id=organization_id,
                source=source_component,
                severity=severity,
            )
        except Exception as ex:
            logger.warning(f"Error publishing ALERT_TRIGGERED event: {ex}")

        return alert_data

    async def acknowledge_alert(
        self,
        alert_id: str,
        acknowledged_by: str = "operator",
        organization_id: str = "org-fulfillx-default",
    ) -> bool:
        """Acknowledge an active operational alert."""
        now = datetime.now(timezone.utc)
        if alert_id in self._active_alerts:
            self._active_alerts[alert_id]["status"] = "ACKNOWLEDGED"
            self._active_alerts[alert_id]["acknowledged_at"] = now.isoformat()
            self._active_alerts[alert_id]["acknowledged_by"] = acknowledged_by

        if settings.PERSISTENCE_MODE == "postgres":
            try:
                from sqlalchemy import select
                from app.db.session import get_async_sessionmaker

                async with get_async_sessionmaker()() as session:
                    stmt = select(OperationalAlertModel).where(
                        OperationalAlertModel.alert_id == alert_id,
                        OperationalAlertModel.organization_id == organization_id,
                    )
                    res = await session.execute(stmt)
                    alert_model = res.scalar_one_or_none()
                    if alert_model:
                        alert_model.status = "ACKNOWLEDGED"
                        alert_model.acknowledged_at = now
                        alert_model.acknowledged_by = acknowledged_by
                        await session.commit()
                        return True
            except Exception as ex:
                logger.warning(f"Error updating DB alert acknowledgment: {ex}")

        return alert_id in self._active_alerts

    def list_alerts(self, organization_id: str = "org-fulfillx-default") -> List[Dict[str, Any]]:
        """Return active operational alerts for tenant."""
        return [
            alt for alt in self._active_alerts.values()
            if alt.get("organization_id") == organization_id or alt.get("organization_id") == "org-fulfillx-default"
        ]

    def reset(self) -> None:
        """Reset state for unit tests."""
        self._cooldown_tracker.clear()
        self._active_alerts.clear()
