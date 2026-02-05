"use client";

import { useEffect, useMemo, useState } from "react";
import DetailsPanel from "../components/DetailsPanel";
import Filters from "../components/Filters";
import MapView from "../components/MapView";
import {
  buildFilterOptions,
  buildFlows,
  defaultFilters,
  filterFlows,
  filterNodes,
  loadSupplyChainData,
  stageColors,
  stageIcons,
  stageLabels
} from "../lib/data";
import { FiltersState, SupplyChainNode } from "../types";

export default function Home() {
  const data = useMemo(() => loadSupplyChainData(), []);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters());
  const [selected, setSelected] = useState<SupplyChainNode | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const options = useMemo(() => buildFilterOptions(data.nodes), [data.nodes]);
  const flows = useMemo(() => buildFlows(data.nodes), [data.nodes]);
  const visibleNodes = useMemo(() => filterNodes(data.nodes, filters), [data.nodes, filters]);
  const visibleFlows = useMemo(() => filterFlows(flows, visibleNodes), [flows, visibleNodes]);
  const flowCount = filters.showFlows ? visibleFlows.length : 0;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (selected && !visibleNodes.find((node) => node.id === selected.id)) {
      setSelected(null);
    }
  }, [visibleNodes, selected]);

  return (
    <div>
      <header>
        <div>
          <h1>Niobium Supply Chain Explorer</h1>
          <span className="badge">
            {visibleNodes.length} nodes / {flowCount} flows visible
          </span>
        </div>
        <button className="primary" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </header>
      <main>
        <Filters options={options} filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters())} />
        <div className="panel map-wrap">
          <MapView
            nodes={visibleNodes}
            flows={visibleFlows}
            onSelectNode={setSelected}
            theme={theme}
            showFlows={filters.showFlows}
          />
          <div className="legend">
            {Object.entries(stageLabels).map(([stage, label]) => (
              <div key={stage} className="legend-item">
                <span className="legend-swatch" style={{ background: stageColors[stage as keyof typeof stageColors] }} />
                <span>
                  {stageIcons[stage as keyof typeof stageIcons]} {label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <DetailsPanel selected={selected} />
      </main>
    </div>
  );
}
