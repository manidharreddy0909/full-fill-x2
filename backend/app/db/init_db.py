"""
FULFILL-X Database Initialization & Bootstrap Module (Phase 2)
Provides asynchronous table creation, schema bootstrapping, and seed initialization.
"""
import logging
from app.db.session import get_async_engine, Base
from app.models.db import *  # noqa: F403

logger = logging.getLogger("fulfillx.db.init_db")


async def init_db() -> None:
    """Create database tables if they do not exist (for local/testing modes)."""
    try:
        engine = get_async_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully")
    except Exception as ex:
        logger.warning(f"Database table initialization skipped/failed: {ex}")
