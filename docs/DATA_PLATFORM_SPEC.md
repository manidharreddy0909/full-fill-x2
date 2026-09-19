# FULFILL-X — DATA PLATFORM SPECIFICATION (Phase 2)

## 1. PURPOSE & ARCHITECTURE OVERVIEW

The FULFILL-X Data Platform establishes a production-grade, local-first data architecture. It decouples the core domain intelligence logic (`Observe` $\rightarrow$ `Risk` $\rightarrow$ `Specialists` $\rightarrow$ `Coordinator` $\rightarrow$ `Adversary` $\rightarrow$ `Planner` $\rightarrow$ `Verification` $\rightarrow$ `Human Decision Gate` $\rightarrow$ `Evaluation`) from persistence technologies using dependency inversion.

```
                          +-------------------------------+
                          |   FULFILL-X DOMAIN ENGINE     |
                          +---------------+---------------+
                                          |
                                          v
                          +---------------+---------------+
                          |     REPOSITORY CONTRACTS      |
                          +---------------+---------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
                   v                                             v
    +--------------+---------------+             +---------------+---------------+
    |   IN-MEMORY REPOSITORIES     |             |  POSTGRESQL 16 PERSISTENCE    |
    | (Fast Unit & Offline Testing)|             | (Async SQLAlchemy 2.0 / Alembic)|
    +------------------------------+             +-------------------------------+
```

---

## 2. GOVERNANCE & COST MODEL

| Tier | Infrastructure | Policy & Scope |
| :--- | :--- | :--- |
| **Tier A (Primary)** | PostgreSQL 16 (Docker), Redis 7 (Docker), SQLite, In-Memory | **FREE / LOCAL FIRST**. Zero cloud costs for development, testing, and offline evaluation. |
| **Tier B (Optional)** | AWS S3, CloudFront, Cognito | Used only when Free Tier verified and cloud CDN needed. |
| **Tier C (Controlled)**| AWS RDS, AWS Bedrock, ECS Fargate | Metered cloud infrastructure; optional with automatic local fallback. |

---

## 3. CORE PLATFORM CAPABILITIES

1. **Dual Persistence Modes**: Switch between `PERSISTENCE_MODE=memory` (fast unit tests, demo determinism) and `PERSISTENCE_MODE=postgres` (durable history).
2. **Data Provenance & Lineage**: Every dataset, signal, and snapshot contains sha256 content hashes, source URLs, collector metadata, and licenses.
3. **Data Quality Scorecard**: Automated runtime verification of orphan edge references, missing node IDs, and schema compliance.
4. **Deterministic Reseed**: `seed=42` produces 100% identical logical networks and initial risk maps across runs.
5. **Portable Export/Import**: Full export to `JSON`, `JSONL`, and `CSV` with metadata versioning.
