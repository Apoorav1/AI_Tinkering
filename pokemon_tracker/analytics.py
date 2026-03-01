from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date

from .models import TournamentResult

# Tier multipliers aligned to public Play! Pokémon event hierarchy
# (League Challenge < League Cup < Regional/SPE < International/Worlds).
TIER_WEIGHTS: dict[str, float] = {
    "League Challenge": 1.0,
    "League Cup": 1.2,
    "Regional": 1.5,
    "Special Event": 1.5,
    "International": 1.8,
    "Worlds": 2.0,
}


@dataclass(frozen=True)
class PerformanceSummary:
    events_played: int
    total_wins: int
    total_losses: int
    total_ties: int
    overall_win_rate: float
    avg_finish_percentile: float
    momentum_score: float
    predicted_next_win_rate: float


def _recency_weight(event_date: date, latest_date: date) -> float:
    age_days = max(0, (latest_date - event_date).days)
    return 1.0 / (1.0 + (age_days / 90.0))


def summarize(results: list[TournamentResult]) -> PerformanceSummary:
    if not results:
        return PerformanceSummary(0, 0, 0, 0, 0.0, 0.0, 0.0, 0.0)

    latest_date = max(r.event_date for r in results)

    total_wins = sum(r.wins for r in results)
    total_losses = sum(r.losses for r in results)
    total_ties = sum(r.ties for r in results)

    total_matches = total_wins + total_losses + total_ties
    overall_win_rate = 0.0
    if total_matches > 0:
        overall_win_rate = (total_wins + 0.5 * total_ties) / total_matches

    avg_finish_percentile = sum(r.finish_percentile for r in results) / len(results)

    weighted_scores: list[float] = []
    weighted_sum = 0.0
    weight_sum = 0.0
    for result in results:
        recency = _recency_weight(result.event_date, latest_date)
        tier_weight = TIER_WEIGHTS.get(result.event_tier, 1.3)
        weight = recency * tier_weight

        event_score = (0.6 * result.win_rate) + (0.4 * result.finish_percentile)
        weighted_scores.append(event_score)
        weighted_sum += event_score * weight
        weight_sum += weight

    momentum_score = weighted_sum / weight_sum if weight_sum else 0.0

    # Lightweight forecast: blend baseline win rate with momentum signal
    predicted_next_win_rate = min(
        0.95,
        max(0.05, (overall_win_rate * 0.65) + (momentum_score * 0.35)),
    )

    return PerformanceSummary(
        events_played=len(results),
        total_wins=total_wins,
        total_losses=total_losses,
        total_ties=total_ties,
        overall_win_rate=overall_win_rate,
        avg_finish_percentile=avg_finish_percentile,
        momentum_score=momentum_score,
        predicted_next_win_rate=predicted_next_win_rate,
    )


def deck_breakdown(results: list[TournamentResult]) -> list[tuple[str, int, float]]:
    grouped: dict[str, list[TournamentResult]] = defaultdict(list)
    for result in results:
        grouped[result.deck_archetype].append(result)

    scores: list[tuple[str, int, float]] = []
    for deck, rows in grouped.items():
        wins = sum(r.wins for r in rows)
        losses = sum(r.losses for r in rows)
        ties = sum(r.ties for r in rows)
        total = wins + losses + ties
        win_rate = 0.0 if total == 0 else (wins + 0.5 * ties) / total
        scores.append((deck, len(rows), win_rate))

    return sorted(scores, key=lambda x: (x[2], x[1]), reverse=True)
