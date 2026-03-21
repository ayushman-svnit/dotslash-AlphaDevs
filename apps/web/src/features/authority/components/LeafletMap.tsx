"use client";

import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents, useMap, Tooltip as LeafletTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Point { lat: number; lng: number; }

interface LeafletMapProps {
  mode: "PLANNING" | "ECO_ROUTE";
  roadPoints: Point[];
  onAddRoadPoint: (p: Point) => void;
  analysisState: "idle" | "loading" | "complete";
  alternatives?: any[];
  ecoRoute?: any;
  ecoPositions?: [number, number][];
  selectedAltId?: string | null;
}

const INDIA_BOUNDS: [[number, number], [number, number]] = [[6.5, 68.0], [37.5, 97.5]];

function MapClickEvents({ analysisState, onAddRoadPoint, mode, pointCount }: any) {
  useMapEvents({
    click(e) {
      if (analysisState !== "idle") return;
      if (mode === "ECO_ROUTE" && pointCount >= 2) return;
      const { lat, lng } = e.latlng;
      if (lat < 6.5 || lat > 37.5 || lng < 68.0 || lng > 97.5) return;
      onAddRoadPoint({ lat, lng });
    }
  });
  return null;
}

function SizeInvalidator() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); ro.disconnect(); };
  }, [map]);
  return null;
}

export default function LeafletMap({
  mode, roadPoints, onAddRoadPoint, analysisState,
  alternatives, ecoRoute, ecoPositions, selectedAltId
}: LeafletMapProps) {

  const startIcon = useMemo(() => L.divIcon({
    html: '<div style="background:#16a34a;width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
    className: '', iconSize: [18, 18], iconAnchor: [9, 18]
  }), []);

  const endIcon = useMemo(() => L.divIcon({
    html: '<div style="background:#dc2626;width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
    className: '', iconSize: [18, 18], iconAnchor: [9, 18]
  }), []);

  // Build eco-route positions from positions array or GeoJSON fallback
  const ecoCoords: [number, number][] = (() => {
    if (ecoPositions && ecoPositions.length >= 2) return ecoPositions;
    const geoCoords = ecoRoute?.geometry?.coordinates;
    if (geoCoords && geoCoords.length >= 2) return geoCoords.map((c: number[]) => [c[1], c[0]] as [number, number]);
    return [];
  })();

  return (
    // outer: position:relative so absolute child fills it
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 0, flex: 1 }}>
      {/* inner: position:absolute inset:0 — guarantees exact pixel fill */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <MapContainer
          key={mode}
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          maxBounds={INDIA_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <SizeInvalidator />
          <MapClickEvents analysisState={analysisState} onAddRoadPoint={onAddRoadPoint} mode={mode} pointCount={roadPoints.length} />

          {/* Markers */}
          {roadPoints.map((pt, i) => {
            const iconProp = mode === "ECO_ROUTE" ? { icon: i === 0 ? startIcon : endIcon } : {};
            return (
              <Marker key={i} position={[pt.lat, pt.lng]} {...iconProp}>
                <LeafletTooltip direction="top" offset={[0, -20]} opacity={1}>
                  {mode === "ECO_ROUTE" ? (i === 0 ? "🟢 START" : "🔴 DESTINATION") : `Waypoint ${i + 1}`}
                </LeafletTooltip>
              </Marker>
            );
          })}

          {/* Planning: drawn road */}
          {mode === "PLANNING" && roadPoints.length > 1 && (
            <Polyline
              positions={roadPoints.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: selectedAltId ? "#94a3b8" : (analysisState === "complete" ? "#f43f5e" : "#3b82f6"),
                weight: analysisState === "complete" ? 6 : 4,
                opacity: selectedAltId ? 0.4 : 1
              }}
            />
          )}

          {/* Planning: alternatives */}
          {mode === "PLANNING" && analysisState === "complete" && alternatives?.map((alt: any) => (
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

          {/* Planning: impact buffer */}
          {mode === "PLANNING" && analysisState === "complete" && roadPoints.length > 1 && (
            <Polyline positions={roadPoints.map(p => [p.lat, p.lng])} pathOptions={{ color: "#f59e0b", weight: 25, opacity: 0.3 }} />
          )}

          {/* Eco-Route: AI predicted path */}
          {mode === "ECO_ROUTE" && analysisState === "complete" && ecoCoords.length >= 2 && (
            <>
              <Polyline positions={ecoCoords} pathOptions={{ color: "#93c5fd", weight: 20, opacity: 0.15 }} />
              <Polyline positions={ecoCoords} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.95, lineCap: "round", lineJoin: "round" }} />
              <Polyline positions={ecoCoords} pathOptions={{ color: "#e0f2fe", weight: 2, opacity: 0.8 }} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
