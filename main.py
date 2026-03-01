from __future__ import annotations

import argparse
from pathlib import Path

from pokemon_tracker.analytics import summarize
from pokemon_tracker.io import load_profile, load_results_csv, save_markdown_report
from pokemon_tracker.recommendations import recommend
from pokemon_tracker.report import build_report
from pokemon_tracker.rk9 import load_rk9_export


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Track Pokémon TCG results and predict upcoming performance."
    )
    parser.add_argument(
        "--profile",
        default="data/player_profile.json",
        help="Path to player profile JSON file.",
    )
    parser.add_argument(
        "--results",
        default="data/results.csv",
        help="Path to tournament history CSV file.",
    )
    parser.add_argument(
        "--output",
        default="output/report.md",
        help="Path to generated markdown report.",
    )
    parser.add_argument(
        "--rk9-export",
        default=None,
        help="Optional path to an RK9 Labs CSV export to load directly.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    profile = load_profile(args.profile)
    results = load_results_csv(args.results)
    if args.rk9_export:
        results = load_rk9_export(args.rk9_export)

    summary = summarize(results)
    suggestions = recommend(summary, results)
    report_lines = build_report(profile, results, summary, suggestions)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    save_markdown_report(output_path, report_lines)
    print(f"Report generated: {output_path}")


if __name__ == "__main__":
    main()
