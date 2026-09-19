"""
FULFILL-X Risk & Signal Repository
Thread-safe in-memory store for active signals and RiskScoreMap snapshots (P03-010)
"""
import threading
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from app.engine.risk import RiskEngine
from app.repository.world import WorldRepository
from app.schemas.risk import RiskScoreMap, NodeRiskDetail, RiskLevel
from app.schemas.signal import Signal, SignalSeverity, SignalStatus, SignalType


class RiskRepository:
    """
    Authoritative state store for disruption signals and computed RiskScoreMaps.
    Integrates directly with WorldRepository to update WorldModel node risks.
    """

    _instance: Optional["RiskRepository"] = None
    _lock: threading.RLock = threading.RLock()

    def __init__(self, world_repo: WorldRepository | None = None):
        self.lock = threading.RLock()
        self.world_repo: WorldRepository = world_repo or WorldRepository.get_instance()
        self.risk_engine: RiskEngine = RiskEngine()
        self.signals: dict[UUID, Signal] = {}
        self.last_risk_map: Optional[RiskScoreMap] = None
        self._initialize_baseline_signals()

    @classmethod
    def get_instance(cls) -> "RiskRepository":
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def _initialize_baseline_signals(self) -> None:
        """Seed baseline signals corresponding to the initial preset."""
        with self.lock:
            graph = self.world_repo.graph
            self.signals.clear()

            # If preset is double_punch, populate preset weak signals
            if self.world_repo.current_preset == "double_punch":
                sig1 = Signal(
                    type=SignalType.WEATHER,
                    severity=SignalSeverity.CRITICAL,
                    title="Typhoon Hana — Port of Osaka",
                    description="Severe category-4 typhoon approaching Kansai. Port operations suspended.",
                    confidence=0.94,
                    region="APAC",
                    source="Japan Meteorological Agency",
                    affected_node_ids=["port-001", "wh-001"],
                    affected_edge_ids=["rt-001", "rt-007"],
                )
                sig2 = Signal(
                    type=SignalType.SUPPLIER_HEALTH,
                    severity=SignalSeverity.CRITICAL,
                    title="Factory Fire — Shenzhen Facility",
                    description="Major structural fire at Apex Electronics Shenzhen assembly plant.",
                    confidence=0.98,
                    region="APAC",
                    source="Shenzhen Emergency Services",
                    affected_node_ids=["sup-001"],
                    affected_edge_ids=["rt-001"],
                )
                self.signals[sig1.id] = sig1
                self.signals[sig2.id] = sig2

            # Compute initial risk map
            self.last_risk_map = self.risk_engine.compute(graph, list(self.signals.values()))

    def list_signals(
        self,
        severity: SignalSeverity | None = None,
        signal_type: SignalType | None = None,
        status: SignalStatus | None = None,
    ) -> list[Signal]:
        with self.lock:
            results = list(self.signals.values())
            if severity:
                results = [s for s in results if s.severity == severity]
            if signal_type:
                results = [s for s in results if s.type == signal_type]
            if status:
                results = [s for s in results if s.status == status]
            return sorted(results, key=lambda s: s.created_at, reverse=True)

    def get_signal(self, signal_id: UUID) -> Optional[Signal]:
        with self.lock:
            return self.signals.get(signal_id)

    def add_signal(self, signal: Signal) -> Signal:
        with self.lock:
            self.signals[signal.id] = signal
            # Recompute risk immediately
            self.last_risk_map = self.risk_engine.compute(
                self.world_repo.graph, list(self.signals.values())
            )
            return signal

    def resolve_signal(self, signal_id: UUID) -> Optional[Signal]:
        with self.lock:
            if signal_id not in self.signals:
                return None
            sig = self.signals[signal_id]
            sig.status = SignalStatus.RESOLVED
            # Recompute risk
            self.last_risk_map = self.risk_engine.compute(
                self.world_repo.graph, list(self.signals.values())
            )
            return sig

    def get_risk_map(self) -> RiskScoreMap:
        with self.lock:
            if self.last_risk_map is None:
                self.last_risk_map = self.risk_engine.compute(
                    self.world_repo.graph, list(self.signals.values())
                )
            return self.last_risk_map

    def get_node_risk_detail(self, node_id: str) -> Optional[NodeRiskDetail]:
        with self.lock:
            risk_map = self.get_risk_map()
            if node_id not in risk_map.node_risks:
                return None
            node = self.world_repo.get_node(node_id)
            node_name = node.name if node else node_id
            scores = risk_map.node_risks[node_id]
            expl = risk_map.explanations.get(node_id)
            if not expl:
                return None

            return NodeRiskDetail(
                node_id=node_id,
                node_name=node_name,
                risk_scores=scores,
                risk_level=expl.risk_level,
                explanation=expl,
            )

    def recalculate_risk(self) -> RiskScoreMap:
        with self.lock:
            self.last_risk_map = self.risk_engine.compute(
                self.world_repo.graph, list(self.signals.values())
            )
            return self.last_risk_map

    def reset_risk_state(self) -> RiskScoreMap:
        with self.lock:
            self.world_repo.reset_world()
            self._initialize_baseline_signals()
            return self.last_risk_map  # type: ignore
