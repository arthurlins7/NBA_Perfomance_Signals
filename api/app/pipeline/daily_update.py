"""
Daily pipeline to fetch and update NBA player stats.
Run this script as a scheduled job (e.g., cron or APScheduler).
"""
import logging
from app.db.session import SessionLocal
from app.db.models import Player

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fetch_latest_stats() -> list[dict]:
    """Placeholder: replace with actual data source (e.g., NBA API, web scrape)."""
    return []


def update_player_stats(stats: list[dict]) -> None:
    db = SessionLocal()
    try:
        for stat in stats:
            player = db.query(Player).filter(Player.name == stat["name"]).first()
            if player:
                player.points_per_game = stat.get("points_per_game", player.points_per_game)
                player.assists_per_game = stat.get("assists_per_game", player.assists_per_game)
                player.rebounds_per_game = stat.get("rebounds_per_game", player.rebounds_per_game)
        db.commit()
        logger.info("Player stats updated successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating stats: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Starting daily stats update...")
    stats = fetch_latest_stats()
    update_player_stats(stats)
    logger.info("Daily update complete.")
