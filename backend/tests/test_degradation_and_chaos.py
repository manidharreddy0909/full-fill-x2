"""
FULFILL-X System Degradation & Chaos Fault Injection Unit Tests (Phase 10)
"""
import pytest
from app.core.degradation import (
    SystemDegradationManager,
    SystemOperationalMode,
    FaultInjectionRequest,
    FaultType,
)


def test_system_degradation_modes():
    mgr = SystemDegradationManager.get_instance()

    # Set DEGRADED_AI mode
    status = mgr.set_mode(SystemOperationalMode.DEGRADED_AI)
    assert status.mode == SystemOperationalMode.DEGRADED_AI
    assert status.is_ai_healthy is False

    # Set SAFE_MODE
    status_safe = mgr.set_mode(SystemOperationalMode.SAFE_MODE)
    assert status_safe.mode == SystemOperationalMode.SAFE_MODE
    assert status_safe.is_ai_healthy is False
    assert status_safe.is_data_healthy is False

    # Reset to FULL
    status_full = mgr.set_mode(SystemOperationalMode.FULL)
    assert status_full.mode == SystemOperationalMode.FULL
    assert status_full.is_ai_healthy is True
    assert status_full.is_data_healthy is True


def test_chaos_fault_injection():
    mgr = SystemDegradationManager.get_instance()

    # Inject fault
    req = FaultInjectionRequest(fault_type=FaultType.AI_TIMEOUT, target_subsystem="ollama_provider")
    status = mgr.inject_fault(req)
    assert status.mode == SystemOperationalMode.DEGRADED_AI
    assert len(status.active_faults) == 1
    assert "AI_TIMEOUT:ollama_provider" in status.active_faults

    # Clear faults
    status_cleared = mgr.clear_faults()
    assert status_cleared.mode == SystemOperationalMode.FULL
    assert len(status_cleared.active_faults) == 0
