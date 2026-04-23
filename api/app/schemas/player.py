from pydantic import BaseModel
from typing import Optional


class PlayerBase(BaseModel):
    name: str
    team: str
    position: Optional[str] = None


class PlayerCreate(PlayerBase):
    pass


class PlayerOut(PlayerBase):
    id: int
    points_per_game: Optional[float] = None
    assists_per_game: Optional[float] = None
    rebounds_per_game: Optional[float] = None

    class Config:
        from_attributes = True
