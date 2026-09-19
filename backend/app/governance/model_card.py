"""
FULFILL-X Model Governance & Standardized Model Card Generator (Phase 10)
Generates audit-ready model cards for active, candidate, and challenger ML/GNN models.
"""
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ModelCard(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_id: str
    model_name: str
    version: str
    status: str = Field(default="ACTIVE", description="ACTIVE, CANDIDATE, PROMOTED, RETIRED, ROLLED_BACK")
    dataset_version: str = "v1.0"
    checksum: str
    author: str = "FULFILL-X AI Platform"
    training_origin: str = "OBSERVED"
    evaluation_metrics: Dict[str, float] = Field(default_factory=dict)
    intended_use: str = "Predictive supply chain risk assessment and demand forecasting"
    known_limitations: List[str] = Field(default_factory=lambda: [
        "Requires min 14 days operational history for optimal accuracy",
        "Subject to extreme black-swan distribution shift",
    ])
    approval_record: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ModelGovernanceEngine:
    def generate_model_card(
        self,
        model_name: str,
        version: str,
        checksum: str,
        evaluation_metrics: Dict[str, float],
        status: str = "ACTIVE",
        approved_by: Optional[str] = None,
    ) -> ModelCard:
        return ModelCard(
            model_id=f"mc-{model_name.lower()}-{version}",
            model_name=model_name,
            version=version,
            checksum=checksum,
            status=status,
            evaluation_metrics=evaluation_metrics,
            approval_record={
                "approved_by": approved_by or "Head of AI Operations",
                "approved_at": datetime.now(timezone.utc).isoformat(),
            } if approved_by else {},
        )
