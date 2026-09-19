# FULFILL-X — DATABASE & PERSISTENCE SPECIFICATION (Phase 2)

## 1. CONNECTION MANAGEMENT & POOLING

- **Engine**: SQLAlchemy 2.0 Async Engine (`postgresql+asyncpg://`)
- **Connection Pool**: 10 base connections, max overflow 20, pre-ping active validation (`pool_pre_ping=True`).
- **Session Factory**: `async_sessionmaker(expire_on_commit=False, autoflush=False)`.

## 2. HEALTH & RECOVERY

- **Health Check**: `check_database_health()` executes `SELECT 1` on startup and via `/api/data/status`.
- **Graceful Fallback**: If PostgreSQL connection fails, domain repositories log warnings and seamlessly default to thread-safe in-memory state.
