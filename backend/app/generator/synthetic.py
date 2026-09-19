"""
FULFILL-X Deterministic Synthetic Network Generator
Generates reproducible supply network graphs from seed (P02-003)
"""
import random
from datetime import datetime, timezone, timedelta
from uuid import UUID, uuid5, NAMESPACE_DNS

from app.models.world import SupplyNetworkGraph
from app.schemas.world import (
    WorldNode,
    WorldEdge,
    NodeType,
    EdgeType,
    TransportMode,
    Position3D,
    NodeRiskScores,
    Product,
    InventoryRecord,
    Order,
    OrderStatus,
    Shipment,
    ShipmentStatus,
    Commitment,
    OrderPriority,
    WorldStateSnapshot,
)


class SyntheticDataGenerator:
    """
    Seeded, deterministic generator for FULFILL-X synthetic MVP supply network.
    Guarantees:
      - generate_world(seed=42) == generate_world(seed=42)
      - generate_world(seed=42) != generate_world(seed=43)
    """

    def __init__(self, seed: int = 42, preset: str = "healthy"):
        self.seed: int = seed
        self.preset: str = preset.lower()
        self.rng: random.Random = random.Random(seed)

    def _generate_deterministic_uuid(self, name: str) -> UUID:
        """Derive a deterministic UUID from seed and name."""
        return uuid5(NAMESPACE_DNS, f"fulfill-x.seed-{self.seed}.{name}")

    def generate(self) -> SupplyNetworkGraph:
        """Build and populate a deterministic SupplyNetworkGraph."""
        snapshot_id = self._generate_deterministic_uuid("snapshot")
        graph = SupplyNetworkGraph(snapshot_id=snapshot_id)

        # 1. Generate Products
        products = self._build_products()
        for p in products:
            graph.add_product(p)

        # 2. Generate Nodes (Suppliers, Ports, Warehouses, FCs, Customer Zones)
        nodes = self._build_nodes()
        for n in nodes:
            graph.add_node(n)

        # 3. Generate Edges (Routes and Dependencies)
        edges = self._build_edges(nodes)
        for e in edges:
            graph.add_edge(e)

        # 4. Generate Inventory Records
        inventory = self._build_inventory(nodes, products)
        for inv in inventory:
            graph.add_inventory_record(inv)

        # 5. Generate Commitments & Orders
        commitments = self._build_commitments(nodes)
        for comm in commitments:
            graph.add_commitment(comm)

        orders, shipments = self._build_orders_and_shipments(nodes, products, edges)
        for ord_item in orders:
            graph.add_order(ord_item)
        for ship_item in shipments:
            graph.add_shipment(ship_item)

        # 6. Apply Preset Disruption Overlays if specified
        if self.preset == "double_punch":
            self._apply_double_punch_preset(graph)

        return graph

    def generate_snapshot(self) -> WorldStateSnapshot:
        """Directly generate a WorldStateSnapshot."""
        return self.generate().to_snapshot()

    def _build_products(self) -> list[Product]:
        return [
            Product(
                id="prod-001",
                sku="SKU-ELEC-A",
                name="Electronics Micro-Controller Module A",
                category="Electronics",
                unit_value=120.0,
                is_critical=True,
            ),
            Product(
                id="prod-002",
                sku="SKU-COMP-B",
                name="Precision Power Components Kit B",
                category="Components",
                unit_value=85.0,
                is_critical=True,
            ),
            Product(
                id="prod-003",
                sku="SKU-PKG-C",
                name="Eco-Friendly Thermal Packaging C",
                category="Packaging",
                unit_value=15.0,
                is_critical=False,
            ),
        ]

    def _build_nodes(self) -> list[WorldNode]:
        nodes: list[WorldNode] = []

        # 5 SUPPLIERS (Tier 0: Z = -15)
        suppliers_raw = [
            ("sup-001", "Apex Electronics", 1, "APAC", -16.0, 0.92, 2500.0, ["tier-1", "electronics", "APAC"]),
            ("sup-002", "Global Components Ltd", 1, "APAC", -8.0, 0.88, 1800.0, ["tier-1", "components", "APAC"]),
            ("sup-003", "EuroFab Materials", 2, "EU", 0.0, 0.95, 1200.0, ["tier-2", "raw-materials", "EU"]),
            ("sup-004", "NA Parts Co", 2, "NA", 8.0, 0.90, 1500.0, ["tier-2", "parts", "NA"]),
            ("sup-005", "Backup Supply Inc", 2, "NA", 16.0, 0.85, 1000.0, ["tier-2", "backup", "NA"]),
        ]
        for sup_id, name, tier, region, x_pos, qual, cap, tags in suppliers_raw:
            risk_val = round(self.rng.uniform(0.02, 0.08), 4)
            nodes.append(
                WorldNode(
                    id=sup_id,
                    type=NodeType.SUPPLIER,
                    name=name,
                    position=Position3D(x=x_pos, y=0.0, z=-15.0),
                    risk_scores=NodeRiskScores(
                        composite=risk_val,
                        financial=risk_val,
                        sla=risk_val,
                        operational=risk_val,
                        sustainability=risk_val,
                    ),
                    inventory_level=round(self.rng.uniform(0.85, 0.98), 2),
                    capacity=cap,
                    is_disrupted=False,
                    disruption_source_ids=[],
                    tags=tags,
                    tier=tier,
                    region=region,
                    lead_time_days=round(self.rng.uniform(3.0, 10.0), 1),
                    qualification_score=qual,
                    is_alternative_available=True,
                )
            )

        # 3 PORTS (Tier 1: Z = -8)
        ports_raw = [
            ("port-001", "Port of Osaka", -10.0, "APAC", 12.0),
            ("port-002", "Port of Shanghai", 0.0, "APAC", 20.0),
            ("port-003", "Port of Rotterdam", 10.0, "EU", 15.0),
        ]
        for port_id, name, x_pos, region, vessel_cap in ports_raw:
            risk_val = round(self.rng.uniform(0.03, 0.09), 4)
            nodes.append(
                WorldNode(
                    id=port_id,
                    type=NodeType.PORT,
                    name=name,
                    position=Position3D(x=x_pos, y=0.0, z=-8.0),
                    risk_scores=NodeRiskScores(
                        composite=risk_val,
                        financial=risk_val,
                        sla=risk_val,
                        operational=risk_val,
                        sustainability=risk_val,
                    ),
                    inventory_level=1.0,
                    capacity=vessel_cap * 100,
                    is_disrupted=False,
                    region=region,
                    throughput_vessels_per_day=vessel_cap,
                    tags=["port", region.lower()],
                )
            )

        # 3 WAREHOUSES (Tier 2: Z = 0)
        warehouses_raw = [
            ("wh-001", "APAC Regional Hub", -10.0, "APAC", 50000.0),
            ("wh-002", "EU Distribution Center", 0.0, "EU", 40000.0),
            ("wh-003", "NA West Coast Hub", 10.0, "NA", 60000.0),
        ]
        for wh_id, name, x_pos, region, cap_units in warehouses_raw:
            risk_val = round(self.rng.uniform(0.04, 0.10), 4)
            util = round(self.rng.uniform(0.65, 0.82), 2)
            nodes.append(
                WorldNode(
                    id=wh_id,
                    type=NodeType.WAREHOUSE,
                    name=name,
                    position=Position3D(x=x_pos, y=0.0, z=0.0),
                    risk_scores=NodeRiskScores(
                        composite=risk_val,
                        financial=risk_val,
                        sla=risk_val,
                        operational=risk_val,
                        sustainability=risk_val,
                    ),
                    inventory_level=util,
                    capacity=cap_units,
                    is_disrupted=False,
                    capacity_units=cap_units,
                    utilization=util,
                    safety_stock_threshold=0.25,
                    region=region,
                    tags=["warehouse", region.lower()],
                )
            )

        # 2 FULFILLMENT CENTERS (Tier 3: Z = 8)
        fcs_raw = [
            ("fc-001", "Primary FC East Asia", -6.0, "APAC", 8000.0),
            ("fc-002", "Primary FC North America", 6.0, "NA", 12000.0),
        ]
        for fc_id, name, x_pos, region, daily_cap in fcs_raw:
            risk_val = round(self.rng.uniform(0.02, 0.07), 4)
            nodes.append(
                WorldNode(
                    id=fc_id,
                    type=NodeType.FULFILLMENT_CENTER,
                    name=name,
                    position=Position3D(x=x_pos, y=0.0, z=8.0),
                    risk_scores=NodeRiskScores(
                        composite=risk_val,
                        financial=risk_val,
                        sla=risk_val,
                        operational=risk_val,
                        sustainability=risk_val,
                    ),
                    inventory_level=0.85,
                    capacity=daily_cap,
                    is_disrupted=False,
                    capacity_orders_per_day=daily_cap,
                    current_backlog=int(self.rng.uniform(120, 300)),
                    utilization=0.72,
                    sla_at_risk_count=0,
                    region=region,
                    tags=["fulfillment-center", region.lower()],
                )
            )

        # 10 CUSTOMER ZONES (Tier 4: Z = 16)
        cz_names = [
            ("cz-001", "Tokyo Metro Zone", -18.0, "APAC", 1200.0, 24.0),
            ("cz-002", "Osaka Kansai Zone", -14.0, "APAC", 800.0, 24.0),
            ("cz-003", "Seoul Capital Area", -10.0, "APAC", 950.0, 24.0),
            ("cz-004", "Singapore Urban Zone", -6.0, "APAC", 600.0, 36.0),
            ("cz-005", "London Greater Area", -2.0, "EU", 1100.0, 48.0),
            ("cz-006", "Frankfurt Rhine-Main", 2.0, "EU", 850.0, 48.0),
            ("cz-007", "New York Tri-State", 6.0, "NA", 2200.0, 24.0),
            ("cz-008", "Los Angeles Basin", 10.0, "NA", 1800.0, 24.0),
            ("cz-009", "Chicago Metro Zone", 14.0, "NA", 1300.0, 36.0),
            ("cz-010", "Dallas-Fort Worth Zone", 18.0, "NA", 900.0, 36.0),
        ]
        for cz_id, name, x_pos, region, demand, sla_hrs in cz_names:
            risk_val = round(self.rng.uniform(0.01, 0.05), 4)
            nodes.append(
                WorldNode(
                    id=cz_id,
                    type=NodeType.CUSTOMER_ZONE,
                    name=name,
                    position=Position3D(x=x_pos, y=0.0, z=16.0),
                    risk_scores=NodeRiskScores(
                        composite=risk_val,
                        financial=risk_val,
                        sla=risk_val,
                        operational=risk_val,
                        sustainability=risk_val,
                    ),
                    inventory_level=1.0,
                    capacity=demand,
                    is_disrupted=False,
                    demand_units_per_day=demand,
                    sla_commitment_hours=sla_hrs,
                    sla_current_risk=risk_val,
                    region=region,
                    tags=["customer-zone", region.lower()],
                )
            )

        return nodes

    def _build_edges(self, nodes: list[WorldNode]) -> list[WorldEdge]:
        edges: list[WorldEdge] = []

        # Route definitions (Source -> Target, Mode, Base Time, Cost, Emissions)
        route_defs = [
            # Suppliers -> Ports / Warehouses
            ("sup-001", "port-001", TransportMode.SEA, 12.0, 4.5, 0.8, "rt-001"),
            ("sup-001", "port-002", TransportMode.SEA, 18.0, 5.2, 0.9, "rt-002"),
            ("sup-002", "port-002", TransportMode.SEA, 14.0, 4.8, 0.85, "rt-003"),
            ("sup-003", "port-003", TransportMode.ROAD, 8.0, 6.0, 1.2, "rt-004"),
            ("sup-004", "wh-003", TransportMode.ROAD, 16.0, 7.5, 1.5, "rt-005"),
            ("sup-005", "wh-003", TransportMode.RAIL, 24.0, 4.0, 0.6, "rt-006"),

            # Ports -> Warehouses
            ("port-001", "wh-001", TransportMode.SEA, 36.0, 15.0, 2.1, "rt-007"),
            ("port-002", "wh-001", TransportMode.SEA, 48.0, 18.0, 2.5, "rt-008"),
            ("port-003", "wh-002", TransportMode.ROAD, 12.0, 8.0, 1.3, "rt-009"),
            ("port-001", "wh-003", TransportMode.SEA, 120.0, 35.0, 4.2, "rt-010"),

            # Warehouses -> Fulfillment Centers
            ("wh-001", "fc-001", TransportMode.ROAD, 18.0, 5.0, 0.9, "rt-011"),
            ("wh-002", "fc-001", TransportMode.AIR, 14.0, 28.0, 6.5, "rt-012"),
            ("wh-003", "fc-002", TransportMode.ROAD, 20.0, 6.5, 1.1, "rt-013"),
            ("wh-001", "fc-002", TransportMode.AIR, 22.0, 32.0, 7.2, "rt-014"),

            # FCs -> Customer Zones
            ("fc-001", "cz-001", TransportMode.ROAD, 6.0, 3.5, 0.4, "rt-015"),
            ("fc-001", "cz-002", TransportMode.ROAD, 8.0, 4.0, 0.5, "rt-016"),
            ("fc-001", "cz-003", TransportMode.AIR, 10.0, 14.0, 2.8, "rt-017"),
            ("fc-001", "cz-004", TransportMode.AIR, 12.0, 16.0, 3.1, "rt-018"),
            ("fc-001", "cz-005", TransportMode.AIR, 16.0, 22.0, 4.5, "rt-019"),
            ("fc-002", "cz-006", TransportMode.AIR, 15.0, 20.0, 4.2, "rt-020"),
            ("fc-002", "cz-007", TransportMode.ROAD, 8.0, 4.5, 0.6, "rt-021"),
            ("fc-002", "cz-008", TransportMode.ROAD, 6.0, 4.0, 0.5, "rt-022"),
            ("fc-002", "cz-009", TransportMode.ROAD, 12.0, 6.0, 0.8, "rt-023"),
            ("fc-002", "cz-010", TransportMode.ROAD, 14.0, 6.5, 0.9, "rt-024"),
        ]

        for src, tgt, mode, base_time, cost, emiss, route_id in route_defs:
            load_val = round(self.rng.uniform(0.40, 0.78), 2)
            edges.append(
                WorldEdge(
                    id=route_id,
                    source_node_id=src,
                    target_node_id=tgt,
                    type=EdgeType.ROUTE,
                    transport_mode=mode,
                    load=load_val,
                    capacity=1500.0,
                    delay_hours=0.0,
                    standard_time_hours=base_time,
                    cost_per_unit=cost,
                    emissions_per_unit=emiss,
                    is_disrupted=False,
                )
            )

        # Dependency Edges (for Risk Propagation BFS)
        dependencies_raw = [
            ("sup-001", "wh-001", "SUPPLY", 0.9, "dep-001"),
            ("sup-002", "wh-001", "SUPPLY", 0.85, "dep-002"),
            ("sup-003", "wh-002", "SUPPLY", 0.8, "dep-003"),
            ("sup-004", "wh-003", "SUPPLY", 0.85, "dep-004"),
            ("wh-001", "fc-001", "INVENTORY", 0.95, "dep-005"),
            ("wh-003", "fc-002", "INVENTORY", 0.95, "dep-006"),
            ("fc-001", "cz-001", "SLA", 0.9, "dep-007"),
            ("fc-002", "cz-007", "SLA", 0.9, "dep-008"),
        ]

        for src, tgt, dep_type, crit, dep_id in dependencies_raw:
            edges.append(
                WorldEdge(
                    id=dep_id,
                    source_node_id=src,
                    target_node_id=tgt,
                    type=EdgeType.DEPENDENCY,
                    dependency_type=dep_type,
                    criticality=crit,
                    load=0.0,
                    capacity=1000.0,
                    delay_hours=0.0,
                    cost_per_unit=0.0,
                    emissions_per_unit=0.0,
                    is_disrupted=False,
                )
            )

        return edges

    def _build_inventory(self, nodes: list[WorldNode], products: list[Product]) -> list[InventoryRecord]:
        records: list[InventoryRecord] = []
        inv_idx = 1
        now = datetime.now(timezone.utc)

        target_nodes = [n for n in nodes if n.type in (NodeType.WAREHOUSE, NodeType.FULFILLMENT_CENTER)]
        for node in target_nodes:
            for prod in products:
                qty = round(self.rng.uniform(1500.0, 5000.0), 0)
                records.append(
                    InventoryRecord(
                        id=f"inv-{inv_idx:03d}",
                        node_id=node.id,
                        product_id=prod.id,
                        quantity=qty,
                        safety_stock=500.0,
                        reorder_point=1000.0,
                        max_capacity=8000.0,
                        updated_at=now,
                    )
                )
                inv_idx += 1
        return records

    def _build_commitments(self, nodes: list[WorldNode]) -> list[Commitment]:
        commitments: list[Commitment] = []
        cz_nodes = [n for n in nodes if n.type == NodeType.CUSTOMER_ZONE]
        fc_nodes = [n for n in nodes if n.type == NodeType.FULFILLMENT_CENTER]
        comm_idx = 1

        for cz in cz_nodes:
            # Assign nearest FC
            fc = fc_nodes[0] if "APAC" in cz.tags or "EU" in cz.tags else fc_nodes[1]
            priority = OrderPriority.PREMIUM if cz.demand_units_per_day > 1500 else OrderPriority.STANDARD
            commitments.append(
                Commitment(
                    id=f"comm-{comm_idx:03d}",
                    customer_zone_id=cz.id,
                    fulfillment_center_id=fc.id,
                    sla_hours=cz.sla_commitment_hours or 24.0,
                    penalty_per_breach=250.0 if priority == OrderPriority.PREMIUM else 100.0,
                    priority=priority,
                )
            )
            comm_idx += 1
        return commitments

    def _build_orders_and_shipments(
        self, nodes: list[WorldNode], products: list[Product], edges: list[WorldEdge]
    ) -> tuple[list[Order], list[Shipment]]:
        orders: list[Order] = []
        shipments: list[Shipment] = []
        now = datetime.now(timezone.utc)

        cz_nodes = [n for n in nodes if n.type == NodeType.CUSTOMER_ZONE]
        fc_nodes = [n for n in nodes if n.type == NodeType.FULFILLMENT_CENTER]
        routes = [e for e in edges if e.type == EdgeType.ROUTE]

        for i in range(1, 16):
            cz = self.rng.choice(cz_nodes)
            fc = fc_nodes[0] if "APAC" in cz.tags or "EU" in cz.tags else fc_nodes[1]
            prod = self.rng.choice(products)
            route = self.rng.choice(routes)

            ord_id = f"ord-{i:03d}"
            ship_id = f"ship-{i:03d}"
            delivery_dt = now + timedelta(hours=self.rng.uniform(12.0, 48.0))

            orders.append(
                Order(
                    id=ord_id,
                    customer_zone_id=cz.id,
                    product_id=prod.id,
                    quantity=round(self.rng.uniform(20.0, 150.0), 0),
                    committed_delivery_at=delivery_dt,
                    status=OrderStatus.SHIPPED,
                    fulfillment_center_id=fc.id,
                )
            )

            shipments.append(
                Shipment(
                    id=ship_id,
                    order_id=ord_id,
                    route_id=route.id,
                    origin_node_id=fc.id,
                    destination_node_id=cz.id,
                    departed_at=now - timedelta(hours=self.rng.uniform(2.0, 10.0)),
                    expected_arrival_at=delivery_dt,
                    status=ShipmentStatus.IN_TRANSIT,
                    delay_hours=0.0,
                )
            )

        return orders, shipments

    def _apply_double_punch_preset(self, graph: SupplyNetworkGraph) -> None:
        """Apply 'The Double Punch' demo disruption scenario overlay."""
        # Disruption 1: Typhoon Hana at Port of Osaka (port-001) & APAC Hub (wh-001)
        if "port-001" in graph.nodes:
            port = graph.nodes["port-001"]
            port.is_disrupted = True
            port.disruption_source_ids = ["sig-typhoon-hana"]
            port.risk_scores = NodeRiskScores(
                composite=0.92, financial=0.85, sla=0.95, operational=0.95, sustainability=0.50
            )

        if "wh-001" in graph.nodes:
            wh = graph.nodes["wh-001"]
            wh.is_disrupted = True
            wh.disruption_source_ids = ["sig-typhoon-hana"]
            wh.risk_scores = NodeRiskScores(
                composite=0.88, financial=0.78, sla=0.90, operational=0.92, sustainability=0.45
            )

        # Disruption 2: Factory Fire Shenzhen at Apex Electronics (sup-001)
        if "sup-001" in graph.nodes:
            sup = graph.nodes["sup-001"]
            sup.is_disrupted = True
            sup.disruption_source_ids = ["sig-factory-fire-sz"]
            sup.risk_scores = NodeRiskScores(
                composite=0.95, financial=0.90, sla=0.98, operational=0.96, sustainability=0.60
            )

        # Disrupt connected routes
        disrupted_routes = ["rt-001", "rt-007", "rt-008"]
        for r_id in disrupted_routes:
            if r_id in graph.edges:
                edge = graph.edges[r_id]
                edge.is_disrupted = True
                edge.delay_hours = 48.0
                edge.load = 0.95


def generate_world(seed: int = 42, preset: str = "healthy") -> SupplyNetworkGraph:
    """Helper function to generate a world graph."""
    return SyntheticDataGenerator(seed=seed, preset=preset).generate()
