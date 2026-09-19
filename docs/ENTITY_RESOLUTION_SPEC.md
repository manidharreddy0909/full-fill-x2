# Entity Resolution Service Specification

## 1. Objective
The `EntityResolutionService` (`backend/app/services/entity_resolution.py`) links unstructured or semi-structured external observation locations to canonical nodes in the supply chain World Model (`WorldNode`).

---

## 2. Deterministic Matching Pipeline
Resolution operates in three cascading evaluation tiers:

1. **Exact Alias / Name Match** (Score: 1.0):
   Matches external entity text (e.g. `"Port of Rotterdam"`, `"Kobe"`, `"Shanghai Harbor"`) directly against canonical node names or alias registries.

2. **Spatial Haversine Proximity Match** (Score: 0.85):
   Calculates great-circle distance $d$ between observation coordinates $(\text{lat}_1, \text{lon}_1)$ and graph node coordinates $(\text{lat}_2, \text{lon}_2)$.
   $$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
   Matches nodes within a 50 km proximity radius.

3. **Fallback Unresolved Candidate** (Score: 0.0):
   Emits an `EntityResolutionCandidate` with `match_status = "UNRESOLVED"` for human operator review in the Data Fabric workspace.
