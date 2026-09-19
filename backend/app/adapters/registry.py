"""
FULFILL-X Source Adapter Registry (Phase 4)
Manages all registered real-world data source adapters.
"""
import logging
from typing import Dict, List, Optional
from app.adapters.base import DataSourceAdapter
from app.adapters.weather import OpenMeteoWeatherAdapter
from app.adapters.earthquake import USGSEarthquakeAdapter
from app.adapters.geospatial import OpenStreetMapGeospatialAdapter
from app.adapters.rss_news import RSSWeakSignalAdapter
from app.schemas.data_ingestion import DataSourceConfig, IngestionMode

logger = logging.getLogger("fulfillx.adapters.registry")


class AdapterRegistry:
    """
    Singleton Registry managing vendor-neutral data source adapters.
    Supports LIVE, HYBRID, and OFFLINE deterministic modes.
    """

    _instance: Optional["AdapterRegistry"] = None

    def __init__(self):
        self.adapters: Dict[str, DataSourceAdapter] = {}
        self.mode: IngestionMode = IngestionMode.OFFLINE
        self._register_default_adapters()

    @classmethod
    def get_instance(cls) -> "AdapterRegistry":
        if cls._instance is None:
            cls._instance = AdapterRegistry()
        return cls._instance

    def register_adapter(self, adapter: DataSourceAdapter) -> None:
        """Register a new data source adapter."""
        self.adapters[adapter.source_id] = adapter
        logger.info(f"Registered data source adapter '{adapter.source_id}' ({adapter.config.name})")

    def get_adapter(self, source_id: str) -> Optional[DataSourceAdapter]:
        """Retrieve a registered adapter by source ID."""
        return self.adapters.get(source_id)

    def list_adapters(self) -> List[DataSourceAdapter]:
        """Return all registered adapters."""
        return list(self.adapters.values())

    def list_configs(self) -> List[DataSourceConfig]:
        """Return configs of all registered adapters."""
        return [adapter.config for adapter in self.adapters.values()]

    def set_ingestion_mode(self, mode: IngestionMode) -> None:
        """Set active ingestion mode (LIVE, HYBRID, OFFLINE)."""
        self.mode = mode
        logger.info(f"Ingestion mode set to '{mode}'")

    def _register_default_adapters(self) -> None:
        """Initialize default Tier A free/open data adapters."""
        self.register_adapter(OpenMeteoWeatherAdapter())
        self.register_adapter(USGSEarthquakeAdapter())
        self.register_adapter(OpenStreetMapGeospatialAdapter())
        self.register_adapter(RSSWeakSignalAdapter())
