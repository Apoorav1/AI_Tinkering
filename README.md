# Niobium Supply Chain Explorer

An interactive, production-ready map for visualizing the global niobium supply chain from mines to advanced manufacturing. The app renders MapLibre-powered nodes and animated flow lines, with filters, tooltips, and a detail panel for rapid exploration.

> Legacy repo note: AI_Tinkering started as a place for “silly AI ideas,” and this app is now one of those experiments.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Data Updates

The data seed lives in `data/niobium_supply_chain.json` and follows the schema below:

```json
{
  "nodes": [
    {
      "id": "string",
      "name": "string",
      "stage": "mine | smelter | processor | battery_manufacturing",
      "latitude": 0,
      "longitude": 0,
      "country": "string",
      "operator": "string",
      "capacity_tpa": 0,
      "status": "active | planned | inactive",
      "connections": ["id"]
    }
  ]
}
```

To extend the dataset, add nodes and update their `connections` arrays to point to downstream node IDs. The UI and filters are generated dynamically from this file.

## Tokens / Environment Variables

This project uses MapLibre styles that do not require API tokens. If you swap in a Mapbox style, place your token in an environment variable such as `NEXT_PUBLIC_MAPBOX_TOKEN` and update `components/MapView.tsx` accordingly.
