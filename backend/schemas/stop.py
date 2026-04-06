from pydantic import BaseModel

class StopResponse(BaseModel):
  id : int
  name:str
  name_hindi : str
  stage_number : int
  latitude : float
  longitude : float
  altitude_meters: int
  distance_from_previous_km : float
  cumulative_km : float
  description : str | None
  significance : str | None
  stop_type : str
  photos : list[str]


  class Config:
    from_attributes = True