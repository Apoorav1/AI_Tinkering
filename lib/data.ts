import supplyChain from "../data/niobium_supply_chain.json";
import { FiltersState, FlowFeature, Stage, Status, SupplyChainData, SupplyChainNode } from "../types";

const stages: Stage[] = ["mine", "smelter", "processor", "battery_manufacturing"];
const statuses: Status[] = ["active", "planned", "inactive"];

export const stageLabels: Record<Stage, string> = {
  mine: "Mine",
  smelter: "Smelter/Refiner",
  processor: "Processor",
  battery_manufacturing: "Battery & Advanced Manufacturing"
};

export const stageColors: Record<Stage, string> = {
  mine: "#e0a14f",
  smelter: "#d16d72",
  processor: "#5c8dd6",
  battery_manufacturing: "#5bb98c"
};

export const stageIcons: Record<Stage, string> = {
  mine: "⛏️",
  smelter: "🏭",
  processor: "⚙️",
  battery_manufacturing: "🔋"
};

export function loadSupplyChainData(): SupplyChainData {
  const data = supplyChain as SupplyChainData;
  if (!Array.isArray(data.nodes)) {
    throw new Error("Supply chain dataset is missing nodes.");
  }

  data.nodes.forEach((node) => validateNode(node));
  return data;
}

export function buildFlows(nodes: SupplyChainNode[]): FlowFeature[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const flows: FlowFeature[] = [];

  nodes.forEach((node) => {
    node.connections.forEach((connectionId) => {
      const target = nodeMap.get(connectionId);
      if (!target) return;
      flows.push({
        id: `${node.id}-to-${target.id}`,
        from: node,
        to: target,
        volume: node.capacity_tpa ?? 1
      });
    });
  });

  return flows;
}

export function buildFilterOptions(nodes: SupplyChainNode[]) {
  const countries = new Set<string>();
  const operators = new Set<string>();

  nodes.forEach((node) => {
    countries.add(node.country);
    if (node.operator) {
      operators.add(node.operator);
    }
  });

  return {
    stages,
    statuses,
    countries: Array.from(countries).sort(),
    operators: Array.from(operators).sort()
  };
}

export function defaultFilters(): FiltersState {
  return {
    stages: [...stages],
    countries: [],
    operators: [],
    statuses: [...statuses],
    showFlows: true
  };
}

export function filterNodes(nodes: SupplyChainNode[], filters: FiltersState): SupplyChainNode[] {
  return nodes.filter((node) => {
    if (filters.stages.length && !filters.stages.includes(node.stage)) return false;
    if (filters.countries.length && !filters.countries.includes(node.country)) return false;
    if (filters.operators.length && node.operator && !filters.operators.includes(node.operator)) return false;
    if (filters.operators.length && !node.operator) return false;
    if (filters.statuses.length && !filters.statuses.includes(node.status)) return false;
    return true;
  });
}

export function filterFlows(flows: FlowFeature[], visibleNodes: SupplyChainNode[]): FlowFeature[] {
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  return flows.filter((flow) => visibleIds.has(flow.from.id) && visibleIds.has(flow.to.id));
}

function validateNode(node: SupplyChainNode) {
  if (!node.id || !node.name || !node.stage || !node.country) {
    throw new Error(`Invalid node: ${node.id}`);
  }
  if (!Number.isFinite(node.latitude) || !Number.isFinite(node.longitude)) {
    throw new Error(`Invalid coordinates for node ${node.id}`);
  }
}
