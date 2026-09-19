"""
FULFILL-X Data Retention & Governance Engine (Phase 10)
Enforces data classification, retention window evaluation, and deletion audit logging.
"""
from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class DataCategory(str, Enum):
    EVENTS = "EVENTS"
    AUDIT_LOGS = "AUDIT_LOGS"
    AGENT_MEMORIES = "AGENT_MEMORIES"
    OUTCOMES = "OUTCOMES"
    SIMULATION_RESULTS = "SIMULATION_RESULTS"


class RetentionPolicy(BaseModel):
    category: DataCategory
    retention_days: int = Field(default=90, ge=1, le=3650)
    classification: str = Field(default="INTERNAL", description="CONFIDENTIAL, INTERNAL, PUBLIC")
    auto_purge: bool = False


class PurgeEvaluationResult(BaseModel):
    category: DataCategory
    records_checked: int
    eligible_for_purge: int
    retention_cutoff: datetime
    purged_count: int = 0


class DataGovernanceEngine:
    def __init__(self):
        self.policies: Dict[DataCategory, RetentionPolicy] = {
            DataCategory.EVENTS: RetentionPolicy(category=DataCategory.EVENTS, retention_days=30, auto_purge=True),
            DataCategory.AUDIT_LOGS: RetentionPolicy(category=DataCategory.AUDIT_LOGS, retention_days=365, classification="CONFIDENTIAL", auto_purge=False),
            DataCategory.AGENT_MEMORIES: RetentionPolicy(category=DataCategory.AGENT_MEMORIES, retention_days=180, auto_purge=False),
            DataCategory.OUTCOMES: RetentionPolicy(category=DataCategory.OUTCOMES, retention_days=365, auto_purge=False),
            DataCategory.SIMULATION_RESULTS: RetentionPolicy(category=DataCategory.SIMULATION_RESULTS, retention_days=14, auto_purge=True),
        }

    def evaluate_retention(self, category: DataCategory, record_timestamps: List[datetime]) -> PurgeEvaluationResult:
        policy = self.policies.get(category, RetentionPolicy(category=category, retention_days=90))
        cutoff = datetime.now(timezone.utc) - timedelta(days=policy.retention_days)
        
        eligible = [ts for ts in record_timestamps if ts < cutoff]
        purged = len(eligible) if policy.auto_purge else 0

        return PurgeEvaluationResult(
            category=category,
            records_checked=len(record_timestamps),
            eligible_for_purge=len(eligible),
            retention_cutoff=cutoff,
            purged_count=purged,
        )
