# Data Quality Engine Specification

## 1. Quality Assessment Dimensions
The `DataQualityEngine` (`backend/app/services/data_quality.py`) evaluates incoming `ExternalObservation` records across four deterministic metrics:

1. **Completeness Score ($S_c$)**: Ratio of non-null mandatory fields (`observed_at`, `source_id`, `observation_type`, `provenance_id`, coordinates or location name).
2. **Validity Score ($S_v$)**: Coordinate bounds validation ($-90 \le \text{lat} \le 90$, $-180 \le \text{lon} \le 180$) and valid enumeration types.
3. **Freshness Score ($S_f$)**: Decay function based on observation timestamp relative to ingestion time (stale cutoff default: 24 hours).
4. **Duplicate Score ($S_d$)**: Content hash uniqueness check within the active ingestion window.

---

## 2. Composite Quality Calculation
$$S_{\text{overall}} = 0.40 S_c + 0.30 S_v + 0.20 S_f + 0.10 S_d$$

* **Status Thresholds**:
  * `VALID`: $S_{\text{overall}} \ge 0.70$
  * `DEGRADED`: $0.40 \le S_{\text{overall}} < 0.70$
  * `REJECTED`: $S_{\text{overall}} < 0.40$
