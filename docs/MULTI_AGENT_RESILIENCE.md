# FULFILL-X — Multi-Agent Resilience Subsystem Specification

## Overview

The Multi-Agent Resilience Subsystem provides structured, evidence-first multi-agent deliberation, bounded debate, structured operational memory, and agent calibration tracking.

## Architecture

```text
Specialist Proposals (Inventory, Supplier, Transport, Fulfillment, Resilience)
                       ↓
               Bounded Debate Engine (max 3 rounds)
                       ↓
         Adversary Challenge & Counter-Findings
                       ↓
       Verification Agent Constraint Check
                       ↓
            Decision Evidence Bundle
                       ↓
            Consensus Status & Action Plan
```

## Core Components

1. **Agent Memory Engine (`AgentMemoryEngine`)**:
   - Stores operational lessons, decisions, failures, constraints, and patterns.
   - Enforces multi-tenant isolation (`organization_id`).
   - Supports decay factor degradation and validation confidence boosting.

2. **Agent Performance Tracker (`AgentPerformanceTracker`)**:
   - Tracks specialist proposal counts, survival rates, average confidence, and calibration MAE/RMSE.

3. **Bounded Debate Engine (`BoundedDebateEngine`)**:
   - Conducts up to 3 rounds of structured debate.
   - Collects arguments, counter-arguments, and evidence citations.

4. **Decision Evidence Bundle (`DecisionEvidenceBundle`)**:
   - Bundles primary hypothesis, World Model snapshot ID, Monte Carlo resilience score, adversary counter-findings, and verification status.

## REST API Endpoints

- `POST /api/agents/resilience/deliberate` — Trigger multi-agent deliberation.
- `GET /api/agents/memory` — Query active operational memories.
- `POST /api/agents/memory` — Record new memory/lesson.
- `POST /api/agents/memory/validate` — Validate memory record.
- `GET /api/agents/performance` — Retrieve agent calibration performance.
