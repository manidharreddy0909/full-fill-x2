# FULFILL-X — System Reliability, Degradation Modes & Chaos Specification

## Overview

The System Degradation & Chaos Subsystem manages operational modes and provides deterministic fault injection for reliability testing.

## System Operational Modes (`SystemOperationalMode`)

- `FULL`: 100% capacity across AI, data, and realtime services.
- `DEGRADED_AI`: AI providers offline; rule-based specialist fallbacks active.
- `DEGRADED_DATA`: External data adapters offline; synthetic/cached data fallbacks active.
- `DEGRADED_REALTIME`: EventBus/WebSocket issues; REST polling fallback active.
- `OFFLINE`: Network disconnected; local offline mode.
- `SAFE_MODE`: Execution locked to `DRY_RUN`.

## Chaos Fault Injector (`ChaosEngine`)

Supports fault types: `AI_TIMEOUT`, `REDIS_DISCONNECT`, `DB_TEMPORARY_DOWN`, `DATA_ADAPTER_FAIL`, `SIMULATION_TIMEOUT`, `AGENT_TIMEOUT`.
