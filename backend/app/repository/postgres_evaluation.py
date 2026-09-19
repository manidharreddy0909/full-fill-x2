"""
FULFILL-X PostgreSQL Evaluation Repository Implementation (Phase 2)
Provides PostgreSQL persistent storage for Evaluation Runs and Benchmark Reports.
"""
import logging
from typing import List, Optional
from sqlalchemy import select
from app.db.session import get_async_sessionmaker
from app.models.db import EvaluationRunModel
from app.schemas.evaluation import EvaluationRun
from app.repository.evaluation import EvaluationRepository

logger = logging.getLogger("fulfillx.repository.postgres_evaluation")


class PostgresEvaluationRepository(EvaluationRepository):
    """
    PostgreSQL-backed EvaluationRepository implementation.
    Persists evaluation benchmark runs and metrics to PostgreSQL.
    """

    def __init__(self):
        super().__init__()
        self.session_factory = get_async_sessionmaker()

    async def save_run_db(self, run: EvaluationRun) -> EvaluationRunModel:
        """Persist EvaluationRun object to PostgreSQL database."""
        # Save in in-memory list first
        self.save_run(run)
        
        async with self.session_factory() as session:
            model = EvaluationRunModel(
                run_id=run.run_id,
                scenario_id=run.scenario_id,
                seed=run.seed,
                final_health=run.summary.network_health_after,
                final_risk=run.summary.risk_score_after,
                resilience_score=run.summary.resilience_score,
                slr=run.summary.service_level_ratio,
                step_count=run.summary.step_count,
                metrics={k: v.model_dump(mode="json") for k, v in run.metrics.items()},
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            logger.info(f"Persisted EvaluationRun {run.run_id} ({run.scenario_id}) to PostgreSQL")
            return model

    async def list_runs_db(self, limit: int = 50) -> List[EvaluationRunModel]:
        """Fetch list of historical EvaluationRuns from PostgreSQL database."""
        try:
            async with self.session_factory() as session:
                stmt = select(EvaluationRunModel).order_by(EvaluationRunModel.created_at.desc()).limit(limit)
                res = await session.execute(stmt)
                return list(res.scalars().all())
        except Exception as ex:
            logger.warning(f"Error fetching evaluation runs from PostgreSQL: {ex}")
            return []
