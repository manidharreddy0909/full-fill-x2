"""
FULFILL-X PostgreSQL World Repository Implementation (Phase 2)
Provides PostgreSQL persistent state storage while maintaining SupplyNetworkGraph compatibility.
"""
import json
import logging
from typing import Optional
from sqlalchemy import select
from app.db.session import get_async_sessionmaker
from app.models.db import WorldSnapshotModel
from app.models.world import SupplyNetworkGraph
from app.schemas.world import WorldStateSnapshot, WorldSummary
from app.repository.world import WorldRepository

logger = logging.getLogger("fulfillx.repository.postgres_world")


class PostgresWorldRepository(WorldRepository):
    """
    PostgreSQL-backed WorldRepository implementation.
    Persists world snapshots to PostgreSQL database while delegating in-memory queries to superclass.
    """

    def __init__(self, seed: int = 42, preset: str = "healthy"):
        super().__init__(seed=seed, preset=preset)
        self.session_factory = get_async_sessionmaker()

    async def save_snapshot_db(self, snapshot: WorldStateSnapshot | None = None) -> WorldSnapshotModel:
        """Persist current WorldStateSnapshot to PostgreSQL database."""
        snap = snapshot or self.get_snapshot()
        summary = self.get_summary()
        
        async with self.session_factory() as session:
            model = WorldSnapshotModel(
                seed=self.current_seed,
                preset=self.current_preset,
                total_nodes=summary.total_nodes,
                total_edges=summary.total_edges,
                network_health_score=summary.network_health_score,
                data_payload=snap.model_dump(mode="json"),
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            logger.info(f"Persisted WorldSnapshot {model.snapshot_id} to PostgreSQL (seed={self.current_seed})")
            return model

    async def get_latest_snapshot_db(self) -> Optional[WorldStateSnapshot]:
        """Fetch latest WorldStateSnapshot from PostgreSQL database."""
        try:
            async with get_async_sessionmaker()() as session:
                stmt = select(WorldSnapshotModel).order_by(WorldSnapshotModel.created_at.desc()).limit(1)
                result = await session.execute(stmt)
                row = result.scalar_one_or_none()
                if row and row.data_payload:
                    return WorldStateSnapshot.model_validate(row.data_payload)
        except Exception as ex:
            logger.warning(f"Error reading snapshot from Postgres: {ex}")
        return None
