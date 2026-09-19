"""
FULFILL-X Real-World Data Ingestion Service (Phase 4)
Matching docs/DATA_INTEGRATION_ARCHITECTURE.md & docs/DATA_OPERATIONS.md
"""
import time
import logging
from typing import Dict, List, Optional
from uuid import uuid4

from app.adapters.registry import AdapterRegistry
from app.services.data_quality import DataQualityEngine
from app.services.entity_resolution import EntityResolutionService
from app.services.risk import RiskService
from app.realtime.event_bus import event_bus, EventBus
from app.schemas.data_ingestion import (
    ExternalObservation,
    ExternalSignal,
    IngestionRunSummary,
    DataQualityReport,
    IngestionMode,
    EntityResolutionCandidate,
)
from app.schemas.events import EventEnvelope, EventSeverity
from app.schemas.signal import SignalCreateRequest, SignalSeverity, SignalType

logger = logging.getLogger("fulfillx.services.ingestion")


class RealDataIngestionService:
    """
    Real-World Data Ingestion Engine & Safety Boundary.
    Orchestrates vendor-neutral data fetching, normalization, data quality validation,
    idempotent deduplication, entity resolution, and fusion into RiskService.
    """

    _instance: Optional["RealDataIngestionService"] = None

    def __init__(
        self,
        adapter_registry: Optional[AdapterRegistry] = None,
        quality_engine: Optional[DataQualityEngine] = None,
        entity_resolution: Optional[EntityResolutionService] = None,
        risk_service: Optional[RiskService] = None,
        event_bus_inst: Optional[EventBus] = None,
    ):
        self.registry = adapter_registry or AdapterRegistry.get_instance()
        self.quality_engine = quality_engine or DataQualityEngine()
        self.entity_resolution = entity_resolution or EntityResolutionService()
        self.risk_service = risk_service or RiskService()
        self.event_bus = event_bus_inst or event_bus

        # In-memory stores for observations, signals, quality reports, and runs
        self._observations: Dict[str, ExternalObservation] = {}
        self._signals: Dict[str, ExternalSignal] = {}
        self._quality_reports: Dict[str, DataQualityReport] = {}
        self._runs: Dict[str, IngestionRunSummary] = {}
        self._processed_hashes: set[str] = set()

    @classmethod
    def get_instance(cls) -> "RealDataIngestionService":
        if cls._instance is None:
            cls._instance = RealDataIngestionService()
        return cls._instance

    async def run_ingestion_for_source(
        self,
        source_id: str,
        organization_id: str = "org-fulfillx-default",
        mode_override: Optional[IngestionMode] = None,
    ) -> IngestionRunSummary:
        """
        Executes a complete ingestion run for a specific source ID.
        """
        adapter = self.registry.get_adapter(source_id)
        if not adapter:
            raise ValueError(f"Unknown data source adapter '{source_id}'")

        mode = mode_override or self.registry.mode
        start_time = time.time()
        run_id = f"run-{uuid4().hex[:12]}"

        # Broadcast DATA_INGESTION_STARTED
        await self.event_bus.publish(
            event_type="DATA_INGESTION_STARTED",
            organization_id=organization_id,
            severity=EventSeverity.INFO,
            payload={
                "run_id": run_id,
                "source_id": source_id,
                "mode": mode.value,
            },
        )

        try:
            # 1. Fetch raw records
            raw_records = await adapter.fetch(organization_id=organization_id)
            records_fetched = len(raw_records)

            # 2. Idempotent Deduplication
            new_raw_records = []
            for r in raw_records:
                dedup_key = f"{r.organization_id}:{r.source_id}:{r.content_hash}"
                if dedup_key not in self._processed_hashes:
                    self._processed_hashes.add(dedup_key)
                    new_raw_records.append(r)

            # 3. Normalize into ExternalObservations
            observations = await adapter.normalize(new_raw_records)
            for obs in observations:
                self._observations[str(obs.observation_id)] = obs

            # 4. Evaluate Data Quality
            quality_report = self.quality_engine.evaluate_observations(
                organization_id=organization_id,
                source_id=source_id,
                run_id=run_id,
                observations=observations,
            )
            self._quality_reports[str(quality_report.report_id)] = quality_report

            # 5. Entity Resolution & Signal Generation
            signals_generated = 0
            if quality_report.status != "REJECTED":
                ext_signals = await adapter.generate_signals(observations)

                for sig in ext_signals:
                    # Resolve entities for signal
                    resolved_entities = []
                    for loc in [sig.evidence.get("location", "Unknown")]:
                        candidate = self.entity_resolution.resolve_entity(
                            organization_id=organization_id,
                            entity_name=str(loc),
                            latitude=sig.latitude,
                            longitude=sig.longitude,
                        )
                        if candidate.matched_node_id:
                            resolved_entities.append(candidate.matched_node_id)

                    if resolved_entities:
                        sig.affected_entity_ids = list(set(sig.affected_entity_ids + resolved_entities))

                    self._signals[str(sig.signal_id)] = sig
                    signals_generated += 1

                    # Fuse into internal RiskService
                    target_entity = sig.affected_entity_ids[0] if sig.affected_entity_ids else "sup-001"
                    req = SignalCreateRequest(
                        type=SignalType.WEATHER if "STORM" in sig.signal_type else SignalType.LOGISTICS,
                        severity=SignalSeverity[sig.severity] if sig.severity in SignalSeverity.__members__ else SignalSeverity.HIGH,
                        title=sig.evidence.get("summary", f"Real-World Signal: {sig.signal_type}"),
                        description=str(sig.evidence),
                        source=sig.source_id,
                        affected_node_ids=[target_entity],
                        confidence=sig.confidence,
                    )
                    self.risk_service.inject_signal(req)

            latency_ms = round((time.time() - start_time) * 1000, 2)

            run_summary = IngestionRunSummary(
                run_id=uuid4(),
                organization_id=organization_id,
                source_id=source_id,
                mode=mode,
                records_fetched=records_fetched,
                records_processed=len(observations),
                records_accepted=quality_report.records_accepted,
                records_rejected=quality_report.records_rejected,
                signals_generated=signals_generated,
                latency_ms=latency_ms,
                status="SUCCESS" if quality_report.status != "REJECTED" else "DEGRADED",
            )
            self._runs[run_id] = run_summary

            # Broadcast DATA_INGESTION_COMPLETED
            await self.event_bus.publish(
                event_type="DATA_INGESTION_COMPLETED",
                organization_id=organization_id,
                severity=EventSeverity.INFO,
                payload={
                    "run_id": run_id,
                    "source_id": source_id,
                    "records_accepted": quality_report.records_accepted,
                    "signals_generated": signals_generated,
                    "quality_score": quality_report.overall_quality_score,
                },
            )

            return run_summary

        except Exception as e:
            logger.error(f"Ingestion run failed for source '{source_id}': {e}", exc_info=True)
            latency_ms = round((time.time() - start_time) * 1000, 2)
            fail_summary = IngestionRunSummary(
                run_id=uuid4(),
                organization_id=organization_id,
                source_id=source_id,
                mode=mode,
                latency_ms=latency_ms,
                status="FAILED",
                error_message=str(e),
            )
            self._runs[run_id] = fail_summary
            return fail_summary

    async def run_all_sources(self, organization_id: str = "org-fulfillx-default") -> List[IngestionRunSummary]:
        """Runs ingestion across all registered data adapters."""
        summaries = []
        for adapter in self.registry.list_adapters():
            if adapter.config.enabled:
                summary = await self.run_ingestion_for_source(adapter.source_id, organization_id=organization_id)
                summaries.append(summary)
        return summaries

    def list_observations(self) -> List[ExternalObservation]:
        return list(self._observations.values())

    def list_signals(self) -> List[ExternalSignal]:
        return list(self._signals.values())

    def list_quality_reports(self) -> List[DataQualityReport]:
        return list(self._quality_reports.values())

    def list_runs(self) -> List[IngestionRunSummary]:
        return list(self._runs.values())
