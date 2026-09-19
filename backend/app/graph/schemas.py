"""
FULFILL-X Graph & Causal Intelligence Schemas (Phase 7)
"""
from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class CausalStatus(str, Enum):
    OBSERVED_ASSOCIATION = "OBSERVED_ASSOCIATION"
    CAUSAL_HYPOTHESIS = "CAUSAL_HYPOTHESIS"
    SUPPORTED_BY_EXPERIMENT = "SUPPORTED_BY_EXPERIMENT"
    REJECTED = "REJECTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


class GraphTaskType(str, Enum):
    NODE_RISK_PREDICTION = "NODE_RISK_PREDICTION"
    EDGE_RISK_PREDICTION = "EDGE_RISK_PREDICTION"
    DISRUPTION_PROPAGATION = "DISRUPTION_PROPAGATION"


class GraphNode(BaseModel):
    id: str
    type: str
    organization_id: str = "org-fulfillx-default"
    operational_status: str = "HEALTHY"
    capacity: float = 100.0
    utilization: float = 0.70
    throughput: float = 1000.0
    backlog: int = 0
    inventory_count: int = 5000
    lead_time_hours: float = 24.0
    current_risk: float = 0.05
    is_disrupted: bool = False
    attributes: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source_id: str
    target_id: str
    type: str
    organization_id: str = "org-fulfillx-default"
    transit_time_hours: float = 12.0
    route_capacity: float = 500.0
    current_utilization: float = 0.65
    current_risk: float = 0.05
    is_disrupted: bool = False
    attributes: Dict[str, Any] = Field(default_factory=dict)


class GraphSnapshot(BaseModel):
    snapshot_id: str
    world_seed: int = 42
    timestamp: float
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    node_count: int
    edge_count: int
    graph_version: str = "1.0.0"
    organization_id: str = "org-fulfillx-default"


class GraphNodeFeatures(BaseModel):
    node_id: str
    operational_vector: List[float]  # [capacity, utilization, throughput, backlog, inventory, lead_time]
    risk_vector: List[float]         # [composite, operational_risk, disruption_risk, signal_count]
    network_vector: List[float]      # [in_degree, out_degree, degree_centrality, betweenness, closeness, pagerank, upstream_cnt, downstream_cnt]
    external_vector: List[float]     # [weather_score, seismic_score, news_score, transit_score]
    combined_feature_vector: List[float]


class GraphFeatures(BaseModel):
    snapshot_id: str
    schema_version: str = "1.0.0"
    node_features: Dict[str, GraphNodeFeatures]
    edge_index: List[List[int]]  # 2 x E tensor list
    edge_attr: List[List[float]] # E x F tensor list
    node_id_map: Dict[str, int]
    int_to_node_id: Dict[int, str]
    created_at: float


class GraphPrediction(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    prediction_id: str
    task_type: GraphTaskType
    target_id: str  # node_id or edge_id
    predicted_risk: float
    horizon_hours: int = 24
    lower_bound_95: float
    upper_bound_95: float
    model_id: str
    model_version: str
    baseline_metric: float
    gnn_metric: float
    is_gnn_preferred: bool
    evidence_narrative: List[str]
    created_at: float
    organization_id: str = "org-fulfillx-default"


class GraphPath(BaseModel):
    path_nodes: List[str]
    path_edges: List[str]
    path_probability: float
    cumulative_risk: float
    total_transit_time_hours: float


class PropagationTrace(BaseModel):
    trace_id: str
    origin_node_id: str
    depth: int
    propagation_probability: float
    affected_nodes: List[str]
    affected_edges: List[str]
    primary_path: GraphPath
    secondary_paths: List[GraphPath] = Field(default_factory=list)
    expected_impact: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
    evidence_narratives: List[str]
    created_at: float
    organization_id: str = "org-fulfillx-default"


class CausalEvidence(BaseModel):
    observation_type: str
    source_entity: str
    target_entity: str
    metric_name: str
    observed_value: float
    timestamp: float
    support_score: float


class CausalHypothesis(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    hypothesis_id: str
    cause_node_id: str
    effect_node_id: str
    propagation_path: List[str]
    evidence: List[CausalEvidence]
    confidence: float
    causal_status: CausalStatus = CausalStatus.CAUSAL_HYPOTHESIS
    assumptions: List[str]
    counterfactual_delta: Dict[str, float] = Field(default_factory=dict)
    created_at: float
    model_version: str = "gnn-causal-v1.0.0"
    organization_id: str = "org-fulfillx-default"


class CounterfactualRequest(BaseModel):
    target_node_id: str
    parameter_overrides: Dict[str, float]  # e.g. {"capacity": 80.0, "utilization": 0.40}
    horizon_hours: int = 24


class CounterfactualRun(BaseModel):
    run_id: str
    target_node_id: str
    parameter_overrides: Dict[str, float]
    baseline_network_risk: float
    counterfactual_network_risk: float
    risk_delta: float
    baseline_service_level: float
    counterfactual_service_level: float
    service_delta: float
    cost_delta: float
    affected_nodes: List[str]
    affected_paths: List[List[str]]
    execution_time_ms: float
    created_at: float
    organization_id: str = "org-fulfillx-default"


class GraphModelMetadata(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_id: str
    model_name: str
    task_type: GraphTaskType
    model_version: str
    state: str = "ACTIVE"
    baseline_metric: float
    gnn_metric: float
    is_gnn_preferred: bool
    checksum: str
    artifact_path: str
    graph_schema_version: str = "1.0.0"
    feature_schema_version: str = "1.0.0"
    training_seed: int = 42
    metrics: Dict[str, float] = Field(default_factory=dict)
    created_at: float


class GraphDriftReport(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    report_id: str
    timestamp: float
    degree_distribution_psi: float
    feature_psi: Dict[str, float]
    embedding_drift_ks: float
    prediction_drift_psi: float
    is_drift_detected: bool
    alert_message: str
