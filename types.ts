export type Stage = "mine" | "smelter" | "processor" | "battery_manufacturing";
export type Status = "active" | "planned" | "inactive";

export interface SupplyChainNode {
  id: string;
  name: string;
  stage: Stage;
  latitude: number;
  longitude: number;
  country: string;
  operator?: string;
  capacity_tpa: number | null;
  status: Status;
  connections: string[];
}

export interface SupplyChainData {
  nodes: SupplyChainNode[];
}

export interface FiltersState {
  stages: Stage[];
  countries: string[];
  operators: string[];
  statuses: Status[];
  showFlows: boolean;
}

export interface FlowFeature {
  id: string;
  from: SupplyChainNode;
  to: SupplyChainNode;
  volume: number;
}
