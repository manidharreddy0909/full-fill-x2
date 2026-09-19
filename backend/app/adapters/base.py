"""
FULFILL-X Abstract Data Source Adapter Protocol (Phase 4)
Matching docs/DATA_ADAPTER_SPEC.md
"""
from typing import Protocol, Any
from datetime import datetime
from app.schemas.data_ingestion import (
    DataSourceConfig,
    RawRecord,
    ExternalObservation,
    ExternalSignal,
)


class DataSourceAdapter(Protocol):
    """
    Abstract protocol for all vendor-neutral real-world data source adapters.
    Decouples domain logic from specific HTTP APIs, RSS feeds, or vendor formats.
    """

    source_id: str
    config: DataSourceConfig

    async def health_check(self) -> bool:
        """Ping data source endpoint or check local availability."""
        ...

    async def fetch(self, organization_id: str = "org-fulfillx-default") -> list[RawRecord]:
        """Fetch raw records from data source endpoint or local fixture."""
        ...

    async def normalize(self, raw_records: list[RawRecord]) -> list[ExternalObservation]:
        """Transform raw provider JSON records into canonical ExternalObservation items."""
        ...

    async def generate_signals(
        self, observations: list[ExternalObservation]
    ) -> list[ExternalSignal]:
        """Extract validated external disruption signals from normalized observations."""
        ...
