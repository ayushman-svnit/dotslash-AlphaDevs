"use client";

import { AlertTriangle, MapPin, Eye, Zap, Waves, TrendingUp } from "lucide-react";

const mockIncidents = [
  { id: 1, type: "Elephant Sighting", location: "Kolar Road - Seg 4", time: "5m ago", severity: "medium" },
  { id: 2, type: "Injured Leopard", location: "North Buffer Zone", time: "12m ago", severity: "high" },
  { id: 3, type: "Illegal Entry", location: "Gate 42", time: "45m ago", severity: "low" },
];

export function OfficerLeftPanel() {
  return (
    <div className="w-[380px] bg-[#fdfefd] border-r border-emerald-100 overflow-y-auto flex flex-col">
      {/* Real-time Alerts */}
      <div className="p-5 border-b border-emerald-50 bg-[#f7f9f7]">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60 mb-4 flex items-center">
          <Zap className="w-3 h-3 mr-2" /> Live Patrol Alerts
        </h2>
        
        <div className="space-y-3">
          {mockIncidents.map((incident) => (
            <div 
              key={incident.id} 
              className={`p-3 rounded-xl border ${
                incident.severity === 'high' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100 shadow-sm'
              } transition-all hover:translate-x-1 cursor-pointer`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold ${
                  incident.severity === 'high' ? 'text-rose-700' : 'text-slate-800'
                }`}>{incident.type}</span>
                <span className="text-[10px] text-slate-400 font-medium">{incident.time}</span>
              </div>
              <div className="flex items-center text-[11px] text-slate-500">
                <MapPin className="w-3 h-3 mr-1" /> {incident.location}
              </div>
              {incident.severity === 'high' && (
                <div className="mt-2 flex items-center text-[10px] font-black text-rose-600 bg-rose-100/50 px-2 py-0.5 rounded-full w-fit">
                  ACTION REQUIRED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Intelligence */}
      <div className="p-6 border-b border-emerald-50">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60 mb-4 flex items-center">
          <TrendingUp className="w-3 h-3 mr-2" /> Movement Prediction
        </h2>
        
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-800">Migration Probability</span>
            <span className="text-sm font-black text-emerald-600">High (82%)</span>
          </div>
          <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-emerald-500 rounded-full w-[82%]" />
          </div>
          <p className="text-[11px] text-emerald-700/80 leading-relaxed italic">
            "Night-time animal crossing probability intensified on Section 4 due to nearby water source drying."
          </p>
        </div>
      </div>

      {/* Habitat Indicators */}
      <div className="p-6 border-b border-emerald-50">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60 mb-5 flex items-center">
          <Eye className="w-3 h-3 mr-2" /> Habitat Status
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Water Level</span>
            <div className="flex items-center space-x-2">
              <Waves className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-black text-slate-700">Critical</span>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tree Mortality</span>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-black text-slate-700">+2.4%</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            alert("Regional Risk Pack downloaded to local cache. You are ready for offline field patrol.");
            localStorage.setItem('OFFLINE_PACK_SYNC', Date.now().toString());
          }}
          className="w-full bg-[#1a2f23] text-emerald-400 text-[10px] font-black py-3 rounded-xl border border-emerald-500/30 hover:bg-emerald-900 transition-all flex items-center justify-center tracking-widest uppercase"
        >
          <Zap className="w-3 h-3 mr-2 text-emerald-400" /> Download Offline Pack
        </button>
      </div>
    </div>
  );
}
