"""
FULFILL-X Risk Engine REST API Endpoints (P03-010)
"""
from fastapi import APIRouter, HTTPException, status

from app.schemas.risk import RiskScoreMap, NodeRiskDetail
from app.schemas.world import ApiResponse
from app.services.risk import RiskService

router = APIRouter(prefix="/api/risks", tags=["Risk Engine"])
service = RiskService()


@router.get("", response_model=ApiResponse[RiskScoreMap])
def get_risk_map() -> ApiResponse[RiskScoreMap]:
    """Fetch current full RiskScoreMap."""
    risk_map = service.get_risk_map()
    return ApiResponse(data=risk_map)


@router.get("/nodes/{node_id}", response_model=ApiResponse[NodeRiskDetail])
def get_node_risk_detail(node_id: str) -> ApiResponse[NodeRiskDetail]:
    """Fetch detailed risk scores and evidence explanation for a single node."""
    detail = service.get_node_risk_detail(node_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NODE_NOT_FOUND", "message": f"Risk detail for node '{node_id}' not found"},
        )
    return ApiResponse(data=detail)


@router.get("/network", response_model=ApiResponse[dict])
def get_network_risk_summary() -> ApiResponse[dict]:
    """Fetch network health and highest risk nodes summary."""
    risk_map = service.get_risk_map()
    return ApiResponse(
        data={
            "network_health_score": risk_map.network_health,
            "highest_risk_nodes": risk_map.highest_risk_nodes,
            "computed_at": risk_map.computed_at.isoformat(),
        }
    )


@router.post("/recalculate", response_model=ApiResponse[RiskScoreMap])
def recalculate_risk() -> ApiResponse[RiskScoreMap]:
    """Trigger explicit risk engine recalculation."""
    risk_map = service.recalculate_risk()
    return ApiResponse(data=risk_map)


@router.post("/reset", response_model=ApiResponse[RiskScoreMap])
def reset_risk_state() -> ApiResponse[RiskScoreMap]:
    """Reset risk state and signals back to baseline snapshot."""
    risk_map = service.reset_risk_state()
    return ApiResponse(data=risk_map)
