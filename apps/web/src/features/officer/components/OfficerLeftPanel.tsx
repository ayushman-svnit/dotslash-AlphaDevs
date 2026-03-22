"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, Zap, TrendingUp, ShieldCheck, Clock, Flame, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface FirePoint {
  lat: number;
  lon: number;
  frp: number;
  date: string;
  time: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  confidence: string;
}

interface Props {
  centerLat?: number;
  centerLng?: number;
}

const calculateDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export function OfficerLeftPanel({ centerLat, centerLng }: Props) {
  const [activeUnits, setActiveUnits] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [fires, setFires] = useState<FirePoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  const { getToken } = useAuth();

  const fetchFires = async () => {
    try {
      const res = await fetch("/api/officer/forest-fires");
      const data = await res.json();
      setFires(data.fires || []);
    } catch (err) {
      console.error("Failed to fetch fire data:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";
        const [unitsRes, reportRes, alertRes] = await Promise.all([
          fetch(`${apiBase}/api/v1/officer/active-units`, { headers }).catch(() => null),
          fetch(`${apiBase}/api/v1/officer/citizen-reports`, { headers }).catch(() => null),
          fetch(`${apiBase}/api/v1/officer/roadkill-alerts`, { headers }).catch(() => null),
        ]);
        
        if (unitsRes?.ok) {
           let units = await unitsRes.json();
           if (centerLat && centerLng) {
             units = units.map((u: any) => ({
               ...u,
               distance: calculateDist(centerLat, centerLng, u.lat, u.lng)
             })).filter((u: any) => u.distance < 200); 
           }
           setActiveUnits(units);
        }
        
        if (alertRes?.ok) {
           const data = await alertRes.json();
           setAlerts(Array.isArray(data) ? data : []);
        }
        if (reportRes?.ok) {
           const data = await reportRes.json();
           setReports(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch officer services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchFires();
    const interval = setInterval(() => {
        fetchData();
        fetchFires();
    }, 30000);
    return () => clearInterval(interval);
  }, [centerLat, centerLng]);

  const handleFinalize = async () => {
    setIsFinalizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const tacticalSummary = {
        fires: fires.length,
        reports: reports.length,
        near_units: activeUnits.length,
        timestamp: new Date().toISOString()
    };
    console.log("📡 Patrol Area Finalized:", tacticalSummary);
    setIsFinalizing(false);
    setIsFinalized(true);
    setTimeout(() => setIsFinalized(false), 5000);
  };

  const severityColor = (s: string) =>
    s === 'CRITICAL' ? 'bg-red-600 text-white' : s === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-yellow-900';

  const criticalFires = fires.filter(f => f.severity === 'CRITICAL');
  const highFires = fires.filter(f => f.severity === 'HIGH');

  if (loading) return (
    <div className="w-[420px] bg-[#f5f2e9] p-12 flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#166534]/10 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="text-[10px] font-black text-[#166534] uppercase tracking-[0.3em]">Field Intel Sync...</span>
    </div>
  );

  return (
    <div className="w-[420px] h-full bg-[#f5f2e9] border-r-2 border-green-900/10 flex flex-col relative font-sans shadow-2xl z-40 overflow-hidden">
      
      {/* Scrollable Content Wrapper */}
      <div className="flex-1 overflow-y-auto dashboard-scrollbar relative">
        <div className="pb-32"> {/* Buffer for the floating button */}
          
          {/* 🔥 Forest Fire Alerts — NASA FIRMS */}
          <div className="p-8 border-b border-green-900/5 bg-red-50/60">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700 mb-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Flame className="w-3.5 h-3.5" />
              </div>
              Live Forest Fires · NASA FIRMS
            </h2>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Critical', count: criticalFires.length, color: 'bg-red-600 text-white' },
                { label: 'High', count: highFires.length, color: 'bg-orange-500 text-white' },
                { label: 'Active', count: fires.length, color: 'bg-slate-700 text-white' },
              ].map(({ label, count, color }) => (
                <div key={label} className={`${color} rounded-2xl p-3 text-center shadow`}>
                  <div className="text-xl font-black">{count}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 dashboard-scrollbar">
              {fires.slice(0, 5).map((fire, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="text-lg">🔥</span>
                       <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                          {fire.lat.toFixed(2)}, {fire.lon.toFixed(2)}
                       </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${severityColor(fire.severity)}`}>
                      {fire.severity}
                    </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Force Strength */}
          <div className="p-8 border-b border-green-900/5 bg-white/40">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#166534] mb-6 flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#166534] flex items-center justify-center text-[#4ade80]"><ShieldCheck className="w-3.5 h-3.5" /></div>
              Tactical Force Strength
            </h2>
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <ShieldCheck size={80} />
               </div>
               <div className="flex items-end gap-3 mb-6">
                  <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none text-highlight">{activeUnits.length}</span>
                  <div className="flex flex-col mb-1">
                     <span className="text-[10px] font-black text-[#166534] uppercase tracking-widest">Active Units</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">On Duty in Sector</span>
                  </div>
               </div>
               
               <div className="space-y-3">
                  {activeUnits.slice(0, 3).map((unit, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-black">
                          {unit.name?.charAt(0) || "R"}
                       </div>
                       <div className="flex-1">
                          <div className="text-[10px] font-black text-slate-800 uppercase leading-none mb-0.5">{unit.name || "Field Ranger"}</div>
                          <div className="text-[9px] font-bold text-slate-400">
                             {unit.distance ? `${unit.distance.toFixed(1)} km away` : `POS: ${unit.lat.toFixed(2)}, ${unit.lng.toFixed(2)}`}
                          </div>
                       </div>
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  ))}
                  {activeUnits.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-bold italic">Detecting active transponders (200km radius)...</p>
                  )}
               </div>
            </div>
          </div>

          {/* Roadkill Alerts */}
          {alerts.length > 0 && (
            <div className="p-8 border-b border-green-900/5">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#166534] mb-6 flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center text-white"><AlertTriangle className="w-3.5 h-3.5" /></div>
                Critical Alerts
              </h2>
              <div className="space-y-4">
                {alerts.slice(0, 3).map((alert: any) => (
                  <div key={alert.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-rose-200 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{alert.road_name}</h4>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${alert.risk_level === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                        {alert.risk_level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-3 leading-tight uppercase opacity-80 italic">{alert.recommendation}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Detection Prob.</span>
                      <span className="text-xs font-black text-rose-600">{(alert.probability * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Sightings */}
          {reports.length > 0 && (
            <div className="p-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#166534] mb-6 flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center text-white"><MapPin className="w-3.5 h-3.5" /></div>
                Live Monitoring
              </h2>
              <div className="space-y-5">
                {reports.slice(0, 5).map((report: any) => (
                  <div key={report.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-cyan-100 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#166534] text-[#4ade80] flex items-center justify-center font-black text-sm uppercase">
                          {report.species.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{report.species}</div>
                          <div className="text-[9px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest leading-none">
                            <Clock className="w-2.5 h-2.5" /> {report.time_ago || "Just now"}
                          </div>
                        </div>
                      </div>
                      {report.verified && (
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#166534]" /> {report.lat.toFixed(2)}, {report.lng.toFixed(2)}
                      </div>
                      <button className="text-[10px] font-black text-[#166534] bg-[#4ade80] px-4 py-2 rounded-full uppercase tracking-widest hover:bg-green-300 transition-colors shadow-lg">
                        Intercept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Finalize Button — Sticky Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#f5f2e9] via-[#f5f2e9]/95 to-transparent pt-12 z-50 pointer-events-none">
        <button 
          onClick={handleFinalize}
          disabled={isFinalizing || isFinalized}
          className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(22,101,52,0.3)] pointer-events-auto
            ${isFinalized ? 'bg-emerald-600 text-white scale-95 shadow-none' : 'bg-[#166534] text-white hover:bg-green-900 hover:-translate-y-1'}
            ${isFinalizing ? 'opacity-80 cursor-wait' : ''}`}
        >
          {isFinalizing ? (
            <>
               <Loader2 className="w-4 h-4 animate-spin" />
               Synchronizing Intel...
            </>
          ) : isFinalized ? (
            <>
               <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
               Patrol Synchronized
            </>
          ) : (
            <>
               <Zap className="w-4 h-4 text-[#4ade80] animate-pulse" />
               Finalize Patrol Area
            </>
          )}
        </button>
      </div>
    </div>
  );
}
