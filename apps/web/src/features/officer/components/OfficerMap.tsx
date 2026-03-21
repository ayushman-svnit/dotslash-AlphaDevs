"use client";

import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

// Custom Icon since default Leaflet markers often break in Next.js
const incidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function OfficerMap() {
  const [heatPoints, setHeatPoints] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [moveRes, reportRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/officer/movement-prediction"),
          fetch("http://localhost:8000/api/v1/officer/citizen-reports")
        ]);
        
        const moveData = await moveRes.json();
        const reportData = await reportRes.json();
        
        setHeatPoints(moveData.heat_points || []);
        setIncidents(reportData || []);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
      }
    };
    fetchMapData();
  }, []);

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

      {/* Service 1: Wildlife Movement Prediction Heatmap */}
      {heatPoints.map((point, idx) => (
        <Circle 
          key={`heat-${idx}`}
          center={[point.lat, point.lng]}
          radius={1200}
          pathOptions={{
            fillColor: "#10b981",
            color: "transparent",
            fillOpacity: point.intensity * 0.4,
          }}
        />
      ))}

      {/* Service 3: Citizen Incident Tracking Markers */}
      {incidents.map((incident, idx) => (
        <Marker key={`inc-${idx}`} position={[incident.lat, incident.lng]} icon={incidentIcon}>
          <Popup className="custom-popup">
            <div className="p-1">
              <h3 className="font-bold text-slate-800">{incident.species} Sighting</h3>
              <p className="text-xs text-rose-500 font-bold uppercase mt-1">
                Verified: {incident.verified ? 'YES' : 'PENDING'}
              </p>
              <button className="mt-2 w-full bg-[#1a2f23] text-white text-[10px] font-bold py-1.5 rounded-md uppercase tracking-wider">
                Send Rescue Unit
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}
