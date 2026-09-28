"""
Hindsight Semantic & Structured Recall (Phase 2A)

Recalls relevant historical experiences for the active incident context while
strictly preserving truth status and provenance separation.
"""
import logging
from typing import List, Optional, Dict, Any
from app.hindsight.models import (
    Experience,
    RecallQuery,
    RecallResult,
)
from app.hindsight.provenance import TruthStatus
from app.hindsight.client import HindsightClient

logger = logging.getLogger("fulfill-x.hindsight.recall")


class ExperienceRetriever:
    """
    Retrieves and ranks relevant operational experiences from Hindsight.
    """
    def __init__(self, client: Optional[HindsightClient] = None):
        self.client = client or HindsightClient.get_instance()

    async def recall(self, query: RecallQuery) -> RecallResult:
        """
        Execute recall query against Hindsight.
        """
        raw_items = await self.client.recall(query.model_dump())

        experiences: List[Experience] = []
        observed_count = 0
        simulated_count = 0
        derived_count = 0
        relevance_map: Dict[str, float] = {}

        for item in raw_items:
            # Map raw dict into validated Experience model
            try:
                rel = item.pop("_relevance_score", 0.75)
                exp = Experience.model_validate(item)

                # Filter by required truth status if requested
                if query.required_truth_status and exp.truth_status not in query.required_truth_status:
                    continue

                # Filter out simulation if explicitly excluded
                if not query.include_simulated and exp.truth_status == TruthStatus.SIMULATED:
                    continue

                if exp.truth_status == TruthStatus.OBSERVED:
                    observed_count += 1
                elif exp.truth_status == TruthStatus.SIMULATED:
                    simulated_count += 1
                elif exp.truth_status == TruthStatus.DERIVED:
                    derived_count += 1

                experiences.append(exp)
                relevance_map[exp.experience_id] = rel
            except Exception as e:
                logger.warning(f"Failed to parse experience during recall: {e}")
                continue

        logger.info(
            f"HINDSIGHT_RECALL: query='{query.incident_signature}' "
            f"found={len(experiences)} "
            f"observed={observed_count} "
            f"simulated={simulated_count} "
            f"derived={derived_count}"
        )

        return RecallResult(
            experiences=experiences,
            total_found=len(experiences),
            observed_count=observed_count,
            simulated_count=simulated_count,
            derived_count=derived_count,
            query_signature=query.incident_signature or "ALL",
            relevance_scores=relevance_map,
        )


experience_retriever = ExperienceRetriever()
