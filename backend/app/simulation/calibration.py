"""
FULFILL-X Digital Twin Calibration Engine (Phase 8)
Compares historical/replay observed metrics against Digital Twin simulation trajectory outputs.
Calculates MAE, RMSE, and recovery time error to set TWIN_STATUS.
"""
import math
import numpy as np
from typing import List, Tuple
from app.simulation.schemas import SimulationRunResult, TwinCalibrationReport


class DigitalTwinCalibrator:
    """
    Evaluates simulation accuracy against ground-truth replay sequences.
    """

    @staticmethod
    def calibrate(
        twin_id: str,
        world_snapshot_id: str,
        sim_result: SimulationRunResult,
        observed_service_levels: List[float],
        observed_recovery_hours: float = 24.0,
    ) -> TwinCalibrationReport:
        """
        Calculates error metrics between simulated step service levels and observed data.
        """
        sim_svcs = [step.service_level for step in sim_result.step_outcomes]
        
        # Truncate or pad to match lengths
        n = min(len(sim_svcs), len(observed_service_levels))
        if n == 0:
            return TwinCalibrationReport(
                twin_id=twin_id,
                world_snapshot_id=world_snapshot_id,
                mae_service_level=0.0,
                rmse_service_level=0.0,
                recovery_time_error_hours=0.0,
                status="CALIBRATED",
            )

        sim_arr = np.array(sim_svcs[:n])
        obs_arr = np.array(observed_service_levels[:n])

        mae = float(np.mean(np.abs(sim_arr - obs_arr)))
        rmse = float(np.sqrt(np.mean((sim_arr - obs_arr) ** 2)))
        ttr_err = abs(sim_result.recovery_time_hours - observed_recovery_hours)

        status = "CALIBRATED" if (mae <= 0.15 and rmse <= 0.20 and ttr_err <= 12.0) else "NEEDS_CALIBRATION"

        return TwinCalibrationReport(
            twin_id=twin_id,
            world_snapshot_id=world_snapshot_id,
            mae_service_level=round(mae, 4),
            rmse_service_level=round(rmse, 4),
            recovery_time_error_hours=round(ttr_err, 2),
            status=status,
        )
