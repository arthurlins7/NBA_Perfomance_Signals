import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Adiciona SSL e pool settings pra conexões remotas
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require", "connect_timeout": 60},
    pool_pre_ping=True,
    pool_recycle=300,
)

print("Lendo CSV...")
df = pd.read_csv("nba_gold_multidimensional_5_years.csv")
df.columns = [c.lower() for c in df.columns]

df['game_date'] = pd.to_datetime(df['game_date'])
df['player_id'] = df['player_id'].astype(str)
df['team_id'] = df['team_id'].astype(str)
df['home_game'] = df['home_game'].astype(bool)

print(f"Total de colunas: {len(df.columns)}")
print(f"Carregando {len(df)} registros no banco...")

# Carrega em chunks menores pra evitar timeout SSL
df.to_sql("nba_gold", engine, if_exists="replace", index=False, chunksize=1000, method="multi")

# Adiciona primary key
with engine.connect() as conn:
    conn.execute(text("ALTER TABLE nba_gold ADD COLUMN id SERIAL PRIMARY KEY;"))
    conn.commit()

print("Carga concluída com sucesso!")