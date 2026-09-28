"""
Hindsight Provenance & Truth Status Framework (Phase 2A)

Enforces strict truth provenance across all operational memories, evidence items,
and reflections. Never conflates simulated evidence with observed evidence.
"""
from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class TruthStatus(str, Enum):
    """
    Epistemic truth status of operational knowledge.
    Distinguishes grounded real-world telemetry from hypothetical, synthetic, or decayed data.
    """
    OBSERVED = "OBSERVED"        # Direct real-world execution observation
    REPORTED = "REPORTED"        # Stated by external partner / vendor, unverified
    INFERRED = "INFERRED"        # Derived via ML model, topological inference, or causal graph
    HYPOTHESIS = "HYPOTHESIS"    # Agent proposal not yet tested in sandbox or reality
    SIMULATED = "SIMULATED"      # High-fidelity digital twin / Monte Carlo simulation output
    DERIVED = "DERIVED"          # Aggregated or synthesized across multiple experiences
    STALE = "STALE"              # Previously valid evidence that has exceeded its TTL


class ProvenanceMetadata(BaseModel):
    """
    Traceable metadata guaranteeing data lineage and source accountability.
    """
    source_type: TruthStatus = TruthStatus.OBSERVED
    telemetry_source_id: Optional[str] = None
    session_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    recorded_by: str = Field(default="system")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    is_simulation: bool = False
    evidence_count: int = Field(default=1, ge=0)
    audit_notes: Optional[str] = None

    def validate_simulation_boundary(self) -> None:
        """
        Safety assertion: Ensure simulated data is never marked as OBSERVED.
        """
        if self.is_simulation and self.source_type == TruthStatus.OBSERVED:
            raise ValueError(
                "CRITICAL INTEGRITY VIOLATION: Simulation evidence cannot be labeled as OBSERVED truth."
            )
