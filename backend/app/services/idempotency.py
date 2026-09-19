"""
FULFILL-X Idempotency & Deduplication Service (Phase 5)
Prevents duplicate event processing across distributed consumers.
"""
import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import uuid4

from app.schemas.events import EventEnvelope
from app.models.idempotency import IdempotencyRecordModel
from app.config import settings

logger = logging.getLogger("fulfillx.services.idempotency")


class IdempotencyEngine:
    """
    Engine to track and verify processed events by (event_id, consumer_id).
    Supports in-memory LRU set for fast checks and database persistence.
    """
    _instance: Optional["IdempotencyEngine"] = None

    def __init__(self, max_lru: int = 5000):
        self._max_lru = max_lru
        # Set of (organization_id, event_id, consumer_id)
        self._lru_set: set = set()

    @classmethod
    def get_instance(cls) -> "IdempotencyEngine":
        if cls._instance is None:
            cls._instance = IdempotencyEngine()
        return cls._instance

    def is_processed_memory(self, event_id: str, consumer_id: str, organization_id: str = "org-fulfillx-default") -> bool:
        """Fast local in-memory deduplication check."""
        key = (organization_id, event_id, consumer_id)
        return key in self._lru_set

    def mark_processed_memory(self, event_id: str, consumer_id: str, organization_id: str = "org-fulfillx-default") -> None:
        """Mark event as processed in local in-memory LRU cache."""
        key = (organization_id, event_id, consumer_id)
        if len(self._lru_set) >= self._max_lru:
            # Clear half the cache when full
            self._lru_set.clear()
        self._lru_set.add(key)

    async def is_processed(
        self,
        event_id: str,
        consumer_id: str,
        organization_id: str = "org-fulfillx-default",
    ) -> bool:
        """
        Check whether an event has already been processed by consumer_id.
        Checks local memory cache first, then PostgreSQL database if configured.
        """
        if self.is_processed_memory(event_id, consumer_id, organization_id):
            return True

        if settings.PERSISTENCE_MODE == "postgres":
            try:
                from sqlalchemy import select
                from app.db.session import get_async_sessionmaker

                async with get_async_sessionmaker()() as session:
                    stmt = select(IdempotencyRecordModel).where(
                        IdempotencyRecordModel.organization_id == organization_id,
                        IdempotencyRecordModel.event_id == event_id,
                        IdempotencyRecordModel.consumer_id == consumer_id,
                    )
                    res = await session.execute(stmt)
                    record = res.scalar_one_or_none()
                    if record:
                        self.mark_processed_memory(event_id, consumer_id, organization_id)
                        return True
            except Exception as e:
                logger.warning(f"Error checking DB idempotency record: {e}")

        return False

    async def record_execution(
        self,
        event_id: str,
        consumer_id: str,
        organization_id: str = "org-fulfillx-default",
        status: str = "COMPLETED",
        result_payload: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Record an event execution to prevent duplicate reprocessing."""
        self.mark_processed_memory(event_id, consumer_id, organization_id)

        if settings.PERSISTENCE_MODE == "postgres":
            try:
                from app.db.session import get_async_sessionmaker

                result_hash = None
                if result_payload:
                    res_str = json.dumps(result_payload, sort_keys=True)
                    result_hash = hashlib.sha256(res_str.encode("utf-8")).hexdigest()

                async with get_async_sessionmaker()() as session:
                    record = IdempotencyRecordModel(
                        id=f"idemp-{uuid4().hex[:12]}",
                        organization_id=organization_id,
                        event_id=event_id,
                        consumer_id=consumer_id,
                        processed_at=datetime.now(timezone.utc),
                        status=status,
                        result_hash=result_hash,
                        details=result_payload,
                    )
                    session.add(record)
                    await session.commit()
            except Exception as e:
                logger.warning(f"Error persisting idempotency record: {e}")

    def reset(self) -> None:
        """Reset state for unit tests."""
        self._lru_set.clear()
