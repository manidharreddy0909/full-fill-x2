"""
FULFILL-X Database Engine & Session Management (Phase 2)
Provides async SQLAlchemy 2.0 engine, connection pool, sessionmaker, and health checks.
"""
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

logger = logging.getLogger("fulfillx.db.session")


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy 2.0 database models."""
    pass


_async_engine: AsyncEngine | None = None
_async_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_async_engine() -> AsyncEngine:
    global _async_engine
    if _async_engine is None:
        db_url = settings.DATABASE_URL
        # Ensure asyncpg driver dialect
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        _async_engine = create_async_engine(
            db_url,
            echo=False,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
        )
        logger.info(f"Initialized async SQLAlchemy engine for db: {db_url.split('@')[-1]}")
    return _async_engine


def get_async_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _async_session_factory
    if _async_session_factory is None:
        engine = get_async_engine()
        _async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _async_session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    session_factory = get_async_sessionmaker()
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def check_database_health() -> dict:
    """Check connectivity to PostgreSQL database."""
    try:
        engine = get_async_engine()
        async with engine.connect() as conn:
            from sqlalchemy import text
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
            return {
                "status": "HEALTHY" if val == 1 else "UNHEALTHY",
                "connected": True,
                "mode": settings.PERSISTENCE_MODE,
                "engine": "PostgreSQL (asyncpg)",
            }
    except Exception as ex:
        return {
            "status": "UNHEALTHY",
            "connected": False,
            "error": str(ex),
            "mode": settings.PERSISTENCE_MODE,
        }
