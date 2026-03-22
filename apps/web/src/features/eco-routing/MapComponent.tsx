'use client';

import React, { useState, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AlertTriangle, PawPrint, Navigation } from 'lucide-react';
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
  const [dangerData, setDangerData] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [proximityAlert, setProximityAlert] = useState<string | null>(null);
  const [lastSmsZone, setLastSmsZone] = useState<string | null>(null);
  
  // Real-time alerts
  const { activeAlerts } = useAlertWebSocket('user-123'); 

  // Haversine Distance Formula (Meters)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Continuously Track User Location (Updates every 60s)
  useEffect(() => {
    let isFirstMount = true;

    const fetchLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          
          setUserLocation(prev => {
            if (prev) {
                const distance = getDistance(prev.lat, prev.lng, latitude, longitude);
                if (distance < 50 && !isFirstMount) return prev; // Don't update for micro-movements
            }
            return { lat: latitude, lng: longitude };
          });

          // Only force the camera to pan on the very first GPS lock
          if (isFirstMount) {
            mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 11, duration: 2500 });
            isFirstMount = false;
          }
        }, (err) => console.log("Geolocation error:", err.message));
      }
    };

    // Check immediately, then check every 1 minute
    fetchLocation();
    const interval = setInterval(fetchLocation, 60000);

    return () => clearInterval(interval);
  }, []);

  // Proximity Detection Logic (500m of RED zones) + SMS Dispatch
  useEffect(() => {
    if (!userLocation || !dangerData) return;

    // Red zones = Critically Endangered (CR)
    const redZones = dangerData.features.filter((f: any) => f.properties.category === 'CR');
    
    let activeZoneId: string | null = null;
    for (const zone of redZones) {
      const [lng, lat] = zone.geometry.coordinates;
      const dist = getDistance(userLocation.lat, userLocation.lng, lat, lng);
      if (dist <= 500) {
        activeZoneId = `${lat},${lng}`;
        break;
      }
    }

    if (activeZoneId) {
      setProximityAlert("🚨 RED ZONE ALERT: You are within 500m of a Critically Endangered habitat. SMS Sent!");
      
      if (lastSmsZone !== activeZoneId) {
        const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";
        fetch(`${apiBase}/ws/alerts/proximity-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'user-123',
            lat: userLocation.lat,
            lng: userLocation.lng,
            zone_type: 'Critically Endangered'
          })
        }).catch(err => console.error("Failed to send proximity SMS:", err));
        
        setLastSmsZone(activeZoneId);
      }
    } else {
      setProximityAlert(null);
      setLastSmsZone(null);
    }
  }, [userLocation, dangerData]);

  // Load Danger Zones from our Precomputed Script
  useEffect(() => {
    fetch('/danger_bands.json')
      .then(res => res.json())
      .then(data => {
        const geojson = {
          type: 'FeatureCollection',
          features: data.map((point: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.lng, point.lat]
            },
            properties: {
              color: point.color,
              category: point.category,
              level: point.level || 1
            }
          }))
        };
        setDangerData(geojson);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 outline-none">
      
      {/* Legend & Info Panel */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <div className="bg-white/95 backdrop-blur p-5 rounded-2xl shadow-xl border border-slate-200 w-72">
          <h3 className="font-black text-base flex items-center gap-2 mb-1 text-slate-800 uppercase tracking-tighter">
            <AlertTriangle className="text-emerald-600 w-5 h-5" />
            Wildlife Hotspots
          </h3>
          <p className="text-[10px] text-slate-500 font-bold mb-4 uppercase tracking-widest">IUCN Status Legend</p>
          <div className="space-y-2.5 text-sm font-bold text-slate-700">
            <div className="flex items-center gap-3"><span className="w-3.5 h-3.5 rounded-full bg-[#ff0000] shrink-0"></span> CR — Critically Endangered</div>
            <div className="flex items-center gap-3"><span className="w-3.5 h-3.5 rounded-full bg-[#ffa500] shrink-0"></span> EN — Endangered</div>
            <div className="flex items-center gap-3"><span className="w-3.5 h-3.5 rounded-full bg-[#ffff00] shrink-0"></span> VU — Vulnerable</div>
            <div className="flex items-center gap-3"><span className="w-3.5 h-3.5 rounded-full bg-[#9acd32] shrink-0"></span> NT — Near Threatened</div>
            <div className="flex items-center gap-3"><span className="w-3.5 h-3.5 rounded-full bg-[#00ff00] shrink-0"></span> LC — Least Concern</div>
            <div className="flex items-center gap-3"><span className="w-3.5 h-3.5 rounded-full bg-[#006400] shrink-0"></span> DD — Data Deficient</div>
          </div>
        </div>

        {/* PROXIMITY NOTIFICATION */}
        {proximityAlert && (
          <div className="bg-red-600 text-white p-4 rounded-xl shadow-2xl border-4 border-white animate-pulse w-80">
             <div className="flex items-center gap-3">
               <AlertTriangle size={24} className="shrink-0" />
               <p className="text-xs font-black leading-tight">{proximityAlert}</p>
             </div>
          </div>
        )}

      </div>

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 78.9629, 
          latitude: 20.5937,
          zoom: 4.5
        }}
        mapStyle={GOOGLE_STYLE}
      >
        <NavigationControl position="bottom-right" />

        {dangerData && (
          <Source id="danger-zones" type="geojson" data={dangerData}>
            <Layer 
              id="danger-dots" 
              type="circle" 
              paint={{
                'circle-color': ['get', 'color'],
                'circle-radius': [
                  'interpolate', ['linear'], ['zoom'],
                  4, 4,
                  10, 8,
                  15, 14
                ],
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.8
              }}
            />
          </Source>
        )}

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

        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} style={{ zIndex: 50 }}>
            <div className="relative flex items-center justify-center cursor-help" title="Your Live GPS Location">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-60" />
              <div className="relative bg-blue-600 p-2 rounded-full border-2 border-white shadow-xl">
                <Navigation size={18} className="text-white" />
              </div>
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};
