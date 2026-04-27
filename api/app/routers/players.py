from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analyzer import (
    get_players,
    get_player_history,
    get_player_alerts,
    get_global_alerts,
    get_isolated_alerts,
)

router = APIRouter(prefix="/players", tags=["players"])

@router.get("/")
def list_players(db: Session = Depends(get_db)):
    return get_players(db)

@router.get("/alerts")
def global_alerts(limit: int = 50, db: Session = Depends(get_db)):
    return get_global_alerts(db, limit)

@router.get("/alerts/isolated")
def isolated_alerts(limit: int = 50, db: Session = Depends(get_db)):
    return get_isolated_alerts(db, limit)

@router.get("/{player_id}/history")
def player_history(player_id: str, limit: int = 20, db: Session = Depends(get_db)):
    return get_player_history(db, player_id, limit)

@router.get("/{player_id}/alerts")
def player_alerts(player_id: str, db: Session = Depends(get_db)):
    return get_player_alerts(db, player_id)
