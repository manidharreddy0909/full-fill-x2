"""
FULFILL-X Signal Fusion Engine
Deduplication, confidence weighting, and canonical signal fusion (P03-001 - P03-005)
"""
import math
from datetime import datetime, timezone, timedelta
from typing import Sequence
from app.schemas.signal import Signal, FusedSignal, SignalSeverity, SignalStatus


SEVERITY_ORDER = {
    SignalSeverity.LOW: 1,
    SignalSeverity.MEDIUM: 2,
    SignalSeverity.HIGH: 3,
    SignalSeverity.CRITICAL: 4,
}


def get_max_severity(severities: Sequence[SignalSeverity]) -> SignalSeverity:
    """Return highest severity level from a collection."""
    if not severities:
        return SignalSeverity.LOW
    return max(severities, key=lambda s: SEVERITY_ORDER.get(s, 1))


class SignalFusionEngine:
    """
    Deterministic Signal Fusion Engine.
    Filters active signals, normalizes inputs, deduplicates signals affecting the same node
    within a 6-hour time window, and computes compound confidence weighting.
    """

    def __init__(self, window_hours: float = 6.0):
        self.window_hours: float = window_hours

    def fuse_signals(self, signals: list[Signal]) -> list[FusedSignal]:
        """
        Main fusion pipeline:
        1. Filter to active non-expired signals
        2. Group by (SignalType, target_node_id)
        3. Deduplicate signals within window_hours (6-hour window)
        4. Compute fused confidence = 1 - ∏(1 - confidence_i) and fused severity = max(severity_i)
        """
        now = datetime.now(timezone.utc)

        # 1. Filter active signals
        active_signals = [
            s for s in signals
            if s.status == SignalStatus.ACTIVE
            and (s.expires_at is None or s.expires_at > now)
        ]

        if not active_signals:
            return []

        # 2. Sort deterministically by timestamp and UUID
        sorted_signals = sorted(
            active_signals,
            key=lambda s: (s.created_at.timestamp(), str(s.id))
        )

        # 3. Group signals by (type, node_id)
        # Expansion: each signal can affect multiple node_ids
        node_signal_pairs: list[tuple[str, Signal]] = []
        for s in sorted_signals:
            for node_id in s.affected_node_ids:
                node_signal_pairs.append((node_id, s))

        # Group by node_id and type
        groups: dict[tuple[str, str], list[Signal]] = {}
        for node_id, sig in node_signal_pairs:
            key = (sig.type.value, node_id)
            if key not in groups:
                groups[key] = []
            groups[key].append(sig)

        fused_results: list[FusedSignal] = []

        # 4. Process each group with 6-hour sliding window deduplication
        for (sig_type_str, node_id), group_signals in sorted(groups.items(), key=lambda item: item[0]):
            window_clusters: list[list[Signal]] = []

            for sig in group_signals:
                placed = False
                for cluster in window_clusters:
                    # Check if signal is within window_hours of cluster anchor (earliest signal)
                    cluster_anchor_time = cluster[0].created_at
                    diff_seconds = abs((sig.created_at - cluster_anchor_time).total_seconds())
                    if diff_seconds <= self.window_hours * 3600.0:
                        cluster.append(sig)
                        placed = True
                        break

                if not placed:
                    window_clusters.append([sig])

            # Produce fused signal for each cluster
            cluster_idx = 1
            for cluster in window_clusters:
                # Fused confidence formula: 1 - ∏(1 - c_i)
                conf_product = math.prod(1.0 - s.confidence for s in cluster)
                fused_conf = max(0.0, min(1.0, round(1.0 - conf_product, 4)))

                max_sev = get_max_severity([s.severity for s in cluster])
                timestamps = [s.created_at for s in cluster]
                earliest_t = min(timestamps)
                latest_t = max(timestamps)
                titles = list(dict.fromkeys(s.title for s in cluster))

                fused_id = f"fused-{sig_type_str.lower()}-{node_id}-{cluster_idx}"
                cluster_idx += 1

                fused_results.append(
                    FusedSignal(
                        fused_id=fused_id,
                        type=cluster[0].type,
                        target_node_id=node_id,
                        severity=max_sev,
                        confidence=fused_conf,
                        contributing_signal_ids=[s.id for s in cluster],
                        earliest_timestamp=earliest_t,
                        latest_timestamp=latest_t,
                        titles=titles,
                    )
                )

        return fused_results
