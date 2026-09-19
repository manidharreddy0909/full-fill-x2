"""
Unit tests for Deterministic Risk Engine & Propagation (P03-006 - P03-009, P03-015)
"""
import pytest
from app.generator.synthetic import generate_world
from app.engine.risk import (
    RiskEngine,
    compose_compound,
    get_risk_level,
    SEVERITY_TO_SCORE,
)
from app.schemas.risk import RiskLevel
from app.schemas.signal import Signal, SignalSeverity, SignalType


def test_severity_to_score_mapping():
    assert SEVERITY_TO_SCORE[SignalSeverity.LOW] == 0.25
    assert SEVERITY_TO_SCORE[SignalSeverity.MEDIUM] == 0.50
    assert SEVERITY_TO_SCORE[SignalSeverity.HIGH] == 0.75
    assert SEVERITY_TO_SCORE[SignalSeverity.CRITICAL] == 0.95


def test_compound_score_never_exceeds_one():
    # [0.9, 0.9] -> 1 - (0.1 * 0.1) = 0.99
    assert compose_compound([0.9, 0.9]) == 0.99
    assert compose_compound([1.0, 1.0]) == 1.0
    assert compose_compound([0.0, 0.0]) == 0.0


def test_get_risk_level_bands():
    assert get_risk_level(0.10) == RiskLevel.LOW
    assert get_risk_level(0.40) == RiskLevel.MEDIUM
    assert get_risk_level(0.70) == RiskLevel.HIGH
    assert get_risk_level(0.90) == RiskLevel.CRITICAL


def test_risk_propagation_decays_over_hops():
    graph = generate_world(seed=42, preset="healthy")
    engine = RiskEngine()

    # Inject critical signal on sup-001
    sig = Signal(
        type=SignalType.SUPPLIER_HEALTH,
        severity=SignalSeverity.CRITICAL,
        confidence=1.0,
        affected_node_ids=["sup-001"],
    )

    risk_map = engine.compute(graph, [sig])

    sup_risk = risk_map.node_risks["sup-001"].composite
    wh_risk = risk_map.node_risks["wh-001"].composite
    fc_risk = risk_map.node_risks["fc-001"].composite

    # Hop 0 (sup-001) > Hop 1 (wh-001) > Hop 2 (fc-001)
    assert sup_risk >= 0.90
    assert sup_risk > wh_risk > fc_risk
    assert wh_risk > 0.05


def test_risk_explanation_traceability():
    graph = generate_world(seed=42, preset="healthy")
    engine = RiskEngine()

    sig = Signal(
        type=SignalType.WEATHER,
        severity=SignalSeverity.HIGH,
        confidence=0.9,
        affected_node_ids=["wh-001"],
    )

    risk_map = engine.compute(graph, [sig])
    expl = risk_map.explanations.get("wh-001")

    assert expl is not None
    assert expl.composite > 0.60
    assert expl.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL)
    assert len(expl.contributing_signals) > 0
    assert "WEATHER" in expl.explanation_text


def test_risk_engine_is_100_percent_deterministic():
    """Verify seed=42 + same signals returns identical RiskScoreMap output every time."""
    graph1 = generate_world(seed=42, preset="healthy")
    graph2 = generate_world(seed=42, preset="healthy")

    sig = Signal(
        type=SignalType.CYBER,
        severity=SignalSeverity.HIGH,
        confidence=0.85,
        affected_node_ids=["fc-001"],
    )

    engine = RiskEngine()
    map1 = engine.compute(graph1, [sig])
    map2 = engine.compute(graph2, [sig])

    assert map1.node_risks == map2.node_risks
    assert map1.edge_risks == map2.edge_risks
    assert map1.network_health == map2.network_health
