from fastapi import FastAPI
from app.routers import players, teams

app = FastAPI(title="NBA Performance Signals API", version="1.0.0")

app.include_router(players.router, prefix="/players", tags=["players"])
app.include_router(teams.router, prefix="/teams", tags=["teams"])


@app.get("/")
def root():
    return {"message": "NBA Performance Signals API is running"}
