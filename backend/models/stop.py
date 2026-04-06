from sqlalchemy import Column, Integer, String, Boolean, Float, Text, JSON
from db.database import Base

class YatraStop(Base):
  __tablename__ = 'yatra_stops'

  id = Column(Integer, primary_key=True, index=true)
  name = Column(String(100), nullable=False)
  name_hindi = Column(String(100), nullable=True)
  stage_number = Column(INteger, nullable=False)
  latitude = Column(Float, nullable=False)
  longitude = Column(Float, nullable=False)
  altitude_meters = Column(Integer, nullable=False)
  distance_from_previous_km = Column(Float, default=0.0)
  cumulative_km = Column(Float, default=0.0)
  description = Column(Text, nullable=True)
  significance = Column(Text, nullable=True)
  stop_type = Column(String(50), default='camp')
  photos = Column(JSON, default=list)