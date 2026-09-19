"""
FULFILL-X Operational Alert Engine Unit Tests (Phase 5)
"""
import pytest
from app.services.alerts import AlertEngine
from app.schemas.events import EventSeverity


@pytest.mark.asyncio
async def test_alert_engine_trigger_cooldown_and_acknowledge():
    engine = AlertEngine(cooldown_seconds=10)
    engine.reset()

    # 1. Trigger Alert
    alert1 = await engine.trigger_alert(
        source_component="test_component",
        title="Elevated Event Processing Lag",
        message="Consumer lag exceeded threshold of 500ms",
        severity=EventSeverity.HIGH,
        organization_id="org-test-alert",
    )
    assert alert1 is not None
    assert alert1["title"] == "Elevated Event Processing Lag"
    assert alert1["status"] == "ACTIVE"

    # 2. Trigger identical alert immediately -> suppressed due to cooldown
    alert2 = await engine.trigger_alert(
        source_component="test_component",
        title="Elevated Event Processing Lag",
        message="Consumer lag exceeded threshold of 500ms",
        severity=EventSeverity.HIGH,
        organization_id="org-test-alert",
    )
    assert alert2 is None

    # 3. List active alerts
    alerts_list = engine.list_alerts("org-test-alert")
    assert len(alerts_list) == 1

    # 4. Acknowledge alert
    success = await engine.acknowledge_alert(alert1["alert_id"], acknowledged_by="operator-1", organization_id="org-test-alert")
    assert success is True

    alerts_list_after = engine.list_alerts("org-test-alert")
    assert alerts_list_after[0]["status"] == "ACKNOWLEDGED"
