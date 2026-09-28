"""
Hindsight Experiential Resilience REST API Endpoints (Phase 2A)

Exposes endpoints for Retain, Recall, Reflect, Genomes, Transferability Assessment,
and the Canonical Vertical Slice closed learning loop.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field

from app.hindsight.models import (
    Experience,
    RetainRequest,
    RetainResult,
    RecallQuery,
    RecallResult,
    ResilienceGenome,
    TransferAssessment,
    CurrentContext,
)
from app.hindsight.retain import experience_recorder
from app.hindsight.recall import experience_retriever
from app.hindsight.reflect import reflection_engine
from app.hindsight.transfer import transfer_evaluator
from app.hindsight.service import hindsight_orchestrator
from app.hindsight.client import HindsightClient

router = APIRouter(prefix="/api", tags=["Hindsight Experiential Memory"])


class ReflectRequest(BaseModel):
    experience_ids: Optional[List[str]] = None
    strategy_name: Optional[str] = "Supplier Substitution"


class TransferEvaluateRequest(BaseModel):
    genome_id: str
    current_context: CurrentContext


class CanonicalLoopRequest(BaseModel):
    supplier_d_capacity: float = Field(default=0.28, ge=0.0, le=1.0)
    enable_memory: bool = True


@router.post("/experiences/retain", response_model=RetainResult)
async def retain_experience(body: RetainRequest) -> RetainResult:
    """
    Retain an operational experience into Hindsight experiential memory.
    """
    return await experience_recorder.retain_experience(body.experience)


@router.post("/experiences/recall", response_model=RecallResult)
async def recall_experiences(body: RecallQuery) -> RecallResult:
    """
    Recall relevant operational experiences from Hindsight matching incident signature or context.
    """
    return await experience_retriever.recall(body)


@router.get("/experiences", response_model=List[Experience])
async def list_experiences() -> List[Experience]:
    """
    List all operational experiences currently available in the memory store.
    """
    client = HindsightClient.get_instance()
    raw = client.list_all_local()
    return [Experience.model_validate(r) for r in raw]


@router.post("/experiences/reflect", response_model=ResilienceGenome)
async def reflect_experiences(body: ReflectRequest) -> ResilienceGenome:
    """
    Reflect across recalled experiences to synthesize or update a verified Resilience Genome.
    """
    client = HindsightClient.get_instance()
    if body.experience_ids:
        raw_list = [client.get_by_id(eid) for eid in body.experience_ids if client.get_by_id(eid)]
        experiences = [Experience.model_validate(r) for r in raw_list]
    else:
        raw_list = client.list_all_local()
        experiences = [Experience.model_validate(r) for r in raw_list]

    return reflection_engine.reflect_experiences(experiences, strategy_name=body.strategy_name)


@router.get("/genomes", response_model=List[ResilienceGenome])
async def list_genomes() -> List[ResilienceGenome]:
    """
    List all verified Resilience Genomes.
    """
    return reflection_engine.list_genomes()


@router.get("/genomes/{genome_id}", response_model=ResilienceGenome)
async def get_genome(genome_id: str) -> ResilienceGenome:
    """
    Fetch a single Resilience Genome by ID or strategy name.
    """
    genome = reflection_engine.get_genome_by_id_or_strategy(genome_id)
    if not genome:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Genome '{genome_id}' not found")
    return genome


@router.post("/transfer/evaluate", response_model=TransferAssessment)
async def evaluate_transfer(body: TransferEvaluateRequest) -> TransferAssessment:
    """
    Evaluate transferability of a Resilience Genome against current operational network conditions.
    """
    genome = reflection_engine.get_genome_by_id_or_strategy(body.genome_id)
    if not genome:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Genome '{body.genome_id}' not found")

    return transfer_evaluator.evaluate(genome=genome, current=body.current_context)


@router.post("/hindsight/canonical-loop")
async def run_canonical_slice(body: CanonicalLoopRequest) -> Dict[str, Any]:
    """
    Execute the canonical vertical slice demonstrating the before/after memory behavior.
    """
    return await hindsight_orchestrator.run_canonical_slice(
        supplier_d_capacity=body.supplier_d_capacity,
        enable_memory=body.enable_memory,
    )
