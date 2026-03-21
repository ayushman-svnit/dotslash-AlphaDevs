"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, Zap, TrendingUp, ShieldCheck, Clock, Flame } from "lucide-react";

interface FirePoint {
  lat: number;
  lon: number;
  frp: number;
  date: string;
  time: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  confidence: string;
}

export function OfficerLeftPanel() {
  const [movement, setMovement] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [fires, setFires] = useState<FirePoint[]>([]);
  const [loading, setLoading] = useState(true);

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
        const [moveRes, alertRes, reportRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/officer/movement-prediction").catch(() => null),
          fetch("http://localhost:8000/api/v1/officer/roadkill-alerts").catch(() => null),
          fetch("http://localhost:8000/api/v1/officer/citizen-reports").catch(() => null),
        ]);
        if (moveRes?.ok) setMovement(await moveRes.json());
        if (alertRes?.ok) setAlerts(await alertRes.json());
        if (reportRes?.ok) setReports(await reportRes.json());
      } catch (err) {
        console.error("Failed to fetch officer services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchFires();

    // Refresh fires every 5 minutes
    const interval = setInterval(fetchFires, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="w-[420px] bg-[#f5f2e9] border-r-2 border-green-900/10 overflow-y-auto flex flex-col font-sans dashboard-scrollbar z-40 shadow-2xl">

      {/* 🔥 Forest Fire Alerts — NASA FIRMS */}
      <div className="p-8 border-b border-green-900/5 bg-red-50/60">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700 mb-4 flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Flame className="w-3.5 h-3.5" />
          </div>
          Live Forest Fires · NASA FIRMS
          <span className="ml-auto flex items-center gap-1 text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
            LIVE
          </span>
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Critical', count: criticalFires.length, color: 'bg-red-600 text-white' },
            { label: 'High', count: highFires.length, color: 'bg-orange-500 text-white' },
            { label: 'Total', count: fires.length, color: 'bg-slate-700 text-white' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`${color} rounded-2xl p-3 text-center shadow`}>
              <div className="text-xl font-black">{count}</div>
              <div className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {fires.slice(0, 10).map((fire, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <div>
                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                      {fire.lat.toFixed(3)}°N, {fire.lon.toFixed(3)}°E
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {fire.date} · {fire.time}
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${severityColor(fire.severity)}`}>
                  {fire.severity}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase">Fire Power</span>
                <span className="text-xs font-black text-orange-600">{fire.frp.toFixed(1)} MW</span>
              </div>
            </div>
          ))}
          {fires.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-6 font-medium">No active fire hotspots detected</div>
          )}
        </div>
      </div>

      {/* Wildlife Movement Intelligence */}
      {movement && (
        <div className="p-8 border-b border-green-900/5 bg-white/40">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#166534] mb-6 flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#4ade80] flex items-center justify-center text-green-900"><TrendingUp className="w-3.5 h-3.5" /></div>
            Predictive Tracking
          </h2>
          <div className="bg-white rounded-3xl p-6 border-2 border-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Migration Prob.</span>
              <span className="text-lg font-black text-[#166534]">{(movement.migration_probability * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-[#4ade80] rounded-full transition-all duration-1000"
                style={{ width: `${movement.migration_probability * 100}%` }} />
            </div>
            <div className="bg-[#166534]/5 p-4 rounded-2xl border border-[#166534]/10 italic">
              <p className="text-xs text-[#166534] font-bold leading-relaxed">"{movement.description}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Roadkill Alerts */}
      {alerts.length > 0 && (
        <div className="p-8 border-b border-green-900/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#166534] mb-6 flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center text-white"><AlertTriangle className="w-3.5 h-3.5" /></div>
            Critical Alerts
          </h2>
          <div className="space-y-4">
            {alerts.map((alert: any) => (
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
        <div className="p-8 flex-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#166534] mb-6 flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center text-white"><MapPin className="w-3.5 h-3.5" /></div>
            Live Sightings
          </h2>
          <div className="space-y-5">
            {reports.map((report: any) => (
              <div key={report.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#166534] text-[#4ade80] flex items-center justify-center font-black text-sm uppercase">
                      {report.species.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{report.species}</div>
                      <div className="text-[9px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                        <Clock className="w-2.5 h-2.5" /> {report.time_ago}
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

      <div className="p-8 bg-white/60 mt-auto border-t border-green-900/5">
        <button className="w-full py-5 bg-[#166534] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-green-900 transition-all shadow-[0_15px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3">
          <Zap className="w-4 h-4 text-[#4ade80] animate-pulse" /> Finalize Patrol Area
        </button>
      </div>
    </div>
  );
}
