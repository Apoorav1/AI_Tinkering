from __future__ import annotations

import csv
import re
from datetime import date
from pathlib import Path

from .models import TournamentResult


def _norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.strip().lower())


def _build_header_map(headers: list[str]) -> dict[str, str]:
    return {_norm(h): h for h in headers}


def _pick(row: dict[str, str], header_map: dict[str, str], *aliases: str, default: str = "") -> str:
    for alias in aliases:
        key = header_map.get(_norm(alias))
        if key and key in row and row[key] is not None:
            value = str(row[key]).strip()
            if value:
                return value
    return default


def _parse_record(value: str) -> tuple[int, int, int]:
    raw = value.strip()
    if not raw:
        return 0, 0, 0
    parts = [p for p in re.split(r"[^0-9]+", raw) if p]
    nums = [int(p) for p in parts]
    if len(nums) >= 3:
        return nums[0], nums[1], nums[2]
    if len(nums) == 2:
        return nums[0], nums[1], 0
    if len(nums) == 1:
        return nums[0], 0, 0
    return 0, 0, 0


def _tier_from_event_name(event_name: str) -> str:
    name = event_name.lower()
    if "world" in name:
        return "Worlds"
    if "internation" in name:
        return "International"
    if "special event" in name:
        return "Special Event"
    if "regional" in name:
        return "Regional"
    if "league cup" in name or name.endswith(" cup"):
        return "League Cup"
    if "league challenge" in name or name.endswith(" challenge"):
        return "League Challenge"
    return "Regional"


def load_rk9_export(path: str | Path, *, source_label: str = "RK9 Labs Export") -> list[TournamentResult]:
    records: list[TournamentResult] = []
    with Path(path).open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = reader.fieldnames or []
        header_map = _build_header_map(headers)

        for row in reader:
            event_name = _pick(row, header_map, "event", "event_name", "tournament", "name")
            if not event_name:
                continue

            event_date_raw = _pick(row, header_map, "event_date", "date", "start_date")
            if not event_date_raw:
                continue

            try:
                event_date = date.fromisoformat(event_date_raw[:10])
            except ValueError:
                continue

            placing = int(_pick(row, header_map, "placing", "placement", "rank", default="0") or 0)
            total_players = int(_pick(row, header_map, "total_players", "players", "attendance", default="0") or 0)

            wins = int(_pick(row, header_map, "wins", default="0") or 0)
            losses = int(_pick(row, header_map, "losses", default="0") or 0)
            ties = int(_pick(row, header_map, "ties", "draws", default="0") or 0)

            if (wins, losses, ties) == (0, 0, 0):
                record_value = _pick(row, header_map, "record", "match_record")
                wins, losses, ties = _parse_record(record_value)

            deck = _pick(row, header_map, "deck", "deck_archetype", "archetype", default="Unknown")
            organizer = _pick(row, header_map, "organizer", "host", default="Play! Pokémon")
            tier = _pick(row, header_map, "event_tier", "tier", default=_tier_from_event_name(event_name))
            fmt = _pick(row, header_map, "format", "format_name", default="Standard")

            records.append(
                TournamentResult(
                    event_name=event_name,
                    event_date=event_date,
                    organizer=organizer,
                    source=source_label,
                    format_name=fmt,
                    event_tier=tier,
                    deck_archetype=deck,
                    placing=placing,
                    total_players=total_players,
                    wins=wins,
                    losses=losses,
                    ties=ties,
                )
            )

    return sorted(records, key=lambda x: x.event_date)
