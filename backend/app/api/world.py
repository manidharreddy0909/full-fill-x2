"""
FULFILL-X World Model REST API Endpoints
Typed FastAPI endpoints matching docs/API_CATALOG.md (P02-006)
"""
from typing import Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.schemas.world import (
    WorldStateSnapshot,
    WorldNode,
    WorldEdge,
    NodeType,
    WorldSummary,
    ApiResponse,
)
from app.services.world import WorldService

router = APIRouter(prefix="/api/world", tags=["World Model"])
service = WorldService()


class SeedWorldRequest(BaseModel):
    preset: str = Field(default="healthy", description="Preset scenario: healthy, double_punch, custom")
    seed: int = Field(default=42, description="Deterministic integer seed value")


@router.get("", response_model=ApiResponse[WorldStateSnapshot])
def get_world_snapshot() -> ApiResponse[WorldStateSnapshot]:
    """Fetch current world state snapshot."""
    snapshot = service.get_snapshot()
    return ApiResponse(data=snapshot)


@router.get("/summary", response_model=ApiResponse[WorldSummary])
def get_world_summary() -> ApiResponse[WorldSummary]:
    """Fetch aggregated network summary metrics."""
    summary = service.get_summary()
    return ApiResponse(data=summary)


@router.get("/graph", response_model=ApiResponse[dict[str, Any]])
def get_world_graph() -> ApiResponse[dict[str, Any]]:
    """Fetch graph topology layout for frontend visualizers."""
    layout = service.get_graph_layout()
    return ApiResponse(data=layout)


@router.get("/nodes/{node_id}", response_model=ApiResponse[WorldNode])
def get_node_by_id(node_id: str) -> ApiResponse[WorldNode]:
    """Fetch single WorldNode by ID."""
    node = service.get_node(node_id)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NODE_NOT_FOUND", "message": f"WorldNode '{node_id}' not found"},
        )
    return ApiResponse(data=node)


@router.get("/edges/{edge_id}", response_model=ApiResponse[WorldEdge])
def get_edge_by_id(edge_id: str) -> ApiResponse[WorldEdge]:
    """Fetch single WorldEdge by ID."""
    edge = service.get_edge(edge_id)
    if not edge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EDGE_NOT_FOUND", "message": f"WorldEdge '{edge_id}' not found"},
        )
    return ApiResponse(data=edge)


@router.post("/seed", response_model=ApiResponse[WorldStateSnapshot])
def seed_world(req: SeedWorldRequest) -> ApiResponse[WorldStateSnapshot]:
    """Seed world graph with deterministic synthetic data."""
    snapshot = service.seed_world(preset=req.preset, seed=req.seed)
    return ApiResponse(data=snapshot)


@router.post("/reset", response_model=ApiResponse[WorldStateSnapshot])
def reset_world() -> ApiResponse[WorldStateSnapshot]:
    """Reset world graph back to baseline seeded state."""
    snapshot = service.reset_world()
    return ApiResponse(data=snapshot)
