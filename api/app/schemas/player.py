from pydantic import BaseModel
from datetime import date
from typing import Optional

class GameLog(BaseModel):
    id: int
    season: Optional[str]
    player_id: str
    player_name: str
    team_abbreviation: str
    game_date: date
    wl: Optional[str]
    min: Optional[float]
    pts: Optional[float]
    reb: Optional[float]
    ast: Optional[float]
    stl: Optional[float]
    blk: Optional[float]
    tov: Optional[float]
    fg_pct: Optional[float]
    plus_minus: Optional[float]
    home_game: Optional[bool]
    against: Optional[str]
    pts_zscore: Optional[float]
    reb_zscore: Optional[float]
    ast_zscore: Optional[float]
    stl_zscore: Optional[float]
    blk_zscore: Optional[float]
    tov_zscore: Optional[float]
    fg_pct_zscore: Optional[float]
    plus_minus_zscore: Optional[float]
    global_zscore: Optional[float]

    class Config:
        from_attributes = True

class PlayerSummary(BaseModel):
    player_id: str
    player_name: str
    team_abbreviation: str

class AlertGame(BaseModel):
    player_id: str
    player_name: str
    team_id: Optional[str] = None
    team_abbreviation: str
    game_date: date
    pts: Optional[float]
    reb: Optional[float]
    ast: Optional[float]
    global_zscore: Optional[float]
    alert_type: str
    avg_pts: Optional[float] = None
    avg_reb: Optional[float] = None
    avg_ast: Optional[float] = None
    avg_min: Optional[float] = None

    class Config:
        from_attributes = True
