"""
FULFILL-X Deterministic Dataset Generator Subsystem (Phase 6)
Generates time-aware, deterministic training datasets for forecasting, disruption,
and anomaly tasks with strict chronological train/validation/test splitting.
"""
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple, Optional, Any
from app.ml.schemas import DatasetMetadata, DatasetGenerationMode, MLTaskType
from app.ml.features import FeatureExtractor


class DeterministicDatasetGenerator:
    """
    Generates reproducible benchmark and training datasets with seed 42.
    Ensures strict chronological splits without random shuffling leakage.
    """

    @classmethod
    def generate_dataset(
        self,
        task_type: MLTaskType,
        organization_id: str = "org-fulfillx-default",
        record_count: int = 500,
        generation_mode: DatasetGenerationMode = DatasetGenerationMode.SYNTHETIC,
        scenario_mode: str = "NORMAL",
        seed: int = 42,
    ) -> Tuple[DatasetMetadata, pd.DataFrame, Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]]:
        """
        Returns (metadata, full_dataframe, (train_df, val_df, test_df)).
        """
        np.random.seed(seed)
        start_time = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
        records: List[Dict[str, Any]] = []

        entities = ["sup-001", "sup-002", "port-longbeach", "wh-chicago", "route-us-east"]

        for i in range(record_count):
            dt = start_time + timedelta(hours=i)
            entity = entities[i % len(entities)]
            
            # Base features
            base_demand = 50.0 + 15.0 * math.sin(i / 12.0) + np.random.normal(0, 3.0)
            base_lead_time = 24.0 + 5.0 * math.cos(i / 24.0) + np.random.normal(0, 1.5)
            base_utilization = min(1.5, max(0.2, 0.65 + 0.2 * math.sin(i / 18.0) + np.random.normal(0, 0.05)))
            risk_score = min(1.0, max(0.0, 0.2 + 0.1 * math.sin(i / 10.0) + np.random.normal(0, 0.04)))

            # Inject scenario anomalies / disruptions
            is_anomaly = False
            disruption_event = 0.0

            if scenario_mode == "DEMAND_SPIKE" and i % 50 in range(10, 15):
                base_demand *= 1.8
                is_anomaly = True
            elif scenario_mode == "SUPPLIER_DELAY" and i % 60 in range(20, 26):
                base_lead_time += 36.0
                disruption_event = 1.0
            elif scenario_mode == "PORT_DELAY" and i % 70 in range(30, 38):
                base_utilization = 1.45
                disruption_event = 1.0
                is_anomaly = True
            elif scenario_mode == "WEATHER_DISRUPTION" and i % 40 in range(5, 9):
                risk_score = min(1.0, risk_score + 0.5)
                disruption_event = 1.0
            elif scenario_mode == "COMPOUND_EVENT" and i % 80 in range(40, 48):
                base_demand *= 1.6
                base_lead_time += 48.0
                risk_score = 0.92
                disruption_event = 1.0
                is_anomaly = True

            # Extract feature set
            op_data = {
                "capacity": 100.0,
                "current_load": base_demand,
                "lead_time_hours": base_lead_time,
                "inventory_level": 500.0,
                "risk_score": risk_score,
                "risk_trend": 0.02 if risk_score > 0.4 else -0.01,
            }
            net_stats = {"degree": 4, "upstream_count": 2, "downstream_count": 3, "bottleneck_score": 0.35}
            
            fset = FeatureExtractor.extract_features(
                entity_id=entity,
                timestamp=dt,
                operational_data=op_data,
                network_stats=net_stats,
                historical_values=[base_demand - 5, base_demand - 2, base_demand - 1, base_demand],
            )

            rec = {"timestamp": dt, "entity_id": entity}
            rec.update(fset.numerical_features)
            
            # Target labels depending on task
            if task_type == MLTaskType.DEMAND_FORECASTING:
                rec["target"] = round(base_demand, 2)
            elif task_type == MLTaskType.DISRUPTION_PROBABILITY:
                rec["target"] = float(disruption_event or (1.0 if risk_score > 0.65 else 0.0))
            elif task_type == MLTaskType.ANOMALY_DETECTION:
                rec["target"] = 1.0 if is_anomaly else 0.0

            records.append(rec)

        df = pd.DataFrame(records)
        df.sort_values(by="timestamp", inplace=True)
        df.reset_index(drop=True, inplace=True)

        # Time-aware split: 70% Train, 15% Validation, 15% Test
        n = len(df)
        train_end = int(n * 0.70)
        val_end = int(n * 0.85)

        train_df = df.iloc[:train_end].copy()
        val_df = df.iloc[train_end:val_end].copy()
        test_df = df.iloc[val_end:].copy()

        dataset_id = f"ds-{task_type.value.lower()}-{seed}-{record_count}"
        metadata = DatasetMetadata(
            dataset_id=dataset_id,
            organization_id=organization_id,
            source_ids=[f"synthetic-{scenario_mode.lower()}"],
            feature_schema_version=FeatureExtractor.FEATURE_SCHEMA_VERSION,
            label_definition=f"Target label for {task_type.value}",
            record_count=record_count,
            time_range_start=df["timestamp"].iloc[0],
            time_range_end=df["timestamp"].iloc[-1],
            generation_mode=generation_mode,
            seed=seed,
            quality_score=1.0,
            provenance_id=f"prov-{dataset_id}",
        )

        return metadata, df, (train_df, val_df, test_df)
