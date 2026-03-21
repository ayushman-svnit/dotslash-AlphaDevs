'use client';

import React, { useState, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getEcoSafeRoute, GeoJSONPath } from '@/services/routing.service';
import { AlertTriangle, MapPin, Navigation, PawPrint, Flag } from 'lucide-react';
import { useAlertWebSocket } from '@/lib/hooks/useAlertWebSocket';

const GOOGLE_STYLE: any = {
  version: 8,
  sources: {
    "google-tiles": {
      type: "raster",
      tiles: [
        "https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        "https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        "https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      ],
      tileSize: 256,
      attribution: "&copy; Google Maps"
    }
  },
  layers: [
    {
      id: "google-tiles",
      type: "raster",
      source: "google-tiles",
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export const MapComponent = () => {
  const mapRef = React.useRef<any>(null);
  const [route, setRoute] = useState<GeoJSONPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [vehicleMode, setVehicleMode] = useState<'car' | 'bike' | 'truck'>('car');
  
  // Dynamic Start/End Coords
  const [start, setStart] = useState({ lat: 26.840, lng: 80.940 });
  const [end, setEnd] = useState({ lat: 26.880, lng: 80.980 });

  // Initial Geolocation of USER
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setStart({ lat: latitude, lng: longitude });
        setEnd({ lat: latitude + 0.01, lng: longitude + 0.01 });
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 13, duration: 2000 });
      }, (err) => console.log("Geolocation blocked:", err.message));
    }
  }, []);

  // Hook into Real-Time Wildlife Alerts + Simulation
  const { activeAlerts, simulateAlert } = useAlertWebSocket('user-123'); 

  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      setRouteError(null);
      
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/routing/eco-safe?source_lat=${start.lat}&source_lng=${start.lng}&target_lat=${end.lat}&target_lng=${end.lng}&vehicle_type=${vehicleMode}`
        );
        const data = await response.json();
        
        if (data.status === 'success') {
          setRoute(data.geojson);
        } else {
          setRoute(null);
          setRouteError(data.message);
        }
      } catch (err) {
        setRouteError("Connection Error (Check Backend)");
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [start.lat, start.lng, end.lat, end.lng, vehicleMode]);

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 outline-none">
      {/* Dynamic Navigation & Simulator Panel */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <div className="bg-white/95 backdrop-blur p-5 rounded-2xl shadow-xl border border-slate-200 w-80">
          <h3 className="font-black text-lg flex items-center gap-2 mb-1 text-slate-800 uppercase tracking-tighter">
            <Navigation className="text-emerald-600" />
            Plan Best Route
          </h3>
          <p className="text-[10px] text-slate-500 font-bold mb-4 uppercase tracking-widest">Forest Navigation Intelligence</p>

          <div className="space-y-4">
            {/* Vehicle Selection */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Vehicle Mode</label>
              <select 
                value={vehicleMode}
                onChange={(e) => setVehicleMode(e.target.value as any)}
                className="w-full p-2 text-sm border rounded-lg bg-emerald-50 text-emerald-800 font-bold outline-none"
              >
                <option value="car">🚗 Car (Eco-Standard)</option>
                <option value="bike">🚲 Bike (High Risk)</option>
                <option value="truck">🚛 Truck (Super Sensitive)</option>
              </select>
            </div>

            <p className="text-[10px] text-slate-500 italic pb-2 border-b">
              *Try DRAGGING the pins on the map to instantly change your journey!
            </p>
          </div>

          <div className="mt-4">
             {loading ? (
              <div className="text-xs text-emerald-600 flex items-center gap-2 animate-pulse font-bold bg-emerald-50 p-2 rounded-lg">
                <AlertTriangle size={14} /> Re-routing for safety...
              </div>
            ) : routeError ? (
              <div className="text-xs text-red-600 flex items-center gap-2 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                <AlertTriangle size={14} /> {routeError}
              </div>
            ) : route ? (
              <div className="text-xs text-emerald-700 font-bold bg-emerald-100/50 px-3 py-2 rounded-lg border border-emerald-200">
                 Journey Path Optimized
              </div>
            ) : null}
          </div>
        </div>

        {/* Simulator Tools */}
        <div className="bg-slate-900/90 backdrop-blur p-4 rounded-xl shadow-2xl border border-slate-700 w-80">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={14} /> Wildlife Simulator
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => simulateAlert('🐘 Elephant')}
              className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] p-2 rounded border border-slate-600 transition"
            >
              🐘 Simulate Elephant
            </button>
            <button 
              onClick={() => simulateAlert('🐆 Leopard')}
              className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] p-2 rounded border border-slate-600 transition"
            >
              🐆 Simulate Leopard
            </button>
          </div>
        </div>
      </div>

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: start.lng,
          latitude: start.lat,
          zoom: 12
        }}
        mapStyle={GOOGLE_STYLE}
      >
        <NavigationControl position="bottom-right" />
        
        {/* INTERACTIVE MARKERS */}
        <Marker 
          latitude={start.lat} 
          longitude={start.lng}
          draggable
          onDragEnd={(e: any) => setStart({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
        >
          <div className="group relative flex flex-col items-center cursor-grab active:cursor-grabbing">
             <div className="absolute -top-8 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow">START</div>
             <div className="bg-blue-600 p-2 rounded-full border-2 border-white shadow-2xl">
               <MapPin size={22} className="text-white" />
             </div>
          </div>
        </Marker>

        <Marker 
          latitude={end.lat} 
          longitude={end.lng}
          draggable
          onDragEnd={(e: any) => setEnd({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
        >
          <div className="group relative flex flex-col items-center cursor-grab active:cursor-grabbing">
             <div className="absolute -top-8 bg-red-600 text-white px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow">DESTINATION</div>
             <div className="bg-red-600 p-2 rounded-full border-2 border-white shadow-2xl">
               <Flag size={22} className="text-white" />
             </div>
          </div>
        </Marker>

        {/* Real-time & Simulated Wildlife Markers */}
        {activeAlerts.map((alert, idx) => (
          <Marker key={idx} latitude={alert.lat} longitude={alert.lng}>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
              <div className="relative bg-red-600 p-2.5 rounded-full border-2 border-white shadow-2xl">
                <PawPrint size={24} className="text-white" />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap border border-slate-700">
                  {alert.species_id.toUpperCase()}
                </div>
              </div>
            </div>
          </Marker>
        ))}

        {route && (
          <Source id="route-source" type="geojson" data={route}>
            {/* Outer Glow / Shadow Layer */}
            <Layer
              id="route-layer-glow"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#064e3b', 
                'line-width': 16,
                'line-opacity': 0.4,
                'line-blur': 4
              }}
            />
            {/* Main Neon Path Layer */}
            <Layer
              id="route-layer-main"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': vehicleMode === 'truck' ? '#059669' : '#34d399', 
                'line-width': 8,
                'line-opacity': 1.0
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};
