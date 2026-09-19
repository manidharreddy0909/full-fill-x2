"""
FULFILL-X Specialist Agent REST API Router (Phase 05)
Matching docs/API_CATALOG.md & docs/AGENT_SYSTEM_SPEC.md (P05-014)
"""
from fastapi import APIRouter, HTTPException, status, Body
from app.schemas.world import ApiResponse
from app.schemas.agent import (
    AgentMetadata,
    AgentResult,
    AllSpecialistProposalsResponse,
)
from app.services.agents import AgentService

router = APIRouter(prefix="/api/agents", tags=["Specialist Agent System"])
service = AgentService()


@router.get("", response_model=ApiResponse[list[AgentMetadata]])
def list_agents() -> ApiResponse[list[AgentMetadata]]:
    """
    Retrieve registered specialist agents metadata & objectives.
    """
    agents = service.list_agents()
    return ApiResponse(data=agents)


@router.get("/{agent_id}", response_model=ApiResponse[AgentMetadata])
def get_agent_by_id(agent_id: str) -> ApiResponse[AgentMetadata]:
    """
    Retrieve specific specialist agent metadata.
    """
    meta = service.get_agent_metadata(agent_id)
    if not meta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "AGENT_NOT_FOUND", "message": f"Agent '{agent_id}' not found"},
        )
    return ApiResponse(data=meta)


@router.post("/{agent_id}/run", response_model=ApiResponse[AgentResult])
async def run_single_agent(
    agent_id: str,
    target_node_ids: list[str] = Body(default=[], embed=True, description="Optional target node IDs to focus analysis"),
) -> ApiResponse[AgentResult]:
    """
    Run single specialist agent safe execution pipeline.
    Does NOT mutate authoritative world state or risk maps.
    """
    result = await service.run_agent(agent_id, target_node_ids=target_node_ids)
    return ApiResponse(data=result)


@router.post("/run-all", response_model=ApiResponse[AllSpecialistProposalsResponse])
async def run_all_specialists(
    target_node_ids: list[str] = Body(default=[], embed=True, description="Optional target node IDs to focus analysis"),
) -> ApiResponse[AllSpecialistProposalsResponse]:
    """
    Run all 6 specialist agents concurrently using asyncio.gather().
    Returns structured proposals from each independent specialist perspective.
    Does NOT mutate authoritative world state or risk maps.
    """
    response = await service.run_all_specialists(target_node_ids=target_node_ids)
    return ApiResponse(data=response)
