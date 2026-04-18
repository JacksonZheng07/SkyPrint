from pydantic import BaseModel, Field

from app.models.common import AircraftType, Waypoint


class PredictRequest(BaseModel):
    waypoints: list[Waypoint] = Field(min_length=2)
    aircraft_type: AircraftType
    flight_id: str | None = None


class CompareRequest(BaseModel):
    trajectory_a: list[Waypoint] = Field(min_length=2)
    trajectory_b: list[Waypoint] = Field(min_length=2)
    aircraft_type: AircraftType


class OptimizeRequest(BaseModel):
    waypoints: list[Waypoint] = Field(min_length=2)
    aircraft_type: AircraftType
    altitude_range_ft: tuple[int, int] = (29000, 43000)
    step_ft: int = 1000
