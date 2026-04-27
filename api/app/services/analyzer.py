from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.models import PlayerGameLog

ALERT_THRESHOLD = -2.0
MIN_AVG_THRESHOLD = 15.0

def get_eligible_player_ids(db: Session):
    """Retorna IDs de jogadores com média de minutos >= 15 na temporada atual."""
    result = db.execute(text("""
        SELECT player_id
        FROM nba_gold
        WHERE season = (SELECT MAX(season) FROM nba_gold)
        GROUP BY player_id
        HAVING AVG(min) >= :min_avg
    """), {"min_avg": MIN_AVG_THRESHOLD}).fetchall()
    return {str(row[0]) for row in result}

def get_players(db: Session):
    eligible = get_eligible_player_ids(db)
    rows = db.query(
        PlayerGameLog.player_id,
        PlayerGameLog.player_name,
        PlayerGameLog.team_abbreviation,
    ).distinct().order_by(PlayerGameLog.player_name).all()
    return [
        {"player_id": r.player_id, "player_name": r.player_name, "team_abbreviation": r.team_abbreviation}
        for r in rows if str(r.player_id) in eligible
    ]

def get_player_history(db: Session, player_id: str, limit: int = 20):
    return db.query(PlayerGameLog)\
        .filter(PlayerGameLog.player_id == player_id)\
        .order_by(PlayerGameLog.game_date.desc())\
        .limit(limit)\
        .all()

def get_player_alerts(db: Session, player_id: str):
    rows = db.query(PlayerGameLog)\
        .filter(
            PlayerGameLog.player_id == player_id,
            PlayerGameLog.global_zscore <= ALERT_THRESHOLD
        )\
        .order_by(PlayerGameLog.game_date.desc())\
        .all()
    return [_to_alert(r, "queda_global") for r in rows]

def get_team_alerts(db: Session, team_abbr: str, limit: int = 20):
    eligible = get_eligible_player_ids(db)
    rows = db.query(PlayerGameLog)\
        .filter(
            PlayerGameLog.team_abbreviation == team_abbr,
            PlayerGameLog.global_zscore <= ALERT_THRESHOLD
        )\
        .order_by(PlayerGameLog.game_date.desc())\
        .limit(limit)\
        .all()
    return [_to_alert(r, "queda_global") for r in rows if str(r.player_id) in eligible]

def get_global_alerts(db: Session, limit: int = 50):
    eligible = get_eligible_player_ids(db)
    rows = db.query(PlayerGameLog)\
        .filter(PlayerGameLog.global_zscore <= ALERT_THRESHOLD)\
        .order_by(PlayerGameLog.game_date.desc())\
        .limit(limit * 2)\
        .all()  # team_id included via PlayerGameLog model
    alerts = [_to_alert(r, "queda_global") for r in rows if str(r.player_id) in eligible]
    return alerts[:limit]

def get_isolated_alerts(db: Session, limit: int = 50):
    """Jogadores com queda forte em uma métrica específica."""
    eligible = get_eligible_player_ids(db)
    ISOLATED_THRESHOLD = -2.0
    metricas = {
        "pts_zscore": "queda_pontos",
        "reb_zscore": "queda_rebotes",
        "ast_zscore": "queda_assistencias",
    }
    alerts = []
    for col, alert_type in metricas.items():
        rows = db.execute(text(f"""
            SELECT
                g.player_id, g.player_name, g.team_id, g.team_abbreviation, g.game_date,
                g.pts, g.reb, g.ast, g.global_zscore, g.{col},
                g.pts_zscore, g.reb_zscore, g.ast_zscore, g.min_zscore,
                AVG(h.pts) as avg_pts,
                AVG(h.reb) as avg_reb,
                AVG(h.ast) as avg_ast,
                AVG(h.min) as avg_min
            FROM nba_gold g
            JOIN (
                SELECT player_id, pts, reb, ast, min, season
                FROM nba_gold
            ) h ON g.player_id = h.player_id AND h.season = (SELECT MAX(season) FROM nba_gold)
            WHERE g.{col} <= :threshold
            AND g.global_zscore > :global_threshold
            GROUP BY g.player_id, g.player_name, g.team_id, g.team_abbreviation, g.game_date,
                     g.pts, g.reb, g.ast, g.global_zscore, g.{col},
                     g.pts_zscore, g.reb_zscore, g.ast_zscore, g.min_zscore
            ORDER BY g.game_date DESC
            LIMIT :lim
        """), {
            "threshold": ISOLATED_THRESHOLD,
            "global_threshold": -1.0,
            "lim": limit
        }).fetchall()
        for r in rows:
            if str(r.player_id) in eligible:
                alerts.append({
                    "player_id": str(r.player_id),
                    "player_name": r.player_name,
                    "team_id": str(r.team_id) if r.team_id is not None else None,
                    "team_abbreviation": r.team_abbreviation,
                    "game_date": r.game_date,
                    "pts": r.pts,
                    "reb": r.reb,
                    "ast": r.ast,
                    "global_zscore": r.global_zscore,
                    "alert_type": alert_type,
                    "pts_zscore": r.pts_zscore,
                    "reb_zscore": r.reb_zscore,
                    "ast_zscore": r.ast_zscore,
                    "min_zscore": r.min_zscore,
                    "avg_pts": round(r.avg_pts, 1) if r.avg_pts else None,
                    "avg_reb": round(r.avg_reb, 1) if r.avg_reb else None,
                    "avg_ast": round(r.avg_ast, 1) if r.avg_ast else None,
                    "avg_min": round(r.avg_min, 1) if r.avg_min else None,
                })
    alerts.sort(key=lambda x: x["game_date"], reverse=True)
    return alerts[:limit]

def _to_alert(r, alert_type: str):
    return {
        "player_id": str(r.player_id),
        "player_name": r.player_name,
        "team_id": str(r.team_id) if hasattr(r, 'team_id') and r.team_id is not None else None,
        "team_abbreviation": r.team_abbreviation,
        "game_date": r.game_date,
        "pts": r.pts,
        "reb": r.reb,
        "ast": r.ast,
        "global_zscore": r.global_zscore,
        "alert_type": alert_type,
    }
