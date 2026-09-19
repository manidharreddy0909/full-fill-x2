"""
FULFILL-X Risk Service Layer
Business logic bridging API and RiskRepository (P03-010)
"""
from typing import Optional
from uuid import UUID

from app.repository.risk import RiskRepository
from app.schemas.risk import RiskScoreMap, NodeRiskDetail
from app.schemas.signal import Signal, SignalCreateRequest, SignalSeverity, SignalStatus, SignalType


class RiskService:
    def __init__(self, repo: RiskRepository | None = None):
        self.repo: RiskRepository = repo or RiskRepository.get_instance()

    def list_signals(
        self,
        severity: SignalSeverity | None = None,
        signal_type: SignalType | None = None,
        status: SignalStatus | None = None,
    ) -> list[Signal]:
        return self.repo.list_signals(severity=severity, signal_type=signal_type, status=status)

    def get_signal(self, signal_id: UUID) -> Optional[Signal]:
        return self.repo.get_signal(signal_id)

    def inject_signal(self, req: SignalCreateRequest) -> Signal:
        signal = Signal(
            type=req.type,
            severity=req.severity,
            title=req.title,
            description=req.description,
            confidence=req.confidence,
            region=req.region,
            source=req.source,
            affected_node_ids=req.affected_node_ids,
            affected_edge_ids=req.affected_edge_ids,
        )
        return self.repo.add_signal(signal)

    def resolve_signal(self, signal_id: UUID) -> Optional[Signal]:
        return self.repo.resolve_signal(signal_id)

    def get_risk_map(self) -> RiskScoreMap:
        return self.repo.get_risk_map()

    def get_node_risk_detail(self, node_id: str) -> Optional[NodeRiskDetail]:
        return self.repo.get_node_risk_detail(node_id)

    def recalculate_risk(self) -> RiskScoreMap:
        return self.repo.recalculate_risk()

    def reset_risk_state(self) -> RiskScoreMap:
        return self.repo.reset_risk_state()
