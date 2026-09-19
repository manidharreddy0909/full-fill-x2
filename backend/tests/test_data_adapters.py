"""
FULFILL-X Real-World Data Adapter Unit Tests (Phase 4)
Validates vendor-neutral source adapters (Weather, Earthquakes, Geospatial, RSS).
"""
import pytest
from app.adapters.weather import OpenMeteoWeatherAdapter
from app.adapters.earthquake import USGSEarthquakeAdapter
from app.adapters.geospatial import OpenStreetMapGeospatialAdapter
from app.adapters.rss_news import RSSWeakSignalAdapter


@pytest.mark.asyncio
async def test_weather_adapter_lifecycle():
    """Verify Open-Meteo Weather adapter fetching, normalization, and signal generation."""
    adapter = OpenMeteoWeatherAdapter()
    assert await adapter.health_check() is True

    raw_records = await adapter.fetch()
    assert len(raw_records) == 4

    observations = await adapter.normalize(raw_records)
    assert len(observations) == 4
    assert observations[0].observation_type == "WEATHER_CONDITION"

    signals = await adapter.generate_signals(observations)
    assert isinstance(signals, list)


@pytest.mark.asyncio
async def test_earthquake_adapter_lifecycle():
    """Verify USGS GeoJSON Earthquake adapter fetching, normalization, and signal generation."""
    adapter = USGSEarthquakeAdapter()
    assert await adapter.health_check() is True

    raw_records = await adapter.fetch()
    assert len(raw_records) > 0

    observations = await adapter.normalize(raw_records)
    assert len(observations) == len(raw_records)
    assert observations[0].observation_type == "SEISMIC_EVENT"

    signals = await adapter.generate_signals(observations)
    assert isinstance(signals, list)


@pytest.mark.asyncio
async def test_geospatial_adapter_lifecycle():
    """Verify OpenStreetMap Geospatial adapter fetching and normalization."""
    adapter = OpenStreetMapGeospatialAdapter()
    assert await adapter.health_check() is True

    raw_records = await adapter.fetch()
    assert len(raw_records) == 4

    observations = await adapter.normalize(raw_records)
    assert len(observations) == 4
    assert observations[0].observation_type == "GEOSPATIAL_FACILITY"


@pytest.mark.asyncio
async def test_rss_adapter_prompt_injection_safety():
    """Verify RSS adapter handles news items safely and wraps untrusted text."""
    adapter = RSSWeakSignalAdapter()
    assert await adapter.health_check() is True

    raw_records = await adapter.fetch()
    assert len(raw_records) > 0

    observations = await adapter.normalize(raw_records)
    assert len(observations) > 0
    assert "untrusted_text" in observations[0].payload
