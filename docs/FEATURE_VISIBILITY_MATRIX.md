# FULFILL-X — Feature Visibility & Discoverability Matrix

## 1. Executive Summary

This document audits backend capabilities against frontend UI entries, discoverability, interactive placement, and verification status to ensure zero hidden or unexposed features exist in FULFILL-X.

---

## 2. Feature Visibility & Discoverability Matrix

| Backend Capability | API Endpoint | Frontend Route Entry | Visible | Discoverable | Interactive | Verified | Status |
|---|---|---|---|---|---|---|---|
| **World Model Snapshot & Seeding** | `/api/world/snapshot`, `/api/world/seed` | `/world`, Navbar Preset Dropdown | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Multi-Dimensional Risk Engine** | `/api/risk/map`, `/api/risk/inject` | `/command`, `/intelligence/risk`, Modal | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Multi-Agent Swarm Deliberation** | `/api/agents/resilience/deliberate` | `/intelligence`, `/intelligence/agents` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Graph Neural Network (GNN)** | `/api/graph/propagation` | `/intelligence/gnn` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Causal Inference & Counterfactuals** | `/api/graph/causal/hypotheses` | `/intelligence/causal` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Adversarial Red-Team Engine** | `/api/adversary/attack` | `/response/adversary` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Multi-Objective Decision Cockpit** | `/api/cockpit/session/create` | `/decision/cockpit` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Verification Safety Gate** | `/api/execution/authorize` | `/decision/verification` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Digital Twin Stochastic Engine** | `/api/simulation/monte-carlo` | `/simulation/twin` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Node Criticality Ranking** | `/api/simulation/criticality` | `/simulation/twin` Table | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Agent Memory & Challenger Models** | `/api/agents/memory`, `/api/learning/challengers` | `/learning/deliberate` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Real-Time Telemetry & Alert ACK** | `/api/observability/events`, `/alerts/acknowledge` | `/observability/events` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Resilience Scorecard & Chaos Injection**| `/api/resilience-os/scorecard`, `/degradation/fault` | `/governance/resilience` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Model Cards & Policy Evaluation** | `/api/governance/model-card/{name}`, `/policies/evaluate` | `/governance/policies` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |
| **Benchmark Evaluation Harness** | `/api/evaluation/run`, `/api/evaluation/run-all` | `/evaluation` | YES | YES | YES | YES | **EXPOSED & VERIFIED** |

---

## 3. Summary Statistics

- **Total Backend Capability Subsystems**: 15
- **Exposed & Interactive Frontend Workspaces**: 15 / 15 (100%)
- **Hidden / Unexposed Capabilities**: 0 (0%)
- **Status**: 100% Discoverable and Interactive
