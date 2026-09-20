# FULFILL-X — GNN & CAUSAL INTELLIGENCE EXPLAINED

> **Locations**: `backend/app/gnn/` & `backend/app/causal/`  

---

## 1. Graph Neural Network (GNN) Risk Topology
- **Model File**: `backend/app/gnn/models.py`
- **Methodology**: Uses PyTorch/Scikit graph embedding layers to compute spatial risk propagation across supply chain edges.
- **Input**: 23-node NetworkX adjacency matrix + node feature vectors (capacity, inventory, risk score).
- **Output**: Predicted propagation probabilities to 2-hop downstream neighbors.

---

## 2. Causal DAG & Counterfactual Engine
- **Service File**: `backend/app/causal/service.py`
- **Methodology**: Builds a directed acyclic graph (DAG) representing structural causal relationships between suppliers, transit routes, and customer zones.
- **Counterfactual Query**: Computes *"What would happen to fulfillment SLA if supplier sup-001 capacity dropped by 50%?"*
- **Output**: Counterfactual SLA impact delta and confidence intervals.
