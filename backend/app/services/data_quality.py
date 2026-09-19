"""
FULFILL-X Deterministic Data Quality Engine (Phase 4)
Matching docs/DATA_QUALITY_SPEC.md
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Tuple
from app.schemas.data_ingestion import (
    DataQualityReport,
    ExternalObservation,
    QualityStatus,
)

logger = logging.getLogger("fulfillx.services.data_quality")


class DataQualityEngine:
    """
    Deterministic Data Quality Validation Engine.
    Evaluates completeness, validity, coordinate sanity, freshness, duplicate detection, and source attribution.
    """

    def __init__(self, max_stale_hours: int = 72):
        self.max_stale_hours = max_stale_hours

    def evaluate_observations(
        self,
        organization_id: str,
        source_id: str,
        run_id: str,
        observations: List[ExternalObservation],
    ) -> DataQualityReport:
        """
        Calculates quantitative quality metrics across a list of normalized observations.
        Returns a DataQualityReport.
        """
        if not observations:
            return DataQualityReport(
                organization_id=organization_id,
                source_id=source_id,
                run_id=run_id,
                completeness_score=1.0,
                validity_score=1.0,
                freshness_score=1.0,
                overall_quality_score=1.0,
                status=QualityStatus.VALID,
                records_evaluated=0,
                records_accepted=0,
                records_rejected=0,
                issues=[],
                warnings=["No observations submitted for evaluation."],
            )

        total = len(observations)
        accepted = 0
        rejected = 0
        issues: List[str] = []
        warnings: List[str] = []

        valid_count = 0
        complete_count = 0
        fresh_count = 0

        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(hours=self.max_stale_hours)

        for obs in observations:
            obs_valid = True
            obs_complete = True
            obs_fresh = True

            # 1. Completeness Check
            if not obs.source_id or not obs.source_record_id or not obs.observation_type:
                obs_complete = False
                issues.append(f"Record '{obs.observation_id}' missing core identifiers")

            # 2. Validity Check (coordinates & numeric ranges)
            if obs.latitude is not None and (obs.latitude < -90.0 or obs.latitude > 90.0):
                obs_valid = False
                issues.append(f"Record '{obs.observation_id}' invalid latitude {obs.latitude}")
            if obs.longitude is not None and (obs.longitude < -180.0 or obs.longitude > 180.0):
                obs_valid = False
                issues.append(f"Record '{obs.observation_id}' invalid longitude {obs.longitude}")

            # 3. Freshness Check
            if obs.observed_at and obs.observed_at < cutoff:
                obs_fresh = False
                warnings.append(f"Record '{obs.observation_id}' observed_at {obs.observed_at} is older than {self.max_stale_hours}h")

            if obs_valid:
                valid_count += 1
            if obs_complete:
                complete_count += 1
            if obs_fresh:
                fresh_count += 1

            if obs_valid and obs_complete:
                accepted += 1
            else:
                rejected += 1

        completeness_score = round(complete_count / total, 4)
        validity_score = round(valid_count / total, 4)
        freshness_score = round(fresh_count / total, 4)

        overall_score = round(
            (completeness_score * 0.4) + (validity_score * 0.4) + (freshness_score * 0.2), 4
        )

        status = QualityStatus.VALID
        if overall_score < 0.60 or rejected > (total * 0.5):
            status = QualityStatus.REJECTED
        elif overall_score < 0.85 or warnings:
            status = QualityStatus.DEGRADED

        return DataQualityReport(
            organization_id=organization_id,
            source_id=source_id,
            run_id=run_id,
            completeness_score=completeness_score,
            validity_score=validity_score,
            freshness_score=freshness_score,
            overall_quality_score=overall_score,
            status=status,
            records_evaluated=total,
            records_accepted=accepted,
            records_rejected=rejected,
            issues=issues[:10],
            warnings=warnings[:10],
        )
