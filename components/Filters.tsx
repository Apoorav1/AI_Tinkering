"use client";

import { FiltersState, Stage, Status } from "../types";
import { stageLabels, stageIcons } from "../lib/data";

interface FilterOptions {
  stages: Stage[];
  statuses: Status[];
  countries: string[];
  operators: string[];
}

interface FiltersProps {
  options: FilterOptions;
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
}

function toggleValue<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function Filters({ options, filters, onChange, onReset }: FiltersProps) {
  const update = (partial: Partial<FiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="panel">
      <div className="toggle-row">
        <div>
          <h2>Filters</h2>
          <p className="badge">Supply chain filters</p>
        </div>
        <button onClick={onReset}>Reset</button>
      </div>

      <div className="filter-group">
        <div className="toggle-row">
          <span>Show flows</span>
          <label>
            <input
              type="checkbox"
              checked={filters.showFlows}
              onChange={(event) => update({ showFlows: event.target.checked })}
            />
          </label>
        </div>
      </div>

      <div className="filter-group">
        <strong>Stages</strong>
        <div className="filter-options">
          {options.stages.map((stage) => (
            <label key={stage}>
              <input
                type="checkbox"
                checked={filters.stages.includes(stage)}
                onChange={() => update({ stages: toggleValue(filters.stages, stage) })}
              />
              <span>
                {stageIcons[stage]} {stageLabels[stage]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <strong>Status</strong>
        <div className="filter-options">
          {options.statuses.map((status) => (
            <label key={status}>
              <input
                type="checkbox"
                checked={filters.statuses.includes(status)}
                onChange={() => update({ statuses: toggleValue(filters.statuses, status) })}
              />
              <span>{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <strong>Countries</strong>
        <div className="filter-options">
          {options.countries.map((country) => (
            <label key={country}>
              <input
                type="checkbox"
                checked={filters.countries.includes(country)}
                onChange={() => update({ countries: toggleValue(filters.countries, country) })}
              />
              <span>{country}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <strong>Operators</strong>
        <div className="filter-options">
          {options.operators.map((operator) => (
            <label key={operator}>
              <input
                type="checkbox"
                checked={filters.operators.includes(operator)}
                onChange={() => update({ operators: toggleValue(filters.operators, operator) })}
              />
              <span>{operator}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
