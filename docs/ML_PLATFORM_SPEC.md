# Predictive ML Platform Specification

## 1. Predictive Tasks Covered
FULFILL-X Phase 6 covers 3 core operational prediction tasks:

1. **Demand / Volume Forecasting (`DEMAND_FORECASTING`)**:
   - Predicts future operational volume/demand per entity.
   - Outputs: `predicted_value`, 95% confidence prediction intervals (`prediction_interval_lower`, `prediction_interval_upper`), residual standard deviation.
   - ML Algorithm: Random Forest Regressor / Ridge Regression vs 3-Step Moving Average Baseline.

2. **Disruption Probability Modeling (`DISRUPTION_PROBABILITY`)**:
   - Predicts probability of future disruption ($[0.0, 1.0]$) affecting a supplier, port, or route.
   - Outputs: `disruption_probability`, calibrated confidence score, Brier score metric.
   - ML Algorithm: Calibrated Gradient Boosting / Logistic Regression vs Historical Occurrence Rate Baseline.

3. **Operational Anomaly Detection (`ANOMALY_DETECTION`)**:
   - Detects unusual operational metric behavior across throughput, lead time, and utilization.
   - Outputs: `anomaly_score`, `is_anomaly` flag, top feature z-score deviations.
   - ML Algorithm: Isolation Forest vs Z-Score Threshold Baseline ($Z > 3.0$).
