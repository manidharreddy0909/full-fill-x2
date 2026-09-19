"""
FULFILL-X Graph Neural Networks & Causal Intelligence API Router (Phase 7)
Exposes REST endpoints for graph snapshots, GNN inference, propagation traces,
causal hypotheses, and counterfactual simulations.
"""
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.graph.service import GraphPlatformService
from app.graph.schemas import (
    GraphSnapshot,
    GraphFeatures,
    GraphPrediction,
    PropagationTrace,
    CausalHypothesis,
    CounterfactualRequest,
    CounterfactualRun,
    GraphModelMetadata,
)
from app.api.deps import get_security_context, require_permission
from app.schemas.auth import Permission, SecurityContext


router = APIRouter(prefix="/api", tags=["Graph & Causal Intelligence"])
service = GraphPlatformService.get_instance()


@router.get("/graph/snapshot", response_model=GraphSnapshot)
def get_graph_snapshot(
    ctx: SecurityContext = Depends(require_permission(Permission.GRAPH_READ))
):
    """Retrieve current graph snapshot with node and edge topology."""
    return service.get_current_graph_snapshot()


@router.get("/graph/features", response_model=GraphFeatures)
def get_graph_features(
    ctx: SecurityContext = Depends(require_permission(Permission.GRAPH_READ))
):
    """Retrieve extracted graph feature matrices and centrality metrics."""
    return service.get_graph_features()


@router.post("/gnn/predict", response_model=GraphPrediction)
def predict_node_risk(
    target_node_id: str = Query(..., description="Target node ID for risk prediction"),
    horizon_hours: int = Query(24, ge=1, le=168),
    ctx: SecurityContext = Depends(require_permission(Permission.GNN_PREDICT))
):
    """Execute GNN node risk prediction with 95% confidence bounds."""
    try:
        return service.predict_node_risk(target_node_id=target_node_id, horizon_hours=horizon_hours)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/graph/propagate", response_model=PropagationTrace)
def analyze_disruption_propagation(
    origin_node_id: str = Query(..., description="Origin node ID for disruption propagation analysis"),
    max_depth: int = Query(4, ge=1, le=10),
    ctx: SecurityContext = Depends(require_permission(Permission.GRAPH_ANALYZE))
):
    """Analyze multi-hop downstream disruption propagation trajectories."""
    return service.analyze_propagation(origin_node_id=origin_node_id, max_depth=max_depth)


@router.get("/causal/hypotheses", response_model=List[CausalHypothesis])
def get_causal_hypotheses(
    origin_node_id: str = Query("sup-001", description="Origin node ID for causal hypothesis generation"),
    ctx: SecurityContext = Depends(require_permission(Permission.CAUSAL_READ))
):
    """Generate structured causal hypotheses linking root causes to downstream impacts."""
    return service.generate_causal_hypotheses(origin_node_id=origin_node_id)


@router.post("/causal/counterfactual", response_model=CounterfactualRun)
def run_counterfactual_simulation(
    req: CounterfactualRequest,
    ctx: SecurityContext = Depends(require_permission(Permission.CAUSAL_COUNTERFACTUAL))
):
    """Execute sandboxed counterfactual do-intervention simulation."""
    return service.run_counterfactual(req)
