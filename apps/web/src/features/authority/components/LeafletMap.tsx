"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Point {
  lat: number;
  lng: number;
}

interface LeafletMapProps {
  selectedRegion: string | null;
  onSelectRegion: (region: string) => void;
  roadPoints: Point[];
  onAddRoadPoint: (point: Point) => void;
  analysisState: "idle" | "loading" | "complete";
  alternatives?: any[];
  selectedAltId?: string | null;
}

const NORTHERN_RESERVE: [number, number][] = [
  [28.8, 77.0], [28.9, 77.6], [28.4, 77.8], [28.3, 77.2]
];

const SOUTHERN_CORRIDOR: [number, number][] = [
  [12.9, 77.5], [13.2, 78.1], [12.6, 78.3], [12.4, 77.8]
];

// Handles clicks on the open map to drop road points
function MapClickEvents({ analysisState, selectedRegion, onAddRoadPoint }: any) {
  useMapEvents({
    click(e) {
      if (!selectedRegion || analysisState !== "idle") return;
      onAddRoadPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

// Automatically pans the map to the selected zone
function MapCenterer({ selectedRegion }: { selectedRegion: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedRegion === "Northern Elephant Reserve") {
      map.flyTo([28.6, 77.4], 9);
    } else if (selectedRegion === "Southern Tiger Corridor") {
      map.flyTo([12.8, 77.9], 9);
    } else {
      map.flyTo([20.5937, 78.9629], 5);
    }
  }, [selectedRegion, map]);
  return null;
}

export default function LeafletMap({
  selectedRegion,
  onSelectRegion,
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
    >
      <TileLayer
        attribution='&copy; OpenStreetMap ECO-ROUTE AI'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      <MapCenterer selectedRegion={selectedRegion} />

      <MapClickEvents 
        analysisState={analysisState} 
        selectedRegion={selectedRegion} 
        onAddRoadPoint={onAddRoadPoint} 
      />

      {/* Polygon Zones */}
      <Polygon 
        positions={NORTHERN_RESERVE}
        pathOptions={{ 
          fillColor: selectedRegion === "Northern Elephant Reserve" ? "#10b981" : "transparent",
          color: selectedRegion === "Northern Elephant Reserve" ? "#059669" : "#64748b",
          dashArray: selectedRegion === "Northern Elephant Reserve" ? "" : "5, 10",
          weight: 3,
          fillOpacity: selectedRegion === "Northern Elephant Reserve" ? 0.2 : 0
        }}
        eventHandlers={{ 
          click: (e) => {
            if (selectedRegion === "Northern Elephant Reserve" && analysisState === "idle") {
              onAddRoadPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
            } else {
              onSelectRegion("Northern Elephant Reserve");
            }
          } 
        }}
      />

      <Polygon 
        positions={SOUTHERN_CORRIDOR}
        pathOptions={{ 
          fillColor: selectedRegion === "Southern Tiger Corridor" ? "#10b981" : "transparent",
          color: selectedRegion === "Southern Tiger Corridor" ? "#059669" : "#64748b",
          dashArray: selectedRegion === "Southern Tiger Corridor" ? "" : "5, 10",
          weight: 3,
          fillOpacity: selectedRegion === "Southern Tiger Corridor" ? 0.2 : 0
        }}
        eventHandlers={{ 
          click: (e) => {
            if (selectedRegion === "Southern Tiger Corridor" && analysisState === "idle") {
              onAddRoadPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
            } else {
              onSelectRegion("Southern Tiger Corridor");
            }
          } 
        }}
      />

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
          positions={alt.coordinates}
          pathOptions={{
            color: selectedAltId === alt.id ? "#10b981" : "#10b981",
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
