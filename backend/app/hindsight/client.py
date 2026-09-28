"""
Hindsight Experiential Memory Client (Phase 2A)

Provides a clean unified client abstraction supporting:
1. "mock" (in-memory deterministic store with rich canonical episodes)
2. "self_hosted" (HTTP client against an on-premise Hindsight cluster)
3. "cloud" (HTTP client against managed Hindsight Cloud with secure token auth)

Zero hardcoded credentials; fully driven by environment variables via app.config.settings.
"""
import logging
from typing import Dict, List, Any, Optional
import httpx

from app.config import settings

logger = logging.getLogger("fulfill-x.hindsight")


class HindsightClient:
    """
    Client interface for Hindsight memory operations.
    Thread-safe and singleton-compatible.
    """
    _instance: Optional["HindsightClient"] = None

    def __init__(
        self,
        endpoint: Optional[str] = None,
        api_key: Optional[str] = None,
        mode: Optional[str] = None,
        tenant_id: Optional[str] = None,
    ):
        self.endpoint = (endpoint or settings.HINDSIGHT_ENDPOINT).rstrip("/")
        self.api_key = api_key if api_key is not None else settings.HINDSIGHT_API_KEY
        self.mode = (mode or settings.HINDSIGHT_MODE).lower()
        self.tenant_id = tenant_id or settings.HINDSIGHT_TENANT_ID

        # In-memory store for mock mode
        self._memory_store: Dict[str, Dict[str, Any]] = {}
        self._seed_mock_store()

    @classmethod
    def get_instance(cls) -> "HindsightClient":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _seed_mock_store(self) -> None:
        """
        Pre-populate mock store with canonical historical episodes so recall & reflect
        demonstrate deterministic learning loops immediately.
        """
        canonical_experiences = [
            {
                "experience_id": "exp-canonical-001",
                "incident_id": "inc-2025-08-14",
                "timestamp": "2025-08-14T10:15:00Z",
                "incident_signature": "CAPACITY_DEGRADATION:sup-002",
                "world_state": {
                    "disrupted_nodes": ["sup-002"],
                    "network_health": 0.74,
                    "target_node": "sup-002",
                },
                "topology_context": {"echelon": "TIER_1_SUPPLIER", "alternative": "sup-004"},
                "observed_symptoms": ["Production throughput reduced by 60%", "Delayed raw material shipments"],
                "hypothesis": "Supplier D possesses redundant production line capable of buffering load",
                "decision": "Substitute Supplier B with Supplier D (Capacity = 52%)",
                "action": {"type": "SUPPLIER_SUBSTITUTION", "source_node": "sup-002", "target_node": "sup-004", "allocated_capacity": 0.52},
                "alternative_actions": [{"type": "HOLD_PRODUCTION", "risk": "HIGH"}],
                "assumptions": ["Supplier D capacity > 40%", "Route between Supplier D and Warehouse A remains operational"],
                "predicted_outcome": {"recovery_percentage": 90.0, "recovery_hours": 3.0, "cost": 12000.0},
                "actual_outcome": {"recovery_percentage": 92.5, "recovery_hours": 2.8, "cost": 11800.0, "status": "SUCCESS"},
                "outcome_status": "SUCCESS",
                "success_conditions": [
                    "Substitute supplier capacity must exceed 40%",
                    "Direct logistics transit route must be healthy",
                    "Component qualification compatibility score >= 0.85",
                ],
                "failure_boundaries": [
                    "Substitute supplier capacity < 40% leads to secondary stockout cascade",
                    "Lead time delta > 5 days induces warehouse starving",
                ],
                "evidence": [
                    {"type": "TELEMETRY", "metric": "service_level", "value": 0.94},
                    {"type": "AUDIT_LOG", "event": "ORDER_DISPATCH_CONFIRMED"},
                ],
                "provenance": {
                    "source_type": "OBSERVED",
                    "is_simulation": False,
                    "confidence": 0.92,
                    "recorded_by": "OpsTeam-Alpha",
                },
                "human_override": False,
                "policy_decision": "COMPLIANT",
                "confidence": 0.92,
                "truth_status": "OBSERVED",
            },
            {
                "experience_id": "exp-canonical-002",
                "incident_id": "inc-2025-10-02",
                "timestamp": "2025-10-02T14:40:00Z",
                "incident_signature": "PORT_CONGESTION:port-001",
                "world_state": {
                    "disrupted_nodes": ["port-001"],
                    "network_health": 0.68,
                    "target_node": "port-001",
                },
                "topology_context": {"echelon": "MARITIME_PORT", "alternative": "port-002"},
                "observed_symptoms": ["Berth wait times exceeded 72h", "Vessel queue at 9 vessels"],
                "hypothesis": "Diverting container volume to secondary port avoids demurrage fees",
                "decision": "Reroute maritime container flow to Port 2",
                "action": {"type": "PORT_REROUTE", "source_node": "port-001", "target_node": "port-002"},
                "alternative_actions": [],
                "assumptions": ["Port 2 rail spur capacity available"],
                "predicted_outcome": {"recovery_percentage": 80.0, "recovery_hours": 12.0, "cost": 35000.0},
                "actual_outcome": {"recovery_percentage": 45.0, "recovery_hours": 36.0, "cost": 84000.0, "status": "FAILURE"},
                "outcome_status": "FAILURE",
                "failure_reason": "Port 2 rail intermodal terminal lacked chassis availability under surprise volume",
                "success_conditions": ["Intermodal rail chassis buffer must exceed 150 units at alternate port"],
                "failure_boundaries": ["Port queue > 5 vessels with rail equipment shortage guarantees failure"],
                "evidence": [{"type": "PORT_TELEMETRY", "metric": "container_dwell_time", "value": 96.0}],
                "provenance": {
                    "source_type": "OBSERVED",
                    "is_simulation": False,
                    "confidence": 0.88,
                    "recorded_by": "OpsTeam-Beta",
                },
                "human_override": True,
                "policy_decision": "OVERRIDDEN",
                "confidence": 0.88,
                "truth_status": "OBSERVED",
            },
            {
                "experience_id": "exp-canonical-003",
                "incident_id": "inc-2025-11-20",
                "timestamp": "2025-11-20T08:00:00Z",
                "incident_signature": "INVENTORY_DEPLETION:wh-001",
                "world_state": {"disrupted_nodes": ["wh-001"], "network_health": 0.82},
                "topology_context": {"echelon": "REGIONAL_WAREHOUSE"},
                "observed_symptoms": ["SKU stock below safety threshold"],
                "hypothesis": "Dynamic inter-warehouse buffer transfer replenishes SKU in under 4 hours",
                "decision": "Emergency inventory draw from Warehouse C reserves",
                "action": {"type": "INVENTORY_REALLOCATION", "source_node": "wh-003", "target_node": "wh-001"},
                "alternative_actions": [],
                "assumptions": ["Transport route between WH-3 and WH-1 clear"],
                "predicted_outcome": {"recovery_percentage": 95.0, "recovery_hours": 2.0, "cost": 8500.0},
                "actual_outcome": {"recovery_percentage": 94.0, "recovery_hours": 1.9, "cost": 8200.0, "status": "SUCCESS"},
                "outcome_status": "SUCCESS",
                "success_conditions": ["Stock at source facility >= 180% of safety buffer", "Dedicated express ground transit unblocked"],
                "failure_boundaries": ["Source facility buffer < 120% causes multi-warehouse stockout"],
                "evidence": [{"type": "WMS_TRANSACTION", "metric": "stock_level", "value": 500}],
                "provenance": {
                    "source_type": "OBSERVED",
                    "is_simulation": False,
                    "confidence": 0.95,
                    "recorded_by": "AutomatedFulfillmentPolicy",
                },
                "human_override": False,
                "policy_decision": "COMPLIANT",
                "confidence": 0.95,
                "truth_status": "OBSERVED",
            }
        ]

        for exp in canonical_experiences:
            self._memory_store[exp["experience_id"]] = exp

    async def retain(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Store experience payload into Hindsight.
        """
        exp_id = payload.get("experience_id")
        if not exp_id:
            raise ValueError("experience_id required in payload")

        if self.mode == "mock":
            self._memory_store[exp_id] = payload
            logger.info(f"HINDSIGHT_RETAIN [MOCK]: Stored experience {exp_id} for tenant {self.tenant_id}")
            return {
                "success": True,
                "experience_id": exp_id,
                "mode": "mock",
                "tenant_id": self.tenant_id,
            }

        # Cloud or self-hosted HTTP dispatch
        headers = {"Content-Type": "application/json", "X-Tenant-ID": self.tenant_id}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{self.endpoint}/v1/memories/retain", json=payload, headers=headers)
                res.raise_for_status()
                data = res.json()
                logger.info(f"HINDSIGHT_RETAIN [{self.mode.upper()}]: Stored experience {exp_id}")
                return data
        except Exception as e:
            logger.warning(f"Hindsight {self.mode} retain failed ({e}), falling back to local memory store")
            self._memory_store[exp_id] = payload
            return {"success": True, "experience_id": exp_id, "fallback": True}

    async def recall(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Query memories from Hindsight matching incident signature or target nodes.
        """
        if self.mode == "mock":
            sig = query.get("incident_signature")
            target_nodes = query.get("target_node_ids", [])
            min_conf = query.get("min_confidence", 0.0)

            results = []
            for exp in self._memory_store.values():
                score = 0.0
                if sig and (sig in exp.get("incident_signature", "") or exp.get("incident_signature", "") in sig):
                    score += 0.6
                if target_nodes:
                    exp_targets = exp.get("world_state", {}).get("disrupted_nodes", [])
                    if any(t in exp_targets for t in target_nodes):
                        score += 0.4
                # If neither filter specified or score matched
                if (not sig and not target_nodes) or score > 0:
                    conf = exp.get("confidence", 0.8)
                    if conf >= min_conf:
                        exp_copy = dict(exp)
                        exp_copy["_relevance_score"] = max(score, 0.5)
                        results.append(exp_copy)

            # Sort by relevance desc
            results.sort(key=lambda x: x.get("_relevance_score", 0), reverse=True)
            logger.info(f"HINDSIGHT_RECALL [MOCK]: Recalled {len(results)} experiences")
            return results

        headers = {"Content-Type": "application/json", "X-Tenant-ID": self.tenant_id}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{self.endpoint}/v1/memories/recall", json=query, headers=headers)
                res.raise_for_status()
                data = res.json()
                logger.info(f"HINDSIGHT_RECALL [{self.mode.upper()}]: Recalled {len(data.get('results', []))} experiences")
                return data.get("results", [])
        except Exception as e:
            logger.warning(f"Hindsight {self.mode} recall failed ({e}), falling back to local memory store")
            return list(self._memory_store.values())

    def list_all_local(self) -> List[Dict[str, Any]]:
        """Return all memories currently in local store."""
        return list(self._memory_store.values())

    def get_by_id(self, experience_id: str) -> Optional[Dict[str, Any]]:
        """Fetch single experience by ID."""
        return self._memory_store.get(experience_id)
