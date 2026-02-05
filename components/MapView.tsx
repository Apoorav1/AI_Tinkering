"use client";

import maplibregl, { GeoJSONSource, Map as MapLibreMap, Popup } from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import { stageColors } from "../lib/data";
import { FlowFeature, Stage, SupplyChainNode } from "../types";

type FeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: string; coordinates: number[] | number[][] };
    properties: Record<string, string | number | null>;
  }>;
};

interface MapViewProps {
  nodes: SupplyChainNode[];
  flows: FlowFeature[];
  onSelectNode: (node: SupplyChainNode | null) => void;
  theme: "light" | "dark";
  showFlows: boolean;
}

const lightStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const darkStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const stageIconSvg: Record<Stage, string> = {
  mine: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='white' d='M3 19h18l-9-14z'/></svg>",
  smelter: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect x='4' y='8' width='16' height='12' fill='white'/><rect x='7' y='4' width='3' height='4' fill='white'/><rect x='14' y='2' width='3' height='6' fill='white'/></svg>",
  processor: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='6' fill='white'/><circle cx='12' cy='12' r='3' fill='black'/></svg>",
  battery_manufacturing: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect x='5' y='7' width='14' height='10' rx='1.5' fill='white'/><rect x='9' y='5' width='6' height='2' fill='white'/></svg>"
};
const flowArrowSvg = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'><path fill='white' d='M4 12l10-8v5h6v6h-6v5z'/></svg>";

export default function MapView({ nodes, flows, onSelectNode, theme, showFlows }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const styleRef = useRef<string | null>(null);
  const nodesRef = useRef<SupplyChainNode[]>(nodes);

  const nodeGeojson = useMemo(
    (): FeatureCollection => ({
      type: "FeatureCollection",
      features: nodes.map((node) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [node.longitude, node.latitude]
        },
        properties: {
          id: node.id,
          name: node.name,
          stage: node.stage,
          country: node.country,
          operator: node.operator ?? "",
          status: node.status,
          capacity_tpa: node.capacity_tpa ?? null
        }
      }))
    }),
    [nodes]
  );

  const flowGeojson = useMemo(
    (): FeatureCollection => ({
      type: "FeatureCollection",
      features: flows.map((flow) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [flow.from.longitude, flow.from.latitude],
            [flow.to.longitude, flow.to.latitude]
          ]
        },
        properties: {
          id: flow.id,
          volume: flow.volume
        }
      }))
    }),
    [flows]
  );

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: theme === "dark" ? darkStyle : lightStyle,
      center: [0, 20],
      zoom: 1.4
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    styleRef.current = theme === "dark" ? darkStyle : lightStyle;

    map.on("load", () => {
      addSourcesAndLayers(map, nodeGeojson, flowGeojson);
      attachInteractions(map, onSelectNode, popupRef, nodesRef);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [nodeGeojson, flowGeojson, onSelectNode, theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const styleUrl = theme === "dark" ? darkStyle : lightStyle;
    if (styleRef.current === styleUrl) return;

    map.setStyle(styleUrl);
    styleRef.current = styleUrl;
    map.once("style.load", () => {
      addSourcesAndLayers(map, nodeGeojson, flowGeojson);
      attachInteractions(map, onSelectNode, popupRef, nodesRef);
    });
  }, [theme, nodeGeojson, flowGeojson, onSelectNode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const nodesSource = map.getSource("nodes") as GeoJSONSource | undefined;
    if (nodesSource) {
      nodesSource.setData(nodeGeojson as unknown as maplibregl.GeoJSONSourceRaw["data"]);
    }
    const flowsSource = map.getSource("flows") as GeoJSONSource | undefined;
    if (flowsSource) {
      flowsSource.setData(flowGeojson as unknown as maplibregl.GeoJSONSourceRaw["data"]);
    }
  }, [nodeGeojson, flowGeojson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer("flow-lines")) {
      map.setLayoutProperty("flow-lines", "visibility", showFlows ? "visible" : "none");
    }
    if (map.getLayer("flow-arrows")) {
      map.setLayoutProperty("flow-arrows", "visibility", showFlows ? "visible" : "none");
    }
  }, [showFlows]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let frame = 0;
    let animationFrame: number;

    const animate = () => {
      frame = (frame + 1) % 20;
      const dash = [2, 2, frame / 10, 2];
      if (map.getLayer("flow-lines")) {
        map.setPaintProperty("flow-lines", "line-dasharray", dash);
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      frame = 0;
      cancelAnimationFrame(animationFrame);
    };
  }, [flows]);

  return <div className="map-container" ref={mapContainerRef} />;
}

