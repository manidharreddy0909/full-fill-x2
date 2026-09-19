"""
FULFILL-X Historical Data Replay Service (Phase 4)
Matching docs/DATA_REPLAY_SPEC.md
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from app.services.ingestion import RealDataIngestionService
from app.realtime.event_bus import event_bus, EventBus
from app.schemas.data_ingestion import DataReplayRequest, IngestionRunSummary
from app.schemas.events import EventEnvelope, EventSeverity

logger = logging.getLogger("fulfillx.services.data_replay")


class DataReplayService:
    """
    Historical Data Replay Engine.
    Executes playback of recorded datasets through ingestion and risk engines for evaluation harness benchmarking.
    """

    _instance: Optional["DataReplayService"] = None

    def __init__(
        self,
        ingestion_service: Optional[RealDataIngestionService] = None,
        event_bus_inst: Optional[EventBus] = None,
    ):
        self.ingestion_service = ingestion_service or RealDataIngestionService.get_instance()
        self.event_bus = event_bus_inst or event_bus

    @classmethod
    def get_instance(cls) -> "DataReplayService":
        if cls._instance is None:
            cls._instance = DataReplayService()
        return cls._instance

    async def run_replay(self, req: DataReplayRequest) -> dict:
        """
        Executes historical data playback session.
        """
        replay_id = f"replay-{uuid4().hex[:10]}"

        # Broadcast DATA_REPLAY_STARTED
        await self.event_bus.publish(
            event_type="DATA_REPLAY_STARTED",
            organization_id=req.organization_id,
            severity=EventSeverity.INFO,
            payload={
                "replay_id": replay_id,
                "seed": req.seed,
                "speed": req.speed_multiplier,
            },
        )

        # Execute ingestion replay run
        summaries = await self.ingestion_service.run_all_sources(organization_id=req.organization_id)

        # Broadcast DATA_REPLAY_COMPLETED
        await self.event_bus.publish(
            event_type="DATA_REPLAY_COMPLETED",
            organization_id=req.organization_id,
            severity=EventSeverity.INFO,
            payload={
                "replay_id": replay_id,
                "runs_completed": len(summaries),
                "total_signals": sum(s.signals_generated for s in summaries),
            },
        )

        return {
            "replay_id": replay_id,
            "organization_id": req.organization_id,
            "status": "COMPLETED",
            "seed": req.seed,
            "runs_executed": len(summaries),
            "total_signals_generated": sum(s.signals_generated for s in summaries),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
