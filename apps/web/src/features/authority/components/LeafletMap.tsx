"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Point {
  lat: number;
  lng: number;
}

interface LeafletMapProps {
  roadPoints: Point[];
  onAddRoadPoint: (point: Point) => void;
  analysisState: "idle" | "loading" | "complete";
  alternatives?: any[];
  selectedAltId?: string | null;
}

// India bounding box
const INDIA_BOUNDS: [[number, number], [number, number]] = [[6.5, 68.0], [37.5, 97.5]];

// Handles clicks anywhere within India to drop road points
function MapClickEvents({ analysisState, onAddRoadPoint }: any) {
  useMapEvents({
    click(e) {
      if (analysisState !== "idle") return;
      const { lat, lng } = e.latlng;
      // Restrict to India bounds
      if (lat < 6.5 || lat > 37.5 || lng < 68.0 || lng > 97.5) return;
      onAddRoadPoint({ lat, lng });
    }
  });
  return null;
}

export default function LeafletMap({
  roadPoints,
  onAddRoadPoint,
  analysisState,
  alternatives,
  selectedAltId
}: LeafletMapProps) {

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      zoomControl={false}
      maxBounds={INDIA_BOUNDS}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap ECO-ROUTE AI'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapClickEvents analysisState={analysisState} onAddRoadPoint={onAddRoadPoint} />

      {/* Drop a marker on each clicked point */}
      {roadPoints.map((pt, i) => (
        <Marker key={i} position={[pt.lat, pt.lng]} />
      ))}

      {/* Drawn Road line */}
      {roadPoints.length > 1 && (
        <Polyline
          positions={roadPoints.map(p => [p.lat, p.lng])}
          pathOptions={{
            color: selectedAltId ? "#94a3b8" : (analysisState === "complete" ? "#f43f5e" : "#3b82f6"),
            weight: analysisState === "complete" ? 6 : 4,
            opacity: selectedAltId ? 0.4 : 1
          }}
        />
      )}

      {/* Alternative Paths */}
      {analysisState === "complete" && alternatives && alternatives.map((alt: any) => (
        <Polyline
          key={alt.id}
          positions={alt.coordinates || []}
          pathOptions={{
            color: "#10b981",
            weight: selectedAltId === alt.id ? 8 : 4,
            dashArray: selectedAltId === alt.id ? "" : "10, 10",
            opacity: !selectedAltId || selectedAltId === alt.id ? 1 : 0.2
          }}
        />
      ))}

      {/* Impact Buffer UI visual */}
      {analysisState === "complete" && roadPoints.length > 1 && (
        <Polyline
          positions={roadPoints.map(p => [p.lat, p.lng])}
          pathOptions={{
            color: "#f59e0b",
            weight: 25,
            opacity: 0.3
          }}
        />
      )}
    </MapContainer>
  );
}
