"use client";

import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";

// Mock Heatmap Data (High risk points)
const HEAT_POINTS = [
  { lat: 12.9716, lng: 77.5946, intensity: 0.8 },
  { lat: 12.95, lng: 77.6, intensity: 0.6 },
  { lat: 13.0, lng: 77.55, intensity: 0.9 },
  { lat: 12.89, lng: 77.65, intensity: 0.7 },
];

const INCIDENT_POINTS = [
  { lat: 12.98, lng: 77.62, type: "Elephant Sighting", severity: "High" },
  { lat: 12.93, lng: 77.58, type: "Illegal Entry", severity: "Low" }
];

// Custon Icon since default Leaflet markers often break in Next.js
const incidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function OfficerMap() {
  return (
    <MapContainer 
      center={[12.9716, 77.5946]} 
      zoom={11} 
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Movement Prediction Heatmap (Simulated with Circles) */}
      {HEAT_POINTS.map((point, idx) => (
        <Circle 
          key={idx}
          center={[point.lat, point.lng]}
          radius={1200}
          pathOptions={{
            fillColor: "#10b981",
            color: "transparent",
            fillOpacity: point.intensity * 0.4,
          }}
        />
      ))}

      {/* Real-time Incidents */}
      {INCIDENT_POINTS.map((incident, idx) => (
        <Marker key={idx} position={[incident.lat, incident.lng]} icon={incidentIcon}>
          <Popup className="custom-popup">
            <div className="p-1">
              <h3 className="font-bold text-slate-800">{incident.type}</h3>
              <p className="text-xs text-rose-500 font-bold uppercase mt-1">Severity: {incident.severity}</p>
              <button className="mt-2 w-full bg-[#1a2f23] text-white text-[10px] font-bold py-1.5 rounded-md uppercase tracking-wider">
                Send Unit
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}
