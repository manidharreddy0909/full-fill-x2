"""
FULFILL-X PostgreSQL Risk Repository Implementation (Phase 2)
Provides PostgreSQL persistent state storage for Signals and RiskScoreMaps.
"""
import logging
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from app.db.session import get_async_sessionmaker
from app.models.db import SignalModel, RiskSnapshotModel
from app.schemas.signal import Signal
from app.schemas.risk import RiskScoreMap
from app.repository.risk import RiskRepository

logger = logging.getLogger("fulfillx.repository.postgres_risk")


class PostgresRiskRepository(RiskRepository):
    """
    PostgreSQL-backed RiskRepository implementation.
    Persists signals and computed RiskScoreMaps to PostgreSQL database.
    """

    def __init__(self, world_repo=None):
        super().__init__(world_repo=world_repo)
        self.session_factory = get_async_sessionmaker()

    async def save_signal_db(self, signal: Signal) -> SignalModel:
        """Persist a signal to PostgreSQL database."""
        async with self.session_factory() as session:
            model = SignalModel(
                id=str(signal.id),
                signal_type=signal.type.value if hasattr(signal.type, "value") else str(signal.type),
                severity=signal.severity.value if hasattr(signal.severity, "value") else str(signal.severity),
                title=signal.title,
                description=signal.description,
                confidence=signal.confidence,
                source=signal.source,
                region=signal.region,
                affected_node_ids=signal.affected_node_ids,
                affected_edge_ids=signal.affected_edge_ids,
                status=signal.status.value if hasattr(signal.status, "value") else str(signal.status),
                observed_at=signal.created_at,
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            logger.info(f"Persisted Signal {signal.id} ({signal.title}) to PostgreSQL")
            return model

    async def save_risk_snapshot_db(self, risk_map: RiskScoreMap | None = None) -> RiskSnapshotModel:
        """Persist computed RiskScoreMap to PostgreSQL database."""
        rm = risk_map or self.get_risk_map()
        async with self.session_factory() as session:
            model = RiskSnapshotModel(
                world_seed=self.world_repo.current_seed,
                risk_level=rm.overall_risk_level.value if hasattr(rm.overall_risk_level, "value") else str(rm.overall_risk_level),
                average_risk=rm.average_risk_score,
                node_risks={k: v.model_dump(mode="json") for k, v in rm.node_risks.items()},
                explanations={k: v.model_dump(mode="json") for k, v in rm.explanations.items()},
                propagation_paths={k: v.model_dump(mode="json") for k, v in rm.propagation_paths.items()} if hasattr(rm, "propagation_paths") else {},
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            logger.info(f"Persisted RiskSnapshot {model.id} to PostgreSQL")
            return model

    async def load_signals_db(self) -> List[SignalModel]:
        """Fetch all signals from PostgreSQL database."""
        try:
            async with self.session_factory() as session:
                stmt = select(SignalModel).order_by(SignalModel.created_at.desc())
                res = await session.execute(stmt)
                return list(res.scalars().all())
        except Exception as ex:
            logger.warning(f"Error fetching signals from PostgreSQL: {ex}")
            return []
