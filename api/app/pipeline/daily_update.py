import os
import time
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from nba_api.stats.endpoints import playergamelogs

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

METRICAS = ['PTS', 'MIN', 'REB', 'AST', 'STL', 'BLK', 'TOV', 'FG_PCT', 'PLUS_MINUS']
WINDOW = 5

def get_yesterday():
    return (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

def get_current_season() -> str:
    import datetime
    year = datetime.datetime.now().year
    month = datetime.datetime.now().month
    if month >= 10:
        return f"{year}-{str(year + 1)[-2:]}"
    else:
        return f"{year - 1}-{str(year)[-2:]}"

def fetch_yesterday_games(date_str: str) -> pd.DataFrame:
    season = get_current_season()
    print(f"Buscando jogos de {date_str}...")
    try:
        from nba_api.stats.endpoints import playergamelogs
        import time

        headers = {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Referer': 'https://www.nba.com/',
            'Connection': 'keep-alive',
        }

        logs = playergamelogs.PlayerGameLogs(
            season_nullable=season,
            date_from_nullable=date_str,
            date_to_nullable=date_str,
            headers=headers,
            timeout=60,
        )

        df = logs.get_data_frames()[0]
        if df.empty:
            print(f"Nenhum jogo em {date_str}")
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
        print(f"{len(df)} registros encontrados.")
        return df

    except Exception as e:
        print(f"Erro ao buscar jogos de {date_str}: {e}")
        return pd.DataFrame()

def calculate_zscores(df_new: pd.DataFrame) -> pd.DataFrame:
    print("Calculando Z-Scores...")
    with engine.connect() as conn:
        results = []
        for _, row in df_new.iterrows():
            player_id = str(row['PLAYER_ID'])
            query = text("""
                SELECT pts, min, reb, ast, stl, blk, tov, fg_pct, plus_minus
                FROM nba_gold
                WHERE player_id = :pid
                ORDER BY game_date DESC
                LIMIT :lim
            """)
            history = pd.read_sql(query, conn, params={"pid": player_id, "lim": WINDOW - 1})

            new_row = pd.DataFrame([{
                'pts': row.get('PTS', 0),
                'min': row.get('MIN', 0),
                'reb': row.get('REB', 0),
                'ast': row.get('AST', 0),
                'stl': row.get('STL', 0),
                'blk': row.get('BLK', 0),
                'tov': row.get('TOV', 0),
                'fg_pct': row.get('FG_PCT', 0),
                'plus_minus': row.get('PLUS_MINUS', 0),
            }])

            window = pd.concat([history, new_row], ignore_index=True)

            zscores = {}
            for col in ['pts', 'min', 'reb', 'ast', 'stl', 'blk', 'tov', 'fg_pct', 'plus_minus']:
                mean = window[col].mean()
                std = window[col].std() + 1e-5
                zscores[f'{col.upper()}_ZSCORE'] = round((new_row[col].values[0] - mean) / std, 2)

            positivos = ['PTS_ZSCORE', 'REB_ZSCORE', 'AST_ZSCORE', 'STL_ZSCORE', 'BLK_ZSCORE', 'FG_PCT_ZSCORE', 'PLUS_MINUS_ZSCORE']
            negativos = ['TOV_ZSCORE']
            global_z = sum(zscores.get(z, 0) for z in positivos) - sum(zscores.get(z, 0) for z in negativos)
            zscores['GLOBAL_ZSCORE'] = round(global_z, 2)

            results.append({**row.to_dict(), **zscores})

    return pd.DataFrame(results)

def load_to_db(df: pd.DataFrame):
    print("Inserindo no banco...")
    rename_map = {
        'SEASON': 'season', 'PLAYER_ID': 'player_id', 'PLAYER_NAME': 'player_name',
        'TEAM_ABBREVIATION': 'team_abbreviation', 'TEAM_NAME': 'team_name',
        'GAME_ID': 'game_id', 'GAME_DATE': 'game_date', 'WL': 'wl',
        'MIN': 'min', 'PTS': 'pts', 'REB': 'reb', 'AST': 'ast',
        'STL': 'stl', 'BLK': 'blk', 'TOV': 'tov', 'FG_PCT': 'fg_pct',
        'PLUS_MINUS': 'plus_minus', 'HOME_GAME': 'home_game', 'AGAINST': 'against',
        'PTS_ZSCORE': 'pts_zscore', 'REB_ZSCORE': 'reb_zscore',
        'AST_ZSCORE': 'ast_zscore', 'STL_ZSCORE': 'stl_zscore',
        'BLK_ZSCORE': 'blk_zscore', 'TOV_ZSCORE': 'tov_zscore',
        'FG_PCT_ZSCORE': 'fg_pct_zscore', 'PLUS_MINUS_ZSCORE': 'plus_minus_zscore',
        'GLOBAL_ZSCORE': 'global_zscore',
    }
    colunas = list(rename_map.values())
    df = df.rename(columns=rename_map)
    df = df[[c for c in colunas if c in df.columns]]
    df['game_date'] = pd.to_datetime(df['game_date'])
    df['home_game'] = df['home_game'].astype(bool)

    with engine.connect() as conn:
        for _, row in df.iterrows():
            exists = conn.execute(
                text("SELECT 1 FROM nba_gold WHERE game_id = :gid"),
                {"gid": str(row['game_id'])}
            ).fetchone()
            if not exists:
                row_dict = row.where(pd.notnull(row), None).to_dict()
                cols = ', '.join(row_dict.keys())
                vals = ', '.join([f':{k}' for k in row_dict.keys()])
                conn.execute(text(f"INSERT INTO nba_gold ({cols}) VALUES ({vals})"), row_dict)
        conn.commit()
    print(f"{len(df)} registros inseridos com sucesso.")

def run():
    date_str = get_yesterday()

    MAX_RETRIES = 3
    RETRY_DELAY = 30  # segundos entre tentativas

    for attempt in range(1, MAX_RETRIES + 1):
        print(f"Tentativa {attempt}/{MAX_RETRIES} — buscando jogos de {date_str}...")
        df_new = fetch_yesterday_games(date_str)

        if not df_new.empty:
            df_gold = calculate_zscores(df_new)
            load_to_db(df_gold)
            print("Pipeline diário concluído com sucesso.")
            return

        if attempt < MAX_RETRIES:
            print(f"Sem dados. Aguardando {RETRY_DELAY}s antes de tentar novamente...")
            time.sleep(RETRY_DELAY)

    print(f"Pipeline encerrado após {MAX_RETRIES} tentativas sem dados.")

if __name__ == "__main__":
    run()
