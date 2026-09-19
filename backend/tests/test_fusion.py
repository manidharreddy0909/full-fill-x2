"""
Unit tests for Signal Fusion Engine (P03-001 & P03-015)
"""
from datetime import datetime, timezone, timedelta
import pytest
from app.engine.fusion import SignalFusionEngine, get_max_severity
from app.schemas.signal import Signal, SignalSeverity, SignalType, SignalStatus


def test_signal_deduplication_within_6hr_window():
    now = datetime.now(timezone.utc)
    engine = SignalFusionEngine(window_hours=6.0)

    # 3 signals of same type for node 'sup-001' within 6 hours
    s1 = Signal(
        type=SignalType.SUPPLIER_HEALTH,
        severity=SignalSeverity.MEDIUM,
        title="Supplier Health Warning A",
        confidence=0.8,
        affected_node_ids=["sup-001"],
        created_at=now - timedelta(hours=5),
    )
    s2 = Signal(
        type=SignalType.SUPPLIER_HEALTH,
        severity=SignalSeverity.HIGH,
        title="Supplier Health Warning B",
        confidence=0.7,
        affected_node_ids=["sup-001"],
        created_at=now - timedelta(hours=3),
    )
    s3 = Signal(
        type=SignalType.SUPPLIER_HEALTH,
        severity=SignalSeverity.LOW,
        title="Supplier Health Warning C",
        confidence=0.5,
        affected_node_ids=["sup-001"],
        created_at=now - timedelta(hours=1),
    )

    fused = engine.fuse_signals([s1, s2, s3])
    assert len(fused) == 1
    fused_sig = fused[0]

    # Fused confidence: 1 - (1-0.8)*(1-0.7)*(1-0.5) = 1 - (0.2 * 0.3 * 0.5) = 1 - 0.03 = 0.97
    assert fused_sig.confidence == 0.97
    # Max severity: HIGH
    assert fused_sig.severity == SignalSeverity.HIGH
    assert len(fused_sig.contributing_signal_ids) == 3


def test_signals_outside_6hr_window_produce_multiple_clusters():
    now = datetime.now(timezone.utc)
    engine = SignalFusionEngine(window_hours=6.0)

    s1 = Signal(
        type=SignalType.LOGISTICS,
        severity=SignalSeverity.MEDIUM,
        title="Port Bottleneck Alpha",
        confidence=0.6,
        affected_node_ids=["wh-001"],
        created_at=now - timedelta(hours=10),
    )
    s2 = Signal(
        type=SignalType.LOGISTICS,
        severity=SignalSeverity.HIGH,
        title="Port Bottleneck Beta",
        confidence=0.8,
        affected_node_ids=["wh-001"],
        created_at=now - timedelta(hours=1),
    )

    fused = engine.fuse_signals([s1, s2])
    assert len(fused) == 2


def test_max_severity_ordering():
    assert get_max_severity([SignalSeverity.LOW, SignalSeverity.HIGH]) == SignalSeverity.HIGH
    assert get_max_severity([SignalSeverity.MEDIUM, SignalSeverity.CRITICAL, SignalSeverity.HIGH]) == SignalSeverity.CRITICAL
