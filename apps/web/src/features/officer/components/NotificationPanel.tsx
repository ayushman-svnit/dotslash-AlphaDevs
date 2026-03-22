"use client";

import { useEffect, useState } from "react";
import { Bell, MapPin, AlertCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  lat: number;
  lng: number;
  severity: "CRITICAL" | "HIGH" | "INFO";
  timestamp: string;
  image_url?: string;
  distance_km?: number;
}

export function NotificationPanel({ officerId }: { officerId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();
  const fetchNotifs = async () => {
    try {
      const token = await getToken();
      const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/v1/officer/notifications?officer_id=${officerId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.status === "success") {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [officerId]);

  if (loading) return <div className="p-8 text-white/50 animate-pulse uppercase tracking-widest text-xs">Syncing alerts...</div>;

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-l border-white/10 w-80">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-black uppercase tracking-tighter flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-500" />
          Tactical Alerts
        </h3>
        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
          {notifications.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center opacity-20">
            <ShieldAlert size={48} className="mb-4 text-white" />
            <p className="text-[10px] font-bold text-white uppercase tracking-widest">No active threats</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-2xl border ${
                notif.severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/50' : 'bg-white/5 border-white/10'
              } group transition-all hover:bg-white/10`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                  notif.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
                }`}>
                  {notif.severity}
                </span>
                <span className="text-[8px] font-bold text-white/40">{new Date(notif.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <h4 className="text-white text-xs font-black uppercase tracking-tight mb-1">{notif.title}</h4>
              <p className="text-[10px] text-white/60 leading-tight mb-3 italic">"{notif.message}"</p>

              {notif.image_url && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/10 h-20 bg-black">
                  <img src={notif.image_url} alt="Alert Evidence" className="w-full h-full object-cover opacity-80" />
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <MapPin size={10} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {notif.distance_km}km from you
                  </span>
                </div>
                <button className="bg-white/10 hover:bg-white text-white hover:text-black py-1 px-3 rounded-lg text-[10px] font-black uppercase transition-all">
                  Intervene
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
