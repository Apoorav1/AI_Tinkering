"use client";

import { stageIcons, stageLabels } from "../lib/data";
import { SupplyChainNode } from "../types";

interface DetailsPanelProps {
  selected: SupplyChainNode | null;
}

export default function DetailsPanel({ selected }: DetailsPanelProps) {
  if (!selected) {
    return (
      <aside className="panel">
        <h2>Node Details</h2>
        <p className="badge">Click a node to inspect metadata.</p>
        <p className="details-value">No node selected.</p>
      </aside>
    );
  }

  return (
    <aside className="panel">
      <h2>Node Details</h2>
      <p className="badge">
        {stageIcons[selected.stage]} {stageLabels[selected.stage]}
      </p>
      <div className="details-grid">
        <div>
          <div className="details-label">Name</div>
          <div className="details-value">{selected.name}</div>
        </div>
        <div>
          <div className="details-label">Country</div>
          <div className="details-value">{selected.country}</div>
        </div>
        <div>
          <div className="details-label">Operator</div>
          <div className="details-value">{selected.operator ?? "—"}</div>
        </div>
        <div>
          <div className="details-label">Status</div>
          <div className="details-value">{selected.status}</div>
        </div>
        <div>
          <div className="details-label">Capacity (tpa)</div>
          <div className="details-value">
            {selected.capacity_tpa ? selected.capacity_tpa.toLocaleString() : "N/A"}
          </div>
        </div>
        <div>
          <div className="details-label">Coordinates</div>
          <div className="details-value">
            {selected.latitude.toFixed(2)}, {selected.longitude.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="details-label">Connections</div>
          <div className="details-value">
            {selected.connections.length ? selected.connections.join(", ") : "None"}
          </div>
        </div>
      </div>
    </aside>
  );
}
