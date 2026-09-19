"""
FULFILL-X Coordinator REST API Router (Phase 06)
Exposes FastAPI endpoints for coordinator engine status and proposal reconciliation execution.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.schemas.world import ApiResponse
from app.schemas.agent import AgentProposal
from app.schemas.coordinator import CoordinatorResult
from app.services.coordinator import coordinator_service

router = APIRouter(prefix="/api/coordinator", tags=["Coordinator Engine"])

class CoordinatorRunRequest(BaseModel):
  target_node_ids: List[str] = Field(default_factory=list)
  proposals: Optional[List[AgentProposal]] = None

@router.get("/status")
async def get_coordinator_status() -> ApiResponse[Dict[str, Any]]:
  """Returns current status and capabilities of the Coordinator Engine."""
  return ApiResponse(
    success=True,
    data={
      "status": "ONLINE",
      "engine": "DeterministicReconciliationEngine",
      "version": "0.6.0",
      "supported_objectives": [
        "MINIMIZE_STOCKOUT_RISK",
        "REDUCE_SUPPLIER_DISRUPTION",
        "REDUCE_DELAY_AND_COST",
        "PROTECT_SERVICE_LEVEL",
        "REDUCE_EMISSIONS",
        "REDUCE_SYSTEMIC_FRAGILITY",
      ],
      "safety_boundary": "Non-Authoritative Candidate Generation (No World State Mutation)",
    },
  )

@router.post("/run", response_model=ApiResponse[CoordinatorResult])
async def run_coordinator(req: CoordinatorRunRequest) -> ApiResponse[CoordinatorResult]:
  """Runs the Coordinator Engine against provided proposals or current specialist state."""
  try:
    result = await coordinator_service.run_coordination(
      proposals=req.proposals,
      target_node_ids=req.target_node_ids,
    )
    return ApiResponse(success=True, data=result)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Coordinator execution failed: {str(e)}")

@router.post("/run-all", response_model=ApiResponse[CoordinatorResult])
async def run_all_with_coordinator(req: CoordinatorRunRequest) -> ApiResponse[CoordinatorResult]:
  """Executes all 6 specialist agents and runs full coordinator reconciliation in a single call."""
  try:
    result = await coordinator_service.run_coordination(
      proposals=None,
      target_node_ids=req.target_node_ids,
    )
    return ApiResponse(success=True, data=result)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Coordinator end-to-end run failed: {str(e)}")
