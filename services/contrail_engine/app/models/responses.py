from pydantic import BaseModel


class WaypointResult(BaseModel):
    sac_satisfied: bool
    persistent: bool
    rf_net_w_m2: float | None = None
    contrail_age_hours: float | None = None
    ef_j_per_m: float | None = None


class ContrailSummary(BaseModel):
    contrail_probability: float
    total_energy_forcing_j: float
    mean_rf_net_w_m2: float
    max_contrail_lifetime_hours: float


class PredictResponse(BaseModel):
    flight_id: str
    waypoint_results: list[WaypointResult]
    summary: ContrailSummary
    co2_kg: float
    used_fallback: bool


class CompareResponse(BaseModel):
    trajectory_a: PredictResponse
    trajectory_b: PredictResponse
    delta_ef_percent: float
    delta_co2_percent: float
    recommendation: str


class AltitudeAdjustment(BaseModel):
    waypoint_index: int
    original_altitude_ft: float
    suggested_altitude_ft: float
    reason: str


class OptimizeResponse(BaseModel):
    original: PredictResponse
    optimized: PredictResponse
    altitude_adjustments: list[AltitudeAdjustment]
    ef_reduction_percent: float
