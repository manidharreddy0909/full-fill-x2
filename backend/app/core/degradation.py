"""
FULFILL-X System Reliability, Degradation Modes & Chaos Fault Injection (Phase 10)
Manages operational status modes (FULL, DEGRADED_AI, DEGRADED_DATA, SAFE_MODE)
and provides deterministic fault injection for testing.
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SystemOperationalMode(str, Enum):
    FULL = "FULL"
    DEGRADED_AI = "DEGRADED_AI"
    DEGRADED_DATA = "DEGRADED_DATA"
    DEGRADED_REALTIME = "DEGRADED_REALTIME"
    OFFLINE = "OFFLINE"
    SAFE_MODE = "SAFE_MODE"


class FaultType(str, Enum):
    AI_TIMEOUT = "AI_TIMEOUT"
    REDIS_DISCONNECT = "REDIS_DISCONNECT"
    DB_TEMPORARY_DOWN = "DB_TEMPORARY_DOWN"
    DATA_ADAPTER_FAIL = "DATA_ADAPTER_FAIL"
    SIMULATION_TIMEOUT = "SIMULATION_TIMEOUT"
    AGENT_TIMEOUT = "AGENT_TIMEOUT"


class FaultInjectionRequest(BaseModel):
    fault_type: FaultType
    duration_seconds: int = Field(default=30, ge=1, le=600)
    target_subsystem: str = "ai_service"


class SystemHealthStatus(BaseModel):
    mode: SystemOperationalMode = SystemOperationalMode.FULL
    is_ai_healthy: bool = True
    is_data_healthy: bool = True
    is_realtime_healthy: bool = True
    active_faults: List[str] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SystemDegradationManager:
    _instance: Optional['SystemDegradationManager'] = None

    def __init__(self):
        self.mode: SystemOperationalMode = SystemOperationalMode.FULL
        self.active_faults: Dict[str, datetime] = {}
        self.is_ai_healthy: bool = True
        self.is_data_healthy: bool = True
        self.is_realtime_healthy: bool = True

    @classmethod
    def get_instance(cls) -> 'SystemDegradationManager':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def set_mode(self, mode: SystemOperationalMode) -> SystemHealthStatus:
        self.mode = mode
        if mode == SystemOperationalMode.SAFE_MODE:
            self.is_ai_healthy = False
            self.is_data_healthy = False
        elif mode == SystemOperationalMode.DEGRADED_AI:
            self.is_ai_healthy = False
        elif mode == SystemOperationalMode.DEGRADED_DATA:
            self.is_data_healthy = False
        elif mode == SystemOperationalMode.FULL:
            self.is_ai_healthy = True
            self.is_data_healthy = True
            self.is_realtime_healthy = True
            self.active_faults.clear()
        return self.get_status()

    def inject_fault(self, req: FaultInjectionRequest) -> SystemHealthStatus:
        fault_name = f"{req.fault_type.value}:{req.target_subsystem}"
        self.active_faults[fault_name] = datetime.now(timezone.utc)

        if req.fault_type in (FaultType.AI_TIMEOUT, FaultType.AGENT_TIMEOUT):
            self.mode = SystemOperationalMode.DEGRADED_AI
            self.is_ai_healthy = False
        elif req.fault_type == FaultType.DATA_ADAPTER_FAIL:
            self.mode = SystemOperationalMode.DEGRADED_DATA
            self.is_data_healthy = False
        elif req.fault_type == FaultType.REDIS_DISCONNECT:
            self.mode = SystemOperationalMode.DEGRADED_REALTIME
            self.is_realtime_healthy = False

        return self.get_status()

    def clear_faults(self) -> SystemHealthStatus:
        self.active_faults.clear()
        self.mode = SystemOperationalMode.FULL
        self.is_ai_healthy = True
        self.is_data_healthy = True
        self.is_realtime_healthy = True
        return self.get_status()

    def get_status(self) -> SystemHealthStatus:
        return SystemHealthStatus(
            mode=self.mode,
            is_ai_healthy=self.is_ai_healthy,
            is_data_healthy=self.is_data_healthy,
            is_realtime_healthy=self.is_realtime_healthy,
            active_faults=list(self.active_faults.keys()),
        )
