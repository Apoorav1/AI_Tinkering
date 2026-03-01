from __future__ import annotations

import csv
import json
from datetime import date
from pathlib import Path
from typing import Iterable

from .models import PlayerProfile, TournamentResult


def load_profile(path: str | Path) -> PlayerProfile:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    return PlayerProfile(
        player_id=str(payload["player_id"]),
        name=payload["name"],
        birthdate=date.fromisoformat(payload["birthdate"]),
        division=payload["division"],
    )


def load_results_csv(path: str | Path) -> list[TournamentResult]:
    rows: list[TournamentResult] = []
    with Path(path).open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if not row.get("event_name"):
                continue
            rows.append(
                TournamentResult(
                    event_name=row["event_name"],
                    event_date=date.fromisoformat(row["event_date"]),
                    organizer=row.get("organizer", ""),
                    source=row.get("source", ""),
                    format_name=row.get("format_name", "Standard"),
                    event_tier=row.get("event_tier", "Regional"),
                    deck_archetype=row.get("deck_archetype", "Unknown"),
                    placing=int(row.get("placing", 0)),
                    total_players=int(row.get("total_players", 0)),
                    wins=int(row.get("wins", 0)),
                    losses=int(row.get("losses", 0)),
                    ties=int(row.get("ties", 0)),
                )
            )
    return sorted(rows, key=lambda r: r.event_date)


def save_markdown_report(path: str | Path, lines: Iterable[str]) -> None:
    Path(path).write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
