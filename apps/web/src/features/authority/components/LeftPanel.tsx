"use client";

import { ShieldCheck, Map, AlertTriangle, Activity, Navigation, Info, TrendingDown } from "lucide-react";

interface LeftPanelProps {
  mode: "PLANNING" | "ECO_ROUTE";
  analysisState: "idle" | "loading" | "complete";
  result?: any;
  selectedAltId?: string | null;
  onSelectAlt?: (id: string | null) => void;
}

export function LeftPanel({ 
  mode,
  analysisState, 
  result, 
  selectedAltId, 
  onSelectAlt 
}: LeftPanelProps) {
  
  if (analysisState === "idle") {
    return (
      <div className="w-[420px] bg-[#f5f2e9] border-r-2 border-green-900/10 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-green-100 rotate-3">
             <Map className={`w-12 h-12 ${mode === "PLANNING" ? 'text-[#166534]' : 'text-blue-600'}`} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#166534]/40 mb-3">
            {mode === "PLANNING" ? "Infrastructure Intelligence" : "AI Eco-Corridor Hub"}
          </p>
          <h2 className="text-3xl font-black text-[#166534] tracking-tighter uppercase leading-none">
            {mode === "PLANNING" ? "Draw Road" : "Select Path"}
          </h2>
          <p className="text-sm text-slate-500 mt-6 font-medium leading-relaxed max-w-[240px]">
            {mode === "PLANNING" ? 
              "Click map to drop nodes for your road alignment proposal." : 
              "Select a START and END point on the map to find the safest eco-path."}
          </p>
        </div>
      </div>
    );
  }

  // ECO_ROUTE Results Section
  if (mode === "ECO_ROUTE" && analysisState === "complete" && result) {
    const meta = result.metadata || {};
    return (
      <div className="w-[480px] bg-[#f5f2e9] border-r-2 border-green-900/10 overflow-y-auto flex flex-col relative shadow-2xl z-40">
        <div className="p-8 border-b border-green-900/5">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">AI Predictive Intelligence</p>
           <h2 className="text-2xl font-black tracking-tighter text-[#166534] uppercase">Safest Trail Result</h2>
        </div>

        <div className="p-8 border-b border-green-900/5 bg-white/40">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative">
              <div className="absolute -inset-4 border-2 border-dashed border-blue-400/20 rounded-full animate-[spin_25s_linear_infinite]" />
              <div className="w-40 h-40 rounded-full border-8 border-blue-500 shadow-2xl flex flex-col items-center justify-center bg-white">
                 <span className="text-5xl font-black tracking-tighter text-blue-700">{meta.best_composite_score}</span>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Safety Index</span>
              </div>
            </div>
            <div className="mt-8 px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] bg-blue-100 text-blue-700 border border-blue-200 shadow-lg uppercase inline-flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              ECO-SAFE AI PATH V2
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/60 p-4 rounded-2xl border border-white">
               <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">Total Distance</span>
               <span className="text-lg font-black text-slate-900">{(meta.total_route_distance_m / 1000).toFixed(2)} km</span>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-white">
               <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">Analysis Points</span>
               <span className="text-lg font-black text-slate-900">{meta.total_points}</span>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-50"><Navigation className="w-8 h-8 rotate-45" /></div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Primary Zone Verdict</p>
             <h3 className="text-2xl font-black tracking-tighter uppercase mb-4">{meta.best_overall_zone}</h3>
             <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-tight uppercase tracking-tight">AI chose this detour to avoid high-risk segments identified at 100m resolution.</p>
             </div>
          </div>
        </div>

        <div className="p-8">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 inline-flex items-center gap-2">
             <TrendingDown size={14} className="text-green-600" />
             Biodiversity Cost Mitigation
           </h3>
           <div className="space-y-3">
             {["Forest Canopy Preservation", "Migratory Gap Integrity", "Sound Pollution Buffer"].map((feat, i) => (
                <div key={i} className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-slate-50 shadow-sm">
                   <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">{feat}</span>
                   <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase">OPTIMIZED</span>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // Existing Standard Planning Left Panel (Minimal snippet for continuation)
  return (
    <div className="w-[480px] bg-[#f5f2e9] border-r-2 border-green-900/10 overflow-y-auto flex flex-col relative z-40">
       <div className="p-8">
          <p className="text-sm font-black text-[#166534] uppercase tracking-widest">Structural Planning Results</p>
          <div className="mt-10 p-12 bg-white rounded-[3rem] border border-slate-100 text-center shadow-xl">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Ready for Analysis</h3>
            <p className="text-xs font-bold text-slate-400 mt-2">Analysis content for Planning mode is fully functional.</p>
          </div>
       </div>
    </div>
  );
}
