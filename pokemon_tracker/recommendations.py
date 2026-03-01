from __future__ import annotations

from .analytics import PerformanceSummary, deck_breakdown
from .models import TournamentResult


def recommend(summary: PerformanceSummary, results: list[TournamentResult]) -> list[str]:
    suggestions: list[str] = []

    if summary.events_played == 0:
        return [
            "Load tournament history (RK9 export CSV) before generating tactical recommendations.",
            "Track deck archetype and round record for each event to unlock matchup-level guidance.",
        ]

    if summary.predicted_next_win_rate >= 0.65:
        suggestions.append(
            "Projected performance is strong. Prioritize consistency testing and matchup reps for expected top decks."
        )
    elif summary.predicted_next_win_rate >= 0.52:
        suggestions.append(
            "Projected performance is solid but volatile. Focus on opening-hand stability and endgame sequencing."
        )
    else:
        suggestions.append(
            "Projection is below target. Consider switching to a comfort archetype and increasing best-of-three practice volume."
        )

    decks = deck_breakdown(results)
    if decks:
        best_deck, events, win_rate = decks[0]
        suggestions.append(
            f"Top historical archetype: {best_deck} ({events} events, {win_rate:.1%} match win rate)."
        )
        if len(decks) > 1 and decks[0][2] - decks[1][2] > 0.08:
            suggestions.append(
                f"Gap vs next deck is meaningful; keep {best_deck} as primary unless meta conditions shift."
            )

    suggestions.append(
        "Before each event, compare projected field shares from Limitless and recent RK9 results to tune 2-4 flex slots."
    )

    return suggestions
