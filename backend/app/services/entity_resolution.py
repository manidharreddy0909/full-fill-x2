"""
FULFILL-X Deterministic Entity Resolution Service (Phase 4)
Matching docs/ENTITY_RESOLUTION_SPEC.md
"""
import math
import logging
from typing import List, Optional, Tuple
from app.schemas.data_ingestion import (
    EntityResolutionCandidate,
    EntityMatchStatus,
)
from app.repository.world import WorldRepository

logger = logging.getLogger("fulfillx.services.entity_resolution")


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates geographical distance between two lat/lon points in km."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class EntityResolutionService:
    """
    Deterministic Entity Resolution Service.
    Matches external entity names and spatial coordinates against canonical WorldRepository graph nodes.
    """

    def __init__(self, world_repository: Optional[WorldRepository] = None):
        self.world_repo = world_repository or WorldRepository.get_instance()
        self.aliases: dict[str, str] = {
            "rotterdam": "port-rotterdam",
            "port of rotterdam": "port-rotterdam",
            "kobe": "sup-001",
            "singapore": "port-singapore",
            "chicago": "hub-001",
            "frankfurt": "hub-002",
        }

    def resolve_entity(
        self,
        organization_id: str,
        entity_name: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> EntityResolutionCandidate:
        """
        Attempts to resolve external entity string or coordinates to a canonical node ID.
        Returns an EntityResolutionCandidate payload.
        """
        norm_name = entity_name.strip().lower()

        # 1. Alias lookup
        for alias, node_id in self.aliases.items():
            if alias in norm_name:
                return EntityResolutionCandidate(
                    organization_id=organization_id,
                    external_entity_name=entity_name,
                    external_latitude=latitude,
                    external_longitude=longitude,
                    matched_node_id=node_id,
                    match_score=0.95,
                    match_status=EntityMatchStatus.RESOLVED,
                    match_reason=f"Matched canonical alias '{alias}' -> '{node_id}'",
                )

        # 2. Canonical graph node ID or name exact match
        snapshot = self.world_repo.get_snapshot()
        for node in snapshot.nodes:
            if node.id.lower() in norm_name or node.name.lower() in norm_name:
                return EntityResolutionCandidate(
                    organization_id=organization_id,
                    external_entity_name=entity_name,
                    external_latitude=latitude,
                    external_longitude=longitude,
                    matched_node_id=node.id,
                    match_score=0.90,
                    match_status=EntityMatchStatus.RESOLVED,
                    match_reason=f"Exact match on graph node '{node.id}' ({node.name})",
                )

        # 3. Spatial proximity matching if coordinates provided
        if latitude is not None and longitude is not None:
            best_node_id = None
            min_dist = float("inf")

            for node in snapshot.nodes:
                n_lat = node.metadata.get("latitude", node.position.y * 5.0 if node.position else 0.0)
                n_lon = node.metadata.get("longitude", node.position.x * 5.0 if node.position else 0.0)
                dist = haversine_distance_km(latitude, longitude, n_lat, n_lon)
                if dist < min_dist:
                    min_dist = dist
                    best_node_id = node.id

            if best_node_id:
                score = round(max(0.5, 1.0 - (min_dist / 10000.0)), 2)
                status = EntityMatchStatus.RESOLVED if min_dist <= 500.0 else EntityMatchStatus.NEEDS_REVIEW
                return EntityResolutionCandidate(
                    organization_id=organization_id,
                    external_entity_name=entity_name,
                    external_latitude=latitude,
                    external_longitude=longitude,
                    matched_node_id=best_node_id,
                    match_score=score,
                    match_status=status,
                    match_reason=f"Spatial proximity match {round(min_dist, 1)}km to '{best_node_id}'",
                )

        # 4. Unresolved fallback
        return EntityResolutionCandidate(
            organization_id=organization_id,
            external_entity_name=entity_name,
            external_latitude=latitude,
            external_longitude=longitude,
            matched_node_id=None,
            match_score=0.0,
            match_status=EntityMatchStatus.UNRESOLVED,
            match_reason="No matching alias, graph node label, or spatial proximity candidate found",
        )
