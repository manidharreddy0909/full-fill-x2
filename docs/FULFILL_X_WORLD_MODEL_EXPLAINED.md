# FULFILL-X — WORLD MODEL EXPLAINED

> **Location**: `backend/app/graph/`  
> **Core Library**: NetworkX Graph + FastAPI Routers  

---

## 1. Graph Structure & Node Composition

The FULFILL-X World Model maintains a living graph representation of the fulfillment network consisting of **23 nodes and 32 directed edges**:

- **Suppliers (5 nodes)**: `sup-001` (Apex Electronics), `sup-002` (Global Components), `sup-003` (EuroFab), `sup-004` (NA Parts), `sup-005` (Backup Supply).
- **Ports (3 nodes)**: `port-001` (Osaka), `port-002` (Shanghai), `port-003` (Rotterdam).
- **Regional Warehouses (3 nodes)**: `wh-001` (APAC Hub), `wh-002` (EU Distribution), `wh-003` (NA West Coast).
- **Fulfillment Centers (2 nodes)**: `fc-001` (Primary East Asia FC), `fc-002` (Primary NA FC).
- **Customer Demand Zones (10 nodes)**: `cz-001` through `cz-010` (Tokyo, Osaka, Seoul, Singapore, London, Frankfurt, NY, LA, Chicago, Dallas).

---

## 2. Dynamic Propagation Mechanics

When a risk signal (e.g., tier-1 supplier disruption) is injected into `sup-001`:
1. NetworkX graph traversal calculates upstream-to-downstream edge dependencies.
2. In-memory node status updates from `OK` to `WARNING` or `DISRUPTED`.
3. Graph risk service triggers WebSocket event `RISK_SIGNAL_INJECTED`.
4. R3F WebGL 3D Canvas on `/world` updates visual node glow colors and edge animation streams.
