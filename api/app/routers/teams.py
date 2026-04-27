from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analyzer import get_team_alerts

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/{team_abbr}/alerts")
def team_alerts(team_abbr: str, limit: int = 20, db: Session = Depends(get_db)):
    return get_team_alerts(db, team_abbr, limit)
