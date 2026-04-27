from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import players, teams
from app.db.session import engine
from app.db import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NBA Performance Signals API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(teams.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "NBA Performance Signals API"}
