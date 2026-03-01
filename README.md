# AI_Tinkering — Pokémon TCG Performance Tracker

This project includes a lightweight Python tracker for Pokémon TCG tournament performance.
It supports:
- Historical tracking
- Upcoming-event win-rate projection
- Deck/archetype recommendation prompts

## Player configured
- Player ID: `4471339`
- Name: `Gautam Trehan`
- Birthdate: `2011-09-30`
- Division: `Senior`

## RK9 Labs data loading
I attempted direct automated access to RK9 (`https://rk9.gg`) from this environment, but the network path is blocked with HTTP 403 at the proxy layer.

Because of that, the app now supports **importing RK9 player history through RK9 CSV exports**.

### 1) Export from RK9
From RK9 Labs / RK9.gg, export the player's event history to CSV (from player profile/history pages where available).

### 2) Run with RK9 export
```bash
python main.py \
  --profile data/player_profile.json \
  --rk9-export path/to/rk9_export.csv \
  --output output/report.md
```

If `--rk9-export` is provided, it is used as the source of tournament history.

## Generic CSV input format (existing mode)
You can still run with the project CSV schema (`data/results.csv`):

```bash
python main.py --profile data/player_profile.json --results data/results.csv --output output/report.md
```

`data/results.csv` columns:
- `event_name`
- `event_date` (`YYYY-MM-DD`)
- `organizer`
- `source`
- `format_name`
- `event_tier` (`League Challenge`, `League Cup`, `Regional`, `Special Event`, `International`, `Worlds`)
- `deck_archetype`
- `placing`
- `total_players`
- `wins`
- `losses`
- `ties`

## Model behavior
The tracker computes:
- Overall match record and win rate
- Average finish percentile
- Recency + event-tier weighted momentum score
- Predicted next-event match win rate (blended baseline + momentum)
- Deck breakdown and practical recommendations

This is intentionally transparent and editable (no hidden ML model).
