"""
FULFILL-X Deterministic Scenario Generator (Phase 8)
Generates single, sequential, compound, demand shock, and delayed recovery scenarios.
Every generated scenario is reproducible from a seed.
"""
from typing import List, Optional
from uuid import uuid4
import numpy as np

from app.simulation.schemas import (
    DisruptionEvent,
    DisruptionType,
    ScenarioConfig,
)


class ScenarioGenerator:
    """
    Generator of deterministic disruption scenarios for digital twin testing.
    """

    def __init__(self, master_seed: int = 42):
        self.master_seed = master_seed
        self.rng = np.random.RandomState(master_seed)

    def create_single_disruption(
        self,
        target_id: str = "sup-001",
        event_type: DisruptionType = DisruptionType.SUPPLIER_OUTAGE,
        start_hour: int = 6,
        duration: int = 24,
        severity: float = 0.8,
        seed: Optional[int] = None,
    ) -> ScenarioConfig:
        s_seed = seed if seed is not None else self.master_seed
        evt = DisruptionEvent(
            target=target_id,
            start_time=start_hour,
            duration=duration,
            severity=severity,
            capacity_multiplier=max(0.0, 1.0 - severity),
            probability=1.0,
            source="SCENARIO_GEN",
            type=event_type,
        )
        return ScenarioConfig(
            scenario_id=f"scn-single-{uuid4().hex[:6]}",
            name=f"Single Disruption ({target_id})",
            description=f"Single {event_type.value} on target {target_id} starting at +{start_hour}h for {duration}h.",
            events=[evt],
            seed=s_seed,
        )

    def create_sequential_disruption(
        self,
        target1: str = "sup-001",
        target2: str = "port-001",
        seed: Optional[int] = None,
    ) -> ScenarioConfig:
        s_seed = seed if seed is not None else self.master_seed
        evt1 = DisruptionEvent(
            target=target1,
            start_time=6,
            duration=24,
            severity=0.8,
            capacity_multiplier=0.2,
            type=DisruptionType.SUPPLIER_OUTAGE,
        )
        evt2 = DisruptionEvent(
            target=target2,
            start_time=18,
            duration=36,
            severity=0.6,
            capacity_multiplier=0.4,
            type=DisruptionType.PORT_CONGESTION,
        )
        return ScenarioConfig(
            scenario_id=f"scn-seq-{uuid4().hex[:6]}",
            name=f"Sequential Disruption ({target1} -> {target2})",
            description=f"Cascading disruption: {target1} outage followed by {target2} congestion.",
            events=[evt1, evt2],
            seed=s_seed,
        )

    def create_compound_disruption(
        self,
        targets: Optional[List[str]] = None,
        demand_shock_pct: float = 0.5,
        seed: Optional[int] = None,
    ) -> ScenarioConfig:
        s_seed = seed if seed is not None else self.master_seed
        t_list = targets or ["sup-001", "port-001", "wh-001"]
        events = []
        for i, target in enumerate(t_list):
            events.append(
                DisruptionEvent(
                    target=target,
                    start_time=i * 6,
                    duration=36,
                    severity=0.7,
                    capacity_multiplier=0.3,
                    type=DisruptionType.COMPOUND,
                )
            )
        return ScenarioConfig(
            scenario_id=f"scn-cmp-{uuid4().hex[:6]}",
            name="Compound Disruption + Demand Shock",
            description=f"Simultaneous compound disruption across {len(t_list)} nodes with +{int(demand_shock_pct*100)}% demand surge.",
            events=events,
            demand_shock_pct=demand_shock_pct,
            seed=s_seed,
        )

    def create_demo_scenario(self, seed: int = 42) -> ScenarioConfig:
        """Standard Phase 8 deterministic demo scenario."""
        evt1 = DisruptionEvent(
            target="sup-001",
            start_time=6,
            duration=36,
            severity=0.85,
            capacity_multiplier=0.15,
            type=DisruptionType.SUPPLIER_OUTAGE,
        )
        evt2 = DisruptionEvent(
            target="port-001",
            start_time=12,
            duration=48,
            severity=0.70,
            capacity_multiplier=0.30,
            type=DisruptionType.PORT_CONGESTION,
        )
        return ScenarioConfig(
            scenario_id="scn-demo-phase8",
            name="Phase 8 Standard Demo Scenario",
            description="Supplier-A disruption + Port-2 congestion + 30% demand surge.",
            events=[evt1, evt2],
            demand_shock_pct=0.30,
            seed=seed,
        )
