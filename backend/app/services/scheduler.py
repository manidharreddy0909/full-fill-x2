"""
FULFILL-X Lightweight Async Ingestion Scheduler (Phase 4)
Matching docs/DATA_OPERATIONS.md
"""
import asyncio
import logging
from typing import Optional
from app.services.ingestion import RealDataIngestionService

logger = logging.getLogger("fulfillx.services.scheduler")


class IngestionScheduler:
    """
    Lightweight Async Ingestion Scheduler.
    Manages background interval polling of registered data source adapters.
    """

    _instance: Optional["IngestionScheduler"] = None

    def __init__(self, ingestion_service: Optional[RealDataIngestionService] = None):
        self.ingestion_service = ingestion_service or RealDataIngestionService.get_instance()
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self.interval_seconds = 300

    @classmethod
    def get_instance(cls) -> "IngestionScheduler":
        if cls._instance is None:
            cls._instance = IngestionScheduler()
        return cls._instance

    def start(self, interval_seconds: int = 300) -> None:
        """Start background polling task if not already running."""
        if self._running:
            return
        self.interval_seconds = interval_seconds
        self._running = True
        self._task = asyncio.create_task(self._scheduler_loop())
        logger.info(f"Ingestion scheduler started with interval {interval_seconds}s")

    def stop(self) -> None:
        """Stop background polling task."""
        if not self._running:
            return
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("Ingestion scheduler stopped")

    def is_running(self) -> bool:
        return self._running

    async def _scheduler_loop(self) -> None:
        """Main periodic loop."""
        while self._running:
            try:
                logger.info("Scheduler triggering periodic data ingestion run...")
                await self.ingestion_service.run_all_sources()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}", exc_info=True)

            await asyncio.sleep(self.interval_seconds)