function addSourcesAndLayers(
  map: MapLibreMap,
  nodeGeojson: FeatureCollection,
  flowGeojson: FeatureCollection
) {
  if (!map.getSource("nodes")) {
    map.addSource("nodes", {
      type: "geojson",
      data: nodeGeojson
    });
  }

  if (!map.getSource("flows")) {
    map.addSource("flows", {
      type: "geojson",
      data: flowGeojson
    });
  }

  addStageIcons(map);

  if (!map.getLayer("flow-lines")) {
    map.addLayer({
      id: "flow-lines",
      type: "line",
      source: "flows",
      paint: {
        "line-color": "#8895a7",
        "line-width": [
          "interpolate",
          ["linear"],
          ["get", "volume"],
          1,
          1.5,
          90000,
          4
        ],
        "line-opacity": 0.7,
        "line-dasharray": [2, 2]
      }
    });
  }

  if (!map.getLayer("flow-arrows")) {
    map.addLayer({
      id: "flow-arrows",
      type: "symbol",
      source: "flows",
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 120,
        "icon-image": "flow-arrow",
        "icon-size": 0.5,
        "icon-allow-overlap": true,
        "icon-rotation-alignment": "map",
        "icon-pitch-alignment": "map"
      },
      paint: {
        "icon-opacity": 0.8
      }
    });
  }

  if (!map.getLayer("nodes-circle")) {
    map.addLayer({
      id: "nodes-circle",
      type: "circle",
      source: "nodes",
      paint: {
        "circle-radius": 9,
        "circle-color": ["match", ["get", "stage"],
          "mine",
          stageColors.mine,
          "smelter",
          stageColors.smelter,
          "processor",
          stageColors.processor,
          "battery_manufacturing",
          stageColors.battery_manufacturing,
          "#cccccc"
        ],
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff"
      }
    });
  }

  if (!map.getLayer("nodes-icons")) {
    map.addLayer({
      id: "nodes-icons",
      type: "symbol",
      source: "nodes",
      layout: {
        "icon-image": ["get", "stage"],
        "icon-size": 0.5,
        "icon-allow-overlap": true
      }
    });
  }
}

function addStageIcons(map: MapLibreMap) {
  Object.entries(stageIconSvg).forEach(([stage, svg]) => {
    if (map.hasImage(stage)) return;
    const img = new Image(24, 24);
    img.onload = () => {
      if (map.hasImage(stage)) return;
      map.addImage(stage, img, { sdf: false });
    };
    const svgColor = stageColors[stage as Stage];
    const data = svg.replace(/white/g, svgColor).replace(/black/g, "#ffffff");
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
  });

  if (!map.hasImage("flow-arrow")) {
    const img = new Image(16, 16);
    img.onload = () => {
      if (map.hasImage("flow-arrow")) return;
      map.addImage("flow-arrow", img, { sdf: false });
    };
    const data = flowArrowSvg.replace(/white/g, "#f0f3f7");
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
  }
}

function attachInteractions(
  map: MapLibreMap,
  onSelectNode: (node: SupplyChainNode | null) => void,
  popupRef: React.MutableRefObject<Popup | null>,
  nodesRef: React.MutableRefObject<SupplyChainNode[]>
) {
  if (popupRef.current) {
    popupRef.current.remove();
  }
  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
  popupRef.current = popup;

  map.off("mousemove", "nodes-circle");
  map.off("mouseleave", "nodes-circle");
  map.off("click", "nodes-circle");

  map.on("mousemove", "nodes-circle", (event) => {
    if (!event.features?.length) return;
    const feature = event.features[0];
    const coordinates = (feature.geometry as { coordinates: number[] }).coordinates.slice() as [number, number];
    const { name, stage, country, status } = feature.properties as Record<string, string>;

    popup
      .setLngLat(coordinates)
      .setHTML(
        `<div class='tooltip'><strong>${name}</strong><br/>${stage} • ${country} • ${status}</div>`
      )
      .addTo(map);
  });

  map.on("mouseleave", "nodes-circle", () => {
    popup.remove();
  });

  map.on("click", "nodes-circle", (event) => {
    if (!event.features?.length) return;
    const feature = event.features[0];
    const props = feature.properties as Record<string, string>;
    const node = nodesRef.current.find((item) => item.id === props.id);

    onSelectNode(node ?? null);
  });
}
