from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    city = Column(String)
    conference = Column(String)

    players = relationship("Player", back_populates="team_rel")


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    position = Column(String)
    team = Column(String)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    points_per_game = Column(Float, default=0.0)
    assists_per_game = Column(Float, default=0.0)
    rebounds_per_game = Column(Float, default=0.0)

    team_rel = relationship("Team", back_populates="players")
