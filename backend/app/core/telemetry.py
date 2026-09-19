"""
FULFILL-X Structured Telemetry, Logging & Tracing Framework (Phase 5)
Provides structured JSON logging with secret sanitization, correlation context propagation,
and non-fatal OpenTelemetry tracing hooks.
"""
import json
import logging
import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from contextvars import ContextVar

# Context variables for correlation tracing across async calls
correlation_id_ctx: ContextVar[Optional[str]] = ContextVar("correlation_id", default=None)
causation_id_ctx: ContextVar[Optional[str]] = ContextVar("causation_id", default=None)
organization_id_ctx: ContextVar[Optional[str]] = ContextVar("organization_id", default="org-fulfillx-default")
user_id_ctx: ContextVar[Optional[str]] = ContextVar("user_id", default=None)

SENSITIVE_PATTERNS = [
    re.compile(r"(password|secret|token|bearer|key|authorization|jwt)\s*=\s*['\"]?[^'\"\s]+['\"]?", re.IGNORECASE),
    re.compile(r"Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*", re.IGNORECASE),
]


def redact_sensitive_data(text: str) -> str:
    """Sanitize secrets, passwords, and tokens from log output."""
    if not isinstance(text, str):
        return str(text)
    sanitized = text
    for pattern in SENSITIVE_PATTERNS:
        sanitized = pattern.sub("[REDACTED_SECRET]", sanitized)
    return sanitized


class StructuredJsonFormatter(logging.Formatter):
    """JSON log formatter propagating context variables and redacting sensitive text."""

    def format(self, record: logging.LogRecord) -> str:
        log_payload: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": redact_sensitive_data(record.getMessage()),
            "component": getattr(record, "component", record.name),
            "correlation_id": correlation_id_ctx.get(),
            "causation_id": causation_id_ctx.get(),
            "organization_id": organization_id_ctx.get() or "org-fulfillx-default",
            "user_id": user_id_ctx.get(),
        }

        if record.exc_info:
            log_payload["exception"] = redact_sensitive_data(self.formatException(record.exc_info))

        return json.dumps(log_payload)


class TracingSpan:
    """Non-fatal OpenTelemetry tracing span wrapper for correlation tracking."""

    def __init__(self, name: str, correlation_id: Optional[str] = None, causation_id: Optional[str] = None):
        self.name = name
        self.correlation_id = correlation_id or correlation_id_ctx.get() or f"corr-{datetime.now(timezone.utc).timestamp()}"
        self.causation_id = causation_id or causation_id_ctx.get()
        self.span_id = f"span-{datetime.now(timezone.utc).timestamp()}"
        self._tokens = []

    def __enter__(self):
        t1 = correlation_id_ctx.set(self.correlation_id)
        t2 = causation_id_ctx.set(self.causation_id)
        self._tokens = [t1, t2]
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._tokens:
            correlation_id_ctx.reset(self._tokens[0])
            causation_id_ctx.reset(self._tokens[1])
        return False  # Do not swallow exceptions


def setup_structured_logging(log_level: str = "INFO") -> None:
    """Configure root logger with StructuredJsonFormatter."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Avoid duplicate handlers
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(StructuredJsonFormatter())
    root_logger.addHandler(console_handler)
