from __future__ import annotations

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class PlayerProfile:
    player_id: str
    name: str
    birthdate: date
    division: str


@dataclass(frozen=True)
class TournamentResult:
    event_name: str
    event_date: date
    organizer: str
    source: str
    format_name: str
    event_tier: str
    deck_archetype: str
    placing: int
    total_players: int
    wins: int
    losses: int
    ties: int

    @property
    def matches_played(self) -> int:
        return self.wins + self.losses + self.ties

    @property
    def match_points(self) -> int:
        return (self.wins * 3) + self.ties

    @property
    def win_rate(self) -> float:
        total = self.matches_played
        if total == 0:
            return 0.0
        return (self.wins + 0.5 * self.ties) / total

    @property
    def finish_percentile(self) -> float:
        if self.total_players <= 1:
            return 0.5
        return 1.0 - ((self.placing - 1) / (self.total_players - 1))
