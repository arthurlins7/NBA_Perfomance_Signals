import os
import time
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from nba_api.stats.endpoints import playergamelogs
from app.pipeline.daily_update import calculate_zscores, load_to_db, get_current_season

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require", "connect_timeout": 60},
    pool_pre_ping=True,
)

def get_missing_dates():
    """Retorna lista de datas que não estão no banco desde o último registro."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT MAX(game_date) FROM nba_gold")).fetchone()
        last_date = result[0].date() if hasattr(result[0], 'date') else result[0]

    if not last_date:
        return []

    start = last_date + timedelta(days=1)
    end = datetime.now().date() - timedelta(days=1)

    dates = []
    current = start
    while current <= end:
        dates.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)

    return dates

def fetch_games_for_date(date_str: str) -> pd.DataFrame:
    season = get_current_season()
    print(f"Buscando jogos de {date_str}...")
    try:
        logs = playergamelogs.PlayerGameLogs(
            season_nullable=season,
            date_from_nullable=date_str,
            date_to_nullable=date_str,
        )
        df = logs.get_data_frames()[0]
        if df.empty:
            print(f"  Nenhum jogo em {date_str}")
            return df

        colunas_rank = [col for col in df.columns if col.endswith('_RANK')]
        df = df.drop(columns=colunas_rank)
        df = df[df['MIN'] > 0]
        df['GAME_DATE'] = pd.to_datetime(df['GAME_DATE'])
        df['HOME_GAME'] = df['MATCHUP'].str.contains('vs.').astype(int)
        df['AGAINST'] = df['MATCHUP'].str.split(' ').str[-1]
        df = df.drop(columns=['MATCHUP'])
        df['PLAYER_ID'] = df['PLAYER_ID'].astype(str)
        df['SEASON'] = season
        print(f"  {len(df)} registros encontrados.")
        return df
    except Exception as e:
        print(f"  Erro ao buscar {date_str}: {e}")
        return pd.DataFrame()

def run():
    dates = get_missing_dates()
    if not dates:
        print("Nenhuma data faltando. Banco está atualizado.")
        return

    print(f"{len(dates)} datas para processar: {dates[0]} → {dates[-1]}")

    for date_str in dates:
        df = fetch_games_for_date(date_str)
        if df.empty:
            time.sleep(1)
            continue

        df_with_zscores = calculate_zscores(df)
        load_to_db(df_with_zscores)
        time.sleep(2)  # respeita rate limit da NBA API

    print("Backfill concluído.")

if __name__ == "__main__":
    run()
