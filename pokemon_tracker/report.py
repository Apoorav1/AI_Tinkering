from __future__ import annotations

from .analytics import PerformanceSummary, deck_breakdown
from .models import PlayerProfile, TournamentResult


def build_report(
    profile: PlayerProfile,
    results: list[TournamentResult],
    summary: PerformanceSummary,
    recommendations: list[str],
) -> list[str]:
    lines: list[str] = []
    lines.append(f"# Pokémon TCG Performance Tracker — {profile.name}")
    lines.append("")
    lines.append("## Player")
    lines.append(f"- Player ID: {profile.player_id}")
    lines.append(f"- Birthdate: {profile.birthdate.isoformat()}")
    lines.append(f"- Division: {profile.division}")
    lines.append("")
    lines.append("## Summary")
    lines.append(f"- Events tracked: {summary.events_played}")
    lines.append(
        f"- Match record: {summary.total_wins}-{summary.total_losses}-{summary.total_ties} ({summary.overall_win_rate:.1%} win rate)"
    )
    lines.append(f"- Average finish percentile: {summary.avg_finish_percentile:.1%}")
    lines.append(f"- Momentum score: {summary.momentum_score:.3f}")
    lines.append(f"- Predicted next-event match win rate: {summary.predicted_next_win_rate:.1%}")
    lines.append("")

    lines.append("## Deck Performance")
    for deck, events, wr in deck_breakdown(results):
        lines.append(f"- {deck}: {events} event(s), {wr:.1%} win rate")
    if not results:
        lines.append("- No results loaded yet.")
    lines.append("")

    lines.append("## Recommendations")
    for item in recommendations:
        lines.append(f"- {item}")
    lines.append("")

    lines.append("## Recent Events")
    for result in sorted(results, key=lambda r: r.event_date, reverse=True)[:12]:
        lines.append(
            f"- {result.event_date.isoformat()} — {result.event_name} ({result.event_tier}), "
            f"{result.deck_archetype}, place {result.placing}/{result.total_players}, "
            f"record {result.wins}-{result.losses}-{result.ties}"
        )
    if not results:
        lines.append("- No events yet.")

    return lines
