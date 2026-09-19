# Feature Engineering & Feature Store Specification

## 1. Feature Categories (`feature_schema_version = "v1.0.0"`)

| Feature Name | Category | Description | Formula / Source |
| :--- | :--- | :--- | :--- |
| `hour_of_day` | Temporal | Hour of timestamp (0-23) | `dt.hour` |
| `day_of_week` | Temporal | Day of week (0-6) | `dt.weekday()` |
| `capacity_utilization` | Operational | Current load ratio | `current_load / capacity` |
| `lead_time_hours` | Operational | Entity lead time | Ingestion observation |
| `inventory_level` | Operational | Current stock level | State snapshot |
| `degree_centrality` | Network | Graph node degree | NetworkX degree |
| `external_signal_count` | External | Active external signal count | Signal fusion window |
| `recent_risk_score` | Risk | Composite risk score | Risk Engine output |
| `rolling_mean_3` | Historical Lag | 3-step historical mean | $\frac{1}{3}\sum_{i=1}^3 x_{t-i}$ |

---

## 2. Anti-Leakage Safeguard
All feature extractions evaluate timestamps strictly prior to prediction time ($t < t_{\text{predict}}$). Target labels are never included in input feature sets.
