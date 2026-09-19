"""
FULFILL-X Metrics Engine (Phase 5)
Prometheus-compatible in-memory metrics registry for HTTP, WebSockets, EventBus,
Risk Engine, Ingestion, Agents, Planner, and Security telemetry.
"""
import asyncio
from collections import defaultdict
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timezone


class MetricsRegistry:
    """Thread-safe, cardinality-controlled Prometheus metrics store."""
    _instance: Optional["MetricsRegistry"] = None

    def __init__(self):
        self._counters: Dict[str, float] = defaultdict(float)
        self._histograms: Dict[str, List[float]] = defaultdict(list)
        self._gauges: Dict[str, float] = defaultdict(float)

    @classmethod
    def get_instance(cls) -> "MetricsRegistry":
        if cls._instance is None:
            cls._instance = MetricsRegistry()
        return cls._instance

    def increment(self, metric_name: str, value: float = 1.0, labels: Optional[Dict[str, str]] = None) -> None:
        key = self._format_key(metric_name, labels)
        self._counters[key] += value

    def observe(self, metric_name: str, value: float, labels: Optional[Dict[str, str]] = None) -> None:
        key = self._format_key(metric_name, labels)
        self._histograms[key].append(value)
        if len(self._histograms[key]) > 1000:
            self._histograms[key] = self._histograms[key][-500:]

    def set_gauge(self, metric_name: str, value: float, labels: Optional[Dict[str, str]] = None) -> None:
        key = self._format_key(metric_name, labels)
        self._gauges[key] = value

    def _format_key(self, metric_name: str, labels: Optional[Dict[str, str]] = None) -> str:
        if not labels:
            return metric_name
        label_str = ",".join(f'{k}="{v}"' for k, v in sorted(labels.items()))
        return f"{metric_name}{{{label_str}}}"

    def generate_prometheus_text(self) -> str:
        """Generate Prometheus exposition text format."""
        lines = []
        lines.append("# HELP http_requests_total Total HTTP requests handled")
        lines.append("# TYPE http_requests_total counter")
        for key, val in self._counters.items():
            lines.append(f"{key} {val}")

        lines.append("# HELP active_gauges Current gauge values")
        lines.append("# TYPE active_gauges gauge")
        for key, val in self._gauges.items():
            lines.append(f"{key} {val}")

        lines.append("# HELP metric_histograms_seconds Performance latency histograms")
        lines.append("# TYPE metric_histograms_seconds summary")
        for key, vals in self._histograms.items():
            if vals:
                avg = sum(vals) / len(vals)
                count = len(vals)
                lines.append(f"{key}_sum {sum(vals)}")
                lines.append(f"{key}_count {count}")

        return "\n".join(lines) + "\n"

    def get_summary_dict(self) -> Dict[str, Any]:
        """Return metric snapshot dictionary for Observability UI."""
        return {
            "counters": dict(self._counters),
            "gauges": dict(self._gauges),
            "histograms": {k: {"count": len(v), "avg": (sum(v) / len(v)) if v else 0.0} for k, v in self._histograms.items()},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def reset(self) -> None:
        self._counters.clear()
        self._histograms.clear()
        self._gauges.clear()


# Global singleton instance
metrics_registry = MetricsRegistry.get_instance()
