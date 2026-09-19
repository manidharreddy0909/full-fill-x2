"""
FULFILL-X World Model Pydantic Schemas
Strict Pydantic v2 implementation matching docs/DATA_MODEL.md & docs/WORLD_MODEL_SPEC.md
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Generic, TypeVar, Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, ConfigDict, field_validator

T = TypeVar("T")


class NodeType(str, Enum):
    SUPPLIER = "SUPPLIER"
    WAREHOUSE = "WAREHOUSE"
    FULFILLMENT_CENTER = "FULFILLMENT_CENTER"
    CUSTOMER_ZONE = "CUSTOMER_ZONE"
    PORT = "PORT"


class EdgeType(str, Enum):
    ROUTE = "ROUTE"
    DEPENDENCY = "DEPENDENCY"
    RISK_PROPAGATION = "RISK_PROPAGATION"


class TransportMode(str, Enum):
    SEA = "SEA"
    AIR = "AIR"
    ROAD = "ROAD"
    RAIL = "RAIL"


class OrderPriority(str, Enum):
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"
    CRITICAL = "CRITICAL"


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    AT_RISK = "AT_RISK"
    BREACHED = "BREACHED"


class ShipmentStatus(str, Enum):
    IN_TRANSIT = "IN_TRANSIT"
    DELAYED = "DELAYED"
    DISRUPTED = "DISRUPTED"
    DELIVERED = "DELIVERED"


class Position3D(BaseModel):
    x: float = Field(..., description="X coordinate in 3D topology space")
    y: float = Field(..., description="Y coordinate in 3D topology space")
    z: float = Field(..., description="Z coordinate in 3D topology space")

    model_config = ConfigDict(frozen=True)


class NodeRiskScores(BaseModel):
    composite: float = Field(default=0.0, ge=0.0, le=1.0, description="Weighted composite risk score [0,1]")
    financial: float = Field(default=0.0, ge=0.0, le=1.0, description="Financial loss risk score [0,1]")
    sla: float = Field(default=0.0, ge=0.0, le=1.0, description="SLA breach probability score [0,1]")
    operational: float = Field(default=0.0, ge=0.0, le=1.0, description="Operational disruption risk score [0,1]")
    sustainability: float = Field(default=0.0, ge=0.0, le=1.0, description="Environmental / carbon risk score [0,1]")

    @field_validator("composite", mode="before")
    @classmethod
    def clamp_risk(cls, v: float) -> float:
        if isinstance(v, (int, float)):
            return max(0.0, min(1.0, float(v)))
        return v


class WorldNode(BaseModel):
    id: str = Field(..., description="Unique node ID (e.g., sup-001, wh-001, fc-001, cz-001, port-001)")
    type: NodeType = Field(..., description="Type of network node")
    name: str = Field(..., max_length=120, description="Human-readable node name")
    position: Position3D = Field(..., description="Fixed 3D spatial layout coordinates")
    risk_scores: NodeRiskScores = Field(default_factory=NodeRiskScores, description="Multi-dimensional risk scores")
    inventory_level: float = Field(default=1.0, ge=0.0, le=1.0, description="Current stock level ratio [0,1]")
    capacity: float = Field(default=1000.0, gt=0.0, description="Maximum throughput / capacity units per day")
    is_disrupted: bool = Field(default=False, description="Active disruption status flag")
    disruption_source_ids: list[str] = Field(default_factory=list, description="IDs of signals causing disruption")
    tags: list[str] = Field(default_factory=list, description="Metadata tags (e.g. tier-1, electronics, apac)")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Custom operational attributes")

    # Domain attributes
    tier: int | None = Field(default=None, ge=1, le=3, description="Supplier tier (1=direct, 2=indirect)")
    region: str | None = Field(default=None, description="Geographic region code")
    lead_time_days: float | None = Field(default=None, gt=0.0, description="Standard lead time in days")
    qualification_score: float | None = Field(default=None, ge=0.0, le=1.0, description="Supplier quality rating")
    is_alternative_available: bool | None = Field(default=None, description="Whether qualified alternative supplier exists")
    capacity_units: float | None = Field(default=None, description="Warehouse storage capacity units")
    utilization: float | None = Field(default=None, ge=0.0, le=1.0, description="Current facility utilization ratio")
    safety_stock_threshold: float | None = Field(default=None, ge=0.0, le=1.0, description="Reorder trigger threshold ratio")
    capacity_orders_per_day: float | None = Field(default=None, description="FC max order processing capacity per day")
    current_backlog: int | None = Field(default=None, ge=0, description="Outstanding unfulfilled order count")
    sla_at_risk_count: int | None = Field(default=None, ge=0, description="Number of orders at risk of SLA breach")
    demand_units_per_day: float | None = Field(default=None, description="Customer zone average daily demand")
    sla_commitment_hours: float | None = Field(default=None, description="SLA delivery window commitment in hours")
    sla_current_risk: float | None = Field(default=None, ge=0.0, le=1.0, description="Probability of SLA breach")
    throughput_vessels_per_day: float | None = Field(default=None, description="Port daily vessel throughput capacity")
    connected_route_ids: list[str] = Field(default_factory=list, description="Connected route edge IDs")


class WorldEdge(BaseModel):
    id: str = Field(..., description="Unique edge ID (e.g., rt-001, dep-001)")
    source_node_id: str = Field(..., description="Source node ID")
    target_node_id: str = Field(..., description="Target node ID")
    type: EdgeType = Field(default=EdgeType.ROUTE, description="Edge type: ROUTE or DEPENDENCY")
    transport_mode: TransportMode | None = Field(default=TransportMode.ROAD, description="Mode of transport for routes")
    load: float = Field(default=0.5, ge=0.0, le=1.0, description="Current edge load / utilization ratio [0,1]")
    capacity: float = Field(default=500.0, gt=0.0, description="Max edge transport throughput units per day")
    delay_hours: float = Field(default=0.0, ge=0.0, description="Cumulative delay hours vs baseline transit time")
    standard_time_hours: float = Field(default=24.0, gt=0.0, description="Expected baseline transit time in hours")
    cost_per_unit: float = Field(default=10.0, ge=0.0, description="Freight cost per unit in USD")
    emissions_per_unit: float = Field(default=1.5, ge=0.0, description="CO2e emissions per unit in kg")
    is_disrupted: bool = Field(default=False, description="Active route disruption flag")
    dependency_type: str | None = Field(default=None, description="Dependency type: SUPPLY, INVENTORY, SLA, COMPONENT")
    criticality: float | None = Field(default=None, ge=0.0, le=1.0, description="Dependency criticality rating [0,1]")
    alternative_route_ids: list[str] = Field(default_factory=list, description="IDs of alternative fallback routes")


class Product(BaseModel):
    id: str = Field(..., description="Product SKU ID (e.g., prod-001)")
    sku: str = Field(..., description="Stock keeping unit code")
    name: str = Field(..., description="Product name")
    category: str = Field(..., description="Product category")
    unit_value: float = Field(..., gt=0.0, description="Unit commercial value in USD")
    is_critical: bool = Field(default=False, description="High priority critical SKU flag")


class InventoryRecord(BaseModel):
    id: str = Field(..., description="Unique inventory record ID")
    node_id: str = Field(..., description="Node where inventory is stored")
    product_id: str = Field(..., description="Product SKU ID")
    quantity: float = Field(default=0.0, ge=0.0, description="Current quantity on hand")
    safety_stock: float = Field(default=100.0, ge=0.0, description="Minimum safety stock threshold")
    reorder_point: float = Field(default=200.0, ge=0.0, description="Reorder trigger quantity")
    max_capacity: float = Field(default=1000.0, gt=0.0, description="Maximum storage capacity")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Order(BaseModel):
    id: str = Field(..., description="Unique order ID (e.g., ord-001)")
    customer_zone_id: str = Field(..., description="Destination customer zone ID")
    product_id: str = Field(..., description="Product SKU ID")
    quantity: float = Field(..., gt=0.0, description="Order quantity in units")
    committed_delivery_at: datetime = Field(..., description="Committed delivery SLA timestamp")
    status: OrderStatus = Field(default=OrderStatus.PENDING, description="Order lifecycle status")
    fulfillment_center_id: str = Field(..., description="Assigned fulfillment center ID")


class Shipment(BaseModel):
    id: str = Field(..., description="Unique shipment ID (e.g., ship-001)")
    order_id: str = Field(..., description="Associated order ID")
    route_id: str = Field(..., description="Active transit route ID")
    origin_node_id: str = Field(..., description="Origin node ID")
    destination_node_id: str = Field(..., description="Destination node ID")
    departed_at: datetime = Field(..., description="Departure timestamp")
    expected_arrival_at: datetime = Field(..., description="Expected arrival timestamp")
    status: ShipmentStatus = Field(default=ShipmentStatus.IN_TRANSIT, description="Shipment transit status")
    delay_hours: float = Field(default=0.0, ge=0.0, description="Current transit delay in hours")


class Commitment(BaseModel):
    id: str = Field(..., description="Unique SLA commitment ID (e.g., comm-001)")
    customer_zone_id: str = Field(..., description="Customer zone ID")
    fulfillment_center_id: str = Field(..., description="Servicing fulfillment center ID")
    sla_hours: float = Field(..., gt=0.0, description="Max delivery window SLA in hours")
    penalty_per_breach: float = Field(..., ge=0.0, description="Penalty fee per breach in USD")
    priority: OrderPriority = Field(default=OrderPriority.STANDARD, description="Commitment priority level")


class WorldStateSnapshot(BaseModel):
    snapshot_id: UUID = Field(default_factory=uuid4, description="Unique snapshot UUID")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Snapshot creation timestamp")
    nodes: list[WorldNode] = Field(..., description="Complete set of network nodes")
    edges: list[WorldEdge] = Field(..., description="Complete set of network edges")
    products: list[Product] = Field(default_factory=list, description="Product catalog")
    inventory: list[InventoryRecord] = Field(default_factory=list, description="Inventory records")
    orders: list[Order] = Field(default_factory=list, description="Active customer orders")
    shipments: list[Shipment] = Field(default_factory=list, description="In-transit shipments")
    commitments: list[Commitment] = Field(default_factory=list, description="SLA commitments")
    network_health_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Overall network health index [0,1]")
    total_risk_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Composite network risk score [0,1]")


class WorldSummary(BaseModel):
    total_nodes: int = Field(..., description="Total node count")
    suppliers_count: int = Field(..., description="Supplier count")
    warehouses_count: int = Field(..., description="Warehouse count")
    fulfillment_centers_count: int = Field(..., description="Fulfillment center count")
    customer_zones_count: int = Field(..., description="Customer zone count")
    ports_count: int = Field(..., description="Port count")
    total_edges: int = Field(..., description="Total edge count")
    total_routes_count: int = Field(..., description="Route edge count")
    total_dependencies_count: int = Field(..., description="Dependency edge count")
    total_inventory_units: float = Field(..., description="Sum of all inventory units across nodes")
    average_capacity_utilization: float = Field(..., description="Mean node utilization ratio [0,1]")
    disrupted_nodes_count: int = Field(..., description="Count of active disrupted nodes")
    disrupted_edges_count: int = Field(..., description="Count of active disrupted edges")
    network_health_score: float = Field(..., description="Overall network health score [0,1]")


class ApiResponse(BaseModel, Generic[T]):
    data: T | None = Field(default=None, description="Response payload")
    meta: dict[str, Any] = Field(
        default_factory=lambda: {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": str(uuid4()),
        },
        description="Response metadata",
    )
    error: dict[str, Any] | None = Field(default=None, description="Error details if status failed")
