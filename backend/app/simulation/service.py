"""
FULFILL-X Digital Twin Platform Master Service (Phase 8)
Orchestrates digital twin creation, scenario generation, parallelized Monte Carlo runs,
resilience metrics calculation, node criticality ranking, robust strategy comparison, and calibration.
Dispatches real-time events via EventTransport.
"""
from typing import Dict, List, Optional
from app.realtime.event_bus import event_bus, EventBus
from app.schemas.events import EventEnvelope, EventSeverity, EventType
from app.services.world import WorldService
from app.simulation.calibration import DigitalTwinCalibrator
from app.simulation.comparison import RobustStrategyAnalyzer
from app.simulation.criticality import CriticalityAnalyzer
from app.simulation.monte_carlo import MonteCarloEngine
from app.simulation.runner import SimulationRunner
from app.simulation.scenario import ScenarioGenerator
from app.simulation.schemas import (
    CriticalityResult,
    MonteCarloConfig,
    MonteCarloResult,
    ScenarioConfig,
    SimulationRunResult,
    StrategyComparisonResult,
    StrategyConfig,
    TwinCalibrationReport,
)
from app.simulation.twin import DigitalTwin


class DigitalTwinPlatformService:
    """
    Master service for Phase 8 Digital Twin & Monte Carlo Resilience Engine.
    """

    _instance: Optional["DigitalTwinPlatformService"] = None

    def __init__(
        self,
        world_service: Optional[WorldService] = None,
        event_bus_inst: Optional[EventBus] = None,
    ):
        self.world_service = world_service or WorldService()
        self.event_bus = event_bus_inst or event_bus
        self.twins: Dict[str, DigitalTwin] = {}
        self.scenario_gen = ScenarioGenerator(master_seed=42)

    @classmethod
    def get_instance(cls) -> "DigitalTwinPlatformService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def create_twin(self, twin_id: Optional[str] = None, seed: int = 42) -> DigitalTwin:
        """Fetch production world model snapshot and instantiate isolated DigitalTwin."""
        snapshot = self.world_service.get_snapshot()
        twin = DigitalTwin(snapshot=snapshot, twin_id=twin_id, seed=seed)
        self.twins[twin.twin_id] = twin

        self._publish_event(
            EventType.TWIN_CREATED,
            payload={
                "twin_id": twin.twin_id,
                "world_snapshot_id": twin.world_snapshot_id,
                "graph_snapshot_id": twin.graph_snapshot_id,
                "twin_version": twin.twin_version,
            },
        )
        return twin

    def get_twin(self, twin_id: str) -> DigitalTwin:
        if twin_id not in self.twins:
            # Auto-create if requested ID not cached
            return self.create_twin(twin_id=twin_id)
        return self.twins[twin_id]

    def run_single_simulation(
        self,
        twin_id: str,
        scenario: ScenarioConfig,
        horizon_hours: int = 72,
    ) -> SimulationRunResult:
        twin = self.get_twin(twin_id)
        self._publish_event(EventType.SIMULATION_STARTED, payload={"twin_id": twin_id, "scenario_id": scenario.scenario_id})

        runner = SimulationRunner(twin=twin, scenario=scenario)
        result = runner.run(horizon_hours=horizon_hours)

        self._publish_event(
            EventType.SIMULATION_COMPLETED,
            payload={
                "twin_id": twin_id,
                "run_id": result.run_id,
                "overall_service_level": result.overall_service_level,
                "recovery_time_hours": result.recovery_time_hours,
            },
        )
        return result

    def run_monte_carlo(
        self,
        twin_id: str,
        scenario: ScenarioConfig,
        config: Optional[MonteCarloConfig] = None,
    ) -> MonteCarloResult:
        twin = self.get_twin(twin_id)
        mc_config = config or MonteCarloConfig(scenario_id=scenario.scenario_id)

        self._publish_event(
            EventType.MONTE_CARLO_STARTED,
            payload={
                "twin_id": twin_id,
                "scenario_id": scenario.scenario_id,
                "n_simulations": mc_config.n_simulations,
            },
        )

        mc_engine = MonteCarloEngine(twin=twin, config=mc_config)
        result = mc_engine.run(scenario=scenario)

        self._publish_event(
            EventType.MONTE_CARLO_COMPLETED,
            payload={
                "mc_id": result.mc_id,
                "twin_id": twin_id,
                "resilience_score": result.metrics.resilience_score,
                "service_p50": result.metrics.service_level_dist.p50,
                "cost_cvar95": result.metrics.cvar_cost_95,
                "execution_time_sec": result.execution_time_sec,
            },
        )
        return result

    def analyze_criticality(self, twin_id: str, mc_result: MonteCarloResult) -> List[CriticalityResult]:
        twin = self.get_twin(twin_id)
        snapshot = self.world_service.get_snapshot()

        analyzer = CriticalityAnalyzer(snapshot=snapshot, mc_result=mc_result)
        results = analyzer.analyze()

        self._publish_event(
            EventType.CRITICALITY_ANALYSIS_COMPLETED,
            payload={"twin_id": twin_id, "top_critical_node": results[0].node_id if results else None},
        )
        return results

    def compare_strategies(
        self,
        twin_id: str,
        scenario: ScenarioConfig,
        candidate_strategies: List[StrategyConfig],
        mc_config: Optional[MonteCarloConfig] = None,
    ) -> StrategyComparisonResult:
        twin = self.get_twin(twin_id)
        cfg = mc_config or MonteCarloConfig(scenario_id=scenario.scenario_id, n_simulations=100)

        analyzer = RobustStrategyAnalyzer(twin=twin, scenario=scenario, mc_config=cfg)
        cmp_result = analyzer.compare_strategies(candidate_strategies)

        self._publish_event(
            EventType.STRATEGY_SIMULATION_COMPLETED,
            payload={
                "comparison_id": cmp_result.comparison_id,
                "recommended_strategy_id": cmp_result.recommended_strategy_id,
            },
        )
        return cmp_result

    def calibrate_twin(
        self,
        twin_id: str,
        sim_result: SimulationRunResult,
        observed_service_levels: List[float],
        observed_recovery_hours: float = 24.0,
    ) -> TwinCalibrationReport:
        twin = self.get_twin(twin_id)
        report = DigitalTwinCalibrator.calibrate(
            twin_id=twin_id,
            world_snapshot_id=twin.world_snapshot_id,
            sim_result=sim_result,
            observed_service_levels=observed_service_levels,
            observed_recovery_hours=observed_recovery_hours,
        )

        self._publish_event(
            EventType.TWIN_CALIBRATION_COMPLETED,
            payload={
                "twin_id": twin_id,
                "status": report.status,
                "mae_service_level": report.mae_service_level,
            },
        )
        return report

    def _publish_event(self, event_type: EventType, payload: dict):
        try:
            import asyncio
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(
                    self.event_bus.publish(
                        event_type=event_type,
                        payload=payload,
                        source="DigitalTwinPlatformService",
                        severity=EventSeverity.INFO,
                    )
                )
            except RuntimeError:
                pass
        except Exception:
            pass
