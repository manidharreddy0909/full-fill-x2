# FULFILL-X — Execution Safety Plane Specification

## Overview

The Execution Safety Plane enforces safe-by-design operational execution via the `ExecutionProvider` interface.

## Modes

1. `DRY_RUN` (Default): Validates candidate plans without mutating operational world state.
2. `SIMULATED`: Applies plan actions to an isolated Digital Twin simulation sandbox.
3. `LIVE`: Performs operator-authorized live execution (protected dry-run simulation mode).

## Safety Guarantees

- **Human Operator Signature**: Requires explicit `authorized_by` signature.
- **Policy Verification**: Requires `policy_verified = True`.
- **Sandbox Isolation**: World Model production state is never mutated directly by automated agent processes.
