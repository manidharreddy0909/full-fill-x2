# FULFILL-X — Static UI Inventory & Mock Analysis

## Overview

This inventory documents all hardcoded objects, fallback fixtures, demo values, and static presentation elements across the frontend codebase, detailing why each element exists and the required backend API connection for complete dynamic migration.

---

## 1. Frontend Component Static Element Catalog

| Component | Static / Hardcoded Element | Element Type | Backend API Connection | Migration Status |
| :--- | :--- | :--- | :--- | :--- |
| **Navbar.tsx** | Preset seed dropdown choices (`healthy`, `port_congested`, etc.) | Demo Preset Selector | `POST /api/world/seed` | `LEGITIMATE CONTROL` |
| **CommandCenter.tsx** | Hardcoded quick action preset triggers | Quick Filter Preset | `GET /api/world/summary` | `LEGITIMATE CONTROL` |
| **SpecialistWarRoom.tsx** | Fallback proposal list when API is offline | Component Fallback Fixture | `GET /api/agents/proposals` | `MOCK FALLBACK` |
| **GraphIntelligence.tsx** | Fallback graph node structure when GNN is offline | Component Fallback Fixture | `GET /api/graph/snapshot` | `MOCK FALLBACK` |
| **DemoMode.tsx** | Hardcoded 7-stage script storyboard steps | Demo Storyboard Configuration | `GET /api/demo/status` | `DEMO FIXTURE` |
| **DataFabric.tsx** | Weather & Earthquake source metadata badges | Static Connector Metadata | `GET /api/data/sources` | `LEGITIMATE METADATA` |
| **ObservabilityCenter.tsx** | Prometheus metric chart series labels | Metric Chart Descriptor | `GET /api/observability/metrics` | `REAL DATA LINKED` |
| **GovernanceCenter.tsx** | Sample policy evaluation input values | Interactive Form Default | `POST /api/policies/evaluate` | `INTERACTIVE FORM DEFAULT` |

---

## 2. Classification Summary

- **Problematic Hardcoded Business Logic**: 0 instances. All core supply chain metrics, resilience scores, risk maps, and decision proposals are fetched dynamically from backend REST APIs.
- **Mock Fallback Fixtures**: Present in `SpecialistWarRoom` and `GraphIntelligence` solely to ensure smooth offline UX when the backend server is un-reachable.
- **Demo Fixtures**: Present in `DemoMode` to drive the step-by-step deterministic demo script.
