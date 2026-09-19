"""
FULFILL-X Real-Time Event Schemas
Defines strongly typed event envelopes, lifecycle event types, and WebSocket client messages.
"""
from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field


class EventType(str, Enum):
    # Session & Stage Lifecycle
    SESSION_CREATED = "SESSION_CREATED"
    SESSION_STARTED = "SESSION_STARTED"
    STAGE_STARTED = "STAGE_STARTED"
    STAGE_COMPLETED = "STAGE_COMPLETED"
    STAGE_FAILED = "STAGE_FAILED"
    SESSION_COMPLETED = "SESSION_COMPLETED"

    # Risk & Signal Intelligence
    SIGNAL_DETECTED = "SIGNAL_DETECTED"
    SIGNAL_FUSED = "SIGNAL_FUSED"
    RISK_UPDATED = "RISK_UPDATED"

    # Specialist Agent Execution
    SPECIALIST_STARTED = "SPECIALIST_STARTED"
    SPECIALIST_COMPLETED = "SPECIALIST_COMPLETED"
    SPECIALIST_FAILED = "SPECIALIST_FAILED"

    # Coordinator Reconciliation
    COORDINATOR_STARTED = "COORDINATOR_STARTED"
    COORDINATOR_COMPLETED = "COORDINATOR_COMPLETED"

    # Adversary Red-Team Testing
    ADVERSARY_STARTED = "ADVERSARY_STARTED"
    ADVERSARY_FINDING = "ADVERSARY_FINDING"
    ADVERSARY_COMPLETED = "ADVERSARY_COMPLETED"

    # Multi-Objective Planner
    PLANNER_STARTED = "PLANNER_STARTED"
    PLAN_GENERATED = "PLAN_GENERATED"

    # Verification Engine
    VERIFICATION_STARTED = "VERIFICATION_STARTED"
    VERIFICATION_COMPLETED = "VERIFICATION_COMPLETED"

    # Decision Cockpit & Human Approval
    DECISION_READY = "DECISION_READY"
    APPROVAL_REQUESTED = "APPROVAL_REQUESTED"
    DECISION_APPROVED = "DECISION_APPROVED"
    DECISION_REJECTED = "DECISION_REJECTED"

    # Evaluation & Benchmark Engine
    EVALUATION_STARTED = "EVALUATION_STARTED"
    SCENARIO_STARTED = "SCENARIO_STARTED"
    METRIC_CALCULATED = "METRIC_CALCULATED"
    EVALUATION_COMPLETED = "EVALUATION_COMPLETED"
    EVALUATION_FAILED = "EVALUATION_FAILED"

    # Real-World Data Ingestion Engine (Phase 4)
    DATA_SOURCE_HEALTH_CHANGED = "DATA_SOURCE_HEALTH_CHANGED"
    DATA_INGESTION_STARTED = "DATA_INGESTION_STARTED"
    DATA_INGESTION_COMPLETED = "DATA_INGESTION_COMPLETED"
    DATA_RECORD_ACCEPTED = "DATA_RECORD_ACCEPTED"
    DATA_RECORD_REJECTED = "DATA_RECORD_REJECTED"
    DATA_QUALITY_CHANGED = "DATA_QUALITY_CHANGED"
    EXTERNAL_SIGNAL_CREATED = "EXTERNAL_SIGNAL_CREATED"
    ENTITY_RESOLUTION_REQUIRED = "ENTITY_RESOLUTION_REQUIRED"
    DATA_REPLAY_STARTED = "DATA_REPLAY_STARTED"
    DATA_REPLAY_COMPLETED = "DATA_REPLAY_COMPLETED"

    # System Alerts & Observability (Phase 5)
    SYSTEM_WARNING = "SYSTEM_WARNING"
    SYSTEM_ERROR = "SYSTEM_ERROR"
    ALERT_TRIGGERED = "ALERT_TRIGGERED"
    ALERT_ACKNOWLEDGED = "ALERT_ACKNOWLEDGED"
    METRICS_COLLECTED = "METRICS_COLLECTED"
    HEALTH_STATUS_CHANGED = "HEALTH_STATUS_CHANGED"
    DEAD_LETTER_EVENT = "DEAD_LETTER_EVENT"

    # Predictive ML Platform (Phase 6)
    MODEL_TRAINING_STARTED = "MODEL_TRAINING_STARTED"
    MODEL_TRAINING_COMPLETED = "MODEL_TRAINING_COMPLETED"
    MODEL_VALIDATION_COMPLETED = "MODEL_VALIDATION_COMPLETED"
    MODEL_ACTIVATED = "MODEL_ACTIVATED"
    MODEL_REJECTED = "MODEL_REJECTED"
    PREDICTION_CREATED = "PREDICTION_CREATED"
    PREDICTION_FAILED = "PREDICTION_FAILED"
    MODEL_DRIFT_DETECTED = "MODEL_DRIFT_DETECTED"
    MODEL_PERFORMANCE_DEGRADED = "MODEL_PERFORMANCE_DEGRADED"


class EventSeverity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EventEnvelope(BaseModel):
    event_id: str = Field(default_factory=lambda: f"evt-{uuid.uuid4().hex[:10]}")
    event_type: EventType
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    organization_id: str = Field(default="org-fulfillx-default")
    session_id: Optional[str] = None
    stage: Optional[str] = None
    source: str = "system"
    severity: EventSeverity = EventSeverity.INFO
    sequence: int = 0
    correlation_id: Optional[str] = None
    causation_id: Optional[str] = None
    producer: str = "fulfillx-backend"
    payload: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    schema_version: str = "1.0.0"


class ClientWsAction(str, Enum):
    SUBSCRIBE = "SUBSCRIBE"
    UNSUBSCRIBE = "UNSUBSCRIBE"
    PING = "PING"


class ClientWsMessage(BaseModel):
    action: ClientWsAction
    session_id: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)
