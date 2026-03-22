"use client";

import { MapContainer, TileLayer, Circle, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState, useMemo } from "react";
import L from "leaflet";

const incidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Flame SVG icon for fire hotspots
const makeFireIcon = (severity: string) => {
  const color = severity === 'CRITICAL' ? '#ef4444' : severity === 'HIGH' ? '#f97316' : '#fbbf24';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <circle cx="16" cy="16" r="14" fill="${color}" opacity="0.25"/>
    <text x="16" y="22" text-anchor="middle" font-size="18">🔥</text>
  </svg>`;
  return new L.DivIcon({
    html: svg,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface FirePoint {
  lat: number;
  lon: number;
  confidence: string;
  frp: number;
  date: string;
  time: string;
  brightness: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export default function OfficerMap() {
  const [fires, setFires] = useState<FirePoint[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchFires = async () => {
    try {
      const res = await fetch('/api/officer/forest-fires');
      const data = await res.json();
      setFires(data.fires || []);
      if (data.fetchedAt) setLastUpdated(new Date(data.fetchedAt).toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch fire data:', err);
    }
  };

  useEffect(() => {
    fetchFires();
    // Refresh every 5 minutes
    const interval = setInterval(fetchFires, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8001";
    fetch(`${apiBase}/api/v1/officer/citizen-reports`)
      .then(r => r.json())
      .then(d => {
          if (Array.isArray(d)) setIncidents(d);
          else if (d && Array.isArray(d.reports)) setIncidents(d.reports);
          else setIncidents([]);
      })
      .catch(() => setIncidents([]));
  }, []);

  const pulseColor = (severity: string) =>
    severity === 'CRITICAL' ? '#ef4444' : severity === 'HIGH' ? '#f97316' : '#fbbf24';

  return (
    <div className="relative w-full h-full">
      {/* Live badge */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-white/80 text-slate-800 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full backdrop-blur-md border border-white shadow-xl">
        <span className={`w-2.5 h-2.5 rounded-full ${fires.length > 0 ? 'bg-red-500 animate-pulse outline outline-2 outline-offset-2 outline-red-500/20' : 'bg-slate-300'} `} />
        LIVE · NASA FIRMS · {lastUpdated ? `LAST SYNC: ${lastUpdated}` : 'SYNCING...'}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/80 text-slate-800 text-[10px] font-black px-5 py-4 rounded-[2rem] backdrop-blur-md border border-white shadow-2xl space-y-2">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/50">
          <span className="text-sm">🔥</span>
          Live Forest Fires · NASA FIRMS
        </div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm" /> Critical (&gt;100 MW)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow-sm" /> High (30–100 MW)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block shadow-sm" /> Moderate (&lt;30 MW)</div>
        <div className="text-slate-400 mt-2 font-bold uppercase tracking-tighter">Total active: {fires.length} hotspots</div>
      </div>

      <MapContainer
        center={[22.5, 82.5]}
        zoom={5}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Fire hotspots from NASA FIRMS */}
        {fires.map((fire, idx) => (
          <React.Fragment key={`fire-${idx}`}>
            {/* Outer pulse ring */}
            <Circle
              center={[fire.lat, fire.lon]}
              radius={fire.severity === 'CRITICAL' ? 8000 : fire.severity === 'HIGH' ? 5000 : 3000}
              pathOptions={{
                fillColor: pulseColor(fire.severity),
                color: pulseColor(fire.severity),
                fillOpacity: 0.15,
                weight: 1,
              }}
            />
            {/* Core marker */}
            <Marker
              position={[fire.lat, fire.lon]}
              icon={makeFireIcon(fire.severity)}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span>🔥</span>
                    <span className="font-black text-sm uppercase" style={{ color: pulseColor(fire.severity) }}>
                      {fire.severity} FIRE
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-700">
                    <div><b>Location:</b> {fire.lat.toFixed(4)}°N, {fire.lon.toFixed(4)}°E</div>
                    <div><b>Intensity (FRP):</b> {fire.frp.toFixed(1)} MW</div>
                    <div><b>Brightness:</b> {fire.brightness.toFixed(1)} K</div>
                    <div><b>Detected:</b> {fire.date} {fire.time}</div>
                    <div><b>Confidence:</b> {fire.confidence}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Citizen incident markers */}
        {Array.isArray(incidents) && incidents.map((incident: any, idx) => (
          <Marker key={`inc-${idx}`} position={[incident.lat, incident.lng]} icon={incidentIcon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-slate-800">{incident.species} Sighting</h3>
                <p className="text-xs text-rose-500 font-bold uppercase mt-1">
                  Verified: {incident.verified ? 'YES' : 'PENDING'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
