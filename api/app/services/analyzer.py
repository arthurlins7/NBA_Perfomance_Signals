import pandas as pd
import numpy as np


def compute_performance_score(
    points: float,
    assists: float,
    rebounds: float,
    weights: dict | None = None,
) -> float:
    """Compute a composite performance score for a player."""
    if weights is None:
        weights = {"points": 0.5, "assists": 0.3, "rebounds": 0.2}

    score = (
        points * weights["points"]
        + assists * weights["assists"]
        + rebounds * weights["rebounds"]
    )
    return round(score, 2)


def rank_players(df: pd.DataFrame) -> pd.DataFrame:
    """Return a DataFrame ranked by performance score."""
    df = df.copy()
    df["performance_score"] = df.apply(
        lambda row: compute_performance_score(
            row["points_per_game"],
            row["assists_per_game"],
            row["rebounds_per_game"],
        ),
        axis=1,
    )
    return df.sort_values("performance_score", ascending=False).reset_index(drop=True)
