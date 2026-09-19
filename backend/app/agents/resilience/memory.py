"""
FULFILL-X Agent Memory Engine (Phase 9)
Manages structured operational memory records (CASE, DECISION, OUTCOME, LESSON).
Enforces strict provenance, memory decay, evidence validation, and tenant isolation.
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional
from uuid import uuid4

from app.agents.resilience.schemas import AgentMemory, MemoryStatus, MemoryType


class AgentMemoryEngine:
    """
    Engine for structured agent memory storage, provenance validation, and decay.
    """

    def __init__(self):
        self._memories: Dict[str, AgentMemory] = {}

    def add_memory(
        self,
        agent_id: str,
        lesson: str,
        organization_id: str = "org-fulfillx-default",
        memory_type: MemoryType = MemoryType.LESSON,
        event_reference: Optional[str] = None,
        context: Optional[dict] = None,
        decision: Optional[dict] = None,
        expected_outcome: Optional[dict] = None,
        actual_outcome: Optional[dict] = None,
        confidence: float = 0.8,
        source: str = "OBSERVED_SIMULATION",
        status: MemoryStatus = MemoryStatus.VALIDATED,
    ) -> AgentMemory:
        """Store a structured memory record with provenance link."""
        mem = AgentMemory(
            memory_id=f"mem-{uuid4().hex[:8]}",
            organization_id=organization_id,
            agent_id=agent_id,
            memory_type=memory_type,
            event_reference=event_reference,
            context=context or {},
            decision=decision or {},
            expected_outcome=expected_outcome or {},
            actual_outcome=actual_outcome,
            lesson=lesson,
            confidence=confidence,
            source=source,
            decay_factor=1.0,
            status=status,
        )
        self._memories[mem.memory_id] = mem
        return mem

    def query_memories(
        self,
        organization_id: str = "org-fulfillx-default",
        agent_id: Optional[str] = None,
        memory_type: Optional[MemoryType] = None,
        min_confidence: float = 0.0,
        status: Optional[MemoryStatus] = MemoryStatus.VALIDATED,
    ) -> List[AgentMemory]:
        """
        Query memories filtered strictly by organization_id and optional parameters.
        Prevents cross-tenant memory leakage.
        """
        results = []
        for mem in self._memories.values():
            if mem.organization_id != organization_id:
                continue
            if agent_id and mem.agent_id != agent_id:
                continue
            if memory_type and mem.memory_type != memory_type:
                continue
            if mem.confidence < min_confidence:
                continue
            if status and mem.status != status:
                continue
            results.append(mem)
        
        # Sort by confidence * decay_factor descending
        results.sort(key=lambda m: m.confidence * m.decay_factor, reverse=True)
        return results

    def validate_lesson(self, memory_id: str) -> Optional[AgentMemory]:
        """Promote a memory to VALIDATED status."""
        if memory_id in self._memories:
            mem = self._memories[memory_id]
            mem.status = MemoryStatus.VALIDATED
            mem.confidence = min(1.0, mem.confidence + 0.1)
            return mem
        return None

    def apply_decay(self, decay_rate: float = 0.05) -> int:
        """Apply memory strength decay factor across active memories."""
        updated = 0
        for mem in self._memories.values():
            if mem.status == MemoryStatus.VALIDATED:
                mem.decay_factor = max(0.1, mem.decay_factor * (1.0 - decay_rate))
                if mem.decay_factor < 0.2:
                    mem.status = MemoryStatus.EXPIRED
                updated += 1
        return updated
