"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, Zap, TrendingUp, ShieldCheck, Clock } from "lucide-react";

export function OfficerLeftPanel() {
  const [movement, setMovement] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moveRes, alertRes, reportRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/officer/movement-prediction"),
          fetch("http://localhost:8000/api/v1/officer/roadkill-alerts"),
          fetch("http://localhost:8000/api/v1/officer/citizen-reports")
        ]);
        
        setMovement(await moveRes.json());
        setAlerts(await alertRes.json());
        setReports(await reportRes.json());
      } catch (err) {
        console.error("Failed to fetch officer services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="w-[380px] bg-[#fdfefd] p-10 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Hydrating Field Intel...</span>
    </div>
  );

  return (
    <div className="w-[380px] bg-[#fdfefd] border-r border-emerald-100 overflow-y-auto flex flex-col font-sans">
      
      {/* Service 1: Wildlife Movement Intelligence */}
      <div className="p-6 border-b border-emerald-50 bg-emerald-50/20">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60 mb-5 flex items-center">
          <TrendingUp className="w-3 h-3 mr-2" /> Movement Intelligence
        </h2>
        
        {movement && (
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-500 uppercase">Migration Probability</span>
              <span className="text-sm font-black text-emerald-600">{(movement.migration_probability * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                style={{ width: `${movement.migration_probability * 100}%` }} 
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              "{movement.description}"
            </p>
          </div>
        )}
      </div>

      {/* Service 2: Roadkill Prevention Center */}
      <div className="p-6 border-b border-emerald-50">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-800/60 mb-5 flex items-center">
          <AlertTriangle className="w-3 h-3 mr-2 text-rose-500" /> Roadkill Prevention
        </h2>
        
        <div className="space-y-4">
          {alerts.map((alert: any) => (
            <div key={alert.id} className="relative pl-4 border-l-2 border-rose-200">
               <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{alert.road_name}</h4>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    alert.risk_level === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>{alert.risk_level}</span>
               </div>
               <p className="text-[10px] text-slate-500 mb-2">{alert.recommendation}</p>
               <div className="text-[10px] text-rose-600 font-bold">Risk Probability: {(alert.probability * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Service 3: Citizen Response Center */}
      <div className="p-6 flex-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800/60 mb-5 flex items-center">
          <MapPin className="w-3 h-3 mr-2 text-cyan-500" /> Citizen Sightings Feed
        </h2>
        
        <div className="space-y-4">
          {reports.map((report: any) => (
            <div key={report.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group">
               <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-xs uppercase">
                        {report.species.charAt(0)}
                     </div>
                     <div>
                        <div className="text-xs font-black text-slate-800">{report.species} Spotted</div>
                        <div className="text-[9px] text-slate-400 flex items-center"><Clock className="w-2 h-2 mr-1" /> {report.time_ago}</div>
                     </div>
                  </div>
                  {report.verified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  )}
               </div>
               
               {report.image_url && (
                 <div className="w-full h-24 rounded-lg overflow-hidden mb-3 grayscale group-hover:grayscale-0 transition-all border border-slate-100">
                    <img src={report.image_url} alt="sighting" className="w-full h-full object-cover" />
                 </div>
               )}

               <div className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center">
                     <MapPin className="w-2 h-2 mr-1 text-slate-400" /> Lat {report.lat.toFixed(2)}, Lng {report.lng.toFixed(2)}
                  </div>
                  <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Intercept</button>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-50 mt-auto border-t border-slate-100">
         <button className="w-full py-4 bg-[#1a2f23] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center">
            <Zap className="w-3 h-3 mr-2 text-emerald-400 animate-pulse" /> Finalize Area Patrol
         </button>
      </div>
    </div>
  );
}
