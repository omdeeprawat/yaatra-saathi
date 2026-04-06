from fastapi import APIRouter, Depends, HTTPException, status
from schemas.stop import StopResponse
from db.database import get_db
from sqlalchemy.orm import Session


router = APIRouter(prefix='/map', tags = ['map'])

@router.get("/stops", response_model=list[StopResponse])
def get_all_stops(db:Session = Depends(get_db)):
  stops = db.query(YatraStop).order_by(YatraStop.stage_number).all()
  return stops



@router.get('/stops/{stop_id}', response_model=StopResponse)
def get_stop(stop_id : int, db : Session = Depends(get_db)):
  stop = db.query(YatraStop).filter(YatraStop.id == stop_id).first()
  if not stop:
    raise HTTPException(
      status_code= status.HTTP_404_NOT_FOUND,
      detail='stop not found'
    )
  return stop