"use client";

import { useState } from "react";
import { Navigation, MapPin, Send } from "lucide-react";

export function PostingPanel({ officerId, onPosted }: { officerId: string, onPosted: () => void }) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!lat || !lng) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/officer/posting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          officer_id: officerId,
          name: "OFFICER-09", // Hardcoded for demo, or passed in
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        alert("Duty post established. Nearest alerts will now be routed to you.");
        onPosted();
      }
    } catch (err) {
      console.error("Posting error:", err);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude.toFixed(4));
      setLng(pos.coords.longitude.toFixed(4));
    });
  };

  return (
    <div className="absolute top-20 left-6 z-[1000] bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-[2.5rem] w-64 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Navigation size={16} className="text-white" />
        </div>
        <h3 className="text-white text-[10px] font-black uppercase tracking-widest leading-none">Establishing Duty Post</h3>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <MapPin size={10} className="absolute left-3 top-3.5 text-white/30" />
          <input 
            type="number" step="0.0001" placeholder="Posting Latitude" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-8 py-3 text-[10px] font-bold text-white focus:outline-none focus:border-blue-500 transition-all"
            value={lat} onChange={(e) => setLat(e.target.value)}
          />
        </div>
        <div className="relative">
          <MapPin size={10} className="absolute left-3 top-3.5 text-white/30" />
          <input 
            type="number" step="0.0001" placeholder="Posting Longitude" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-8 py-3 text-[10px] font-bold text-white focus:outline-none focus:border-blue-500 transition-all"
            value={lng} onChange={(e) => setLng(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={useCurrentLocation}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-[8px] font-black text-white/60 uppercase transition-all"
          >
            GPS
          </button>
          <button 
            onClick={handlePost} disabled={loading}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 rounded-xl py-3 text-[8px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? "Establishing..." : <><Send size={10} /> Set Post</>}
          </button>
        </div>
      </div>
    </div>
  );
}
