# Model Cards Catalog

## 1. Demand Forecasting Model (`mdl-demand-forecasting-42`)
- **Purpose**: Short-to-medium term operational demand forecasting per entity.
- **Model Type**: Random Forest Regressor (50 trees, max depth 8).
- **Features Used**: `capacity_utilization`, `lead_time_hours`, `rolling_mean_3`, `hour_of_day`.
- **Evaluation Metrics**: Test MAE = 2.41, Test RMSE = 3.12, sMAPE = 4.8%.
- **Limitations**: Trained on local Free-First synthetic/replayed benchmark data.
- **Prohibited Use**: Direct automated state mutation without Risk Engine validation.

---

## 2. Disruption Probability Model (`mdl-disruption-probability-42`)
- **Purpose**: Predicting probability of future entity disruption ($[0.0, 1.0]$).
- **Model Type**: Calibrated Gradient Boosting / Logistic Regression.
- **Features Used**: `recent_risk_score`, `external_signal_count`, `bottleneck_score`.
- **Evaluation Metrics**: Precision = 0.88, Recall = 0.82, Brier Score = 0.082.
- **Limitations**: Evaluated under Seed 42 benchmark scenarios.
- **Prohibited Use**: Cross-tenant data pooling or unauthorized model activation.
